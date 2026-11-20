import type { RawBookSpec } from './irodoriTypes';

export const IRODORI_DASAR1_SPEC: RawBookSpec = {
  id: 'elementary1',
  shortTitle: 'Dasar 1',
  title: 'Dasar 1 — いろどり 初級1 (A2)',
  japaneseSubtitle: 'いろどり 初級1',
  level: 'A2',
  chapters: [
    {
      chapterNumber: 1,
      topicJp: '今の私',
      topicId: 'Saya Saat Ini',
      titleJp: '第1課 レストランで働いています',
      titleId: 'Saya Bekerja di Restoran',
      patterns: [
        {
          code: '1',
          title: '丁寧体・普通体',
          formulas: [
            '丁寧体 (Sopan): です / ます — untuk orang baru dikenal, atasan, pelanggan',
            '普通体 (Kasual): だ / V-る・V-た・V-ない — untuk teman akrab, keluarga',
          ],
          functionText:
            'Membedakan gaya bahasa sopan (丁寧体) dan gaya bahasa kasual/biasa (普通体) sesuai keakraban dan posisi lawan bicara.',
          marugoto: 'S（普通体）・S（丁寧体） (初中級 トピック4)',
          examples: [
            { jp: 'お{久|ひさ}しぶりです。お{元気|げんき}ですか？／{久|ひさ}しぶり。{元気|げんき}？', id: 'Lama tidak berjumpa. Apa kabar? / Lama tak jumpa. Sehat?' },
            { jp: '{仕事|しごと}は{忙|いそが}しいですか？／{仕事|しごと}、{忙|いそが}しい？', id: 'Apakah pekerjaannya sibuk? / Kerjaan sibuk?' },
            { jp: '{週末|しゅうまつ}はどこかへ{行|い}きましたか？／{週末|しゅうまつ}、どこか{行|い}った？', id: 'Akhir pekan lalu pergi ke mana? / Weekend kemarin pergi ke mana?' },
          ],
        },
        {
          code: '2',
          title: '【期間】になります',
          formulas: [
            'V-て + 【期間】 + になります (Sudah berlalu selama durasi sejak melakukan V)',
            '【期間】 + になります (Sudah berjalan selama ...)',
          ],
          functionText:
            'Menyatakan berapa lama waktu yang telah berlalu sejak suatu peristiwa dimulai (misalnya sejak datang ke Jepang atau mulai bekerja).',
          marugoto: 'V-て～年／～か月になります (初級1 14課)',
          examples: [
            { jp: '{日本|にほん}に{来|き}て1{年|ねん}になります。', id: 'Sudah 1 tahun sejak saya datang ke Jepang.' },
            { jp: 'この{会社|かいしゃ}で{働|はたら}いて、もう3{年|ねん}になります。', id: 'Sudah 3 tahun saya bekerja di perusahaan ini.' },
            { jp: '{日本語|にほんご}の{勉強|べんきょう}を{始|はじ}めて、6か{月|げつ}になります。', id: 'Sudah 6 bulan sejak saya mulai belajar bahasa Jepang.' },
          ],
        },
        {
          code: '3',
          title: '【時点】（に）来ました',
          formulas: [
            '【年月・季節・日付】 + に + {来|き}ました (Menyebutkan waktu spesifik kedatangan)',
            'Catatan: {去年|きょねん} / {先月|せんげつ} / {先週|せんしゅう} (tanpa に)',
          ],
          functionText:
            'Menyatakan titik waktu kedatangan ke Jepang atau ke suatu tempat. Gunakan に untuk waktu bernomor (bulan, tanggal, jam), dan tanpa に untuk waktu relatif (tahun lalu, bulan lalu).',
          marugoto: '→「りかい」疑問詞と助詞 (初級1 1課)',
          examples: [
            { jp: '{去年|きょねん}の9{月|がつ}に{来|き}ました。', id: 'Saya datang pada bulan September tahun lalu.' },
            { jp: '2024{年|ねん}の4{月|がつ}に{日本|にほん}に{来|き}ました。', id: 'Saya datang ke Jepang pada bulan April 2024.' },
            { jp: '{先月|せんげつ}、{大阪|おおさか}から{東京|とうきょう}に{来|き}ました。', id: 'Bulan lalu saya pindah/datang ke Tokyo dari Osaka.' },
          ],
        },
        {
          code: '4',
          title: 'V-ています ①',
          formulas: ['V-て + います (Menyatakan pekerjaan, aktivitas rutin, atau kondisi yang berlangsung saat ini)'],
          functionText:
            'Fungsi pertama bentuk V-ています: menyatakan pekerjaan, studi, atau status yang sedang dijalani dalam jangka waktu sekarang.',
          marugoto: 'V-ています ①＜習慣・結果＞',
          examples: [
            { jp: '{日本|にほん}では、{何|なに}をしていますか？', id: 'Di Jepang, Anda sedang melakukan/bekerja apa?' },
            { jp: '{駅前|えきまえ}のレストランで{働|はたら}いています。', id: 'Saya bekerja di restoran depan stasiun.' },
            { jp: '{大学|だいがく}で{経済|けいざい}を{勉強|べんきょう}しています。', id: 'Saya sedang belajar ekonomi di universitas.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 2,
      topicJp: '今の私',
      topicId: 'Saya Saat Ini',
      titleJp: '第2課 ゲームをするのが好きです',
      titleId: 'Saya Suka Bermain Game',
      patterns: [
        {
          code: '1',
          title: 'V-ることです',
          formulas: ['（{趣味|しゅみ}は） + V-る（辞書形） + ことです (Hobi saya adalah melakukan V)'],
          functionText:
            'Mengubah kata kerja bentuk kamus menjadi frasa kata benda dengan こと, digunakan saat menjelaskan hobi atau impian ("adalah ...").',
          marugoto: 'V-る＋こと',
          examples: [
            { jp: '{趣味|しゅみ}は{映画|えいが}を{見|み}ることです。', id: 'Hobi saya adalah menonton film.' },
            { jp: '{私|わたし}の{趣味|しゅみ}は{写真|しゃしん}を{撮|と}ることです。', id: 'Hobi saya adalah memotret.' },
            { jp: '{休|やす}みの{日|ひ}の{楽|たの}しみは、{料理|りょうり}を{作|つく}ることです。', id: 'Kesukaan saya di hari libur adalah memasak.' },
          ],
        },
        {
          code: '2',
          title: 'V-るのが好きです',
          formulas: [
            'V-る（辞書形） + のが + {好|す}きです / {上手|じょうず}です / {苦手|にがて}です',
          ],
          functionText:
            'Mengubah aktivitas (kata kerja) menjadi kata benda dengan の untuk menyatakan suka, pandai, atau kurang mahir melakukan aktivitas tersebut.',
          marugoto: 'NはV-るのがイA-い／ナA-です (初級1 9課)',
          examples: [
            { jp: 'ゲームをするのが{好|す}きです。', id: 'Saya suka bermain game.' },
            { jp: '{外|そと}で{走|はし}るのが{好|す}きです。', id: 'Saya suka berlari di luar ruangan.' },
            { jp: '{絵|え}を{描|か}くのが{大好|だいす}きです。', id: 'Saya sangat suka menggambar.' },
          ],
        },
        {
          code: '3',
          title: '【人】と【場所】でV-ます',
          formulas: ['【時間】は、 + 【人】 + と + 【場所】 + で + （Nを） + V-ます'],
          functionText:
            'Menjelaskan kebiasaan rutin lengkap dengan siapa (と) dan di mana (で) aktivitas itu dilakukan.',
          marugoto: 'N【場所】でV-ます (入門 11課)',
          examples: [
            { jp: '{休|やす}みの{日|ひ}は、たいてい{友|とも}だちと{体育館|たいいくかん}でバドミントンをします。', id: 'Di hari libur, saya biasanya bermain bulu tangkis bersama teman di gedung olahraga.' },
            { jp: '{毎週|まいしゅう}{土曜日|どようび}、{同僚|どうりょう}とグラウンドでサッカーをします。', id: 'Setiap hari Sabtu saya bermain sepak bola bersama rekan kerja di lapangan.' },
            { jp: '{夜|よる}は{家族|かぞく}とリビングでテレビを{見|み}ます。', id: 'Malam hari saya menonton TV bersama keluarga di ruang tamu.' },
          ],
        },
        {
          code: '4',
          title: 'V1-て、V2',
          formulas: ['V1-て、 + （そのあと、） + V2-ます (Melakukan V1, lalu V2)'],
          functionText:
            'Menghubungkan dua atau lebih tindakan yang terjadi secara berurutan dalam satu kalimat.',
          marugoto: 'V1-て、～ (初級1 6課)',
          examples: [
            { jp: '{毎週|まいしゅう}、{夕方|ゆうがた}までバドミントンをして、そのあと、みんなでご{飯|はん}を{食|た}べます。', id: 'Setiap minggu saya main bulu tangkis sampai sore, lalu setelah itu makan bersama semuanya.' },
            { jp: '{仕事|しごと}が{終|お}わって、スーパーで{買|か}い{物|もの}をして、{家|いえ}に{帰|かえ}ります。', id: 'Setelah kerja selesai, saya berbelanja di supermarket lalu pulang ke rumah.' },
            { jp: '{朝|あさ}{起|お}きて、シャワーを{浴|あ}びて、コーヒーを{飲|の}みます。', id: 'Pagi bangun tidur, mandi shower, lalu minum kopi.' },
          ],
        },
        {
          code: '5',
          title: 'V-ています ②',
          formulas: ['V-て + います (Kebiasaan rutin / hal yang sedang dipelajari secara berkala)'],
          functionText:
            'Fungsi kedua bentuk V-ています: menyatakan aktivitas yang dilakukan secara rutin/berkelanjutan (mis. les, kursus, olahraga rutin).',
          marugoto: 'V-ています ①＜習慣・結果＞ (初級1 1課)',
          examples: [
            { jp: 'いけばなを{習|なら}っています。', id: 'Saya sedang belajar (mengikuti kursus) merangkai bunga ikebana.' },
            { jp: '{毎週|まいしゅう}{水曜日|すいようび}、{日本語|にほんご}{教室|きょうしつ}に{通|かよ}っています。', id: 'Setiap hari Rabu saya rutin menghadiri kelas bahasa Jepang.' },
            { jp: '{健康|けんこう}のために、{毎朝|まいあさ}ジョギングをしています。', id: 'Demi kesehatan, saya rutin joging setiap pagi.' },
          ],
        },
        {
          code: '6',
          title: 'Nができます',
          formulas: [
            'N（言語・スポーツ・スキル） + が + できます (Bisa / mampu N)',
            'N + は + できません (Tidak bisa N)',
          ],
          functionText:
            'Menyatakan keahlian, kemampuan bahasa, atau keterampilan yang dikuasai seseorang.',
          marugoto: 'N（言葉）ができます（か） / Nはできません (入門 3課)',
          examples: [
            { jp: '{日本語|にほんご}、{英語|えいご}、フィリピノ{語|ご}、スペイン{語|ご}ができます。', id: 'Saya bisa bahasa Jepang, Inggris, Filipina, dan Spanyol.' },
            { jp: 'ギターが{少|すこ}しできます。', id: 'Saya bisa bermain gitar sedikit.' },
            { jp: '{車|くるま}の{運転|うんてん}ができますか？', id: 'Apakah Anda bisa mengemudi mobil?' },
          ],
        },
      ],
    },
    {
      chapterNumber: 3,
      topicJp: '季節と天気',
      topicId: 'Musim dan Cuaca',
      titleJp: '第3課 冬はとても寒くなります',
      titleId: 'Musim Dingin Menjadi Sangat Dingin',
      patterns: [
        {
          code: '1',
          title: 'Nに／ナA-に／イA-く なります',
          formulas: [
            'N / ナA + に + なります (Menjadi N / ナA)',
            'イA（coret い） + く + なります (Menjadi イA；いい → よくなります)',
          ],
          functionText:
            'Menyatakan perubahan keadaan secara alami (seperti pergantian musim, suhu udara, atau kemampuan).',
          marugoto: 'Nに／イA-く／ナA-に なります',
          examples: [
            { jp: '{春|はる}は{桜|さくら}の{花|はな}が{咲|さ}きます。{暖|あたた}かくなります。', id: 'Musim semi bunga sakura mekar. Udara menjadi hangat.' },
            { jp: '{冬|ふゆ}はとても{寒|さむ}くなります。', id: 'Musim dingin menjadi sangat dingin.' },
            { jp: '{夜|よる}は{町|まち}が{静|しず}かになります。', id: 'Malam hari kota menjadi tenang.' },
          ],
        },
        {
          code: '2',
          title: 'いちばん ナA-です／イA-いです',
          formulas: [
            '（【範囲】の中で） + N + が + いちばん + ナA-です / イA-いです (Paling ...)',
          ],
          functionText:
            'Menyatakan tingkat superlatif ("yang paling ...") di antara beberapa pilihan, musim, atau anggota kelompok.',
          marugoto: '→「りかい」聞きましょう',
          examples: [
            { jp: '{秋|あき}がいちばん{好|す}きです。', id: 'Saya paling suka musim gugur.' },
            { jp: '1{年|ねん}の{中|なか}で、8{月|がつ}がいちばん{暑|あつ}いです。', id: 'Dalam setahun, bulan Agustus yang paling panas.' },
            { jp: '{日本|にほん}{料理|りょうり}でラーメンがいちばん{好|す}きです。', id: 'Di antara masakan Jepang, saya paling suka ramen.' },
          ],
        },
        {
          code: '3a',
          title: 'イA-い のが 好きです',
          formulas: [
            'イA-い + のが + {好|す}きです (Suka suasana/hal yang bersifat イA)',
            'ナA + な + のが + {好|す}きです',
          ],
          functionText:
            'Menggunakan partikel の setelah kata sifat untuk menyatakan menyukai keadaan, cuaca, atau sifat tertentu.',
          marugoto: 'N／イA-いの／ナA-なのが好きです',
          examples: [
            { jp: '{私|わたし}は{暑|あつ}いのが{好|す}きです。', id: 'Saya suka cuaca yang panas.' },
            { jp: '{涼|すず}しいのが{好|す}きです。', id: 'Saya suka suasana yang sejuk.' },
            { jp: 'にぎやかなのが{好|す}きです。', id: 'Saya suka tempat/suasana yang ramai.' },
          ],
        },
        {
          code: '3b',
          title: 'イA-い のが 苦手です',
          formulas: [
            'イA-い + のが + {苦手|にがて}です (Tidak tahan / kurang suka hal yang イA)',
            'N + が + {苦手|にがて}です',
          ],
          functionText:
            'Menyatakan kelemahan atau ketidaktahanan terhadap suhu, cuaca, atau makanan tertentu dengan cara lebih halus daripada 嫌い.',
          marugoto: 'N／イA-いの／ナA-なのは好きじゃないです',
          examples: [
            { jp: '{寒|さむ}いのが{苦手|にがて}です。', id: 'Saya tidak tahan dingin.' },
            { jp: '{蒸|む}し{暑|あつ}いのが{苦手|にがて}です。', id: 'Saya tidak tahan udara panas yang lembap.' },
            { jp: '{辛|から}いのがちょっと{苦手|にがて}です。', id: 'Saya agak tidak kuat makanan pedas.' },
          ],
        },
        {
          code: '4',
          title: 'ナA-です／イA-いです から',
          formulas: ['S1。 + S2（理由） + から。(Menjelaskan alasan setelah menyebutkan kesimpulan)'],
          functionText:
            'Menjelaskan alasan di kalimat kedua setelah menyebutkan pendapat atau pilihan di kalimat pertama ("Karena ...").',
          marugoto: 'イA-い／ナA-ですから。 (入門 13課)',
          examples: [
            { jp: '{秋|あき}が{好|す}きです。もみじの{景色|けしき}がきれいですから。', id: 'Saya suka musim gugur. Karena pemandangan daun musim gugurnya indah.' },
            { jp: '{冬|ふゆ}はあまり{好|す}きじゃないです。とても{寒|さむ}いですから。', id: 'Saya kurang suka musim dingin. Karena sangat dingin.' },
            { jp: '{春|はる}がいちばん{好|す}きです。{暖|あたた}かいですから。', id: 'Saya paling suka musim semi. Karena hangat.' },
          ],
        },
        {
          code: '5',
          title: 'S1から、S2',
          formulas: [
            'S1（Alasan・丁寧体/普通体） + から、 + S2（Akibat/Pendapat）',
          ],
          functionText:
            'Menghubungkan klausa sebab/alasan (S1) dengan akibat atau kesimpulan (S2) dalam satu kalimat ("Karena S1, maka S2").',
          marugoto: 'S1から、S2',
          examples: [
            { jp: '{暑|あつ}いのが{大好|だいす}きですから、{夏|なつ}が{好|す}きです。', id: 'Karena sangat suka cuaca panas, saya menyukai musim panas.' },
            { jp: '{今日|きょう}は{雨|あめ}ですから、{傘|かさ}を{持|も}って{行|い}きます。', id: 'Karena hari ini hujan, saya membawa payung.' },
            { jp: '{安|やす}いですから、よくこの{店|みせ}で{買|か}います。', id: 'Karena murah, saya sering berbelanja di toko ini.' },
          ],
        },
        {
          code: '6',
          title: 'N1やN2',
          formulas: ['N1 + や + N2 + （など） (N1, N2, dan lain-lain)'],
          functionText:
            'Partikel や menyebutkan beberapa contoh perwakilan (masih ada hal lain selain yang disebutkan), berbeda dengan と yang menyebutkan daftar lengkap.',
          marugoto: 'N1やN2（など） (初級1 5課)',
          examples: [
            { jp: '{海|うみ}や{山|やま}で{遊|あそ}ぶのも{楽|たの}しいです。', id: 'Bermain di laut atau gunung (dan tempat lain) juga menyenangkan.' },
            { jp: 'スーパーで{野菜|やさい}や{果物|くだもの}などを{買|か}いました。', id: 'Saya membeli sayuran, buah-buahan, dan lain-lain di supermarket.' },
            { jp: '{春|はる}は{桜|さくら}やチューリップがきれいです。', id: 'Di musim semi, bunga sakura, tulip, dan lainnya sangat indah.' },
          ],
        },
        {
          code: '7',
          title: 'N1とか（N2とか）',
          formulas: ['N1 + とか + N2 + とか (Seperti N1, N2, dan sebagainya — gaya lisan)'],
          functionText:
            'Versi percakapan sehari-hari yang lebih santai dari や～など untuk menyebutkan beberapa contoh secara tidak kaku.',
          marugoto: '→「りかい」聞きましょう (初級2 3課)',
          examples: [
            { jp: '{秋|あき}は{果物|くだもの}がおいしいですよね。ぶどうとか{梨|なし}とか。', id: 'Musim gugur buah-buahannya enak ya. Seperti anggur, pir, dan sebagainya.' },
            { jp: '{休|やす}みの{日|ひ}は、{買い物|かいもの}とか{散歩|さんぽ}とかします。', id: 'Di hari libur saya melakukan hal seperti belanja, jalan-jalan, dll.' },
            { jp: '{日本|にほん}の{食べ物|たべもの}は、ラーメンとかお{寿司|すし}とかが{好|す}きです。', id: 'Makanan Jepang yang saya suka misalnya ramen, sushi, dan lainnya.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 4,
      topicJp: '季節と天気',
      topicId: 'Musim dan Cuaca',
      titleJp: '第4課 昨日はすごい雨でしたね',
      titleId: 'Kemarin Hujannya Deras Sekali ya',
      patterns: [
        {
          code: '1',
          title: 'Sね ＜共感＞',
          formulas: ['S + ね (Intonasi lembut — mengajak lawan bicara setuju / berempati)'],
          functionText:
            'Partikel akhir ね digunakan untuk membangun keakraban saat membicarakan hal yang sama-sama dirasakan pembicara dan lawan bicara (terutama cuaca).',
          marugoto: '→「りかい」聞きましょう',
          examples: [
            { jp: '{今日|きょう}はいい{天気|てんき}ですね。', id: 'Hari ini cuacanya cerah ya.' },
            { jp: '{今日|きょう}はちょっと{寒|さむ}いですね。', id: 'Hari ini agak dingin ya.' },
            { jp: '{桜|さくら}、きれいですね。', id: 'Bunga sakuranya indah ya.' },
          ],
        },
        {
          code: '2',
          title: '非過去・過去',
          formulas: [
            'Non-lampau: N/ナA です ・ イA-いです ・ V-ます',
            'Lampau: N/ナA でした ・ イA-かったです ・ V-ました',
          ],
          functionText:
            'Menggunakan bentuk non-lampau (sekarang/akan datang) dan lampau (kemarin/tadi) secara tepat saat membandingkan cuaca dan situasi.',
          marugoto: 'N／ナA-です／でした',
          examples: [
            { jp: '{昨日|きのう}はすごい{雨|あめ}でしたね。', id: 'Kemarin hujannya deras sekali ya.' },
            { jp: '{朝|あさ}は{寒|さむ}かったですが、{今|いま}は{暖|あたた}かいです。', id: 'Tadi pagi dingin, tapi sekarang hangat.' },
            { jp: '{先週|せんしゅう}は{涼|すず}しかったですが、{今週|こんしゅう}は{暑|あつ}いです。', id: 'Minggu lalu sejuk, tapi minggu ini panas.' },
          ],
        },
        {
          code: '3',
          title: 'V-ています ③',
          formulas: ['V-て + います (Aksi atau fenomena alam yang sedang berlangsung tepat saat ini)'],
          functionText:
            'Fungsi ketiga bentuk V-ています: menyatakan peristiwa yang sedang terjadi di depan mata saat ini (hujan sedang turun, angin sedang bertiup).',
          marugoto: 'V-ています ②',
          examples: [
            { jp: '{今|いま}も{少|すこ}し{雨|あめ}が{降|ふ}っています。', id: 'Sekarang pun hujan masih turun sedikit.' },
            { jp: '{外|そと}は{強|つよ}い{風|かぜ}が{吹|ふ}いています。', id: 'Di luar angin kencang sedang bertiup.' },
            { jp: '{雪|ゆき}がどんどん{降|ふ}っていますよ。', id: 'Salju sedang turun terus-menerus lho.' },
          ],
        },
        {
          code: '4',
          title: 'N／ナA-／イA-い／V-る でしょう',
          formulas: [
            'N / ナA（tanpa だ） + でしょう (Kemungkinan / prakiraan ...)',
            'イA-い / V-る（普通形） + でしょう',
          ],
          functionText:
            'Menyatakan perkiraan atau prediksi berdasarkan informasi (sangat umum dalam prakiraan cuaca: "diperkirakan akan ...").',
          marugoto: 'S（普通体）でしょう（ね） (初中級 トピック6)',
          examples: [
            { jp: '{明日|あした}は{晴|は}れるでしょう。', id: 'Besok diperkirakan akan cerah.' },
            { jp: '{夕方|ゆうがた}から{雨|あめ}でしょう。', id: 'Mulai sore hari diperkirakan akan hujan.' },
            { jp: '{明日|あした}の{朝|あさ}はかなり{寒|さむ}いでしょう。', id: 'Besok pagi kemungkinan akan cukup dingin.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 5,
      topicJp: '私の町',
      topicId: 'Kota Saya',
      titleJp: '第5課 とてもにぎやかで便利です',
      titleId: 'Sangat Ramai dan Praktis',
      patterns: [
        {
          code: '1a',
          title: 'イA-くて、～',
          formulas: [
            'イA（coret い） + くて、 + S2 (Menyambungkan kata sifat-i yang searah)',
            'Pengecualian: いい → よくて、～',
          ],
          functionText:
            'Menyambungkan dua kata sifat atau keterangan yang bernuansa sejalan (positif + positif, atau negatif + negatif) menggunakan bentuk て dari kata sifat-i.',
          marugoto: 'イA-くて、～',
          examples: [
            { jp: 'この{町|まち}は{物価|ぶっか}が{安|やす}くて、{住|す}みやすいです。', id: 'Kota ini biaya hidupnya murah dan nyaman untuk ditinggali.' },
            { jp: 'この{公園|こうえん}は{広|ひろ}くて、とてもきれいです。', id: 'Taman ini luas dan sangat indah.' },
            { jp: '{駅|えき}から{近|ちか}くて、{便利|べんり}ですよ。', id: 'Dekat dari stasiun dan praktis lho.' },
          ],
        },
        {
          code: '1b',
          title: 'ナA-で、～',
          formulas: ['ナA（tanpa な） + で、 + S2 (Menyambungkan kata sifat-na yang searah)'],
          functionText:
            'Menyambungkan kata sifat-na dengan sifat/keterangan lain yang sejalan dalam satu kalimat.',
          marugoto: 'ナA-で、～',
          examples: [
            { jp: 'この{町|まち}は、とてもにぎやかで、{便利|べんり}です。', id: 'Kota ini sangat ramai dan praktis.' },
            { jp: '{私|わたし}の{故郷|ふるさと}は{静|しず}かで、{緑|みどり}が{多|おお}いです。', id: 'Kampung halaman saya tenang dan banyak pepohonan hijau.' },
            { jp: 'この{辺|あた}りはきれいで、{安全|あんぜん}です。', id: 'Sekitar sini bersih dan aman.' },
          ],
        },
        {
          code: '1c',
          title: 'Nで、～',
          formulas: ['N + で、 + S2 (Menyambungkan keterangan kata benda dengan kalimat lanjutannya)'],
          functionText:
            'Bentuk sambung で untuk kata benda guna menggabungkan dua informasi tentang suatu tempat atau orang dalam satu kalimat.',
          marugoto: 'Nで、～',
          examples: [
            { jp: 'ここは{古|ふる}い{町|まち}で、お{寺|てら}がたくさんあります。', id: 'Ini adalah kota tua, dan ada banyak kuil.' },
            { jp: 'バンドンは{山|やま}の{町|まち}で、とても{涼|すず}しいです。', id: 'Bandung adalah kota pegunungan dan sangat sejuk.' },
            { jp: '{駅前|えきまえ}は{商店街|しょうてんがい}で、いつも{人|ひと}が{多|おお}いです。', id: 'Depan stasiun adalah distrik pertokoan, dan selalu banyak orang.' },
          ],
        },
        {
          code: '2a',
          title: 'イA-いけど、～',
          formulas: ['イA-い + けど、 + S2 (Meskipun イA, tetapi S2 — gaya percakapan)'],
          functionText:
            'Menyambungkan dua sifat atau fakta yang berlawanan (mis. kelebihan vs kekurangan) secara alami dalam percakapan.',
          marugoto: 'イA-いけど、～',
          examples: [
            { jp: 'この{町|まち}は{家賃|やちん}は{高|たか}いけど、{生活|せいかつ}はとても{便利|べんり}です。', id: 'Kota ini biaya sewanya mahal, tapi kehidupannya sangat praktis.' },
            { jp: '{駅|えき}からちょっと{遠|とお}いけど、{静|しず}かでいいところです。', id: 'Agak jauh dari stasiun, tapi tempatnya tenang dan bagus.' },
            { jp: '{冬|ふゆ}は{寒|さむ}いけど、{雪|ゆき}{景色|げしき}がきれいですよ。', id: 'Musim dinginnya dingin, tapi pemandangan saljunya indah lho.' },
          ],
        },
        {
          code: '2b',
          title: 'ナA-だけど、～',
          formulas: ['ナA + だけど、 + S2 (Meskipun ナA, tetapi S2)'],
          functionText:
            'Menyatakan kontras setelah kata sifat-na dalam percakapan ("... tapi ..."). Versi lebih sopannya adalah ナA-ですが、～.',
          marugoto: 'ナA-だけど、～',
          examples: [
            { jp: 'たちばな{公園|こうえん}は、{場所|ばしょ}は{不便|ふべん}だけど、きれいですよ。', id: 'Taman Tachibana lokasinya kurang strategis, tapi indah lho.' },
            { jp: '{昼|ひる}はにぎやかだけど、{夜|よる}はとても{静|しず}かです。', id: 'Siang hari ramai, tapi malam hari sangat tenang.' },
            { jp: 'この{店|みせ}は{有名|ゆうめい}だけど、あまり{高|たか}くないです。', id: 'Toko ini terkenal, tapi tidak terlalu mahal.' },
          ],
        },
        {
          code: '2c',
          title: 'Nだけど、～',
          formulas: ['N + だけど、 + S2 (Meskipun N, tetapi S2)'],
          functionText:
            'Menyatakan kontras setelah kata benda dalam gaya bicara alami sehari-hari.',
          marugoto: 'Nだけど、～',
          examples: [
            { jp: 'ここは{田舎|いなか}だけど、インターネットもスーパーもあって{便利|べんり}です。', id: 'Di sini pedesaan, tapi ada internet dan supermarket sehingga praktis.' },
            { jp: '{平日|へいじつ}だけど、{観光|かんこう}{客|きゃく}がたくさんいますね。', id: 'Meskipun hari kerja, ada banyak wisatawan ya.' },
            { jp: '{小|ちい}さい{町|まち}だけど、おいしいレストランがいろいろあります。', id: 'Meski kota kecil, ada bermacam-macam restoran enak.' },
          ],
        },
        {
          code: '3',
          title: 'V-ることができます',
          formulas: [
            'V-る（辞書形） + ことができます (Bisa / dapat melakukan V)',
            'V-る（辞書形） + ことができません (Tidak dapat melakukan V)',
          ],
          functionText:
            'Menyatakan kemampuan atau kemungkinan melakukan suatu kegiatan di suatu tempat ("bisa ...").',
          marugoto: 'V-ることができます (初中級 トピック9)',
          examples: [
            { jp: '{一年中|いちねんじゅう}、いろいろな{花|はな}を{見|み}ることができます。', id: 'Sepanjang tahun, kita bisa melihat berbagai macam bunga.' },
            { jp: 'この{図書館|としょかん}では、{外国語|がいこくご}の{本|ほん}を{借|か}りることができます。', id: 'Di perpustakaan ini, kita bisa meminjam buku berbahasa asing.' },
            { jp: '{晴|は}れた{日|ひ}は、ここから{富士山|ふじさん}を{見|み}ることができます。', id: 'Di hari yang cerah, dari sini kita bisa melihat Gunung Fuji.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 6,
      topicJp: '私の町',
      topicId: 'Kota Saya',
      titleJp: '第6課 郵便局はどう行ったらいいですか？',
      titleId: 'Bagaimana Cara Pergi ke Kantor Pos?',
      patterns: [
        {
          code: '1',
          title: 'Nに行きたいんですが…',
          formulas: ['【場所】 + に + {行|い}きたいんですが… (Saya ingin pergi ke ..., tapi...)'],
          functionText:
            'Pembuka kalimat yang sangat sopan dan alami saat menanyakan arah jalan kepada orang di jalan atau petugas.',
          marugoto: '→「りかい」聞きましょう',
          examples: [
            { jp: 'マルイチデパートに{行|い}きたいんですが…。', id: 'Permisi, saya ingin pergi ke Mal Maruichi…' },
            { jp: 'すみません、{郵便局|ゆうびんきょく}に{行|い}きたいんですが、どう{行|い}ったらいいですか？', id: 'Permisi, saya ingin ke kantor pos, bagaimana cara perginya ya?' },
            { jp: '{市民|しみん}{病院|びょういん}に{行|い}きたいんですが、この{道|みち}でいいですか？', id: 'Saya mau pergi ke Rumah Sakit Umum, apakah lewat jalan ini benar?' },
          ],
        },
        {
          code: '2',
          title: 'V-て、～',
          formulas: ['V1-て、 + V2-て、 + V3-てください (Memberi petunjuk arah secara berurutan)'],
          functionText:
            'Menjelaskan langkah-langkah petunjuk jalan (jalan lurus, belok kiri/kanan, menyeberang) secara runtut dengan bentuk て.',
          marugoto: 'V1-て、～',
          examples: [
            { jp: 'この{道|みち}をまっすぐ{行|い}って、2つ{目|め}の{信号|しんごう}を{左|ひだり}に{曲|ま}がってください。', id: 'Jalan lurus terus di jalan ini, lalu belok kiri di lampu merah kedua.' },
            { jp: '{橋|はし}を{渡|わた}って、{角|かど}を{右|みぎ}に{曲|ま}がると、{駅|えき}が{見|み}えます。', id: 'Seberangi jembatan, lalu belok kanan di pojokan, nanti stasiun akan terlihat.' },
            { jp: '{改札|かいさつ}を{出|で}て、{左|ひだり}へ{行|い}ってください。', id: 'Keluar dari gerbang tiket, lalu pergi ke arah kiri.' },
          ],
        },
        {
          code: '3',
          title: 'N1じゃなくて、N2',
          formulas: ['N1 + じゃなくて、 + N2 + です (Bukan N1, melainkan N2)'],
          functionText:
            'Mengoreksi informasi yang keliru dan langsung menyebutkan pilihan yang benar secara jelas ("Bukan N1, tapi N2").',
          marugoto: 'N1じゃなくて、N2',
          examples: [
            { jp: '1つ{目|め}じゃなくて、2つ{目|め}です。', id: 'Bukan yang pertama, melainkan yang kedua.' },
            { jp: '{右|みぎ}じゃなくて、{左|ひだり}に{曲|ま}がってください。', id: 'Bukan ke kanan, tapi beloklah ke kiri.' },
            { jp: '{銀行|ぎんこう}の{前|まえ}じゃなくて、{隣|となり}にあります。', id: 'Bukan di depan bank, melainkan di sebelahnya.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 7,
      topicJp: 'いっしょに出かける',
      topicId: 'Pergi Keluar Bersama',
      titleJp: '第7課 道に迷ってちょっと遅れます',
      titleId: 'Tersesat di Jalan Jadi Agak Terlambat',
      patterns: [
        {
          code: '1',
          title: 'Nはどうですか？',
          formulas: ['N（時間・場所・提案） + は + どうですか？ (Bagaimana kalau N?)'],
          functionText:
            'Mengajukan usulan waktu, tempat bertemu, atau rencana kepada lawan bicara dengan sopan.',
          marugoto: '→「りかい」聞きましょう',
          examples: [
            { jp: '6{時|じ}はどうですか？', id: 'Bagaimana kalau jam 6?' },
            { jp: '{待|ま}ち{合|あ}わせの{場所|ばしょ}は、{駅|えき}の{東口|ひがしぐち}はどうですか？', id: 'Untuk tempat bertemu, bagaimana kalau di Pintu Timur stasiun?' },
            { jp: '{来週|らいしゅう}の{日曜日|にちようび}はどうですか？', id: 'Bagaimana kalau hari Minggu depan?' },
          ],
        },
        {
          code: '2',
          title: 'Nでもいいですか？',
          formulas: ['N + でも + いいですか？ (Apakah tidak apa-apa kalau N?)'],
          functionText:
            'Menawarkan alternatif jadwal/tempat secara sopan sambil meminta persetujuan lawan bicara ("Apakah N juga boleh?").',
          marugoto: 'Nでもいいですか',
          examples: [
            { jp: '6{時半|じはん}でもいいですか？', id: 'Apakah jam 6.30 tidak apa-apa?' },
            { jp: '{電話|でんわ}じゃなくて、メッセージでもいいですか？', id: 'Bukan telepon, pakai pesan teks saja apakah boleh?' },
            { jp: '{今日|きょう}じゃなくて、{明日|あした}でもいいですか？', id: 'Bukan hari ini, besok saja apakah tidak apa-apa?' },
          ],
        },
        {
          code: '3a',
          title: 'Nで、～ ＜原因・理由＞',
          formulas: ['N（事故・病気・台風・渋滞） + で、 + S（結果） (Akibat / karena N)'],
          functionText:
            'Partikel で setelah kata benda kejadian/bencana menyatakan penyebab terjadinya suatu akibat (seperti kereta berhenti, terlambat, batal).',
          marugoto: 'Nで、～',
          examples: [
            { jp: '{事故|じこ}で{電車|でんしゃ}が{止|と}まりました。', id: 'Kereta berhenti karena kecelakaan.' },
            { jp: '{台風|たいふう}で{飛行機|ひこうき}が{飛|と}びませんでした。', id: 'Pesawat tidak terbang karena topan.' },
            { jp: '{風邪|かぜ}で{会社|かいしゃ}を{休|やす}みました。', id: 'Saya izin tidak masuk kerja karena masuk angin.' },
          ],
        },
        {
          code: '3b',
          title: 'V-て、～ ＜原因・理由＞',
          formulas: ['V-て、 + S（結果・気持ち） (Karena melakukan/mengalami V, maka ...)'],
          functionText:
            'Bentuk て dari kata kerja yang menyatakan sebab langsung terjadinya keterlambatan, masalah, atau perasaan.',
          marugoto: 'V-て、～',
          examples: [
            { jp: 'ねぼうして、{今|いま}、{起|お}きました。', id: 'Saya kesiangan, baru bangun sekarang.' },
            { jp: '{道|みち}に{迷|まよ}って、ちょっと{遅|おく}れます。', id: 'Saya tersesat di jalan, jadi agak terlambat.' },
            { jp: 'バスに{乗|の}り{遅|おく}れて、{間|ま}に{合|あ}いませんでした。', id: 'Ketinggalan bus, jadi tidak sempat tepat waktu.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 8,
      topicJp: 'いっしょに出かける',
      topicId: 'Pergi Keluar Bersama',
      titleJp: '第8課 野球、したことありますか？',
      titleId: 'Pernahkah Kamu Bermain Bisbol?',
      patterns: [
        {
          code: '1',
          title: 'もうV-ました',
          formulas: [
            'もう + V-ましたか？ (Apakah sudah melakukan V?)',
            'はい、もう + V-ました (Ya, sudah) / いいえ、まだです (Belum)',
          ],
          functionText:
            'Menanyakan atau menyatakan bahwa suatu tindakan sudah selesai dilakukan (もう = sudah).',
          marugoto: 'もうV-ました',
          examples: [
            { jp: '{新|あたら}しいアウトレットモール、もう{行|い}きましたか？', id: 'Apakah kamu sudah pergi ke mal outlet yang baru?' },
            { jp: 'はい、もう{昼|ひる}ご{飯|はん}を{食|た}べました。', id: 'Ya, saya sudah makan siang.' },
            { jp: 'チケットはもう{買|か}いましたか？', id: 'Apakah tiketnya sudah dibeli?' },
          ],
        },
        {
          code: '2',
          title: 'V-たことがあります',
          formulas: [
            'V-た + ことがあります (Pernah melakukan V)',
            'V-た + ことがありません / ないです (Belum pernah melakukan V)',
          ],
          functionText:
            'Menanyakan atau menceritakan pengalaman hidup ("pernah / belum pernah melakukan V").',
          marugoto: 'V-たことがあります (初級1 13課)',
          examples: [
            { jp: 'プロレスを{見|み}たことがありますか？', id: 'Apakah Anda pernah menonton gulat profesional?' },
            { jp: '{私|わたし}は{富士山|ふじさん}に{登|のぼ}ったことがあります。', id: 'Saya pernah mendaki Gunung Fuji.' },
            { jp: 'スキーはしたことがありません。', id: 'Saya belum pernah bermain ski.' },
          ],
        },
        {
          code: '3',
          title: 'V-に行きませんか？',
          formulas: ['V（akar ます） + に + {行|い}きませんか？ (Maukah pergi untuk melakukan V?)'],
          functionText:
            'Mengajak teman pergi ke suatu tempat untuk tujuan aktivitas tertentu secara sopan.',
          marugoto: 'Nに／V-に行きます／来ます',
          examples: [
            { jp: 'いっしょに{食|た}べに{行|い}きませんか？', id: 'Maukah pergi makan bersama?' },
            { jp: '{今度|こんど}、{野球|やきゅう}を{見|み}に{行|い}きませんか？', id: 'Lain kali maukah pergi menonton bisbol?' },
            { jp: '{土曜日|どようび}に{映画|えいが}を{見|み}に{行|い}きませんか？', id: 'Hari Sabtu maukah pergi menonton film?' },
          ],
        },
        {
          code: '4a',
          title: 'Nの前に、～',
          formulas: ['N（イベント・動作名詞） + の + {前|まえ}に、 + S (Sebelum N, melakukan S)'],
          functionText:
            'Menyatakan kegiatan yang dilakukan sebelum dimulainya suatu acara atau aktivitas (N diikuti の前に).',
          marugoto: 'Nのまえに、～',
          examples: [
            { jp: '{食事|しょくじ}の{前|まえ}に、お{金|かね}をおろしたいんですが…。', id: 'Sebelum makan, saya ingin tarik uang dulu…' },
            { jp: '{映画|えいが}の{前|まえ}に、ポップコーンを{買|か}いましょう。', id: 'Sebelum film dimulai, ayo beli popcorn.' },
            { jp: '{会議|かいぎ}の{前|まえ}に、{資料|しりょう}をコピーします。', id: 'Sebelum rapat, saya memfotokopi dokumen.' },
          ],
        },
        {
          code: '4b',
          title: 'Nのあと（で）、～',
          formulas: ['N + の + あと（で）、 + S (Setelah N, melakukan S)'],
          functionText:
            'Menyatakan kegiatan yang dilakukan sesudah suatu acara atau aktivitas selesai.',
          marugoto: 'Nのあとで、～',
          examples: [
            { jp: '{買|か}い{物|もの}のあとで、ゲームコーナーに{行|い}きませんか？', id: 'Setelah berbelanja, maukah pergi ke area game?' },
            { jp: '{仕事|しごと}のあとで、ジムに{行|い}きます。', id: 'Sepulang kerja saya pergi ke gym.' },
            { jp: '{食事|しょくじ}のあと、カフェでお{茶|ちゃ}を{飲|の}みました。', id: 'Setelah makan, kami minum teh di kafe.' },
          ],
        },
        {
          code: '5',
          title: 'V-たいんですが…',
          formulas: ['V（akar ます） + たい + んですが… (Saya ingin V, tapi... — menyampaikan maksud/permintaan halus)'],
          functionText:
            'Menyampaikan keinginan atau rencana sebagai pembuka agar lawan bicara mau ikut, memberi saran, atau membantu.',
          marugoto: 'S（普通体）んです (初級1 17課)',
          examples: [
            { jp: 'ジョギングシューズを{買|か}いたいんですが…。', id: 'Saya ingin membeli sepatu joging, nih…' },
            { jp: 'ちょっとトイレに{行|い}きたいんですが、ここで{待|ま}ってくれますか？', id: 'Saya mau ke toilet sebentar, bisa tunggu di sini?' },
            { jp: '{写真|しゃしん}を{撮|と}りたいんですが、お{願|ねが}いできますか？', id: 'Saya ingin berfoto, boleh minta tolong?' },
          ],
        },
      ],
    },
    {
      chapterNumber: 9,
      topicJp: '日本語学習',
      topicId: 'Belajar Bahasa Jepang',
      titleJp: '第9課 読み方を教えてもらえませんか？',
      titleId: 'Bisakah Mengajari Saya Cara Bacanya?',
      patterns: [
        {
          code: '1',
          title: 'Nで ＜手段＞',
          formulas: ['N（道具・方法・媒体） + で + V-ます (Dengan / melalui media N)'],
          functionText:
            'Partikel で menandai alat, media, atau metode yang dipakai untuk melakukan sesuatu (aplikasi, anime, kamus, pena).',
          marugoto: 'Nで (初級1 1課)',
          examples: [
            { jp: 'アニメで{日本語|にほんご}を{勉強|べんきょう}しました。', id: 'Saya belajar bahasa Jepang melalui anime.' },
            { jp: 'スマホのアプリで{漢字|かんじ}を{覚|おぼ}えています。', id: 'Saya menghafal kanji menggunakan aplikasi ponsel.' },
            { jp: 'ボールペンで{名前|なまえ}を{書|か}いてください。', id: 'Tolong tulis nama menggunakan pulpen.' },
          ],
        },
        {
          code: '2a',
          title: 'N1はN2がナA-です／イA-いです ①',
          formulas: ['N1（Topik） + は + N2（Aspek） + が + ナA-です / イA-いです'],
          functionText:
            'Menjelaskan sifat/penilaian terhadap salah satu bagian atau aspek (N2) dari topik besar (N1), mis. bahasa Jepang tulisannya sulit.',
          marugoto: 'N1はN2がイA-い／ナA-です',
          examples: [
            { jp: '{日本語|にほんご}は{文字|もじ}が{難|むずか}しいです。', id: 'Bahasa Jepang itu hurufnya sulit.' },
            { jp: '{日本|にほん}は{交通|こうつう}が{便利|べんり}です。', id: 'Jepang itu transportasinya praktis.' },
            { jp: 'この{辞書|じしょ}は{説明|せつめい}がわかりやすいです。', id: 'Kamus ini penjelasannya mudah dipahami.' },
          ],
        },
        {
          code: '2b',
          title: 'NはV-るのがナA-／イA-いです ①',
          formulas: ['N + は + V-る（辞書形） + のが + ナA-です / イA-いです'],
          functionText:
            'Menilai tingkat kesulitan atau kesan saat melakukan suatu tindakan (V-るの) yang berkaitan dengan topik N.',
          marugoto: 'NはV-るのがイA-い／ナA-です',
          examples: [
            { jp: '{日本語|にほんご}は{話|はな}すのが{大変|たいへん}です。', id: 'Bahasa Jepang itu berbicara-nya berat/sulit.' },
            { jp: '{漢字|かんじ}は{書|か}くのが{難|むずか}しいです。', id: 'Kanji itu menulisnya sulit.' },
            { jp: 'ニュースは{聞|き}き{取|と}るのが{速|はや}くて{大変|たいへん}です。', id: 'Berita itu menyimaknya cepat dan berat.' },
          ],
        },
        {
          code: '3',
          title: 'N1は、～。（でも、）N2は、～。 ＜対比＞',
          formulas: ['N1 + は + S1。でも、 + N2 + は + S2。(Kontras antara N1 dan N2)'],
          functionText:
            'Menggunakan partikel は secara berpasangan untuk membandingkan atau mempertentangkan dua hal yang berbeda.',
          marugoto: '→「りかい」助詞 (初級2 5課)',
          examples: [
            { jp: '{日本語|にほんご}は、{読|よ}むのは{少|すこ}し{難|むずか}しいです。でも、{会話|かいわ}は{得意|とくい}です。', id: 'Bahasa Jepang, membacanya agak sulit. Tetapi percakapannya saya mahir.' },
            { jp: 'ひらがなは{書|か}けます。でも、{漢字|かんじ}はまだあまり{書|か}けません。', id: 'Hiragana saya bisa menulisnya. Tapi kanji masih belum terlalu bisa.' },
            { jp: '{平|へい}{日|じつ}は{忙|いそが}しいです。でも、{週末|しゅうまつ}は{暇|ひま}です。', id: 'Hari kerja sibuk. Tapi akhir pekan senggang.' },
          ],
        },
        {
          code: '4',
          title: 'V-てもらえませんか？',
          formulas: [
            'V-て + もらえませんか？ (Bisakah Anda tolong melakukan V untuk saya? — sangat sopan)',
            'Lebih santai: V-てもらえますか？',
          ],
          functionText:
            'Meminta bantuan dengan sopan dan penuh pertimbangan kepada rekan, guru, atau orang yang lebih tua ("Apakah Anda berkenan ...?").',
          marugoto: 'V-てくださいませんか？',
          examples: [
            { jp: '{日本語|にほんご}をチェックしてもらえませんか？', id: 'Bisakah Anda tolong memeriksa bahasa Jepang saya?' },
            { jp: 'この{漢字|かんじ}の{読|よ}み{方|かた}を{教|おし}えてもらえませんか？', id: 'Bisakah Anda mengajari saya cara baca kanji ini?' },
            { jp: 'もう{少|すこ}しゆっくり{話|はな}してもらえませんか？', id: 'Bisakah Anda berbicara sedikit lebih pelan?' },
          ],
        },
        {
          code: '5',
          title: 'V-方',
          formulas: [
            'V（akar ます） + {方|かた} (Cara melakukan V)',
            'Contoh: {読|よ}みます → {読|よ}み{方|かた} / {書|か}きます → {書|か}き{方|かた} / {使|つか}います → {使|つか}い{方|かた}',
          ],
          functionText:
            'Mengubah kata kerja menjadi kata benda yang berarti "cara melakukan V" (cara membaca, cara menulis, cara menggunakan).',
          marugoto: 'V-かた',
          examples: [
            { jp: 'この{書類|しょるい}の{書|か}き{方|かた}がよくわかりません。', id: 'Saya kurang mengerti cara mengisi dokumen ini.' },
            { jp: 'この{洗濯機|せんたくき}の{使|つか}い{方|かた}を{教|おし}えてください。', id: 'Tolong ajari cara menggunakan mesin cuci ini.' },
            { jp: '{納豆|なっとう}の{食|た}べ{方|かた}を{知|し}っていますか？', id: 'Apakah kamu tahu cara makan natto?' },
          ],
        },
      ],
    },
    {
      chapterNumber: 10,
      topicJp: '日本語学習',
      topicId: 'Belajar Bahasa Jepang',
      titleJp: '第10課 日本語教室に参加したいんですが･･･',
      titleId: 'Saya Ingin Ikut Kelas Bahasa Jepang...',
      patterns: [
        {
          code: '1',
          title: 'V-てみたいんですが…',
          formulas: ['V-て + みたい + んですが… (Saya ingin mencoba V, nih...)'],
          functionText:
            'Menyatakan keinginan untuk mencoba suatu pengalaman baru sambil membuka percakapan untuk bertanya atau mendaftar.',
          marugoto: 'V-てみます',
          examples: [
            { jp: '{合気道|あいきどう}をやってみたいんですが…。', id: 'Saya ingin mencoba aikido, nih…' },
            { jp: '{日本語|にほんご}{教室|きょうしつ}を{見学|けんがく}してみたいんですが、いつがいいですか？', id: 'Saya ingin mencoba melihat-lihat kelas bahasa Jepang, kapan waktu yang baik?' },
            { jp: '{茶道|さどう}を{体験|たいけん}してみたいんですが…。', id: 'Saya ingin mencoba pengalaman upacara minum teh…' },
          ],
        },
        {
          code: '2',
          title: '【期間】（に）～回',
          formulas: ['【期間（1日・週・月・年）】 + （に） + 【回数】{回|かい} (Frekuensi per periode)'],
          functionText:
            'Menyatakan berapa kali suatu kegiatan berlangsung dalam periode waktu tertentu (mis. seminggu sekali, sebulan dua kali).',
          marugoto: '週／月／年に～回（ぐらい）',
          examples: [
            { jp: '{日本語|にほんご}クラスは{週|しゅう}に1{回|かい}です。', id: 'Kelas bahasa Jepang diadakan seminggu sekali.' },
            { jp: '{月|つき}に2{回|かい}、{地域|ちいき}のボランティアに{参加|さんか}します。', id: 'Sebulan dua kali saya ikut kegiatan relawan daerah.' },
            { jp: '1{日|にち}に3{回|かい}、{歯|は}を{磨|みが}きます。', id: 'Saya menggosok gigi 3 kali sehari.' },
          ],
        },
        {
          code: '3',
          title: 'V-ましょうか？',
          formulas: ['V（akar ます） + ましょうか？ (Mau saya bantu V? / Bagaimana kalau kita V?)'],
          functionText:
            'Menawarkan bantuan kepada lawan bicara ("Biar saya ... ya?") atau mengusulkan sesuatu bersama secara lembut.',
          marugoto: 'V-ましょうか？',
          examples: [
            { jp: '{教室|きょうしつ}のチラシを{持|も}って{来|き}ましょうか？', id: 'Mau saya bawakan brosur kelasnya?' },
            { jp: '{荷物|にもつ}、{持|も}ちましょうか？', id: 'Biar saya bantu bawakan barangnya ya?' },
            { jp: '{駅|えき}まで{案内|あんない}しましょうか？', id: 'Mau saya antar/tunjukkan jalan sampai stasiun?' },
          ],
        },
        {
          code: '4',
          title: '聞き返し',
          formulas: [
            '「X」は、どういう{意味|いみ}ですか？ ("X" artinya apa?)',
            'もう{一度|いちど}お{願|ねが}いします / すみません、{何|なん}ですか？',
          ],
          functionText:
            'Strategi bertanya balik (klarifikasi) saat mendengar kosakata baru atau ucapan yang belum jelas dalam percakapan bahasa Jepang.',
          marugoto: '→「かつどう」 4. (初級2 1課)',
          examples: [
            { jp: 'すみません。「ぼご」は、どういう{意味|いみ}ですか？', id: 'Maaf. "Bogo" (bahasa ibu) itu artinya apa ya?' },
            { jp: 'すみません、もう{一度|いちど}ゆっくり{言|い}っていただけますか？', id: 'Maaf, bolehkah diucapkan sekali lagi dengan pelan?' },
            { jp: '「{見学|けんがく}」って、どういうことですか？', id: '"Kengaku" (observasi/kunjungan) itu maksudnya bagaimana?' },
          ],
        },
        {
          code: '5a',
          title: 'Nのとき、～',
          formulas: ['N + の + とき、 + S (Ketika masa/saat N, ...)'],
          functionText:
            'Menyatakan keterangan waktu berdasarkan suatu fase kehidupan, usia, atau peristiwa (kata benda dihubungkan dengan の).',
          marugoto: 'Nのとき、～ (初級1 2課)',
          examples: [
            { jp: '{高校|こうこう}のとき、{少|すこ}し{日本語|にほんご}を{勉強|べんきょう}しました。', id: 'Saat SMA, saya belajar bahasa Jepang sedikit.' },
            { jp: '{子|こ}どものとき、よく{川|かわ}で{泳|およ}ぎました。', id: 'Waktu kecil, saya sering berenang di sungai.' },
            { jp: '{地震|じしん}のとき、テーブルの{下|した}に{入|はい}ります。', id: 'Saat gempa bumi, masuklah ke bawah meja.' },
          ],
        },
        {
          code: '5b',
          title: 'イA-いとき、～',
          formulas: ['イA-い + とき、 + S (Ketika dalam keadaan イA, ...)'],
          functionText:
            'Menyatakan kondisi waktu menggunakan kata sifat-i langsung di depan とき.',
          marugoto: 'イA-いとき、～ (初級1 2課)',
          examples: [
            { jp: '{若|わか}いとき、よく{旅行|りょこう}しました。', id: 'Waktu muda, saya sering bepergian.' },
            { jp: '{眠|ねむ}いとき、ブラックコーヒーを{飲|の}みます。', id: 'Saat mengantuk, saya minum kopi hitam.' },
            { jp: '{忙|いそが}しいとき、コンビニのお{弁当|べんとう}を{買|か}います。', id: 'Ketika sibuk, saya membeli bento di minimarket.' },
          ],
        },
        {
          code: '5c',
          title: 'ナA-なとき、～',
          formulas: ['ナA + な + とき、 + S (Ketika dalam keadaan ナA, ...)'],
          functionText:
            'Menyatakan kondisi waktu menggunakan kata sifat-na yang wajib disertai な sebelum とき.',
          marugoto: 'ナA-なとき、～ (初級1 2課)',
          examples: [
            { jp: '{暇|ひま}なとき、{料理|りょうり}を{作|つく}ります。', id: 'Saat senggang, saya memasak.' },
            { jp: '{元気|げんき}なとき、{公園|こうえん}を{走|はし}ります。', id: 'Saat sedang fit, saya berlari di taman.' },
            { jp: '{静|しず}かなとき、よく{本|ほん}を{読|よ}みます。', id: 'Saat suasana tenang, saya sering membaca buku.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 11,
      topicJp: 'おいしい料理',
      topicId: 'Masakan yang Lezat',
      titleJp: '第11課 肉と野菜は私が買って行きます',
      titleId: 'Daging dan Sayuran Saya yang Beli dan Bawa Pergi',
      patterns: [
        {
          code: '1a',
          title: 'V-て行きます',
          formulas: ['V-て + {行|い}きます (Melakukan V lalu pergi / membawa ke tempat tujuan)'],
          functionText:
            'Menyatakan melakukan suatu persiapan (membeli, memasak, menyiapkan) terlebih dahulu lalu membawanya pergi ke tempat acara.',
          marugoto: 'V-て行きます',
          examples: [
            { jp: '{肉|にく}と{野菜|やさい}は、{私|わたし}が{買|か}って{行|い}きますよ。', id: 'Daging dan sayuran, biar saya yang beli dan bawa ke sana ya.' },
            { jp: 'インドネシアの{料理|りょうり}を{作|つく}って{行|い}きます。', id: 'Saya akan memasak masakan Indonesia lalu membawanya ke sana.' },
            { jp: 'お{皿|さら}とコップは{家|いえ}から{持|も}って{行|い}きます。', id: 'Piring dan gelas saya bawa dari rumah.' },
          ],
        },
        {
          code: '1b',
          title: 'V-て来ます',
          formulas: ['V-て + {来|き}ます (Melakukan V lalu datang kembali / membeli lalu kembali)'],
          functionText:
            'Menyatakan pergi melakukan sesuatu sebentar lalu kembali lagi, atau menyiapkan sesuatu sebelum datang ke tempat ini.',
          marugoto: 'V-て来ます',
          examples: [
            { jp: 'ちょっとコンビニで{飲|の}み{物|もの}を{買|か}って{来|き}ます。', id: 'Saya pergi beli minuman sebentar di minimarket lalu kembali.' },
            { jp: '{手|て}を{洗|あら}って{来|き}ますね。', id: 'Saya cuci tangan dulu sebentar ya.' },
            { jp: '{友達|ともだち}が{手|て}{作|づく}りのケーキを{作|つく}って{来|き}ました。', id: 'Teman saya membuat kue buatan sendiri lalu membawanya kemari.' },
          ],
        },
        {
          code: '2',
          title: 'N1とN2（と）、どっちがいいですか？ / S。どれがいいですか？',
          formulas: [
            'N1 + と + N2 + （と）、どっち / どちら + が + いいですか？ (Antara 2 pilihan)',
            'どれ + が + いいですか？ (Di antara 3 pilihan atau lebih)',
          ],
          functionText:
            'Menanyakan pilihan yang lebih disukai: どっち／どちら untuk 2 pilihan, sedangkan どれ untuk 3 pilihan atau lebih.',
          marugoto: 'N1とN2（と）どちらがいいですか',
          examples: [
            { jp: 'チョコレートケーキとチーズケーキ、どっちがいいですか？／お{茶|ちゃ}、いろいろありますね。どれがいいですか？', id: 'Kue cokelat atau cheesecake, mana yang lebih baik? / Tehnya ada macam-macam ya. Yang mana yang kamu mau?' },
            { jp: 'コーヒーと{紅茶|こうちゃ}、どちらがいいですか？', id: 'Kopi atau teh hitam, mana yang Anda pilih?' },
            { jp: 'メニューがたくさんありますね。どれがいいですか？', id: 'Menunya banyak sekali ya. Yang mana yang bagus?' },
          ],
        },
        {
          code: '3',
          title: 'Nのほうがいいです',
          formulas: ['N + のほうが + いいです (Lebih memilih / lebih baik N)'],
          functionText:
            'Menjawab pertanyaan perbandingan 2 hal dengan menyatakan mana yang lebih disukai ("Lebih baik N").',
          marugoto: 'Nがいいです',
          examples: [
            { jp: '{塩|しお}のほうがいいです。', id: 'Lebih baik yang rasa garam.' },
            { jp: 'バーベキューは{牛肉|ぎゅうにく}より{鶏肉|とりにく}のほうがいいです。', id: 'Untuk barbekyu, lebih baik daging ayam daripada daging sapi.' },
            { jp: '{冷|つめ}たいお{茶|ちゃ}のほうがいいです。', id: 'Saya lebih suka teh dingin.' },
          ],
        },
        {
          code: '4',
          title: '【疑問詞】でもいいです',
          formulas: ['{何|なん} / いつ / どこ / どれ + でも + いいです (Apa saja / kapan saja / di mana saja boleh)'],
          functionText:
            'Kata tanya + でもいいです menyatakan keterbukaan penuh bahwa semua pilihan cocok/tidak masalah.',
          marugoto: 'なん／いつ／どこ／いくつ＋でも',
          examples: [
            { jp: 'A：{何|なに}が{食|た}べたいですか。 B：{何|なん}でもいいです。', id: 'A: Mau makan apa? B: Apa saja boleh.' },
            { jp: '{集合|しゅうごう}{時間|じかん}はいつでもいいですよ。', id: 'Jam kumpulnya kapan saja saya bisa kok.' },
            { jp: '{席|せき}はどこでもいいです。', id: 'Tempat duduknya di mana saja tidak masalah.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 12,
      topicJp: 'おいしい料理',
      topicId: 'Masakan yang Lezat',
      titleJp: '第12課 お弁当、おいしそうですね',
      titleId: 'Bento-nya Terlihat Enak ya',
      patterns: [
        {
          code: '1',
          title: 'ナA-／イA- そうです',
          formulas: [
            'ナA（tanpa な） + そうです (Terlihat ナA)',
            'イA（coret い） + そうです (Terlihat イA；いい → よさそうです)',
          ],
          functionText:
            'Mengungkapkan kesan visual langsung saat melihat makanan, benda, atau orang ("Kelihatannya ...").',
          marugoto: 'イA-／ナA-そうです',
          examples: [
            { jp: 'そのお{弁当|べんとう}、おいしそうですね。', id: 'Bento itu kelihatannya enak ya.' },
            { jp: 'このスープ、すごく{熱|あつ}そうですね。', id: 'Sup ini kelihatannya panas sekali ya.' },
            { jp: '{田中|たなか}さん、{今日|きょう}は{元気|げんき}そうですね。', id: 'Pak Tanaka hari ini kelihatannya bersemangat ya.' },
          ],
        },
        {
          code: '2',
          title: 'ナA-／イA- そうなN',
          formulas: [
            'ナA / イA（coret い） + そうな + N (N yang terlihat ...)',
          ],
          functionText:
            'Menggunakan bentuk そうだ untuk menerangkan kata benda di belakangnya (berfungsi seperti kata sifat-na, sehingga memakai そうな + N).',
          marugoto: 'イA-／ナA-そうなN',
          examples: [
            { jp: 'それ、{辛|から}そうな{料理|りょうり}ですね。', id: 'Itu masakan yang kelihatannya pedas ya.' },
            { jp: 'おいしそうなケーキが{並|なら}んでいますね。', id: 'Kue-kue yang terlihat lezat berjejer rapi ya.' },
            { jp: '{優|やさ}しそうな{先生|せんせい}ですね。', id: 'Guru yang kelihatannya baik hati ya.' },
          ],
        },
        {
          code: '3',
          title: 'イA-くて、～ / イA-くなくて、～',
          formulas: [
            'イA（coret い） + くて、 + S (Sifat positif/bersambung)',
            'イA（coret い） + くなくて、 + S (Tidak イA, dan S)',
          ],
          functionText:
            'Menjelaskan cita rasa atau karakteristik makanan dengan menggabungkan dua kesan sekaligus, termasuk bentuk negatif くなくて.',
          marugoto: 'イA-くて／くなくて、～',
          examples: [
            { jp: 'この{卵焼|たまごや}き、{甘|あま}くて、おいしいですね。{茶碗蒸|ちゃわんむ}し、{甘|あま}くなくて、おいしいですよ。', id: 'Telur dadar gulung ini manis dan enak ya. Chawanmushi tidak manis dan enak lho.' },
            { jp: 'このカレーは{辛|から}くなくて、{食|た}べやすいです。', id: 'Kari ini tidak pedas sehingga mudah dimakan.' },
            { jp: 'このパンは{柔|やわ}らかくて、とてもおいしいです。', id: 'Roti ini lembut dan sangat enak.' },
          ],
        },
        {
          code: '4',
          title: 'V-てみます',
          formulas: [
            'V-て + みます (Mencoba melakukan V)',
            'V-て + みてください (Silakan coba V)',
          ],
          functionText:
            'Menyatakan mencoba melakukan sesuatu (mencicipi makanan, mencoba pakaian) untuk mengetahui hasilnya.',
          marugoto: 'V-てみます (初級1 10課)',
          examples: [
            { jp: 'よかったら、この{卵焼|たまごや}き、{食|た}べてみてください。', id: 'Kalau berkenan, silakan coba makan telur dadar gulung ini.' },
            { jp: '{家|いえ}でもこの{料理|りょうり}を{作|つく}ってみます。', id: 'Di rumah juga saya akan coba memasak hidangan ini.' },
            { jp: 'ちょっと{飲|の}んでみましたが、とてもおいしかったです。', id: 'Saya sudah coba minum sedikit, ternyata sangat enak.' },
          ],
        },
        {
          code: '5',
          title: '自動詞・他動詞',
          formulas: [
            '他動詞 (Transitif): N（Objek） + を + V (Mis. 入れます memasukkan, 開けます membuka)',
            '自動詞 (Intransitif): N（Subjek） + が + V (Mis. 入ります masuk/berisi, 開きます terbuka)',
          ],
          functionText:
            'Membedakan kata kerja intransitif (fokus pada keadaan/isi benda: が入っています) dan transitif (fokus pada aksi sengaja manusia: を入れます).',
          marugoto: '（人が）NをV（他動詞） / NがV（自動詞） (初中級 トピック8)',
          examples: [
            { jp: '{鶏肉|とりにく}とか、エビとか、きのことかが{入|はい}ってます。ときどき、{銀杏|ぎんなん}も{入|い}れますよ。', id: 'Di dalamnya berisi ayam, udang, jamur, dll. Kadang saya juga memasukkan biji ginkgo.' },
            { jp: 'スープに{塩|しお}を{少|すこ}し{入|い}れました。', id: 'Saya memasukkan sedikit garam ke dalam sup.' },
            { jp: 'このパンにはチーズが{入|はい}っていますか？', id: 'Apakah di dalam roti ini ada isian keju?' },
          ],
        },
        {
          code: '6',
          title: 'イA-くないですか？',
          formulas: ['N + は、 + イA（coret い） + くないですか？ (Apakah tidak terlalu イA?)'],
          functionText:
            'Bentuk pertanyaan negatif sopan yang digunakan saat memperhatikan kenyamanan orang lain ("Apakah tidak hambar / tidak terlalu pedas?").',
          marugoto: 'S（-ない）ですか (初中級 トピック3)',
          examples: [
            { jp: '{味|あじ}は、うすくないですか？', id: 'Rasanya apakah tidak terlalu hambar?' },
            { jp: 'エアコン、{寒|さむ}くないですか？', id: 'AC-nya apakah tidak terlalu dingin?' },
            { jp: 'このソース、{辛|から}くないですか？', id: 'Saus ini apakah tidak terlalu pedas?' },
          ],
        },
      ],
    },
    {
      chapterNumber: 13,
      topicJp: '仕事の連絡',
      topicId: 'Komunikasi Pekerjaan',
      titleJp: '第13課 あと10分ぐらいで終わりそうです',
      titleId: 'Sepertinya Akan Selesai Sekitar 10 Menit Lagi',
      patterns: [
        {
          code: '1',
          title: '～んですが…',
          formulas: [
            'V / イA（普通形） + んですが… (Menjelaskan situasi/kendala saat melapor atau bertanya)',
            'N / ナA + な + んですが…',
          ],
          functionText:
            'Mengawali laporan masalah di tempat kerja atau permintaan bantuan dengan sopan agar lawan bicara memahami situasinya terlebih dahulu.',
          marugoto: 'S（普通体）んです (初級1 17課)',
          examples: [
            { jp: '{会議室|かいぎしつ}の{電気|でんき}がつかないんですが…。', id: 'Permisi, lampu ruang rapat tidak mau menyala…' },
            { jp: 'コピー{機|き}の{紙|かみ}がなくなったんですが、どこにありますか？', id: 'Kertas mesin fotokopinya habis, ada di mana ya?' },
            { jp: 'ちょっと{聞|き}きたいことがあるんですが、{今|いま}いいですか？', id: 'Ada hal yang ingin saya tanyakan sebentar, apakah sekarang bisa?' },
          ],
        },
        {
          code: '2',
          title: 'V-そうです',
          formulas: ['V（akar ます） + そうです (Kelihatannya akan V / tampaknya hampir V)'],
          functionText:
            'Menyatakan prediksi terhadap perkembangan suatu pekerjaan atau kejadian yang hampir terjadi berdasarkan situasi saat ini.',
          marugoto: 'V-そうです／そうなN (初中級 トピック5)',
          examples: [
            { jp: 'どのぐらいかかりそうですか？', id: 'Kira-kira tampaknya akan memakan waktu berapa lama?' },
            { jp: 'あと10{分|ぷん}ぐらいで{終|お}わりそうです。', id: 'Sepertinya akan selesai sekitar 10 menit lagi.' },
            { jp: '{空|そら}が{暗|くら}いですね。もうすぐ{雨|あめ}が{降|ふ}りそうです。', id: 'Langitnya gelap ya. Sepertinya sebentar lagi akan turun hujan.' },
          ],
        },
        {
          code: '3',
          title: 'V-たいとき、～',
          formulas: ['V（akar ます） + たい + とき（は）、 + S (Ketika ingin melakukan V, ...)'],
          functionText:
            'Menanyakan atau menjelaskan prosedur saat kita ingin melakukan suatu operasi/tindakan tertentu di kantor.',
          marugoto: 'イA-いとき、～ (初級1 2課)',
          examples: [
            { jp: '{両面|りょうめん}コピーしたいときは、どうすればいいですか？', id: 'Kalau ingin fotokopi bolak-balik, harus bagaimana ya?' },
            { jp: 'カラーで{印刷|いんさつ}したいときは、ここを{押|お}してください。', id: 'Kalau ingin mencetak warna, silakan tekan tombol ini.' },
            { jp: '{音|おと}を{消|け}したいとき、このボタンを{使|つか}います。', id: 'Saat ingin mematikan suara, gunakan tombol ini.' },
          ],
        },
        {
          code: '4',
          title: 'V-ると、～',
          formulas: ['V-る（辞書形） + と、 + S（Hasil otomatis / pasti） (Jika V, maka otomatis S)'],
          functionText:
            'Menyatakan hubungan sebab-akibat yang pasti terjadi (seperti pengoperasian mesin, petunjuk arah, hukum alam). Tidak dipakai untuk kalimat perintah/ajakan di S2.',
          marugoto: 'V-ると、～ (初級2 4課)',
          examples: [
            { jp: 'このスタートボタンを{押|お}すと、コピーが{始|はじ}まります。', id: 'Jika menekan tombol start ini, proses fotokopi akan dimulai.' },
            { jp: 'ここを{右|みぎ}に{回|まわ}すと、{音|おと}が{大|おお}きくなります。', id: 'Jika memutar bagian ini ke kanan, suaranya menjadi lebih besar.' },
            { jp: 'カードを{入|い}れると、ドアが{開|あ}きます。', id: 'Jika memasukkan kartu, pintunya terbuka.' },
          ],
        },
        {
          code: '5',
          title: 'はい、【否定文】／いいえ、【肯定文】',
          formulas: [
            'Pertanyaan negatif: ～ないですか？',
            'Setuju bahwa tidak: はい、～ないです / Membantah: いいえ、～ます',
          ],
          functionText:
            'Dalam bahasa Jepang, はい / いいえ menjawab apakah pernyataan pertanyaan itu benar atau salah—bukan sekadar ya/tidak bahasa Indonesia.',
          marugoto: '※文法項目としては該当なし',
          examples: [
            { jp: 'A：コピー{機|き}、{使|つか}ったことないですか？ B：はい、ないです。', id: 'A: Belum pernah pakai mesin fotokopi? B: Iya, belum pernah.' },
            { jp: 'A：まだ{昼|ひる}ご{飯|はん}を{食|た}べていませんか？ B：いいえ、もう{食|た}べました。', id: 'A: Belum makan siang? B: Tidak (sudah), saya sudah makan.' },
            { jp: 'A：{明日|あした}は{来|こ}ないんですか？ B：はい、{休|やす}みなんです。', id: 'A: Besok tidak datang? B: Iya, saya libur.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 14,
      topicJp: '仕事の連絡',
      topicId: 'Komunikasi Pekerjaan',
      titleJp: '第14課 休みを取ってもいいでしょうか？',
      titleId: 'Bolehkah Saya Mengambil Cuti?',
      patterns: [
        {
          code: '1',
          title: 'Nで、～／ナA-で、～／イA-くて、～／V-て、～ ＜原因・理由＞',
          formulas: [
            'N / ナA + で、 + S (Karena N / ナA)',
            'イA（coret い） + くて、 / V-て、 + S (Karena イA / V)',
          ],
          functionText:
            'Bentuk て/で dari semua kelas kata untuk menjelaskan alasan/penyebab terjadinya keterlambatan, izin, atau permohonan maaf.',
          marugoto: 'N-で、～ / V-て、～ (初級1 7課)',
          examples: [
            { jp: '{道|みち}が{混|こ}んでいて、ぜんぜん{動|うご}きません。{昨日|きのう}は、{休|やす}んですみませんでした。', id: 'Jalannya macet, sama sekali tidak bergerak. Mohon maaf kemarin saya tidak masuk kerja.' },
            { jp: '{頭|あたま}が{痛|いた}くて、{仕事|しごと}に{行|い}けません。', id: 'Kepala saya sakit sehingga tidak bisa berangkat kerja.' },
            { jp: '{電車|でんしゃ}の{故障|こしょう}で、15{分|ふん}ほど{遅|おく}れます。', id: 'Karena gangguan kereta, saya akan terlambat sekitar 15 menit.' },
          ],
        },
        {
          code: '2',
          title: 'S1。それで、S2',
          formulas: ['S1（Situasi/Sebab）。それで、 + S2（Keputusan/Akibat）'],
          functionText:
            'Kata sambung yang berarti "Oleh karena itu / Maka dari itu", menghubungkan penjelasan alasan dengan laporan tindakan yang diambil.',
          marugoto: '→「りかい」語彙扱い (初級2 14課)',
          examples: [
            { jp: 'これから{病院|びょういん}に{行|い}きます。それで、{少|すこ}し{遅刻|ちこく}します。', id: 'Sebentar lagi saya mau ke rumah sakit. Oleh karena itu, saya agak terlambat.' },
            { jp: '{急|きゅう}な{用事|ようじ}ができました。それで、{早退|そうたい}したいんです。', id: 'Ada urusan mendadak. Maka dari itu saya ingin pulang lebih awal.' },
            { jp: '{昨日|きのう}から{熱|ねつ}があります。それで、{今日|きょう}は{休|やす}ませてください。', id: 'Sejak kemarin saya demam. Karena itu, izinkan saya libur hari ini.' },
          ],
        },
        {
          code: '3',
          title: 'V-てもいいですか？',
          formulas: ['V-て + も + いいですか？ (Bolehkah saya melakukan V?)'],
          functionText:
            'Meminta izin melakukan sesuatu secara sopan standar kepada rekan kerja atau orang sekitar.',
          marugoto: 'V-てもいいですか',
          examples: [
            { jp: 'トイレに{行|い}って{来|き}てもいいですか？', id: 'Bolehkah saya pergi ke toilet sebentar?' },
            { jp: 'ここに{荷物|にもつ}を{置|お}いてもいいですか？', id: 'Bolehkah saya menaruh barang di sini?' },
            { jp: '{写真|しゃしん}を{撮|と}ってもいいですか？', id: 'Bolehkah saya mengambil foto?' },
          ],
        },
        {
          code: '4',
          title: 'V-てもいいでしょうか？',
          formulas: ['V-て + も + いいでしょうか？ (Bolehkah kiranya saya melakukan V? — lebih sopan)'],
          functionText:
            'Versi lebih sopan dan halus dari V-てもいいですか？, ideal saat meminta izin cuti, pulang awal, atau pergantian shift kepada atasan.',
          marugoto: 'V-てもいいですか',
          examples: [
            { jp: '{明日|あした}の{午後|ごご}、{早退|そうたい}してもいいでしょうか？', id: 'Bolehkah kiranya besok sore saya pulang lebih awal?' },
            { jp: '{来週|らいしゅう}の{金曜日|きんようび}、{休|やす}みを{取|と}ってもいいでしょうか？', id: 'Bolehkah saya mengambil cuti pada hari Jumat minggu depan?' },
            { jp: 'ここで{少|すこ}し{休憩|きゅうけい}してもいいでしょうか？', id: 'Bolehkah saya beristirahat sebentar di sini?' },
          ],
        },
        {
          code: '5',
          title: 'V-なければなりません',
          formulas: [
            'V-ない（coret い） + ければなりません (Harus melakukan V — sopan)',
            'Penjelasan alasan: V-なければ + ならないんです',
          ],
          functionText:
            'Menyatakan kewajiban atau keharusan yang tidak bisa dihindari (mis. mengurus dokumen di balai kota, menghadiri pemeriksaan).',
          marugoto: 'V-なければなりません／なきゃいけません (初中級 トピック1)',
          examples: [
            { jp: 'ちょっと、{役所|やくしょ}に{行|い}かなければならないんです。', id: 'Saya harus pergi ke kantor pemerintahan sebentar.' },
            { jp: '{今日|きょう}までにこのレポートを{出|だ}さなければなりません。', id: 'Saya harus mengumpulkan laporan ini paling lambat hari ini.' },
            { jp: '{明日|あした}は6{時|じ}に{起|お}きなければなりません。', id: 'Besok saya harus bangun jam 6.' },
          ],
        },
        {
          code: '6',
          title: '～んです ①',
          formulas: [
            'V / イA（普通形） + んです (Menjelaskan latar belakang / alasan)',
            'N / ナA + な + んです',
          ],
          functionText:
            'Fungsi pertama ～んです: memberikan penjelasan alasan atau situasi pribadi ketika meminta izin atau menjawab pertanyaan.',
          marugoto: 'S（普通体）んです (初級1 17課)',
          examples: [
            { jp: '{東京|とうきょう}から、{国|くに}の{友|とも}だちが{来|く}るんです。', id: 'Soalnya teman dari negara asal saya akan datang dari Tokyo.' },
            { jp: '{母|はは}が{日本|にほん}に{遊|あそ}びに{来|く}るんです。', id: 'Soalnya ibu saya akan datang berkunjung ke Jepang.' },
            { jp: '{明日|あした}、{銀行|ぎんこう}に{行|い}く{用事|ようじ}があるんです。', id: 'Soalnya besok saya ada urusan pergi ke bank.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 15,
      topicJp: '健康な生活',
      topicId: 'Hidup Sehat',
      titleJp: '第15課 熱があってのどが痛いんです',
      titleId: 'Saya Demam dan Tenggorokan Sakit',
      patterns: [
        {
          code: '1',
          title: '～んです ②',
          formulas: ['S（Gejala / Keluhan・普通形） + んです (Menjelaskan keluhan kepada dokter/apoteker)'],
          functionText:
            'Fungsi kedua ～んです: menyampaikan gejala penyakit atau kondisi fisik yang sedang dialami saat berkonsultasi di klinik atau apotek.',
          marugoto: 'S（普通体）んです (初級1 17課)',
          examples: [
            { jp: '{昨日|きのう}から38{度|ど}の{熱|ねつ}があって、のどがすごく{痛|いた}いんです。', id: 'Sejak kemarin saya demam 38 derajat dan tenggorokan sangat sakit.' },
            { jp: 'さっきから、おなかが{痛|いた}いんです。', id: 'Dari tadi perut saya terasa sakit.' },
            { jp: '{夜|よる}、あまり{眠|ねむ}れないんです。', id: 'Malam hari saya tidak terlalu bisa tidur.' },
          ],
        },
        {
          code: '2',
          title: 'V-ないでください',
          formulas: ['V-ない + で + ください (Tolong jangan melakukan V)'],
          functionText:
            'Meminta atau menasihati seseorang secara sopan agar tidak melakukan tindakan tertentu (sering digunakan dokter atau rambu peringatan).',
          marugoto: 'V-ないでください',
          examples: [
            { jp: '{今週|こんしゅう}は{仕事|しごと}を{休|やす}んで、できるだけ{人|ひと}に{会|あ}わないでください。', id: 'Minggu ini istirahatlah dari kerja, dan sebisa mungkin jangan bertemu orang.' },
            { jp: '{今日|きょう}は{無理|むり}をしないでください。', id: 'Hari ini tolong jangan memaksakan diri.' },
            { jp: 'この{薬|くすり}を{飲|の}んだら、お{酒|さけ}は{飲|の}まないでください。', id: 'Setelah minum obat ini, tolong jangan minum alkohol.' },
          ],
        },
        {
          code: '3',
          title: 'V（普通形）＋N ①',
          formulas: ['V（普通形：V-る / V-ない / V-た） + N (Modifikasi nomina: N yang V)'],
          functionText:
            'Menerangkan kata benda (mis. obat, makanan, orang) dengan klausa kata kerja bentuk biasa di depannya ("obat yang meredakan batuk").',
          marugoto: 'V-る＋人 (初級1 16課)',
          examples: [
            { jp: 'こちらは、せきを{抑|おさ}える{薬|くすり}です。', id: 'Yang ini adalah obat yang meredakan batuk.' },
            { jp: 'これは{熱|ねつ}を{下|さ}げる{薬|くすり}です。', id: 'Ini adalah obat penurun panas.' },
            { jp: '{眠|ねむ}くならない{薬|くすり}はありますか？', id: 'Apakah ada obat yang tidak menyebabkan kantuk?' },
          ],
        },
        {
          code: '4a',
          title: 'V-る前に、～',
          formulas: ['V-る（辞書形） + {前|まえ}に、 + S (Sebelum melakukan V, lakukan S)'],
          functionText:
            'Menyatakan urutan waktu: melakukan S terlebih dahulu sebelum melakukan V (kata kerja sebelum 前に selalu bentuk kamus V-る, walau kalimat utamanya lampau).',
          marugoto: 'V-るまえに、～',
          examples: [
            { jp: '1{日|にち}1{回|かい}、{寝|ね}る{前|まえ}に{飲|の}んでください。', id: 'Tolong diminum 1 kali sehari sebelum tidur.' },
            { jp: 'ご{飯|はん}を{食|た}べる{前|まえ}に、{手|て}を{洗|あら}います。', id: 'Sebelum makan, saya mencuci tangan.' },
            { jp: '{出|で}かける{前|まえ}に、{窓|まど}を{閉|し}めました。', id: 'Sebelum berangkat keluar, saya menutup jendela.' },
          ],
        },
        {
          code: '4b',
          title: 'V-たあと、～',
          formulas: ['V-た + あと（で）、 + S (Setelah melakukan V, lakukan S)'],
          functionText:
            'Menyatakan tindakan yang dilakukan setelah kegiatan pertama selesai (kata kerja sebelum あと selalu bentuk lampau V-た).',
          marugoto: 'V-た後で、～ (初中級 トピック8)',
          examples: [
            { jp: '{飲|の}むと、{眠|ねむ}くなります。{飲|の}んだあと、{運転|うんてん}しないでくださいね。', id: 'Kalau diminum jadi mengantuk. Setelah minum obat ini, jangan menyetir ya.' },
            { jp: '{食事|しょくじ}をしたあとで、この{薬|くすり}を{飲|の}みます。', id: 'Setelah makan, minum obat ini.' },
            { jp: '{運動|うんどう}したあと、{水|みず}をたくさん{飲|の}みました。', id: 'Setelah berolahraga, saya minum banyak air.' },
          ],
        },
        {
          code: '5',
          title: '～とき（に）、～',
          formulas: ['V-る / V-ない / V-ている / イA-い + とき（に）、 + S (Pada saat ...)'],
          functionText:
            'Menjelaskan kondisi kapan suatu tindakan atau obat digunakan ("ketika ...").',
          marugoto: 'V-る／V-ている／V-たとき、～ (初級2 5課)',
          examples: [
            { jp: 'この{薬|くすり}は、{痛|いた}くてがまんできないときに、{飲|の}んでください。', id: 'Obat ini silakan diminum ketika sakitnya sudah tidak tertahankan.' },
            { jp: '{熱|ねつ}があるときに、これを{飲|の}みます。', id: 'Minum ini ketika sedang demam.' },
            { jp: 'のどが{乾|かわ}いたとき、お{茶|ちゃ}を{飲|の}みます。', id: 'Saat haus, saya minum teh.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 16,
      topicJp: '健康な生活',
      topicId: 'Hidup Sehat',
      titleJp: '第16課 食べすぎないようにしています',
      titleId: 'Saya Berusaha Tidak Makan Berlebihan',
      patterns: [
        {
          code: '1',
          title: 'V-るといいです（よ）',
          formulas: ['V-る（辞書形） / V-ない + と + いいです（よ） (Sebaiknya / bagus jika melakukan V)'],
          functionText:
            'Memberikan saran atau tips kesehatan ringan dengan ramah ("Bagus lho kalau ...").',
          marugoto: 'V-るといいです（よ） (初級1 15課)',
          examples: [
            { jp: 'よく{眠|ねむ}れないときは、ぬるいお{風呂|ふろ}にゆっくり{入|はい}るといいですよ。', id: 'Saat tidak bisa tidur nyenyak, bagus lho kalau berendam pelan di air hangat suam-suam kuku.' },
            { jp: '{疲|つか}れたときは、{早|はや}く{寝|ね}るといいですよ。', id: 'Kalau lelah, sebaiknya tidur lebih awal ya.' },
            { jp: '{肩|かた}がこったら、ストレッチをするといいです。', id: 'Kalau bahu pegal, bagus jika melakukan peregangan.' },
          ],
        },
        {
          code: '2',
          title: 'V-すぎます',
          formulas: [
            'V（akar ます） + すぎます (Terlalu banyak / berlebihan melakukan V)',
            'Contoh: {食|た}べます → {食|た}べすぎます / {飲|の}みます → {飲|の}みすぎます',
          ],
          functionText:
            'Menyatakan suatu tindakan dilakukan melewati batas wajar ("terlalu banyak makan/minum/bekerja").',
          marugoto: 'V-すぎます (初級1 13課)',
          examples: [
            { jp: '{昨日|きのう}、{飲|の}みすぎました。', id: 'Kemarin saya minum terlalu banyak.' },
            { jp: 'おいしかったので、ケーキを{食|た}べすぎました。', id: 'Karena enak, saya makan kue terlalu banyak.' },
            { jp: '{夜|よる}、スマホを{見|み}すぎないようにしています。', id: 'Malam hari saya berusaha tidak terlalu lama melihat ponsel.' },
          ],
        },
        {
          code: '3',
          title: 'V1-たり、V2-たり（します）',
          formulas: [
            'V1-た + り、 + V2-た + り + します / しています (Melakukan V1, V2, dan semacamnya)',
          ],
          functionText:
            'Menyebutkan beberapa contoh kegiatan yang dilakukan secara bergantian atau tidak terikat urutan tertentu.',
          marugoto: 'V1-たりV2-たり（しています）',
          examples: [
            { jp: 'ジョギングしたり、ときどき{家|いえ}でヨガをしたりしてます。', id: 'Saya melakukan hal seperti joging, atau kadang-kadang yoga di rumah.' },
            { jp: '{休|やす}みの{日|ひ}は、{掃除|そうじ}をしたり、{本|ほん}を{読|よ}んだりします。', id: 'Di hari libur saya bersih-bersih, membaca buku, dan sebagainya.' },
            { jp: '{週末|しゅうまつ}は{公園|こうえん}を{歩|ある}いたり、{泳|およ}いだりしています。', id: 'Akhir pekan saya berjalan-jalan di taman, berenang, dll.' },
          ],
        },
        {
          code: '4a',
          title: 'V-るようにしています',
          formulas: ['V-る（辞書形） + ように + しています (Berusaha rutin membiasakan V)'],
          functionText:
            'Menyatakan usaha sadar yang terus dilakukan secara rutin demi menjaga kebiasaan baik atau kesehatan.',
          marugoto: 'V-るように しています (初級2 15課)',
          examples: [
            { jp: 'できるだけ、{野菜|やさい}をたくさん{食|た}べるようにしています。', id: 'Sebisa mungkin saya berusaha makan banyak sayuran.' },
            { jp: '{毎日|まいにち}、1{駅分|えきぶん}{歩|ある}くようにしています。', id: 'Setiap hari saya berusaha berjalan kaki sejauh satu stasiun.' },
            { jp: '{寝|ね}る{前|まえ}に{白湯|さゆ}を{飲|の}むようにしています。', id: 'Saya membiasakan diri minum air hangat sebelum tidur.' },
          ],
        },
        {
          code: '4b',
          title: 'V-ないようにしています',
          formulas: ['V-ない + ように + しています (Berusaha menghindari / tidak melakukan V)'],
          functionText:
            'Bentuk negatif dari ようにしています: menyatakan usaha sadar untuk tidak melakukan kebiasaan buruk.',
          marugoto: 'V-ないように しています (初級2 15課)',
          examples: [
            { jp: '{健康|けんこう}のために、{食|た}べすぎないようにしています。', id: 'Demi kesehatan, saya berusaha agar tidak makan berlebihan.' },
            { jp: '{夜|よる}おそくに{甘|あま}いものを{食|た}べないようにしています。', id: 'Saya berusaha tidak makan makanan manis larut malam.' },
            { jp: 'エレベーターを{使|つか}わないようにしています。', id: 'Saya berusaha untuk tidak memakai lift.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 17,
      topicJp: '交際',
      topicId: 'Pergaulan & Hadiah',
      titleJp: '第17課 兄がくれたお守りです',
      titleId: 'Ini Jimat yang Diberikan Kakak Laki-laki Saya',
      patterns: [
        {
          code: '1',
          title: 'V（普通形）＋N ②',
          formulas: [
            '（【場所】から / 【人】に） + V-た（普通形） + N (Modifikasi nomina bentuk lampau)',
          ],
          functionText:
            'Menjelaskan asal-usul atau sejarah sebuah barang/hadiah menggunakan klausa kata kerja bentuk lampau biasa sebelum kata benda.',
          marugoto: '名詞修飾② V（普通体）＋N',
          examples: [
            { jp: 'ネパールから{持|も}って{来|き}た{飾|かざ}りです。', id: 'Ini adalah hiasan yang saya bawa dari Nepal.' },
            { jp: 'これは{京都|きょうと}で{買|か}ったお{土産|みやげ}です。', id: 'Ini adalah oleh-oleh yang saya beli di Kyoto.' },
            { jp: '{昨日|きのう}{撮|と}った{写真|しゃしん}を{見|み}てください。', id: 'Silakan lihat foto yang diambil kemarin.' },
          ],
        },
        {
          code: '2',
          title: '【人】に【物】をもらいます',
          formulas: [
            '（{私|わたし}は） + 【人】 + に / から + 【物】 + を + もらいます / もらいました',
          ],
          functionText:
            'Menyatakan menerima hadiah atau benda dari seseorang (subjek adalah penerima; pemberi ditandai に atau から).',
          marugoto: 'N1（人）にN2をもらいます (入門 15課)',
          examples: [
            { jp: 'このマグカップ、{誕生日|たんじょうび}に、{友|とも}だちにもらったんです。', id: 'Mug ini saya terima dari teman saat ulang tahun.' },
            { jp: '{先生|せんせい}に{日本語|にほんご}の{本|ほん}をもらいました。', id: 'Saya menerima buku bahasa Jepang dari guru.' },
            { jp: '{会社|かいしゃ}の{人|ひと}から{北海道|ほっかいどう}のお{菓子|かし}をもらいました。', id: 'Saya mendapat camilan Hokkaido dari rekan kantor.' },
          ],
        },
        {
          code: '3',
          title: '【人】が【物】をくれます',
          formulas: [
            '【人】 + は / が + （{私|わたし}に） + 【物】 + を + くれます / くれました',
          ],
          functionText:
            'Digunakan ketika orang lain (sebagai subjek) memberi sesuatu kepada pembicara (saya) atau keluarga pembicara.',
          marugoto: '→ 4.読解 (初中級 トピック4)',
          examples: [
            { jp: 'これは、{兄|あに}がくれたお{守|まも}りです。', id: 'Ini adalah jimat keberuntungan yang diberikan kakak laki-laki saya.' },
            { jp: '{母|はは}が{送別会|そうべつかい}のときに{時計|とけい}をくれました。', id: 'Ibu saya membelikan/memberi saya jam tangan saat acara perpisahan.' },
            { jp: '{先輩|せんぱい}が{使|つか}いやすい{辞書|じしょ}をくれました。', id: 'Senior memberi saya kamus yang mudah dipakai.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 18,
      topicJp: '交際',
      topicId: 'Pergaulan & Hadiah',
      titleJp: '第18課 何かプレゼントをあげませんか？',
      titleId: 'Maukah Kita Memberi Hadiah?',
      patterns: [
        {
          code: '1',
          title: 'S（普通形）そうです',
          formulas: [
            'V / イA（普通形） + そうです (Kabarnya / katanya ...)',
            'N / ナA + だ + そうです (Wajib pakai だ sebelum そうです untuk desas-desus/kabar)',
          ],
          functionText:
            'Menyampaikan informasi yang didengar dari orang lain atau berita ("Kabarnya / Saya dengar ..."). Berbeda dari そうです (kelihatannya), pola ini memakai kalimat bentuk biasa lengkap.',
          marugoto: 'S（普通体）そうです (初級2 14課)',
          examples: [
            { jp: 'お{子|こ}さんが{生|う}まれたそうですね。', id: 'Kabarnya anak Anda baru lahir ya.' },
            { jp: '{佐藤|さとう}さんは{来月|らいげつ}{結婚|けっこん}するそうです。', id: 'Katanya Bu Sato akan menikah bulan depan.' },
            { jp: '{天気予報|てんきよほう}によると、{明日|あした}は{雪|ゆき}だそうです。', id: 'Menurut prakiraan cuaca, katanya besok turun salju.' },
          ],
        },
        {
          code: '2',
          title: '【人】に【物】をあげます',
          formulas: ['（{私|わたし}は） + 【人】 + に + 【物】 + を + あげます (Memberikan benda kepada orang lain)'],
          functionText:
            'Menyatakan memberi sesuatu kepada orang lain (penerima ditandai に). Tidak dipakai jika penerimanya adalah pembicara sendiri.',
          marugoto: 'N1（人）にN2をあげます (入門 15課)',
          examples: [
            { jp: 'アナさんに{何|なに}かプレゼントをあげませんか？', id: 'Maukah kita memberi suatu hadiah untuk Ana?' },
            { jp: '{母|はは}の{日|ひ}に、{母|はは}に{花|はな}をあげました。', id: 'Pada Hari Ibu, saya memberi bunga kepada ibu.' },
            { jp: '{友|とも}だちの{結婚|けっこん}{祝|いわ}いに{食器|しょっき}をあげます。', id: 'Saya akan memberi peralatan makan untuk hadiah pernikahan teman.' },
          ],
        },
        {
          code: '3',
          title: 'S（普通形）と言っていました',
          formulas: ['【人】は + S（普通形） + と + {言|い}っていました (Mengatakan bahwa S)'],
          functionText:
            'Mengutip secara tidak langsung ucapan atau keinginan seseorang yang pernah kita dengar sebelumnya ("Dia bilang bahwa ...").',
          marugoto: 'S（普通体）と言っていました',
          examples: [
            { jp: 'アナさん、{前|まえ}に、{焼|や}き{鳥|とり}が{大好|だいす}きだと{言|い}っていました。', id: 'Ana sebelumnya pernah bilang bahwa dia sangat suka yakitori.' },
            { jp: '{山田|やまだ}さんは{明日|あした}{休|やす}むと{言|い}っていましたよ。', id: 'Pak Yamada bilang besok dia libur lho.' },
            { jp: '{店長|てんちょう}は「{来週|らいしゅう}から{忙|いそが}しくなる」と{言|い}っていました。', id: 'Manajer bilang bahwa mulai minggu depan akan menjadi sibuk.' },
          ],
        },
        {
          code: '4',
          title: 'S（普通形）と思います',
          formulas: [
            'V / イA（普通形） + と + {思|おも}います (Saya pikir / menurut saya ...)',
            'N / ナA + だ + と + {思|おも}います',
          ],
          functionText:
            'Menyatakan pendapat, usulan, atau dugaan pribadi secara sopan ("Menurut saya ...").',
          marugoto: 'S（普通体）と思います',
          examples: [
            { jp: 'もっと、{思|おも}い{出|で}に{残|のこ}るものがいいと{思|おも}います。', id: 'Menurut saya, lebih baik sesuatu yang lebih membekas sebagai kenangan.' },
            { jp: 'みんなでお{金|かね}を{出|だ}して{買|か}うのがいいと{思|おも}います。', id: 'Saya pikir bagus kalau kita patungan bersama untuk membelinya.' },
            { jp: 'この{色|いろ}はアナさんに{似合|にあ}うと{思|おも}いますよ。', id: 'Menurut saya warna ini cocok untuk Ana lho.' },
          ],
        },
      ],
    },
  ],
};
