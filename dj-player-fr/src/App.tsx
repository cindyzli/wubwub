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
import { SoundBitesV2, SoundBite } from './components/SoundBitesV2';
import { Play, Pause, SkipForward, Zap, Volume2, Music, Disc, Radio, Headphones, Mic, Speaker } from 'lucide-react';
import { SoundBiteModal } from './components/SoundBiteModal';


// Define Song type
interface Song {
  id: string;
  title: string;
  artist: string;
  duration: string;
  thumbnail: string;
  url: string;
  min_hue: number;
  max_hue: number;
}

// Initialize socket connection
const socket = io("http://localhost:5001");

export default function App() {

  const fetchSongs = async () => {
    const res = await fetch('http://localhost:5001/download');
    const data = await res.json();
    console.log("Setting from fetch");

    let fetchedSongs: Song[] = data.songs.map((item: any) => ({
      id: item.id,
      title: item.name,
      artist: item.channel,
      duration: `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, '0')}`,
      thumbnail: item.thumbnail,
      url: item.public_url,
      min_hue: item.min_hue,
      max_hue: item.max_hue,
    }));
    setSongQueue(fetchedSongs);
  };

  const getIconForSoundBite = (id: string) => {
    switch (id) {
      case '1': return <Speaker className="w-6 h-6" />;
      case '2': return <Volume2 className="w-6 h-6" />;
      case '3': return <Music className="w-6 h-6" />;
      case '4': return <Disc className="w-6 h-6" />;
    }
  }
  const getColorForSoundBite = (id: string) => {
    switch (id) {
      case '1': return 'from-red-500 to-orange-500';
      case '2': return 'from-green-500 to-emerald-500';
      case '3': return 'from-purple-500 to-indigo-500';
      case '4': return 'from-yellow-500 to-amber-500';
    }
  }

  const fetchSongBites = async () => {
    const res = await fetch('http://localhost:5001/sound-bites');
    const data = await res.json();
    console.log('Fetched sound bites:', data.soundBites);

    let fetchedBites: SoundBite[] = data.soundBites.map((item: any) => ({
      id: item.uuid,
      name: item.label,
      icon: getIconForSoundBite(item.id),
      color: getColorForSoundBite(item.id),
      audioUrl: "/public/sound-bites/" + item.id + ".mp3"
    }));
    setSoundBites(fetchedBites);
  }

  // Queue state
  const [songQueue, setSongQueue] = useState<Song[]>([]);
  const [songUrls, setSongUrls] = useState<string[]>([]);
  const [ledColor, setLedColor] = useState('#00ffff');

  useEffect(() => {
    setSongUrls(songQueue.map((s) => s.url));
  }, [songQueue]);

  // Sound Bites state
  const [soundBites, setSoundBites] = useState<SoundBite[]>([
    { id: '1', name: 'Air Horn', icon: <Speaker className="w-6 h-6" />, color: 'from-red-500 to-orange-500', audioUrl: undefined },
    { id: '2', name: 'Applause', icon: <Volume2 className="w-6 h-6" />, color: 'from-green-500 to-emerald-500', audioUrl: undefined },
    { id: '3', name: 'Bass Drop', icon: <Music className="w-6 h-6" />, color: 'from-purple-500 to-indigo-500', audioUrl: undefined },
    { id: '4', name: 'Scratch', icon: <Disc className="w-6 h-6" />, color: 'from-yellow-500 to-amber-500', audioUrl: undefined },
  ]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSoundBite, setEditingSoundBite] = useState<SoundBite | null>(null);

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
  } = useDJPlayer(songUrls);

  // Initial load + socket gesture handler
  useEffect(() => {
    console.log("App mounted");
    const initialize = async () => {
      await fetchSongs();
      // await fetchSongBites();
    };

    initialize();

    // Listen for gesture events
    socket.on("gesture", (data) => {
      console.log("Received gesture:", data);

      if (data.action === "adjust_bass" && typeof data.bass === "number") {
        setBass(data.bass); // Update audio backend
      }

      if (data.action === "adjust_vol" && typeof data.volume === "number") {
        setVolume(data.volume); // Update UI slider
      }

      if (data.action === "sound_bite" && typeof data.number === "number") {
        handleSoundBite(data.number.toString())
      }

      if (data.action === "next_song") {
        handleNextSong()
      }

      if (data.action === "toggle_nightcore" && typeof data.state === "number") {
        handleNightcoreToggle();
      }
    });

    return () => {
      socket.off("gesture");
    };
  }, []);

  const handleNightcoreToggle = () => {
    toggleNightcore();
  };
  const handleNextSong = async () => {
  // Tell backend to drop the first song
  await fetch("http://localhost:5001/download", { method: "DELETE" });
  // Refresh queue from Mongo
  await fetchSongs();
  // Tell player to advance
  nextSong();
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
    console.log("Setting from remove song")
    setSongQueue(songQueue.filter((song) => song.id !== id));
  };

  const handlePlaySong = (id: string) => {
    const idx = songQueue.findIndex((s) => s.id === id);
    if (idx !== -1) playSongAt(idx);
  };

  const handleSoundBite = (id: string) => {
    const soundBite = soundBites.find(bite => bite.id === id);
    if (soundBite?.audioUrl) {
      // Play the custom audio
      const audio = new Audio(soundBite.audioUrl);
      audio.play().catch(console.error);
    } else {
      console.log('Playing default sound bite:', id);
      // Here you would implement default sound effect playback
    }
  };

  const handleEditSoundBite = (soundBite: SoundBite) => {
    setEditingSoundBite(soundBite);
    setIsModalOpen(true);
  };

  const handleSaveSoundBite = async (updatedSoundBite: SoundBite) => {
    await fetch(`http://localhost:5001/sound-bites`, {
      method: 'POST',
      body: JSON.stringify({
        id: updatedSoundBite.id,
        label: updatedSoundBite.name,
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    // save file if exists
    // if (updatedSoundBite.file) {
    //   const formData = new FormData();
    //   formData.append('file', updatedSoundBite.file);
    //   await fetch(`http://localhost:5001/sound-bites/${updatedSoundBite.id}/upload`, {
    //     method: 'POST',
    //     body: formData
    //   });
    // }
    await fetchSongBites();
    setIsModalOpen(false);
    setEditingSoundBite(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSoundBite(null);
  };

  const themeClass = nightcore ? 'dj-night-theme' : 'dj-day-theme';

  return (
    <div className={`h-screen w-full ${themeClass} transition-all duration-1000`}>
      <FlashingBorder color={ledColor} isActive={true}>
        <div className="h-full w-full p-4">

         {/* Play/Pause + Next Buttons */}
{/* <div className="absolute top-4 left-4 z-10 flex gap-2">
  <button
    onClick={isPlaying ? pause : play}
    className="px-4 py-2 bg-cyan-500 text-white rounded-lg shadow hover:bg-cyan-600 transition"
  >
    {isPlaying ? '⏸ Pause' : '▶ Play'}
  </button>

  <button
    onClick={handleNextSong}
    className="px-4 py-2 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600 transition"
  >
    ⏭ Next
  </button>
</div> */}

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
                  value={bass}
                  onChange={(val) => {
                    setBass(val);
                  }}
                  color={nightcore ? 'purple' : 'cyan'}
                />

                <div className="flex flex-col justify-center items-center space-y-4">
                  <NightcoreSwitch
                    isOn={nightcore}
                    onToggle={handleNightcoreToggle}
                  />
                  
                  {/* Transport Controls */}
                  <div className="flex space-x-2">
                    <button
                      onClick={isPlaying ? pause : play}
                      className={`
                        w-12 h-12 rounded-full border-2 
                        ${nightcore 
                          ? 'border-purple-400 bg-gradient-to-br from-purple-600/20 to-purple-800/40 text-purple-300 hover:from-purple-500/30 hover:to-purple-700/50 hover:border-purple-300' 
                          : 'border-cyan-400 bg-gradient-to-br from-cyan-600/20 to-cyan-800/40 text-cyan-300 hover:from-cyan-500/30 hover:to-cyan-700/50 hover:border-cyan-300'
                        }
                        flex items-center justify-center transition-all duration-200 
                        hover:scale-105 active:scale-95 backdrop-blur-sm
                        shadow-lg hover:shadow-xl
                      `}
                      style={{ 
                        boxShadow: nightcore 
                          ? '0 0 15px rgba(139, 0, 255, 0.3), inset 0 0 10px rgba(139, 0, 255, 0.1)' 
                          : '0 0 15px rgba(0, 255, 255, 0.3), inset 0 0 10px rgba(0, 255, 255, 0.1)' 
                      }}
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6 ml-0.5" />
                      )}
                    </button>
                    
                    <button
                      onClick={handleNextSong}
                      className={`
                        w-12 h-12 rounded-full border-2 
                        ${nightcore 
                          ? 'border-purple-400 bg-gradient-to-br from-purple-600/20 to-purple-800/40 text-purple-300 hover:from-purple-500/30 hover:to-purple-700/50 hover:border-purple-300' 
                          : 'border-cyan-400 bg-gradient-to-br from-cyan-600/20 to-cyan-800/40 text-cyan-300 hover:from-cyan-500/30 hover:to-cyan-700/50 hover:border-cyan-300'
                        }
                        flex items-center justify-center transition-all duration-200 
                        hover:scale-105 active:scale-95 backdrop-blur-sm
                        shadow-lg hover:shadow-xl
                      `}
                      style={{ 
                        boxShadow: nightcore 
                          ? '0 0 15px rgba(139, 0, 255, 0.3), inset 0 0 10px rgba(139, 0, 255, 0.1)' 
                          : '0 0 15px rgba(0, 255, 255, 0.3), inset 0 0 10px rgba(0, 255, 255, 0.1)' 
                      }}
                    >
                      <SkipForward className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <VerticalSlider
                  label="VOL"
                  value={volume}
                  onChange={setVolume}
                  color={nightcore ? "purple" : "cyan"}
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
            <LEDColorBarV2 currentColor={ledColor} onColorChange={setLedColor} minHue={songQueue[0]?.min_hue} maxHue={songQueue[0]?.max_hue} />
            <SoundBitesV2 onTriggerBite={handleSoundBite} soundBites={soundBites}
              onTriggerBite={handleSoundBite} 
              onEditBite={handleEditSoundBite} />
          </div>
        </div>
      </FlashingBorder>

      {/* Hidden Audio Element */}
      {audioEl && (
  <audio
    src={songQueue[0]?.url}
    autoPlay
    onEnded={handleNextSong}
    className="hidden"
  />
)}


      {/* Sound Bite Modal */}
      <SoundBiteModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        soundBite={editingSoundBite}
        onSave={handleSaveSoundBite}
        nightcore={nightcore}
      />
    </div>
  );
}