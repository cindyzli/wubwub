import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Play, Pause, Volume2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface SoundBite {
  id: string;
  name: string;
  file?: File;
  audioUrl?: string;
  color: string;
}

interface SoundBiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundBite: SoundBite | null;
  onSave: (soundBite: SoundBite) => void;
  isNightMode: boolean;
}

export function SoundBiteModal({ isOpen, onClose, soundBite, onSave, isNightMode }: SoundBiteModalProps) {
  const [name, setName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const themeColors = isNightMode ? {
    primary: 'purple-400',
    secondary: 'purple-300',
    bg: 'from-purple-900/95 to-black/95',
    border: 'purple-400/30',
    glow: '0 0 20px rgba(139, 0, 255, 0.5)'
  } : {
    primary: 'cyan-400',
    secondary: 'cyan-300',
    bg: 'from-cyan-900/95 to-black/95',
    border: 'cyan-400/30',
    glow: '0 0 20px rgba(0, 255, 255, 0.5)'
  };

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen && soundBite) {
      setName(soundBite.name);
      setSelectedFile(null);
      setIsPlaying(false);
      if (audioElement) {
        audioElement.pause();
        setAudioElement(null);
      }
    }
  }, [isOpen, soundBite]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setSelectedFile(file);
      
      // Stop any currently playing audio
      if (audioElement) {
        audioElement.pause();
        setIsPlaying(false);
      }
    }
  };

  const handlePlayPreview = () => {
    if (!selectedFile) return;

    if (isPlaying && audioElement) {
      audioElement.pause();
      setIsPlaying(false);
      return;
    }

    const audio = new Audio(URL.createObjectURL(selectedFile));
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setAudioElement(null);
    });
    
    audio.play();
    setIsPlaying(true);
    setAudioElement(audio);
  };

  const handleSave = () => {
    if (!soundBite || !name.trim()) return;

    const updatedSoundBite: SoundBite = {
      ...soundBite,
      name: name.trim(),
      file: selectedFile || undefined,
      audioUrl: selectedFile ? URL.createObjectURL(selectedFile) : soundBite.audioUrl
    };

    onSave(updatedSoundBite);
    onClose();
  };

  const handleClose = () => {
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
      setAudioElement(null);
    }
    onClose();
  };

  if (!soundBite) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="absolute inset-0 flex items-center justify-center z-50 p-4 w-1/2">
            <motion.div
              className={`w-full max-w-md bg-gradient-to-br ${themeColors.bg} border border-${themeColors.border} rounded-xl shadow-2xl overflow-hidden`}
              style={{ boxShadow: themeColors.glow }}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className={`text-xl font-bold text-${themeColors.secondary}`}>
                  Edit Sound Bite
                </h2>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Current Sound Bite Preview */}
                <div className="text-center">
                  <div className={`inline-flex w-20 h-20 rounded-xl bg-gradient-to-br ${soundBite.color} border-2 border-white/20 items-center justify-center mb-3`}>
                    <Volume2 className="w-8 h-8 text-white" />
                  </div>
                  <p className={`text-${themeColors.secondary} font-medium`}>
                    Current: {soundBite.name}
                  </p>
                </div>

                {/* Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="name" className={`text-${themeColors.primary}`}>
                    Sound Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter sound name..."
                    className={`bg-white/5 border-${themeColors.border} text-white placeholder:text-white/50 focus:border-${themeColors.primary}`}
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-4">
                  <Label className={`text-${themeColors.primary}`}>
                    Upload New Sound
                  </Label>
                  
                  <div className={`border-2 border-dashed border-${themeColors.border} rounded-lg p-6 text-center hover:border-${themeColors.primary} transition-colors`}>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="audio-upload"
                    />
                    <label htmlFor="audio-upload" className="cursor-pointer">
                      <Upload className={`w-8 h-8 text-${themeColors.primary} mx-auto mb-2`} />
                      <p className={`text-${themeColors.secondary} font-medium mb-1`}>
                        Choose audio file
                      </p>
                      <p className="text-white/60 text-sm">
                        MP3, WAV, OGG up to 10MB
                      </p>
                    </label>
                  </div>

                  {/* Selected File Preview */}
                  {selectedFile && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-white/5 border border-${themeColors.border} rounded-lg p-4`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-${themeColors.secondary} font-medium`}>
                            {selectedFile.name}
                          </p>
                          <p className="text-white/60 text-sm">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handlePlayPreview}
                          className={`text-${themeColors.primary} hover:bg-white/10`}
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5" />
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-3 p-6 border-t border-white/10">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className={`text-${themeColors.primary} hover:bg-white/10 hover:text-${themeColors.secondary}`}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!name.trim()}
                  className={`bg-${themeColors.primary} text-black hover:bg-${themeColors.secondary} disabled:opacity-50 disabled:cursor-not-allowed`}
                  style={{ boxShadow: `0 0 10px rgba(${isNightMode ? '139, 0, 255' : '0, 255, 255'}, 0.3)` }}
                >
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}