import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface FlashingBorderProps {
  children: ReactNode;
  color: string;
  isActive?: boolean;
}

export function FlashingBorder({ children, color, isActive = true, duration = 1.5 }: FlashingBorderProps) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Animated border */}
      {isActive && (
        <>
          {/* Top border */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-1 z-10"
            style={{ backgroundColor: color }}
            animate={{ 
              opacity: [0.3, 1, 0.3],
              boxShadow: [
                `0 0 5px ${color}`,
                `0 0 20px ${color}, 0 0 40px ${color}`,
                `0 0 5px ${color}`
              ]
            }}
            transition={{ 
              duration: duration, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Right border */}
          <motion.div
            className="absolute top-0 right-0 bottom-0 w-1 z-10"
            style={{ backgroundColor: color }}
            animate={{ 
              opacity: [0.3, 1, 0.3],
              boxShadow: [
                `0 0 5px ${color}`,
                `0 0 20px ${color}, 0 0 40px ${color}`,
                `0 0 5px ${color}`
              ]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2
            }}
          />
          
          {/* Bottom border */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1 z-10"
            style={{ backgroundColor: color }}
            animate={{ 
              opacity: [0.3, 1, 0.3],
              boxShadow: [
                `0 0 5px ${color}`,
                `0 0 20px ${color}, 0 0 40px ${color}`,
                `0 0 5px ${color}`
              ]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4
            }}
          />
          
          {/* Left border */}
          <motion.div
            className="absolute top-0 left-0 bottom-0 w-1 z-10"
            style={{ backgroundColor: color }}
            animate={{ 
              opacity: [0.3, 1, 0.3],
              boxShadow: [
                `0 0 5px ${color}`,
                `0 0 20px ${color}, 0 0 40px ${color}`,
                `0 0 5px ${color}`
              ]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.6
            }}
          />
          
          {/* Corner accents */}
          {[
            { position: 'top-0 left-0', delay: 0 },
            { position: 'top-0 right-0', delay: 0.2 },
            { position: 'bottom-0 right-0', delay: 0.4 },
            { position: 'bottom-0 left-0', delay: 0.6 }
          ].map((corner, index) => (
            <motion.div
              key={index}
              className={`absolute ${corner.position} w-4 h-4 z-10`}
              style={{ backgroundColor: color }}
              animate={{ 
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.2, 1],
                boxShadow: [
                  `0 0 10px ${color}`,
                  `0 0 30px ${color}, 0 0 50px ${color}`,
                  `0 0 10px ${color}`
                ]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: corner.delay
              }}
            />
          ))}
        </>
      )}
      
      {/* Content */}
      <div className="relative z-0 w-full h-full p-2">
        {children}
      </div>
    </div>
  );
}