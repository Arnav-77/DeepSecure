"""Unit tests for Security & Cleanup functionality."""
import sys
from io import BytesIO
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.security import (
	sanitize_filename,
	secure_temp_file,
	validate_file_extension,
	validate_file_size,
)


def test_validate_file_size():
	"""Test file size validation."""
	# Valid file size
	is_valid, error = validate_file_size(b"test content", max_size_mb=100)
	assert is_valid is True
	assert error == ""
	
	# Empty file
	is_valid, error = validate_file_size(b"", max_size_mb=100)
	assert is_valid is False
	assert "empty" in error.lower()
	
	# File too large (simulate)
	large_content = b"x" * (101 * 1024 * 1024)  # 101 MB
	is_valid, error = validate_file_size(large_content, max_size_mb=100)
	assert is_valid is False
	assert "exceeds" in error.lower()


def test_validate_file_extension():
	"""Test file extension validation."""
	# Valid extensions
	is_valid, error = validate_file_extension("test.jpg")
	assert is_valid is True
	
	is_valid, error = validate_file_extension("test.mp4")
	assert is_valid is True
	
	# Invalid extension
	is_valid, error = validate_file_extension("test.unknown", allowed_extensions={".jpg", ".png"})
	assert is_valid is False
	assert "not allowed" in error.lower()
	
	# No filename
	is_valid, error = validate_file_extension(None)
	assert is_valid is True  # Should allow None


def test_sanitize_filename():
	"""Test filename sanitization."""
	# Normal filename
	result = sanitize_filename("test.jpg")
	assert result == "test.jpg"
	
	# Path traversal attempt
	result = sanitize_filename("../../../etc/passwd")
	assert ".." not in result
	assert "/" not in result
	
	# Dangerous characters
	result = sanitize_filename("test\x00file.jpg")
	assert "\x00" not in result
	
	# None filename
	result = sanitize_filename(None)
	assert result == "unknown"


def test_secure_temp_file():
	"""Test secure temporary file context manager."""
	test_content = b"test file content"
	
	with secure_temp_file(test_content, suffix=".txt") as tmp_path:
		assert tmp_path.exists()
		with open(tmp_path, "rb") as f:
			read_content = f.read()
		assert read_content == test_content
	
	# File should be cleaned up after context exits
	assert not tmp_path.exists()


def test_secure_temp_file_exception_handling():
	"""Test that temp file is cleaned up even on exceptions."""
	test_content = b"test content"
	tmp_path = None
	
	try:
		with secure_temp_file(test_content, suffix=".txt") as tmp_path:
			# Simulate exception
			raise ValueError("Test exception")
	except ValueError:
		pass
	
	# File should still be cleaned up
	if tmp_path:
		assert not tmp_path.exists()

