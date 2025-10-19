import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from src.core.config import settings

# Priority: 1) DATABASE_URL env var (Railway/Docker), 2) Settings from .env file
DATABASE_URL = os.getenv("DATABASE_URL") or (
    f"postgresql://{settings.DB_USER}:{settings.DB_PASSWORD}"
    f"@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
)

print(f"🔗 Using database: {DATABASE_URL}")

# Criação do engine
engine = create_engine(DATABASE_URL)

# Criação da sessão
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative Base que o Alembic usará
Base = declarative_base()
