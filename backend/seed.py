"""
Notely Backend — seed data for local development
Run once:  python seed.py
"""

from datetime import datetime, timedelta, UTC

from database import create_db_and_tables, engine
from models import (
    ScheduleEvent,
    Subscription,
    Task,
    User,
)
from sqlmodel import Session


def seed() -> None:
    create_db_and_tables()

    with Session(engine) as session:
        # ── Demo user ─────────────────────────────────────────────────────────
        user = User(email="demo@notely.app", display_name="Demo Student")
        session.add(user)
        session.commit()
        session.refresh(user)

        # ── Subscription ──────────────────────────────────────────────────────
        sub = Subscription(
            user_id=user.id,
            plan="free",
            status="active",
            renews_at=datetime.now(UTC) + timedelta(days=30),
        )
        session.add(sub)

        # ── Tasks ─────────────────────────────────────────────────────────────
        tasks_data = [
            Task(
                user_id=user.id,
                title="Submit Calculus pset #6",
                meta="Today · 6:00 PM",
                priority="high",
                folder="Math",
                due_at=datetime.now(UTC).replace(hour=18, minute=0, second=0),
            ),
            Task(
                user_id=user.id,
                title="Lab report — Newton's laws",
                meta="Tomorrow · 9:00 AM",
                priority="high",
                folder="Physics",
                due_at=datetime.now(UTC) + timedelta(days=1),
            ),
            Task(
                user_id=user.id,
                title="Read Ch. 4 — Sociology",
                meta="Wed · before class",
                priority="medium",
                folder="Sociology",
            ),
            Task(
                user_id=user.id,
                title="Group meet: Final project",
                meta="Thu · 4:00 PM",
                priority="medium",
                folder="CS101",
            ),
            Task(
                user_id=user.id,
                title="Email Prof. Adams about extension",
                meta="This week",
                priority="low",
                folder="Admin",
            ),
            Task(
                user_id=user.id,
                title="Tidy lecture notes",
                meta="Whenever",
                priority="low",
                folder="Personal",
            ),
        ]
        session.add_all(tasks_data)

        # ── Schedule events ───────────────────────────────────────────────────
        events_data = [
            ScheduleEvent(
                user_id=user.id,
                time="09:00",
                title="Calculus II",
                room="A101",
                color="bg-orange-soft text-orange",
                day_of_week=1,
            ),
            ScheduleEvent(
                user_id=user.id,
                time="11:00",
                title="Physics II",
                room="B204",
                color="bg-yellow-soft text-orange",
                day_of_week=1,
                is_current=True,
            ),
            ScheduleEvent(
                user_id=user.id,
                time="13:30",
                title="Lunch + walk",
                room="Quad",
                color="bg-mint-soft text-mint",
                day_of_week=1,
            ),
            ScheduleEvent(
                user_id=user.id,
                time="15:00",
                title="Sociology lecture",
                room="C310",
                color="bg-purple-soft text-purple",
                day_of_week=1,
            ),
            ScheduleEvent(
                user_id=user.id,
                time="18:00",
                title="Calculus pset due",
                room="Online",
                color="bg-red-soft text-red",
                day_of_week=1,
                is_deadline=True,
            ),
        ]
        session.add_all(events_data)
        session.commit()

    print("[OK] Seed complete -- demo user, tasks, schedule events, and subscription created.")


if __name__ == "__main__":
    seed()
