from __future__ import annotations

import os
import tempfile
from contextlib import contextmanager
from pathlib import Path
from typing import BinaryIO, Iterator


@contextmanager
def secure_temp_file(
	content: bytes,
	suffix: str = "",
	prefix: str = "detect_",
	delete: bool = True,
) -> Iterator[Path]:
	"""
	Security & Cleanup: Secure temporary file context manager.
	
	Creates a temporary file with the given content, yields the path,
	and ensures cleanup even on exceptions.
	
	Args:
		content: Bytes to write to temporary file
		suffix: File suffix (e.g., '.mp4', '.jpg')
		prefix: File prefix (default: 'detect_')
		delete: Whether to delete file on exit (default: True)
	
	Yields:
		Path to temporary file
	
	Example:
		with secure_temp_file(b"test data", suffix=".mp4") as tmp_path:
			# Use tmp_path here
			process_file(tmp_path)
		# File is automatically cleaned up
	"""
	tmp_path = None
	try:
		with tempfile.NamedTemporaryFile(
			mode="wb",
			delete=False,
			suffix=suffix,
			prefix=prefix,
		) as tmp_file:
			tmp_file.write(content)
			tmp_path = Path(tmp_file.name)
		
		yield tmp_path
		
	finally:
		# Security & Cleanup: Always attempt to delete temporary file
		if tmp_path and tmp_path.exists() and delete:
			try:
				os.unlink(tmp_path)
			except (OSError, PermissionError):
				# If deletion fails, attempt to make it read-only or log
				# For now, just suppress the error (in production, should log)
				pass


def validate_file_size(content: bytes, max_size_mb: int = 100) -> tuple[bool, str]:
	"""
	Input validation: Check file size.
	
	Args:
		content: File content bytes
		max_size_mb: Maximum file size in MB (default: 100 MB)
	
	Returns:
		(bool, str): (is_valid, error_message)
	"""
	max_size_bytes = max_size_mb * 1024 * 1024
	if len(content) > max_size_bytes:
		return False, f"File size exceeds maximum allowed size of {max_size_mb} MB"
	if len(content) == 0:
		return False, "File is empty"
	return True, ""


def validate_file_extension(filename: str | None, allowed_extensions: set[str] | None = None) -> tuple[bool, str]:
	"""
	Input validation: Check file extension.
	
	Args:
		filename: Filename to validate
		allowed_extensions: Set of allowed extensions (e.g., {'.jpg', '.png', '.mp4'})
		                   If None, accepts common media/file extensions
	
	Returns:
		(bool, str): (is_valid, error_message)
	"""
	if not filename:
		return True, ""  # No filename provided, skip extension check
	
	if allowed_extensions is None:
		# Default: accept common media and document extensions
		allowed_extensions = {
			".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp",  # Images
			".mp4", ".avi", ".mov", ".mkv", ".wmv", ".flv", ".webm",  # Videos
			".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a",  # Audio
			".pdf", ".txt", ".doc", ".docx",  # Documents
			".exe", ".dll", ".bat", ".cmd", ".ps1",  # Executables (for malware detection)
		}
	
	filename_lower = filename.lower()
	ext = Path(filename_lower).suffix
	
	if not ext or ext not in allowed_extensions:
		return False, f"File extension '{ext}' not allowed. Allowed extensions: {', '.join(sorted(allowed_extensions))}"
	
	return True, ""


def sanitize_filename(filename: str | None) -> str:
	"""
	Input validation: Sanitize filename to prevent path traversal.
	
	Args:
		filename: Original filename
	
	Returns:
		Sanitized filename (just the basename)
	"""
	if not filename:
		return "unknown"
	
	# Security: Only return the basename to prevent path traversal
	sanitized = Path(filename).name
	
	# Remove any remaining path separators or dangerous characters
	dangerous_chars = ['/', '\\', '..', '\x00']
	for char in dangerous_chars:
		sanitized = sanitized.replace(char, '_')
	
	return sanitized or "unknown"

