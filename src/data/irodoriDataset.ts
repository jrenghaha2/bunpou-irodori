import type { AbbreviationItem, ParsedIrodoriDataset } from '../types/bunpou';
import { IRODORI_DASAR1_SPEC } from './irodoriDasar1';
import { IRODORI_DASAR2_SPEC } from './irodoriDasar2';
import { IRODORI_PEMULA_SPEC } from './irodoriPemula';
import { buildBookFromRaw } from './irodoriTypes';

export const IRODORI_ABBREVIATIONS: AbbreviationItem[] = [
  { code: 'N', meaning: 'Kata Benda (名詞 / Meishi) — mis. 日本、会社、うどん、部屋' },
  { code: 'V-ます', meaning: 'Kata Kerja bentuk sopan Masu (マス形) — mis. 食べます、行きます' },
  { code: 'V-る', meaning: 'Kata Kerja bentuk kamus (辞書形) — mis. 食べる、行く、する' },
  { code: 'V-ない', meaning: 'Kata Kerja bentuk negatif biasa (ナイ形) — mis. 食べない、行かない' },
  { code: 'V-て', meaning: 'Kata Kerja bentuk sambung Te (テ形) — mis. 食べて、行って、飲んで' },
  { code: 'V-た', meaning: 'Kata Kerja bentuk lampau biasa (タ形) — mis. 食べた、行った' },
  { code: 'V-（られ）ます', meaning: 'Kata Kerja bentuk Potensial / "bisa" (可能形) — mis. 行けます、食べられます' },
  { code: 'V-（ら）れます', meaning: 'Kata Kerja bentuk Pasif / "di-..." (受身形) — mis. 開催されます、注意されます' },
  { code: 'V-ば', meaning: 'Kata Kerja bentuk Syarat Ba (条件形) — mis. 行けば、着れば、すれば' },
  { code: 'V-（よ）う', meaning: 'Kata Kerja bentuk Ajakan / Niat Volisional (意志形) — mis. 作ろう、食べよう' },
  { code: 'V（命令形）', meaning: 'Kata Kerja bentuk Perintah tegas (命令形) — mis. 急げ、逃げろ、走るな' },
  { code: 'イA', meaning: 'Kata Sifat-i (イ形容詞) — berakhiran い, mis. 暑い、楽しい、おいしい' },
  { code: 'ナA', meaning: 'Kata Sifat-na (ナ形容詞) — memakai な sebelum N, mis. 静か、便利、好き' },
  { code: 'S（普通形）', meaning: 'Kalimat bentuk biasa / kasual (普通体) — dipakai sebelum と思います、そうです、んです' },
  { code: 'S（丁寧体）', meaning: 'Kalimat bentuk sopan (です／ます) — dipakai dalam percakapan formal/sopan' },
  { code: '【…】', meaning: 'Kategori kosakata spesifik — mis. 【場所】 tempat, 【人】 orang, 【時間】 waktu, 【疑問詞】 kata tanya' },
];

const pemulaBook = buildBookFromRaw(IRODORI_PEMULA_SPEC);
const dasar1Book = buildBookFromRaw(IRODORI_DASAR1_SPEC);
const dasar2Book = buildBookFromRaw(IRODORI_DASAR2_SPEC);

const books = [pemulaBook, dasar1Book, dasar2Book];
const allPatterns = books.flatMap(book => book.chapters.flatMap(ch => ch.patterns));

export const IRODORI_DATASET: ParsedIrodoriDataset = {
  abbreviations: IRODORI_ABBREVIATIONS,
  books,
  allPatterns,
};
