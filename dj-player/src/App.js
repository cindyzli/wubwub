import React, { useState } from "react";
import { useDJPlayer } from "./hooks/useDJPlayer";
import Downloader from "./Downloader";

export default function App() {
  // Define songs state once, at the top of your component
  const [songs, setSongs] = useState([
    "/NOKIA.mp3",
    "/GP.mp3"
  ]);

  const {
    play,
    pause,
    stop,
    nextSong,
    setVolume,
    setBass,
    toggleNightcore,
  } = useDJPlayer(songs);

  // Helper to add a new song to playlist
  function addSong(newSong) {
    setSongs((prev) => [...prev, newSong]);
  }

  return (
    <div>
      <h1>DJ Player</h1>

      {/* Downloader will call addSong when a new MP3 is ready */}
      <Downloader onAddSong={addSong} />

      <button onClick={play}>Play</button>
      <button onClick={pause}>Pause</button>
      <button onClick={stop}>Stop</button>
      <button onClick={nextSong}>Next</button>
      <button onClick={toggleNightcore}>Nightcore</button>

      <input
        type="range"
        min="0"
        max="2"
        step="0.01"
        onChange={(e) => setVolume(e.target.value)}
      />

      <input
        type="range"
        min="-30"
        max="30"
        step="1"
        onChange={(e) => setBass(e.target.value)}
      />
    </div>
  );
}
