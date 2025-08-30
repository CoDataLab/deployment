# db/models.py
import uuid
from sqlalchemy import Column, String, Integer, DateTime, func, LargeBinary
from sqlalchemy.dialects.postgresql import UUID, BYTEA
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Image(Base):
    __tablename__ = "images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String, nullable=False)
    content_type = Column(String, nullable=False)
    size_in_bytes = Column(Integer, nullable=False)

    image_data = Column(LargeBinary, nullable=False)

    created_at = Column(DateTime, default=func.now())