from ensemble import fusion_weighted_average


def main() -> None:
	"""Test the fusion weighted average logic with different scenarios."""
	
	# Test 1: High visual, high auditory, no malware
	score1 = fusion_weighted_average(
		visual_score=0.9,
		auditory_score=0.8,
		malware_flag=False,
	)
	print(f"High scores, no malware: {score1:.3f}")
	
	# Test 2: High visual, high auditory, with malware (should be penalized)
	score2 = fusion_weighted_average(
		visual_score=0.9,
		auditory_score=0.8,
		malware_flag=True,
	)
	print(f"High scores, with malware: {score2:.3f}")
	
	# Test 3: Low visual, low auditory, no malware
	score3 = fusion_weighted_average(
		visual_score=0.2,
		auditory_score=0.3,
		malware_flag=False,
	)
	print(f"Low scores, no malware: {score3:.3f}")
	
	# Test 4: Unequal weights
	score4 = fusion_weighted_average(
		visual_score=0.8,
		auditory_score=0.5,
		malware_flag=False,
		visual_weight=0.7,
		auditory_weight=0.3,
	)
	print(f"Unequal weights (0.7 visual, 0.3 auditory): {score4:.3f}")
	
	# Test 5: Malware with low scores
	score5 = fusion_weighted_average(
		visual_score=0.2,
		auditory_score=0.3,
		malware_flag=True,
	)
	print(f"Low scores, with malware: {score5:.3f}")


if __name__ == "__main__":
	main()

