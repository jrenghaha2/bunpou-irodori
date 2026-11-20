import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { speakJapanese } from '../utils/speech';

interface AudioButtonProps {
  text: string;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function AudioButton({ text, label, size = 'sm', className = '' }: AudioButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const errorTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (errorTimerRef.current !== null) {
        window.clearTimeout(errorTimerRef.current);
      }
    };
  }, []);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (errorTimerRef.current !== null) {
      window.clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
    setErrorMsg(null);
    speakJapanese(text, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
      onError: msg => {
        setSpeaking(false);
        setErrorMsg(msg);
        errorTimerRef.current = window.setTimeout(() => {
          setErrorMsg(null);
          errorTimerRef.current = null;
        }, 4000);
      },
    });
  };

  return (
    <div className="inline-flex flex-col items-end gap-1 shrink-0">
      <button
        type="button"
        onClick={handlePlay}
        title={errorMsg ?? 'Dengarkan pelafalan bahasa Jepang'}
        aria-label={label ? `Putar audio: ${label}` : 'Putar pelafalan bahasa Jepang'}
        className={`inline-flex items-center justify-center gap-1.5 rounded-xl border transition-colors shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-indigo-500 ${
          size === 'md'
            ? 'min-h-[40px] px-3 py-2 text-xs font-bold'
            : 'min-h-[34px] px-2.5 py-1 text-xs font-semibold'
        } ${
          errorMsg
            ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-200'
            : speaking
              ? 'bg-indigo-600 border-indigo-600 text-white'
              : 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/70'
        } ${className}`}
      >
        {errorMsg ? (
          <VolumeX className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        ) : (
          <Volume2
            className={`w-3.5 h-3.5 shrink-0 ${speaking ? 'animate-pulse' : ''}`}
            aria-hidden="true"
          />
        )}
        {label ? <span>{errorMsg ? 'Audio gagal' : label}</span> : null}
      </button>
      {errorMsg ? (
        <span
          role="status"
          aria-live="polite"
          className="text-[11px] text-rose-700 dark:text-rose-300 max-w-[200px] text-right leading-tight"
        >
          {errorMsg}
        </span>
      ) : null}
    </div>
  );
}
