import React, { useState, useEffect } from "react";
import { useDJPlayer } from "./hooks/useDJPlayer";
import Downloader from "./Downloader";

export default function App() {
  // Start with no songs
  const [songs, setSongs] = useState([]);

  const {
    play,
    pause,
    stop,
    nextSong,
    setVolume,
    setBass,
    toggleNightcore,
  } = useDJPlayer(songs);

  // Add new song (same idea as before, but called by Downloader)
  function addSong(newSong) {
    console.log("🎵 Adding new song:", newSong);
    setSongs((prev) => [...prev, newSong]);
  }

  return (
    <div>
      <h1>DJ Player</h1>

      {/* Downloader will call addSong when Flask finishes download */}
      <Downloader onAddSong={addSong} />

      <button onClick={() => { 
  console.log("▶️ Play clicked. Playlist =", songs); 
  play(); 
}}>Play</button>

<button onClick={() => { 
  console.log("⏸ Pause clicked. Index =", songs.length > 0 ? songs.length - 1 : "none"); 
  pause(); 
}}>Pause</button>

<button onClick={() => { 
  console.log("⏹ Stop clicked"); 
  stop(); 
}}>Stop</button>

<button onClick={() => { 
  console.log("⏭ Next clicked"); 
  nextSong(); 
}}>Next</button>

      <button onClick={toggleNightcore}>Nightcore</button>

      <input
        type="range"
        min="0"
        max="2"
        step="0.01"
        onChange={(e) => setVolume(parseFloat(e.target.value))}
      />

      <input
        type="range"
        min="-30"
        max="30"
        step="1"
        onChange={(e) => setBass(parseFloat(e.target.value))}
      />
    </div>
  );
}
