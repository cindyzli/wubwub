import { motion } from 'motion/react';

interface SpinningCDProps {
  albumArt: string;
  albumTitle: string;
  artist: string;
  isPlaying: boolean;
  size?: 'large' | 'medium';
}

export function SpinningCD({ albumArt, albumTitle, artist, isPlaying, size = 'large' }: SpinningCDProps) {
  const sizeClasses = size === 'large' ? 'w-48 h-48' : 'w-36 h-36';
  
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className={`relative ${sizeClasses} rounded-full overflow-hidden border-4 border-cyan-400 shadow-lg shadow-cyan-400/50`}>
        {/* Vinyl record background */}
        <div className="absolute inset-0 bg-gradient-radial from-gray-800 via-gray-900 to-black"></div>
        
        {/* Spinning record */}
        <motion.div
          className="relative w-full h-full rounded-full overflow-hidden"
          animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
          transition={{
            duration: 3,
            repeat: isPlaying ? Infinity : 0,
            ease: "linear"
          }}
        >
          {/* Album art */}
          <div className="absolute inset-[20%] rounded-full overflow-hidden border-2 border-cyan-300/50">
            <img 
              src={albumArt} 
              alt={albumTitle}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Vinyl grooves */}
          <div className="absolute inset-0 rounded-full">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full border border-gray-600/30"
                style={{
                  top: `${10 + i * 8}%`,
                  left: `${10 + i * 8}%`,
                  right: `${10 + i * 8}%`,
                  bottom: `${10 + i * 8}%`,
                }}
              />
            ))}
          </div>
          
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-800 rounded-full border-2 border-cyan-400"></div>
        </motion.div>
      </div>
      
      {/* Song info */}
      <div className="text-center space-y-1">
        <h3 className="text-cyan-300 text-lg font-bold">{albumTitle}</h3>
        <p className="text-cyan-400/80 text-sm">{artist}</p>
      </div>
    </div>
  );
}