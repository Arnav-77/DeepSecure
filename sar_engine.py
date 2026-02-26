"""
AegisAI SAR Engine — Suspicious Activity Report Generator.

File-type-aware: uses filename/mime to produce accurate anomaly labels
and human-readable explanations per media type.

Signal weights reference:
  malware_ml_score  — LightGBM PE classifier
  heuristic_score   — entropy + string + obfuscation + packing
  pattern_score     — ImageAnalyzer (images) / byte entropy (other)
  threat_score      — weighted fusion (0.5 + 0.3 + 0.2)
"""

from __future__ import annotations

import os
from typing import Any, Dict, List, Optional

# ── File-type helpers ─────────────────────────────────────────────────────────

_IMAGE_EXTS  = {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".tiff", ".tif", ".heic", ".heif"}
_AUDIO_EXTS  = {".mp3", ".wav", ".ogg", ".flac", ".aac", ".m4a", ".wma", ".opus"}
_VIDEO_EXTS  = {".mp4", ".avi", ".mov", ".mkv", ".wmv", ".flv", ".webm", ".m4v"}
_EXE_EXTS    = {".exe", ".dll", ".sys", ".drv", ".scr", ".bat", ".cmd", ".ps1", ".vbs", ".com", ".bin"}


def _detect_filetype(filename: Optional[str]) -> str:
    """Return one of: 'image', 'audio', 'video', 'executable', 'generic'."""
    if not filename:
        return "generic"
    ext = os.path.splitext(filename.lower())[1]
    if ext in _IMAGE_EXTS:
        return "image"
    if ext in _AUDIO_EXTS:
        return "audio"
    if ext in _VIDEO_EXTS:
        return "video"
    if ext in _EXE_EXTS:
        return "executable"
    return "generic"


# ══════════════════════════════════════════════════════════════════════════════
# Risk Level
# ══════════════════════════════════════════════════════════════════════════════

def get_risk_level(threat_score: float) -> str:
    """
    Map the fused threat score to a human-readable risk level.

    threat_score is a THREAT metric (higher = more dangerous):
        >= 0.65  →  High    (immediate action required)
        >= 0.35  →  Medium  (investigate)
        <  0.35  →  Low     (likely safe)
    """
    if threat_score >= 0.65:
        return "High"
    elif threat_score >= 0.35:
        return "Medium"
    else:
        return "Low"


# ══════════════════════════════════════════════════════════════════════════════
# Anomaly Classification
# ══════════════════════════════════════════════════════════════════════════════

def generate_anomaly_string(
    malware_flag: bool,
    malware_ml_score: float,
    heuristic_score: float,
    pattern_score: float,
    threat_score: float,
    metadata: Optional[Dict[str, Any]] = None,
    filename: Optional[str] = None,
) -> str:
    """
    S.A.R. Engine — classify the primary threat type, file-type-aware.

    Priority order (first match wins):
      1. Malware flag / high ML score → Malware Payload Detected
      2. High heuristic + ML          → Obfuscated Executable
      3. High entropy (heuristic)     → Packed/Encrypted Payload
      4. Excessive metadata           → Metadata Injection Anomaly
      5. Image: high pattern score    → AI-Generated / Manipulated Image
      6. Audio: high pattern score    → Abnormal Audio Pattern
      7. Video: high pattern score    → Suspicious Video Content
      8. Moderate overall threat      → Suspicious Activity Detected
      9. Default                      → clean
    """
    filetype = _detect_filetype(filename)

    # ── Executable / malware signals (apply to any file) ──────────────────
    if malware_flag or malware_ml_score >= 0.75:
        return "Malware Payload Detected"

    if malware_ml_score >= 0.45 and heuristic_score >= 0.45:
        return "Obfuscated Executable"

    if heuristic_score >= 0.60:
        return "Packed/Encrypted Payload"

    # ── Metadata anomaly (any file type) ─────────────────────────────────
    if metadata:
        exif_count = len(metadata.get("exif", {}))
        if exif_count > 50:
            return "Metadata Injection Anomaly"

    # ── Pattern score — route by file type ───────────────────────────────
    if pattern_score >= 0.55:
        if filetype == "image":
            return "AI-Generated / Manipulated Image"
        elif filetype == "audio":
            return "Abnormal Audio Pattern"
        elif filetype == "video":
            return "Suspicious Video Content"
        # executable/generic with high pattern → already caught above or fall through

    if threat_score >= 0.35:
        return "Suspicious Activity Detected"

    return "clean"


# ══════════════════════════════════════════════════════════════════════════════
# Recommended Actions
# ══════════════════════════════════════════════════════════════════════════════

def get_recommended_actions(
    anomaly_string: str,
    malware_flag: bool,
    risk_level: str,
) -> List[str]:
    if malware_flag or anomaly_string == "Malware Payload Detected":
        return [
            "Do NOT open or execute this file",
            "Delete the file immediately",
            "Run a full system antivirus scan",
            "Report the file source to your IT/security team",
            "Check if the file was received from a trusted sender",
        ]
    elif anomaly_string == "Obfuscated Executable":
        return [
            "Do not run this file — it shows signs of code obfuscation",
            "Submit to VirusTotal or a sandbox for dynamic analysis",
            "Check the file origin and sender before proceeding",
            "Do not share this file with other systems",
        ]
    elif anomaly_string == "Packed/Encrypted Payload":
        return [
            "File has abnormally high entropy — likely packed or encrypted",
            "Do not execute; submit to a sandbox environment",
            "Request the original unencrypted file from the sender",
            "Flag for manual security review",
        ]
    elif anomaly_string == "Metadata Injection Anomaly":
        return [
            "Inspect the file metadata manually for anomalies",
            "Verify the camera/software listed in the EXIF data",
            "Be cautious — file may have been edited or manipulated",
            "Cross-reference the file with its claimed source",
        ]
    elif anomaly_string == "AI-Generated / Manipulated Image":
        return [
            "This image shows signs of AI generation or digital manipulation",
            "Do not use as evidence without further forensic verification",
            "Cross-reference with source or original camera metadata",
            "Consider reverse image search to verify authenticity",
        ]
    elif anomaly_string == "Abnormal Audio Pattern":
        return [
            "Do not trust voice-based authentication from this file",
            "Verify the speaker's identity through another channel",
            "Report suspected voice cloning to relevant parties",
            "Flag the recording for forensic audio analysis",
        ]
    elif anomaly_string == "Suspicious Video Content":
        return [
            "Video may contain manipulated or deepfake frames",
            "Do not use as evidence without forensic review",
            "Cross-reference with original source footage",
            "Flag for frame-by-frame forensic analysis",
        ]
    elif anomaly_string == "Suspicious Activity Detected":
        return [
            "Treat this file with caution",
            "Do not share without further verification",
            "Consult a security professional if this is a sensitive file",
            "Run additional malware scanning before use",
        ]
    else:  # clean
        return [
            "File appears safe based on current analysis",
            "Always verify the sender before acting on file contents",
            "Keep your security software up to date",
        ]


# ══════════════════════════════════════════════════════════════════════════════
# Explanation Generator
# ══════════════════════════════════════════════════════════════════════════════

def get_explanation(
    anomaly_string: str,
    malware_ml_score: float,
    heuristic_score: float,
    pattern_score: float,
    threat_score: float,
    malware_flag: bool,
    metadata: Optional[Dict[str, Any]] = None,
    filename: Optional[str] = None,
) -> str:
    """Generate a human-readable, file-type-aware explanation of the verdict."""

    filetype = _detect_filetype(filename)
    fname = f'"{filename}"' if filename else "The file"

    if malware_flag or anomaly_string == "Malware Payload Detected":
        return (
            f"{fname} was flagged as a malware payload. "
            f"The ML classifier assigned a malicious probability of {malware_ml_score:.0%}, "
            f"and binary signature analysis detected Windows executable headers (MZ/PE). "
            f"These patterns are typically found in executables disguised as media files. "
            f"Overall threat score: {threat_score:.0%}."
        )

    elif anomaly_string == "Obfuscated Executable":
        return (
            f"{fname} shows signs of code obfuscation. "
            f"The malware ML model returned {malware_ml_score:.0%} malicious probability, "
            f"and the heuristic layer flagged suspicious entropy and structural patterns ({heuristic_score:.0%}). "
            f"This combination is consistent with packed or obfuscated executables. "
            f"Overall threat score: {threat_score:.0%}."
        )

    elif anomaly_string == "Packed/Encrypted Payload":
        return (
            f"{fname} has abnormally high byte entropy, indicating it may be packed or encrypted — "
            f"a common evasion technique used by malware. "
            f"Heuristic score: {heuristic_score:.0%}. "
            f"Overall threat score: {threat_score:.0%}."
        )

    elif anomaly_string == "Metadata Injection Anomaly":
        exif_count = len(metadata.get("exif", {})) if metadata else 0
        return (
            f"{fname} contains {exif_count} EXIF metadata fields, exceeding the normal threshold of 50. "
            f"Excessive metadata is a known indicator of file manipulation or metadata injection attacks. "
            f"Heuristic score: {heuristic_score:.0%}. "
            f"Overall threat score: {threat_score:.0%}."
        )

    elif anomaly_string == "AI-Generated / Manipulated Image":
        return (
            f"Image analysis detected anomalies consistent with AI generation or digital manipulation "
            f"in {fname}. "
            f"Signal processing techniques (Error Level Analysis, DCT coefficient patterns, noise residuals) "
            f"returned a combined manipulation probability of {pattern_score:.0%}. "
            f"This does not necessarily mean the image is harmful, but authenticity cannot be confirmed. "
            f"Overall threat score: {threat_score:.0%}."
        )

    elif anomaly_string == "Abnormal Audio Pattern":
        return (
            f"The audio classifier (MFCC-based) returned a high pattern anomaly score of {pattern_score:.0%} "
            f"for {fname}. "
            f"This suggests the audio may be synthetically generated or voice-cloned. "
            f"Key spectral features showed anomalies inconsistent with authentic human speech. "
            f"Overall threat score: {threat_score:.0%}."
        )

    elif anomaly_string == "Suspicious Video Content":
        return (
            f"Temporal analysis of {fname} detected unusual frame-to-frame motion patterns "
            f"with a pattern anomaly score of {pattern_score:.0%}. "
            f"This may indicate deepfake technology or frame-level manipulation. "
            f"Overall threat score: {threat_score:.0%}."
        )

    elif anomaly_string == "Suspicious Activity Detected":
        return (
            f"Multiple weak signals were detected in {fname}. "
            f"ML classifier: {malware_ml_score:.0%} malicious probability. "
            f"Heuristic layer: {heuristic_score:.0%} suspicion. "
            f"Pattern analysis: {pattern_score:.0%} anomaly. "
            f"No single signal is definitive, but the combined threat score of {threat_score:.0%} "
            f"warrants caution."
        )

    else:  # clean
        type_note = {
            "image": "Image authenticity checks (ELA, DCT, noise analysis)",
            "audio": "Audio spectral analysis (MFCC)",
            "video": "Temporal frame-motion analysis",
            "executable": "PE structure, import table, entropy analysis",
            "generic": "Byte-level entropy and structural analysis",
        }.get(filetype, "All detection signals")

        return (
            f"{type_note} returned normal results for {fname}. "
            f"ML malicious probability: {malware_ml_score:.0%}. "
            f"Heuristic suspicion: {heuristic_score:.0%}. "
            f"Pattern anomaly: {pattern_score:.0%}. "
            f"Overall threat score: {threat_score:.0%}. "
            f"No malware signatures or structural anomalies detected."
        )


# ══════════════════════════════════════════════════════════════════════════════
# Full Report (called by ensemble.py)
# ══════════════════════════════════════════════════════════════════════════════

def generate_full_report(
    malware_flag: bool,
    malware_ml_score: float,
    heuristic_score: float = 0.0,
    pattern_score: float = 0.0,
    threat_score: float = 0.0,
    metadata: Optional[Dict[str, Any]] = None,
    filename: Optional[str] = None,
) -> Dict[str, Any]:
    """Generate the complete SAR report."""
    anomaly_string = generate_anomaly_string(
        malware_flag=malware_flag,
        malware_ml_score=malware_ml_score,
        heuristic_score=heuristic_score,
        pattern_score=pattern_score,
        threat_score=threat_score,
        metadata=metadata,
        filename=filename,
    )
    risk_level = get_risk_level(threat_score)
    # Always High risk when malware signature is confirmed
    if malware_flag or anomaly_string == "Malware Payload Detected":
        risk_level = "High"
    recommended_actions = get_recommended_actions(anomaly_string, malware_flag, risk_level)
    explanation = get_explanation(
        anomaly_string=anomaly_string,
        malware_ml_score=malware_ml_score,
        heuristic_score=heuristic_score,
        pattern_score=pattern_score,
        threat_score=threat_score,
        malware_flag=malware_flag,
        metadata=metadata,
        filename=filename,
    )
    return {
        "anomaly_string": anomaly_string,
        "risk_level": risk_level,
        "recommended_actions": recommended_actions,
        "explanation": explanation,
    }
