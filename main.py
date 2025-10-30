from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest

from schemas import DetectResponse
from ensemble import compute_final_score
from utils.security import validate_file_size, validate_file_extension, sanitize_filename


app = FastAPI(title="Detection API", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],  # Allow all origins for development
	allow_credentials=False,  # Must be False when using allow_origins=["*"]
	allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],  # Explicitly include OPTIONS
	allow_headers=["*"],  # Allow all headers
	expose_headers=["*"],
)

# Custom middleware to intercept OPTIONS and ensure CORS headers on all responses
class CustomCORSMiddleware(BaseHTTPMiddleware):
	async def dispatch(self, request: StarletteRequest, call_next):
		# Handle OPTIONS preflight requests
		if request.method == "OPTIONS":
			response = Response(status_code=200)
			response.headers["Access-Control-Allow-Origin"] = "*"
			response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, HEAD"
			response.headers["Access-Control-Allow-Headers"] = "*"
			response.headers["Access-Control-Max-Age"] = "3600"
			return response
		
		# For all other requests, process and add CORS headers
		response = await call_next(request)
		# Ensure CORS headers are present on all responses
		response.headers["Access-Control-Allow-Origin"] = "*"
		response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, HEAD"
		response.headers["Access-Control-Allow-Headers"] = "*"
		return response

# Add custom CORS middleware LAST so it runs FIRST (middleware runs in reverse order)
app.add_middleware(CustomCORSMiddleware)


@app.get("/api/health")
async def health():
	"""Health check endpoint with component status."""
	return {
		"status": "ok",
		"components": {
			"visual_model": "MobileNetV2",
			"auditory_model": "MFCC Classifier",
			"malware_detection": "Binary Signature Scanner",
			"metadata_extraction": "Pillow EXIF",
		}
	}


@app.post("/detect")
async def detect(file: UploadFile = File(...), response: Response = Response()):
	"""
	Full API Integration: Detects anomalies and malware in uploaded files.
	
	Integrates all detection components:
	1. Visual Score: CNN-based analysis (MobileNetV2)
	2. Auditory Score: MFCC-based classifier
	3. Malware Detection: Binary signature scanning
	4. Metadata Analysis: EXIF and file properties
	
	Returns a DetectResponse with:
	- score: Final confidence score (0.0 to 1.0)
	- anomaly_string: S.A.R. Engine classification
	- malware_flag: Boolean indicating malware detection
	"""
	# Set CORS headers explicitly
	if response:
		response.headers["Access-Control-Allow-Origin"] = "*"
		response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, HEAD"
		response.headers["Access-Control-Allow-Headers"] = "*"
	
	if file is None:
		raise HTTPException(status_code=400, detail="No file provided")

	try:
		content = await file.read()
		
		# Security & Cleanup: Basic input validation
		# 1. Validate file size
		is_valid_size, size_error = validate_file_size(content, max_size_mb=100)
		if not is_valid_size:
			raise HTTPException(status_code=400, detail=size_error)
		
		# 2. Sanitize filename to prevent path traversal
		sanitized_filename = sanitize_filename(file.filename)
		
		# 3. Validate file extension (optional, but log warning for unusual extensions)
		is_valid_ext, ext_error = validate_file_extension(sanitized_filename)
		if not is_valid_ext:
			# For now, allow but could be made stricter
			pass  # Could raise HTTPException if you want strict extension checking

		# Full API Integration: Connect all functions (Visual, Auditory, Malware)
		# This computes:
		# - Visual Score via CNN (MobileNetV2)
		# - Auditory Score via MFCC classifier
		# - Malware Flag via binary signature scanning
		# - Metadata extraction for additional context
		# - Final ensemble fusion using weighted average
		# - S.A.R. Engine anomaly string generation
		result = compute_final_score(content, filename=sanitized_filename)

		# Create response with CORS headers
		detect_response = DetectResponse(
			score=result["score"],
			anomaly_string=result["anomaly_string"],
			malware_flag=result["malware_flag"],
			components=result.get("components"),
		)
		
		# Return JSONResponse with explicit CORS headers
		json_response = JSONResponse(content=detect_response.model_dump())
		json_response.headers["Access-Control-Allow-Origin"] = "*"
		json_response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, HEAD"
		json_response.headers["Access-Control-Allow-Headers"] = "*"
		return json_response
		
	except HTTPException as e:
		# Add CORS headers to error responses
		if response:
			response.headers["Access-Control-Allow-Origin"] = "*"
			response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, HEAD"
			response.headers["Access-Control-Allow-Headers"] = "*"
		raise
	except Exception as e:
		# Catch any unexpected errors and return a safe response with CORS headers
		if response:
			response.headers["Access-Control-Allow-Origin"] = "*"
			response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, HEAD"
			response.headers["Access-Control-Allow-Headers"] = "*"
		raise HTTPException(
			status_code=500,
			detail=f"Error processing file: {str(e)}"
		)


