
import React, { useRef } from 'react';

interface VisualizerProps {
  isPlaying: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ isPlaying }) => {
  const bars = useRef(
    Array.from({ length: 40 }, () => Math.random() * 80 + 20)
  );

  return (
    <div className="flex items-end justify-center h-24 gap-1 w-full max-w-2xl mx-auto px-4">
      {bars.current.map((_, i) => (
        <div
          key={i}
          className={`w-1 bg-indigo-500 rounded-full transition-all duration-300 ${
            isPlaying ? 'animate-pulse' : 'h-2 opacity-50'
          }`}
          style={{
            height: isPlaying ? `${Math.random() * 80 + 20}%` : '8px',
            animationDelay: `${i * 0.05}s`,
            animationDuration: isPlaying ? `${0.5 + Math.random()}s` : '0s'
          }}
        />
      ))}
    </div>
  );
};

export default Visualizer;
