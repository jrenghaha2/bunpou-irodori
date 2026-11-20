# Irodori Bunpou — Pembelajaran Tata Bahasa Jepang (A1–A2)

Aplikasi web interaktif berbahasa Indonesia untuk mempelajari tata bahasa Jepang (**Bunpou**) dari 3 buku resmi **Irodori: Bahasa Jepang untuk Kehidupan di Jepang** (*Japan Foundation*):

- **Pemula (入門 / A1)**: Bab 3–18 (16 Bab · 82 Pola)
- **Dasar 1 (初級1 / A2)**: Bab 1–18 (18 Bab · 95 Pola)
- **Dasar 2 (初級2 / A2)**: Bab 1–18 (18 Bab · 87 Pola)
- **Total**: **52 Bab · 264 Pola Tata Bahasa · 792 Contoh Kalimat** lengkap dengan markup Furigana `{漢字|かな}` dan padanan 『まるごと』.

## Fitur Utama

- **Kartu Hafalan 3D (Flashcard)**: Animasi flip 3D, pintasan keyboard (`Spasi`, `←`/`→`, `H` Hafal, `U` Sulit), filter status (*Semua / Belum Hafal / Tanda Sulit*), dan acak dek.
- **Daftar Bunpou & Pencarian Instan**: Pencarian cepat terindeks berdasarkan pola, rumus, fungsi, hiragana/kanji, maupun terjemahan Indonesia, lengkap dengan kode warna rumus dan audio pelafalan Jepang (Web Speech API `ja-JP`).
- **Kuis Latihan (JFT-Basic / JLPT)**: Pilihan ganda Rumpang (*Cloze* dengan Furigana terjaga), Rumus Penyambungan, Fungsi Pola, dan Campuran — dilengkapi statistik skor dan riwayat 15 sesi terakhir.
- **Sinkronisasi Cloud & Mode Offline**: Login Google / GitHub / Email via Firebase Auth untuk sinkronisasi progres & riwayat kuis lintas perangkat, serta **Backup / Restore JSON** lokal yang tetap tersedia baik saat login maupun tamu.
- **Tema Terang & Gelap** serta toggle **Furigana** global.

## Menjalankan Secara Lokal

```bash
npm install --legacy-peer-deps
npm run dev
```

## Pengujian & Validasi

```bash
npm test            # Unit test logika bunpou, kuis, storage, dataset, & rules
npm run lint        # Pengecekan TypeScript (tsc --noEmit)
npm run lint:rules  # Validasi keamanan firestore.rules
npm run build       # Build produksi Vite
```
