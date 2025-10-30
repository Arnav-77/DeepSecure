from io import BytesIO

import numpy as np
import soundfile as sf

from audio_classifier import predict_proba_with_saved_model


def tone(sr: int, f: float, dur: float) -> bytes:
	import numpy as np
	from io import BytesIO
	import soundfile as sf
	t = np.linspace(0, dur, int(sr * dur), endpoint=False)
	y = 0.2 * np.sin(2 * np.pi * f * t).astype(np.float32)
	buf = BytesIO()
	sf.write(buf, y, sr, format="WAV")
	return buf.getvalue()


def main() -> None:
	sr = 22050
	data = tone(sr, 440.0, 1.0)
	score = predict_proba_with_saved_model(data)
	print({"auditory_score": score})


if __name__ == "__main__":
	main()


