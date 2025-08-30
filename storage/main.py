# main.py
from fastapi import FastAPI
from db.models import Base
from db.database import engine
from api.image import router as images_router  # Corrected import

app = FastAPI(
    title="Image Storage Microservice",
    description="A robust microservice to store and retrieve images.",
    version="1.0.0"
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(images_router) # Use the imported router

@app.get("/", tags=["Health Check"])
def read_root():
    return {"status": "ok"}