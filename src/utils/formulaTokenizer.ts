import type { FormulaToken, FormulaTokenKind } from '../types/bunpou';

const PARTICLES = new Set([
  'は',
  'が',
  'を',
  'に',
  'で',
  'へ',
  'と',
  'から',
  'まで',
  'までに',
  'より',
  'も',
  'の',
  'か',
  'ね',
  'よ',
  'よね',
  'や',
  'とか',
  'しか',
  'ほど',
  'ので',
  'のに',
  'けど',
  'ば',
  'たら',
  'なら',
  'でも',
  'だけ',
  'ばかり',
  'って',
  'な',
  'し',
  'ずつ',
  'ながら',
  'によって',
  'ために',
  'ように',
  'まま',
  'かどうか',
  'へ / に',
  'に/から',
  'と / や',
]);

const VERB_REGEX =
  /^(?:V(?:\d+)?(?:[-（(][^\s+/、]+)?|Kel\.\s*[I]+|Kelompok\s+[I]+|F\.(?:Kamus|Masu|Te|Nai|Ta|Potensial|Pasif|Perintah|Ajakan|Syarat))$/;

const ADJ_REGEX = /^(?:い-Adj|な-Adj(?:\s*な)?|イA(?:-[^\s+/、]+)?|ナA(?:-[^\s+/、]+)?|Adj|な-Adj・N)$/;

const NOUN_REGEX = /^(?:N\d*(?:\([^)]*\))?(?:\s*の)?|\[[^\]]+\]|【[^】]+】)$/;

const PLAIN_REGEX = /^(?:F\.Biasa|S\d*(?:（[^）]+）|\([^)]+\))?|Kalimat\d*|普通形|普通体|丁寧体)$/;

function classifySinglePiece(piece: string): FormulaTokenKind {
  const trimmed = piece.trim();
  if (!trimmed) return 'text';
  if (trimmed === '+' || trimmed === '/' || trimmed === '→' || trimmed === '->' || trimmed === '、') {
    return 'operator';
  }
  if (
    (trimmed.startsWith('(') && trimmed.endsWith(')')) ||
    (trimmed.startsWith('（') && trimmed.endsWith('）'))
  ) {
    return 'note';
  }
  if (VERB_REGEX.test(trimmed) || /^V\d*[-（(]/.test(trimmed)) {
    return 'verb';
  }
  if (
    ADJ_REGEX.test(trimmed) ||
    trimmed.includes('い-Adj') ||
    trimmed.includes('な-Adj') ||
    trimmed.startsWith('イA') ||
    trimmed.startsWith('ナA')
  ) {
    return 'adj';
  }
  if (
    NOUN_REGEX.test(trimmed) ||
    /^N\d*(?:\/N\d+)?$/.test(trimmed) ||
    (trimmed.startsWith('【') && trimmed.endsWith('】'))
  ) {
    return 'noun';
  }
  if (PLAIN_REGEX.test(trimmed)) {
    return 'plain';
  }
  if (PARTICLES.has(trimmed)) {
    return 'particle';
  }
  return 'text';
}

/**
 * Tokenizes a single Irodori grammar formula line into semantic parts
 * (Kata Kerja, Kata Benda, Kata Sifat, Partikel, Bentuk Biasa, catatan).
 */
export function tokenizeFormula(formulaLine: string): FormulaToken[] {
  const trimmed = formulaLine.trim();
  if (!trimmed) return [];

  // Preserve conjugation rules like "Kelompok I : Ubah vokal..." as clean text with leading badge
  const groupRuleMatch = trimmed.match(/^(Kelompok\s+[I]+|Kel\.\s*[I]+)\s*:\s*(.+)$/);
  if (groupRuleMatch) {
    return [
      { text: groupRuleMatch[1], kind: 'verb' },
      { text: ':', kind: 'operator' },
      { text: groupRuleMatch[2].trim(), kind: 'text' },
    ];
  }

  // Extract trailing Indonesian parenthetical explanation e.g. "(Positif)" or "(Ingin melakukan V)"
  let mainPart = trimmed;
  let trailingNote: string | null = null;
  const trailingMatch = mainPart.match(/^(.*?)\s+(\([^()]{2,}\))$/);
  if (
    trailingMatch &&
    !trailingMatch[2].includes('akar') &&
    !trailingMatch[2].includes('transitif') &&
    !trailingMatch[2].includes('benda') &&
    !trailingMatch[2].includes('makhluk') &&
    !trailingMatch[2].includes('Kango') &&
    !trailingMatch[2].includes('kata serapan') &&
    !trailingMatch[2].includes('bentuk')
  ) {
    mainPart = trailingMatch[1].trim();
    trailingNote = trailingMatch[2].trim();
  }

  const tokens: FormulaToken[] = [];

  // Split around " + " first, preserving "+" operators
  const segments = mainPart.split(/(\s+\+\s+)/);
  for (const seg of segments) {
    if (!seg.trim()) continue;
    if (seg.trim() === '+') {
      tokens.push({ text: '+', kind: 'operator' });
      continue;
    }

    // Check if segment has comma-separated clauses like "V1-て、V2-て、V3-ます" or "から、[Kalimat Akibat]"
    const commaParts = seg.split(/(、)/);
    for (const part of commaParts) {
      const p = part.trim();
      if (!p) continue;
      if (p === '、') {
        tokens.push({ text: '、', kind: 'operator' });
        continue;
      }

      // Check for inline parenthetical modifiers like "い-Adj (coret い)" or "F.Biasa (N + の / な-Adj + な)"
      const parenMatch = p.match(/^([^\s(]+(?:\s+[^\s(]+)?)\s+(\([^)]+\))$/);
      if (parenMatch) {
        const base = parenMatch[1].trim();
        const mod = parenMatch[2].trim();
        tokens.push({ text: base, kind: classifySinglePiece(base) });
        tokens.push({ text: mod, kind: 'note' });
        continue;
      }

      // Check for space-separated combinations like "[Tempat1] から [Tempat2] まで"
      if (p.includes('[') && p.includes(']') && p.includes(' ')) {
        const bracketSplit = p.split(/(\[[^\]]+\])/);
        for (const bp of bracketSplit) {
          const bpt = bp.trim();
          if (!bpt) continue;
          if (bpt.startsWith('[') && bpt.endsWith(']')) {
            tokens.push({ text: bpt, kind: 'noun' });
          } else {
            for (const w of bpt.split(/\s+/)) {
              if (!w) continue;
              tokens.push({ text: w, kind: classifySinglePiece(w) });
            }
          }
        }
        continue;
      }

      // Check for slash-separated alternatives of same or mixed types like "V-る / V-ない"
      if (p.includes(' / ') && !PARTICLES.has(p)) {
        const slashParts = p.split(/(\s+\/\s+)/);
        for (const sp of slashParts) {
          const spt = sp.trim();
          if (!spt) continue;
          if (spt === '/') {
            tokens.push({ text: '/', kind: 'operator' });
          } else {
            tokens.push({ text: spt, kind: classifySinglePiece(spt) });
          }
        }
        continue;
      }

      tokens.push({ text: p, kind: classifySinglePiece(p) });
    }
  }

  if (trailingNote) {
    tokens.push({ text: trailingNote, kind: 'note' });
  }

  return tokens;
}

export const FORMULA_LEGEND: Array<{
  kind: Exclude<FormulaTokenKind, 'operator' | 'note' | 'text'>;
  label: string;
  example: string;
}> = [
  { kind: 'verb', label: 'Kata Kerja', example: 'V-ます / V-て' },
  { kind: 'noun', label: 'Kata Benda', example: 'N / 【場所】' },
  { kind: 'adj', label: 'Kata Sifat', example: 'イA / ナA' },
  { kind: 'particle', label: 'Partikel', example: 'は / が / を / に' },
  { kind: 'plain', label: 'Kalimat / F.Biasa', example: 'S（普通形）' },
];
