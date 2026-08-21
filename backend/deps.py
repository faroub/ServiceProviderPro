"""FastAPI dependencies — auth + role guards."""
from typing import Annotated, Optional
import time
import jwt
from fastapi import Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer

from database import db
from schemas import Role
from security import decode_token
from subscription import enforce_lifecycle


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


async def current_user(token: Annotated[Optional[str], Depends(oauth2_scheme)]) -> dict:
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = decode_token(token)
        user_id = payload["sub"]
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    user = await enforce_lifecycle(user)
    if user.get("is_deleted"):
        raise HTTPException(status_code=410, detail="Account has been deleted")
    return user


async def optional_current_user(token: Annotated[Optional[str], Depends(oauth2_scheme)]) -> Optional[dict]:
    if not token:
        return None
    try:
        payload = decode_token(token)
        user_id = payload["sub"]
    except jwt.InvalidTokenError:
        return None
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        return None
    user = await enforce_lifecycle(user)
    if user.get("is_deleted"):
        return None
    return user


def require_role(role: Role):
    async def dep(user: Annotated[dict, Depends(current_user)]) -> dict:
        if user["role"] != role.value:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return dep


def require_admin(user: dict) -> dict:
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")

class IPRateLimiter:
    """Simple in-memory sliding-window rate limiter by IP."""

    def __init__(self, requests_limit: int, window_seconds: int):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        # In a real multi-worker production app, you'd use Redis.
        # This in-memory dict works for single-process uvicorn/gunicorn.
        self.requests_history: dict[str, list[float]] = {}

    async def __call__(self, request: Request):
        # Resolve client IP (supporting reverse proxies)
        xf = request.headers.get("x-forwarded-for")
        if xf:
            ip = xf.split(",")[0].strip()
        else:
            ip = request.client.host if request.client else "unknown"

        now = time.time()
        # Clean up old timestamps
        history = self.requests_history.get(ip, [])
        history = [t for t in history if now - t < self.window_seconds]

        if len(history) >= self.requests_limit:
            raise HTTPException(
                status_code=429, detail="Too many requests. Please try again later."
            )

# Pre-defined rate limiters for auth endpoints
login_limiter = IPRateLimiter(requests_limit=10, window_seconds=60)
registration_limiter = IPRateLimiter(requests_limit=5, window_seconds=3600)
otp_limiter = IPRateLimiter(requests_limit=5, window_seconds=60)


        history.append(now)
        self.requests_history[ip] = history

    return user
