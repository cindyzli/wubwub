import { useState } from 'react';
import { SpinningCD } from './components/SpinningCD';
import { VerticalSlider } from './components/VerticalSlider';
import { NightcoreSwitch } from './components/NightcoreSwitch';
import { SongQueue } from './components/SongQueue';
import { SoundBites } from './components/SoundBites';
import { LEDColorBar } from './components/LEDColorBar';
import { FlashingBorder } from './components/FlashingBorder';
import { LEDColorBarV2 } from './components/LEDColorBarV2';
import logo from './img/logo.png';

interface Song {
  id: string;
  title: string;
  artist: string;
  duration: string;
  thumbnail: string;
}

export default function App() {
  // Theme state
  const [isNightMode, setIsNightMode] = useState(false);
  
  // Audio controls
  const [bassBoost, setBassBoost] = useState(50);
  const [volume, setVolume] = useState(75);
  const [isPlaying, setIsPlaying] = useState(true);
  
  // Songs
  const [currentSong] = useState({
    title: "Electric Dreams",
    artist: "Neon Pulse",
    albumArt: "https://images.unsplash.com/photo-1654842805820-20159a52ba74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbGJ1bSUyMGNvdmVyJTIwbXVzaWMlMjBlbGVjdHJvbmljfGVufDF8fHx8MTc1ODM0Mzg0Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  });
  
  const [nextSong] = useState({
    title: "Cyber Symphony",
    artist: "Digital Wave",
    albumArt: "https://images.unsplash.com/photo-1613870948964-7125fa3e1aab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMG11c2ljJTIwbmVvbnxlbnwxfHx8fDE3NTgzNDM4NDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  });

  // Queue state
  const [songQueue, setSongQueue] = useState<Song[]>([
    { id: '1', title: 'Bass Revolution', artist: 'Electronic Masters', duration: '3:45', thumbnail: currentSong.albumArt },
    { id: '2', title: 'Neon Nights', artist: 'Synth Lords', duration: '4:12', thumbnail: nextSong.albumArt },
    { id: '3', title: 'Digital Horizon', artist: 'Cyber Collective', duration: '3:28', thumbnail: currentSong.albumArt }
  ]);

  // LED state
  const [ledColor, setLedColor] = useState('#00ffff');

  // Handlers
  const handleNightcoreToggle = () => {
    setIsNightMode(!isNightMode);
  };

  const handleAddSong = (youtubeUrl: string) => {
    // Mock parsing of YouTube URL
    const newSong: Song = {
      id: Date.now().toString(),
      title: 'New Track',
      artist: 'Unknown Artist',
      duration: '3:30',
      thumbnail: currentSong.albumArt
    };
    setSongQueue([...songQueue, newSong]);
  };

  const handleRemoveSong = (id: string) => {
    setSongQueue(songQueue.filter(song => song.id !== id));
  };

  const handlePlaySong = (id: string) => {
    console.log('Playing song:', id);
    // Here you would implement song switching logic
  };

  const handleSoundBite = (id: string) => {
    console.log('Playing sound bite:', id);
    // Here you would trigger the actual sound effect
  };

  const themeClass = isNightMode ? 'dj-night-theme' : 'dj-day-theme';
  const primaryGlow = isNightMode ? 'glow-purple' : 'glow-cyan';

  return (
    <div className={`h-screen w-full ${themeClass} transition-all duration-1000`}>
      <FlashingBorder color={ledColor} isActive={true}>
        <div className="flex flex-col h-screen p-6 space-y-4">
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
                  albumArt={currentSong.albumArt}
                  albumTitle={currentSong.title}
                  artist={currentSong.artist}
                  isPlaying={isPlaying}
                  size="large"
                />
              </div>

              {/* Center Controls */}
              <div className="flex justify-center space-x-8">
                <VerticalSlider
                  label="BASS"
                  value={bassBoost}
                  onChange={setBassBoost}
                  color={isNightMode ? "purple" : "cyan"}
                />
                
                <NightcoreSwitch
                  isOn={isNightMode}
                  onToggle={handleNightcoreToggle}
                />
                
                <VerticalSlider
                  label="VOL"
                  value={volume}
                  onChange={setVolume}
                  color={isNightMode ? "purple" : "cyan"}
                />
              </div>

              {/* Next Song CD */}
              <div className="lg:col-span-2 flex justify-center">
                <SpinningCD
                  albumArt={nextSong.albumArt}
                  albumTitle={nextSong.title}
                  artist={nextSong.artist}
                  isPlaying={false}
                  size="medium"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-8 pb-4">
            <LEDColorBarV2 
              currentColor={ledColor}
              onColorChange={setLedColor}
            />
            <SoundBites onTriggerBite={handleSoundBite} />
          </div>
        </div>
      </FlashingBorder>
    </div>
  );
}