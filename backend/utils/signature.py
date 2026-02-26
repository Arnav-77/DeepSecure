from typing import Any, Dict, List


FORBIDDEN_SIGNATURES: List[bytes] = [
	b"MZ",          # DOS header - Windows PE executables
	b"PE\x00\x00",  # COFF header - Windows PE
]


def scan_binary_signature(data: bytes) -> Dict[str, Any]:
	"""
	Scan the first and last 100 bytes of a file for simple forbidden signatures.

	Returns a dictionary with:
	- has_signature: bool
	- matches: list of hex-escaped signature snippets found
	- first_span/last_span: hex previews of scanned regions for auditing
	"""
	first_span = data[:100]
	last_span = data[-100:] if len(data) > 100 else data

	matches: List[str] = []
	for sig in FORBIDDEN_SIGNATURES:
		if sig in first_span or sig in last_span:
			matches.append(sig.hex())

	return {
		"has_signature": len(matches) > 0,
		"matches": matches,
		"first_span": first_span.hex(),
		"last_span": last_span.hex(),
	}


