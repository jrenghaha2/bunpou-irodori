import type { BookData, BookId, BunpouPattern, ChapterData, ChapterNumber } from '../types/bunpou';
import { stripFuriganaMarkup } from '../utils/furiganaConverter';

export interface RawExample {
  /** Japanese sentence with optional inline {漢字|かな} ruby markup */
  jp: string;
  /** Natural Indonesian translation */
  id: string;
}

export interface RawPattern {
  code: string;
  title: string;
  formulas: string[];
  functionText: string;
  marugoto?: string;
  notes?: string[];
  examples: RawExample[];
}

export interface RawChapter {
  chapterNumber: ChapterNumber;
  topicJp: string;
  topicId: string;
  titleJp: string;
  titleId: string;
  patterns: RawPattern[];
}

export interface RawBookSpec {
  id: BookId;
  shortTitle: string;
  title: string;
  japaneseSubtitle: string;
  level: 'A1' | 'A2';
  chapters: RawChapter[];
}

export function buildBookFromRaw(spec: RawBookSpec): BookData {
  const chapters: ChapterData[] = spec.chapters.map(ch => {
    const patterns: BunpouPattern[] = ch.patterns.map((pat, idx) => {
      const patternIndex = idx + 1;
      const notes: string[] = [...(pat.notes ?? [])];
      if (pat.marugoto) {
        notes.push(`Padanan 『まるごと』: ${pat.marugoto}`);
      }
      return {
        id: `${spec.id}-bab-${ch.chapterNumber}-p${patternIndex}`,
        bookId: spec.id,
        bookTitle: spec.title,
        bookShortTitle: spec.shortTitle,
        level: spec.level,
        topicJp: ch.topicJp,
        topicId: ch.topicId,
        chapterNumber: ch.chapterNumber,
        chapterTitleJp: ch.titleJp,
        chapterTitleId: ch.titleId,
        patternIndex,
        itemCode: pat.code,
        title: pat.title,
        shortPattern: pat.title.replace(/\s*＜[^＞]+＞/g, '').trim(),
        formulas: pat.formulas.map(stripFuriganaMarkup),
        functionText: pat.functionText,
        marugotoRef: pat.marugoto,
        notes,
        examples: pat.examples.map(ex => ({
          japanese: ex.jp,
          translation: ex.id,
          raw: `${ex.jp} (${ex.id})`,
        })),
      };
    });

    return {
      id: `${spec.id}-bab-${ch.chapterNumber}`,
      bookId: spec.id,
      topicJp: ch.topicJp,
      topicId: ch.topicId,
      chapterNumber: ch.chapterNumber,
      titleJp: ch.titleJp,
      titleId: ch.titleId,
      patterns,
    };
  });

  const totalPatterns = chapters.reduce((sum, ch) => sum + ch.patterns.length, 0);

  return {
    id: spec.id,
    title: spec.title,
    shortTitle: spec.shortTitle,
    japaneseSubtitle: spec.japaneseSubtitle,
    level: spec.level,
    chapters,
    totalPatterns,
  };
}
