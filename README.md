# AegisAI 🛡️

**Intelligent Threat Pattern Visualization & Response Platform**

AegisAI is an AI-powered security platform that detects deepfakes, synthetic media, and malware payloads in uploaded files — then **visualizes the threat pattern** and provides **structured response recommendations**. Built for the hackathon challenge: *Intelligent Threat Pattern Visualization & Response*.

---

## 🌟 Features

### Multi-Modal AI Detection Engine

- **🔍 Visual CNN Analysis**: MobileNetV2-based synthetic texture detection for images
- **🎵 Auditory MFCC Classification**: Audio deepfake detection using MFCC features + scikit-learn Random Forest (model trained by us)
- **🛡️ Binary Signature Scanning**: Malware payload detection through binary pattern matching (MZ/PE headers)
- **📋 Metadata Forensics**: EXIF data analysis, GPS extraction, and digital fingerprint hashing (SHA256/MD5)
- **🎬 Temporal Video Analysis**: Motion jitter detection and frame-to-frame anomaly analysis via OpenCV

### Threat Pattern Visualization *(New)*

- **📊 Component Radar Chart**: Visual breakdown of all 5 detection signals per scan
- **📈 Threat History Chart**: Trend of past scans pulled from local scan history
- **🍩 Threat Distribution**: Donut chart showing threat type distribution across scans

### Intelligent Response System *(New)*

- **🚨 Recommended Actions**: Per-threat structured remediation steps (e.g., "Do not execute", "Reverse image search")
- **🎯 Severity Levels**: Color-coded severity (Critical / Warning / Safe)
- **📄 Threat Reports**: Exportable JSON threat report per scan

### Modern Web Interface

- **React + TypeScript** frontend with dark/light mode
- **FastAPI** backend with RESTful endpoints
- **Real-time analysis** with detailed component breakdown
- **Chat/scan history** persistence using localStorage
- **AI Awareness section** — deepfake fraud education (CEO impersonation, KYC fraud, grandparent scams)

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm

### Backend Setup

```bash
# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Start API server
.venv\Scripts\python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend Setup

```bash
cd "frontend/Minimalist Web App Design"
npm install
npm run dev
```

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://127.0.0.1:8000`
- **API Docs**: `http://127.0.0.1:8000/docs`

---

## 📁 Project Structure

```
deepsecure/
├── main.py                 # FastAPI application entry point
├── schemas.py              # Pydantic models for API request/response
├── ensemble.py             # Ensemble fusion logic (Visual + Audio + Malware)
├── sar_engine.py           # S.A.R. Engine: threat classification + response recommendations
├── audio_model.py          # Auditory score prediction wrapper
├── audio_classifier.py     # scikit-learn Random Forest classifier for audio
├── requirements.txt        # Python dependencies
├── models/
│   └── audio_clf.joblib    # Pre-trained audio deepfake classifier
├── utils/
│   ├── model.py            # Visual CNN (MobileNetV2)
│   ├── audio.py            # MFCC feature extraction (librosa)
│   ├── signature.py        # Binary signature scanning
│   ├── metadata.py         # EXIF and metadata extraction
│   ├── temporal.py         # Video temporal analysis (OpenCV)
│   └── security.py         # File validation and secure temp file handling
├── tests/                  # Unit and integration tests
└── frontend/
    └── Minimalist Web App Design/
        └── src/
            ├── App.tsx
            └── components/
                ├── AuthenticatorView.tsx   # Main upload + analysis + visualization
                ├── Sidebar.tsx             # Navigation + scan history
                ├── AIAwarenessView.tsx     # Deepfake fraud education
                └── ...
```

---

## 🔧 API Endpoints

### `POST /detect`

Analyzes an uploaded file across all 5 detection modules.

**Request:** `multipart/form-data` with `file` field

**Response:**
```json
{
  "score": 0.75,
  "anomaly_string": "clean",
  "malware_flag": false,
  "components": {
    "visual_score": 0.82,
    "auditory_score": 0.68,
    "signature_check": { "has_signature": false, "matches": [] },
    "metadata_keys": 12,
    "temporal_check": { "motion_jitter": 0.15, "is_video": false, "frame_count": 0 }
  }
}
```

### `GET /api/health`

Health check — returns component status.

---

## 🧠 How the AI Works

### Detection Pipeline

```
Uploaded File
    ↓
[Security Validation] — size, extension, path sanitization
    ↓
┌──────────────────────────────────────────┐
│  5 Parallel Detection Modules            │
│  1. MobileNetV2 → visual_score           │
│  2. MFCC + RandomForest → audio_score    │
│  3. Binary scan → malware_flag           │
│  4. EXIF → metadata_keys                 │
│  5. OpenCV frames → motion_jitter        │
└──────────────────────────────────────────┘
    ↓
[Ensemble Fusion] — weighted average (50% visual + 50% audio)
                  + malware penalty (-70% if detected)
    ↓
[S.A.R. Engine] — threat label + recommended actions
    ↓
JSON Response → Frontend visualization
```

### Scoring

| Score Range | Classification |
|---|---|
| 0.0 – 0.3 | 🔴 High Risk |
| 0.3 – 0.7 | 🟡 Moderate Risk |
| 0.7 – 1.0 | 🟢 Low Risk / Authentic |

---

## 🧪 Testing

```bash
# Run all tests
.venv\Scripts\python -m pytest tests/ -v
```

---

## 🎯 Use Cases

- **Content Verification**: Verify authenticity of images, videos, and audio files
- **Malware Detection**: Scan files for embedded executable payloads
- **Digital Forensics**: Extract and analyze metadata for investigation
- **Fraud Prevention**: Detect synthetic media used in social engineering attacks
- **Education**: Learn about deepfake scams and prevention through the AI Awareness section

---

## 🛡️ Security

- File size enforcement (100 MB max)
- Extension validation and filename sanitization (path traversal prevention)
- Secure temporary file management with automatic cleanup
- CORS configuration for frontend-backend communication

---

## 🚧 Roadmap

- [x] Multi-modal detection (Visual + Audio + Malware + Metadata + Temporal)
- [x] Ensemble scoring with SAR Engine threat classification
- [x] Fix audio scoring for non-audio files (neutral fallback)
- [ ] Threat pattern radar chart visualization
- [ ] Scan history trend charts
- [ ] Recommended response actions per threat type
- [ ] Real-time video stream analysis
- [ ] Batch file processing
- [ ] Docker containerization

---

## 🙏 Acknowledgments

- FastAPI · PyTorch · Torchvision · scikit-learn
- librosa · soundfile · Pillow · OpenCV
- React · Vite · TypeScript · Recharts

---

**Built with ❤️ for digital security and content authenticity**
