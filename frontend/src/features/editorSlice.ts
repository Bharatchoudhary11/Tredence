import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type EditorStatus = "idle" | "connecting" | "connected";

export interface EditorState {
  roomId?: string;
  code: string;
  status: EditorStatus;
}

const initialState: EditorState = {
  code: "",
  status: "idle",
};

const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    setRoomId(state, action: PayloadAction<string | undefined>) {
      state.roomId = action.payload;
    },
    setCode(state, action: PayloadAction<string>) {
      state.code = action.payload;
    },
    applyRemoteCode(state, action: PayloadAction<string>) {
      state.code = action.payload;
    },
    setStatus(state, action: PayloadAction<EditorStatus>) {
      state.status = action.payload;
    },
    reset(state) {
      state.code = "";
      state.status = "idle";
      state.roomId = undefined;
    },
  },
});

export const { setRoomId, setCode, applyRemoteCode, setStatus, reset } =
  editorSlice.actions;
export default editorSlice.reducer;
