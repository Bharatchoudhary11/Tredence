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

## Development Notes
- Backend folders are organized by concern (`app/api`, `app/services`, `app/db`, etc.) to keep routers and business logic separate.
- WebSocket broadcasts follow a last-write-wins strategy while persisting the latest code back to Postgres.
- Autocomplete suggestions are intentionally simple but the endpoint contract mirrors what a real model could use later.
