import React, { useState, useEffect } from "react";
import { useDJPlayer } from "./hooks/useDJPlayer";

function App() {
  // Put your songs in the public/ folder (e.g. public/song1.mp3, public/song2.mp3)
  const songs = ["/NOKIA.mp3", "/GP.mp3"];

  const {
    play,
    pause,
    stop,
    nextSong,
    setVolume,
    upBass,
    toggleNightcore,
    isPlaying,
    nightcore,
    audioEl,
  } = useDJPlayer(songs);

  const [volume, setVol] = useState(1);
  const [bass, setBass] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // keep slider updated
  useEffect(() => {
    if (!audioEl) return;

    const timeHandler = () => setCurrentTime(audioEl.currentTime);
    const durHandler = () => setDuration(audioEl.duration || 0);

    audioEl.addEventListener("timeupdate", timeHandler);
    audioEl.addEventListener("loadedmetadata", durHandler);

    return () => {
      audioEl.removeEventListener("timeupdate", timeHandler);
      audioEl.removeEventListener("loadedmetadata", durHandler);
    };
  }, [audioEl]);

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVol(v);
    setVolume(v);
  };

  const handleBass = (e) => {
    const b = parseFloat(e.target.value);
    setBass(b);
    upBass(b);
  };

  const handleSeek = (e) => {
    if (!audioEl) return;
    const s = parseFloat(e.target.value);
    audioEl.currentTime = s;
    setCurrentTime(s);
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>🎵 DJ Player</h2>

      <button onClick={isPlaying ? pause : play}>
        {isPlaying ? "⏸ Pause" : "▶ Play"}
      </button>
      <button onClick={stop}>⏹ Stop</button>
      <button onClick={nextSong}>⏭ Next</button>
      <button onClick={toggleNightcore}>
        {nightcore ? "🌙 Nightcore On" : "☀ Normal"}
      </button>

      <div style={{ marginTop: 20 }}>
        <label>
          Volume
          <input
            type="range"
            min="0"
            max="2"
            step="0.01"
            value={volume}
            onChange={handleVolume}
          />
        </label>
      </div>

      <div>
        <label>
          Bass
          <input
            type="range"
            min="-30"
            max="30"
            step="1"
            value={bass}
            onChange={handleBass}
          />
        </label>
      </div>

      <div style={{ marginTop: 20 }}>
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          style={{ width: "100%" }}
        />
        <div>
          {currentTime.toFixed(1)} / {duration.toFixed(1)} sec
        </div>
      </div>
    </div>
  );
}

export default App;
