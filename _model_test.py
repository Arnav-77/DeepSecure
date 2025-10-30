import torch

from utils.model import load_mobilenet_v2


def main() -> None:
	model = load_mobilenet_v2(pretrained=True)
	x = torch.randn(1, 3, 224, 224, device=next(model.parameters()).device)
	with torch.no_grad():
		out = model(x)
	print({"ok": True, "out_shape": list(out.shape)})


if __name__ == "__main__":
	main()


