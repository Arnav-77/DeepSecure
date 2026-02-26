from __future__ import annotations

from io import BytesIO
from typing import Any, Dict, Optional

import numpy as np
import librosa
import soundfile as sf


def _ensure_mono(y: np.ndarray) -> np.ndarray:
	# y can be shape (samples,) or (samples, channels) or (channels, samples)
	if y.ndim == 1:
		return y
	# Normalize to (channels, samples)
	if y.shape[0] < y.shape[1]:
		y = y.T
	# Average channels
	return np.mean(y, axis=0)


def extract_mfcc(
	audio_bytes: bytes,
	target_sr: int = 22050,
	n_mfcc: int = 13,
	duration: Optional[float] = None,
	mono: bool = True,
) -> Dict[str, Any]:
	"""Extract MFCCs from an audio file in memory.

	- Decodes bytes with soundfile
	- Optionally converts to mono
	- Resamples to target_sr
	- Computes MFCCs via librosa

	Returns: dict with waveform info and MFCC array (list for JSONability)
	"""
	data, sr = sf.read(BytesIO(audio_bytes), dtype="float32", always_2d=False)
	if mono:
		data = _ensure_mono(np.asarray(data))
	else:
		data = np.asarray(data)

	# Trim to duration if requested
	if duration is not None and duration > 0:
		max_len = int(sr * duration)
		data = data[:max_len]

	# Resample if needed
	if sr != target_sr:
		data = librosa.resample(y=data, orig_sr=sr, target_sr=target_sr)
		sr = target_sr

	mfcc = librosa.feature.mfcc(y=data, sr=sr, n_mfcc=n_mfcc)
	# Also return deltas for richer features (optional)
	delta = librosa.feature.delta(mfcc)
	delta2 = librosa.feature.delta(mfcc, order=2)

	return {
		"sr": int(sr),
		"num_samples": int(data.shape[0]),
		"n_mfcc": int(n_mfcc),
		"mfcc_shape": [int(x) for x in mfcc.shape],
		"mfcc": mfcc.tolist(),
		"delta": delta.tolist(),
		"delta2": delta2.tolist(),
	}


