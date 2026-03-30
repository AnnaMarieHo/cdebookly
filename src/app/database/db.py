# from collections.abc import AsyncGenerator
# from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
# import os

# # 1. Pull the URL from the environment (just like in app.py)
# DATABASE_URL = os.getenv("DATABASE_URL")

# # 2. Fallback to SQLite for local development if no DB is provided
# if not DATABASE_URL:
#     DATABASE_URL = "sqlite+aiosqlite:///./codebookly_testing.db"
# else:
#     # 3. Apply the same driver swap logic to keep things consistent
#     if DATABASE_URL.startswith("postgres://"):
#         DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
#     elif DATABASE_URL.startswith("postgresql://"):
#         DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

# # 4. Add safety arguments for the engine (crucial for Supabase/Render)
# engine = create_async_engine(
#     DATABASE_URL,
#     pool_pre_ping=True,  # Checks if connection is alive before using it
#     connect_args={
#         "prepare_threshold": None, # Equivalent to disabling prepared statements in psycopg
#     } if "postgresql" in DATABASE_URL else {}
# )

# async_session_maker = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

# async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
#     async with async_session_maker() as session:
#         yield session\

from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
import os

# 1. Pull the URL from the environment (just like in app.py)
DATABASE_URL = os.getenv("DATABASE_URL")

# 2. Fallback to SQLite for local development if no DB is provided
if not DATABASE_URL:
    DATABASE_URL = "sqlite+aiosqlite:///./codebookly_testing.db"
else:
    # 3. Apply the same driver swap logic to keep things consistent
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
    elif DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

# 4. Add safety arguments for the engine (crucial for Supabase/Render)
engine = create_async_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Checks if connection is alive before using it
    connect_args={
        "prepare_threshold": None, # Equivalent to disabling prepared statements in psycopg
    } if "postgresql" in DATABASE_URL else {}
)

async_session_maker = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session