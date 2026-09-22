from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

app = FastAPI()

async def dummy_guard(request: Request, call_next):
    print("Guard started")
    response = await call_next(request)
    print("Guard ended")
    return response

app.middleware("http")(dummy_guard)
app.add_middleware(CORSMiddleware, allow_origins=["*"])

print([m.cls.__name__ for m in app.user_middleware])
