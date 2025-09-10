from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_env: str = Field(default="dev", alias="APP_ENV")
    database_url: str = Field(..., alias="DATABASE_URL")
    redis_url: str = Field(..., alias="REDIS_URL")
    
    supabase_jwks_url: str = Field(..., alias="SUPABASE_JWKS_URL")
    supabase_audience: str = Field(default="authenticated", alias="SUPABASE_AUDIENCE")
    
    openai_api_key: str | None = Field(default=None, alias="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-4o-mini", alias="OPENAI_MODEL")
    openai_org_id: str | None = Field(default=None, alias="OPENAI_ORG_ID")
    openai_project_id: str | None = Field(default=None, alias="OPENAI_PROJECT_ID")
    
    sentry_dsn: str | None = Field(default=None, alias="SENTRY_DSN")
    posthog_key: str | None = Field(default=None, alias="POSTHOG_KEY")
    
    cors_allow_origins: str = Field(
        default="http://localhost:3000",
        alias="CORS_ALLOW_ORIGINS",
        description="Comma-separated list of allowed origins"
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
    
    def allowed_origins(self) -> list[str]:
        """Split CORS_ALLOW_ORIGINS by comma and strip whitespace"""
        return [origin.strip() for origin in self.cors_allow_origins.split(",") if origin.strip()]
    
    def openai_key_type(self) -> str:
        """Return OpenAI key type: classic, project, service_account, or none"""
        if not self.openai_api_key:
            return "none"
        if self.openai_api_key.startswith("sk-proj-"):
            return "project"
        if self.openai_api_key.startswith("sk-svcacct-"):
            return "service_account"
        return "classic"


@lru_cache()
def get_settings() -> Settings:
    return Settings()