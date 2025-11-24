import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from src.core.config import settings

# Use the database_url property from settings which handles both individual params and DATABASE_URL
DATABASE_URL = settings.database_url

print(f"🔗 Using database: {DATABASE_URL}")

# Criação do engine
engine = create_engine(DATABASE_URL)

# Criação da sessão
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative Base que o Alembic usará
Base = declarative_base()
