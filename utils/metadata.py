from __future__ import annotations

import hashlib
from io import BytesIO
from typing import Any, Dict, Optional, Tuple

from PIL import Image, ExifTags


def _rational_to_float(value: Any) -> Optional[float]:
	try:
		# Pillow uses IFDRational or tuples for rationals
		if hasattr(value, "numerator") and hasattr(value, "denominator"):
			den = value.denominator or 1
			return float(value.numerator) / float(den)
		if isinstance(value, tuple) and len(value) == 2:
			n, d = value
			d = d or 1
			return float(n) / float(d)
		return float(value)
	except Exception:
		return None


def _dms_to_decimal(dms: Tuple[Any, Any, Any], ref: Optional[str]) -> Optional[float]:
	try:
		degrees = _rational_to_float(dms[0]) or 0.0
		minutes = _rational_to_float(dms[1]) or 0.0
		seconds = _rational_to_float(dms[2]) or 0.0
		decimal = degrees + (minutes / 60.0) + (seconds / 3600.0)
		if ref in ("S", "W"):
			decimal = -decimal
		return decimal
	except Exception:
		return None


def _extract_gps(exif_raw: Dict[int, Any]) -> Dict[str, Any]:
	gps: Dict[str, Any] = {}
	try:
		gps_tag_id = 34853  # GPSInfo
		if gps_tag_id not in exif_raw:
			return gps
		gps_info = exif_raw[gps_tag_id]
		gps_parsed: Dict[str, Any] = {}
		for k, v in gps_info.items():
			name = ExifTags.GPSTAGS.get(k, str(k))
			gps_parsed[name] = v
		lat = gps_parsed.get("GPSLatitude")
		lat_ref = gps_parsed.get("GPSLatitudeRef")
		lon = gps_parsed.get("GPSLongitude")
		lon_ref = gps_parsed.get("GPSLongitudeRef")
		if lat and lon and lat_ref and lon_ref:
			gps["latitude"] = _dms_to_decimal(lat, lat_ref)
			gps["longitude"] = _dms_to_decimal(lon, lon_ref)
		# Preserve raw GPS dictionary too
		gps["raw"] = gps_parsed
	except Exception:
		# Keep GPS empty on failure
		pass
	return gps


def extract_image_metadata(data: bytes, filename: Optional[str] = None) -> Dict[str, Any]:
	"""
	Extract comprehensive metadata from an image byte stream.

	Returns a dictionary with:
	- general: size_bytes, sha256, md5, filename
	- image: format, mime, mode, width, height, dpi, icc_profile_present
	- exif: tag->value mapping with human-readable names
	- gps: decimal lat/lon when available, plus raw GPS fields
	"""
	result: Dict[str, Any] = {
		"general": {},
		"image": {},
		"exif": {},
		"gps": {},
	}

	# General/file-level
	size_bytes = len(data)
	sha256 = hashlib.sha256(data).hexdigest()
	md5 = hashlib.md5(data).hexdigest()
	result["general"] = {
		"filename": filename,
		"size_bytes": size_bytes,
		"sha256": sha256,
		"md5": md5,
	}

	# Image-level via Pillow
	with Image.open(BytesIO(data)) as img:
		img.load()  # ensure data is read
		fmt = img.format
		mime = Image.MIME.get(fmt) if fmt else None
		width, height = img.size
		dpi = None
		try:
			dpi_val = img.info.get("dpi")  # may be (xdpi, ydpi)
			if isinstance(dpi_val, tuple) and len(dpi_val) == 2:
				dpi = {"x": dpi_val[0], "y": dpi_val[1]}
			elif isinstance(dpi_val, (int, float)):
				dpi = {"x": float(dpi_val), "y": float(dpi_val)}
		except Exception:
			pass
		icc_profile_present = bool(img.info.get("icc_profile"))

		result["image"] = {
			"format": fmt,
			"mime": mime,
			"mode": img.mode,
			"width": width,
			"height": height,
			"dpi": dpi,
			"icc_profile_present": icc_profile_present,
		}

		# EXIF
		exif_human: Dict[str, Any] = {}
		try:
			exif_raw = img.getexif()
			if exif_raw:
				for tag_id, value in exif_raw.items():
					name = ExifTags.TAGS.get(tag_id, str(tag_id))
					# Convert bytes to string where appropriate
					if isinstance(value, bytes):
						try:
							value = value.decode(errors="ignore")
						except Exception:
							pass
					exif_human[name] = value
				result["exif"] = exif_human
				# GPS
				result["gps"] = _extract_gps(exif_raw)
		except Exception:
			# If EXIF is missing or unreadable, keep defaults
			pass

	return result


