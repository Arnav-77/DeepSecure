from io import BytesIO

import numpy as np
import soundfile as sf

from utils.audio import extract_mfcc


def main() -> None:
	# Generate a 1-second 440 Hz sine wave at 22.05 kHz
	sr = 22050
	dur = 1.0
	t = np.linspace(0, dur, int(sr * dur), endpoint=False)
	y = 0.2 * np.sin(2 * np.pi * 440.0 * t).astype(np.float32)

	buf = BytesIO()
	sf.write(buf, y, sr, format="WAV")
	audio_bytes = buf.getvalue()

	res = extract_mfcc(audio_bytes, target_sr=sr, n_mfcc=13)
	print({"sr": res["sr"], "mfcc_shape": res["mfcc_shape"], "num_samples": res["num_samples"]})


if __name__ == "__main__":
	main()


