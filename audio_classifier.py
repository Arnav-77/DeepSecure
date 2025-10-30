from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
from typing import List, Tuple

import numpy as np
import soundfile as sf
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score
import joblib

from utils.audio import extract_mfcc as _extract_mfcc_dict


def mfcc_bytes_to_features(audio_bytes: bytes, n_mfcc: int = 13) -> np.ndarray:
	"""Convert audio bytes to a fixed-size feature vector from MFCC stats.

	Features: per-coefficient mean, std, and deltas' mean/std → 13*4 = 52 dims.
	"""
	res = _extract_mfcc_dict(audio_bytes, n_mfcc=n_mfcc)
	mfcc = np.asarray(res["mfcc"], dtype=np.float32)  # (n_mfcc, frames)
	delta = np.asarray(res["delta"], dtype=np.float32)
	delta2 = np.asarray(res["delta2"], dtype=np.float32)

	def stats(mat: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
		return mat.mean(axis=1), mat.std(axis=1)

	m_mean, m_std = stats(mfcc)
	d1_mean, d1_std = stats(delta)
	d2_mean, d2_std = stats(delta2)
	feat = np.concatenate([m_mean, m_std, d1_mean, d1_std]).astype(np.float32)
	return feat


@dataclass
class AudioClfConfig:
	model_path: Path = Path("models/audio_clf.joblib")
	use_svc: bool = False
	C: float = 1.0
	n_estimators: int = 200
	random_state: int = 42


def build_classifier(cfg: AudioClfConfig) -> Pipeline:
	if cfg.use_svc:
		clf = SVC(C=cfg.C, probability=True, random_state=cfg.random_state)
	else:
		clf = RandomForestClassifier(
			n_estimators=cfg.n_estimators,
			random_state=cfg.random_state,
		)
	return Pipeline([
		("scaler", StandardScaler()),
		("clf", clf),
	])


def train_from_directory(data_dir: str, cfg: AudioClfConfig = AudioClfConfig()) -> float:
	"""Train classifier on folder structure:
	data_dir/
	  real/*.wav
	  fake/*.wav
	Saves model to cfg.model_path and returns validation accuracy on the same set
	(as a quick functional baseline)."""
	base = Path(data_dir)
	X: List[np.ndarray] = []
	y: List[int] = []
	for label_name, label in [("real", 1), ("fake", 0)]:
		for fp in (base / label_name).glob("*.*"):
			try:
				data, sr = sf.read(fp, dtype="float32", always_2d=False)
				buf = BytesIO()
				sf.write(buf, data, sr, format="WAV")
				feat = mfcc_bytes_to_features(buf.getvalue())
				X.append(feat)
				y.append(label)
			except Exception:
				continue
	X_arr = np.vstack(X)
	y_arr = np.asarray(y)

	pipe = build_classifier(cfg)
	pipe.fit(X_arr, y_arr)

	# quick in-sample accuracy as functional check
	pred = pipe.predict(X_arr)
	acc = accuracy_score(y_arr, pred)

	cfg.model_path.parent.mkdir(parents=True, exist_ok=True)
	joblib.dump(pipe, cfg.model_path)
	return float(acc)


def predict_proba_with_saved_model(audio_bytes: bytes, cfg: AudioClfConfig = AudioClfConfig()) -> float:
	"""Load saved model and return probability of 'real' class as score in [0,1]."""
	pipe: Pipeline = joblib.load(cfg.model_path)
	feat = mfcc_bytes_to_features(audio_bytes)
	proba = pipe.predict_proba([feat])[0][1]
	return float(proba)


