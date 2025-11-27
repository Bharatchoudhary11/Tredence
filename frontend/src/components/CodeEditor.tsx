import { useRef } from "react";

import "./CodeEditor.css";

interface CodeEditorProps {
  code: string;
  onChange: (value: string, cursor: number) => void;
  onCursorChange?: (cursor: number) => void;
  suggestion?: string;
  status: string;
}

export default function CodeEditor({
  code,
  onChange,
  onCursorChange,
  suggestion,
  status,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleChange = () => {
    if (!textareaRef.current) return;
    const { value, selectionStart } = textareaRef.current;
    onChange(value, selectionStart ?? value.length);
  };

  const handleSelect = () => {
    if (!textareaRef.current || !onCursorChange) return;
    onCursorChange(textareaRef.current.selectionStart ?? 0);
  };

  return (
    <div className="editor-wrapper">
      <div className="editor-header">
        <span>Room status: {status}</span>
      </div>
      <textarea
        ref={textareaRef}
        value={code}
        onChange={handleChange}
        onSelect={handleSelect}
        spellCheck={false}
        placeholder="# Start sharing Python code..."
      />
      {suggestion && (
        <div className="suggestion-panel">
          <strong>AI Suggestion</strong>
          <pre>{suggestion}</pre>
        </div>
      )}
    </div>
  );
}
