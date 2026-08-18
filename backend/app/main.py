from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.api.routes import problems, solve_logs, schedule, whiteboard, vault

app = FastAPI(title="LeetCode Grind", debug=settings.debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(problems.router, prefix="/api")
app.include_router(solve_logs.router, prefix="/api")
app.include_router(schedule.router, prefix="/api")
app.include_router(whiteboard.router, prefix="/api")
app.include_router(vault.router, prefix="/api")


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/api/health")
def health():
    return {"status": "ok"}
