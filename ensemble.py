from __future__ import annotations

from typing import Any, Dict, Optional

from utils.metadata import extract_image_metadata
from utils.model import visual_predict
from utils.signature import scan_binary_signature
from utils.temporal import temporal_check, is_video_file
from audio_model import predict_auditory_score
from sar_engine import generate_full_report

AUDIO_EXTENSIONS = {".wav", ".mp3", ".flac", ".ogg", ".aac", ".m4a", ".wma"}


def _is_audio_file(filename: Optional[str]) -> bool:
    """Return True only if the filename has an audio extension."""
    if not filename:
        return False
    return any(filename.lower().endswith(ext) for ext in AUDIO_EXTENSIONS)


def fusion_weighted_average(
	visual_score: float,
	auditory_score: float,
	malware_flag: bool,
	visual_weight: float = 0.5,
	auditory_weight: float = 0.5,
	malware_penalty: float = 0.5,
) -> float:
	"""Final Ensemble Logic (Fusion): Weighted average to combine scores.
	
	Computes the ultimate Confidence Score by:
	1. Weighted average of Visual Score and Auditory Score
	2. Strong penalty if Malware Flag is TRUE
	
	Args:
		visual_score: Score from visual CNN model [0, 1]
		auditory_score: Score from auditory classifier [0, 1]
		malware_flag: Boolean flag indicating malware detection
		visual_weight: Weight for visual score (default 0.5)
		auditory_weight: Weight for auditory score (default 0.5)
		malware_penalty: Penalty multiplier when malware_flag is True (default 0.5)
	
	Returns:
		Final confidence score in [0, 1]
	"""
	# Normalize weights to sum to 1.0
	total_weight = visual_weight + auditory_weight
	if total_weight > 0:
		visual_weight = visual_weight / total_weight
		auditory_weight = auditory_weight / total_weight
	else:
		visual_weight = 0.5
		auditory_weight = 0.5
	
	# Weighted average of visual and auditory scores
	base_confidence = (visual_weight * visual_score) + (auditory_weight * auditory_score)
	
	# Apply strong penalty if malware flag is detected
	if malware_flag:
		# Reduce confidence significantly when malware is detected
		confidence_score = base_confidence * malware_penalty
	else:
		confidence_score = base_confidence
	
	# Clamp to [0, 1]
	return max(0.0, min(1.0, confidence_score))


def compute_final_score(
	content: bytes,
	filename: Optional[str] = None,
	visual_score: Optional[float] = None,
	auditory_score: Optional[float] = None,
	metadata: Optional[Dict[str, Any]] = None,
	signature_check: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
	"""Combine all detection signals into a final score and malware flag.

	If inputs are None, they will be computed internally.
	"""
	# Compute missing inputs
	if visual_score is None:
		try:
			visual_score = visual_predict(content)
		except Exception:
			visual_score = 0.0

	if auditory_score is None:
		if _is_audio_file(filename):
			# Only run the audio classifier on actual audio files
			try:
				auditory_score = predict_auditory_score(content)
			except Exception:
				auditory_score = 0.5  # Neutral on failure
		else:
			# Non-audio file: audio score is not applicable, use neutral 0.5
			auditory_score = 0.5

	if metadata is None:
		try:
			metadata = extract_image_metadata(content, filename=filename)
		except Exception:
			metadata = {}

	if signature_check is None:
		signature_check = scan_binary_signature(content)

	# Temporal Check (Placeholder): Motion Jitter Metric for video files
	temporal_result = temporal_check(content, filename=filename)

	# Malware flag: signature match detected
	malware_flag = signature_check.get("has_signature", False)

	# Final Ensemble Logic (Fusion): Weighted average to combine Visual Score, Auditory Score, and Malware Flag
	# into the ultimate Confidence Score
	final_score = fusion_weighted_average(
		visual_score=visual_score,
		auditory_score=auditory_score,
		malware_flag=malware_flag,
		visual_weight=0.5,  # Equal weight for visual and auditory
		auditory_weight=0.5,
		malware_penalty=0.3,  # Strong penalty when malware is detected (reduces confidence by 70%)
	)

	# Malware is determined solely by binary signature detection
	# (Removed the score-based malware rule — it incorrectly flagged
	#  normal images where audio score pulled the average down)

	# S.A.R. Engine: full report with anomaly, risk, actions, explanation
	sar_report = generate_full_report(
		malware_flag=malware_flag,
		visual_score=visual_score,
		auditory_score=auditory_score,
		final_score=final_score,
		metadata=metadata,
	)

	return {
		"score": float(final_score),
		"anomaly_string": sar_report["anomaly_string"],
		"malware_flag": bool(malware_flag),
		"risk_level": sar_report["risk_level"],
		"recommended_actions": sar_report["recommended_actions"],
		"explanation": sar_report["explanation"],
		"components": {
			"visual_score": float(visual_score),
			"auditory_score": float(auditory_score),
			"signature_check": signature_check,
			"metadata_keys": len(metadata.get("exif", {})),
			"temporal_check": {
				"motion_jitter": temporal_result.get("motion_jitter", 0.0),
				"is_video": temporal_result.get("is_video", False),
				"frame_count": temporal_result.get("frame_count", 0),
			},
		},
	}

