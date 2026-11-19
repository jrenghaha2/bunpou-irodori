import { getPlainSpeechText } from './furiganaConverter';

export interface SpeechResult {
  supported: boolean;
  error?: string;
}

let cachedVoices: SpeechSynthesisVoice[] = [];
let fallbackAudio: HTMLAudioElement | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;

function loadVoices(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    cachedVoices = window.speechSynthesis.getVoices() || [];
  }
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

function playOnlineTTSFallback(
  text: string,
  callbacks?: { onStart?: () => void; onEnd?: () => void }
): void {
  try {
    if (fallbackAudio) {
      fallbackAudio.pause();
      fallbackAudio = null;
    }
    fallbackAudio = new Audio(
      `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=ja&dt=t&q=${encodeURIComponent(text)}`
    );
    fallbackAudio.playbackRate = 0.94;
    fallbackAudio.onplay = () => callbacks?.onStart?.();
    fallbackAudio.onended = () => callbacks?.onEnd?.();
    fallbackAudio.onerror = () => callbacks?.onEnd?.();
    fallbackAudio.play().catch(() => {
      callbacks?.onEnd?.();
    });
  } catch {
    callbacks?.onEnd?.();
  }
}

/**
 * Speaks Japanese text aloud using Web Speech API (ja-JP) with automatic online TTS fallback
 * when no Japanese voice is available in the browser.
 */
export function speakJapanese(
  japaneseText: string,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (msg: string) => void;
  }
): SpeechResult {
  const text = getPlainSpeechText(japaneseText);
  if (!text || typeof window === 'undefined') {
    return { supported: true };
  }

  if (!('speechSynthesis' in window)) {
    playOnlineTTSFallback(text, callbacks);
    return { supported: true };
  }

  try {
    loadVoices();
    const jpVoice =
      cachedVoices.find(v => v.lang === 'ja-JP' && /google|kyoko|otoya|nanami|haruka/i.test(v.name)) ||
      cachedVoices.find(v => v.lang.toLowerCase().startsWith('ja'));

    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    if (jpVoice) utterance.voice = jpVoice;

    activeUtterance = utterance;
    let started = false;

    utterance.onstart = () => {
      started = true;
      callbacks?.onStart?.();
    };
    utterance.onend = () => {
      callbacks?.onEnd?.();
    };
    utterance.onerror = () => {
      if (!started) {
        playOnlineTTSFallback(text, callbacks);
      } else {
        callbacks?.onEnd?.();
      }
    };

    setTimeout(() => {
      if (activeUtterance !== utterance) return;
      window.speechSynthesis.speak(utterance);
      if (!jpVoice) {
        setTimeout(() => {
          if (!started && !window.speechSynthesis.speaking) {
            playOnlineTTSFallback(text, callbacks);
          }
        }, 600);
      }
    }, 40);

    return { supported: true };
  } catch {
    playOnlineTTSFallback(text, callbacks);
    return { supported: true };
  }
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (fallbackAudio) {
    fallbackAudio.pause();
    fallbackAudio = null;
  }
}
