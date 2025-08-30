# schemas/image.py
import uuid
from datetime import datetime
from pydantic import BaseModel

class ImageResponse(BaseModel):
    id: uuid.UUID
    filename: str
    content_type: str
    size_in_bytes: int
    created_at: datetime

    class Config:
        orm_mode = True