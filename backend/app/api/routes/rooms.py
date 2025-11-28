import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import models
from app.db.session import get_session
from app.schemas.room import RoomResponse

router = APIRouter(prefix="/rooms", tags=["rooms"])


@router.post("", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
async def create_room(session: AsyncSession = Depends(get_session)) -> RoomResponse:
    room = models.Room(id=uuid.uuid4())
    session.add(room)
    await session.commit()
    await session.refresh(room)
    return RoomResponse(roomId=room.id)


@router.get("/latest", response_model=RoomResponse)
async def get_latest_room(session: AsyncSession = Depends(get_session)) -> RoomResponse:
    stmt = select(models.Room).order_by(models.Room.updated_at.desc()).limit(1)
    result = await session.execute(stmt)
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No rooms available")
    return RoomResponse(roomId=room.id)


@router.get("/{room_id}", response_model=RoomResponse)
async def get_room(room_id: uuid.UUID, session: AsyncSession = Depends(get_session)) -> RoomResponse:
    room = await session.get(models.Room, room_id)
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    return RoomResponse(roomId=room.id)
