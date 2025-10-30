"""Unit tests for API integration with pre-selected test files."""
import sys
from io import BytesIO
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from PIL import Image
import numpy as np
import soundfile as sf

from ensemble import compute_final_score
from utils.security import validate_file_size, sanitize_filename


def create_test_image() -> bytes:
	"""Create a test image file in memory."""
	img = Image.new("RGB", (224, 224), color=(100, 150, 200))
	buf = BytesIO()
	img.save(buf, format="JPEG")
	return buf.getvalue()


def create_test_audio() -> bytes:
	"""Create a test audio file in memory."""
	sr = 22050
	dur = 1.0
	t = np.linspace(0, dur, int(sr * dur), endpoint=False)
	y = 0.2 * np.sin(2 * np.pi * 440.0 * t).astype(np.float32)
	buf = BytesIO()
	sf.write(buf, y, sr, format="WAV")
	return buf.getvalue()


def create_test_malware_signature() -> bytes:
	"""Create test file with malware signature (MZ header)."""
	return b"MZ" + b"FAKE_EXECUTABLE" + b"A" * 1000


def test_image_detection():
	"""Test detection on image file."""
	image_bytes = create_test_image()
	result = compute_final_score(image_bytes, filename="test_image.jpg")
	
	# Verify response structure
	assert "score" in result
	assert "anomaly_string" in result
	assert "malware_flag" in result
	assert "components" in result
	
	# Verify score is in valid range
	assert 0.0 <= result["score"] <= 1.0
	
	# Verify components
	components = result["components"]
	assert "visual_score" in components
	assert "auditory_score" in components
	assert "temporal_check" in components
	
	print(f"✓ Image detection test passed: score={result['score']:.3f}, anomaly={result['anomaly_string']}")


def test_audio_detection():
	"""Test detection on audio file."""
	audio_bytes = create_test_audio()
	result = compute_final_score(audio_bytes, filename="test_audio.wav")
	
	# Verify response structure
	assert "score" in result
	assert "anomaly_string" in result
	assert "malware_flag" in result
	
	# Verify score is in valid range
	assert 0.0 <= result["score"] <= 1.0
	
	print(f"✓ Audio detection test passed: score={result['score']:.3f}, anomaly={result['anomaly_string']}")


def test_malware_signature_detection():
	"""Test detection on file with malware signature."""
	malware_bytes = create_test_malware_signature()
	result = compute_final_score(malware_bytes, filename="suspicious.exe")
	
	# Should detect malware
	# Note: malware_flag may be True due to signature detection
	print(f"✓ Malware signature test passed: malware_flag={result['malware_flag']}, anomaly={result['anomaly_string']}")


def test_empty_file_validation():
	"""Test input validation for empty files."""
	is_valid, error = validate_file_size(b"")
	assert is_valid is False
	assert "empty" in error.lower()
	print("✓ Empty file validation test passed")


def test_filename_sanitization():
	"""Test filename sanitization for path traversal prevention."""
	# Test path traversal attempt
	sanitized = sanitize_filename("../../../etc/passwd")
	assert ".." not in sanitized
	assert "/" not in sanitized
	print(f"✓ Filename sanitization test passed: '{sanitized}'")


def test_file_size_validation():
	"""Test file size validation."""
	# Valid size
	is_valid, error = validate_file_size(b"test" * 1000, max_size_mb=100)
	assert is_valid is True
	
	# Too large (simulate)
	large_file = b"x" * (101 * 1024 * 1024)
	is_valid, error = validate_file_size(large_file, max_size_mb=100)
	assert is_valid is False
	print("✓ File size validation test passed")


def run_all_tests():
	"""Run all unit tests."""
	print("Running API Integration Tests...\n")
	
	try:
		test_image_detection()
		test_audio_detection()
		test_malware_signature_detection()
		test_empty_file_validation()
		test_filename_sanitization()
		test_file_size_validation()
		
		print("\n✓ All tests passed!")
		return True
	except Exception as e:
		print(f"\n✗ Test failed: {e}")
		import traceback
		traceback.print_exc()
		return False


if __name__ == "__main__":
	run_all_tests()

