"""
AegisAI Ensemble — Multi-Modal Intelligent Threat Detection

Final Threat Score = 0.5 × Malware ML
                   + 0.3 × Heuristic Score
                   + 0.2 × Pattern Similarity

Signals
-------
  Malware ML (0.5):
      LightGBM model on 318-dim EMBER-style PE features.
      Outputs probability_malicious [0, 1].
      Non-PE files score 0.0 (fast-path).

  Heuristic Score (0.3):
      Rule-based signals from:
        - Binary signature scan (MZ/PE → immediate flag)
        - File entropy (packed/encrypted → high suspicion)
        - Metadata anomalies (excessive EXIF tags)
        - Temporal inconsistencies (video motion jitter)

  Pattern Similarity (0.2):
      Audio files: MFCC-based classifier (synthetic voice detection).
      Non-audio:   Entropy-based byte pattern score
                   (uniform distribution → suspicious).
"""

from __future__ import annotations

import math
import sys
from collections import Counter
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

import numpy as np

# ── project imports ───────────────────────────────────────────────────────────
from .utils.metadata import extract_image_metadata
from .utils.signature import scan_binary_signature
from .utils.temporal import temporal_check, is_video_file
from .audio_model import predict_auditory_score
from .sar_engine import generate_full_report

# ── Malware ML ────────────────────────────────────────────────────────────────
from .malware import MalwareModel, PEFeatureExtractor
from .malware.heuristics import HeuristicEngine
from .malware.similarity import ThreatDatabase, SimilarityResult, get_threat_db

# ── AI Image Detection ────────────────────────────────────────────────────────
from .image import ImageAnalyzer

_malware_model    = MalwareModel()
_pe_extractor     = PEFeatureExtractor()
_image_analyzer   = ImageAnalyzer()
_heuristic_engine = HeuristicEngine()
_model_loaded     = False   # lazy-load flag

def _get_malware_model() -> MalwareModel:
    global _model_loaded
    if not _model_loaded:
        _malware_model.load_model()
        _model_loaded = True
    return _malware_model


# ── File-type helpers ────────────────────────────────────────────────────────────────
_AUDIO_EXTS = {
    ".wav", ".mp3", ".flac", ".ogg", ".aac",
    ".m4a", ".wma", ".opus", ".aiff", ".au",
}
_IMAGE_EXTS = {
    ".jpg", ".jpeg", ".png", ".gif", ".webp",
    ".bmp", ".tiff", ".tif", ".heic", ".heif", ".avif",
}
_VIDEO_EXTS = {
    ".mp4", ".avi", ".mov", ".mkv", ".wmv",
    ".flv", ".webm", ".m4v", ".3gp",
}
_EXE_EXTS = {
    ".exe", ".dll", ".sys", ".drv", ".scr",
    ".bat", ".cmd", ".ps1", ".vbs", ".com",
}

# legacy aliases kept for backward compat
AUDIO_EXTENSIONS = _AUDIO_EXTS
IMAGE_EXTENSIONS = _IMAGE_EXTS

_IMG_MAGIC = [
    b"\xff\xd8\xff",       # JPEG
    b"\x89PNG\r\n\x1a\n",  # PNG
    b"GIF8",                # GIF
    b"RIFF",                # WebP (RIFF....WEBP)
    b"BM",                  # BMP
]


def _ext(filename: Optional[str]) -> str:
    """Return lowercased extension including dot, e.g. '.png'."""
    if not filename:
        return ""
    import os as _os
    return _os.path.splitext(filename.lower())[1]


def _is_audio_file(filename: Optional[str], data: bytes = b"") -> bool:
    if filename and _ext(filename) in _AUDIO_EXTS:
        return True
    # Magic bytes: RIFF/WAVE, fLaC, OGG, ID3 (mp3), MP4 audio
    if len(data) >= 4:
        hdr = data[:4]
        if hdr[:3] == b"ID3":            return True  # MP3 with ID3
        if hdr[:4] == b"fLaC":           return True  # FLAC
        if hdr[:4] == b"OggS":           return True  # OGG
        if hdr[:4] == b"RIFF" and len(data) > 11 and data[8:12] == b"WAVE":
            return True  # WAV
    return False


def _is_image_file(filename: Optional[str], data: bytes = b"") -> bool:
    if filename and _ext(filename) in _IMAGE_EXTS:
        return True
    return any(data[:len(m)] == m for m in _IMG_MAGIC)


def _is_video_file(filename: Optional[str]) -> bool:
    return bool(filename and _ext(filename) in _VIDEO_EXTS)


def _is_pe_file(data: bytes) -> bool:
    return len(data) >= 2 and data[:2] == b"MZ"


def _is_executable_file(filename: Optional[str], data: bytes = b"") -> bool:
    """PE binary OR executable extension."""
    if _is_pe_file(data):
        return True
    return bool(filename and _ext(filename) in _EXE_EXTS)



# ── entropy helper ────────────────────────────────────────────────────────────
def _file_entropy(data: bytes) -> float:
    """Shannon entropy of the full file (0–8 bits)."""
    if not data:
        return 0.0
    from collections import Counter
    import math
    counts = Counter(data)
    total = len(data)
    return -sum((c / total) * math.log2(c / total) for c in counts.values() if c > 0)


# ══════════════════════════════════════════════════════════════════════════════
# Signal 1 — Malware ML Score (weight 0.5)
# ══════════════════════════════════════════════════════════════════════════════

def _compute_ml_with_features(
    data: bytes,
    filename: Optional[str] = None,
) -> Tuple[float, Optional[np.ndarray]]:
    """
    Run ML prediction AND return the extracted feature vector.

    Returns:
        (probability_malicious [0,1], feature_vec or None if non-PE)
    """
    if not _is_pe_file(data):
        return 0.0, None
    try:
        features = _pe_extractor.extract(data)
        model = _get_malware_model()
        result = model.predict(features)
        prob = float(result[0]["probability_malicious"] if isinstance(result, list)
                     else result["probability_malicious"])
        return prob, features
    except Exception:
        return 0.0, None


def compute_malware_ml_score(data: bytes, filename: Optional[str] = None) -> float:
    """
    Runs the EMBER-style LightGBM classifier on PE files.

    Returns:
        probability_malicious [0, 1].
        Non-PE files always return 0.0 (no PE → no executable threat).
    """
    score, _ = _compute_ml_with_features(data, filename)
    return score


# ══════════════════════════════════════════════════════════════════════════════
# Signal 2 — Heuristic Score (weight 0.3)
# ══════════════════════════════════════════════════════════════════════════════

def compute_heuristic_score(
    data: bytes,
    filename: Optional[str] = None,
    signature_check: Optional[Dict[str, Any]] = None,
    metadata:        Optional[Dict[str, Any]] = None,
    temporal_result: Optional[Dict[str, Any]] = None,
) -> float:
    """
    Delegates to HeuristicEngine for a rich multi-signal score.
    Also folds in binary signature + metadata + temporal signals
    inherited from the original heuristic layer for continuity.

    Returns: combined_heuristic [0, 1]
    """
    base = _heuristic_engine.score(data, filename)

    bonus = 0.0

    # Binary signature hit — only meaningful for executable/unknown files
    # (images and audio files legitimately start with magic bytes that are NOT malware)
    is_exe = _is_executable_file(filename, data)
    if is_exe and signature_check and signature_check.get("has_signature", False):
        bonus += 0.25

    # Excessive EXIF metadata — applies to images only
    if _is_image_file(filename, data) and metadata:
        exif_count = len(metadata.get("exif", {}))
        if exif_count > 50:
            bonus += min((exif_count - 50) / 200.0, 0.10)

    # Temporal / video motion jitter
    if temporal_result:
        jitter = float(temporal_result.get("motion_jitter", 0.0))
        bonus += min(jitter * 0.10, 0.05)

    return float(min(base + bonus, 1.0))


def compute_heuristic_report(
    data: bytes,
    filename: Optional[str] = None,
    signature_check: Optional[Dict[str, Any]] = None,
    metadata:        Optional[Dict[str, Any]] = None,
    temporal_result: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Full heuristic report including per-signal breakdown.
    Used by compute_final_score to populate the API components dict.
    """
    report = _heuristic_engine.analyze(data, filename)

    is_exe = _is_executable_file(filename, data)

    # Binary signature bonus — only for executables
    if is_exe and signature_check and signature_check.get("has_signature", False):
        bonus = 0.25
    else:
        bonus = 0.0

    # EXIF anomaly bonus — only for images
    if _is_image_file(filename, data) and metadata:
        exif_count = len(metadata.get("exif", {}))
        if exif_count > 50:
            bonus += min((exif_count - 50) / 200.0, 0.10)

    if temporal_result:
        jitter = float(temporal_result.get("motion_jitter", 0.0))
        bonus += min(jitter * 0.10, 0.05)

    adjusted = float(min(report["combined_heuristic"] + bonus, 1.0))
    report["combined_heuristic"] = round(adjusted, 4)
    return report


# ══════════════════════════════════════════════════════════════════════════════
# Signal 3 — Pattern Similarity Score (weight 0.2)
# ══════════════════════════════════════════════════════════════════════════════

def compute_pattern_similarity(data: bytes, filename: Optional[str] = None) -> float:
    """
    Measures pattern-level anomaly — route depends on file type.

    Audio files:  MFCC classifier → synthetic voice detection.
                  Returns anomaly score (1.0 = maximally synthetic).

    Image files:  Full 4-signal ImageAnalyzer:
                  ELA + Noise Residual + DCT + Block Artifact Analysis.
                  Returns AI-generation probability.

    Other files:  Byte distribution uniformity score
                  (flat histogram = packed/encrypted = suspicious).

    Returns:
        Pattern anomaly score [0, 1].
    """
    if _is_audio_file(filename, data):
        try:
            authenticity = predict_auditory_score(data)
            return float(max(0.0, 1.0 - authenticity))
        except Exception:
            return 0.5

    if _is_image_file(filename, data):
        try:
            return _image_analyzer.analyze_score(data, filename)
        except Exception:
            pass   # fall through to entropy fallback
        # If ImageAnalyzer failed, return 0 rather than flagging as suspicious
        return 0.0

    if _is_video_file(filename):
        # Uses temporal jitter for scoring — pattern score reads from temporal_check
        # Return 0 here; the SAR engine uses temporal_result directly
        return 0.0

    if _is_pe_file(data):
        # PE files scored by ML model (Signal 1) — pattern score redundant
        # Return low baseline so it doesn't double-count
        return 0.0

    # Generic non-PE, non-media: byte distribution uniformity
    # Only flag if entropy is very high (>= 7.0 = practically random)
    entropy = _file_entropy(data)
    uniformity = max(0.0, (entropy - 6.5) / 1.5)  # 0 at 6.5 bits, 1 at 8 bits
    return min(uniformity, 1.0)


# ══════════════════════════════════════════════════════════════════════════════
# Ensemble Fusion
# ══════════════════════════════════════════════════════════════════════════════

# Tunable weights — by file type
#
# For PE/executables:  ML is the primary signal
# For images/audio:    ML is always 0 (fast-path); redistribute to heuristic + pattern
# Generic/unknown:     Balanced
_WEIGHTS_PE        = (0.50, 0.30, 0.20)  # malware_ml, heuristic, pattern
_WEIGHTS_MEDIA     = (0.00, 0.40, 0.60)  # ML=0 for media; more weight to pattern
_WEIGHTS_GENERIC   = (0.10, 0.45, 0.45)  # PE check still runs but weakly


def fuse_scores(
    malware_ml_score: float,
    heuristic_score:  float,
    pattern_score:    float,
    filename: Optional[str] = None,
    data: bytes = b"",
) -> float:
    """
    Weighted fusion of the three signals into a single Threat Score [0, 1].
    Weights adapt to file type so non-PE files aren't penalised by a
    permanently-zero malware_ml_score.
    """
    if _is_pe_file(data) or _is_executable_file(filename, data):
        w_ml, w_h, w_p = _WEIGHTS_PE
    elif _is_image_file(filename, data) or _is_audio_file(filename, data) or _is_video_file(filename):
        w_ml, w_h, w_p = _WEIGHTS_MEDIA
    else:
        w_ml, w_h, w_p = _WEIGHTS_GENERIC

    raw = w_ml * malware_ml_score + w_h * heuristic_score + w_p * pattern_score
    return float(max(0.0, min(1.0, raw)))



# ══════════════════════════════════════════════════════════════════════════════
# Main entry point — called by main.py /detect endpoint
# ══════════════════════════════════════════════════════════════════════════════

def compute_final_score(
    content: bytes,
    filename: Optional[str] = None,
    # Optional pre-computed overrides (for testing)
    malware_ml_score: Optional[float] = None,
    heuristic_score:  Optional[float] = None,
    pattern_score:    Optional[float] = None,
    metadata:         Optional[Dict[str, Any]] = None,
    signature_check:  Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Full multi-modal threat detection pipeline.

    Orchestrates all three signals, fuses them, runs the SAR engine,
    and returns a structured report for the API layer.
    """
    # ── Pre-compute shared results once ───────────────────────────────────────
    if signature_check is None:
        try:
            signature_check = scan_binary_signature(content)
        except Exception:
            signature_check = {"has_signature": False, "matches": []}

    if metadata is None:
        try:
            metadata = extract_image_metadata(content, filename=filename)
        except Exception:
            metadata = {}

    try:
        temporal_result = temporal_check(content, filename=filename)
    except Exception:
        temporal_result = {"motion_jitter": 0.0, "is_video": False, "frame_count": 0}

    # ── Signal 1: Malware ML ──────────────────────────────────────────────────
    if malware_ml_score is None:
        try:
            malware_ml_score, _feature_vec = _compute_ml_with_features(content, filename=filename)
        except Exception:
            malware_ml_score, _feature_vec = 0.0, None
    else:
        _feature_vec = None   # caller provided score; no feature extraction needed

    # ── Signal 2: Heuristic (full report with sub-scores) ─────────────────────
    heuristic_report: Dict[str, Any] = {}
    if heuristic_score is None:
        try:
            heuristic_report = compute_heuristic_report(
                content,
                filename=filename,
                signature_check=signature_check,
                metadata=metadata,
                temporal_result=temporal_result,
            )
            heuristic_score = heuristic_report["combined_heuristic"]
        except Exception:
            heuristic_score = 0.0

    # ── Signal 3: Pattern Similarity ──────────────────────────────────────────
    if pattern_score is None:
        try:
            pattern_score = compute_pattern_similarity(content, filename=filename)
        except Exception:
            pattern_score = 0.0

    # ── Fusion ────────────────────────────────────────────────────────────────
    threat_score = fuse_scores(
        malware_ml_score=malware_ml_score,
        heuristic_score=heuristic_score,
        pattern_score=pattern_score,
        filename=filename,
        data=content
    )

    # Malware flag: signature match OR ML model is very confident
    malware_flag = (
        signature_check.get("has_signature", False)
        or malware_ml_score >= 0.75
    )

    # ── Threat Similarity Engine ──────────────────────────────────────────────
    similarity_report = {
        "similarity_score":  0.0,
        "matched_cluster":   "N/A",
        "matched_subfamily": "N/A",
        "confidence":        "none",
        "is_known_threat":   False,
        "severity":          "unknown",
        "mitre_tactic":      "N/A",
        "top_matches":       [],
    }
    if _feature_vec is not None:
        try:
            db = get_threat_db()
            sim_result = db.find_similar(_feature_vec, top_k=3)
            similarity_report = sim_result.to_dict()
        except Exception:
            pass

    # ── SAR Engine: anomaly string, risk, actions, explanation ────────────────
    sar_report = generate_full_report(
        malware_flag=malware_flag,
        malware_ml_score=malware_ml_score,
        heuristic_score=heuristic_score,
        pattern_score=pattern_score,
        threat_score=threat_score,
        metadata=metadata,
        filename=filename,
        similarity_report=similarity_report,
        heuristic_report=heuristic_report,
    )

    # ── Persistence (Async/Background optional) ───────────────────────────────
    if _feature_vec is not None:
        try:
             db = get_threat_db()
             db.store_upload(
                 filename=filename,
                 feature_vec=_feature_vec,
                 prediction={
                     "anomaly_string":    sar_report.get("anomaly_string", ""),
                     "malware_ml_score":  round(malware_ml_score, 4),
                     "threat_score":      round(threat_score, 4),
                     "matched_cluster":   similarity_report.get("matched_cluster", "N/A"),
                 },
             )
        except Exception:
             pass


    return {
        "score": float(threat_score),
        "anomaly_string": sar_report["anomaly_string"],
        "malware_flag": bool(malware_flag),
        "risk_level": sar_report["risk_level"],
        "recommended_actions": sar_report["recommended_actions"],
        "explanation": sar_report["explanation"],
        "similarity_report": similarity_report,
        "components": {
            # ── Top-level scores ─────────────────────────────────────────
            "malware_ml_score":   round(malware_ml_score, 4),
            "heuristic_score":    round(heuristic_score,  4),
            "pattern_score":      round(pattern_score,     4),
            "threat_score":       round(threat_score,      4),
            # ── Heuristic sub-scores (from HeuristicEngine) ──────────────
            "entropy_score":      round(heuristic_report.get("entropy_score",      0.0), 4),
            "string_suspicion":   round(heuristic_report.get("string_suspicion",   0.0), 4),
            "obfuscation_score":  round(heuristic_report.get("obfuscation_score",  0.0), 4),
            "packed_probability": round(heuristic_report.get("packed_probability", 0.0), 4),
            # ── Supporting evidence ───────────────────────────────────────
            "signature_check":    signature_check,
            "metadata_keys":      len(metadata.get("exif", {})),
            "heuristic_details":  heuristic_report.get("details", {}),
            "feature_vector":     _feature_vec.tolist() if _feature_vec is not None else None,
            "temporal_check": {
                "motion_jitter": temporal_result.get("motion_jitter", 0.0),
                "is_video":      temporal_result.get("is_video", False),
                "frame_count":   temporal_result.get("frame_count", 0),
            },
        },
    }


