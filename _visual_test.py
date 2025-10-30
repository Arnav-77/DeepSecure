from io import BytesIO

from PIL import Image

from utils.model import visual_predict


def main() -> None:
	# Create a simple RGB image in memory
	img = Image.new("RGB", (224, 224), color=(120, 160, 200))
	buf = BytesIO()
	img.save(buf, format="JPEG")
	score = visual_predict(buf.getvalue())
	print({"visual_score": score})


if __name__ == "__main__":
	main()


