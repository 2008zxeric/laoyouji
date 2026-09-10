import React from 'react';

export const VoiceWaveform: React.FC<{ isListening: boolean }> = ({ isListening }) => {
  if (!isListening) return null;

  return (
    <div className="flex items-center justify-center gap-1 h-8 px-4 bg-rose-50 rounded-full animate-fadeIn">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-rose-500 rounded-full animate-voiceWave"
          style={{
            animationDelay: `${i * 0.1}s`,
            height: '10px'
          }}
        />
      ))}
    </div>
  );
};
