# DeepSecure 🔒

**AI-Powered Content Authenticity & Malware Detection Platform**

DeepSecure is a comprehensive security platform that uses advanced AI and machine learning to detect deepfakes, synthetic media, and malware payloads in uploaded files. The platform combines multiple detection methods including visual CNN analysis, auditory MFCC classification, binary signature scanning, metadata forensics, and temporal video analysis.

## 🌟 Features

### Multi-Modal Detection System

- **🔍 Visual CNN Analysis**: MobileNetV2-based synthetic texture detection for images and videos
- **🎵 Auditory MFCC Classification**: Audio deepfake detection using MFCC features and scikit-learn classifiers
- **🛡️ Binary Signature Scanning**: Malware payload detection through binary pattern matching
- **📋 Metadata Forensics**: EXIF data analysis and digital fingerprint extraction
- **🎬 Temporal Video Analysis**: Motion jitter detection and frame-to-frame anomaly analysis

### Modern Web Interface

- **React + TypeScript** frontend with beautiful, minimalist design
- **FastAPI** backend with RESTful API endpoints
- **Real-time analysis** with detailed component breakdown
- **Chat history persistence** using localStorage
- **AI Awareness section** with comprehensive deepfake fraud education

### Security & Performance

- **Secure file handling** with temporary file management
- **Input validation** for file size, extension, and path traversal prevention
- **CORS support** for seamless frontend-backend communication
- **Scalable architecture** ready for production deployment

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Create virtual environment:**
   ```bash
   python -m venv .venv
   ```

2. **Activate virtual environment:**
   - Windows: `.\.venv\Scripts\activate`
   - Linux/Mac: `source .venv/bin/activate`

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the API server:**
   ```bash
   .\.venv\Scripts\python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd "frontend/Minimalist Web App Design"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://127.0.0.1:8000`

## 📁 Project Structure

```
deepsecure/
├── main.py                 # FastAPI application entry point
├── schemas.py              # Pydantic models for API request/response
├── ensemble.py             # Final score computation and fusion logic
├── sar_engine.py           # Suspicious Activity Report (S.A.R.) engine
├── audio_model.py          # Auditory score prediction wrapper
├── audio_classifier.py     # scikit-learn classifier for audio analysis
├── requirements.txt        # Python dependencies
├── utils/
│   ├── metadata.py         # EXIF and metadata extraction
│   ├── signature.py         # Binary signature scanning
│   ├── model.py             # Visual CNN (MobileNetV2) model
│   ├── audio.py             # MFCC feature extraction
│   ├── temporal.py          # Video temporal analysis
│   └── security.py          # File security and validation utilities
├── tests/                  # Unit and integration tests
└── frontend/
    └── Minimalist Web App Design/
        └── src/
            ├── App.tsx
            └── components/
                ├── AuthenticatorView.tsx  # Main analysis interface
                ├── Sidebar.tsx             # Navigation and chat history
                ├── AIAwarenessView.tsx     # Deepfake fraud education
                └── ...
```

## 🔧 API Endpoints

### `POST /detect`

Analyzes uploaded files for authenticity and malware.

**Request:**
- `file`: Multipart form data file upload

**Response:**
```json
{
  "score": 0.75,
  "anomaly_string": "clean",
  "malware_flag": false,
  "components": {
    "visual_score": 0.82,
    "auditory_score": 0.68,
    "signature_check": {
      "has_signature": false,
      "matches": []
    },
    "metadata_keys": 12,
    "temporal_check": {
      "motion_jitter": 0.15,
      "is_video": false,
      "frame_count": 0
    }
  }
}
```

### `GET /api/health`

Health check endpoint with component status.

## 🧪 Testing

Run unit and integration tests:

```bash
python -m pytest tests/
```

Or use the test runner:

```bash
python tests/run_tests.py
```

## 🎯 Use Cases

- **Content Verification**: Verify authenticity of images, videos, and audio files
- **Malware Detection**: Scan files for suspicious binary signatures
- **Digital Forensics**: Extract and analyze metadata for investigation
- **Fraud Prevention**: Detect synthetic media used in social engineering attacks
- **Education**: Learn about deepfake scams and prevention strategies

## 🛡️ Security Features

- **Input Validation**: File size limits, extension checking, filename sanitization
- **Secure File Handling**: Temporary files with automatic cleanup
- **Path Traversal Prevention**: Filename sanitization to prevent directory traversal attacks
- **CORS Configuration**: Configurable cross-origin resource sharing

## 📊 Detection Scores

- **Visual Score (0-1)**: Confidence in visual authenticity (higher = more authentic)
- **Auditory Score (0-1)**: Confidence in audio authenticity (higher = more authentic)
- **Final Score (0-1)**: Weighted ensemble of all detection methods
- **Malware Flag**: Boolean indicating detected malware signatures
- **Anomaly String**: Human-readable classification of detected issues

## 🎓 AI Awareness

The platform includes an AI Awareness section that educates users about:
- Common deepfake fraud scams (CEO impersonation, KYC fraud, grandparent scams, investment scams)
- How to spot deepfakes (visual, audio, and contextual warning signs)
- Prevention and mitigation strategies
- Real-world examples and case studies

## 🚧 Future Enhancements

- [ ] Real-time video stream analysis
- [ ] Batch file processing
- [ ] API rate limiting and authentication
- [ ] Database integration for result persistence
- [ ] Advanced ML models for improved accuracy
- [ ] Cloud deployment configurations
- [ ] Docker containerization
- [ ] CI/CD pipeline setup

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- FastAPI for the robust API framework
- PyTorch/Torchvision for deep learning models
- React + Vite for the modern frontend
- scikit-learn for machine learning classifiers
- Pillow, librosa, and OpenCV for media processing

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for digital security and authenticity**
