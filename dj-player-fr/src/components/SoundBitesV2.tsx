import { motion } from 'motion/react';
import { Zap, Volume2, Music, Disc, Radio, Headphones, Mic, Speaker, Edit } from 'lucide-react';

export interface SoundBite {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  file?: File;
  audioUrl?: string;
  isActive?: boolean;
}

interface SoundBitesProps {
  soundBites: SoundBite[];
  onTriggerBite: (id: string) => void;
  onEditBite: (soundBite: SoundBite) => void;
}

export function SoundBitesV2({ soundBites, onTriggerBite, onEditBite }: SoundBitesProps) {
  const handleBiteClick = (e: React.MouseEvent, bite: SoundBite) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if it's a right-click or long press for editing
    if (e.button === 2 || e.detail === 0) {
      onEditBite(bite);
    } else {
      onTriggerBite(bite.id);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, bite: SoundBite) => {
    e.preventDefault();
    onEditBite(bite);
  };

  return (
    <div className="w-full">
      <h3 className="text-cyan-300 font-bold mb-4 text-center">SOUND BITES</h3>
      <div className="grid grid-cols-4 gap-4 p-2">
        {soundBites.map((bite) => (
          <motion.div
            key={bite.id}
            className="relative group mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.button
              className={`relative w-16 h-16 rounded-lg bg-gradient-to-br ${bite.color} border-2 border-white/20 shadow-lg overflow-hidden group`}
              onClick={(e) => handleBiteClick(e, bite)}
              onContextMenu={(e) => handleContextMenu(e, bite)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              
              {/* Icon */}
              <div className="absolute inset-0 flex items-center justify-center text-white">
                {bite.icon}
              </div>
              
              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs font-bold p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {bite.name}
              </div>
              
              {/* Active indicator */}
              <motion.div
                className="absolute inset-0 border-2 border-white rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0 }}
                whileTap={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
              />
            </motion.button>

            {/* Edit button - appears on hover */}
            <motion.button
              className="absolute -top-2 -right-2 w-6 h-6 bg-white/90 text-gray-800 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
              onClick={(e) => {
                e.stopPropagation();
                onEditBite(bite);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Edit className="w-3 h-3" />
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}