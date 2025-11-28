# Tradance Pair Programming Prototype

This project contains a FastAPI backend and a React/TypeScript frontend that together implement a lightweight real-time pair-programming experience with a mocked AI autocomplete helper.

## Backend (FastAPI)

### Features
- `POST /rooms` creates a new room persisted in Postgres and returns the `roomId`.
- `POST /autocomplete` accepts `{ code, cursorPosition, language }` and returns a deterministic suggestion to mimic AI autocompletion.
- `WebSocket /ws/{roomId}` keeps room participants synchronized. Updates are written back to Postgres to maintain room state.

### Running locally
1. Create and activate a virtual environment inside `backend/`.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Ensure a Postgres instance is reachable and add a `.env` file inside `backend/` with values that match your database setup, for example:
   ```
   DATABASE_URL=postgresql+asyncpg://<user>:<password>@<host>:<port>/<database>
   APP_NAME=Pair Programming App
   ALLOW_ORIGINS=["http://localhost:5173","http://localhost:3000"]
   ```
4. Start the API:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
5. Optionally fetch the most recently used room (after at least one exists):
   ```bash
   curl http://127.0.0.1:8000/rooms/latest
   ```

## Frontend (React + Vite)

### Features
- Home page lets you create a room (calls the API) or join by ID.
- Room page opens a WebSocket for real-time collaboration and shows mocked autocomplete suggestions when typing pauses.
- Redux Toolkit stores the current room/code state.

### Running locally
1. From `frontend/`, install dependencies (Node 18+ recommended):
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. By default the UI calls `http://localhost:8000`. Override via `VITE_API_BASE_URL`/`VITE_WS_BASE_URL`.

## Architecture & Design Notes
- Backend folders are organized by concern (`app/api`, `app/services`, `app/db`, etc.) to keep routers and business logic separate.
- SQLAlchemy (async) models persist each room’s code; the WebSocket loop updates Postgres and broadcasts to peers via an in-memory `RoomManager`.
- The frontend uses Redux Toolkit to keep editor state and WebSocket events in sync across components, while a small hook handles debounced autocomplete calls.
- Autocomplete is mocked with deterministic heuristics so the API contract mirrors what a real model could use later without external dependencies.

## Improvements & Limitations
- **Mock AI**: Suggestions are rule-based and deterministic; integrating a true LLM (or expanding heuristics) would provide smarter completions.
- **Presence & conflicts**: Only last-write-wins syncing exists. Adding operational transforms/CRDTs and user presence indicators would improve collaboration.
- **Persistence**: Postgres stores only the latest code. Tracking history or diffs would enable undo/versioning.
- **Auth & security**: Rooms are public and unauthenticated. Introducing optional auth or expiring room tokens could protect sessions.
