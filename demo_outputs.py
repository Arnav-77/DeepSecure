"""Generate exact JSON outputs for front-end partner demo."""
from io import BytesIO

import numpy as np
import soundfile as sf
from PIL import Image

from ensemble import compute_final_score


def create_malware_file() -> bytes:
	"""Create file with malware signature."""
	return b"MZ" + b"PE\x00\x00" + b"FAKE_EXECUTABLE" * 100


def create_normal_image() -> bytes:
	"""Create normal image."""
	img = Image.new("RGB", (224, 224), color=(100, 150, 200))
	buf = BytesIO()
	img.save(buf, format="JPEG")
	return buf.getvalue()


def create_suspicious_image() -> bytes:
	"""Create image that might trigger high visual score."""
	img = Image.new("RGB", (500, 500), color=(255, 0, 0))
	buf = BytesIO()
	img.save(buf, format="JPEG")
	return buf.getvalue()


def create_normal_audio() -> bytes:
	"""Create normal audio."""
	sr = 22050
	dur = 1.0
	t = np.linspace(0, dur, int(sr * dur), endpoint=False)
	y = 0.2 * np.sin(2 * np.pi * 440.0 * t).astype(np.float32)
	buf = BytesIO()
	sf.write(buf, y, sr, format="WAV")
	return buf.getvalue()


def generate_demo_outputs():
	"""Generate exact JSON outputs for demo."""
	import json
	
	print("=" * 80)
	print("DEMO JSON OUTPUTS FOR FRONT-END PARTNER")
	print("=" * 80)
	
	scenarios = [
		("Malware Detected (TRUE Flag)", create_malware_file(), "malware.exe"),
		("Normal Image (Clean)", create_normal_image(), "photo.jpg"),
		("Suspicious Image (High Visual Score)", create_suspicious_image(), "suspicious.jpg"),
		("Normal Audio (Clean)", create_normal_audio(), "audio.wav"),
	]
	
	outputs = []
	
	for scenario_name, content, filename in scenarios:
		print(f"\n{'='*80}")
		print(f"Scenario: {scenario_name}")
		print(f"Filename: {filename}")
		print(f"{'='*80}")
		
		result = compute_final_score(content, filename=filename)
		
		# Format as DetectResponse JSON
		json_output = {
			"score": float(result["score"]),
			"anomaly_string": result["anomaly_string"],
			"malware_flag": bool(result["malware_flag"]),
		}
		
		# Pretty print
		json_str = json.dumps(json_output, indent=2)
		print(json_str)
		
		outputs.append({
			"scenario": scenario_name,
			"filename": filename,
			"response": json_output
		})
	
	# Save to file
	with open("demo_outputs.json", "w") as f:
		json.dump(outputs, f, indent=2)
	
	print(f"\n{'='*80}")
	print("✓ All outputs saved to demo_outputs.json")
	print(f"{'='*80}\n")
	
	# 2-minute pitch summary
	print("=" * 80)
	print("2-MINUTE PITCH SUMMARY")
	print("=" * 80)
	print("""
Our AI-Powered Content Authenticity Detection API provides comprehensive 
multi-modal analysis to detect malware, synthetic content, and anomalies:

✅ VISUAL ANALYSIS: MobileNetV2 CNN detects synthetic textures and anomalies
✅ AUDITORY ANALYSIS: MFCC-based classifier identifies audio manipulation
✅ MALWARE DETECTION: Binary signature scanning catches executable payloads
✅ METADATA FORENSICS: EXIF analysis reveals digital fingerprints
✅ TEMPORAL ANALYSIS: Frame-to-frame motion jitter for video files
✅ ENSEMBLE FUSION: Weighted combination of all signals for final confidence score

Response Format:
- score: Confidence score (0.0 = suspicious, 1.0 = authentic)
- anomaly_string: Specific anomaly type (e.g., "Malware Payload Detected")
- malware_flag: Boolean indicating malware detection

Key Features:
- Handles images, audio, and video files
- Real-time processing via FastAPI
- Secure file handling with automatic cleanup
- Comprehensive input validation
	""")
	print("=" * 80)


if __name__ == "__main__":
	generate_demo_outputs()

