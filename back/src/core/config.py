from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    # Database configuration - supports both individual params and DATABASE_URL
    DB_HOST: str = "localhost"
    DB_PORT: str = "5432"
    DB_NAME: str = "clinica_db"
    DB_USER: str = "admin"
    DB_PASSWORD: str = "admin123"
    DATABASE_URL: str | None = None

    # Security
    SECRET_KEY: str = "supersegredo"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Environment
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"

    @property
    def database_url(self) -> str:
        """Get database URL - use DATABASE_URL if provided, otherwise construct from individual params"""
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"


settings = Settings()
