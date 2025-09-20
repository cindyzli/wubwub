import { useState } from 'react';
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

  // Queue state with **default songs** — swap out the `url` with your own mp3 links
  const [songQueue, setSongQueue] = useState<Song[]>([
    {
      id: '1',
      title: 'Default Track 1',
      artist: 'Artist A',
      duration: '3:45',
      thumbnail: '/cover.png',
      url: '/ilys.mp3', // 👈 put your mp3 path here
    },
    {
      id: '2',
      title: 'Default Track 2',
      artist: 'Artist B',
      duration: '4:12',
      thumbnail: '/cover.png',
      url: '/playhard.mp3', // 👈 put your mp3 path here
    },
    // {
    //   id: '3',
    //   title: 'Default Track 3',
    //   artist: 'Artist C',
    //   duration: '3:28',
    //   thumbnail: 'https://via.placeholder.com/150',
    //   url: '/songs/example3.mp3', // 👈 put your mp3 path here
    // },
  ]);

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

  const handleAddSong = (youtubeUrl: string) => {
    const newSong: Song = {
      id: Date.now().toString(),
      title: 'New Track',
      artist: 'Unknown Artist',
      duration: '3:30',
      thumbnail: 'https://via.placeholder.com/150',
      url: '/songs/newtrack.mp3', // 👈 put downloaded song path here
    };
    setSongQueue([...songQueue, newSong]);
    playSongAt(songQueue.length); // autoplay new song
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
        <div className="flex flex-col h-screen p-6 space-y-4">
          {/* 🔊 Play/Pause button top-left */}
          <div className="flex justify-start">
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

          <div className="flex gap-8 pb-4">
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
