from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional, Dict, Any

class UserBase(BaseModel):
    name: str
    email: str
    plan_type: str = "free"

class UserCreate(UserBase):
    password: str

class UserSchema(UserBase):
    id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class FileBase(BaseModel):
    filename: str
    file_type: str
    file_hash: str
    storage_path: Optional[str] = None

class FileCreate(FileBase):
    user_id: Optional[UUID] = None

class FileSchema(FileBase):
    id: UUID
    user_id: Optional[UUID]
    upload_timestamp: datetime
    model_config = ConfigDict(from_attributes=True)

class AnalysisResultBase(BaseModel):
    ml_score: float
    entropy_score: float
    heuristic_score: float
    pattern_anomaly: float
    similarity_score: float
    final_threat_score: float
    risk_level: str

class AnalysisResultCreate(AnalysisResultBase):
    file_id: UUID

class AnalysisResultSchema(AnalysisResultBase):
    id: UUID
    file_id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class FeatureVectorBase(BaseModel):
    vector_data: Dict[str, Any]

class FeatureVectorCreate(FeatureVectorBase):
    file_id: UUID

class FeatureVectorSchema(FeatureVectorBase):
    id: UUID
    file_id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
