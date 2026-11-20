import { getPlainSpeechText } from './furiganaConverter';

export interface SpeechResult {
  supported: boolean;
  error?: string;
}

let cachedVoices: SpeechSynthesisVoice[] = [];
let activeUtterance: SpeechSynthesisUtterance | null = null;
let pendingTimerId: ReturnType<typeof setTimeout> | null = null;

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

export function stopSpeaking(): void {
  if (pendingTimerId !== null) {
    clearTimeout(pendingTimerId);
    pendingTimerId = null;
  }
  activeUtterance = null;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Speaks Japanese text aloud using the browser's built-in Web Speech API (ja-JP).
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
    callbacks?.onEnd?.();
    return { supported: true };
  }

  stopSpeaking();

  if (!('speechSynthesis' in window)) {
    const msg = 'Browser ini tidak mendukung fitur pelafalan audio (Web Speech API).';
    callbacks?.onError?.(msg);
    return { supported: false, error: msg };
  }

  try {
    loadVoices();
    const jpVoice =
      cachedVoices.find(
        v => v.lang === 'ja-JP' && /google|kyoko|otoya|nanami|haruka/i.test(v.name)
      ) || cachedVoices.find(v => v.lang.toLowerCase().startsWith('ja'));

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    if (jpVoice) utterance.voice = jpVoice;

    activeUtterance = utterance;

    utterance.onstart = () => {
      if (activeUtterance !== utterance) return;
      callbacks?.onStart?.();
    };
    utterance.onend = () => {
      if (activeUtterance === utterance) {
        activeUtterance = null;
      }
      callbacks?.onEnd?.();
    };
    utterance.onerror = event => {
      if (activeUtterance === utterance) {
        activeUtterance = null;
      }
      if (event.error === 'canceled' || event.error === 'interrupted') {
        callbacks?.onEnd?.();
        return;
      }
      callbacks?.onError?.('Gagal memutar pelafalan audio pada browser ini.');
    };

    pendingTimerId = setTimeout(() => {
      pendingTimerId = null;
      if (activeUtterance !== utterance) return;
      window.speechSynthesis.speak(utterance);
    }, 35);

    return { supported: true };
  } catch {
    activeUtterance = null;
    const msg = 'Pelafalan audio tidak tersedia saat ini.';
    callbacks?.onError?.(msg);
    return { supported: false, error: msg };
  }
}
