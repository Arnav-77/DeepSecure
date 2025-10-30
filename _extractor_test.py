from io import BytesIO
import json

from PIL import Image

from utils.metadata import extract_image_metadata


def main() -> None:
	img = Image.new("RGB", (64, 32), color=(10, 20, 30))
	buf = BytesIO()
	img.save(buf, format="PNG")
	data = buf.getvalue()
	meta = extract_image_metadata(data, filename="inmemory.png")
	meta["general"]["sha256"] = meta["general"]["sha256"][:8] + "..."
	meta["general"]["md5"] = meta["general"]["md5"][:8] + "..."
	print(json.dumps(meta, ensure_ascii=False))


if __name__ == "__main__":
	main()


