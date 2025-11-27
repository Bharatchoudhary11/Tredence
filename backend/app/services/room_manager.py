from __future__ import annotations

from collections import defaultdict

from fastapi import WebSocket


class RoomManager:
    def __init__(self) -> None:
        self.rooms: dict[str, set[WebSocket]] = defaultdict(set)

    async def connect(self, room_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.rooms[room_id].add(websocket)

    def disconnect(self, room_id: str, websocket: WebSocket) -> None:
        if room_id in self.rooms:
            self.rooms[room_id].discard(websocket)
            if not self.rooms[room_id]:
                self.rooms.pop(room_id, None)

    async def broadcast(
        self, room_id: str, message: dict, sender: WebSocket | None = None
    ) -> None:
        recipients = self.rooms.get(room_id, set()).copy()
        for connection in recipients:
            if sender is not None and connection is sender:
                continue
            await connection.send_json(message)


manager = RoomManager()
