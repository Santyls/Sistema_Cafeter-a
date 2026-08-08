from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuracion central de la API, sobreescribible por variables de entorno o .env"""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    SECRET_KEY: str = "dev-secret-key"
    JWT_SECRET_KEY: str = "dev-jwt-secret-key"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRES_MINUTES: int = 510  # 8 horas 30 minutos (RNF-02)

    DATABASE_URL: str = "postgresql+psycopg2://cafeteria:cafeteria@localhost:5432/cafeteria"

    CORS_ORIGINS: list[str] = ["*"]


settings = Settings()
