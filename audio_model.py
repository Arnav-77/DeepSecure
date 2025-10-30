from __future__ import annotations

from typing import Any, Dict, Tuple

import numpy as np

from utils.audio import extract_mfcc as _extract_mfcc_dict


def extract_mfcc(audio_bytes: bytes, target_sr: int = 22050, n_mfcc: int = 13) -> Tuple[np.ndarray, Dict[str, Any]]:
	"""Convenience wrapper returning MFCC ndarray and metadata dict.

	This keeps librosa/soundfile usage outside of FastAPI routes.
	"""
	res = _extract_mfcc_dict(audio_bytes, target_sr=target_sr, n_mfcc=n_mfcc)
	mfcc = np.asarray(res["mfcc"], dtype=np.float32)
	return mfcc, res


def predict_auditory_score(audio_bytes: bytes) -> float:
	"""Uses trained scikit-learn classifier to predict auditory score.

	Falls back to heuristic if model file is missing.
	"""
	try:
		from audio_classifier import predict_proba_with_saved_model
		return predict_proba_with_saved_model(audio_bytes)
	except Exception:
		# Fallback heuristic
		mfcc, _meta = extract_mfcc(audio_bytes)
		if mfcc.size == 0:
			return 0.0
		feature = float(np.mean(np.abs(mfcc)))
		norm = feature / 50.0
		score = 1.0 / (1.0 + float(np.exp(-norm)))
		return float(score)


