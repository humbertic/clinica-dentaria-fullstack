from pydantic_settings import BaseSettings, SettingsConfigDict
import os
from pathlib import Path

# Get the absolute path to the .env file
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BASE_DIR / ".env"


class Settings(BaseSettings):
    # Database configuration - supports both individual params and DATABASE_URL
    DATABASE_URL: str | None = None
    DB_HOST: str = "localhost"
    DB_PORT: str = "5432"
    DB_NAME: str = "clinica_db"
    DB_USER: str = "admin"
    DB_PASSWORD: str = "admin123"

    # Security
    SECRET_KEY: str = "supersegredo"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Environment
    ENVIRONMENT: str = "development"

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE) if ENV_FILE.exists() else None,
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    @property
    def database_url(self) -> str:
        """Get database URL - use DATABASE_URL if provided, otherwise construct from individual params"""
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"


settings = Settings()
