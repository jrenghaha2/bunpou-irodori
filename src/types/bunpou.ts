export type BookId = 'introductory' | 'elementary1' | 'elementary2';

export type AppTab = 'card' | 'list' | 'quiz' | 'guide' | 'admin';

export type UserRole = 'user' | 'admin' | 'superadmin';

export type DeckStatusFilter = 'all' | 'unmastered' | 'hard';

export type ChapterNumber =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18;

export type ChapterFilter = 'all' | ChapterNumber;

export const BOOK_ORDER: readonly BookId[] = [
  'introductory',
  'elementary1',
  'elementary2',
] as const;

export const BOOK_CHAPTER_RANGES: Record<
  BookId,
  { min: ChapterNumber; max: ChapterNumber; count: number }
> = {
  introductory: { min: 3, max: 18, count: 16 },
  elementary1: { min: 1, max: 18, count: 18 },
  elementary2: { min: 1, max: 18, count: 18 },
};

export interface AbbreviationItem {
  code: string;
  meaning: string;
}

export interface ExampleSentence {
  japanese: string;
  translation: string;
  raw: string;
}

export interface BunpouPattern {
  id: string;
  bookId: BookId;
  bookTitle: string;
  bookShortTitle: string;
  level: 'A1' | 'A2';
  topicJp?: string;
  topicId?: string;
  chapterNumber: ChapterNumber;
  chapterTitleJp: string;
  chapterTitleId: string;
  patternIndex: number;
  itemCode?: string;
  title: string;
  shortPattern: string;
  formulas: string[];
  functionText: string;
  marugotoRef?: string;
  notes: string[];
  examples: ExampleSentence[];
}

export interface ChapterData {
  id: string;
  bookId: BookId;
  topicJp?: string;
  topicId?: string;
  chapterNumber: ChapterNumber;
  titleJp: string;
  titleId: string;
  patterns: BunpouPattern[];
}

export interface BookData {
  id: BookId;
  title: string;
  shortTitle: string;
  japaneseSubtitle: string;
  level: 'A1' | 'A2';
  chapters: ChapterData[];
  totalPatterns: number;
}

export interface ParsedIrodoriDataset {
  abbreviations: AbbreviationItem[];
  books: BookData[];
  allPatterns: BunpouPattern[];
}

export type FormulaTokenKind =
  | 'verb'
  | 'noun'
  | 'adj'
  | 'particle'
  | 'plain'
  | 'operator'
  | 'note'
  | 'text';

export interface FormulaToken {
  text: string;
  kind: FormulaTokenKind;
}

export interface RubySegment {
  text: string;
  reading?: string;
}

export type QuizFocus = 'mixed' | 'cloze' | 'formula' | 'function';
export type QuizQuestionType = 'cloze' | 'formula' | 'function';

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  pattern: BunpouPattern;
  prompt: string;
  promptWithoutTranslation?: string;
  japanesePrompt?: string;
  japaneseFull?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizRecord {
  no: number;
  question: QuizQuestion;
  chosenIndex: number;
  chosenLabel: string;
  correctLabel: string;
  isCorrect: boolean;
}

export interface QuizAnswerSnapshot {
  no: number;
  type: QuizQuestionType;
  correct: boolean;
  patternId: string;
  patternTitle: string;
  shortPattern: string;
  formula: string;
  functionText: string;
  expectedLabel: string;
  chosenLabel: string;
  exampleJp?: string;
}

export interface QuizSessionHistoryEntry {
  id: string;
  completedAt: string;
  bookId: BookId;
  scopeLabel: string;
  chapters?: ChapterNumber[];
  focus: QuizFocus;
  correct: number;
  total: number;
  score: number;
  answers?: QuizAnswerSnapshot[];
}

export interface BookProgressBucket {
  mastered: Set<string>;
  hard: Set<string>;
}

export type AllBooksProgress = Record<BookId, BookProgressBucket>;

export type AllBooksQuizHistory = Record<BookId, QuizSessionHistoryEntry[]>;

export interface BackupParseResult {
  formatType: 'v1' | 'legacy-plain';
  exportedAt: string;
  bookId?: BookId;
  impMastered: string[];
  impHard: string[];
  rejectedIds: string[];
  isEmptyBackup: boolean;
}

export interface PendingRestoreState {
  parsed: BackupParseResult;
  fileName: string;
}

export interface StorageMutationResult {
  ok: boolean;
  error?: string;
}

export interface ToastMessage {
  id: number;
  tone: 'success' | 'error' | 'warning' | 'info';
  title: string;
  detail?: string;
}
