import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useDJPlayer } from "./hooks/useDJPlayer";
import Downloader from "./Downloader";

export default function App() {
  const [songs, setSongs] = useState([]);
  const bassSliderRef = useRef(null);  // 👈 Track the slider element
  const {
    play,
    pause,
    stop,
    nextSong,
    setVolume,
    setBass,
    toggleNightcore,
  } = useDJPlayer(songs);

  useEffect(() => {
    const socket = io("http://localhost:5001"); // adjust if needed

    socket.on("connect", () => {
      console.log("✅ Connected to WebSocket server");
    });

    socket.on("gesture", (data) => {
      console.log("👋 Gesture received:", data);

      // Handle gesture → increase bass
      if (data.gesture === "wave") {
        if (bassSliderRef.current) {
          const current = parseFloat(bassSliderRef.current.value);
          const next = Math.min(current + 5, 30);  // cap at 30
          bassSliderRef.current.value = next;
          setBass(next);  // call the DJ hook
          console.log(`🎚️ Bass increased to ${next}`);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  function addSong(newSong) {
    console.log("🎵 Adding new song:", newSong);
    setSongs((prev) => [...prev, newSong]);
  }

  return (
    <div>
      <h1>DJ Player</h1>
      <Downloader onAddSong={addSong} />

      <button onClick={() => play()}>Play</button>
      <button onClick={() => pause()}>Pause</button>
      <button onClick={() => stop()}>Stop</button>
      <button onClick={() => nextSong()}>Next</button>
      <button onClick={toggleNightcore}>Nightcore</button>

      <input
        type="range"
        min="0"
        max="2"
        step="0.01"
        onChange={(e) => setVolume(parseFloat(e.target.value))}
      />

      <input
        ref={bassSliderRef}
        type="range"
        min="-30"
        max="30"
        step="1"
        defaultValue="0"
        onChange={(e) => setBass(parseFloat(e.target.value))}
      />
    </div>
  );
}