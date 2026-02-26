"""
ImageAnalyzer — AI/Deepfake Image Detection via Classical Signal Analysis.

Combines four independent detectors into a single AI-generation probability score.
Calibrated to avoid false positives on authentic photos (real cameras/phones).

Why no neural network?
  - Proper deepfake detectors require large model files
  - Classical methods are fast, deterministic, and explainable
  - Correctly calibrated, these four signals can reliably distinguish AI from authentic

Critical calibration notes
--------------------------
PNG images: ELA re-compresses to JPEG internally, so PNG photos ALWAYS  have higher
residuals than JPEG photos. This must be compensated per format.

Real photos (phones/DSLRs) have:
  - ELA mean ~15-40 (not 0; all real photos have some re-compression diff)
  - Noise kurtosis 3-20+ due to scene content (NOT 3.0 perfectly)
  - DCT HF ratio varies hugely with scene (textured scenes have lots of HF energy)
  - Block artifacts: real photos above 1.0 ratio usually

The system must be conservative and require MULTIPLE signals to agree.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from io import BytesIO
from typing import Any, Dict, Optional, Tuple

import numpy as np

try:
    from PIL import Image, ImageFilter
    _PIL_AVAILABLE = True
except ImportError:
    _PIL_AVAILABLE = False

try:
    import cv2
    _CV2_AVAILABLE = True
except ImportError:
    _CV2_AVAILABLE = False

# ── supported image magic bytes ───────────────────────────────────────────────
_IMAGE_SIGNATURES: Dict[bytes, str] = {
    b"\xff\xd8\xff":       "jpeg",
    b"\x89PNG\r\n\x1a\n": "png",
    b"GIF8":               "gif",
    b"RIFF":               "webp",  # RIFF....WEBPVP8
    b"BM":                 "bmp",
}


def _detect_format(data: bytes) -> Optional[str]:
    for sig, fmt in _IMAGE_SIGNATURES.items():
        if data[:len(sig)] == sig:
            return fmt
    return None


# ── result dataclass ──────────────────────────────────────────────────────────
@dataclass
class ImageAnalysisResult:
    ai_probability:  float = 0.0
    is_ai_generated: bool  = False
    confidence:      str   = "inconclusive"
    explanation:     str   = ""
    is_image:        bool  = True
    scores: Dict[str, float] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "ai_probability":  round(self.ai_probability, 4),
            "is_ai_generated": self.is_ai_generated,
            "confidence":      self.confidence,
            "explanation":     self.explanation,
            "is_image":        self.is_image,
            "scores":          {k: round(v, 4) for k, v in self.scores.items()},
        }


# ── thresholds (CONSERVATIVE — require high confidence to flag) ───────────────
# A real photo must score very high across multiple signals before being flagged.
# We prefer false negatives (missing AI) over false positives (mislabelling real photos).
_AI_THRESHOLD_HIGH   = 0.80   # was 0.70 — raised to avoid false positives
_AI_THRESHOLD_MEDIUM = 0.60   # was 0.45

# Minimum number of detectors that must agree above their individual thresholds
_MIN_DETECTORS_FLAGGED = 2    # at least 2 of 4 must be suspicious

# ── detector weights ──────────────────────────────────────────────────────────
_W_ELA   = 0.35   # reduced — ELA is very format-dependent
_W_NOISE = 0.30
_W_DCT   = 0.20
_W_BLOCK = 0.15


class ImageAnalyzer:
    """
    Analyzes images for AI-generation / deepfake / manipulation artifacts.

    Calibrated to minimise false positives on authentic photographs.
    """

    def __init__(
        self,
        ela_quality: int = 75,
        ela_amplify: float = 15.0,    # was 20.0 — reduced amplification
        ai_threshold: float = _AI_THRESHOLD_HIGH,
    ):
        self._ela_quality  = ela_quality
        self._ela_amplify  = ela_amplify
        self._ai_threshold = ai_threshold

    # ── public API ────────────────────────────────────────────────────────────

    def analyze(
        self,
        file_bytes: bytes,
        filename: Optional[str] = None,
    ) -> ImageAnalysisResult:
        """
        Run all four detectors and fuse into a single AI probability.
        Requires at least 2 detectors to flag suspicious before raising score.
        """
        if not _PIL_AVAILABLE:
            return ImageAnalysisResult(
                is_image=False,
                explanation="Pillow not installed — image analysis unavailable.",
            )

        fmt = _detect_format(file_bytes)
        if fmt is None:
            return ImageAnalysisResult(
                is_image=False,
                explanation="File is not a recognised image format.",
            )

        try:
            with Image.open(BytesIO(file_bytes)) as img:
                img.load()
                rgb = img.convert("RGB")
        except Exception as e:
            return ImageAnalysisResult(
                is_image=False,
                explanation=f"Could not decode image: {e}",
            )

        arr = np.array(rgb, dtype=np.float32)

        # ── Run detectors ──────────────────────────────────────────────────
        ela_score   = self._ela_score(file_bytes, arr, fmt)
        noise_score = self._noise_score(arr)
        dct_score   = self._dct_score(arr)
        block_score = self._block_artifact_score(arr, fmt)

        scores = {
            "ela_score":   ela_score,
            "noise_score": noise_score,
            "dct_score":   dct_score,
            "block_score": block_score,
        }

        # ── Consensus gate: require >= 2 signals to be individually suspicious ──
        _INDIVIDUAL_THRESHOLD = 0.60
        signals_flagged = sum(
            1 for s in [ela_score, noise_score, dct_score, block_score]
            if s >= _INDIVIDUAL_THRESHOLD
        )

        # ── Weighted fusion ────────────────────────────────────────────────
        raw_prob = (
            _W_ELA   * ela_score
            + _W_NOISE * noise_score
            + _W_DCT   * dct_score
            + _W_BLOCK * block_score
        )
        raw_prob = float(np.clip(raw_prob, 0.0, 1.0))

        # If fewer than 2 detectors agree, cap the probability — this prevents
        # a single noisy detector from generating a false positive
        if signals_flagged < _MIN_DETECTORS_FLAGGED:
            ai_probability = min(raw_prob, 0.45)  # cap below medium threshold
        else:
            ai_probability = raw_prob

        # ── Build result ───────────────────────────────────────────────────
        is_ai = ai_probability >= self._ai_threshold
        confidence = self._confidence_label(ai_probability)
        explanation = self._make_explanation(
            ai_probability, ela_score, noise_score, dct_score, block_score,
            is_ai, fmt, signals_flagged
        )

        return ImageAnalysisResult(
            ai_probability=ai_probability,
            is_ai_generated=is_ai,
            confidence=confidence,
            explanation=explanation,
            is_image=True,
            scores=scores,
        )

    def analyze_score(self, file_bytes: bytes, filename: Optional[str] = None) -> float:
        """Convenience — return only the ai_probability float."""
        return self.analyze(file_bytes, filename).ai_probability

    # ── Detector 1: Error Level Analysis ──────────────────────────────────────

    def _ela_score(
        self, original_bytes: bytes, arr: np.ndarray, fmt: str
    ) -> float:
        """
        Re-compress at quality=ela_quality and measure residual magnitude.

        IMPORTANT CALIBRATION:
          - PNG → JPEG conversion ALWAYS creates large residuals (lossless→lossy).
            Use a higher normalization baseline for PNG files.
          - JPEG → JPEG: moderate residuals. Suspicious when std > 25 AND mean > 15.
          - Real photos typically: std 5-30, mean 5-25.
          - AI-generated/spliced: std > 40, mean > 35.
        """
        try:
            buf = BytesIO()
            with Image.open(BytesIO(original_bytes)) as img:
                img.convert("RGB").save(buf, format="JPEG", quality=self._ela_quality)
            buf.seek(0)
            recompressed = np.array(Image.open(buf).convert("RGB"), dtype=np.float32)

            residual = np.abs(arr - recompressed) * self._ela_amplify
            residual = np.clip(residual, 0, 255)

            std  = float(residual.std())
            mean = float(residual.mean())

            if fmt == "jpeg":
                # JPEG originals: authentic photos usually std < 35, mean < 25
                std_score  = max(0.0, min((std  - 10.0) / 55.0, 1.0))  # 0 at 10, 1 at 65
                mean_score = max(0.0, min((mean - 8.0)  / 45.0, 1.0))  # 0 at 8,  1 at 53
            else:
                # PNG/BMP/etc → JPEG: always higher. Use much wider normalization.
                std_score  = max(0.0, min((std  - 20.0) / 80.0, 1.0))  # 0 at 20, 1 at 100
                mean_score = max(0.0, min((mean - 15.0) / 60.0, 1.0))  # 0 at 15, 1 at 75

            return float(std_score * 0.55 + mean_score * 0.45)
        except Exception:
            return 0.0   # safe default — don't flag on error

    # ── Detector 2: Noise Residual Analysis ───────────────────────────────────

    def _noise_score(self, arr: np.ndarray) -> float:
        """
        Extracts the high-frequency noise residual using a Laplacian filter.

        Calibration: real camera/phone photos have wide-ranging kurtosis depending
        on scene content (textured grass = high kurtosis, clear sky = low).
        Suspicious ONLY when kurtosis is extreme AND noise variance is very low.

        Real photos typically: kurtosis 3-50+, variance > 5
        AI-smooth images: kurtosis near 3, variance < 1 (over-smoothed)
        AI-GAN noise: kurtosis > 100 (structured patterns)
        """
        try:
            gray = 0.299 * arr[:,:,0] + 0.587 * arr[:,:,1] + 0.114 * arr[:,:,2]
            gray_u8 = gray.astype(np.uint8)

            if _CV2_AVAILABLE:
                lap = cv2.Laplacian(gray_u8, cv2.CV_64F)
                noise = lap.flatten().astype(np.float64)
            else:
                kernel = np.array([[0, 1, 0], [1, -4, 1], [0, 1, 0]], dtype=np.float64)
                from scipy.ndimage import convolve
                noise = convolve(gray.astype(np.float64), kernel).flatten()

            noise_var = float(noise.var())
            noise_std = float(noise.std())

            if noise_std < 1e-6:
                return 0.7   # flat noise → suspicious (but not maximum)

            mean = noise.mean()
            z    = (noise - mean) / (noise_std + 1e-9)
            kurt = float(np.mean(z**4))

            # Penalise only EXTREME kurtosis values
            # Natural range widens: scene-dependent kurtosis 3-80+ is NORMAL for real photos
            # Suspicious: kurt < 2.0 (impossibly uniform) or kurt > 200 (structured GAN pattern)
            if kurt < 2.0:
                kurt_score = min((2.0 - kurt) / 2.0, 1.0)     # below 2 → suspicious
            elif kurt > 150:
                kurt_score = min((kurt - 150.0) / 100.0, 1.0)  # above 150 → suspicious
            else:
                kurt_score = 0.0   # anything 2-150 is normal for a real photo

            # Very low variance penalty — ONLY if variance is extremely low
            # Real photos always have some noise; variance < 1.5 is suspicious
            if noise_var < 1.5:
                low_var_penalty = 0.4
            elif noise_var < 4.0:
                low_var_penalty = max(0.0, (4.0 - noise_var) / 4.0 * 0.25)
            else:
                low_var_penalty = 0.0

            return float(min(kurt_score + low_var_penalty, 1.0))
        except Exception:
            return 0.0

    # ── Detector 3: DCT Coefficient Analysis ──────────────────────────────────

    def _dct_score(self, arr: np.ndarray) -> float:
        """
        Analyses the distribution of DCT coefficients.

        Calibration: DCT HF energy ratio varies enormously with scene.
          - Portrait/sky/uniform: low HF ratio (0.01-0.05)
          - Detailed textures/grass/fur: high HF ratio (0.10-0.30+)
        Only flag when kurtosis is truly anomalous.

        Real images kurtosis: 2-15 (very scene-dependent)
        """
        try:
            gray = (0.299 * arr[:,:,0] + 0.587 * arr[:,:,1] + 0.114 * arr[:,:,2])
            h, w = gray.shape
            H, W = (h // 8) * 8, (w // 8) * 8
            gray = gray[:H, :W]

            from scipy.fft import dct as _dct
            dct2d = _dct(_dct(gray, axis=0, norm="ortho"), axis=1, norm="ortho")

            ac = dct2d.flatten()[1:]
            if len(ac) < 100:
                return 0.0

            std = ac.std()
            if std < 1e-6:
                return 0.8   # all-uniform → suspicious

            z    = (ac - ac.mean()) / (std + 1e-9)
            kurt = float(np.mean(z**4))

            # WIDER normal range — real photos have kurtosis 2-20
            # Only flag extremely anomalous values
            if 1.5 <= kurt <= 25.0:
                kurt_score = 0.0   # completely normal
            elif kurt < 1.5:
                kurt_score = min((1.5 - kurt) / 1.5, 1.0)
            else:  # kurt > 25
                kurt_score = min((kurt - 25.0) / 75.0, 1.0)

            # HF energy — don't use as a signal (too scene-dependent for photos)
            # A dog photo with fur has very high HF energy and that's completely normal

            return float(kurt_score)
        except Exception:
            return 0.0

    # ── Detector 4: Block Artifact Score ──────────────────────────────────────

    def _block_artifact_score(self, arr: np.ndarray, fmt: str = "jpeg") -> float:
        """
        Measures 8×8 JPEG block boundary discontinuities.

        IMPORTANT: This detector is ONLY meaningful for JPEG-compressed images.
        PNG/BMP images don't have JPEG block artifacts — applying this to them
        without compensation produces random/misleading scores.
        """
        # For non-JPEG formats, this signal is meaningless — return neutral
        if fmt not in ("jpeg",):
            return 0.0

        try:
            gray = (0.299 * arr[:,:,0] + 0.587 * arr[:,:,1] + 0.114 * arr[:,:,2])
            h, w = gray.shape
            H, W = (h // 8) * 8, (w // 8) * 8
            gray = gray[:H, :W]

            block_boundaries = []
            for i in range(8, H, 8):
                diff = np.abs(gray[i, :] - gray[i-1, :]).mean()
                block_boundaries.append(float(diff))
            for j in range(8, W, 8):
                diff = np.abs(gray[:, j] - gray[:, j-1]).mean()
                block_boundaries.append(float(diff))

            non_boundary = []
            for i in range(1, min(H, 500)):   # limit for speed
                if i % 8 != 0:
                    non_boundary.append(float(np.abs(gray[i] - gray[i-1]).mean()))

            if not block_boundaries or not non_boundary:
                return 0.0

            avg_boundary     = float(np.mean(block_boundaries))
            avg_non_boundary = float(np.mean(non_boundary))

            if avg_non_boundary < 1e-6:
                return 0.8

            ba_ratio = avg_boundary / (avg_non_boundary + 1e-9)

            # Real JPEG photos: ba_ratio >= 1.0 (block boundaries visible)
            # AI-generated or over-processed: ba_ratio < 0.7 (too smooth)
            if ba_ratio >= 1.0:
                return 0.0   # authentic JPEG behavior
            elif ba_ratio >= 0.8:
                return 0.2   # slightly smooth — low suspicion
            elif ba_ratio >= 0.6:
                return 0.5   # suspicious
            else:
                return 0.8   # very suspicious

        except Exception:
            return 0.0

    # ── helpers ───────────────────────────────────────────────────────────────

    @staticmethod
    def _confidence_label(prob: float) -> str:
        if prob >= _AI_THRESHOLD_HIGH:
            return "high"
        if prob >= _AI_THRESHOLD_MEDIUM:
            return "medium"
        if prob >= 0.30:
            return "low"
        return "inconclusive"

    @staticmethod
    def _make_explanation(
        prob: float,
        ela: float,
        noise: float,
        dct: float,
        block: float,
        is_ai: bool,
        fmt: str = "jpeg",
        signals_flagged: int = 0,
    ) -> str:
        if is_ai:
            drivers = []
            if ela   >= 0.65: drivers.append(f"ELA residual anomaly ({ela:.0%})")
            if noise >= 0.65: drivers.append(f"noise pattern irregularity ({noise:.0%})")
            if dct   >= 0.65: drivers.append(f"DCT coefficient anomaly ({dct:.0%})")
            if block >= 0.65: drivers.append(f"JPEG block smoothness ({block:.0%})")
            driver_str = "; ".join(drivers) if drivers else "multiple converging signals"
            return (
                f"Multiple independent signals ({signals_flagged}/4) indicate AI-generated "
                f"or digitally manipulated content (probability {prob:.0%}). "
                f"Primary indicators: {driver_str}."
            )
        elif prob >= _AI_THRESHOLD_MEDIUM:
            return (
                f"Partial anomalies detected (probability {prob:.0%}). "
                f"ELA={ela:.0%}, Noise={noise:.0%}, DCT={dct:.0%}. "
                f"Not enough signals agree to confirm — manual review recommended."
            )
        else:
            fmt_note = " (PNG images are lossless and behave differently from JPEG during analysis.)" if fmt == "png" else ""
            return (
                f"Image signals are consistent with an authentic photograph "
                f"(AI probability {prob:.0%}).{fmt_note} "
                f"ELA residuals, noise distribution, and DCT statistics are within normal ranges."
            )
