import type { RubySegment } from '../types/bunpou';

const RUBY_TOKEN_RE = /\{([^{}|]+)\|([^{}|]+)\}/g;

/**
 * Parses Japanese text with inline `{漢字|かな}` ruby annotations into structured RubySegments.
 * Preserves plain text without altering homonyms.
 */
export function buildRubySegments(japaneseText: string): RubySegment[] {
  if (!japaneseText) return [];
  if (!japaneseText.includes('{') || !japaneseText.includes('|')) {
    return [{ text: japaneseText }];
  }

  const segments: RubySegment[] = [];
  const rubyRegex = new RegExp(RUBY_TOKEN_RE.source, 'g');
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = rubyRegex.exec(japaneseText)) !== null) {
    if (match.index > lastIdx) {
      segments.push({ text: japaneseText.slice(lastIdx, match.index) });
    }
    segments.push({ text: match[1], reading: match[2] });
    lastIdx = rubyRegex.lastIndex;
  }

  if (lastIdx < japaneseText.length) {
    segments.push({ text: japaneseText.slice(lastIdx) });
  }

  return segments;
}

/**
 * Strips inline {漢字|かな} markup returning clean Japanese Kanji text.
 */
export function stripFuriganaMarkup(japaneseText: string): string {
  return japaneseText.replace(RUBY_TOKEN_RE, '$1');
}

/**
 * Strips inline {漢字|かな} markup returning reading-only kana text (useful for hiragana search).
 */
export function extractFuriganaReading(japaneseText: string): string {
  return japaneseText.replace(RUBY_TOKEN_RE, '$2');
}

/**
 * Normalizes Japanese text for Web Speech API (removes ruby markup, extra spaces and blanks).
 */
export function getPlainSpeechText(japaneseText: string): string {
  return stripFuriganaMarkup(japaneseText)
    .replace(/\s+/g, '')
    .replace(/／/g, '、')
    .replace(/―/g, '、')
    .replace(/（　　）/g, '')
    .trim();
}
