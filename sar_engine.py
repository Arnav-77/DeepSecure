from __future__ import annotations

from typing import Any, Dict, List


def get_risk_level(final_score: float) -> str:
    """Convert final score to risk level."""
    if final_score >= 0.7:
        return "Low"
    elif final_score >= 0.4:
        return "Medium"
    else:
        return "High"


def get_recommended_actions(anomaly_string: str, malware_flag: bool, risk_level: str) -> List[str]:
    """Return recommended actions based on threat type."""
    if malware_flag or anomaly_string == "Malware Payload Detected":
        return [
            "Do NOT open or execute this file",
            "Delete the file immediately",
            "Run a full system antivirus scan",
            "Report the file source to your IT/security team",
            "Check if the file was received from a trusted sender",
        ]
    elif anomaly_string == "Synthetic Texture Anomaly":
        return [
            "Do not use this image for identity verification",
            "Perform a reverse image search to find the original",
            "Verify the source of the image before sharing",
            "Flag the content as potentially AI-generated",
        ]
    elif anomaly_string == "Unrecognized Visual Pattern":
        return [
            "Verify the image source before using it",
            "Request the original high-resolution file",
            "Cross-check with a secondary verification tool",
        ]
    elif anomaly_string == "Abnormal Audio Pattern":
        return [
            "Do not trust voice-based authentication from this file",
            "Verify the speaker's identity through another channel",
            "Report suspected voice cloning to relevant parties",
        ]
    elif anomaly_string == "Excessive Metadata Anomaly":
        return [
            "Inspect the file metadata manually for anomalies",
            "Verify the camera/software listed in the EXIF data",
            "Be cautious — file may have been edited or manipulated",
        ]
    elif anomaly_string == "Suspicious Activity Detected":
        return [
            "Treat this file with caution",
            "Do not share without further verification",
            "Consult a security professional if this is a sensitive file",
        ]
    else:  # clean
        return [
            "File appears safe based on current analysis",
            "Always verify the sender before acting on file contents",
            "Keep your security software up to date",
        ]


def get_explanation(
    anomaly_string: str,
    visual_score: float,
    auditory_score: float,
    final_score: float,
    malware_flag: bool,
    metadata: Dict[str, Any] | None = None,
) -> str:
    """Generate a human-readable explanation of why this verdict was reached."""
    if malware_flag and anomaly_string == "Malware Payload Detected":
        return (
            f"The file contains binary signatures matching known Windows executable headers (MZ/PE). "
            f"These patterns are typically found in malware payloads disguised as media files. "
            f"Overall confidence score: {final_score:.0%}."
        )
    elif anomaly_string == "Synthetic Texture Anomaly":
        return (
            f"The visual analysis (MobileNetV2) assigned a high confidence score of {visual_score:.0%}, "
            f"indicating strong recognition of synthetic or AI-generated texture patterns. "
            f"This is above the synthetic texture threshold."
        )
    elif anomaly_string == "Unrecognized Visual Pattern":
        return (
            f"The visual model returned a low confidence of {visual_score:.0%}, "
            f"meaning the image content could not be matched to any known visual pattern. "
            f"This may indicate a manipulated, corrupted, or heavily processed image."
        )
    elif anomaly_string == "Abnormal Audio Pattern":
        return (
            f"The audio classifier (MFCC + Random Forest) returned a low authenticity score of {auditory_score:.0%}. "
            f"This suggests the audio may be synthetically generated or cloned. "
            f"Key features such as spectral flatness and MFCC coefficients showed anomalies."
        )
    elif anomaly_string == "Excessive Metadata Anomaly":
        exif_count = len(metadata.get("exif", {})) if metadata else 0
        return (
            f"The file contains {exif_count} EXIF metadata fields, which exceeds the normal threshold of 50. "
            f"Excessive metadata is a known indicator of file manipulation or metadata injection attacks."
        )
    elif anomaly_string == "Suspicious Activity Detected":
        return (
            f"The overall confidence score of {final_score:.0%} is below the safe threshold. "
            f"Visual score: {visual_score:.0%}, Audio score: {auditory_score:.0%}. "
            f"The combination of signals indicates suspicious but not definitively malicious content."
        )
    else:
        return (
            f"All detection signals returned within normal ranges. "
            f"Visual authenticity: {visual_score:.0%}, Audio authenticity: {auditory_score:.0%}, "
            f"Overall score: {final_score:.0%}. No malware signatures detected."
        )


def generate_anomaly_string(
    malware_flag: bool,
    visual_score: float,
    auditory_score: float = 0.0,
    final_score: float = 0.0,
    metadata: Dict[str, Any] | None = None,
) -> str:
    """S.A.R. (Suspicious Activity Report) Engine — classify threat type."""
    if malware_flag:
        return "Malware Payload Detected"
    if visual_score > 0.8:
        return "Synthetic Texture Anomaly"
    if visual_score < 0.2:
        return "Unrecognized Visual Pattern"
    if auditory_score < 0.2:
        return "Abnormal Audio Pattern"
    if metadata:
        exif_count = len(metadata.get("exif", {}))
        if exif_count > 50:
            return "Excessive Metadata Anomaly"
    if final_score < 0.4:
        return "Suspicious Activity Detected"
    return "clean"


def generate_full_report(
    malware_flag: bool,
    visual_score: float,
    auditory_score: float = 0.0,
    final_score: float = 0.0,
    metadata: Dict[str, Any] | None = None,
) -> Dict[str, Any]:
    """Generate the complete SAR report with anomaly, risk level, actions, and explanation."""
    anomaly_string = generate_anomaly_string(
        malware_flag=malware_flag,
        visual_score=visual_score,
        auditory_score=auditory_score,
        final_score=final_score,
        metadata=metadata,
    )
    risk_level = get_risk_level(final_score)
    recommended_actions = get_recommended_actions(anomaly_string, malware_flag, risk_level)
    explanation = get_explanation(
        anomaly_string=anomaly_string,
        visual_score=visual_score,
        auditory_score=auditory_score,
        final_score=final_score,
        malware_flag=malware_flag,
        metadata=metadata,
    )
    return {
        "anomaly_string": anomaly_string,
        "risk_level": risk_level,
        "recommended_actions": recommended_actions,
        "explanation": explanation,
    }
