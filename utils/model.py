from __future__ import annotations

from typing import Optional
from io import BytesIO

import torch
from torchvision import models, transforms
from PIL import Image


def get_device(prefer_cuda: bool = True) -> torch.device:
	if prefer_cuda and torch.cuda.is_available():
		return torch.device("cuda")
	return torch.device("cpu")


def load_mobilenet_v2(pretrained: bool = True, device: Optional[torch.device] = None) -> torch.nn.Module:
	"""Load MobileNetV2. If pretrained is True, attempts to load ImageNet weights.

	Falls back to random init if weights download is unavailable.
	"""
	if device is None:
		device = get_device()

	model = None
	if pretrained:
		try:
			# TorchVision 0.13+ uses weights enums
			weights = models.MobileNet_V2_Weights.IMAGENET1K_V1
			model = models.mobilenet_v2(weights=weights)
		except Exception:
			# Fallback if weights can't be fetched
			model = models.mobilenet_v2(weights=None)
	else:
		model = models.mobilenet_v2(weights=None)

	model.eval()
	return model.to(device)


def imagenet_preprocess() -> transforms.Compose:
	# Standard ImageNet preprocessing for MobileNetV2 (as per weights transforms)
	try:
		weights = models.MobileNet_V2_Weights.IMAGENET1K_V1
		return weights.transforms()
	except Exception:
		return transforms.Compose([
			transforms.Resize(256),
			transforms.CenterCrop(224),
			transforms.ToTensor(),
			transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
		])


def visual_predict(image_bytes: bytes, model: Optional[torch.nn.Module] = None, device: Optional[torch.device] = None) -> float:
	"""Return a raw Visual Score using MobileNetV2 on ImageNet.

	Score definition: top-1 softmax probability (higher = more confidently
	seen as a known ImageNet class). Callers can remap this if needed.
	"""
	if device is None:
		device = get_device()
	if model is None:
		model = load_mobilenet_v2(pretrained=True, device=device)

	preprocess = imagenet_preprocess()
	with Image.open(BytesIO(image_bytes)) as img:
		img = img.convert("RGB")
		tensor = preprocess(img).unsqueeze(0).to(device)

	with torch.no_grad():
		logits = model(tensor)
		probs = torch.softmax(logits, dim=1)
		top1 = float(probs.max(dim=1).values.item())
	return top1


