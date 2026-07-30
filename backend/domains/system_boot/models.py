from sqlalchemy import Column, Integer, String, Text, TIMESTAMP
from sqlalchemy.sql import func

from backend.core.database import Base


class SystemMetadata(Base):
    __tablename__ = "system_metadata"

    id = Column(Integer, primary_key=True)
    environment = Column(String(20), nullable=False)
    schema_version = Column(String(50), nullable=False)
    seed_version = Column(String(50), nullable=True)
    boot_status = Column(String(50), nullable=False)
    initialized_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    initialized_by_user_id = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)