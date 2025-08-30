# services/image_service.py
import uuid
import asyncio
import traceback
from io import BytesIO
from PIL import Image
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from db import models

class ImageService:
    def __init__(self, db_session: AsyncSession):
        self.db = db_session

    def _process_and_compress_image(self, image_bytes: bytes) -> tuple[bytes, str]:
        """
        [BLOCKING] Converts image to a compressed WebP in memory.
        Returns a tuple of (image_bytes, content_type).
        """
        try:
            image = Image.open(BytesIO(image_bytes))

            # If the image has transparency (e.g., PNG), we preserve it.
            # Otherwise, we convert to RGB for better JPEG/WebP compression.
            if image.mode in ("RGBA", "P"):
                image = image.convert("RGBA")
            else:
                image = image.convert("RGB")

            output_buffer = BytesIO()
            
            # --- THE COMPRESSION LOGIC ---
            # Save as WebP with a quality of 80.
            # This offers excellent compression for a wide range of images.
            image.save(output_buffer, format="WEBP", quality=80)
            content_type = "image/webp"
            # --- END OF COMPRESSION LOGIC ---
            
            output_buffer.seek(0)
            return output_buffer.getvalue(), content_type
        except Exception as e:
            print(f"Pillow processing failed: {e}")
            raise ValueError("Failed to process image file.")

    async def upload_image(self, file: UploadFile) -> models.Image:
        if not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Only images are allowed."
            )
        
        unique_id = uuid.uuid4()

        try:
            original_content = await file.read()

            # --- CHANGE HERE: Call the new processing function ---
            processed_content, new_content_type = await asyncio.to_thread(
                self._process_and_compress_image, original_content
            )
            file_size = len(processed_content)

            image_record = models.Image(
                id=unique_id,
                filename=file.filename,
                content_type=new_content_type, # <-- Use the new content type
                size_in_bytes=file_size,
                image_data=processed_content
            )
            
            self.db.add(image_record)
            await self.db.commit()
            await self.db.refresh(image_record)

            return image_record

        except (ValueError, Exception) as e:
            await self.db.rollback()
            traceback.print_exc()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Could not save the image. Reason: {e}"
            )

    async def get_image_metadata_and_data(self, image_id: uuid.UUID) -> models.Image:
        result = await self.db.execute(select(models.Image).where(models.Image.id == image_id))
        image = result.scalars().first()
        if not image:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Image not found"
            )
        return image