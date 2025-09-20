import { motion } from 'motion/react';

interface NightcoreSwitchProps {
  isOn: boolean;
  onToggle: () => void;
}

export function NightcoreSwitch({ isOn, onToggle }: NightcoreSwitchProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* <label className="text-cyan-300 font-bold text-xs transform -rotate-90 whitespace-nowrap">
        NIGHTCORE
      </label> */}
      
      <motion.div
        className={`relative w-8 h-24 rounded-full border-2 cursor-pointer transition-all duration-300 ${
          isOn 
            ? 'bg-purple-900 border-purple-400 shadow-lg shadow-purple-400/50' 
            : 'bg-gray-800 border-cyan-400/50'
        }`}
        onClick={onToggle}
        whileTap={{ scale: 0.95 }}
      >
        {/* Switch track */}
        <div className={`absolute inset-1 rounded-full transition-all duration-300 ${
          isOn ? 'bg-gradient-to-t from-purple-800 to-purple-600' : 'bg-gradient-to-t from-gray-900 to-gray-700'
        }`} />
        
        {/* Switch handle */}
        <motion.div
          className={`absolute w-6 h-6 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 transition-all duration-300 ${
            isOn 
              ? 'bg-purple-400 shadow-purple-400/50' 
              : 'bg-cyan-400 shadow-cyan-400/50'
          }`}
          style={{ left: '50%' }}
          animate={{
            top: isOn ? '4px' : 'calc(100% - 28px)'
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </motion.div>
      
      {/* Status indicator */}
      <div className={`text-xs font-mono transition-colors duration-300 ${
        isOn ? 'text-purple-400' : 'text-cyan-400'
      }`}>
        {isOn ? 'NIGHTCORE' : 'DAY'}
      </div>
    </div>
  );
}