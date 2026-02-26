"""Quick verification that PNG no longer gets audio labels."""
import sys
sys.path.insert(0, ".")
from io import BytesIO
from PIL import Image
from ensemble import compute_final_score

img = Image.new("RGB", (1920, 1080), color=(30, 30, 30))
buf = BytesIO()
img.save(buf, format="PNG")
png_bytes = buf.getvalue()

r = compute_final_score(png_bytes, filename="Screenshot 2024-01-09 010353.png")
print("Anomaly:", r["anomaly_string"])
print("Risk:", r["risk_level"])
print("Explanation (first 150):", r["explanation"][:150])

assert "audio" not in r["anomaly_string"].lower(), f"FAIL: audio label for PNG: {r['anomaly_string']}"
assert "MFCC" not in r["explanation"], "FAIL: MFCC in explanation for PNG"
print("\nPASS: PNG gets correct label - no audio text")
