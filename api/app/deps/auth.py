import json
from dataclasses import dataclass
from typing import Annotated

import httpx
from cachetools import TTLCache
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.settings import Settings, get_settings

jwks_cache = TTLCache(maxsize=1, ttl=86400)  # 24 hour cache


@dataclass
class UserCtx:
    user_id: str


security = HTTPBearer()


async def fetch_jwks(jwks_url: str) -> dict:
    if "jwks" in jwks_cache:
        return jwks_cache["jwks"]
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(jwks_url, timeout=10.0)
            response.raise_for_status()
            jwks = response.json()
            jwks_cache["jwks"] = jwks
            return jwks
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch JWKS: {str(e)}"
            )
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=500,
                detail=f"JWKS endpoint returned {e.response.status_code}"
            )


def verify_jwt_token(token: str, jwks: dict, audience: str) -> dict:
    try:
        unverified_header = jwt.get_unverified_header(token)
        
        rsa_key = None
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
                break
        
        if not rsa_key:
            raise HTTPException(
                status_code=401,
                detail="Invalid token: key not found"
            )
        
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            audience=audience
        )
        
        return payload
        
    except JWTError as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid token: {str(e)}"
        )


async def get_current_user(
    request: Request,
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    settings: Annotated[Settings, Depends(get_settings)]
) -> UserCtx:
    # In development, use a mock user to bypass JWT verification issues
    if settings.app_env == "dev":
        user_ctx = UserCtx(user_id="12345678-1234-1234-1234-123456789012")
        request.state.user = user_ctx
        return user_ctx
    
    token = credentials.credentials
    
    try:
        jwks = await fetch_jwks(settings.supabase_jwks_url)
        payload = verify_jwt_token(token, jwks, settings.supabase_audience)
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Token missing user ID (sub claim)"
            )
        
        user_ctx = UserCtx(user_id=user_id)
        request.state.user = user_ctx
        return user_ctx
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Authentication failed: {str(e)}"
        )