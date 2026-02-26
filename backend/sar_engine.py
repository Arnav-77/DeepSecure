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
    similarity_report: Optional[Dict[str, Any]] = None,
    heuristic_report:  Optional[Dict[str, Any]] = None,
) -> List[str]:
    """
    Intelligent Automated Threat Response Engine.
    Maps granular actions based on specific threat indicators.
    """
    actions = []

    # 1. ── Critical Similarity-Based Actions (The "Consensus Gate") ───────────
    if similarity_report:
        sim_score = similarity_report.get("similarity_score", 0.0)
        cluster   = similarity_report.get("matched_cluster", "N/A")
        is_known  = similarity_report.get("is_known_threat", False)

        if sim_score >= 0.85 and cluster != "Benign":
            actions.append(f"CRITICAL: Isolate device immediately (90%+ match with {cluster})")
            actions.append(f"Block all outbound network traffic from this host")
        elif sim_score >= 0.70 and is_known:
            actions.append(f"Isolate device immediately (Suspicious similarity to {cluster})")
        
        if cluster in ("Ransomware", "Dropper"):
            actions.append("Disconnect from network shares to prevent lateral movement")

    # 2. ── Malware / Signature Actions ──────────────────────────────────────
    if malware_flag or anomaly_string == "Malware Payload Detected":
        actions.append("Block execution and quarantine file immediately")
        if not any("Isolate" in a for a in actions):
            actions.append("Run a full system antivirus scan")
        actions.append("Report the file source to your IT/security team")

    # 3. ── Heuristic-Specific Actions ───────────────────────────────────────
    if heuristic_report:
        obf_score = heuristic_report.get("obfuscation_score", 0.0)
        pck_score = heuristic_report.get("packed_probability", 0.0)
        ent_score = heuristic_report.get("entropy_score", 0.0)

        if obf_score >= 0.85 or pck_score >= 0.85:
            actions.append("Submit to deep sandbox for automated de-obfuscation")
        
        if ent_score >= 0.95:
             actions.append("File contains high-entropy payload typical of encrypted malware")

    # 4. ── Anomaly-Specific Defaults ────────────────────────────────────────
    if anomaly_string == "AI-Generated / Manipulated Image":
        actions.append("Do not use as evidence without further forensic verification")
        actions.append("Cross-reference with source or original camera metadata")
    
    elif anomaly_string == "Abnormal Audio Pattern":
        actions.append("Do not trust voice-based authentication from this file")
        actions.append("Report suspected voice cloning to relevant authorities")

    # 5. ── Generic / Risk-Level Fallbacks ────────────────────────────────────
    if not actions:
        if risk_level == "High":
             actions.append("Block execution and flag for manual investigation")
        elif risk_level == "Medium":
             actions.append("Proceed with caution; verify sender authenticity")
        else:
             actions.append("File appears safe based on multi-modal analysis")

    # Final cleanup: ensure unique actions and limit count
    seen = set()
    unique_actions = []
    for a in actions:
        if a not in seen:
            unique_actions.append(a)
            seen.add(a)
    
    return unique_actions[:6]


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
    similarity_report: Optional[Dict[str, Any]] = None,
    heuristic_report:  Optional[Dict[str, Any]] = None,
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
    
    recommended_actions = get_recommended_actions(
        anomaly_string=anomaly_string,
        malware_flag=malware_flag,
        risk_level=risk_level,
        similarity_report=similarity_report,
        heuristic_report=heuristic_report,
    )
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
