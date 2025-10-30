# Frontend Setup & Usage Guide

## Overview

This minimalist React/TypeScript frontend integrates with the Content Authenticity & Malware Detection API backend.

## Features

✅ **Comprehensive Malware Detection Interface**
- Visual CNN Analysis (MobileNetV2)
- Auditory MFCC Analysis
- Binary Signature Scanning
- Metadata Forensics (EXIF)
- Temporal Video Analysis

✅ **Detailed Button Information**
- Every button has tooltips explaining its function
- Detailed component analysis with explanations
- Clear security status indicators

## Prerequisites

1. Node.js (v18 or higher)
2. npm or yarn package manager

## Installation

1. Navigate to the frontend directory:
```bash
cd "frontend/Minimalist Web App Design"
```

2. Install dependencies:
```bash
npm install
```

## Running the Frontend

### Development Mode (with hot reload)

```bash
npm run dev
```

The frontend will start on `http://localhost:5173` (or the next available port).

### Production Build

```bash
npm run build
npm run preview
```

## Backend Configuration

Make sure the backend API is running on:
- URL: `http://127.0.0.1:8000`
- Endpoint: `/detect` (POST)

Update the API_URL in `AuthenticatorView.tsx` if your backend runs on a different port.

## Starting Both Frontend and Backend

### Terminal 1 - Backend:
```bash
cd C:\Users\ARNAV\hack
.\.venv\Scripts\python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### Terminal 2 - Frontend:
```bash
cd "frontend/Minimalist Web App Design"
npm run dev
```

## Button Information

### Analyze for Malware Button
**Function**: Scans uploaded files using multiple detection methods:
- **Visual CNN Analysis**: MobileNetV2 detects synthetic textures and anomalies
- **Auditory MFCC Classifier**: Identifies audio manipulation and deepfakes
- **Binary Signature Scanning**: Detects known malware signatures (MZ/PE headers)
- **Metadata Forensics**: EXIF analysis reveals digital fingerprints
- **Temporal Analysis**: Frame-to-frame motion jitter for video files

**Returns**: Comprehensive authenticity score (0.0-1.0), anomaly type, and malware flag.

### Clear Button
**Function**: Removes selected file and clears all analysis results. Allows uploading a new file.

### Component Analysis Toggle
**Function**: Expands/collapses detailed component breakdown showing:
- Visual Score (CNN)
- Auditory Score (MFCC)
- Malware Signature Detection
- Metadata Keys Count
- Temporal Analysis (for videos)

## Component Tooltips Explained

### Visual Analysis (CNN)
**What it does**: Uses MobileNetV2 CNN pre-trained on ImageNet to analyze visual patterns.

**What it detects**:
- Synthetic textures
- Anomalies in images
- Manipulated content

**Score meaning**: 0.0 = unrecognized/suspicious, 1.0 = highly confident in recognized pattern

### Auditory Analysis (MFCC)
**What it does**: Extracts Mel-Frequency Cepstral Coefficients from audio files.

**What it detects**:
- Audio manipulation
- Deepfake audio
- Synthetic audio

**Score meaning**: 0.0 = fake/manipulated, 1.0 = authentic audio

### Malware Signature Scanner
**What it does**: Analyzes first and last 100 bytes of files for known malware signatures.

**What it detects**:
- MZ/PE headers (executable code)
- Embedded executable payloads
- Known malware signatures

**Why it matters**: Critical security check that catches executable code in non-executable files.

### Metadata Forensics (EXIF)
**What it does**: Analyzes EXIF data and file properties.

**What it detects**:
- Creation date anomalies
- GPS coordinates
- Camera/software information
- Digital fingerprints

**Why it matters**: Excessive metadata or anomalies can indicate file manipulation.

### Temporal Analysis (Video)
**What it does**: Analyzes frame-to-frame differences using OpenCV.

**What it detects**:
- Unnatural motion patterns
- Deepfake video artifacts
- Manipulated video content

**Score meaning**: High jitter = unnatural motion, Low jitter = natural recording

## Malware Detection Display

The main alert shows:
- **Red Alert**: Malware detected - DO NOT execute or open
- **Green Alert**: No malware detected - proceed with caution

Always exercise caution with files from untrusted sources even if no malware is detected.

## Troubleshooting

### CORS Errors
Make sure the backend has CORS enabled for the frontend port (default: 5173).

### API Connection Errors
1. Verify backend is running on port 8000
2. Check API_URL in AuthenticatorView.tsx matches your backend
3. Ensure CORS middleware is configured in main.py

### Build Errors
Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

