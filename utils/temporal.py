from __future__ import annotations

from io import BytesIO
from typing import Any, Dict, Optional

import numpy as np

try:
	import cv2
	CV2_AVAILABLE = True
except ImportError:
	CV2_AVAILABLE = False


def is_video_file(filename: Optional[str]) -> bool:
	"""Check if file appears to be a video based on extension."""
	if not filename:
		return False
	video_extensions = {".mp4", ".avi", ".mov", ".mkv", ".wmv", ".flv", ".webm", ".m4v"}
	filename_lower = filename.lower()
	return any(filename_lower.endswith(ext) for ext in video_extensions)


def compute_motion_jitter_metric(video_bytes: bytes, max_frames: int = 10) -> Dict[str, Any]:
	"""
	Placeholder Temporal Check: Compute Motion Jitter Metric using OpenCV frame-to-frame difference.
	
	Reads up to max_frames from video, computes frame-to-frame differences,
	and returns a jitter metric indicating motion/stability.
	
	Returns:
		Dict with:
		- motion_jitter: float in [0, 1] (higher = more motion/jitter)
		- frame_count: number of frames analyzed
		- mean_diff: average frame-to-frame difference
		- is_video: whether video was successfully processed
	"""
	if not CV2_AVAILABLE:
		return {
			"motion_jitter": 0.0,
			"frame_count": 0,
			"mean_diff": 0.0,
			"is_video": False,
			"error": "OpenCV (cv2) not available",
		}

	try:
		# Write bytes to temporary file-like object for OpenCV
		# OpenCV VideoCapture needs a file path or can use numpy array, but for bytes
		# we need to save to a temp file or use cv2.VideoCapture with a pipe
		# For simplicity, we'll try to decode as if it's a file path
		# Actually, cv2.VideoCapture can't directly read from bytes easily
		# We'll use a workaround: save to temp file or use np.frombuffer
		# But the simplest is to check if we can decode as video first
		
		# Create a temporary file path approach - actually, let's try reading from bytes
		# using cv2.VideoCapture with BytesIO won't work directly
		# We need to use a temp file or use ffmpeg backend
		
		# Simplest approach: try to decode video header with OpenCV
		# If that fails, we'll return default values
		
		# Security & Cleanup: Use secure temporary file context manager
		from utils.security import secure_temp_file
		
		with secure_temp_file(video_bytes, suffix=".mp4") as tmp_path:
			cap = cv2.VideoCapture(str(tmp_path))
			
			if not cap.isOpened():
				return {
					"motion_jitter": 0.0,
					"frame_count": 0,
					"mean_diff": 0.0,
					"is_video": False,
					"error": "Could not open video",
				}
			
			frame_diffs = []
			prev_frame = None
			frame_count = 0
			
			while frame_count < max_frames:
				ret, frame = cap.read()
				if not ret:
					break
				
				# Convert to grayscale for easier comparison
				gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY) if len(frame.shape) == 3 else frame
				
				if prev_frame is not None:
					# Compute absolute frame difference
					diff = cv2.absdiff(prev_frame, gray)
					mean_diff = float(np.mean(diff))
					frame_diffs.append(mean_diff)
				
				prev_frame = gray
				frame_count += 1
			
			cap.release()
			
			if len(frame_diffs) == 0:
				return {
					"motion_jitter": 0.0,
					"frame_count": frame_count,
					"mean_diff": 0.0,
					"is_video": True,
					"error": "Not enough frames for comparison",
				}
			
			# Motion jitter metric: normalize mean difference to [0, 1]
			# Higher mean diff = more motion/jitter
			mean_diff_value = float(np.mean(frame_diffs))
			std_diff = float(np.std(frame_diffs))
			
			# Normalize: typical frame diff for static video ~0-10, motion ~10-100
			# Use sigmoid-like normalization
			normalized_jitter = min(1.0, mean_diff_value / 50.0)
			
			return {
				"motion_jitter": normalized_jitter,
				"frame_count": frame_count,
				"mean_diff": mean_diff_value,
				"std_diff": std_diff,
				"is_video": True,
			}
			
	except Exception as e:
		return {
			"motion_jitter": 0.0,
			"frame_count": 0,
			"mean_diff": 0.0,
			"is_video": False,
			"error": str(e),
		}


def temporal_check(content: bytes, filename: Optional[str] = None) -> Dict[str, Any]:
	"""
	Placeholder Temporal Check: Quick frame-to-frame difference for video files.
	
	If file is a video, computes Motion Jitter Metric.
	Otherwise returns default values.
	"""
	if not is_video_file(filename):
		return {
			"motion_jitter": 0.0,
			"frame_count": 0,
			"is_video": False,
		}
	
	return compute_motion_jitter_metric(content, max_frames=10)

