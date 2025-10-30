from io import BytesIO

import numpy as np
import soundfile as sf

from audio_classifier import AudioClfConfig, build_classifier, mfcc_bytes_to_features


def synth_tone(sr: int, freq: float, dur: float) -> bytes:
	t = np.linspace(0, dur, int(sr * dur), endpoint=False)
	y = 0.2 * np.sin(2 * np.pi * freq * t).astype(np.float32)
	buf = BytesIO()
	sf.write(buf, y, sr, format="WAV")
	return buf.getvalue()


def synth_noise(sr: int, dur: float) -> bytes:
	y = (0.2 * np.random.randn(int(sr * dur))).astype(np.float32)
	buf = BytesIO()
	sf.write(buf, y, sr, format="WAV")
	return buf.getvalue()


def main() -> None:
	sr = 22050
	dur = 1.0
	# Create tiny labeled dataset: tones = real(1), noise = fake(0)
	real = [synth_tone(sr, f, dur) for f in [220, 440, 880, 660]]
	fake = [synth_noise(sr, dur) for _ in range(4)]

	X = [mfcc_bytes_to_features(b) for b in real + fake]
	y = [1] * len(real) + [0] * len(fake)

	cfg = AudioClfConfig(model_path=__import__("pathlib").Path("models/audio_clf.joblib"), use_svc=False)
	pipe = build_classifier(cfg)
	pipe.fit(np.vstack(X), np.array(y))

	from sklearn.metrics import accuracy_score
	acc = accuracy_score(y, pipe.predict(np.vstack(X)))
	print({"acc_in_sample": float(acc)})

	import joblib, pathlib
	pathlib.Path("models").mkdir(exist_ok=True)
	joblib.dump(pipe, cfg.model_path)
	print({"saved_to": str(cfg.model_path)})


if __name__ == "__main__":
	main()


