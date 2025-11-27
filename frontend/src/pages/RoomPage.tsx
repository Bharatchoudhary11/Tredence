import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import CodeEditor from "../components/CodeEditor";
import {
  applyRemoteCode,
  setCode,
  setRoomId,
  setStatus,
} from "../features/editorSlice";
import { useAutocomplete } from "../hooks/useAutocomplete";
import { useAppDispatch, useAppSelector } from "../hooks/store";
import { apiBaseUrl, wsBaseUrl } from "../utils/config";

const READY_STATE_OPEN = 1;

export default function RoomPage() {
  const { roomId } = useParams();
  const dispatch = useAppDispatch();
  const { code, status } = useAppSelector((state) => state.editor);
  const wsRef = useRef<WebSocket | null>(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const { suggestion, loading } = useAutocomplete(code, cursorPosition);
  const [validRoom, setValidRoom] = useState(true);

  useEffect(() => {
    if (!roomId) return;
    dispatch(setRoomId(roomId));
    let cancelled = false;

    const verifyAndConnect = async () => {
      dispatch(setStatus("connecting"));
      setConnectionError(null);
      try {
        const response = await fetch(`${apiBaseUrl}/rooms/${roomId}`);
        if (!response.ok) {
          throw new Error("Room not found");
        }
        setValidRoom(true);
      } catch (error) {
        if (!cancelled) {
          setValidRoom(false);
          setConnectionError("Room not found. Create a room first.");
          dispatch(setStatus("idle"));
        }
        return;
      }

      const connection = new WebSocket(`${wsBaseUrl}/ws/${roomId}`);
      wsRef.current = connection;

      connection.onopen = () => dispatch(setStatus("connected"));
      connection.onclose = () => {
        dispatch(setStatus("idle"));
        wsRef.current = null;
      };
      connection.onerror = () => {
        setConnectionError("WebSocket connection failed.");
        dispatch(setStatus("idle"));
      };
      connection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "sync" || data.type === "code_update") {
            dispatch(applyRemoteCode(data.code ?? ""));
          }
        } catch (error) {
          console.error("Malformed message", error);
        }
      };
    };

    verifyAndConnect();

    return () => {
      cancelled = true;
      wsRef.current?.close();
      wsRef.current = null;
      dispatch(setStatus("idle"));
    };
  }, [dispatch, roomId]);

  const sendCodeUpdate = (value: string, cursor: number) => {
    setCursorPosition(cursor);
    dispatch(setCode(value));
    const ws = wsRef.current;
    if (ws && ws.readyState === READY_STATE_OPEN) {
      ws.send(
        JSON.stringify({
          type: "code_update",
          code: value,
          cursorPosition: cursor,
        }),
      );
    }
  };

  if (!roomId) {
    return (
      <main className="room-page">
        <p>Room ID missing. Return <Link to="/">home</Link>.</p>
      </main>
    );
  }

  return (
    <main className="room-page">
      <header className="room-header">
        <div>
          <p className="tag">Room {roomId}</p>
          <h2>Collaborate live</h2>
          <p>Share this link so another developer can join.</p>
          <code>{`${window.location.origin}/room/${roomId}`}</code>
        </div>
        <Link to="/">Back home</Link>
      </header>

      {connectionError && <p className="error">{connectionError}</p>}

      {validRoom ? (
        <CodeEditor
          code={code}
          status={status}
          suggestion={loading ? "Loading suggestion…" : suggestion}
          onChange={sendCodeUpdate}
          onCursorChange={setCursorPosition}
        />
      ) : (
        <p className="error">
          Unable to join this room. Please double-check the ID or create a new
          room from the home page.
        </p>
      )}
    </main>
  );
}
