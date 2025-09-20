import { motion } from 'motion/react';

interface LEDColorBarProps {
  currentColor: string;
  onColorChange: (color: string) => void;
}

const ledColors = [
  { name: 'Red', value: '#ff0000', hex: '#ff0000' },
  { name: 'Orange', value: '#ff8000', hex: '#ff8000' },
  { name: 'Yellow', value: '#ffff00', hex: '#ffff00' },
  { name: 'Green', value: '#00ff00', hex: '#00ff00' },
  { name: 'Cyan', value: '#00ffff', hex: '#00ffff' },
  { name: 'Blue', value: '#0080ff', hex: '#0080ff' },
  { name: 'Purple', value: '#8000ff', hex: '#8000ff' },
  { name: 'Pink', value: '#ff00ff', hex: '#ff00ff' },
  { name: 'White', value: '#ffffff', hex: '#ffffff' },
];

export function LEDColorBar({ currentColor, onColorChange }: LEDColorBarProps) {
  return (
    <div className="w-full space-y-2">
      {/* Current color display */}
      <div className="flex items-center justify-center space-x-4">
        <span className="text-cyan-300 font-bold">LED COLOR:</span>
        <motion.div
          className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
          style={{ backgroundColor: currentColor }}
          animate={{ 
            boxShadow: `0 0 20px ${currentColor}, 0 0 40px ${currentColor}` 
          }}
          transition={{ duration: 0.3 }}
        />
        <span className="text-cyan-400 font-mono text-sm">
          {currentColor.toUpperCase()}
        </span>
      </div>

      {/* Color picker bar */}
      <div className="flex justify-center space-x-2 p-4 bg-gray-900/50 border border-cyan-400/30 rounded-lg backdrop-blur-sm">
        {ledColors.map((color) => (
          <motion.button
            key={color.value}
            className={`w-12 h-12 rounded-lg border-2 transition-all duration-200 ${
              currentColor === color.value 
                ? 'border-white scale-110' 
                : 'border-gray-400/30 hover:border-white/50'
            }`}
            style={{ backgroundColor: color.value }}
            onClick={() => onColorChange(color.value)}
            whileHover={{ scale: currentColor === color.value ? 1.1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={color.name}
          >
            {/* Glow effect for active color */}
            {currentColor === color.value && (
              <motion.div
                className="absolute inset-0 rounded-lg opacity-50"
                style={{ 
                  backgroundColor: color.value,
                  boxShadow: `0 0 20px ${color.value}`
                }}
                animate={{ 
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* LED status indicator */}
      {/* <div className="text-center">
        <motion.div
          className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-cyan-400/50 rounded-full"
          animate={{ 
            borderColor: currentColor,
            boxShadow: `0 0 10px ${currentColor}50`
          }}
        >
          <motion.div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: currentColor }}
            animate={{ 
              opacity: [1, 0.3, 1],
            }}
            transition={{ 
              duration: 1, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <span className="text-cyan-300 text-sm font-bold">LED ACTIVE</span>
        </motion.div>
      </div> */}
    </div>
  );
}