"""
AegisAI — AI Image Detection Module

Detects AI-generated / deepfake / manipulated images using purely
classical signal-processing techniques (no neural network required).

Techniques:
  1. Error Level Analysis (ELA)     — compression artifact inconsistency
  2. Noise Residual Analysis        — sensor noise pattern uniformity
  3. DCT Coefficient Analysis       — DCT histogram anomalies
  4. Block Artifact Score           — JPEG grid discontinuities
"""

from .analyzer import ImageAnalyzer, ImageAnalysisResult

__all__ = ["ImageAnalyzer", "ImageAnalysisResult"]
