from io import BytesIO

import numpy as np
import soundfile as sf

from audio_model import predict_auditory_score, extract_mfcc


def main() -> None:
	sr = 22050
	dur = 1.0
	t = np.linspace(0, dur, int(sr * dur), endpoint=False)
	y = 0.2 * np.sin(2 * np.pi * 440.0 * t).astype(np.float32)

	buf = BytesIO()
	sf.write(buf, y, sr, format="WAV")
	data = buf.getvalue()

	mfcc, meta = extract_mfcc(data)
	score = predict_auditory_score(data)
	print({"mfcc_shape": list(mfcc.shape), "sr": meta["sr"], "score": score})


if __name__ == "__main__":
	main()


