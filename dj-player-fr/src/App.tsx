import { useState, useEffect } from 'react';
import { io } from "socket.io-client";
import { SpinningCD } from './components/SpinningCD';
import { VerticalSlider } from './components/VerticalSlider';
import { NightcoreSwitch } from './components/NightcoreSwitch';
import { SongQueue } from './components/SongQueue';
import { SoundBites } from './components/SoundBites';
import { FlashingBorder } from './components/FlashingBorder';
import { LEDColorBarV2 } from './components/LEDColorBarV2';
import logo from './img/logo.png';
import { useDJPlayer } from './hooks/useDjPlayer';

// Define Song type
interface Song {
  id: string;
  title: string;
  artist: string;
  duration: string;
  thumbnail: string;
  url: string;
}

// Initialize socket connection
const socket = io("http://localhost:5001");

export default function App() {
  const [isNightMode, setIsNightMode] = useState(false);
  const [bassBoost, setBassBoost] = useState(50);
  const [songQueue, setSongQueue] = useState<Song[]>([]);
  const [ledColor, setLedColor] = useState('#00ffff');

  // DJ Player hook
  const {
    play,
    pause,
    stop,
    nextSong,
    playSongAt,
    setVolume,
    setBass,
    toggleNightcore,
    isPlaying,
    nightcore,
    volume,
    bass,
    audioEl,
  } = useDJPlayer(songQueue.map((s) => s.url));

  // Fetch songs from server
  const fetchSongs = async () => {
    const res = await fetch('http://localhost:5001/download');
    const data = await res.json();

    const fetchedSongs: Song[] = data.songs.map((item: any) => ({
      id: item.id,
      title: item.name,
      artist: item.channel,
      duration: `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, '0')}`,
      thumbnail: item.thumbnail,
      url: item.public_url
    }));

    setSongQueue(fetchedSongs);
  };

  // Initial load + socket gesture handler
  useEffect(() => {
    const initialize = async () => {
      await fetchSongs();
    };

    initialize();

    // Listen for gesture events
    socket.on("gesture", (data) => {
      console.log("Received gesture:", data);

      if (data.action === "adjust_bass" && typeof data.bass === "number") {
        setBassBoost(data.bass); // Update UI slider
        setBass(data.bass);      // Update audio backend
      }

      if (data.action === "adjust_vol" && typeof data.volume === "number") {
        setVolume(data.volume); // Update UI slider
      }

      // Additional gesture types
    });

    return () => {
      socket.off("gesture");
    };
  }, []);

  // Keep local UI in sync with DJPlayer bass state
  useEffect(() => {
    setBassBoost(bass);
  }, [bass]);

  const handleNightcoreToggle = () => {
    toggleNightcore();
    setIsNightMode(!isNightMode);
  };

  const handleAddSong = async (youtubeUrl: string) => {
    const uuid = crypto.randomUUID();
    await fetch("http://localhost:5001/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: youtubeUrl, uuid }),
    });

    await fetchSongs(); // refresh queue
  };

  const handleRemoveSong = (id: string) => {
    setSongQueue(songQueue.filter((song) => song.id !== id));
  };

  const handlePlaySong = (id: string) => {
    const idx = songQueue.findIndex((s) => s.id === id);
    if (idx !== -1) playSongAt(idx);
  };

  const handleSoundBite = (id: string) => {
    console.log('Playing sound bite:', id);
  };

  const themeClass = isNightMode ? 'dj-night-theme' : 'dj-day-theme';

  return (
    <div className={`h-screen w-full ${themeClass} transition-all duration-1000`}>
      <FlashingBorder color={ledColor} isActive={true}>
        <div className="h-full w-full">

          {/* Play/Pause Button */}
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={isPlaying ? pause : play}
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg shadow hover:bg-cyan-600 transition"
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
          </div>

          {/* Header: Queue + Logo */}
          <div className="flex-shrink-0">
            <img src={logo} alt="Wub Wub Logo" className="mx-auto mb-4 w-48" />
            <SongQueue
              queue={songQueue}
              onAddSong={handleAddSong}
              onRemoveSong={handleRemoveSong}
              onPlaySong={handlePlaySong}
            />
          </div>

          {/* DJ Controls Section */}
          <div className="flex-1 flex items-center justify-center">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center w-full max-w-6xl">

              {/* Current Song */}
              <div className="lg:col-span-2 flex justify-center">
                <SpinningCD
                  albumArt={songQueue[0]?.thumbnail}
                  albumTitle={songQueue[0]?.title}
                  artist={songQueue[0]?.artist}
                  isPlaying={isPlaying}
                  size="large"
                />
              </div>

              {/* Control Sliders */}
              <div className="flex justify-center space-x-8">

                <VerticalSlider
                  label="BASS"
                  value={bassBoost}
                  onChange={(val) => {
                    setBassBoost(val);
                    setBass(val);
                  }}
                  color={isNightMode ? 'purple' : 'cyan'}
                />

                <NightcoreSwitch
                  isOn={nightcore}
                  onToggle={handleNightcoreToggle}
                />

                <VerticalSlider
                  label="VOL"
                  value={volume}
                  onChange={setVolume}
                  color={isNightMode ? "purple" : "cyan"}
                />
              </div>

              {/* Next Song */}
              <div className="lg:col-span-2 flex justify-center">
                <SpinningCD
                  albumArt={songQueue[1]?.thumbnail}
                  albumTitle={songQueue[1]?.title}
                  artist={songQueue[1]?.artist}
                  isPlaying={false}
                  size="medium"
                />
              </div>
            </div>
          </div>

          {/* Bottom: LEDs + Sound Bites */}
          <div className="flex gap-8 pb-4 mt-4">
            <LEDColorBarV2 currentColor={ledColor} onColorChange={setLedColor} />
            <SoundBites onTriggerBite={handleSoundBite} />
          </div>
        </div>
      </FlashingBorder>

      {/* Hidden Audio Element */}
      {audioEl && <audio controls src={audioEl.src} className="hidden" />}
    </div>
  );
}