import { motion } from 'motion/react';

interface VerticalSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  color?: string;
}

export function VerticalSlider({ 
  label, 
  value, 
  onChange, 
  min = 0, 
  max = 100,
  color = "cyan"
}: VerticalSliderProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = rect.bottom - e.clientY;
    const percentage = Math.max(0, Math.min(100, (y / rect.height) * 100));
    const newValue = min + (percentage / 100) * (max - min);
    onChange(newValue);
  };

  const percentage = ((value - min) / (max - min)) * 100;
  
  const colorClasses = {
    cyan: "bg-cyan-400 shadow-cyan-400/50",
    purple: "bg-purple-400 shadow-purple-400/50",
    green: "bg-green-400 shadow-green-400/50"
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <label className="text-cyan-300 font-bold text-xs transform -rotate-90 whitespace-nowrap">
        {label}
      </label>
      
      <div 
        className="relative w-8 h-48 bg-gray-800 border-2 border-cyan-400/50 rounded-full cursor-pointer"
        onClick={handleClick}
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-gray-700 rounded-full"></div>
        
        {/* Fill */}
        <motion.div
          className={`absolute bottom-0 left-0 right-0 rounded-full ${colorClasses[color as keyof typeof colorClasses] || colorClasses.cyan}`}
          style={{ height: `${percentage}%` }}
          initial={{ height: 0 }}
          animate={{ height: `${percentage}%` }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Slider handle */}
        {/* <motion.div
          className={`absolute w-6 h-6 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.cyan} rounded-full border-2 border-white shadow-lg transform -translate-x-1/2`}
          style={{ 
            left: '50%',
            bottom: `${percentage}%`
          }}
          initial={{ bottom: 0 }}
          animate={{ bottom: `${percentage}%` }}
          transition={{ duration: 0.2 }}
        /> */}
        
        {/* Scale marks */}
        {[...Array(11)].map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 w-2 h-0.5 bg-cyan-400/30 transform -translate-x-1/2"
            style={{ bottom: `${i * 10}%` }}
          />
        ))}
      </div>
      
      <div className="text-cyan-300 text-xs font-mono">
        {Math.round(value)}
      </div>
    </div>
  );
}