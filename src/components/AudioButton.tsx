import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { speakJapanese } from '../utils/speech';

interface AudioButtonProps {
  text: string;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function AudioButton({ text, label, size = 'sm', className = '' }: AudioButtonProps) {
  const [speaking, setSpeaking] = useState(false);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakJapanese(text, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  return (
    <button
      type="button"
      onClick={handlePlay}
      title="Dengarkan pelafalan bahasa Jepang"
      aria-label={label ? `Putar audio: ${label}` : 'Putar pelafalan bahasa Jepang'}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border transition-colors shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-indigo-500 ${
        size === 'md' ? 'min-h-[40px] px-3 py-2 text-xs font-bold' : 'min-h-[34px] px-2.5 py-1 text-xs font-semibold'
      } ${
        speaking
          ? 'bg-indigo-600 border-indigo-600 text-white'
          : 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/70'
      } ${className}`}
    >
      <Volume2 className={`w-3.5 h-3.5 shrink-0 ${speaking ? 'animate-pulse' : ''}`} aria-hidden="true" />
      {label ? <span>{label}</span> : null}
    </button>
  );
}
