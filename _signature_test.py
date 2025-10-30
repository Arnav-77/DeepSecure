from utils.signature import scan_binary_signature


def main() -> None:
	# Construct bytes that look like a PNG with an injected 'MZ' prefix
	# (this should trigger the forbidden signature detector)
	data = b"MZ" + b"\x89PNG\r\n\x1a\n" + (b"A" * 150) + b"PE\x00\x00" + b"B" * 10
	res = scan_binary_signature(data)
	print(res)


if __name__ == "__main__":
	main()


