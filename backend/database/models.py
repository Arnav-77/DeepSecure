import uuid
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    plan_type = Column(String, default="free")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class File(Base):
    __tablename__ = "files"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True) # Optional for now
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_hash = Column(String(64), nullable=False) # SHA256
    upload_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    storage_path = Column(String, nullable=True)

class AnalysisResult(Base):
    __tablename__ = "analysis_results"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    file_id = Column(UUID(as_uuid=True), ForeignKey("files.id"), nullable=False)
    ml_score = Column(Float)
    entropy_score = Column(Float)
    heuristic_score = Column(Float)
    pattern_anomaly = Column(Float)
    similarity_score = Column(Float)
    final_threat_score = Column(Float)
    risk_level = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class FeatureVector(Base):
    __tablename__ = "feature_vectors"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    file_id = Column(UUID(as_uuid=True), ForeignKey("files.id"), nullable=False)
    vector_data = Column(JSONB, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
