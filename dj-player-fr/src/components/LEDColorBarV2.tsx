import { motion } from 'motion/react';
import { useRef } from 'react';

interface LEDColorBarProps {
  currentColor: string;
  onColorChange: (color: string) => void;
}

// Convert HSL to Hex
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Convert Hex to HSL
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

export function LEDColorBarV2({ currentColor, onColorChange }: LEDColorBarProps) {
  const colorBarRef = useRef<HTMLDivElement>(null);
  
  const handleColorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!colorBarRef.current) return;
    
    const rect = colorBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    // Convert percentage to hue (0-360)
    const hue = (percentage / 100) * 360;
    const newColor = hslToHex(hue, 100, 50); // Full saturation and 50% lightness
    onColorChange(newColor);
  };

  // Get current position for the slider handle
  const [currentHue] = hexToHsl(currentColor);
  const handlePosition = (currentHue / 360) * 100;

  return (
    <div className="w-full space-y-4">
      {/* Current color display */}
      <div className="flex items-center justify-center space-x-4">
        <span className="text-cyan-300 font-bold">LED COLOR:</span>
        <motion.div
          className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
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

      {/* Horizontal Color Picker */}
      <div className="p-4 bg-gray-900/50 border border-cyan-400/30 rounded-lg backdrop-blur-sm">
        <div className="space-y-4">
          
          {/* Color gradient bar */}
          <div className="relative">
            <div
              ref={colorBarRef}
              className="w-full h-8 rounded-lg border-2 border-cyan-400/50 cursor-pointer overflow-hidden"
              style={{
                background: 'linear-gradient(to right, #ff0000 0%, #ffff00 16.66%, #00ff00 33.33%, #00ffff 50%, #0000ff 66.66%, #ff00ff 83.33%, #ff0000 100%)'
              }}
              onClick={handleColorClick}
            >
              {/* Slider handle */}
              <motion.div
                className="absolute top-1/2 w-4 h-10 bg-white border-2 border-gray-800 rounded shadow-lg transform -translate-y-1/2 -translate-x-1/2"
                style={{ 
                  left: `${handlePosition}%`,
                  boxShadow: `0 0 10px ${currentColor}, 0 0 20px ${currentColor}`
                }}
                animate={{
                  boxShadow: [
                    `0 0 10px ${currentColor}, 0 0 20px ${currentColor}`,
                    `0 0 15px ${currentColor}, 0 0 30px ${currentColor}`,
                    `0 0 10px ${currentColor}, 0 0 20px ${currentColor}`
                  ]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Handle center indicator */}
                <div 
                  className="absolute inset-1 rounded"
                  style={{ backgroundColor: currentColor }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}