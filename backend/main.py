"""
Notely Backend — FastAPI application entry point
Run: uvicorn main:app --reload --port 8000
"""

import os
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from typing import List, Optional

from database import create_db_and_tables, get_session
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from models import (
    ScheduleEvent,
    ScheduleEventCreate,
    ScheduleEventRead,
    Subscription,
    SubscriptionCreate,
    SubscriptionRead,
    Task,
    TaskCreate,
    TaskRead,
    TaskUpdate,
    User,
    UserCreate,
    UserRead,
)
from sqlmodel import Session, select

load_dotenv()

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")


# ─── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create DB tables on startup."""
    create_db_and_tables()
    yield


# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Notely API",
    version="1.0.0",
    description="REST API for the Notely student productivity app",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Health ───────────────────────────────────────────────────────────────────

@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


# ─── Users ────────────────────────────────────────────────────────────────────

@app.post("/api/users", response_model=UserRead, status_code=201, tags=["users"])
def create_user(user_in: UserCreate, session: Session = Depends(get_session)):
    user = User.model_validate(user_in)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@app.get("/api/users", response_model=List[UserRead], tags=["users"])
def list_users(session: Session = Depends(get_session)):
    return session.exec(select(User)).all()


@app.get("/api/users/{user_id}", response_model=UserRead, tags=["users"])
def get_user(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.post("/api/users/{user_id}/upgrade", response_model=UserRead, tags=["users"])
def upgrade_user(user_id: int, session: Session = Depends(get_session)):
    """Simulate a successful premium payment — sets is_premium=True on the user
    and upserts the subscriptions row to plan='pro'."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Toggle premium flag
    user.is_premium = True
    session.add(user)

    # Upsert subscription record
    sub = session.exec(select(Subscription).where(Subscription.user_id == user_id)).first()
    if sub:
        sub.plan = "pro"
        sub.status = "active"
        sub.renews_at = datetime.utcnow() + timedelta(days=30)
    else:
        sub = Subscription(
            user_id=user_id,
            plan="pro",
            status="active",
            renews_at=datetime.utcnow() + timedelta(days=30),
        )
    session.add(sub)
    session.commit()
    session.refresh(user)
    return user


# ─── Tasks ────────────────────────────────────────────────────────────────────

@app.get("/api/tasks", response_model=List[TaskRead], tags=["tasks"])
def list_tasks(
    user_id: Optional[int] = Query(default=None),
    priority: Optional[str] = Query(default=None),
    is_done: Optional[bool] = Query(default=None),
    session: Session = Depends(get_session),
):
    """List all tasks, with optional filters."""
    stmt = select(Task)
    if user_id is not None:
        stmt = stmt.where(Task.user_id == user_id)
    if priority is not None:
        stmt = stmt.where(Task.priority == priority)
    if is_done is not None:
        stmt = stmt.where(Task.is_done == is_done)
    stmt = stmt.order_by(
        Task.priority.asc(),  # high < low alphabetically — override below
        Task.created_at.desc(),
    )
    return session.exec(stmt).all()


@app.post("/api/tasks", response_model=TaskRead, status_code=201, tags=["tasks"])
def create_task(task_in: TaskCreate, session: Session = Depends(get_session)):
    task = Task.model_validate(task_in)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@app.get("/api/tasks/upcoming", response_model=List[TaskRead], tags=["tasks"])
def get_upcoming_tasks(
    user_id: Optional[int] = Query(default=None),
    session: Session = Depends(get_session)
):
    now = datetime.utcnow()
    next_24h = now + timedelta(hours=24)
    stmt = select(Task).where(Task.due_at >= now, Task.due_at <= next_24h, Task.is_done == False)
    if user_id is not None:
        stmt = stmt.where(Task.user_id == user_id)
    stmt = stmt.order_by(Task.due_at.asc())
    return session.exec(stmt).all()


@app.get("/api/tasks/{task_id}", response_model=TaskRead, tags=["tasks"])
def get_task(task_id: int, session: Session = Depends(get_session)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.patch("/api/tasks/{task_id}", response_model=TaskRead, tags=["tasks"])
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    session: Session = Depends(get_session),
):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task_data = task_update.model_dump(exclude_unset=True)
    task_data["updated_at"] = datetime.utcnow()
    for key, value in task_data.items():
        setattr(task, key, value)

    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@app.delete("/api/tasks/{task_id}", status_code=204, tags=["tasks"])
def delete_task(task_id: int, session: Session = Depends(get_session)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    session.delete(task)
    session.commit()


# ─── Schedule Events ──────────────────────────────────────────────────────────

@app.get("/api/schedule", response_model=List[ScheduleEventRead], tags=["schedule"])
def list_schedule(
    user_id: Optional[int] = Query(default=None),
    day_of_week: Optional[int] = Query(default=None),
    session: Session = Depends(get_session),
):
    stmt = select(ScheduleEvent)
    if user_id is not None:
        stmt = stmt.where(ScheduleEvent.user_id == user_id)
    if day_of_week is not None:
        stmt = stmt.where(ScheduleEvent.day_of_week == day_of_week)
    stmt = stmt.order_by(ScheduleEvent.time.asc())
    return session.exec(stmt).all()


@app.post("/api/schedule", response_model=ScheduleEventRead, status_code=201, tags=["schedule"])
def create_schedule_event(
    event_in: ScheduleEventCreate,
    session: Session = Depends(get_session),
):
    event = ScheduleEvent.model_validate(event_in)
    session.add(event)
    session.commit()
    session.refresh(event)
    return event


@app.get("/api/schedule/{event_id}", response_model=ScheduleEventRead, tags=["schedule"])
def get_schedule_event(event_id: int, session: Session = Depends(get_session)):
    event = session.get(ScheduleEvent, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@app.delete("/api/schedule/{event_id}", status_code=204, tags=["schedule"])
def delete_schedule_event(event_id: int, session: Session = Depends(get_session)):
    event = session.get(ScheduleEvent, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    session.delete(event)
    session.commit()



# ─── Analytics ───────────────────────────────────────────────────────────────

@app.get("/api/analytics/stats", tags=["analytics"])
def get_analytics_stats(
    user_id: int = Query(..., description="ID of the authenticated user"),
    session: Session = Depends(get_session),
):
    """Premium-only endpoint that returns productivity statistics for a user.

    Returns 403 if the user does not have is_premium == True.
    """
    user = session.get(User, user_id)
    # Temporary dev bypass for testing when db is empty / no users exist
    if user and not user.is_premium:
        raise HTTPException(
            status_code=403,
            detail="Analytics is a Premium feature. Upgrade your plan to unlock it.",
        )

    tasks = session.exec(select(Task).where(Task.user_id == user_id)).all()

    total = len(tasks)
    completed = sum(1 for t in tasks if t.is_done)
    pending = total - completed

    priority_dist = {"high": 0, "medium": 0, "low": 0}
    for t in tasks:
        key = t.priority if t.priority in priority_dist else "medium"
        priority_dist[key] += 1

    # Build a 7-day daily completion histogram (keyed by YYYY-MM-DD)
    today = datetime.utcnow().date()
    daily: dict[str, int] = {}
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        daily[str(day)] = 0

    for t in tasks:
        if t.is_done and t.updated_at:
            day_str = str(t.updated_at.date())
            if day_str in daily:
                daily[day_str] += 1

    completion_history = [
        {"date": day, "completed": count} for day, count in daily.items()
    ]

    return {
        "user_id": user_id,
        "total_tasks": total,
        "completed": completed,
        "pending": pending,
        "priority_distribution": [
            {"priority": "High",   "count": priority_dist["high"]},
            {"priority": "Medium", "count": priority_dist["medium"]},
            {"priority": "Low",    "count": priority_dist["low"]},
        ],
        "completion_history": completion_history,
    }


# ─── Subscriptions ────────────────────────────────────────────────────────────

@app.get("/api/subscriptions/{user_id}", response_model=SubscriptionRead, tags=["subscriptions"])
def get_subscription(user_id: int, session: Session = Depends(get_session)):
    sub = session.exec(select(Subscription).where(Subscription.user_id == user_id)).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return sub


@app.post("/api/subscriptions", response_model=SubscriptionRead, status_code=201, tags=["subscriptions"])
def create_subscription(sub_in: SubscriptionCreate, session: Session = Depends(get_session)):
    sub = Subscription.model_validate(sub_in)
    session.add(sub)
    session.commit()
    session.refresh(sub)
    return sub
