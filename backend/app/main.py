from __future__ import annotations

import uuid
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.routes import autocomplete, rooms
from app.core.config import settings
from app.db import models
from app.db.session import AsyncSessionLocal, get_session, init_db
from app.services.room_manager import manager


@asynccontextmanager
async def lifespan(_: FastAPI):
    await init_db()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allow_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rooms.router)
app.include_router(autocomplete.router)


async def _ensure_room(room_uuid: uuid.UUID, session: AsyncSession) -> models.Room | None:
    return await session.get(models.Room, room_uuid)


@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, session: AsyncSession = Depends(get_session)):
    try:
        room_uuid = uuid.UUID(room_id)
    except ValueError:
        await websocket.close(code=status.WS_1003_UNSUPPORTED_DATA)
        return

    room = await _ensure_room(room_uuid, session)
    if not room:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(room_id, websocket)
    await websocket.send_json({"type": "sync", "code": room.code or ""})

    try:
        while True:
            payload = await websocket.receive_json()
            if payload.get("type") != "code_update":
                continue
            code = payload.get("code", "")
            async with AsyncSessionLocal() as write_session:
                db_room = await write_session.get(models.Room, room_uuid)
                if not db_room:
                    await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                    return
                db_room.code = code
                write_session.add(db_room)
                await write_session.commit()
            await manager.broadcast(
                room_id,
                {"type": "code_update", "code": code},
                sender=websocket,
            )
    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)
    except Exception:
        manager.disconnect(room_id, websocket)
        raise
