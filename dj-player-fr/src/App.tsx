import { useState, useEffect } from 'react';
import { SpinningCD } from './components/SpinningCD';
import { VerticalSlider } from './components/VerticalSlider';
import { NightcoreSwitch } from './components/NightcoreSwitch';
import { SongQueue } from './components/SongQueue';
import { SoundBites } from './components/SoundBites';
import { FlashingBorder } from './components/FlashingBorder';
import { LEDColorBarV2 } from './components/LEDColorBarV2';
import logo from './img/logo.png';
import { useDJPlayer } from './hooks/useDjPlayer';

interface Song {
  id: string;
  title: string;
  artist: string;
  duration: string;
  thumbnail: string;
  url: string;
}

export default function App() {
  // Theme state
  const [isNightMode, setIsNightMode] = useState(false);
  
  // Audio controls
  const [bassBoost, setBassBoost] = useState(50);

  const fetchSongs = async () => {
    const res = await fetch('http://localhost:5001/download');
    const data = await res.json();
    console.log(data.songs);

    let fetchedSongs: Song[] = data.songs.map((item: any) => ({
      id: item.id,
      title: item.name,
      artist: item.channel,
      duration: `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, '0')}`,
      thumbnail: item.thumbnail,
      url: item.public_url
    }));
    setSongQueue(fetchedSongs);
  };

  // Effects
  useEffect(async () => {
    await fetchSongs();
  }, []);

  // Queue state
  const [songQueue, setSongQueue] = useState<Song[]>([]);

  // 🎧 integrate DJPlayer
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

  // LED state
  const [ledColor, setLedColor] = useState('#00ffff');

  // Handlers
  const handleNightcoreToggle = () => {
    toggleNightcore();
    setIsNightMode(!isNightMode);
  };

  const handleAddSong = async (youtubeUrl: string) => {
    const uuid = crypto.randomUUID();
      console.log("🚀 Sending request to server with URL:", youtubeUrl);
      await fetch("http://localhost:5001/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl, uuid }),
      });

    // Refetch songs from server
    await fetchSongs();
  };

  const handleRemoveSong = (id: string) => {
    setSongQueue(songQueue.filter((song) => song.id !== id));
  };

  const handlePlaySong = (id: string) => {
    const idx = songQueue.findIndex((s) => s.id === id);
    if (idx !== -1) {
      playSongAt(idx);
    }
  };

  const handleSoundBite = (id: string) => {
    console.log('Playing sound bite:', id);
  };

  const themeClass = isNightMode ? 'dj-night-theme' : 'dj-day-theme';

  return (
    <div className={`h-screen w-full ${themeClass} transition-all duration-1000`}>
      <FlashingBorder color={ledColor} isActive={true}>
        <div className="h-full w-full">
          {/* 🔊 Play/Pause button top-left */}
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={isPlaying ? pause : play}
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg shadow hover:bg-cyan-600 transition"
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
          </div>

          {/* Header - Song Queue */}
          <div className="flex-shrink-0">
            <img src={logo} alt="Wub Wub Logo" className="mx-auto mb-4 w-48" />
            <SongQueue
              queue={songQueue}
              onAddSong={handleAddSong}
              onRemoveSong={handleRemoveSong}
              onPlaySong={handlePlaySong}
            />
          </div>

          {/* Main DJ Section */}
          <div className="flex-1 flex items-center justify-center">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center w-full max-w-6xl">
              {/* Current Song CD */}
              <div className="lg:col-span-2 flex justify-center">
                <SpinningCD
                  albumArt={songQueue[0]?.thumbnail}
                  albumTitle={songQueue[0]?.title}
                  artist={songQueue[0]?.artist}
                  isPlaying={isPlaying}
                  size="large"
                />
              </div>

              {/* Center Controls */}
              <div className="flex justify-center space-x-8">
                
                <VerticalSlider
  label="BASS"
  value={bass}
  onChange={setBass}
  color={isNightMode ? 'purple' : 'cyan'}
/>

<NightcoreSwitch isOn={nightcore} onToggle={handleNightcoreToggle} />

<VerticalSlider
  label="VOL"
  value={volume}
  onChange={setVolume}   // pass in 0–100 directly
  color={isNightMode ? "purple" : "cyan"}
/>

              </div>

              {/* Next Song CD */}
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

          <div className="flex gap-8 pb-4 mt-4">
            <LEDColorBarV2 currentColor={ledColor} onColorChange={setLedColor} />
            <SoundBites onTriggerBite={handleSoundBite} />
          </div>
        </div>
      </FlashingBorder>

      {/* Hidden audio element for debugging */}
      {audioEl && <audio controls src={audioEl.src} className="hidden" />}
    </div>
  );
}
