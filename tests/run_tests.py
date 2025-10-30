"""Test runner for all unit tests."""
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from tests.test_api_integration import run_all_tests


def main():
	"""Run all unit tests."""
	print("=" * 60)
	print("Running Security & Cleanup Unit Tests")
	print("=" * 60)
	
	# Run security tests manually since pytest might not be installed
	print("\n1. Testing file size validation...")
	try:
		from utils.security import validate_file_size
		is_valid, error = validate_file_size(b"test", max_size_mb=100)
		assert is_valid is True
		print("   ✓ File size validation passed")
	except Exception as e:
		print(f"   ✗ Failed: {e}")
		return False
	
	print("\n2. Testing filename sanitization...")
	try:
		from utils.security import sanitize_filename
		result = sanitize_filename("../../../etc/passwd")
		assert ".." not in result
		print(f"   ✓ Filename sanitization passed: '{result}'")
	except Exception as e:
		print(f"   ✗ Failed: {e}")
		return False
	
	print("\n3. Testing secure temp file...")
	try:
		from utils.security import secure_temp_file
		with secure_temp_file(b"test content", suffix=".txt") as tmp_path:
			assert tmp_path.exists()
		assert not tmp_path.exists()
		print("   ✓ Secure temp file cleanup passed")
	except Exception as e:
		print(f"   ✗ Failed: {e}")
		return False
	
	print("\n" + "=" * 60)
	print("Running API Integration Tests")
	print("=" * 60)
	
	# Run API integration tests
	api_tests_passed = run_all_tests()
	
	if api_tests_passed:
		print("\n" + "=" * 60)
		print("✓ All tests passed! API stability ensured.")
		print("=" * 60)
		return True
	else:
		print("\n" + "=" * 60)
		print("✗ Some tests failed.")
		print("=" * 60)
		return False


if __name__ == "__main__":
	success = main()
	sys.exit(0 if success else 1)

