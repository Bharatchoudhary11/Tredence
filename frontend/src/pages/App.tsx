import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiBaseUrl } from "../utils/config";

export default function App() {
  const navigate = useNavigate();
  const [joinRoomId, setJoinRoomId] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRoom = async () => {
    setCreating(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/rooms`, { method: "POST" });
      if (!response.ok) {
        throw new Error("Unable to create a room");
      }
      const data = await response.json();
      navigate(`/room/${data.roomId}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = (event: FormEvent) => {
    event.preventDefault();
    if (!joinRoomId.trim()) return;
    navigate(`/room/${joinRoomId.trim()}`);
  };

  return (
    <main className="home">
      <section className="hero">
        <div>
          <p className="tag">Prototype</p>
          <h1>Pair-program in seconds</h1>
          <p>
            Spin up a collaborative room and share the URL. Your edits and AI
            helper show up instantly.
          </p>
          <div className="actions">
            <button onClick={createRoom} disabled={creating}>
              {creating ? "Creating..." : "Create new room"}
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </div>
        <form className="join-card" onSubmit={handleJoin}>
          <label htmlFor="room">Join an existing room</label>
          <input
            id="room"
            type="text"
            placeholder="Room ID"
            value={joinRoomId}
            onChange={(event) => setJoinRoomId(event.target.value)}
          />
          <button type="submit" disabled={!joinRoomId.trim()}>
            Join room
          </button>
        </form>
      </section>
    </main>
  );
}
