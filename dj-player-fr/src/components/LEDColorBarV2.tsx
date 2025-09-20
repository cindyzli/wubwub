import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface LEDColorBarProps {
  onColorChange: (color: string) => void;
  minHue?: number;
  maxHue?: number;
}

// HSL → HEX converter
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function LEDColorBarV2({
  onColorChange,
  minHue = 0,
  maxHue = 360,
}: LEDColorBarProps) {
  const [hue, setHue] = useState(minHue);

  // animate hue back and forth
  useEffect(() => {
    let direction = 1;
    const interval = setInterval(() => {
      setHue((prev) => {
        let next = prev + direction * 2; // step size
        if (next >= maxHue) {
          next = maxHue;
          direction = -1;
        } else if (next <= minHue) {
          next = minHue;
          direction = 1;
        }
        return next;
      });
    }, 50); // update every 50ms
    return () => clearInterval(interval);
  }, [minHue, maxHue]);

  // whenever hue updates → emit color
  useEffect(() => {
    const hex = hslToHex(hue, 100, 50);
    onColorChange(hex);
  }, [hue, onColorChange]);

  const handlePosition = (hue / 360) * 100;
  const currentColor = hslToHex(hue, 100, 50);

  return (
    <div className="w-full space-y-4">
      <div className="p-4 bg-gray-900/50 border border-cyan-400/30 rounded-lg">
        <div className="relative">
          <div
            className="w-full h-8 rounded-lg border-2 border-cyan-400/50 overflow-hidden"
            style={{
              background:
                "linear-gradient(to right, #ff0000 0%, #ffff00 16.6%, #00ff00 33.3%, #00ffff 50%, #0000ff 66.6%, #ff00ff 83.3%, #ff0000 100%)",
            }}
          >
            <motion.div
              className="absolute top-1/2 w-4 h-10 bg-white border-2 border-gray-800 rounded shadow-lg -translate-y-1/2 -translate-x-1/2"
              animate={{ left: `${handlePosition}%` }}
              transition={{ duration: 0.2, ease: "linear" }}
              style={{
                boxShadow: `0 0 15px ${currentColor}, 0 0 30px ${currentColor}`,
              }}
            >
              <div
                className="absolute inset-1 rounded"
                style={{ backgroundColor: currentColor }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
