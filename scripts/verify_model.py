"""End-to-end verification of the Threat Similarity Engine."""
import sys
from pathlib import Path
from io import BytesIO
sys.path.insert(0, str(Path(__file__).parent.parent))

from PIL import Image
from ensemble import compute_final_score
from backend.malware.similarity import get_threat_db

print("=" * 60)
print("AegisAI — Threat Similarity Engine Verification")
print("=" * 60)

# ── Setup: verify DB seeds correctly ─────────────────────────
db = get_threat_db()
stats = db.cluster_stats()
print(f"\nDB initialized: {stats['cluster_count']} clusters, {stats['upload_count']} uploads")
assert stats["cluster_count"] == 12, f"Expected 12 clusters, got {stats['cluster_count']}"

# ── Test 1: JPEG file (no PE → similarity N/A) ────────────────
img = Image.new("RGB", (224, 224), color=(120, 80, 60))
buf = BytesIO(); img.save(buf, format="JPEG"); jpeg_bytes = buf.getvalue()
r = compute_final_score(jpeg_bytes, filename="dog.jpg")
sr = r["similarity_report"]
print(f"\n[1] JPEG photo")
print(f"    matched_cluster  : {sr['matched_cluster']}")
print(f"    similarity_score : {sr['similarity_score']}")
print(f"    is_known_threat  : {sr['is_known_threat']}")
assert sr["matched_cluster"] == "N/A", "JPEG should not match any cluster"

# ── Test 2: EXE with high-entropy bytes ──────────────────────
import os
mz_data = b"MZ\x90\x00" + b"PE\x00\x00" + os.urandom(2048)
r2 = compute_final_score(mz_data, filename="packed.exe")
sr2 = r2["similarity_report"]
print(f"\n[2] High-entropy EXE (packed malware pattern)")
print(f"    matched_cluster  : {sr2['matched_cluster']}")
print(f"    matched_subfamily : {sr2.get('matched_subfamily', '')}")
print(f"    similarity_score : {sr2['similarity_score']}")
print(f"    confidence       : {sr2['confidence']}")
print(f"    severity         : {sr2['severity']}")
print(f"    mitre_tactic     : {sr2['mitre_tactic']}")
print(f"    top_matches      :")
for m in sr2.get("top_matches", []):
    print(f"      • {m['family']} / {m['subfamily']}  sim={m['similarity']:.4f}")
assert sr2["similarity_score"] > 0, "EXE should get a non-zero similarity score"

# ── Check upload was stored ───────────────────────────────────
stats2 = db.cluster_stats()
print(f"\nDB after test: {stats2['upload_count']} uploads stored")
assert stats2["upload_count"] >= 1, "Upload should be stored in DB"

print("\n✅ All assertions passed!")
