import type { RawBookSpec } from './irodoriTypes';

export const IRODORI_PEMULA_SPEC: RawBookSpec = {
  id: 'introductory',
  shortTitle: 'Pemula',
  title: 'Pemula — いろどり 入門 (A1)',
  japaneseSubtitle: 'いろどり 入門',
  level: 'A1',
  chapters: [
    {
      chapterNumber: 3,
      topicJp: '私のこと',
      topicId: 'Tentang Saya',
      titleJp: '第3課 よろしくお願いします',
      titleId: 'Salam Perkenalan',
      patterns: [
        {
          code: '1',
          title: 'Nです / N1はN2です',
          formulas: [
            'N + です (Menyebutkan identitas secara sopan)',
            'N1 + は + N2 + です (N1 adalah N2)',
          ],
          functionText:
            'Digunakan untuk memperkenalkan diri atau menyatakan identitas/status suatu topik secara sopan. Partikel は dibaca "wa" dan menandai topik kalimat.',
          marugoto: 'N1はN2です（か）／じゃないです / Nはなんですか',
          notes: [
            'Jika topik (N1) sudah jelas dari konteks percakapan, N1は sering dihilangkan menjadi Nです saja.',
          ],
          examples: [
            { jp: 'トンです。{私|わたし}はマルシアです。', id: 'Saya Ton. Saya Marcia.' },
            { jp: '{私|わたし}はインドネシア{人|じん}です。', id: 'Saya orang Indonesia.' },
            { jp: 'こちらは{田中|たなか}さんです。{会社員|かいしゃいん}です。', id: 'Ini adalah Bapak/Ibu Tanaka. Beliau karyawan perusahaan.' },
          ],
        },
        {
          code: '2',
          title: '【場所】から来ました',
          formulas: [
            '【場所】 + から + {来|き}ました (Berasal / datang dari tempat tersebut)',
            '【国・都市】 + から + {来|き}ました',
          ],
          functionText:
            'Menyatakan negara, kota, atau daerah asal saat memperkenalkan diri. から berarti "dari", dan 来ました adalah bentuk lampau sopan dari 来る (datang).',
          marugoto: '→「かつどう」 2.',
          examples: [
            { jp: 'ブラジルから{来|き}ました。', id: 'Saya datang dari Brasil.' },
            { jp: 'インドネシアのジャカルタから{来|き}ました。', id: 'Saya datang dari Jakarta, Indonesia.' },
            { jp: '{私|わたし}は{先月|せんげつ}、ベトナムから{来|き}ました。', id: 'Saya datang dari Vietnam bulan lalu.' },
          ],
        },
        {
          code: '3',
          title: 'Nは？',
          formulas: ['N + は？ (Intonasi naik ↗)'],
          functionText:
            'Bentuk pertanyaan singkat dan alami untuk menanyakan informasi tentang N (seperti nama, asal, atau giliran lawan bicara) ketika konteksnya sudah jelas.',
          marugoto: '→「かつどう」 1.',
          notes: ['Lebih ringkas dan ramah dibanding bertanya dengan kalimat penuh di percakapan sehari-hari.'],
          examples: [
            { jp: 'お{名前|なまえ}は？', id: 'Nama Anda siapa?' },
            { jp: '{私|わたし}はエンジニアです。アリさんは？', id: 'Saya insinyur. Kalau Ari?' },
            { jp: 'お{国|くに}はどちらですか？／お{国|くに}は？', id: 'Dari negara mana? / Asalnya dari mana?' },
          ],
        },
        {
          code: '4',
          title: 'Sか？',
          formulas: [
            'N1 + は + N2 + です + か？ (Apakah N1 adalah N2?)',
            'S（丁寧体） + か？ (Kalimat tanya sopan)',
          ],
          functionText:
            'Menambahkan partikel か di akhir kalimat sopan (です／ます) untuk mengubah kalimat pernyataan menjadi kalimat tanya Ya/Tidak.',
          marugoto: 'N1はN2です（か）／じゃないです / Nはなんですか',
          examples: [
            { jp: 'みなさんは、{友|とも}だちですか？', id: 'Apakah kalian semua teman?' },
            { jp: 'ラニさんは{学生|がくせい}ですか？', id: 'Apakah Rani seorang pelajar?' },
            { jp: 'ここは{図書館|としょかん}ですか？', id: 'Apakah di sini perpustakaan?' },
          ],
        },
        {
          code: '5',
          title: 'Nも',
          formulas: [
            'N + も + … (N juga …)',
            'N2 + も + N1 + です (Menggantikan partikel は)',
          ],
          functionText:
            'Partikel も berarti "juga". Dipakai ketika keterangan pada N2 sama dengan hal yang telah disebutkan sebelumnya, menggantikan partikel は.',
          marugoto: 'Nも',
          examples: [
            { jp: 'ケマラさんも、ベトナムからですか？', id: 'Apakah Kemara juga dari Vietnam?' },
            { jp: '{私|わたし}もインドネシアから{来|き}ました。', id: 'Saya juga datang dari Indonesia.' },
            { jp: '{山田|やまだ}さんは{先生|せんせい}です。{佐藤|さとう}さんも{先生|せんせい}です。', id: 'Pak Yamada guru. Bu Sato juga guru.' },
          ],
        },
        {
          code: '6',
          title: 'Nじゃないです',
          formulas: [
            'N + じゃないです (Bukan N — sopan sehari-hari)',
            'N + じゃありません / ではありません (Lebih formal)',
          ],
          functionText:
            'Bentuk penyangkalan (negatif) sopan untuk kata benda. Menyatakan bahwa sesuatu "bukan N".',
          marugoto: 'N1はN2です（か）／じゃないです / Nはなんですか',
          examples: [
            { jp: 'ベトナムじゃないです。カンボジアです。', id: 'Bukan Vietnam. Kamboja.' },
            { jp: '{私|わたし}は{学生|がくせい}じゃないです。{会社員|かいしゃいん}です。', id: 'Saya bukan pelajar. Saya karyawan perusahaan.' },
            { jp: 'これは{私|わたし}の{傘|かさ}じゃないです。', id: 'Ini bukan payung saya.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 4,
      topicJp: '私のこと',
      topicId: 'Tentang Saya',
      titleJp: '第4課 東京に住んでいます',
      titleId: 'Saya Tinggal di Tokyo',
      patterns: [
        {
          code: '1',
          title: 'N1とN2',
          formulas: ['N1 + と + N2 (N1 dan N2 — menyebutkan secara lengkap)'],
          functionText:
            'Partikel と menghubungkan dua atau lebih kata benda yang setara ("dan"), digunakan saat menyebutkan semua item yang dimaksud.',
          marugoto: 'N1【人】とN2【人】',
          examples: [
            { jp: '{夫|おっと}と{子|こ}どもです。', id: 'Suami dan anak saya.' },
            { jp: '{父|ちち}と{母|はは}と{妹|いもうと}がいます。', id: 'Saya punya ayah, ibu, dan adik perempuan.' },
            { jp: '{東京|とうきょう}と{大阪|おおさか}に{友|とも}だちがいます。', id: 'Saya punya teman di Tokyo dan Osaka.' },
          ],
        },
        {
          code: '2',
          title: '【疑問表現】ですか？',
          formulas: [
            '{何歳|なんさい} / どこ / だれ / {何人|なんにん} + ですか？',
            'N + は + 【疑問表現】 + ですか？',
          ],
          functionText:
            'Menggunakan kata tanya (何歳 berapa umur, どこ di mana, だれ siapa, 何人 berapa orang) diikuti ですか？ untuk menanyakan informasi spesifik.',
          marugoto: '→「かつどう」 2.',
          examples: [
            { jp: 'お{子|こ}さんは{何歳|なんさい}ですか？', id: 'Anak Anda umurnya berapa tahun?' },
            { jp: 'ご{家族|かぞく}は{何人|なんにん}ですか？', id: 'Keluarga Anda ada berapa orang?' },
            { jp: 'お{仕事|しごと}は{何|なん}ですか？', id: 'Pekerjaan Anda apa?' },
          ],
        },
        {
          code: '3',
          title: '【場所】に住んでいます',
          formulas: [
            '【場所】 + に + {住|す}んでいます (Tinggal di tempat tersebut)',
            'N（人） + は + 【場所】 + に + {住|す}んでいます',
          ],
          functionText:
            'Menyatakan tempat tinggal seseorang saat ini. Kata kerja 住む selalu dipakai dalam bentuk 住んでいます untuk menyatakan kondisi menetap.',
          marugoto: 'N【場所】に住んでいます',
          examples: [
            { jp: '{家族|かぞく}は、フィリピンに{住|す}んでいます。', id: 'Keluarga saya tinggal di Filipina.' },
            { jp: '{今|いま}、{東京|とうきょう}の{新宿|しんじゅく}に{住|す}んでいます。', id: 'Sekarang saya tinggal di Shinjuku, Tokyo.' },
            { jp: '{兄|あに}は{大阪|おおさか}に{住|す}んでいます。', id: 'Kakak laki-laki saya tinggal di Osaka.' },
          ],
        },
        {
          code: '4',
          title: 'N1のN2',
          formulas: [
            'N1 + の + N2 (N2 milik N1 / N2 dari N1)',
            'N1（属性・関係） + の + N2（名前・具体）',
          ],
          functionText:
            'Partikel の menghubungkan dua kata benda untuk menunjukkan kepemilikan, hubungan keluarga, afiliasi, atau keterangan penjelas (aposisi, seperti "hewan peliharaan bernama John").',
          marugoto: 'N1【人】のN2【人】',
          examples: [
            { jp: '{私|わたし}の{母|はは}です。ペットのジョンです。', id: 'Ini ibu saya. Ini John, hewan peliharaan saya.' },
            { jp: 'これは{私|わたし}の{家族|かぞく}の{写真|しゃしん}です。', id: 'Ini foto keluarga saya.' },
            { jp: '{日本語|にほんご}の{先生|せんせい}の{鈴木|すずき}さんです。', id: 'Ini Ibu Suzuki, guru bahasa Jepang saya.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 5,
      topicJp: '好きな食べ物',
      topicId: 'Makanan Kesukaan',
      titleJp: '第5課 うどんが好きです',
      titleId: 'Saya Suka Udon',
      patterns: [
        {
          code: '1a',
          title: 'Nが好きです',
          formulas: ['（N1は） + N2 + が + {好|す}きです (Menyukai N2)'],
          functionText:
            'Menyatakan benda, makanan, atau hal yang disukai. Objek yang disukai ditandai oleh partikel が (bukan を).',
          marugoto: 'Nが好きです',
          examples: [
            { jp: '{肉|にく}と{野菜|やさい}が{好|す}きです。', id: 'Saya suka daging dan sayuran.' },
            { jp: '{私|わたし}はうどんがとても{好|す}きです。', id: 'Saya sangat suka udon.' },
            { jp: '{日本|にほん}のカレーが{好|す}きです。', id: 'Saya suka kari Jepang.' },
          ],
        },
        {
          code: '1b',
          title: 'Nは好きじゃないです',
          formulas: [
            'N + は + {好|す}きじゃないです (Tidak suka N)',
            'N + は + あまり + {好|す}きじゃないです (Tidak terlalu suka N)',
          ],
          functionText:
            'Menyatakan ketidaksukaan terhadap N. Dalam kalimat negatif, partikel が sering diganti menjadi は untuk menonjolkan kontras atau memperhalus pernyataan.',
          marugoto: 'Nは好きじゃないです',
          examples: [
            { jp: '{魚|さかな}は{好|す}きじゃないです。', id: 'Saya tidak suka ikan.' },
            { jp: '{納豆|なっとう}はあまり{好|す}きじゃないです。', id: 'Saya tidak terlalu suka natto.' },
            { jp: '{辛|から}い{料理|りょうり}は{好|す}きじゃないです。', id: 'Saya tidak suka masakan pedas.' },
          ],
        },
        {
          code: '2',
          title: 'Nはちょっと…',
          formulas: ['N + は + ちょっと… (Penolakan / ketidaksukaan secara halus)'],
          functionText:
            'Ungkapan sopan khas Jepang untuk menolak tawaran atau menyatakan bahwa kita kurang menyukai/tidak bisa makan N tanpa mengatakannya secara blak-blakan.',
          marugoto: '→「りかい」聞きましょう (入門 7課)',
          examples: [
            { jp: 'わさびは、ちょっと…。', id: 'Kalau wasabi, agak kurang cocok…' },
            { jp: 'すみません、お{酒|さけ}はちょっと…。', id: 'Maaf, kalau alkohol saya kurang bisa…' },
            { jp: '{生|なま}の{魚|さかな}はちょっと…。', id: 'Kalau ikan mentah, saya kurang suka…' },
          ],
        },
        {
          code: '3a',
          title: 'V-ますか？（マス形）',
          formulas: ['（Nを） + V-ます + か？ (Apakah melakukan V? / Mau V?)'],
          functionText:
            'Kalimat tanya sopan menggunakan kata kerja bentuk ます untuk menanyakan kebiasaan atau menawarkan sesuatu kepada lawan bicara.',
          marugoto: '→「かつどう」 2.',
          examples: [
            { jp: 'お{茶|ちゃ}、{飲|の}みますか？', id: 'Apakah Anda mau minum teh?' },
            { jp: '{毎朝|まいあさ}、コーヒーを{飲|の}みますか？', id: 'Apakah setiap pagi Anda minum kopi?' },
            { jp: 'あした、{一緒|いっしょ}に{昼|ひる}ご{飯|はん}を{食|た}べますか？', id: 'Besok apakah mau makan siang bersama?' },
          ],
        },
        {
          code: '3b',
          title: 'V-る？（辞書形）',
          formulas: ['（N） + V-る？（Intonasi naik ↗ — bentuk kasual）'],
          functionText:
            'Bentuk tanya kasual menggunakan kata kerja bentuk kamus (辞書形) dengan intonasi naik, dipakai kepada teman akrab atau keluarga tanpa partikel か.',
          marugoto: 'S（普通体） S（丁寧体） (初中級 トピック4)',
          examples: [
            { jp: '{何|なに}、{飲|の}む？', id: 'Mau minum apa?' },
            { jp: 'このお菓子、{食|た}べる？', id: 'Mau makan camilan ini?' },
            { jp: '{今日|きょう}、コンビニに{行|い}く？', id: 'Hari ini mau pergi ke minimarket?' },
          ],
        },
        {
          code: '4',
          title: 'NをV-ます',
          formulas: ['N（Objek） + を + V-ます (Melakukan V terhadap N)'],
          functionText:
            'Partikel を (dibaca "o") menandai objek langsung dari kata kerja transitif seperti 食べます (makan), 飲みます (minum), 見ます (melihat).',
          marugoto: 'NをV-ます',
          examples: [
            { jp: 'シリアルを{食|た}べます。', id: 'Saya makan sereal.' },
            { jp: '{毎日|まいにち}、{水|みず}をたくさん{飲|の}みます。', id: 'Setiap hari saya minum banyak air.' },
            { jp: '{昼|ひる}は{弁当|べんとう}を{食|た}べます。', id: 'Siang hari saya makan bekal.' },
          ],
        },
        {
          code: '5a',
          title: '（Nは）V-ません',
          formulas: ['（Nは） + V-ません (Tidak melakukan V — sopan)'],
          functionText:
            'Bentuk negatif sopan dari kata kerja bentuk ます. Mengubah ます → ません untuk menyatakan tidak melakukan kebiasaan atau menolak.',
          marugoto: 'NはV-ません',
          examples: [
            { jp: '{私|わたし}は、{朝|あさ}ご{飯|はん}は、あまり{食|た}べません。', id: 'Saya tidak terlalu sering sarapan.' },
            { jp: 'お{酒|さけ}は{飲|の}みません。', id: 'Saya tidak minum alkohol.' },
            { jp: '{豚肉|ぶたにく}は{食|た}べません。', id: 'Saya tidak makan daging babi.' },
          ],
        },
        {
          code: '5b',
          title: '（Nは）V-ないです',
          formulas: [
            '（Nは） + V-ない + です (Tidak melakukan V — sopan percakapan)',
            'Kel.I: vokal u→a + ない / Kel.II: coret る + ない / する→しない / 来る→来ない',
          ],
          functionText:
            'Bentuk negatif sopan yang sangat sering digunakan dalam percakapan alami sehari-hari di Jepang, sejajar dengan V-ません namun terasa lebih lembut dan akrab.',
          marugoto: 'V-ないです / N／ナA-じゃありません / イA-くありません (初中級 トピック3)',
          examples: [
            { jp: '{私|わたし}も、{食|た}べないです。', id: 'Saya juga tidak makan.' },
            { jp: 'コーヒーは{夜|よる}は{飲|の}まないです。', id: 'Kalau malam saya tidak minum kopi.' },
            { jp: '{砂糖|さとう}は{入|い}れないです。', id: 'Saya tidak memasukkan gula.' },
          ],
        },
        {
          code: '6',
          title: 'あまりV-ません ＜頻度＞',
          formulas: ['あまり + V-ません / V-ないです (Jarang / tidak terlalu sering)'],
          functionText:
            'Kata keterangan あまり selalu berpasangan dengan kalimat negatif (V-ません / V-ないです) untuk menyatakan frekuensi yang rendah ("jarang / tidak terlalu sering").',
          marugoto: 'よくV-ます / あまりV-ません',
          examples: [
            { jp: '{朝|あさ}ご{飯|はん}は、あまり{食|た}べません。', id: 'Saya jarang sarapan.' },
            { jp: '{外食|がいしょく}はあまりしません。', id: 'Saya tidak terlalu sering makan di luar.' },
            { jp: '{甘|あま}いものはあまり{食|た}べないです。', id: 'Saya jarang makan makanan manis.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 6,
      topicJp: '好きな食べ物',
      topicId: 'Makanan Kesukaan',
      titleJp: '第6課 チーズバーガーください',
      titleId: 'Minta Cheeseburger',
      patterns: [
        {
          code: '1',
          title: 'N、お願いします / N、ください',
          formulas: [
            'N + 、お{願|ねが}いします (Tolong N — sangat sopan untuk memesan)',
            'N + 、ください (Minta N — saat memesan atau membeli)',
          ],
          functionText:
            'Ungkapan dasar untuk memesan makanan/minuman di restoran atau membeli barang di toko. お願いします bernuansa sedikit lebih halus dan formal daripada ください.',
          marugoto: '→「かつどう」 2. (入門 5課)',
          examples: [
            { jp: 'ホットコーヒー、お{願|ねが}いします。これ、ください。', id: 'Tolong kopi panas. Minta yang ini.' },
            { jp: 'チーズバーガーとポテト、ください。', id: 'Minta cheeseburger dan kentang goreng.' },
            { jp: 'お{水|みず}、お{願|ねが}いします。', id: 'Tolong air putihnya.' },
          ],
        },
        {
          code: '2',
          title: 'Nにします',
          formulas: ['（N1は） + N2 + にします (Saya pilih / memutuskan N2)'],
          functionText:
            'Digunakan untuk menyatakan keputusan pilihan sendiri, terutama saat memilih menu di restoran atau memilih barang.',
          marugoto: '→「かつどう」 3. (初級1 11課)',
          examples: [
            { jp: '{私|わたし}は、うどんにします。', id: 'Kalau saya, pilih udon saja.' },
            { jp: '{飲|の}み{物|もの}はオレンジジュースにします。', id: 'Minumannya saya pilih jus jeruk.' },
            { jp: '{今日|きょう}のランチは{定食|ていしょく}にします。', id: 'Makan siang hari ini saya pilih paket teishoku.' },
          ],
        },
        {
          code: '3',
          title: 'N、【数】お願いします / N、【数】ください',
          formulas: [
            'N + 、【数】 + お{願|ねが}いします (Tolong N sebanyak jumlah tertentu)',
            'N1 + 【数】と、N2 + 【数】 + ください',
          ],
          functionText:
            'Menyebutkan jumlah pesanan menggunakan kata bilangan (1つ hitotsu, 2つ futatsu, 3つ mittsu, dst.) langsung setelah nama item.',
          marugoto: '→「かつどう」 2. (入門 5課)',
          examples: [
            { jp: '{生|なま}ビール3つと、ウーロン{茶|ちゃ}1つ、お{願|ねが}いします。{枝豆|えだまめ}2つ、ください。', id: 'Tolong 3 bir draft dan 1 teh oolong. Minta 2 edamame.' },
            { jp: '唐{揚|あ}げを2つと、ご{飯|はん}を1つお{願|ねが}いします。', id: 'Tolong 2 karaage dan 1 nasi.' },
            { jp: 'おにぎり3つ、ください。', id: 'Minta 3 onigiri.' },
          ],
        },
        {
          code: '4',
          title: 'N（は）ありますか？',
          formulas: ['N + （は） + ありますか？ (Apakah ada N?)'],
          functionText:
            'Menanyakan ketersediaan suatu benda, menu, atau bumbu di restoran maupun toko.',
          marugoto: '→「かつどう」 2. (入門 16課)',
          examples: [
            { jp: 'マヨネーズ、ありますか？', id: 'Apakah ada mayones?' },
            { jp: '{英語|えいご}のメニューはありますか？', id: 'Apakah ada menu bahasa Inggris?' },
            { jp: 'すみません、フォークはありますか？', id: 'Permisi, apakah ada garpu?' },
          ],
        },
      ],
    },
    {
      chapterNumber: 7,
      topicJp: '家と職場',
      topicId: 'Rumah dan Tempat Kerja',
      titleJp: '第7課 部屋が4つあります',
      titleId: 'Ada 4 Ruangan',
      patterns: [
        {
          code: '1',
          title: 'ここは【場所】です',
          formulas: ['ここ / そこ / あそこ + は + 【場所】 + です'],
          functionText:
            'Memperkenalkan atau menjelaskan nama suatu ruangan/tempat saat memandu seseorang berkeliling rumah atau tempat kerja.',
          marugoto: '→「かつどう」 3. (入門 8課)',
          examples: [
            { jp: 'ここは{玄関|げんかん}です。', id: 'Di sini adalah pintu masuk (genkan).' },
            { jp: 'ここは{台所|だいどころ}です。あそこはトイレです。', id: 'Di sini dapur. Di sana toilet.' },
            { jp: 'ここは{会議室|かいぎしつ}です。', id: 'Di sini adalah ruang rapat.' },
          ],
        },
        {
          code: '2a',
          title: '【場所】にNがあります',
          formulas: ['【場所】 + に + N（物・場所） + が + あります'],
          functionText:
            'Menyatakan keberadaan benda mati, perabotan, atau fasilitas di suatu tempat. Partikel に menandai lokasi keberadaan.',
          marugoto: 'N1【場所】にN2【物】があります／【物】はありません',
          examples: [
            { jp: 'ここに{階段|かいだん}があります。', id: 'Di sini ada tangga.' },
            { jp: '{部屋|へや}にエアコンとテレビがあります。', id: 'Di kamar ada AC dan TV.' },
            { jp: '{寮|りょう}の1{階|かい}に{洗濯機|せんたくき}があります。', id: 'Di lantai 1 asrama ada mesin cuci.' },
          ],
        },
        {
          code: '2b',
          title: '【場所】にNが【数】あります',
          formulas: ['【場所】 + に + N + が + 【数】 + あります'],
          functionText:
            'Menyatakan jumlah benda atau ruangan yang ada di suatu lokasi. Kata bilangan diletakkan tepat sebelum あります.',
          marugoto: 'Nが【数】あります',
          examples: [
            { jp: '1{階|かい}に{部屋|へや}が4つあります。', id: 'Di lantai 1 ada 4 ruangan.' },
            { jp: 'この{部屋|へや}に{窓|まど}が2つあります。', id: 'Di ruangan ini ada 2 jendela.' },
            { jp: '{家|いえ}にトイレが2つあります。', id: 'Di rumah ada 2 toilet.' },
          ],
        },
        {
          code: '3',
          title: '（Nは）ありません／ないです',
          formulas: [
            '（【場所】に） + N + は + ありません (Tidak ada N — sopan standar)',
            '（【場所】に） + N + は + ないです (Tidak ada N — sopan percakapan)',
          ],
          functionText:
            'Bentuk negatif dari あります untuk menyatakan tidak adanya suatu benda atau fasilitas. Partikel が berubah menjadi は.',
          marugoto: 'N1【場所】にN2【物】があります／【物】はありません',
          examples: [
            { jp: 'トースターはありません。ベッドはないです。', id: 'Tidak ada pemanggang roti. Tempat tidur juga tidak ada.' },
            { jp: '{部屋|へや}にテレビはありません。', id: 'Di kamar tidak ada televisi.' },
            { jp: 'このアパートにはエレベーターがないです。', id: 'Di apartemen ini tidak ada lift.' },
          ],
        },
        {
          code: '4',
          title: 'ナA-です / イA-いです',
          formulas: [
            'N + は + ナA + です (Kata sifat-na tanpa な + です)',
            'N + は + イA-い + です (Kata sifat-i + です)',
          ],
          functionText:
            'Menjelaskan sifat atau keadaan suatu benda/tempat secara positif dan sopan menggunakan kata sifat-na (静か, きれい, 便利) atau kata sifat-i (せまい, 広い, 新しい).',
          marugoto: 'NはイA-いです / イA-くないです',
          examples: [
            { jp: '{家|いえ}は{静|しず}かです。ちょっとせまいです。', id: 'Rumahnya tenang. Agak sempit.' },
            { jp: '{私|わたし}の{部屋|へや}は{明|あか}るいです。', id: 'Kamar saya terang.' },
            { jp: 'このアパートは{駅|えき}に{近|ちか}くて{便利|べんり}です。', id: 'Apartemen ini dekat stasiun dan praktis.' },
          ],
        },
        {
          code: '5',
          title: 'ナA-じゃないです / イA-くないです',
          formulas: [
            'ナA + じゃないです / じゃありません (Tidak ナA)',
            'イA（coret い） + くないです (Tidak イA；いい → よくないです)',
          ],
          functionText:
            'Bentuk negatif sopan untuk kata sifat-na dan kata sifat-i. Perhatikan pengecualian いい (bagus) → よくないです.',
          marugoto: 'NはイA-いです / イA-くないです',
          examples: [
            { jp: 'アパートは、あまり{静|しず}かじゃないです。{寮|りょう}は{広|ひろ}くないです。', id: 'Apartemennya tidak terlalu tenang. Asramanya tidak luas.' },
            { jp: 'この{部屋|へや}はあまり{新|あたら}しくないです。', id: 'Kamar ini tidak terlalu baru.' },
            { jp: '{駅|えき}から{遠|とお}くないです。', id: 'Tidak jauh dari stasiun.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 8,
      topicJp: '家と職場',
      topicId: 'Rumah dan Tempat Kerja',
      titleJp: '第8課 山田さんはどこにいますか？',
      titleId: 'Di Mana Pak Yamada?',
      patterns: [
        {
          code: '1',
          title: '【場所】でV-ます',
          formulas: ['【場所】 + で + （Nを） + V-ます (Melakukan aktivitas V di tempat)'],
          functionText:
            'Partikel で menandai tempat berlangsungnya suatu aktivitas atau tindakan (berbeda dari に yang menandai keberadaan statis).',
          marugoto: 'N【場所】でV-ます (入門 6課)',
          examples: [
            { jp: 'ここで{着替|きが}えます。', id: 'Ganti baju di sini.' },
            { jp: '{食堂|しょくどう}で{昼|ひる}ご{飯|はん}を{食|た}べます。', id: 'Makan siang di kantin.' },
            { jp: '{休憩室|きゅうけいしつ}でコーヒーを{飲|の}みます。', id: 'Minum kopi di ruang istirahat.' },
          ],
        },
        {
          code: '2',
          title: '【人】は【場所】にいます',
          formulas: [
            '【人】 + は + 【場所】 + に + います (Berada di tempat)',
            '【人】 + は + どこ + に + いますか？ (Ada di mana?)',
          ],
          functionText:
            'Menyatakan atau menanyakan lokasi keberadaan makhluk hidup (orang/hewan) menggunakan います.',
          marugoto: 'N1【人】はN2にいます (入門 14課)',
          examples: [
            { jp: '{山田|やまだ}さんは、{食堂|しょくどう}にいます。', id: 'Pak Yamada ada di kantin.' },
            { jp: '{店長|てんちょう}は{事務所|じむしょ}にいます。', id: 'Manajer toko ada di kantor.' },
            { jp: 'リーさんはどこにいますか？', id: 'Li ada di mana?' },
          ],
        },
        {
          code: '3',
          title: '（【人】は）いません／いないです',
          formulas: [
            '（【人】は） + いません (Tidak ada — sopan standar)',
            '（【人】は） + いないです (Tidak ada — sopan percakapan)',
          ],
          functionText:
            'Bentuk negatif dari います untuk menyatakan bahwa seseorang tidak sedang berada di tempat tersebut.',
          marugoto: 'N1【場所】にN2【生物】がいます／【生物】はいません (入門 7課)',
          examples: [
            { jp: '{辻|つじ}さんは、いませんね。アマンダさん、いないですね。', id: 'Pak Tsuji tidak ada ya. Amanda juga tidak ada ya.' },
            { jp: '{今|いま}、{受付|うけつけ}に{誰|だれ}もいません。', id: 'Sekarang tidak ada siapa pun di resepsionis.' },
            { jp: '{今日|きょう}は{高橋|たかはし}さんはいないです。', id: 'Hari ini Pak Takahashi tidak ada (tidak masuk).' },
          ],
        },
        {
          code: '4',
          title: '【もの】は【ここ／そこ／あそこ】にあります',
          formulas: ['【もの】 + は + ここ / そこ / あそこ + に + あります'],
          functionText:
            'Menjelaskan letak suatu benda yang sudah diketahui topik pembicaraannya menggunakan kata tunjuk tempat ここ (sini), そこ (situ), あそこ (sana).',
          marugoto: 'N1はN2にあります (入門 14課)',
          examples: [
            { jp: 'はさみは、そこにあります。', id: 'Guntingnya ada di situ.' },
            { jp: 'コピー{機|き}はあそこにあります。', id: 'Mesin fotokopi ada di sana.' },
            { jp: 'ゴミ{箱|ばこ}はここにありますよ。', id: 'Tempat sampahnya ada di sini lho.' },
          ],
        },
        {
          code: '5',
          title: 'Nの【位置】にあります',
          formulas: [
            'N + の + {中|なか} / {上|うえ} / {下|した} / {前|まえ} / {後|うし}ろ / {横|よこ} / {隣|となり} + に + あります',
          ],
          functionText:
            'Menjelaskan posisi benda secara spesifik relatif terhadap benda lain (di dalam 中, di atas 上, di bawah 下, di depan 前, di samping 横).',
          marugoto: 'N1はN2のN3（位置）です',
          examples: [
            { jp: '{引|ひ}き{出|だ}しの{中|なか}にあります。', id: 'Ada di dalam laci.' },
            { jp: 'ノートは{机|つくえ}の{上|うえ}にあります。', id: 'Buku catatan ada di atas meja.' },
            { jp: '{段|だん}ボールは{棚|たな}の{下|した}にあります。', id: 'Kardus ada di bawah rak.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 9,
      topicJp: '毎日の生活',
      topicId: 'Kehidupan Sehari-hari',
      titleJp: '第9課 12時から1時まで昼休みです',
      titleId: 'Istirahat Siang dari Jam 12 sampai Jam 1',
      patterns: [
        {
          code: '1',
          title: '【時間】に／ごろV-ます',
          formulas: [
            '【時間】 + に + V-ます (Pada jam tepat tertentu)',
            '【時間】 + ごろ + V-ます (Sekitar jam tertentu)',
          ],
          functionText:
            'Partikel に menunjukkan waktu spesifik terjadinya kegiatan, sedangkan ごろ berarti "kira-kira/sekitar" (tidak wajib disertai に).',
          marugoto: '～時に／ごろV-ます',
          examples: [
            { jp: '5{時|じ}に{起|お}きます。11{時|じ}ごろ{寝|ね}ます。', id: 'Saya bangun jam 5. Tidur sekitar jam 11.' },
            { jp: '{毎朝|まいあさ}、7{時|じ}{半|はん}に{家|いえ}を{出|で}ます。', id: 'Setiap pagi saya keluar rumah jam 7.30.' },
            { jp: '{仕事|しごと}は6{時|じ}ごろ{終|お}わります。', id: 'Pekerjaan selesai sekitar jam 6.' },
          ],
        },
        {
          code: '2',
          title: '【時間】から【時間】まで',
          formulas: [
            '【時間1】 + から + 【時間2】 + まで + Nです / V-ます',
            '【曜日1】 + から + 【曜日2】 + まで',
          ],
          functionText:
            'Menyatakan rentang waktu mulai (から = dari) hingga selesai (まで = sampai) untuk jam kerja, jam istirahat, atau hari kerja.',
          marugoto: 'N1【時間】からN2【時間】まで (入門 10課)',
          examples: [
            { jp: '12{時|じ}から1{時|じ}まで、{昼休|ひるやす}みです。', id: 'Dari jam 12 sampai jam 1 adalah istirahat siang.' },
            { jp: '{月曜日|げつようび}から{金曜日|きんようび}まで{働|はたら}きます。', id: 'Saya bekerja dari hari Senin sampai Jumat.' },
            { jp: '{銀行|ぎんこう}は9{時|じ}から3{時|じ}までです。', id: 'Bank buka dari jam 9 sampai jam 3.' },
          ],
        },
        {
          code: '3',
          title: '【日時】がいいです',
          formulas: ['（Nは） + 【日時・曜日】 + が + いいです (Memilih jadwal yang cocok)'],
          functionText:
            'Menyatakan hari atau jam yang diinginkan/paling cocok saat mengatur jadwal rapat, kelas, atau janji temu.',
          marugoto: 'N【曜日･時間】がいいです / Nはだめです (入門 10課)',
          examples: [
            { jp: '{私|わたし}は、{土曜日|どようび}がいいです。', id: 'Kalau saya, hari Sabtu saja cocok.' },
            { jp: '{午後|ごご}3{時|じ}がいいです。', id: 'Jam 3 sore cocok untuk saya.' },
            { jp: '{水曜日|すいようび}の{午前|ごぜん}がいいですが、どうですか？', id: 'Rabu pagi bagus bagi saya, bagaimana?' },
          ],
        },
      ],
    },
    {
      chapterNumber: 10,
      topicJp: '毎日の生活',
      topicId: 'Kehidupan Sehari-hari',
      titleJp: '第10課 ホチキス貸してください',
      titleId: 'Tolong Pinjamkan Stapler',
      patterns: [
        {
          code: '1a',
          title: 'V-てください / V-て',
          formulas: [
            'V-て + ください (Tolong lakukan V — sopan)',
            'V-て (Tolong lakukan V — kasual kepada teman/rekan akrab)',
          ],
          functionText:
            'Meminta bantuan atau memberi instruksi kepada orang lain. V-てください untuk sopan, sedangkan V-て saja untuk rekan akrab.',
          marugoto: 'V-てください (初級1 6課)',
          examples: [
            { jp: 'ちょっと、{手伝|てつだ}ってください。そこのドライバー、{取|と}って。', id: 'Tolong bantu sebentar. Ambilkan obeng di situ.' },
            { jp: 'ここに{名前|なまえ}を{書|か}いてください。', id: 'Tolong tulis nama Anda di sini.' },
            { jp: 'すみません、もう{一度|いちど}{言|い}ってください。', id: 'Maaf, tolong ucapkan sekali lagi.' },
          ],
        },
        {
          code: '1b',
          title: 'V-てくれる？',
          formulas: ['V-て + くれる？（Intonasi naik ↗ — permintaan ramah/kasual）'],
          functionText:
            'Meminta tolong secara santai namun lembut kepada teman, rekan kerja akrab, atau anggota keluarga ("Bisa tolong ...?").',
          marugoto: '※文法項目としては該当なし (Tidak ada item tata bahasa padanan)',
          examples: [
            { jp: '{窓|まど}、{閉|し}めてくれる？', id: 'Bisa tolong tutup jendelanya?' },
            { jp: 'この{荷物|にもつ}、ちょっと{持|も}ってくれる？', id: 'Bisa tolong pegang barang ini sebentar?' },
            { jp: 'エアコン、つけてくれる？', id: 'Bisa tolong nyalakan AC-nya?' },
          ],
        },
        {
          code: '2',
          title: 'Nですね ＜確認＞',
          formulas: ['N + ですね (Mengonfirmasi ulang informasi atau pesanan)'],
          functionText:
            'Digunakan untuk memastikan kembali detail (jumlah, nama, jadwal) yang baru saja disampaikan lawan bicara agar tidak terjadi salah paham.',
          marugoto: '→「かつどう」 1. (入門 8課)',
          examples: [
            { jp: 'A：これ、コピー、30{枚|まい}お{願|ねが}い。 B：はい、30{枚|まい}ですね。', id: 'A: Tolong fotokopi ini 30 lembar. B: Baik, 30 lembar ya.' },
            { jp: 'あしたの10{時|じ}ですね。わかりました。', id: 'Besok jam 10 ya. Baik, saya mengerti.' },
            { jp: '{色|いろ}は{黒|くろ}ですね。', id: 'Warnanya hitam ya.' },
          ],
        },
        {
          code: '3a',
          title: 'N、貸してください',
          formulas: ['N + （を） + {貸|か}してください (Tolong pinjamkan N)'],
          functionText:
            'Meminta izin meminjam barang milik orang lain secara sopan. 貸す berarti "meminjamkan".',
          marugoto: 'V-てください (初級1 6課)',
          examples: [
            { jp: 'ホチキス、{貸|か}してください。', id: 'Tolong pinjamkan stapler.' },
            { jp: 'すみません、ボールペンを{貸|か}してください。', id: 'Permisi, tolong pinjamkan pulpen.' },
            { jp: 'ちょっとハサミ、{貸|か}してください。', id: 'Tolong pinjamkan gunting sebentar.' },
          ],
        },
        {
          code: '3b',
          title: 'N、借りてもいいですか？',
          formulas: ['（Nを） + {借|か}りてもいいですか？ (Bolehkah saya meminjam N?)'],
          functionText:
            'Meminta izin dengan lebih sopan untuk meminjam barang. 借りる berarti "meminjam".',
          marugoto: 'V-てもいいですか (初級1 14課)',
          examples: [
            { jp: 'すみません。{借|か}りてもいいですか？', id: 'Permisi. Bolehkah saya pinjam?' },
            { jp: 'この{辞書|じしょ}、{借|か}りてもいいですか？', id: 'Bolehkah saya meminjam kamus ini?' },
            { jp: 'ペン、ちょっと{借|か}りてもいいですか？', id: 'Bolehkah saya pinjam pulpennya sebentar?' },
          ],
        },
        {
          code: '3c',
          title: 'N、いいですか？',
          formulas: ['N + 、いいですか？ (Apakah N boleh dipakai/dipinjam/diambil?)'],
          functionText:
            'Ungkapan ringkas dan sangat alami untuk meminta izin memakai barang, duduk di kursi, atau meminta perhatian lawan bicara.',
          marugoto: '※文法項目としては該当なし',
          examples: [
            { jp: 'これ、いいですか？', id: 'Boleh saya pakai/pinjam yang ini?' },
            { jp: 'すみません、{今|いま}ちょっと、いいですか？', id: 'Permisi, boleh minta waktunya sebentar sekarang?' },
            { jp: 'この{椅子|いす}、いいですか？', id: 'Bolehkah saya memakai kursi ini?' },
          ],
        },
        {
          code: '3d',
          title: 'N、ありますか？',
          formulas: ['N + 、ありますか？ (Apakah kamu punya / ada N?)'],
          functionText:
            'Menanyakan apakah lawan bicara membawa atau memiliki barang yang sedang dibutuhkan.',
          marugoto: '→「かつどう」 2. (入門 16課)',
          examples: [
            { jp: 'スマホの{充電器|じゅうでんき}、ありますか？', id: 'Apakah ada charger HP?' },
            { jp: 'すみません、セロテープ、ありますか？', id: 'Permisi, apakah ada selotip?' },
            { jp: '{黒|くろ}いマジック、ありますか？', id: 'Apakah ada spidol hitam?' },
          ],
        },
      ],
    },
    {
      chapterNumber: 11,
      topicJp: '私の好きなこと',
      topicId: 'Hal yang Saya Sukai',
      titleJp: '第11課 どんなマンガが好きですか？',
      titleId: 'Manga Seperti Apa yang Kamu Suka?',
      patterns: [
        {
          code: '1',
          title: 'Nは何ですか？',
          formulas: ['N + は + {何|なん}ですか？ (N-nya apa?)'],
          functionText:
            'Menanyakan isi atau detail dari suatu kategori umum seperti hobi (趣味), makanan favorit, atau pekerjaan.',
          marugoto: 'N1はN2です（か）／じゃないです / Nはなんですか (入門 3課)',
          examples: [
            { jp: '{趣味|しゅみ}は、{何|なん}ですか？', id: 'Hobi Anda apa?' },
            { jp: '{好|す}きな{食|た}べ{物|もの}は{何|なん}ですか？', id: 'Makanan kesukaan Anda apa?' },
            { jp: '{電話番号|でんわばんごう}は{何|なん}ですか？', id: 'Nomor teleponnya berapa?' },
          ],
        },
        {
          code: '2',
          title: 'どんなN',
          formulas: ['どんな + N + が{好|す}きですか / ですか？ (N yang seperti apa?)'],
          functionText:
            'Kata tanya どんな diletakkan sebelum kata benda untuk menanyakan jenis, sifat, atau kategori spesifik dari N.',
          marugoto: '→「りかい」聞きましょう',
          examples: [
            { jp: 'どんなスポーツが{好|す}きですか？', id: 'Olahraga seperti apa yang Anda suka?' },
            { jp: 'どんな{音楽|おんがく}をよく{聞|き}きますか？', id: 'Musik seperti apa yang sering Anda dengarkan?' },
            { jp: 'どんな{映画|えいが}が{好|す}きですか？', id: 'Film seperti apa yang Anda suka?' },
          ],
        },
        {
          code: '3',
          title: 'あまりナA-じゃないです／イA-くないです ＜程度＞',
          formulas: [
            'あまり + ナA + じゃないです (Tidak terlalu ナA)',
            'あまり + イA（coret い） + くないです (Tidak terlalu イA)',
          ],
          functionText:
            'Menyatakan tingkat/derajat yang tidak tinggi ("tidak terlalu ...") ketika dipasangkan dengan bentuk negatif kata sifat.',
          marugoto: '→「りかい」読解',
          examples: [
            { jp: 'スポーツは、あまり{好|す}きじゃないです。', id: 'Saya tidak terlalu suka olahraga.' },
            { jp: 'このゲームはあまり{難|むずか}しくないです。', id: 'Game ini tidak terlalu sulit.' },
            { jp: '{歌|うた}はあまり{上手|じょうず}じゃないです。', id: 'Saya tidak terlalu pandai menyanyi.' },
          ],
        },
        {
          code: '4a',
          title: '【いつも／たいてい／よく／ときどき】V-ます ＜頻度＞',
          formulas: ['いつも / たいてい / よく / ときどき + V-ます'],
          functionText:
            'Kata keterangan frekuensi kalimat positif: いつも (selalu), たいてい (biasanya), よく (sering), ときどき (kadang-kadang).',
          marugoto: 'ときどきV-ます / あまり／ぜんぜんV-ません',
          examples: [
            { jp: '{休|やす}みの{日|ひ}は、たいてい、{映画|えいが}を{見|み}ます。', id: 'Di hari libur, saya biasanya menonton film.' },
            { jp: '{週末|しゅうまつ}はよく{図書館|としょかん}で{本|ほん}を{読|よ}みます。', id: 'Akhir pekan saya sering membaca buku di perpustakaan.' },
            { jp: 'ときどき{友|とも}だちとカラオケに{行|い}きます。', id: 'Kadang-kadang saya pergi karaoke bersama teman.' },
          ],
        },
        {
          code: '4b',
          title: '【あまり／ぜんぜん】V-ません ＜頻度＞',
          formulas: [
            'あまり + V-ません / V-ない (Jarang)',
            'ぜんぜん + V-ません / V-ない (Sama sekali tidak)',
          ],
          functionText:
            'Kata keterangan frekuensi negatif: あまり (jarang) dan ぜんぜん (sama sekali tidak), selalu diikuti kata kerja bentuk negatif.',
          marugoto: 'ときどきV-ます / あまり／ぜんぜんV-ません',
          examples: [
            { jp: 'スポーツは、ぜんぜんしないね。', id: 'Kamu sama sekali tidak berolahraga ya.' },
            { jp: 'テレビはあまり{見|み}ません。', id: 'Saya jarang menonton TV.' },
            { jp: 'マンガはぜんぜん{読|よ}みません。', id: 'Saya sama sekali tidak membaca manga.' },
          ],
        },
        {
          code: '5',
          title: '【人】と／【場所】でV-ます',
          formulas: ['【人】 + と + 【場所】 + で + V-ます (Melakukan V bersama seseorang di suatu tempat)'],
          functionText:
            'Partikel と menandai partner/rekan beraktivitas ("bersama"), sedangkan で menandai tempat aktivitas berlangsung.',
          marugoto: 'N【場所】でV-ます',
          examples: [
            { jp: '{夫|おっと}と{公園|こうえん}でテニスをします。', id: 'Saya bermain tenis bersama suami di taman.' },
            { jp: '{友|とも}だちとカフェで{勉強|べんきょう}します。', id: 'Saya belajar bersama teman di kafe.' },
            { jp: '{家族|かぞく}と{家|いえ}で{映画|えいが}を{見|み}ます。', id: 'Saya menonton film bersama keluarga di rumah.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 12,
      topicJp: '私の好きなこと',
      topicId: 'Hal yang Saya Sukai',
      titleJp: '第12課 いっしょに飲みに行きませんか？',
      titleId: 'Maukah Pergi Minum Bersama?',
      patterns: [
        {
          code: '1',
          title: '【日時】に【場所】で【イベント】があります',
          formulas: ['【日時】 + に + 【場所】 + で + 【イベント】 + が + あります'],
          functionText:
            'Menyatakan jadwal dan lokasi penyelenggaraan suatu acara/festival. Acara menggunakan で untuk tempat dan あります berarti "diadakan".',
          marugoto: 'N1【日付・曜日】にN2【イベント】があります',
          examples: [
            { jp: '{日曜日|にちようび}に、さくら{公園|こうえん}でタイフェスティバルがありますね。', id: 'Hari Minggu ada Festival Thailand di Taman Sakura ya.' },
            { jp: '{来週|らいしゅう}の{土曜日|どようび}に{駅前|えきまえ}でお{祭|まつ}りがあります。', id: 'Sabtu depan ada festival di depan stasiun.' },
            { jp: '{明日|あした}、ホールでコンサートがあります。', id: 'Besok ada konser di aula.' },
          ],
        },
        {
          code: '2',
          title: 'Nに行きます',
          formulas: ['N（場所・イベント） + に + {行|い}きます (Pergi ke N)'],
          functionText:
            'Menyatakan tujuan tempat atau acara yang akan didatangi. Partikel に menunjukkan titik tujuan perpindahan.',
          marugoto: 'Nに行きます (初級1 8課)',
          examples: [
            { jp: '{明日|あした}の{忘年会|ぼうねんかい}に{行|い}きますか？', id: 'Apakah kamu akan pergi ke pesta akhir tahun besok?' },
            { jp: '{日曜日|にちようび}に{美術館|びじゅつかん}に{行|い}きます。', id: 'Hari Minggu saya akan pergi ke museum seni.' },
            { jp: '{今度|こんど}、{花見|はなみ}に{行|い}きます。', id: 'Lain kali saya akan pergi melihat bunga sakura.' },
          ],
        },
        {
          code: '3',
          title: 'V-ませんか？',
          formulas: ['（いっしょに） + V-ませんか？ (Maukah melakukan V bersama?)'],
          functionText:
            'Mengajak seseorang secara sopan sambil menghormati pilihan/kesediaan lawan bicara ("Maukah ...?").',
          marugoto: 'V-ませんか',
          examples: [
            { jp: 'いっしょに{行|い}きませんか？', id: 'Maukah pergi bersama?' },
            { jp: '{土曜日|どようび}に{映画|えいが}を{見|み}ませんか？', id: 'Maukah menonton film pada hari Sabtu?' },
            { jp: '{仕事|しごと}のあとで、コーヒーを{飲|の}みませんか？', id: 'Maukah minum kopi sepulang kerja?' },
          ],
        },
        {
          code: '4',
          title: 'V-ましょう',
          formulas: ['V-ましょう (Ayo melakukan V / Mari kita V)'],
          functionText:
            'Menyatakan ajakan yang antusias ("Ayo!") atau menyetujui ajakan lawan bicara dengan hangat.',
          marugoto: 'V-ましょう',
          examples: [
            { jp: 'また{今度|こんど}{行|い}きましょう。', id: 'Ayo pergi lain kali!' },
            { jp: 'いいですね！いっしょに{食|た}べましょう。', id: 'Ide bagus! Ayo makan bersama.' },
            { jp: 'ちょっと{休|やす}みましょう。', id: 'Ayo istirahat sebentar.' },
          ],
        },
        {
          code: '5',
          title: 'V-に行きます',
          formulas: [
            'V（akar ます） + に + {行|い}きます / {来|き}ます / {帰|かえ}ります',
            'Contoh: {食|た}べます → {食|た}べに{行|い}きます / {飲|の}みます → {飲|の}みに{行|い}きます',
          ],
          functionText:
            'Menyatakan tujuan kegiatan saat pergi/datang/pulang ("pergi untuk melakukan V"). Ambil akar bentuk ます lalu tambahkan に + 行きます.',
          marugoto: 'NをV-ますに行きます',
          examples: [
            { jp: 'みんなで、いっしょに{焼肉|やきにく}を{食|た}べに{行|い}きませんか？', id: 'Maukah kita semua pergi makan yakiniku bersama?' },
            { jp: '{週末|しゅうまつ}、{靴|くつ}を{買|か}いに{行|い}きます。', id: 'Akhir pekan saya akan pergi membeli sepatu.' },
            { jp: '{駅前|えきまえ}のカフェにケーキを{食|た}べに{行|い}きましょう。', id: 'Ayo pergi ke kafe depan stasiun untuk makan kue.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 13,
      topicJp: '街を歩く',
      topicId: 'Berjalan di Kota',
      titleJp: '第13課 このバスは空港に行きますか？',
      titleId: 'Apakah Bus Ini Pergi ke Bandara?',
      patterns: [
        {
          code: '1',
          title: 'この【乗り物】は【場所】に行きますか？',
          formulas: ['この + 【乗り物】 + は + 【場所】 + に + {行|い}きますか？'],
          functionText:
            'Menanyakan arah/tujuan kendaraan umum (bus, kereta) kepada sopir atau petugas sebelum naik.',
          marugoto: '※文法項目としては該当なし',
          examples: [
            { jp: 'このバスは、{空港|くうこう}に{行|い}きますか？', id: 'Apakah bus ini pergi ke bandara?' },
            { jp: 'この{電車|でんしゃ}は{東京駅|とうきょうえき}に{行|い}きますか？', id: 'Apakah kereta ini menuju Stasiun Tokyo?' },
            { jp: 'すみません、このバスは{市役所|しやくしょ}に{行|い}きますか？', id: 'Permisi, apakah bus ini pergi ke balai kota?' },
          ],
        },
        {
          code: '2',
          title: 'ここは【場所】ですか？',
          formulas: ['ここは + 【場所】 / どこ + ですか？'],
          functionText:
            'Memastikan lokasi tempat kita berada saat ini atau menanyakan nama tempat saat sedang mencari arah.',
          marugoto: '※文法項目としては該当なし',
          examples: [
            { jp: 'ここは、どこですか？', id: 'Di sini di mana?' },
            { jp: 'すみません、ここは{北口|きたぐち}ですか？', id: 'Permisi, apakah di sini pintu keluar utara?' },
            { jp: 'ここは3番{線|せん}のホームですか？', id: 'Apakah di sini peron jalur 3?' },
          ],
        },
        {
          code: '3',
          title: '【乗り物】で来ます',
          formulas: ['【乗り物】 + で + {来|き}ます / {行|い}きます / {帰|かえ}ります (Menggunakan transportasi)'],
          functionText:
            'Partikel で menandai alat transportasi yang dipakai untuk berpindah tempat. Catatan: berjalan kaki memakai 歩いて (tanpa で).',
          marugoto: 'N1【場所】からN2【場所】までN3【手段】でV-ます',
          examples: [
            { jp: 'バイクで{来|き}ます。', id: 'Saya datang naik motor.' },
            { jp: '{毎日|まいにち}、{電車|でんしゃ}で{会社|かいしゃ}に{行|い}きます。', id: 'Setiap hari saya pergi ke kantor naik kereta.' },
            { jp: '{駅|えき}からバスで{帰|かえ}ります。', id: 'Dari stasiun saya pulang naik bus.' },
          ],
        },
        {
          code: '4',
          title: '【時間／期間】かかります',
          formulas: [
            '【時間／期間】 + かかります (Memerlukan waktu selama ...)',
            'どのぐらい + かかりますか？ (Berapa lama waktunya?)',
          ],
          functionText:
            'Menyatakan durasi waktu yang diperlukan untuk menempuh perjalanan atau menyelesaikan suatu hal.',
          marugoto: '～時間V-ます (入門 10課)',
          examples: [
            { jp: '1{時間半|じかんはん}かかります。', id: 'Memakan waktu satu setengah jam.' },
            { jp: '{家|いえ}から{駅|えき}まで{歩|ある}いて10{分|ぷん}かかります。', id: 'Dari rumah ke stasiun jalan kaki memakan waktu 10 menit.' },
            { jp: '{空港|くうこう}までバスでどのぐらいかかりますか？', id: 'Ke bandara naik bus kira-kira memakan waktu berapa lama?' },
          ],
        },
        {
          code: '5',
          title: '【場所】で【乗り物】に乗ります / 【場所】で【乗り物】を降ります',
          formulas: [
            '【場所】 + で + 【乗り物】 + に + {乗|の}ります (Naik kendaraan di tempat)',
            '【場所】 + で + 【乗り物】 + を + {降|お}ります (Turun kendaraan di tempat)',
          ],
          functionText:
            'Perhatikan perbedaan partikelnya: 乗ります (naik) menggunakan に, sedangkan 降ります (turun) menggunakan を. Lokasi naik/turun memakai で atau から.',
          marugoto: 'N1【場所】でN2【乗り物】に乗ります／を降ります',
          examples: [
            { jp: 'ここから、12{番|ばん}のバスに{乗|の}ります。バスセンターで、バスを{降|お}ります。', id: 'Dari sini naik bus nomor 12. Turun bus di Terminal Bus.' },
            { jp: '{新宿|しんじゅく}で{山手線|やまのてせん}に{乗|の}ります。', id: 'Naik jalur Yamanote di Shinjuku.' },
            { jp: '{次|つぎ}の{駅|えき}で{電車|でんしゃ}を{降|お}ります。', id: 'Saya turun kereta di stasiun berikutnya.' },
          ],
        },
        {
          code: '6',
          title: '【場所】から【場所】まで',
          formulas: ['【場所1】 + から + 【場所2】 + まで + （【乗り物】で） + V-ます'],
          functionText:
            'Menyatakan titik awal keberangkatan (から = dari) hingga titik tujuan akhir (まで = sampai).',
          marugoto: 'N1【場所】からN2【場所】までN3【手段】でV-ます',
          examples: [
            { jp: 'ここから{新|しん}みなと{駅|えき}まで、{電車|でんしゃ}に{乗|の}ります。', id: 'Dari sini sampai Stasiun Shin-Minato saya naik kereta.' },
            { jp: '{寮|りょう}から{工場|こうじょう}まで{自転車|じてんしゃ}で15{分|ふん}です。', id: 'Dari asrama sampai pabrik 15 menit naik sepeda.' },
            { jp: '{東京|とうきょう}から{京都|きょうと}まで{新幹線|しんかんせん}で{行|い}きます。', id: 'Dari Tokyo sampai Kyoto pergi naik Shinkansen.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 14,
      topicJp: '街を歩く',
      topicId: 'Berjalan di Kota',
      titleJp: '第14課 大きな建物ですね',
      titleId: 'Bangunan yang Besar ya',
      patterns: [
        {
          code: '1',
          title: '【場所】にN（は）ありますか？',
          formulas: ['【場所】 + に + N + （は） + ありますか？'],
          functionText:
            'Menanyakan keberadaan fasilitas umum (minimarket, ATM, pos, restoran) di sekitar lokasi tertentu.',
          marugoto: 'N1【場所】にN2があります',
          examples: [
            { jp: 'この{近|ちか}くに、コンビニはありますか？', id: 'Di dekat sini, apakah ada minimarket?' },
            { jp: '{駅|えき}の{中|なか}にATMはありますか？', id: 'Di dalam stasiun apakah ada ATM?' },
            { jp: 'この{辺|あた}りに{郵便局|ゆうびんきょく}はありますか？', id: 'Di sekitar sini apakah ada kantor pos?' },
          ],
        },
        {
          code: '2',
          title: 'Nの【位置】にいます',
          formulas: ['（{今|いま}、） + N + の + 【位置】 + に + います'],
          functionText:
            'Memberitahukan posisi diri sendiri atau seseorang saat janjian bertemu (misalnya di depan gerbang tiket, di samping kafe).',
          marugoto: 'N1【人】はN2にいます',
          examples: [
            { jp: '{今|いま}、{改札|かいさつ}の{前|まえ}にいます。', id: 'Sekarang saya ada di depan gerbang tiket.' },
            { jp: '{本屋|ほんや}の{横|よこ}にいますよ。', id: 'Saya ada di samping toko buku lho.' },
            { jp: '{北口|きたぐち}のベンチの{近|ちか}くにいます。', id: 'Saya ada di dekat bangku Pintu Utara.' },
          ],
        },
        {
          code: '3',
          title: 'ナA-なNですね / イA-いNですね',
          formulas: [
            'ナA + な + N + ですね (Kata sifat-na wajib memakai な sebelum N)',
            'イA-い + N + ですね (Kata sifat-i langsung menempel pada N)',
          ],
          functionText:
            'Menerangkan kata benda dengan kata sifat (modifikasi nomina) sekaligus mengungkapkan kesan/kekaguman bersama lawan bicara (ですね).',
          marugoto: 'イA-い／ナA-な＋N',
          examples: [
            { jp: 'にぎやかな{通|とお}りですね。{広|ひろ}い{公園|こうえん}ですね。', id: 'Jalan yang ramai ya. Taman yang luas ya.' },
            { jp: 'きれいな{建物|たてもの}ですね。', id: 'Bangunan yang indah ya.' },
            { jp: '{静|しず}かな{町|まち}ですね。', id: 'Kota yang tenang ya.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 15,
      topicJp: '店で',
      topicId: 'Di Toko',
      titleJp: '第15課 電池がほしいんですが…',
      titleId: 'Saya Ingin Membeli Baterai...',
      patterns: [
        {
          code: '1',
          title: 'Nがほしいんですが',
          formulas: [
            'N + が + ほしい + んですが… (Saya ingin N, tapi... — pembuka sopan)',
            'N + が + ほしいです (Saya menginginkan benda N)',
          ],
          functionText:
            'Menyatakan barang yang ingin dibeli/dicari dengan akhiran んですが… agar terasa halus dan memberi ruang bagi staf toko untuk membantu.',
          marugoto: 'Nが欲しいです',
          examples: [
            { jp: '{電池|でんち}がほしいんですが、どこで{買|か}えますか？{延長|えんちょう}コードがほしいんですが…。', id: 'Saya ingin membeli baterai, bisa dibeli di mana ya? Saya mencari kabel sambungan…' },
            { jp: '{冬|ふゆ}のコートがほしいんですが、どこにありますか？', id: 'Saya ingin mencari mantel musim dingin, ada di sebelah mana ya?' },
            { jp: '{日本語|にほんご}の{辞書|じしょ}がほしいんですが…。', id: 'Saya sedang mencari kamus bahasa Jepang…' },
          ],
        },
        {
          code: '2',
          title: 'ナA-ですね / イA-いですね / ナA！ / イA-い!',
          formulas: [
            'N + 、ナA + ですね / イA-い + ですね (Sopan)',
            'N + 、ナA！ / イA-い！ (Kasual / spontan saat melihat barang)',
          ],
          functionText:
            'Mengungkapkan komentar atau pujian langsung saat melihat barang di toko atau membandingkan produk bersama teman.',
          marugoto: '→「かつどう」 1. (入門 16課)',
          examples: [
            { jp: 'このコート、おしゃれですね。この{傘|かさ}、おもしろいですね。このコート、すてき！このバッグ、かわいい！', id: 'Mantel ini modis ya. Payung ini unik ya. Mantel ini keren! Tas ini lucu!' },
            { jp: 'このスニーカー、{軽|かる}いですね。', id: 'Sepatu kets ini ringan ya.' },
            { jp: 'わあ、このマグカップ、きれい！', id: 'Wah, mug ini cantik sekali!' },
          ],
        },
      ],
    },
    {
      chapterNumber: 16,
      topicJp: '店で',
      topicId: 'Di Toko',
      titleJp: '第16課 これ、いくらですか？',
      titleId: 'Ini Harganya Berapa?',
      patterns: [
        {
          code: '1',
          title: '【これ／それ／あれ】（は）いくらですか？',
          formulas: ['これ / それ / あれ + （は） + いくらですか？'],
          functionText:
            'Menanyakan harga barang menggunakan kata tunjuk benda: これ (dekat pembicara), それ (dekat lawan bicara), あれ (jauh dari keduanya).',
          marugoto: 'N【これ／それ／あれ】はいくらですか',
          examples: [
            { jp: 'これ、いくらですか？', id: 'Ini harganya berapa?' },
            { jp: 'すみません、あれはいくらですか？', id: 'Permisi, yang di sana itu harganya berapa?' },
            { jp: 'それは{全部|ぜんぶ}でいくらですか？', id: 'Itu semuanya jadi berapa?' },
          ],
        },
        {
          code: '2',
          title: '【この／その／あの】N',
          formulas: ['この / その / あの + N (Harus selalu diikuti Kata Benda)'],
          functionText:
            'Kata tunjuk penjelas yang langsung menempel di depan kata benda: このN (N ini), そのN (N itu), あのN (N yang di sana).',
          marugoto: '可能① NがV-（られ）ます',
          examples: [
            { jp: 'そのカレンダー、いくらですか？', id: 'Kalender itu harganya berapa?' },
            { jp: 'このジャケットを{見|み}せてください。', id: 'Tolong perlihatkan jaket ini.' },
            { jp: 'あの{赤|あか}いかばんをください。', id: 'Tolong berikan tas merah yang di sana itu.' },
          ],
        },
        {
          code: '3',
          title: '【数量】ずつ',
          formulas: ['N1とN2 + 、【数量】 + ずつ + お{願|ねが}いします / ください'],
          functionText:
            'Partikel ずつ berarti "masing-masing", digunakan ketika memesan atau membagi jumlah yang sama untuk setiap jenis item.',
          marugoto: 'N【数】ずつ (初級2 3課)',
          examples: [
            { jp: 'チョコレートケーキとチーズケーキ、2{個|こ}ずつお{願|ねが}いします。', id: 'Tolong kue cokelat dan cheesecake, masing-masing 2 buah.' },
            { jp: 'りんごとみかんを3つずつ{買|か}いました。', id: 'Saya membeli apel dan jeruk masing-masing 3 buah.' },
            { jp: '{毎日|まいにち}、{漢字|かんじ}を5つずつ{覚|おぼ}えます。', id: 'Setiap hari saya menghafal 5 kanji satu per satu (masing-masing 5).' },
          ],
        },
      ],
    },
    {
      chapterNumber: 17,
      topicJp: '休みの日に',
      topicId: 'Di Hari Libur',
      titleJp: '第17課 映画を見に行きました',
      titleId: 'Saya Pergi Menonton Film',
      patterns: [
        {
          code: '1',
          title: 'V-ました / V-ませんでした',
          formulas: [
            'V-ました (Telah melakukan V — lampau positif sopan)',
            'V-ませんでした (Tidak melakukan V — lampau negatif sopan)',
          ],
          functionText:
            'Menceritakan kegiatan yang sudah dilakukan atau tidak dilakukan di waktu lampau (kemarin, akhir pekan lalu, hari libur).',
          marugoto: 'V-ました / V-ませんでした',
          examples: [
            { jp: '{家|いえ}でゆっくりしました。{週末|しゅうまつ}は、{何|なに}もしませんでした。', id: 'Saya bersantai di rumah. Akhir pekan lalu saya tidak melakukan apa-apa.' },
            { jp: '{昨日|きのう}、{友|とも}だちと{映画|えいが}を{見|み}に{行|い}きました。', id: 'Kemarin saya pergi menonton film bersama teman.' },
            { jp: '{日曜日|にちようび}は{早|はや}く{起|お}きませんでした。', id: 'Hari Minggu saya tidak bangun pagi.' },
          ],
        },
        {
          code: '2',
          title: '何もV-ませんでした / どこにもV-ませんでした',
          formulas: [
            '{何|なに}も + V-ませんでした (Tidak melakukan apa pun)',
            'どこにも + V-ませんでした (Tidak pergi ke mana pun)',
          ],
          functionText:
            'Kata tanya + も diikuti kata kerja negatif lampau menyatakan penyangkalan total ("sama sekali tidak apa-apa / tidak ke mana-mana").',
          marugoto: 'どこにも／なにもV-ません',
          examples: [
            { jp: '{週末|しゅうまつ}は、{何|なに}もしませんでした。{私|わたし}は、どこにも{行|い}きませんでした。', id: 'Akhir pekan lalu saya tidak melakukan apa-apa. Saya tidak pergi ke mana-mana.' },
            { jp: '{昨日|きのう}は{忙|いそが}しくて、{昼|ひる}ご{飯|はん}は{何|なに}も{食|た}べませんでした。', id: 'Kemarin sibuk, jadi saya tidak makan siang apa pun.' },
            { jp: '{休|やす}みの{日|ひ}は{誰|だれ}にも{会|あ}いませんでした。', id: 'Di hari libur saya tidak bertemu siapa pun.' },
          ],
        },
        {
          code: '3a',
          title: 'ナA-でした',
          formulas: ['N + は + ナA + でした (Bentuk lampau positif kata sifat-na)'],
          functionText:
            'Mengungkapkan kesan atau keadaan di masa lampau menggunakan kata sifat-na (です → でした).',
          marugoto: 'ナA-でした / ナA-じゃなかったです',
          examples: [
            { jp: '「ゴジラ」は、まあまあでした。', id: 'Film "Godzilla" lumayan (biasa saja).' },
            { jp: '{京都|きょうと}の{桜|さくら}はとてもきれいでした。', id: 'Bunga sakura di Kyoto sangat indah.' },
            { jp: '{会場|かいじょう}はとてもにぎやかでした。', id: 'Lokasi acaranya sangat ramai.' },
          ],
        },
        {
          code: '3b',
          title: 'イA-かったです',
          formulas: [
            'イA（coret い） + かったです (Lampau positif kata sifat-i)',
            'Pengecualian: いい → よかったです',
          ],
          functionText:
            'Mengungkapkan kesan atau perasaan di masa lampau dengan kata sifat-i (mis. 楽しい → 楽しかったです, おいしい → おいしかったです).',
          marugoto: 'イA-かったです / イA-くなかったです',
          examples: [
            { jp: '{国際|こくさい}フェスティバルは、とても{楽|たの}しかったです。', id: 'Festival internasionalnya sangat menyenangkan.' },
            { jp: '{昨日|きのう}のラーメンはすごくおいしかったです。', id: 'Ramen kemarin sangat enak.' },
            { jp: '{天気|てんき}がよくて、よかったです。', id: 'Cuacanya cerah, syukurlah.' },
          ],
        },
        {
          code: '4',
          title: 'Nでした',
          formulas: ['N + でした (Lampau positif kata benda)'],
          functionText:
            'Bentuk lampau sopan dari Nです untuk menjelaskan cuaca, hari, atau situasi yang sudah berlalu.',
          marugoto: 'N／イA／ナAです／でした / V-ます／ました (初級1 4課)',
          examples: [
            { jp: 'とてもいい{天気|てんき}でした。', id: 'Cuacanya sangat cerah.' },
            { jp: '{昨日|きのう}は{私|わたし}の{誕生日|たんじょうび}でした。', id: 'Kemarin adalah hari ulang tahun saya.' },
            { jp: '{日曜日|にちようび}は{雨|あめ}でした。', id: 'Hari Minggu kemarin turun hujan.' },
          ],
        },
        {
          code: '5',
          title: 'N-じゃなかったです / ナA-じゃなかったです / イA-くなかったです',
          formulas: [
            'N / ナA + じゃなかったです (Lampau negatif N / ナA)',
            'イA（coret い） + くなかったです (Lampau negatif イA；いい → よくなかったです)',
          ],
          functionText:
            'Bentuk negatif lampau sopan untuk kata benda, kata sifat-na, dan kata sifat-i.',
          marugoto: 'N／イA／ナAです／でした / V-ます／ました (初級1 4課)',
          examples: [
            { jp: '{温泉|おんせん}に{入|はい}りました。でも、{露天風呂|ろてんぶろ}じゃなかったです。{富士山|ふじさん}に{登|のぼ}りました。あまり{大変|たいへん}じゃなかったです。お{客|きゃく}さんは、あまり{多|おお}くなかったです。', id: 'Saya masuk pemandian air panas. Tapi bukan pemandian terbuka. Saya mendaki Gunung Fuji, tidak terlalu berat. Pengunjungnya tidak terlalu banyak.' },
            { jp: '{昨日|きのう}はそんなに{寒|さむ}くなかったです。', id: 'Kemarin tidak begitu dingin.' },
            { jp: '{道|みち}はあまり{便利|べんり}じゃなかったです。', id: 'Jalannya tidak terlalu praktis.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 18,
      topicJp: '休みの日に',
      topicId: 'Di Hari Libur',
      titleJp: '第18課 温泉に入りたいです',
      titleId: 'Saya Ingin Berendam di Onsen',
      patterns: [
        {
          code: '1',
          title: 'V-たいです',
          formulas: [
            'V（akar ます） + たいです (Ingin melakukan V)',
            'V（akar ます） + たくないです (Tidak ingin melakukan V)',
            'Catatan: Partikel objek を sering berganti menjadi が sebelum V-たいです',
          ],
          functionText:
            'Menyatakan keinginan atau harapan diri sendiri untuk melakukan suatu kegiatan (berkonjugasi seperti kata sifat-i).',
          marugoto: 'V-たいです／たくないです',
          examples: [
            { jp: '{炊飯器|すいはんき}が{買|か}いたいです。', id: 'Saya ingin membeli penanak nasi.' },
            { jp: '{冬|ふゆ}に{温泉|おんせん}に{入|はい}りたいです。', id: 'Musim dingin saya ingin berendam di onsen.' },
            { jp: '{本物|ほんもの}の{寿司|すし}が{食|た}べたいです。', id: 'Saya ingin makan sushi asli.' },
          ],
        },
        {
          code: '2',
          title: 'どこかV-ます',
          formulas: ['どこか + （に／へ） + V-ます (Ke suatu tempat — tidak spesifik)'],
          functionText:
            'どこか berarti "suatu tempat (mana saja)", digunakan saat ingin pergi atau berwisata tanpa menentukan lokasi pastinya.',
          marugoto: '→語彙扱い (初中級 トピック8)',
          examples: [
            { jp: 'どこか{旅行|りょこう}したいです。', id: 'Saya ingin berwisata ke suatu tempat.' },
            { jp: '{次|つぎ}の{休|やす}みに、どこか{行|い}きますか？', id: 'Liburan berikutnya apakah kamu mau pergi ke suatu tempat?' },
            { jp: '{静|しず}かなところで、どこか{休|やす}みたいです。', id: 'Saya ingin beristirahat di suatu tempat yang tenang.' },
          ],
        },
        {
          code: '3',
          title: 'S1。あと、S2。',
          formulas: ['S1。あと、 + S2。(Menambahkan informasi / keinginan lain)'],
          functionText:
            'Kata sambung percakapan yang sangat alami untuk menambahkan poin tambahan ("Lalu juga / Selain itu, ...").',
          marugoto: '→語彙扱い (初級2 3課)',
          examples: [
            { jp: '{雪|ゆき}が{見|み}たいです。あと、{温泉|おんせん}に{入|はい}りたいです。', id: 'Saya ingin melihat salju. Selain itu, saya ingin berendam di onsen.' },
            { jp: 'ラーメンを{食|た}べました。あと、お{土産|みやげ}も{買|か}いました。', id: 'Saya makan ramen. Lalu juga membeli oleh-oleh.' },
            { jp: '{パスポート|ぱすぽーと}と{財布|さいふ}、あと、スマホを{持|も}ちます。', id: 'Saya membawa paspor, dompet, dan juga ponsel.' },
          ],
        },
        {
          code: '4',
          title: '【場所】へ行きます',
          formulas: ['【場所】 + へ + {行|い}きます / {来|き}ます / {帰|かえ}ります'],
          functionText:
            'Partikel へ (dibaca "e") menunjukkan arah tujuan perpindahan tempat, mirip dengan に namun menekankan arah tujuannya.',
          marugoto: '→「かつどう」 2. (入門 8課)',
          examples: [
            { jp: '{京都|きょうと}へ{行|い}きたいです。', id: 'Saya ingin pergi ke Kyoto.' },
            { jp: '{来月|らいげつ}、{北海道|ほっかいどう}へ{旅行|りょこう}に{行|い}きます。', id: 'Bulan depan saya akan pergi berwisata ke Hokkaido.' },
            { jp: '{夏休|なつやす}みに{国|くに}へ{帰|かえ}ります。', id: 'Saat libur musim panas saya pulang ke negara asal.' },
          ],
        },
        {
          code: '5',
          title: 'S1。それから、S2。',
          formulas: ['S1。それから、 + S2。(Urutan kronologis: setelah itu, ...)'],
          functionText:
            'Menghubungkan dua kalimat kegiatan secara berurutan menurut waktu ("Setelah itu, kemudian ...").',
          marugoto: 'S1。それから、S2。',
          examples: [
            { jp: '{露天風呂|ろてんぶろ}に{入|はい}りました。それから、{温泉|おんせん}の{近|ちか}くで、{鶏|とり}の{天|てん}ぷらを{食|た}べました。', id: 'Saya berendam di pemandian terbuka. Setelah itu, saya makan tempura ayam di dekat onsen.' },
            { jp: 'お{寺|てら}を{見|み}ました。それから、{抹茶|まっちゃ}アイスクリームを{食|た}べました。', id: 'Saya mengunjungi kuil. Setelah itu, saya makan es krim matcha.' },
            { jp: '{掃除|そうじ}をしました。それから、{洗濯|せんたく}をしました。', id: 'Saya bersih-bersih. Setelah itu, saya mencuci baju.' },
          ],
        },
        {
          code: '6a',
          title: 'S1。それに、S2。',
          formulas: ['S1。それに、 + S2。(Menambahkan kesan/alasan yang searah)'],
          functionText:
            'Menambahkan informasi yang memperkuat penilaian sebelumnya (positif + positif, atau negatif + negatif) — "Apalagi / Ditambah lagi ...".',
          marugoto: '→「りかい」 6.読解 (初中級 トピック8)',
          examples: [
            { jp: '{気持|きも}ちよかったです。それに、{景色|けしき}もきれいでした。', id: 'Sangat nyaman. Ditambah lagi, pemandangannya juga indah.' },
            { jp: 'このホテルは{安|やす}いです。それに、{駅|えき}から{近|ちか}いです。', id: 'Hotel ini murah. Apalagi dekat dari stasiun.' },
            { jp: '{料理|りょうり}はおいしかったです。それに、{店|みせ}の{人|ひと}も{親切|しんせつ}でした。', id: 'Masakannya enak. Selain itu, staf tokonya juga ramah.' },
          ],
        },
        {
          code: '6b',
          title: 'S1。でも、S2。',
          formulas: ['S1。でも、 + S2。(Kontras / pertentangan: tetapi, ...)'],
          functionText:
            'Kata sambung untuk menyatakan hal yang berlawanan dengan kalimat pertama ("Tetapi / Namun ...").',
          marugoto: 'S1。でも、S2。',
          examples: [
            { jp: 'おいしかったです。でも、ちょっと{高|たか}かったです。', id: 'Enak sekali. Tetapi agak mahal.' },
            { jp: '{富士山|ふじさん}に{行|い}きました。でも、{曇|くも}りで{見|み}えませんでした。', id: 'Saya pergi ke Gunung Fuji. Tapi karena mendung jadi tidak terlihat.' },
            { jp: '{日本語|にほんご}は{難|むずか}しいです。でも、おもしろいです。', id: 'Bahasa Jepang sulit. Tapi menarik.' },
          ],
        },
      ],
    },
  ],
};
