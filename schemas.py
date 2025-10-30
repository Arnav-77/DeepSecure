from typing import Any, Dict, Optional
from pydantic import BaseModel


class DetectResponse(BaseModel):
	score: float
	anomaly_string: str
	malware_flag: bool
	components: Optional[Dict[str, Any]] = None


