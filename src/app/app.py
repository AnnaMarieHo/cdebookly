import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import create_async_engine
from app.api.routes import (
    codes, chapters, agencies, definitions, 
    comittee_designations, index, sections
)
import logging
import os

log = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL")
# DATABASE_URL = "sqlite+aiosqlite:///./codebookly_testing.db"

# if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
#     DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)

if not DATABASE_URL:
    log.warning("DATABASE_URL not found. Database features will be unavailable.")
else:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
        
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up...")
    yield
    print("Shutting down...")

app = FastAPI(
    title="Codebookly",
    description="Codebookly study platform",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5173/",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5173/",
        "https://cdebookly.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(codes.router)
app.include_router(chapters.router)
app.include_router(agencies.router)
app.include_router(comittee_designations.router)
app.include_router(definitions.router)  
app.include_router(index.router)
app.include_router(sections.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}