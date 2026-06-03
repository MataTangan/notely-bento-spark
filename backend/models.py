"""
Notely Backend — extended database models
New in Step 2-5: is_premium, push_subscription on User; NotificationLog table
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


# ─── Users ────────────────────────────────────────────────────────────────────

class UserBase(SQLModel):
    email: str = Field(index=True, unique=True)
    display_name: str
    avatar_url: Optional[str] = None
    # Premium flag — updated by billing endpoint on successful payment
    is_premium: bool = Field(default=False)


class User(UserBase, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    # Web Push subscription JSON (stringified) — saved when user grants permission
    push_subscription: Optional[str] = Field(default=None)


class UserCreate(SQLModel):
    email: str
    display_name: str
    avatar_url: Optional[str] = None


class UserRead(SQLModel):
    id: int
    email: str
    display_name: str
    avatar_url: Optional[str]
    is_premium: bool
    created_at: datetime


# ─── Tasks ────────────────────────────────────────────────────────────────────

class TaskBase(SQLModel):
    title: str
    meta: Optional[str] = None          # e.g. "Today · 6:00 PM"
    priority: str = "medium"            # "high" | "medium" | "low"
    folder: Optional[str] = None        # e.g. "Math", "Physics"
    is_done: bool = False
    due_at: Optional[datetime] = None


class Task(TaskBase, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class TaskCreate(TaskBase):
    user_id: Optional[int] = None


class TaskUpdate(SQLModel):
    title: Optional[str] = None
    meta: Optional[str] = None
    priority: Optional[str] = None
    folder: Optional[str] = None
    is_done: Optional[bool] = None
    due_date: Optional[datetime] = None


class TaskRead(TaskBase):
    id: int
    user_id: Optional[int]
    created_at: datetime
    updated_at: datetime


# ─── Schedule Events ──────────────────────────────────────────────────────────

class ScheduleEventBase(SQLModel):
    time: str
    title: str
    room: Optional[str] = None
    color: Optional[str] = None
    day_of_week: int = 1
    is_current: bool = False
    is_deadline: bool = False


class ScheduleEvent(ScheduleEventBase, table=True):
    __tablename__ = "schedule_events"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ScheduleEventCreate(ScheduleEventBase):
    user_id: Optional[int] = None


class ScheduleEventRead(ScheduleEventBase):
    id: int
    user_id: Optional[int]
    created_at: datetime


# ─── Subscriptions ────────────────────────────────────────────────────────────

class SubscriptionBase(SQLModel):
    plan: str = "free"                  # "free" | "pro"
    status: str = "active"             # "active" | "cancelled" | "past_due"
    renews_at: Optional[datetime] = None


class Subscription(SubscriptionBase, table=True):
    __tablename__ = "subscriptions"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", unique=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SubscriptionCreate(SubscriptionBase):
    user_id: int


class SubscriptionRead(SubscriptionBase):
    id: int
    user_id: int
    created_at: datetime


# ─── Notification Log ─────────────────────────────────────────────────────────
# Tracks which push notifications have been sent to avoid duplicates

class NotificationLog(SQLModel, table=True):
    __tablename__ = "notification_log"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    task_id: int = Field(foreign_key="tasks.id")
    # Channel: "push" | "in_app"
    channel: str = Field(default="push")
    sent_at: datetime = Field(default_factory=datetime.utcnow)
