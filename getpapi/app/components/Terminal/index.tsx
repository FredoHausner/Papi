"use client";

import {useEffect, useRef, useState} from "react";

interface TerminalProps {
  logs: string[];
  onCommand: (cmd: string) => void;
  shortcuts?: Record<string, () => void>;
}

export default function Terminal({logs, onCommand, shortcuts}: TerminalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState({x: 0, y: 0});
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({x: 0, y: 0});

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true);
    setOffset({x: e.clientX - position.x, y: e.clientY - position.y});
  };

  useEffect(() => {
    if (!dragging) return;
    const handleMouseMove = (e: MouseEvent) =>
      setPosition({x: e.clientX - offset.x, y: e.clientY - offset.y});
    const handleMouseUp = () => setDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, offset]);

  useEffect(() => {
    const focusInput = () => inputRef.current?.focus();
    focusInput();
    window.addEventListener("click", focusInput);
    return () => window.removeEventListener("click", focusInput);
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({
      top: logRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [logs]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey) return;
      const key = e.key.toLowerCase();
      if (shortcuts?.[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cmd = inputRef.current?.value?.trim();
    if (!cmd) return;
    onCommand(cmd);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div
        className="absolute border border-green-500 w-[800px] h-[500px] bg-black/90 rounded-sm shadow-[0_0_20px_rgba(0,255,0,0.4)] flex flex-col font-mono text-green-400"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: dragging ? "none" : "transform 0.1s ease-out",
        }}
      >
        <div
          className="bg-green-600 text-black text-center font-bold uppercase py-1 cursor-move select-none"
          onMouseDown={handleMouseDown}
        >
          Papi.OS Terminal
        </div>

        <div
          ref={logRef}
          className="flex-1 px-4 py-2 text-sm leading-relaxed whitespace-pre-wrap overflow-y-scroll scrollbar-hide"
        >
          {logs.map((line, i) => (
            <div key={i}>{line}</div>
          ))}

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 mt-1"
          >
            <span className="text-green-500">{">"}</span>
            <input
              ref={inputRef}
              type="text"
              spellCheck={false}
              autoFocus
              className="flex-1 bg-transparent outline-none text-green-400 caret-green-400"
              placeholder="Type a command..."
              style={{fontFamily: "inherit", fontSize: "inherit"}}
            />
          </form>
        </div>

        <div className="border-t border-green-700 px-4 py-1 text-xs text-green-300 flex gap-6">
          <span>^G Google</span>
          <span>^K Clear</span>
        </div>
      </div>
    </div>
  );
}
