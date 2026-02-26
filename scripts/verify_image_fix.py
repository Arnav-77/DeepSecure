"""Quick verification that a real dog photo PNG returns clean/low score."""
import sys
sys.path.insert(0, ".")
from io import BytesIO
from PIL import Image
from ensemble import compute_final_score
from backend.malware.heuristics import HeuristicEngine

# ── Test 1: Real photo (simulated high-detail PNG like a dog photo) ──────────
# Phone photos are complex, high-entropy, high-detail — typical false-positive trigger
img = Image.new("RGB", (1920, 1080))
import numpy as np
rng = np.random.default_rng(42)
# Simulate a realistic photo with varied colors (not a uniform block)
arr = (rng.integers(30, 220, (1080, 1920, 3), dtype=np.uint8))
img = Image.fromarray(arr, "RGB")
buf = BytesIO()
img.save(buf, format="PNG")
png_bytes = buf.getvalue()
print(f"PNG size: {len(png_bytes)/1024:.1f} KB")

# Heuristic engine should return all zeros for image
engine = HeuristicEngine()
h = engine.analyze(png_bytes, filename="dog_photo.png")
assert h["entropy_score"]      == 0.0, f"FAIL: entropy_score={h['entropy_score']} for PNG"
assert h["string_suspicion"]   == 0.0, f"FAIL: string_suspicion={h['string_suspicion']} for PNG"
assert h["obfuscation_score"]  == 0.0, f"FAIL: obfuscation_score={h['obfuscation_score']} for PNG"
assert h["packed_probability"] == 0.0, f"FAIL: packed_probability={h['packed_probability']} for PNG"
print("PASS: HeuristicEngine returns all zeros for PNG")

# Full pipeline
r = compute_final_score(png_bytes, filename="dog_photo.png")
print(f"Anomaly:     {r['anomaly_string']}")
print(f"Risk:        {r['risk_level']}")
print(f"Threat pct:  {r['score']*100:.1f}%")
print(f"Explanation: {r['explanation'][:100]}")

assert "audio" not in r["anomaly_string"].lower(), f"FAIL: Audio label on PNG: {r['anomaly_string']}"
assert r["score"] < 0.50, f"FAIL: High score {r['score']*100:.0f}% on realistic PNG photo"
assert r["risk_level"] in ("Low", "Medium"), f"FAIL: Risk={r['risk_level']} for real photo"
print(f"\nPASS: Dog photo → '{r['anomaly_string']}', {r['score']*100:.0f}% threat, {r['risk_level']} risk")
