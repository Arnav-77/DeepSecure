from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class DetectResponse(BaseModel):
    score: float
    anomaly_string: str
    malware_flag: bool
    risk_level: str
    recommended_actions: List[str]
    explanation: str
    components: Optional[Dict[str, Any]] = None
