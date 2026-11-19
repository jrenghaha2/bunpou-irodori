import { useMemo } from 'react';
import { buildRubySegments } from '../utils/furiganaConverter';

interface JapaneseTextProps {
  text: string;
  showFurigana: boolean;
  className?: string;
}

export function JapaneseText({ text, showFurigana, className = '' }: JapaneseTextProps) {
  const segments = useMemo(() => buildRubySegments(text), [text]);

  return (
    <span
      lang="ja"
      className={`font-jp ${showFurigana ? 'leading-[2.15]' : 'leading-relaxed'} ${className}`}
    >
      {segments.map((seg, idx) =>
        seg.reading ? (
          <ruby key={idx}>
            {seg.text}
            {showFurigana ? (
              <>
                <rp>(</rp>
                <rt>{seg.reading}</rt>
                <rp>)</rp>
              </>
            ) : null}
          </ruby>
        ) : (
          <span key={idx}>{seg.text}</span>
        )
      )}
    </span>
  );
}
