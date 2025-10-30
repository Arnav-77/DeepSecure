from utils.temporal import temporal_check, is_video_file


def main() -> None:
	# Test 1: Non-video file
	result1 = temporal_check(b"fake file content", filename="test.txt")
	print(f"Non-video file result: {result1}")
	
	# Test 2: Video filename but invalid video data
	result2 = temporal_check(b"fake video content", filename="test.mp4")
	print(f"Video filename, invalid data: {result2}")
	
	# Test 3: Check is_video_file function
	print(f"Is video file (test.mp4): {is_video_file('test.mp4')}")
	print(f"Is video file (test.jpg): {is_video_file('test.jpg')}")
	print(f"Is video file (None): {is_video_file(None)}")


if __name__ == "__main__":
	main()

