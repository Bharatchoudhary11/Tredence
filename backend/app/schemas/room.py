from uuid import UUID

from pydantic import BaseModel


class RoomResponse(BaseModel):
    roomId: UUID
