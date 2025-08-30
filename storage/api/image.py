# api/images.py
import uuid
# No longer need FileResponse or Path
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from fastapi.responses import Response # <-- Use the general Response class
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_db
from schemas.image import ImageResponse
from services.image_service import ImageService

router = APIRouter(prefix="/images", tags=["Images"])

# The upload endpoint doesn't need any changes! It works as is.
@router.post("/", response_model=ImageResponse, status_code=status.HTTP_201_CREATED)
async def upload_image_endpoint(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    service = ImageService(db)
    image_record = await service.upload_image(file)
    return image_record

# --- CHANGE HERE: The metadata endpoint needs to be adjusted ---
# We want to avoid sending the massive image_data bytes in a JSON response.
# So we need to update our Pydantic schema.
@router.get("/{image_id}", response_model=ImageResponse)
async def get_image_metadata_endpoint(
    image_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    service = ImageService(db)
    # The service method now returns the full object, but Pydantic
    # will only serialize the fields defined in ImageResponse.
    image_record = await service.get_image_metadata_and_data(image_id)
    return image_record

# --- CHANGE HERE: The file serving endpoint ---
@router.get("/{image_id}/file")
async def get_image_file_endpoint(
    image_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    service = ImageService(db)
    image_record = await service.get_image_metadata_and_data(image_id)
    
    # Serve the bytes directly from the database record
    return Response(content=image_record.image_data, media_type=image_record.content_type)