from __future__ import annotations

from typing import Any, Dict


def generate_anomaly_string(
	malware_flag: bool,
	visual_score: float,
	auditory_score: float = 0.0,
	final_score: float = 0.0,
	metadata: Dict[str, Any] | None = None,
) -> str:
	"""S.A.R. (Suspicious Activity Report) Engine Logic.
	
	Defines the Anomaly String based on the highest-scoring alert:
	- Malware Flag TRUE → "Malware Payload Detected"
	- Visual Score high → "Synthetic Texture Anomaly"
	"""
	# Priority 1: Malware Payload Detected (highest priority)
	if malware_flag:
		return "Malware Payload Detected"
	
	# Priority 2: Synthetic Texture Anomaly (high visual score)
	if visual_score > 0.8:
		return "Synthetic Texture Anomaly"
	
	# Additional anomaly detection based on other signals
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

