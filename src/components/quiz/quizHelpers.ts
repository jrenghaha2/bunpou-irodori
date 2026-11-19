import type { QuizFocus, QuizQuestionType } from '../../types/bunpou';

export type QuizCountOption = 5 | 10 | 20 | 'all';

export const QUIZ_COUNT_OPTIONS: readonly { value: QuizCountOption; label: string }[] = [
  { value: 5, label: '5 Soal' },
  { value: 10, label: '10 Soal' },
  { value: 20, label: '20 Soal' },
  { value: 'all', label: 'Semua' },
] as const;

export const QUIZ_FOCUS_OPTIONS: readonly {
  id: QuizFocus;
  label: string;
  desc: string;
}[] = [
  {
    id: 'mixed',
    label: 'Campuran (JFT/JLPT)',
    desc: 'Gabungan rumpang partikel, rumus penyambungan, dan fungsi.',
  },
  {
    id: 'cloze',
    label: 'Isian Rumpang',
    desc: 'Lengkapi partikel atau akhiran pada contoh kalimat asli.',
  },
  {
    id: 'formula',
    label: 'Rumus Penyambungan',
    desc: 'Cocokkan pola bunpou dengan rumus konjugasi yang benar.',
  },
  {
    id: 'function',
    label: 'Fungsi & Makna',
    desc: 'Identifikasi kegunaan utama dari pola tata bahasa Jepang.',
  },
] as const;

export function getFocusLabel(focus: QuizFocus): string {
  switch (focus) {
    case 'cloze':
      return 'Isian Rumpang';
    case 'formula':
      return 'Rumus';
    case 'function':
      return 'Fungsi';
    default:
      return 'Campuran';
  }
}

export function getQuestionTypeLabel(type: QuizQuestionType): string {
  switch (type) {
    case 'cloze':
      return 'Isian Rumpang';
    case 'formula':
      return 'Rumus Penyambungan';
    case 'function':
      return 'Fungsi Bunpou';
  }
}

export function getScoreToneClass(score: number): string {
  if (score >= 80) return 'text-emerald-700 dark:text-emerald-400';
  if (score >= 60) return 'text-amber-700 dark:text-amber-400';
  return 'text-rose-700 dark:text-rose-400';
}

export function getScoreBadgeClass(score: number): string {
  if (score >= 80) {
    return 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200';
  }
  if (score >= 60) {
    return 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200';
  }
  return 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200';
}

export function getScoreMessage(score: number): string {
  if (score >= 90) return 'Luar biasa! Pemahaman tata bahasa Anda sangat kuat.';
  if (score >= 75) return 'Bagus sekali! Sedikit lagi menuju penguasaan penuh.';
  if (score >= 55) return 'Cukup baik. Tinjau kembali pola yang masih keliru di bawah.';
  return 'Tetap semangat! Pelajari ulang rumus dan contoh di kartu hafalan.';
}

export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Baru saja';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 16).replace('T', ' ');
  }
}
