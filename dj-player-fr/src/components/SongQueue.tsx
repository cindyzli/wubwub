import { useState } from 'react';
import { Play, X, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface Song {
  id: string;
  title: string;
  artist: string;
  duration: string;
  thumbnail: string;
}

interface SongQueueProps {
  queue: Song[];
  onAddSong: (youtubeUrl: string) => void;
  onRemoveSong: (id: string) => void;
  onPlaySong: (id: string) => void;
}

export function SongQueue({ queue, onAddSong, onRemoveSong, onPlaySong }: SongQueueProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const handleAddSong = () => {
    if (youtubeUrl.trim()) {
      onAddSong(youtubeUrl);
      setYoutubeUrl('');
    }
  };

  return (
    <div className="w-full space-y-4 mb-4">
      {/* Add song section */}
      <div className="flex space-x-4 p-4 bg-gray-900/50 border border-cyan-400/30 rounded-lg backdrop-blur-sm">
        <Input
          placeholder="Paste YouTube URL here..."
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          className="flex-1 bg-gray-800/50 border-cyan-400/50 text-cyan-300 placeholder-cyan-400/50"
        />
        <Button
          onClick={handleAddSong}
          className="bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400"
        >
          <Plus className="w-4 h-4 mr-2" />
          Queue
        </Button>
      </div>

      {/* Queue list */}
      <div className="space-y-2 max-h-36 overflow-y-auto">
        {queue.length === 0 ? (
          <div className="text-center py-8 text-cyan-400/60">
            No songs in queue. Add a YouTube link above!
          </div>
        ) : (
          queue.map((song, index) => (
            <div
              key={song.id}
              className="flex items-center space-x-4 p-3 bg-gray-900/30 border border-cyan-400/20 rounded-lg backdrop-blur-sm hover:border-cyan-400/50 transition-all"
            >
              {/* Queue number */}
              <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">{index + 1}</span>
              </div>

              {/* Thumbnail */}
              <img
                src={song.thumbnail}
                alt={song.title}
                className="w-12 h-12 rounded object-cover border border-cyan-400/30"
              />

              {/* Song info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-cyan-300 font-medium truncate">{song.title}</h4>
                <p className="text-cyan-400/70 text-sm truncate">{song.artist}</p>
              </div>

              {/* Duration */}
              <div className="text-cyan-400 text-sm font-mono">
                {song.duration}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onPlaySong(song.id)}
                  className="text-green-400 hover:text-green-300 hover:bg-green-400/20"
                >
                  <Play className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveSong(song.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}