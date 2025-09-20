import { motion } from 'motion/react';
import { Zap, Volume2, Music, Disc, Radio, Headphones, Mic, Speaker } from 'lucide-react';

interface SoundBite {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  isActive?: boolean;
}

interface SoundBitesProps {
  onTriggerBite: (id: string) => void;
}

const soundBites: SoundBite[] = [
  { id: 'airhorn', name: 'Air Horn', icon: <Speaker className="w-6 h-6" />, color: 'from-red-500 to-orange-500' },
  { id: 'applause', name: 'Applause', icon: <Volume2 className="w-6 h-6" />, color: 'from-green-500 to-emerald-500' },
  { id: 'bass', name: 'Bass Drop', icon: <Music className="w-6 h-6" />, color: 'from-purple-500 to-indigo-500' },
  { id: 'scratch', name: 'Scratch', icon: <Disc className="w-6 h-6" />, color: 'from-yellow-500 to-amber-500' },
  { id: 'siren', name: 'Siren', icon: <Radio className="w-6 h-6" />, color: 'from-blue-500 to-cyan-500' },
  { id: 'vocal', name: 'Vocal Chop', icon: <Mic className="w-6 h-6" />, color: 'from-pink-500 to-rose-500' },
  { id: 'echo', name: 'Echo', icon: <Headphones className="w-6 h-6" />, color: 'from-teal-500 to-green-500' },
  { id: 'laser', name: 'Laser', icon: <Zap className="w-6 h-6" />, color: 'from-violet-500 to-purple-500' },
];

export function SoundBites({ onTriggerBite }: SoundBitesProps) {
  return (
    <div className="w-full">
      <h3 className="text-cyan-300 font-bold mb-4 text-center">SOUND BITES</h3>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
        {soundBites.map((bite) => (
          <motion.button
            key={bite.id}
            className={`relative w-16 h-16 rounded-lg bg-gradient-to-br ${bite.color} border-2 border-white/20 shadow-lg overflow-hidden group`}
            onClick={() => onTriggerBite(bite.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
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
        ))}
      </div>
    </div>
  );
}