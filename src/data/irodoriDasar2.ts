import type { RawBookSpec } from './irodoriTypes';

export const IRODORI_DASAR2_SPEC: RawBookSpec = {
  id: 'elementary2',
  shortTitle: 'Dasar 2',
  title: 'Dasar 2 — いろどり 初級2 (A2)',
  japaneseSubtitle: 'いろどり 初級2',
  level: 'A2',
  chapters: [
    {
      chapterNumber: 1,
      topicJp: '私の周りの人たち',
      topicId: 'Orang-orang di Sekitar Saya',
      titleJp: '第1課 先週、日本に来たばかりです',
      titleId: 'Baru Saja Datang ke Jepang Minggu Lalu',
      patterns: [
        {
          code: '1',
          title: 'N1というN2',
          formulas: [
            'N1 + という + {意味|いみ}です (Artinya adalah N1)',
            'N1（名前） + という + N2（種類） (N2 yang bernama N1)',
          ],
          functionText:
            'Memperkenalkan nama tempat, makanan, atau menjelaskan arti sebuah nama yang belum dikenal lawan bicara ("N2 yang disebut/bernama N1").',
          marugoto: '～という意味',
          examples: [
            { jp: 'ホアは「{花|はな}」という{意味|いみ}です。', id: '"Hoa" artinya "bunga".' },
            { jp: 'ジャワ{島|とう}に、バンドンという{涼|すず}しい{町|まち}があります。', id: 'Di Pulau Jawa ada kota sejuk bernama Bandung.' },
            { jp: '「テンペ」というインドネシアの{食べ物|たべもの}を{知|し}っていますか？', id: 'Apakah kamu tahu makanan Indonesia bernama "tempe"?' },
          ],
        },
        {
          code: '2',
          title: 'V-たばかりです',
          formulas: ['V-た + ばかりです (Baru saja selesai / baru saja melakukan V — menurut perasaan pembicara)'],
          functionText:
            'Menyatakan suatu peristiwa baru saja terjadi belum lama ini menurut sudut pandang pembicara (bisa beberapa hari, minggu, atau bulan lalu).',
          marugoto: 'V-たばかりだ (中級2 トピック1)',
          examples: [
            { jp: '{先週|せんしゅう}、{日本|にほん}に{来|き}たばかりです。', id: 'Saya baru saja datang ke Jepang minggu lalu.' },
            { jp: 'この{会社|かいしゃ}に{入|はい}ったばかりで、まだ{仕事|しごと}に{慣|な}れません。', id: 'Saya baru saja masuk perusahaan ini, jadi belum terbiasa dengan pekerjaannya.' },
            { jp: 'さっき{昼|ひる}ご{飯|はん}を{食|た}べたばかりです。', id: 'Saya baru saja makan siang tadi.' },
          ],
        },
        {
          code: '3',
          title: 'V-ていました',
          formulas: ['V-て + いました (Dulu sedang / pernah rutin melakukan V dalam suatu periode)'],
          functionText:
            'Bentuk lampau dari V-ています untuk menceritakan pekerjaan, tempat tinggal, atau aktivitas yang dulu dijalani sebelum pindah ke Jepang.',
          marugoto: 'V-ていました (初級2 9課)',
          examples: [
            { jp: 'ベトナムでは、ホテルで{働|はたら}いていました。', id: 'Di Vietnam dulu saya bekerja di hotel.' },
            { jp: '{日本|にほん}に{来|く}る{前|まえ}、ジャカルタに{住|す}んでいました。', id: 'Sebelum datang ke Jepang, saya tinggal di Jakarta.' },
            { jp: '{大学|だいがく}では{看護|かんご}を{勉強|べんきょう}していました。', id: 'Di universitas dulu saya belajar keperawatan.' },
          ],
        },
        {
          code: '4',
          title: 'それ／そこ ＜文脈指示＞',
          formulas: [
            'S1（Menyebutkan tempat/benda）。 + そこ / それ + … (Merujuk kembali pada hal yang baru disebutkan)',
          ],
          functionText:
            'Kata tunjuk konteks (文脈指示): そこ merujuk tempat yang baru saja disebut dalam percakapan, dan それ merujuk benda/hal yang baru saja dibicarakan.',
          marugoto: '※文法項目としては該当なし',
          examples: [
            { jp: 'ジャワ{島|とう}に、ジョグジャカルタという{大|おお}きい{町|まち}があります。ウォノソボは、そこから、バスで4{時間|じかん}ぐらいです。', id: 'Di Pulau Jawa ada kota besar bernama Yogyakarta. Wonosobo kira-kira 4 jam naik bus dari sana.' },
            { jp: '{駅前|えきまえ}に{新|あたら}しいラーメン{屋|や}ができました。そこはすごくおいしいですよ。', id: 'Di depan stasiun buka kedai ramen baru. Di sana sangat enak lho.' },
            { jp: 'インドネシアにはナシゴレンがあります。それは{炒|いた}めご{飯|はん}のことです。', id: 'Di Indonesia ada nasi goreng. Itu adalah nasi yang digoreng.' },
          ],
        },
        {
          code: '5',
          title: '～て、～ / ～から、～ / ～けど、～ ＜2つの文を1つにする＞',
          formulas: [
            'Paralel/sejalan: V-て / イA-くて / ナA・N-で、 + S2',
            'Sebab-akibat: S1（普通形/丁寧体） + から、 + S2',
            'Kontras: S1（普通形/丁寧体） + けど、 + S2',
          ],
          functionText:
            'Menggabungkan dua kalimat pendek menjadi satu kalimat yang mengalir alami saat memperkenalkan kampung halaman atau latar belakang diri.',
          marugoto: '→3課、5課、6課で既出 (初級1 3、5、6課)',
          examples: [
            { jp: 'お{茶|ちゃ}の{畑|はたけ}がたくさんあって、のんびりしています。ウランバートルは{首都|しゅと}だから、{都会|とかい}ですよ。{首都|しゅと}ではないけど、とてもにぎやかです。', id: 'Ada banyak kebun teh dan suasananya santai. Ulaanbaatar karena ibu kota jadi perkotaan besar lho. Meskipun bukan ibu kota, sangat ramai.' },
            { jp: '{海|うみ}が{近|ちか}いから、{新鮮|しんせん}な{魚|さかな}が{安|やす}く{食|た}べられます。', id: 'Karena dekat laut, kita bisa makan ikan segar dengan murah.' },
            { jp: '{冬|ふゆ}は{寒|さむ}いけど、{人|ひと}が{温|あたた}かくていい{町|まち}です。', id: 'Musim dinginnya dingin, tapi penduduknya ramah sehingga kota yang bagus.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 2,
      topicJp: '私の周りの人たち',
      topicId: 'Orang-orang di Sekitar Saya',
      titleJp: '第2課 まじめそうな人ですね',
      titleId: 'Orang yang Kelihatannya Serius ya',
      patterns: [
        {
          code: '1',
          title: 'N1はN2が ナA-です／イA-いです ②',
          formulas: ['N1（人） + は + N2（髪・背・声・目） + が + ナA-です / イA-いです'],
          functionText:
            'Mendeskripsikan ciri fisik atau karakter seseorang (rambutnya pendek, badannya tinggi, suaranya ramah).',
          marugoto: 'N1［人］はN2がイA-い／ナA-です',
          examples: [
            { jp: '{江口|えぐち}さんは、{髪|かみ}が{短|みじか}いです。', id: 'Bu Eguchi rambutnya pendek.' },
            { jp: '{高橋|たかはし}さんは{背|せ}が{高|たか}くて、メガネをかけています。', id: 'Pak Takahashi badannya tinggi dan memakai kacamata.' },
            { jp: 'アリさんはいつも{笑顔|えがお}がすてきです。', id: 'Ari senyumannya selalu menawan.' },
          ],
        },
        {
          code: '2',
          title: 'V-ている＋人',
          formulas: ['（【場所】で / 【服・物】を） + V-ている + {人|ひと} (Orang yang sedang memakai / melakukan V)'],
          functionText:
            'Menunjuk dan mengidentifikasi seseorang berdasarkan pakaian/aksesoris yang sedang dipakai atau aktivitas yang sedang dilakukan saat itu.',
          marugoto: 'V-ている＋人',
          examples: [
            { jp: 'ナインさんは、{帽子|ぼうし}をかぶっている{人|ひと}です。{加藤|かとう}さんは、あそこで、コピーをしている{人|ひと}です。', id: 'Naing adalah orang yang memakai topi. Pak Kato adalah orang yang sedang memfotokopi di sana.' },
            { jp: '{青|あお}いシャツを{着|き}ている{人|ひと}が{課長|かちょう}です。', id: 'Orang yang memakai kemeja biru adalah kepala bagian.' },
            { jp: '{窓|まど}の{近|ちか}くでパソコンを{使|つか}っている{人|ひと}は{誰|だれ}ですか？', id: 'Orang yang sedang memakai laptop di dekat jendela itu siapa?' },
          ],
        },
        {
          code: '3',
          title: 'Sよ',
          formulas: ['S + よ (Memberitahukan informasi baru yang belum diketahui lawan bicara)'],
          functionText:
            'Partikel akhir よ menekankan bahwa pembicara memberi tahu informasi yang belum diketahui atau perlu diingat oleh lawan bicara.',
          marugoto: 'S＋よ／ね／よね (初中級 トピック6)',
          examples: [
            { jp: '{原|はら}さんは、{座|すわ}って、{本|ほん}を{読|よ}んでる{人|ひと}ですよ。', id: 'Pak Hara adalah orang yang sedang duduk membaca buku itu lho.' },
            { jp: 'あそこの{角|かど}を{曲|ま}がるとすぐですよ。', id: 'Begitu belok di pojokan sana langsung sampai kok.' },
            { jp: '{田中|たなか}さんはとても{優|やさ}しい{人|ひと}ですよ。', id: 'Pak Tanaka orang yang sangat baik hati lho.' },
          ],
        },
        {
          code: '4',
          title: 'Sし、～',
          formulas: [
            'V / イA（普通形） + し、 + S2',
            'N / ナA + だ + し、 + S2 (Menyebutkan beberapa keunggulan/alasan sekaligus)',
          ],
          functionText:
            'Menghubungkan beberapa alasan atau sifat baik/buruk yang mendukung satu kesimpulan ("Selain S1, juga S2").',
          marugoto: 'S（普通体）し (初級2 6課)',
          examples: [
            { jp: '{三船敏郎|みふねとしろう}は、{演技|えんぎ}が{上手|じょうず}だし、{本当|ほんとう}にかっこいいです。', id: 'Toshiro Mifune aktingnya hebat, dan juga sungguh keren.' },
            { jp: '{先輩|せんぱい}は{仕事|しごと}が{速|はや}いし、{教|おし}え{方|かた}も{丁寧|ていねい}です。', id: 'Senior kerjanya cepat, dan cara mengajarnya juga telaten.' },
            { jp: 'この{歌|うた}はメロディーもいいし、{歌詞|かし}もすてきです。', id: 'Lagu ini melodinya bagus, dan liriknya juga indah.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 3,
      topicJp: 'レストランで',
      topicId: 'Di Restoran',
      titleJp: '第3課 アレルギーがあるので、食べられないんです',
      titleId: 'Karena Ada Alergi, Jadi Tidak Bisa Makan',
      patterns: [
        {
          code: '1',
          title: 'S1ので、S2',
          formulas: [
            'V / イA（普通形） + ので、 + S2 (Karena S1, maka S2 — sopan & objektif)',
            'N / ナA + な + ので、 + S2 (Wajib memakai な untuk N & ナA)',
          ],
          functionText:
            'Menyatakan sebab/alasan secara lebih sopan dan objektif dibanding から, sangat cocok saat menjelaskan pantangan makanan, alergi, atau meminta izin.',
          marugoto: 'S1（普通形）ので、S2',
          examples: [
            { jp: '{今日|きょう}は{自転車|じてんしゃ}で{来|き}たので、{飲|の}めないんです。', id: 'Karena hari ini datang naik sepeda, saya tidak bisa minum (alkohol).' },
            { jp: 'エビのアレルギーがあるので、{抜|ぬ}いてもらえますか？', id: 'Karena saya alergi udang, bisakah dihilangkan dari menunya?' },
            { jp: 'イスラム{教徒|きょうと}なので、{豚肉|ぶたにく}とお{酒|さけ}は{食|た}べられません。', id: 'Karena saya Muslim, saya tidak bisa makan daging babi dan alkohol.' },
          ],
        },
        {
          code: '2',
          title: 'Sよね',
          formulas: ['S（普通形 / 丁寧体） + よね (Memastikan hal yang diduga sudah benar / mencari konfirmasi)'],
          functionText:
            'Partikel akhir よね dipakai saat pembicara agak yakin atas suatu informasi namun ingin memastikannya kepada lawan bicara ("... kan ya?").',
          marugoto: 'S＋よ／ね／よね (初中級 トピック6)',
          examples: [
            { jp: 'おすし、わさび、{入|はい}ってますよね。', id: 'Di sushi-nya ada wasabinya kan ya?' },
            { jp: 'このラーメンは{豚骨|とんこつ}スープですよね？', id: 'Ramen ini pakai kaldu tulang babi kan ya?' },
            { jp: '{明日|あした}の{予約|よやく}は7{時|じ}からですよね。', id: 'Reservasi besok mulai jam 7 kan ya?' },
          ],
        },
        {
          code: '3',
          title: 'Nで～',
          formulas: ['N（選択した席・方法・支払い） + で + お{願|ねが}いします / いいです'],
          functionText:
            'Partikel で digunakan saat memilih salah satu opsi yang ditawarkan staf (jenis tempat duduk, ukuran porsi, metode pembayaran).',
          marugoto: '→「かつどう」 1.',
          examples: [
            { jp: 'A：テーブルと{座敷|ざしき}がございますが…。 B：テーブルでお{願|ねが}いします。', id: 'A: Ada meja biasa dan lesehan tatami… B: Tolong meja biasa saja.' },
            { jp: '{会計|かいけい}はカードでお{願|ねが}いします。', id: 'Pembayarannya tolong pakai kartu.' },
            { jp: 'ご{飯|はん}は{普通盛|ふつうも}りでいいです。', id: 'Nasinya porsi biasa saja tidak apa-apa.' },
          ],
        },
        {
          code: '4',
          title: 'ナA-な／イA-い／V-る のは、Nです',
          formulas: [
            'ナA-な / イA-い / V（普通形） + のは、 + N + です (Yang bersifat/melakukan ... adalah N)',
          ],
          functionText:
            'Struktur penekanan (kalimat belah / cleft sentence) untuk menyorot N di akhir kalimat sebagai jawaban atau rekomendasi utama.',
          marugoto: 'イA-い／ナA-な／V-る（普通形）のは、Nです',
          examples: [
            { jp: '{人気|にんき}があるのは、お{刺身|さしみ}{定食|ていしょく}です。', id: 'Yang populer adalah paket sashimi.' },
            { jp: 'この{店|みせ}でいちばんおすすめなのは、{味噌|みそ}ラーメンです。', id: 'Yang paling direkomendasikan di kedai ini adalah miso ramen.' },
            { jp: '{辛|から}くないのは、こちらのメニューです。', id: 'Yang tidak pedas adalah menu sebelah sini.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 4,
      topicJp: 'レストランで',
      topicId: 'Di Restoran',
      titleJp: '第4課 しょうゆをつけないで食べてください',
      titleId: 'Silakan Makan Tanpa Dicelup Kecap Asin',
      patterns: [
        {
          code: '1',
          title: 'Nなら、～',
          formulas: ['N（Topik yang ditanyakan lawan bicara） + なら、 + S（Saran/Rekomendasi）'],
          functionText:
            'Menangkap topik yang diajukan lawan bicara lalu memberi saran atau informasi spesifik ("Kalau soal N, ...").',
          marugoto: 'N1なら、N2がいいです（よ） (初級2 3課)',
          examples: [
            { jp: 'A：この{近|ちか}くに、おすすめの{店|みせ}がありますか？ B：この{近|ちか}くなら、「{平兵衛|へいべえ}」がおすすめです。', id: 'A: Di dekat sini apakah ada restoran rekomendasi? B: Kalau di dekat sini, "Heibee" sangat direkomendasikan.' },
            { jp: 'おいしいうどんを{食|た}べるなら、あの{店|みせ}がいいですよ。', id: 'Kalau mau makan udon enak, kedai itu bagus lho.' },
            { jp: 'ランチなら、1000{円|えん}ぐらいで{食|た}べられます。', id: 'Kalau makan siang, bisa makan dengan harga sekitar 1000 yen.' },
          ],
        },
        {
          code: '2a',
          title: 'V-て、～ ＜方法＞',
          formulas: ['V1-て、 + V2 (Melakukan V2 dengan cara V1)'],
          functionText:
            'Menjelaskan cara atau metode makan/melakukan sesuatu dengan menggabungkan tindakan penyerta (V1-て) dan tindakan utama (V2).',
          marugoto: 'V-て、～',
          examples: [
            { jp: 'こちらの{野菜|やさい}の{天|てん}ぷらは、つゆにつけて{食|た}べてください。', id: 'Tempura sayuran ini silakan dimakan dengan dicelupkan ke saus tsuyu.' },
            { jp: 'よく{混|ま}ぜて{食|た}べてください。', id: 'Silakan makan dengan diaduk rata terlebih dahulu.' },
            { jp: 'ごまをすって、ソースを{入|い}れて{食|た}べます。', id: 'Giling wijennya, masukkan saus, lalu makan.' },
          ],
        },
        {
          code: '2b',
          title: 'V-ないで、～ ＜方法＞',
          formulas: ['V1-ない + で、 + V2 (Melakukan V2 tanpa melakukan V1)'],
          functionText:
            'Menyatakan melakukan suatu tindakan tanpa melakukan tindakan lainnya ("tanpa V1, lakukan V2").',
          marugoto: 'V-ないで、～',
          examples: [
            { jp: 'エビはつゆにつけないで、{塩|しお}をかけて{食|た}べてください。', id: 'Udangnya silakan makan tanpa dicelup tsuyu, tapi taburi garam.' },
            { jp: 'しょうゆをつけないで、そのまま{食|た}べてみてください。', id: 'Silakan coba makan begitu saja tanpa memakai kecap asin.' },
            { jp: 'コーヒーは{砂糖|さとう}を{入|い}れないで{飲|の}みます。', id: 'Saya minum kopi tanpa memasukkan gula.' },
          ],
        },
        {
          code: '3',
          title: 'V-ちゃだめです',
          formulas: [
            'V-て → V-ちゃ + だめです / いけません (Tidak boleh melakukan V — gaya lisan)',
            'V-で → V-じゃ + だめです (Mis. {飲|の}んで → {飲|の}んじゃだめです)',
          ],
          functionText:
            'Bentuk percakapan akrab dari V-てはいけません untuk melarang atau memperingatkan secara ramah ("Jangan ... ya").',
          marugoto: 'V-ちゃいけません／だめです',
          examples: [
            { jp: '{一度|いちど}に、そんなにたくさんお{肉|にく}を{入|い}れちゃだめですよ。', id: 'Jangan memasukkan daging sebanyak itu sekaligus ya.' },
            { jp: '{熱|あつ}いから、すぐ{触|さわ}っちゃだめですよ。', id: 'Karena panas, jangan langsung disentuh ya.' },
            { jp: 'ここで{写真|しゃしん}を{撮|と}っちゃだめです。', id: 'Tidak boleh mengambil foto di sini.' },
          ],
        },
        {
          code: '4',
          title: 'V-てから、～',
          formulas: ['V1-て + から、 + V2 (Setelah V1 selesai dulu, barulah V2)'],
          functionText:
            'Menekankan urutan tahapan yang penting: tindakan V2 dilakukan sesudah V1 benar-benar selesai.',
          marugoto: 'V1-てから、V2',
          examples: [
            { jp: 'うどんは、お{肉|にく}と{野菜|やさい}を{食|た}べてから、{入|い}れましょう。', id: 'Udonnya ayo kita masukkan setelah makan daging dan sayuran.' },
            { jp: 'お{湯|ゆ}が{沸|わ}いてから、{麺|めん}を{入|い}れてください。', id: 'Setelah air mendidih, barulah masukkan mienya.' },
            { jp: '{手|て}を{洗|あら}ってから、ご{飯|はん}を{食|た}べましょう。', id: 'Ayo cuci tangan dulu, baru makan.' },
          ],
        },
        {
          code: '5',
          title: 'S1が、S2',
          formulas: ['S1（丁寧体） + が、 + S2 (S1, tetapi S2 — lebih sopan daripada けど)'],
          functionText:
            'Kata sambung sopan untuk mempertentangkan dua hal (kelebihan dan kekurangan) dalam ulasan restoran atau percakapan formal.',
          marugoto: 'S1が、S2 (初級1 13課)',
          examples: [
            { jp: 'お{店|みせ}は{新|あたら}しくてきれいですが、お{昼|ひる}は{混|こ}んでいます。', id: 'Restorannya baru dan bersih, tetapi saat jam makan siang ramai.' },
            { jp: 'ちょっと{値段|ねだん}は{高|たか}いですが、{味|あじ}は{最高|さいこう}です。', id: 'Harganya agak mahal, tetapi rasanya luar biasa.' },
            { jp: '{駅|えき}からは{少|すこ}し{歩|ある}きますが、{静|しず}かでいいお{店|みせ}です。', id: 'Dari stasiun agak berjalan kaki, tetapi restorannya tenang dan bagus.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 5,
      topicJp: '旅行に行こう',
      topicId: 'Ayo Pergi Berwisata',
      titleJp: '第5課 早く予約したほうがいいですよ',
      titleId: 'Sebaiknya Cepat Dipesan lho',
      patterns: [
        {
          code: '1',
          title: 'V-（られ）ます ＜可能形①＞',
          formulas: [
            'Kel.I: vokal u→e + る (行きます→行けます / 飲みます→飲めます)',
            'Kel.II: coret る + られる (食べます→食べられます / 見ます→見られます)',
            'Kel.III: する→できる / 来る→来られる (Objek を biasanya berubah jadi が)',
          ],
          functionText:
            'Bentuk potensial (可能形) fungsi pertama: menyatakan kegiatan atau pengalaman yang dapat dilakukan di suatu tempat wisata.',
          marugoto: '可能① NがV-（られ）ます (初級2 6課)',
          examples: [
            { jp: '{新鮮|しんせん}なカニとかウニとか{食|た}べられますよ。', id: 'Di sana bisa makan kepiting segar, bulu babi, dan sebagainya lho.' },
            { jp: '{秋|あき}にはきれいな{紅葉|こうよう}が{見|み}られます。', id: 'Di musim gugur kita bisa melihat daun musim gugur yang indah.' },
            { jp: 'このホテルから{海|うみ}まで{歩|ある}いて{行|い}けます。', id: 'Dari hotel ini bisa pergi ke pantai dengan berjalan kaki.' },
          ],
        },
        {
          code: '2',
          title: '～ところ',
          formulas: ['V（普通形） / イA-い / ナA-な + ところ (Tempat yang ...)'],
          functionText:
            'Kata ところ (tempat) dimodifikasi oleh kata kerja/kata sifat untuk menanyakan atau merekomendasikan spot wisata.',
          marugoto: 'S（普通体）＋N (初級2 1課)',
          examples: [
            { jp: '{遊|あそ}べるところはありますか？', id: 'Apakah ada tempat yang bisa untuk bermain?' },
            { jp: '{子|こ}どもも{楽|たの}しめるところを{探|さが}しています。', id: 'Saya sedang mencari tempat yang bisa dinikmati anak-anak juga.' },
            { jp: '{安|やす}くておいしいものが{食|た}べられるところを{教|おし}えてください。', id: 'Tolong beri tahu tempat yang murah dan bisa makan makanan enak.' },
          ],
        },
        {
          code: '3',
          title: 'S（普通形）って聞きました / S（普通形）って言っていました',
          formulas: [
            'S（普通形） + って + {聞|き}きました (Saya dengar bahwa S — gaya lisan)',
            'S（普通形） + って + {言|い}っていました (Katanya S — gaya lisan)',
          ],
          functionText:
            'Bentuk lisan dari と言っていました／と聞きました (mengganti partikel kutipan と menjadi って) untuk berbagi info wisata.',
          marugoto: 'S（普通体）って言って（い）ました (初中級 トピック1)',
          examples: [
            { jp: 'うどんがおいしいって{聞|き}きました。バスが{安|やす}くて{便利|べんり}だって{先輩|せんぱい}が{言|い}ってました。', id: 'Saya dengar udonnya enak. Senior bilang busnya murah dan praktis.' },
            { jp: 'あの{温泉|おんせん}は{景色|けしき}がすごいって{聞|き}きましたよ。', id: 'Saya dengar pemandangan onsen itu luar biasa lho.' },
            { jp: '{週末|しゅうまつ}はすごく{混|こ}むって{友|とも}だちが{言|い}っていました。', id: 'Teman saya bilang akhir pekan sangat ramai.' },
          ],
        },
        {
          code: '4',
          title: '【疑問詞】V-たらいいですか？',
          formulas: ['【疑問詞（何で・いつ・どこで・どう）】 + V-た + ら + いいですか？'],
          functionText:
            'Meminta saran spesifik dari lawan bicara mengenai transportasi, waktu, atau cara terbaik melakukan sesuatu ("Sebaiknya bagaimana/naik apa?").',
          marugoto: '※文法項目としては該当なし',
          examples: [
            { jp: '{日光|にっこう}に{行|い}くんですけど、{何|なに}で{行|い}ったらいいですか？', id: 'Saya mau pergi ke Nikko, sebaiknya naik apa ya?' },
            { jp: 'ホテルはいつごろ{予約|よやく}したらいいですか？', id: 'Hotelnya sebaiknya dipesan kira-kira kapan ya?' },
            { jp: 'お{土産|みやげ}は{何|なに}を{買|か}ったらいいですか？', id: 'Oleh-olehnya sebaiknya beli apa ya?' },
          ],
        },
        {
          code: '5a',
          title: 'V-たほうがいいです',
          formulas: ['V-た + ほうがいいです（よ） (Sebaiknya melakukan V)'],
          functionText:
            'Memberikan saran yang kuat dan jelas kepada lawan bicara agar melakukan V (kata kerja selalu dalam bentuk V-た).',
          marugoto: 'V-たほうがいいです',
          examples: [
            { jp: '{厚|あつ}い{上着|うわぎ}を{持|も}って{行|い}ったほうがいいですよ。', id: 'Sebaiknya membawa jaket tebal lho.' },
            { jp: '{人気|にんき}のホテルなので、{早|はや}く{予約|よやく}したほうがいいですよ。', id: 'Karena hotelnya populer, sebaiknya cepat dipesan lho.' },
            { jp: 'たくさん{歩|ある}くから、スニーカーを{履|は}いたほうがいいです。', id: 'Karena akan banyak berjalan, sebaiknya memakai sepatu kets.' },
          ],
        },
        {
          code: '5b',
          title: 'V-ないほうがいいです',
          formulas: ['V-ない + ほうがいいです（よ） (Sebaiknya jangan melakukan V)'],
          functionText:
            'Memberikan saran agar tidak melakukan sesuatu demi menghindari kerepotan atau masalah.',
          marugoto: 'V-ないほうがいいです',
          examples: [
            { jp: 'できれば、{日曜日|にちようび}は{行|い}かないほうがいいですよ。', id: 'Kalau bisa, hari Minggu sebaiknya jangan pergi lho.' },
            { jp: '{山|やま}の{上|うえ}は{寒|さむ}いので、{薄|うす}い{服|ふく}で{行|い}かないほうがいいです。', id: 'Di atas gunung dingin, jadi sebaiknya jangan pergi dengan baju tipis.' },
            { jp: '{夜|よる}おそくは{一人|ひとり}で{歩|ある}かないほうがいいですよ。', id: 'Larut malam sebaiknya jangan berjalan sendirian ya.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 6,
      topicJp: '旅行に行こう',
      topicId: 'Ayo Pergi Berwisata',
      titleJp: '第6課 いろいろなところに行けて、よかったです',
      titleId: 'Senang Bisa Pergi ke Berbagai Tempat',
      patterns: [
        {
          code: '1',
          title: 'V-るつもりです',
          formulas: [
            'V-る（辞書形） + つもりです (Berencana / berniat melakukan V)',
            'V-ない + つもりです (Berniat tidak melakukan V)',
          ],
          functionText:
            'Menyatakan niat atau rencana pribadi yang sudah diputuskan untuk masa depan atau perjalanan.',
          marugoto: 'V-る／V-ないつもりだ (中級1 トピック3)',
          examples: [
            { jp: '{明日|あした}は、{中禅寺湖|ちゅうぜんじこ}に{行|い}くつもりです。', id: 'Besok saya berencana pergi ke Danau Chuzenji.' },
            { jp: '{夏休|なつやす}みに{北海道|ほっかいどう}を{旅行|りょこう}するつもりです。', id: 'Saat libur musim panas saya berniat berwisata ke Hokkaido.' },
            { jp: '{今回|こんかい}は{高|たか}いお{土産|みやげ}は{買|か}わないつもりです。', id: 'Kali ini saya berniat tidak membeli oleh-oleh yang mahal.' },
          ],
        },
        {
          code: '2a',
          title: 'V-（られ）て、～',
          formulas: ['V（可能形）-て、 + 【感情表現（よかったです・うれしかったです）】'],
          functionText:
            'Bentuk て dari kata kerja potensial untuk menyatakan rasa senang/syukur karena berhasil bisa melakukan sesuatu selama perjalanan.',
          marugoto: 'V-（られ）て (初級2 9課)',
          examples: [
            { jp: 'いろいろなところに{行|い}けて、よかったです。', id: 'Syukurlah bisa pergi ke berbagai tempat.' },
            { jp: '{本物|ほんもの}の{雪|ゆき}が{見|み}られて、とてもうれしかったです。', id: 'Saya sangat senang bisa melihat salju asli.' },
            { jp: '{好|す}きなバンドのチケットが{買|か}えて、{最高|さいこう}でした。', id: 'Bisa membeli tiket band favorit, luar biasa!' },
          ],
        },
        {
          code: '2b',
          title: 'V-（られ）なくて、～',
          formulas: ['V（可能形）-なくて、 + {残念|ざんねん}でした / {悲|かな}しかったです'],
          functionText:
            'Bentuk negatif-て dari kata kerja potensial untuk mengungkapkan kekecewaan karena tidak dapat melakukan sesuatu.',
          marugoto: 'V-（られ）なくて (初級2 9課)',
          examples: [
            { jp: 'ショーが{見|み}られなくて、{残念|ざんねん}でした。', id: 'Sayang sekali tidak bisa menonton pertunjukannya.' },
            { jp: '{雨|あめ}で{富士山|ふじさん}に{登|のぼ}れなくて、がっかりしました。', id: 'Kecewa karena hujan jadi tidak bisa mendaki Gunung Fuji.' },
            { jp: '{時間|じかん}がなくて、お{土産|みやげ}が{買|か}えなくて{残念|ざんねん}でした。', id: 'Sayang sekali tidak sempat membeli oleh-oleh.' },
          ],
        },
        {
          code: '3',
          title: 'S1し、S2し、～',
          formulas: ['S1（普通形） + し、 + S2（普通形） + し、 + S3（まとめ）'],
          functionText:
            'Menyebutkan beberapa pengalaman atau alasan sekaligus untuk menyimpulkan kesan perjalanan secara menyeluruh.',
          marugoto: 'S（普通形）し、～',
          examples: [
            { jp: '{海|うみ}で{泳|およ}げたし、{船|ふね}に{乗|の}れたし、{楽|たの}しかったです。', id: 'Bisa berenang di laut, bisa naik kapal juga, sangat menyenangkan.' },
            { jp: '{天気|てんき}もよかったし、{料理|りょうり}もおいしかったし、{最高|さいこう}の{旅行|りょこう}でした。', id: 'Cuacanya bagus, makanannya juga enak, perjalanan yang sempurna.' },
            { jp: '{温泉|おんせん}にも{入|はい}れたし、{写真|しゃしん}もたくさん{撮|と}れたし、{大満足|だいまんぞく}です。', id: 'Bisa masuk onsen, bisa ambil banyak foto juga, sangat puas.' },
          ],
        },
        {
          code: '4',
          title: 'V-る／V-ている／V-た とき、～',
          formulas: [
            'V-る + とき (Sebelum / saat akan melakukan V)',
            'V-ている + とき (Di tengah-tengah sedang melakukan V)',
            'V-た + とき (Sesudah / tepat ketika V terjadi)',
          ],
          functionText:
            'Membedakan nuansa waktu antara V-る (sebelum/saat akan), V-ている (sedang berlangsung), dan V-た (setelah/ketika terjadi) di depan とき.',
          marugoto: 'V-る／V-ている／V-たとき、～ (初級2 5課)',
          examples: [
            { jp: '{道|みち}を{歩|ある}いているとき、リスを{見|み}ました。ウミネコが{近|ちか}くに{来|き}たとき、ちょっとこわかったです。', id: 'Saat sedang berjalan di jalan setapak, saya melihat tupai. Ketika burung camar datang mendekat, agak menakutkan.' },
            { jp: '{日本|にほん}へ{来|く}るとき、{空港|くうこう}で{両替|りょうがえ}しました。', id: 'Saat akan datang ke Jepang, saya menukar uang di bandara.' },
            { jp: '{ホテル|ほてる}に{着|つ}いたとき、もう{夜|よる}の9{時|じ}でした。', id: 'Ketika tiba di hotel, hari sudah jam 9 malam.' },
          ],
        },
        {
          code: '5',
          title: '【人】と【人数】で',
          formulas: ['【人】 + と + 【人数】で + V-ます (Melakukan V ber-N orang bersama seseorang)'],
          functionText:
            'Menyebutkan total jumlah peserta rombongan saat pergi bersama menggunakan で (一人一人で sendirian, 二人で berdua, 家族4人で sekeluarga berempat).',
          marugoto: 'N1（人）とN2（数）で (初級2 13課)',
          examples: [
            { jp: '{友|とも}だちと2{人|ふたり}でハウステンボスに{行|い}って{来|き}ました。', id: 'Saya telah pergi ke Huis Ten Bosch berdua bersama teman.' },
            { jp: '{会社|かいしゃ}の{仲間|なかま}と5{人|にん}でキャンプをしました。', id: 'Saya berkemah berlima bersama rekan-rekan kantor.' },
            { jp: '{今回|こんかい}の{旅行|りょこう}は1{人|ひとり}で{行|い}きました。', id: 'Perjalanan kali ini saya pergi sendirian.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 7,
      topicJp: '地域のイベント',
      topicId: 'Acara Komunitas Daerah',
      titleJp: '第7課 雨が降ったら、ホールでやります',
      titleId: 'Jika Turun Hujan, Diadakan di Aula',
      patterns: [
        {
          code: '1',
          title: '～たら、～',
          formulas: [
            'V-た / イA-かった / ナA・N-だった + ら、 + S2 (Jika / apabila / kalau sudah ...)',
          ],
          functionText:
            'Kalimat pengandaian/syarat paling serbaguna: bisa bermakna syarat ("kalau hujan") maupun waktu setelah selesai ("kalau sudah selesai").',
          marugoto: '条件① S1たら、S2',
          examples: [
            { jp: '{雨|あめ}が{降|ふ}ったら、{盆踊|ぼんおど}りは{日曜日|にちようび}にやるよ。{盆踊|ぼんおど}りが{終|お}わったら、いっしょに{居酒屋|いざかや}に{行|い}きましょう。', id: 'Kalau hujan turun, tari Bon Odori diadakan hari Minggu ya. Kalau Bon Odori sudah selesai, ayo pergi ke izakaya bersama.' },
            { jp: '{時間|じかん}があったら、お{祭|まつ}りに{来|き}てくださいね。', id: 'Kalau ada waktu, datanglah ke festivalnya ya.' },
            { jp: '{駅|えき}に{着|つ}いたら、{電話|でんわ}してください。', id: 'Kalau sudah sampai di stasiun, tolong telepon saya.' },
          ],
        },
        {
          code: '2',
          title: 'V-（ら）れます ＜受身①＞',
          formulas: [
            'Kel.I: vokal u→a + れる (開きます→開かれます / 行います→行われます)',
            'Kel.II: coret る + られる (見ます→見られます)',
            'Kel.III: する→される (開催する→開催される) / 来る→来られる',
          ],
          functionText:
            'Bentuk pasif (受身形) fungsi pertama: digunakan dalam pengumuman resmi atau poster acara ("diselenggarakan / diadakan / dibuka").',
          marugoto: '受身① V-（ら）れます (初級2 13課)',
          examples: [
            { jp: '7{月|がつ}14{日|にち}、「ひかりホール」において、コンサートが{開催|かいさい}されます。', id: 'Pada tanggal 14 Juli, bertempat di Hikari Hall, akan diselenggarakan konser.' },
            { jp: '{毎年|まいとし}8{月|がつ}に、この{公園|こうえん}で{花火大会|はなびたいかい}が{行|おこな}われます。', id: 'Setiap tahun di bulan Agustus, festival kembang api diadakan di taman ini.' },
            { jp: 'フリーマーケットは{午前|ごぜん}10{時|じ}から{開|ひら}かれます。', id: 'Pasar loak dibuka mulai pukul 10 pagi.' },
          ],
        },
        {
          code: '3',
          title: 'V-（られ）ます ＜可能形②＞',
          formulas: ['だれでも / 誰でも + V（可能形） (Siapa pun bisa melakukan V)'],
          functionText:
            'Bentuk potensial fungsi kedua: menyatakan kemudahan atau kemampuan umum yang bisa dilakukan siapa saja.',
          marugoto: 'NがV-（られ）ます',
          examples: [
            { jp: '{盆踊|ぼんおど}りは{簡単|かんたん}だから、だれでも{踊|おど}れますよ。', id: 'Tari Bon Odori mudah, jadi siapa pun bisa menari kok.' },
            { jp: '{初心者|しょしんしゃ}でも{参加|さんか}できますから、{安心|あんしん}してください。', id: 'Pemula pun bisa ikut serta, jadi tenang saja.' },
            { jp: 'この{料理|りょうり}は10{分|ぷん}で{作|つく}れますよ。', id: 'Masakan ini bisa dibuat dalam 10 menit lho.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 8,
      topicJp: '地域のイベント',
      topicId: 'Acara Komunitas Daerah',
      titleJp: '第8課 屋台はどこかわかりますか？',
      titleId: 'Tahukah Kamu di Mana Kedai Makanannya?',
      patterns: [
        {
          code: '1a',
          title: 'もうV-ました',
          formulas: ['もう + V-ましたか？ (Apakah sudah mulai / selesai / terjadi?)'],
          functionText:
            'Menanyakan apakah suatu acara atau tahapan sudah berlangsung (もう = sudah).',
          marugoto: 'もうV-ました',
          examples: [
            { jp: 'A：スピーチコンテストは、もう{始|はじ}まりましたか？', id: 'A: Apakah lomba pidatonya sudah dimulai?' },
            { jp: '{花火|はなび}はもう{終|お}わりましたか？', id: 'Apakah kembang apinya sudah selesai?' },
            { jp: '{受付|うけつけ}はもう{済|す}みました。', id: 'Pendaftarannya sudah selesai.' },
          ],
        },
        {
          code: '1b',
          title: 'まだV-て（い）ません',
          formulas: ['まだ + V-て（い）ません (Masih belum melakukan / belum terjadi)'],
          functionText:
            'Menjawab bahwa sesuatu masih belum dimulai atau belum selesai sampai saat ini (bukan まだV-ませんでした).',
          marugoto: 'まだV-ていません',
          examples: [
            { jp: 'B：まだ{始|はじ}まってません。', id: 'B: Belum dimulai.' },
            { jp: 'チケットはまだ{買|か}っていません。', id: 'Tiketnya masih belum saya beli.' },
            { jp: '{雨|あめ}はまだやんでいませんね。', id: 'Hujannya masih belum berhenti ya.' },
          ],
        },
        {
          code: '2',
          title: 'まだV-ます',
          formulas: ['まだ + V-ています / V-ます (Masih berlangsung / masih buka)'],
          functionText:
            'Menanyakan atau menyatakan bahwa suatu acara, stan makanan, atau kegiatan masih terus berlanjut hingga sekarang.',
          marugoto: 'まだV-ます／V-ています',
          examples: [
            { jp: 'イベント、まだやってますか？', id: 'Acaranya masih berlangsungkah?' },
            { jp: 'たこ{焼|や}きの{屋台|やたい}、まだ{開|あ}いていますよ。', id: 'Kedai takoyaki-nya masih buka lho.' },
            { jp: 'はい、まだ{受付|うけつけ}しています。', id: 'Ya, pendaftaran masih dibuka.' },
          ],
        },
        {
          code: '3',
          title: '【疑問詞】＋S（普通形）か、～',
          formulas: [
            '【疑問詞】 + S（普通形；N/ナA tanpa だ） + か、 + わかりますか / {知|し}っていますか',
          ],
          functionText:
            'Menyisipkan pertanyaan berketerangan kata tanya (どこ, 何時, だれ, 何) ke dalam kalimat utama ("Apakah kamu tahu kapan/di mana ...?").',
          marugoto: 'S〔疑問詞＋V（普通形）か〕、知っていますか／わかりますか',
          examples: [
            { jp: '{明日|あした}のフリーマーケットは、{何時|なんじ}からか、わかりますか？', id: 'Apakah kamu tahu pasar loak besok mulai jam berapa?' },
            { jp: '{屋台|やたい}はどこかわかりますか？', id: 'Apakah kamu tahu di mana area stan makanan?' },
            { jp: '{次|つぎ}のダンスが{何時|なんじ}に{始|はじ}まるか、{知|し}っていますか？', id: 'Apakah kamu tahu tarian berikutnya mulai jam berapa?' },
          ],
        },
      ],
    },
    {
      chapterNumber: 9,
      topicJp: '年中行事とマナー',
      topicId: 'Tradisi Tahunan dan Tata Krama',
      titleJp: '第9課 成人の日は、何をするんですか？',
      titleId: 'Pada Hari Kedewasaan, Apa yang Dilakukan?',
      patterns: [
        {
          code: '1',
          title: '～んですか？',
          formulas: ['S（普通形；N/ナA + な） + んですか？ (Bertanya meminta penjelasan budaya/situasi)'],
          functionText:
            'Mengajukan pertanyaan dengan rasa ingin tahu untuk meminta penjelasan latar belakang, kebiasaan, atau tradisi.',
          marugoto: 'S（普通体）んです (初級1 17課)',
          examples: [
            { jp: '{成人|せいじん}の{日|ひ}は、{何|なに}をするんですか？', id: 'Pada Hari Kedewasaan, biasanya melakukan apa ya?' },
            { jp: 'どうして{年末|ねんまつ}にそばを{食|た}べるんですか？', id: 'Kenapa di akhir tahun makan soba?' },
            { jp: 'それはどこの{国|くに}のお{祭|まつ}りなんですか？', id: 'Itu festival dari negara mana ya?' },
          ],
        },
        {
          code: '2',
          title: 'Nしか+否定文',
          formulas: ['N + しか + V-ません / V-ませんでした (Hanya N — bernuansa sedikit/kurang)'],
          functionText:
            'Partikel しか selalu diikuti bentuk negatif untuk menekankan bahwa jumlahnya sedikit atau kurang dari harapan ("cuma ... saja").',
          marugoto: 'Nしか（V-ません）',
          examples: [
            { jp: '{乗|の}り{物|もの}に3つしか{乗|の}れませんでした。', id: 'Saya cuma bisa naik 3 wahana saja.' },
            { jp: 'お{正月|しょうがつ}{休|やす}みは3{日|か}しかありませんでした。', id: 'Libur Tahun Baru cuma ada 3 hari saja.' },
            { jp: '{財布|さいふ}に500{円|えん}しか{入|はい}っていません。', id: 'Di dompet hanya ada 500 yen saja.' },
          ],
        },
        {
          code: '3',
          title: 'Nだけ',
          formulas: ['N + だけ + V-ます (Hanya N — netral, bisa kalimat positif/negatif)'],
          functionText:
            'Partikel だけ berarti "hanya / saja" secara netral dan dapat dipakai pada kalimat positif maupun negatif.',
          marugoto: 'Nだけ',
          examples: [
            { jp: '{今年|ことし}は、1{日|にち}だけ{実家|じっか}に{帰|かえ}りました。', id: 'Tahun ini saya pulang ke rumah orang tua selama 1 hari saja.' },
            { jp: '{家族|かぞく}だけで静かに{祝|いわ}いました。', id: 'Kami merayakannya dengan tenang bersama keluarga saja.' },
            { jp: '{名前|なまえ}だけ{書|か}いてください。', id: 'Tolong tulis namanya saja.' },
          ],
        },
        {
          code: '4',
          title: 'V-たりして、～',
          formulas: ['V-たり + して、 + S（感想） (Melakukan V dan hal semacamnya, lalu ...)'],
          functionText:
            'Menyebutkan satu contoh aktivitas khas (implikasinya ada kegiatan lain juga) lalu menyambungkannya dengan kesan.',
          marugoto: 'V-たりして、～ (初級2 10課)',
          examples: [
            { jp: '{友|とも}だちといっしょに{買|か}い{物|もの}をしたりして、{楽|たの}しかったです。', id: 'Berbelanja bersama teman dan lain-lain, sangat menyenangkan.' },
            { jp: '{家|いえ}でのんびりテレビを{見|み}たりして{過|す}ごしました。', id: 'Saya menghabiskan waktu santai di rumah dengan menonton TV dan semacamnya.' },
            { jp: '{神社|じんじゃ}に{行|い}ったりして、お{正月|しょうがつ}を{楽|たの}しみました。', id: 'Pergi ke kuil Shinto dan lain-lain, saya menikmati Tahun Baru.' },
          ],
        },
        {
          code: '5',
          title: 'V-なくちゃならない',
          formulas: ['V-ない（coret い） + くちゃならない (Harus melakukan V — percakapan akrab)'],
          functionText:
            'Bentuk lisan kasual dari V-なければなりません untuk menyatakan kewajiban atau keharusan sehari-hari.',
          marugoto: 'V-なければなりません／なきゃいけません (初中級 トピック1)',
          examples: [
            { jp: '{甥|おい}や{姪|めい}にお{年玉|としだま}をあげなくちゃならないし、{大変|たいへん}でした。', id: 'Harus memberi angpao Tahun Baru ke keponakan-keponakan juga, lumayan repot.' },
            { jp: '{年末|ねんまつ}は{大掃除|おおそうじ}をしなくちゃならないんです。', id: 'Akhir tahun harus bersih-bersih besar rumah.' },
            { jp: '{早|はや}く{帰|かえ}って{準備|じゅんび}しなくちゃならない。', id: 'Harus cepat pulang dan bersiap-siap.' },
          ],
        },
        {
          code: '6',
          title: 'V-れます ＜可能形③＞',
          formulas: ['Kel.II (gaya lisan / ら抜き言葉): 食べられます → 食べれます / 見られます → 見れます'],
          functionText:
            'Dalam percakapan kasual di Jepang, bentuk potensial kata kerja kelompok II sering menyingkat られる menjadi れる (disebut ら抜き言葉). Penting dipahami saat mendengar penutur asli, namun dalam situasi formal/ujian tetap gunakan bentuk baku られます.',
          marugoto: '→「かつどう」 2.話すときの形 (初級2 6課)',
          examples: [
            { jp: 'DVDもたくさん{見|み}れました。{久|ひさ}しぶりに、{実家|じっか}の{母|はは}の{料理|りょうり}を{食|た}べれてよかったです。', id: 'Bisa menonton banyak DVD juga. Senang sekali akhirnya bisa makan masakan ibu di rumah setelah sekian lama.' },
            { jp: '{今年|ことし}は{早|はや}く{起|お}きれて、{初日|はつひ}の{出|で}を{見|み}ました。', id: 'Tahun ini bisa bangun pagi dan melihat matahari terbit pertama.' },
            { jp: 'みんなで{着物|きもの}が{着|き}れて{楽|たの}しかったです。', id: 'Senang sekali semuanya bisa memakai kimono.' },
          ],
        },
        {
          code: '7',
          title: 'S（普通形）+人が～ / S（普通形）+人も～',
          formulas: [
            'S（普通形） + {人|ひと}が{多|おお}いです (Banyak orang yang ...)',
            'S（普通形） + {人|ひと}もいます (Ada juga orang yang ...)',
          ],
          functionText:
            'Menjelaskan kecenderungan umum di masyarakat dan variasi kebiasaan orang-orang pada hari raya/tradisi.',
          marugoto: '→「りかい」スクリプト (初級2 6課)',
          examples: [
            { jp: '{春節|しゅんせつ}は、{田舎|いなか}に{帰|かえ}る{人|ひと}が{多|おお}いです。{最近|さいきん}では、{海外|かいがい}に{旅行|りょこう}する{人|ひと}もいます。', id: 'Saat Imlek, banyak orang yang mudik ke kampung. Akhir-akhir ini, ada juga orang yang berwisata ke luar negeri.' },
            { jp: 'お{正月|しょうがつ}は{神社|じんじゃ}へ{行|い}く{人|ひと}が{多|おお}いです。', id: 'Saat Tahun Baru banyak orang yang pergi ke kuil Shinto.' },
            { jp: '{休|やす}みの{日|ひ}に{家|いえ}でゆっくりする{人|ひと}もいます。', id: 'Ada juga orang yang bersantai di rumah pada hari libur.' },
          ],
        },
        {
          code: '8',
          title: 'V-ながら、～',
          formulas: ['V1（akar ます） + ながら、 + V2 (Melakukan V2 sambil melakukan V1 secara bersamaan)'],
          functionText:
            'Menyatakan dua aksi dilakukan bersamaan oleh orang yang sama; aksi utama berada di V2.',
          marugoto: 'V-ながら、～ (初中級 トピック8)',
          examples: [
            { jp: 'ソンクラーンは、{町|まち}を{歩|ある}きながら、みんなで{水|みず}をかけ{合|あ}います。', id: 'Saat Songkran, sambil berjalan di kota, semuanya saling menyiramkan air.' },
            { jp: '{音楽|おんがく}を{聞|き}きながら、{料理|りょうり}を{作|つく}ります。', id: 'Saya memasak sambil mendengarkan musik.' },
            { jp: 'お{茶|ちゃ}を{飲|の}みながら、ゆっくり{話|はな}しましょう。', id: 'Ayo mengobrol santai sambil minum teh.' },
          ],
        },
        {
          code: '9',
          title: 'Nによって',
          formulas: ['N（人・国・年・地域） + によって + {違|ちが}います / いろいろです (Berbeda-beda tergantung N)'],
          functionText:
            'Menyatakan bahwa kebiasaan, jadwal, atau aturan bervariasi bergantung pada faktor N ("tergantung pada ...").',
          marugoto: 'Nによって (中級2 トピック8)',
          examples: [
            { jp: 'レバランは、{年|とし}によって{違|ちが}います。', id: 'Hari Raya Lebaran tanggalnya berbeda-beda tergantung tahunnya.' },
            { jp: 'お{雑煮|ぞうに}の{味|あじ}は、{地域|ちいき}によって{違|ちが}います。', id: 'Rasa sup ozoni berbeda-beda tergantung daerahnya.' },
            { jp: 'マナーは{国|くに}によっていろいろです。', id: 'Tata krama bermacam-macam tergantung negaranya.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 10,
      topicJp: '年中行事とマナー',
      topicId: 'Tradisi Tahunan dan Tata Krama',
      titleJp: '第10課 どんな服を着て行けばいいですか？',
      titleId: 'Pakaian Seperti Apa yang Sebaiknya Saya Kenakan?',
      patterns: [
        {
          code: '1',
          title: '【疑問詞】V-ばいいですか？',
          formulas: [
            'Kel.I: vokal u→e + ば (行きます→行けば / 買います→買えば)',
            'Kel.II: coret る + れば (着ます→着れば / 食べます→食べれば)',
            'Kel.III: する→すれば / 来る→来れば + いいですか？',
          ],
          functionText:
            'Meminta petunjuk atau saran tata krama/prosedur yang tepat ("Sebaiknya apa/bagaimana ...?").',
          marugoto: '※文法項目としては該当なし',
          examples: [
            { jp: 'お{葬式|そうしき}には、{何|なに}を{持|も}っていけばいいですか？', id: 'Ke upacara pemakaman, sebaiknya membawa apa ya?' },
            { jp: '{結婚式|けっこんしき}には、どんな{服|ふく}を{着|き}て{行|い}けばいいですか？', id: 'Ke pesta pernikahan, sebaiknya mengenakan pakaian seperti apa ya?' },
            { jp: 'ご祝儀はいくら{包|つつ}めばいいですか？', id: 'Uang ucapan selamat sebaiknya dibungkus berapa ya?' },
          ],
        },
        {
          code: '2',
          title: 'V-てはいけません／だめです / Vちゃいけません／だめです',
          formulas: [
            'Sopan/Aturan: V-て + は + いけません / だめです (Dilarang melakukan V)',
            'Lisan: V-ちゃ / V-じゃ + いけません / だめです',
          ],
          functionText:
            'Menyatakan larangan, aturan umum, atau tata krama yang tidak boleh dilanggar.',
          marugoto: 'V-てはいけません／だめです (初級2 4課)',
          examples: [
            { jp: '{信号|しんごう}が{赤|あか}のときは、{横断歩道|おうだんほどう}を{渡|わた}ってはいけませんよ。バスの{中|なか}では、{話|はな}しちゃだめだよね。', id: 'Saat lampu merah, dilarang menyeberang zebra cross lho. Di dalam bus tidak boleh mengobrol keras kan ya.' },
            { jp: '{電車|でんしゃ}の{中|なか}で{電話|でんわ}で{話|はな}してはいけません。', id: 'Di dalam kereta tidak boleh berbicara lewat telepon.' },
            { jp: '{図書館|としょかん}で{大|おお}きい{声|こえ}を{出|だ}しちゃだめですよ。', id: 'Di perpustakaan tidak boleh bersuara keras ya.' },
          ],
        },
        {
          code: '3',
          title: 'V-なくちゃ',
          formulas: ['V-ない（coret い） + くちゃ (Harus V — bentuk pendek kasual/monolog)'],
          functionText:
            'Bentuk singkat percakapan dari V-なくちゃならない／V-なければなりません untuk mengingatkan diri sendiri atau berbicara dengan teman dekat.',
          marugoto: 'V-なければなりません／なきゃいけません (初中級 トピック1)',
          examples: [
            { jp: '{食器|しょっき}は{自分|じぶん}で{片付|かたづ}けなくちゃ。', id: 'Peralatan makan harus dibereskan sendiri nih.' },
            { jp: 'そろそろ{駅|えき}へ{行|い}かなくちゃ。', id: 'Sebentar lagi harus berangkat ke stasiun nih.' },
            { jp: '{靴|くつ}をそろえて{脱|ぬ}がなくちゃね。', id: 'Sepatu harus dilepas dan dirapikan ya.' },
          ],
        },
        {
          code: '4a',
          title: 'V-るように、～',
          formulas: ['V-る（可能形・自動詞・状態動詞） + ように、 + S2 (Agar supaya bisa / terjadi ...)'],
          functionText:
            'Menyatakan tujuan berupa keadaan yang diharapkan terwujud (sering memakai bentuk potensial di depan ように).',
          marugoto: 'S1(V-る）ように、S2',
          examples: [
            { jp: '{次|つぎ}の{人|ひと}がすぐに{席|せき}に{座|すわ}れるように、{食器|しょっき}を{片付|かたづ}けます。', id: 'Agar orang berikutnya bisa segera duduk, kita membereskan piring.' },
            { jp: 'みんなに{聞|き}こえるように、{大|おお}きい{声|こえ}で{話|はな}します。', id: 'Saya berbicara dengan suara keras agar terdengar oleh semua orang.' },
            { jp: '{日本語|にほんご}が{上手|じょうず}になるように、{毎日|まいにち}{練習|れんしゅう}しています。', id: 'Saya berlatih setiap hari agar bahasa Jepang saya menjadi mahir.' },
          ],
        },
        {
          code: '4b',
          title: 'V-ないように、～',
          formulas: ['V-ない + ように、 + S2 (Supaya tidak terjadi V, lakukan S2)'],
          functionText:
            'Menyatakan tindakan pencegahan agar hal yang tidak diinginkan tidak terjadi ("supaya tidak ...").',
          marugoto: 'S1(V-る）ように、S2',
          examples: [
            { jp: 'トイレがつまらないように、{紙|かみ}はごみ{箱|ばこ}に{捨|す}てます。', id: 'Supaya toilet tidak tersumbat, kertas tisu (non-flush) dibuang ke tempat sampah.' },
            { jp: '{忘|わす}れないように、メモを{書|か}きます。', id: 'Saya menulis catatan supaya tidak lupa.' },
            { jp: '{風邪|かぜ}をひかないように、{暖|あたた}かい{服|ふく}を{着|き}ます。', id: 'Saya memakai pakaian hangat agar tidak masuk angin.' },
          ],
        },
        {
          code: '5',
          title: 'V-（ら）れます ＜受身②＞',
          formulas: ['（{私|わたし}は） + 【人】 + に + V（受身形） (Di-V oleh seseorang)'],
          functionText:
            'Bentuk pasif fungsi kedua: menyatakan mengalami tindakan langsung dari orang lain (ditegur, dipuji, ditanya). Pelaku ditandai partikel に.',
          marugoto: '受身② N1はN2にV-（ら）れます (初級2 18課)',
          examples: [
            { jp: 'お{店|みせ}の{店長|てんちょう}さんに、「{今度|こんど}から{気|き}をつけて」と{注意|ちゅうい}されました。', id: 'Saya ditegur oleh manajer toko, "Lain kali hati-hati ya."' },
            { jp: '{先生|せんせい}に「{日本語|にほんご}が{上手|じょうず}ですね」と{褒|ほ}められました。', id: 'Saya dipuji oleh guru, "Bahasa Jepangmu pandai ya."' },
            { jp: '{駅|えき}で{知|し}らない{人|ひと}に{道|みち}を{聞|き}かれました。', id: 'Saya ditanya arah jalan oleh orang tak dikenal di stasiun.' },
          ],
        },
        {
          code: '6',
          title: 'S（普通形）の？',
          formulas: ['S（普通形；N/ナA + な） + の？（Intonasi naik ↗ — versi kasual dari ～んですか？）'],
          functionText:
            'Bentuk tanya kasual dari ～んですか？ yang sering dipakai teman atau keluarga saat terkejut atau ingin tahu alasan.',
          marugoto: '※文法項目としては該当なし',
          examples: [
            { jp: 'お{金|かね}を{払|はら}わないで、ジュース{飲|の}んだの？', id: 'Kamu minum jus tanpa membayar dulu?!' },
            { jp: 'えっ、もう{帰|かえ}るの？', id: 'Lho, kamu sudah mau pulang?' },
            { jp: 'どうしてそんなに{急|いそ}いでいるの？', id: 'Kenapa kamu terburu-buru sekali?' },
          ],
        },
        {
          code: '7',
          title: 'V-なきゃ',
          formulas: ['V-ない（coret い） + きゃ (Harus melakukan V — sangat umum di percakapan)'],
          functionText:
            'Bentuk pendek lisan dari V-なければなりません (setara dengan V-なくちゃ), dipakai sehari-hari bersama teman atau saat berbicara pada diri sendiri.',
          marugoto: 'V-なければなりません／なきゃいけません (初中級 トピック1)',
          examples: [
            { jp: 'ちゃんとお{金|かね}を{払|はら}ってから{飲|の}まなきゃ。', id: 'Harus bayar dulu dengan benar baru diminum.' },
            { jp: '{明日|あした}は{試験|しけん}だから、{勉強|べんきょう}しなきゃ。', id: 'Besok ujian, jadi harus belajar nih.' },
            { jp: 'ごみは{分別|ぶんべつ}して{出|だ}さなきゃだめだよ。', id: 'Sampah harus dipilah dulu sebelum dibuang lho.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 11,
      topicJp: '上手な買い物',
      topicId: 'Belanja dengan Pintar',
      titleJp: '第11課 ポイントカードを忘れてしまいました',
      titleId: 'Saya Kelupaan Membawa Kartu Poin',
      patterns: [
        {
          code: '1',
          title: 'V-てみてもいいですか？',
          formulas: ['V-て + みても + いいですか？ (Bolehkah saya mencoba V?)'],
          functionText:
            'Meminta izin secara sopan untuk mencoba pakaian, sepatu, atau sampel produk sebelum membeli di toko.',
          marugoto: 'V-てみます (初級1 10課)',
          examples: [
            { jp: 'このセーター、{着|き}てみてもいいですか？', id: 'Bolehkah saya mencoba memakai sweter ini?' },
            { jp: 'この{靴|くつ}、{履|は}いてみてもいいですか？', id: 'Bolehkah saya mencoba memakai sepatu ini?' },
            { jp: 'このメガネ、かけてみてもいいですか？', id: 'Bolehkah saya mencoba memakai kacamata ini?' },
          ],
        },
        {
          code: '2a',
          title: 'ナA-／イA- すぎます',
          formulas: [
            'ナA（tanpa な） + すぎます (Terlalu ナA — mis. 派手すぎます, 地味すぎます)',
          ],
          functionText:
            'Menyatakan suatu sifat kata sifat-na melampaui batas yang cocok saat memilih pakaian atau barang ("terlalu mencolok / terlalu polos").',
          marugoto: 'ナA-すぎます (初級1 13課)',
          examples: [
            { jp: 'この{色|いろ}はちょっと{派手|はで}すぎます。', id: 'Warna ini agak terlalu mencolok.' },
            { jp: 'このデザインはちょっと{地味|じみ}すぎますね。', id: 'Desain ini agak terlalu polos ya.' },
            { jp: 'このバッグは{シンプル|しんぷる}すぎます。', id: 'Tas ini terlalu sederhana.' },
          ],
        },
        {
          code: '2b',
          title: 'イA-すぎます',
          formulas: ['イA（coret い） + すぎます (Terlalu イA — mis. 高すぎます, 大きすぎます)'],
          functionText:
            'Menyatakan suatu sifat kata sifat-i terlalu berlebihan ("terlalu mahal / terlalu besar / terlalu ketat").',
          marugoto: 'イA-すぎます (初級1 13課)',
          examples: [
            { jp: 'このジャケットは{高|たか}すぎます。', id: 'Jaket ini terlalu mahal.' },
            { jp: 'Mサイズはちょっと{小|ちい}さすぎました。', id: 'Ukuran M agak terlalu kecil.' },
            { jp: 'このズボンは{丈|たけ}が{長|なが}すぎます。', id: 'Celana ini panjangnya terlalu kepanjangan.' },
          ],
        },
        {
          code: '3',
          title: 'ナA-な／イA-い の',
          formulas: [
            'イA-い + の (Yang bersifat イA — menggantikan kata benda sebelumnya)',
            'ナA + な + の (Yang bersifat ナA)',
          ],
          functionText:
            'Partikel の menggantikan kata benda yang sudah jelas (baju, sepatu, tas) agar tidak perlu mengulanginya ("yang lebih besar", "yang lebih tenang").',
          marugoto: '→「かつどう」 2. (入門 16課)',
          examples: [
            { jp: 'もうちょっと{大|おお}きいの、ありますか？', id: 'Apakah ada yang sedikit lebih besar?' },
            { jp: 'もう少し{安|やす}いのはありませんか？', id: 'Apakah tidak ada yang sedikit lebih murah?' },
            { jp: 'もっと{静|しず}かなのがいいです。', id: 'Saya lebih suka yang lebih tenang/kalem.' },
          ],
        },
        {
          code: '4',
          title: 'NをV-(ら)れます ＜受身③＞',
          formulas: ['（{私|わたし}は） + N（所有物・体の一部） + を + V（受身形） (Pasif kerugian / 迷惑の受身)'],
          functionText:
            'Bentuk pasif kerugian: menyatakan benda milik kita dicuri/dirusak atau tubuh kita terkena dampak merugikan oleh orang lain.',
          marugoto: 'N1はN2にN3をV-（ら）れます (初級2 18課)',
          examples: [
            { jp: '（{私|わたし}は）{自転車|じてんしゃ}を{盗|ぬす}まれました。', id: 'Sepeda saya dicuri orang.' },
            { jp: '{満員電車|まんいんでんしゃ}で{足|あし}を{踏|ふ}まれました。', id: 'Kaki saya terinjak orang di kereta penuh sesak.' },
            { jp: '{昨日|きのう}、{傘|かさ}を{間違|まちが}えて{持|も}って{行|い}かれました。', id: 'Kemarin payung saya terbawa salah ambil oleh orang lain.' },
          ],
        },
        {
          code: '5',
          title: 'S（普通形）かもしれません',
          formulas: [
            'V / イA（普通形） + かもしれません (Mungkin saja ...)',
            'N / ナA（tanpa だ） + かもしれません',
          ],
          functionText:
            'Menyatakan kemungkinan atau dugaan yang belum pasti (sekitar 50% kemungkinan, "mungkin saja ...").',
          marugoto: 'S(普通形)かもしれません (初級2 17課)',
          examples: [
            { jp: 'もしかしたら、バッグをとられたかもしれません。', id: 'Jangan-jangan, tas saya mungkin dicuri orang.' },
            { jp: '{電車|でんしゃ}の{中|なか}に{傘|かさ}を{忘|わす}れたかもしれません。', id: 'Mungkin saya lupa meninggalkan payung di dalam kereta.' },
            { jp: '{明日|あした}は{雪|ゆき}が{降|ふ}るかもしれませんよ。', id: 'Besok mungkin saja turun salju lho.' },
          ],
        },
        {
          code: '6',
          title: 'V-てしまいました',
          formulas: [
            'V-て + しまいました (Telah terlanjur / tidak sengaja V — rasa menyesal atau tuntas total)',
            'Lisan: V-ちゃいました / V-じゃいました',
          ],
          functionText:
            'Mengungkapkan rasa penyesalan karena ketidaksengajaan (lupa, hilang, rusak) atau penyelesaian tindakan hingga tuntas.',
          marugoto: 'V-てしまいました',
          examples: [
            { jp: 'ポイントカード、{忘|わす}れてしまいました。', id: 'Aduh, saya kelupaan membawa kartu poin.' },
            { jp: 'スマホの{画面|がめん}を{割|わ}ってしまいました。', id: 'Saya tidak sengaja memecahkan layar ponsel.' },
            { jp: 'お{菓子|かし}を{全部|ぜんぶ}{食|た}べてしまいました。', id: 'Saya sudah memakan habis semua camilannya.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 12,
      topicJp: '上手な買い物',
      topicId: 'Belanja dengan Pintar',
      titleJp: '第12課 こっちの店のほうが安いですね',
      titleId: 'Toko Sebelah Sini Lebih Murah ya',
      patterns: [
        {
          code: '1',
          title: 'V-るまで、～',
          formulas: ['V-る（辞書形） + まで、 + S (Sampai terjadinya V, ...)'],
          functionText:
            'Menyatakan batas waktu hingga suatu peristiwa terjadi ("sampai paket tiba", "sampai selesai").',
          marugoto: 'V1-るまで、V2 (初級2 11課)',
          examples: [
            { jp: '{手元|てもと}に{届|とど}くまで、2{日|ふつか}しかかかりませんでした。', id: 'Sampai tiba di tangan, cuma butuh waktu 2 hari saja.' },
            { jp: '{店|みせ}が{開|あ}くまで、ここで{待|ま}ちましょう。', id: 'Ayo tunggu di sini sampai tokonya buka.' },
            { jp: '{雨|あめ}がやむまで、カフェでお{茶|ちゃ}を{飲|の}みます。', id: 'Sampai hujan berhenti, saya minum teh di kafe.' },
          ],
        },
        {
          code: '2a',
          title: 'V-にくいです',
          formulas: ['V（akar ます） + にくいです (Sulit / tidak nyaman untuk di-V)'],
          functionText:
            'Menyatakan suatu barang atau hal sulit dipakai, sulit dibaca, atau kurang nyaman digunakan (berkonjugasi seperti kata sifat-i).',
          marugoto: 'V-にくいです',
          examples: [
            { jp: 'この{掃除機|そうじき}は、{重|おも}くて、{使|つか}いにくいですね。', id: 'Penyedot debu ini berat dan sulit digunakan ya.' },
            { jp: 'この{字|じ}は{小|ちい}さくて{読|よ}みにくいです。', id: 'Tulisan ini kecil sehingga sulit dibaca.' },
            { jp: 'ヒールが{高|たか}い{靴|くつ}は{歩|ある}きにくいです。', id: 'Sepatu berhak tinggi sulit dipakai berjalan.' },
          ],
        },
        {
          code: '2b',
          title: 'V-やすいです',
          formulas: ['V（akar ます） + やすいです (Mudah / nyaman untuk di-V)'],
          functionText:
            'Menyatakan suatu produk praktis, mudah dioperasikan, atau mudah dipahami (berkonjugasi seperti kata sifat-i).',
          marugoto: 'V-やすいです',
          examples: [
            { jp: 'トーシマの{掃除機|そうじき}のほうが{動|うご}かしやすいですよ。', id: 'Penyedot debu merek Toshima lebih mudah digerakkan lho.' },
            { jp: 'このアプリは{画面|がめん}が{見|み}やすいです。', id: 'Aplikasi ini layarnya mudah dilihat.' },
            { jp: 'この{ペン|ぺん}はとても{書|か}きやすいですね。', id: 'Pulpen ini sangat enak/mudah dipakai menulis ya.' },
          ],
        },
        {
          code: '3a',
          title: 'N1とN2（と）、どちら／どっちが～か？',
          formulas: ['N1 + と + N2 + （と）、 + どちら / どっち + が + 【形容詞】 + か？'],
          functionText:
            'Membandingkan dua produk atau toko untuk menanyakan mana yang lebih unggul dalam sifat tertentu.',
          marugoto: 'N1とN2（と）、どちら／どっちが～か',
          examples: [
            { jp: 'どっちが{使|つか}いやすいですか？', id: 'Mana yang lebih mudah digunakan?' },
            { jp: 'ネットショップと{駅前|えきまえ}の{店|みせ}と、どちらが{安|やす}いですか？', id: 'Toko online atau toko depan stasiun, mana yang lebih murah?' },
            { jp: 'A社とB社のパソコン、どっちが{軽|かる}いですか？', id: 'Laptop perusahaan A dan B, mana yang lebih ringan?' },
          ],
        },
        {
          code: '3b',
          title: '（N1より）N2のほうが～',
          formulas: [
            'N2 + のほうが + （N1 + より） + 【形容詞】です (N2 lebih ... daripada N1)',
            'N1 + より + N2 + のほうが + 【形容詞】です',
          ],
          functionText:
            'Menyatakan perbandingan keunggulan antara dua benda/toko ("N2 lebih ... dibandingkan N1").',
          marugoto: '（N1より）N2のほうが～',
          examples: [
            { jp: 'トーシマの{方|ほう}がミツバシより{軽|かる}くて、{動|うご}かしやすいですよ。', id: 'Merek Toshima lebih ringan daripada Mitsubashi dan lebih mudah digerakkan lho.' },
            { jp: 'こっちの{店|みせ}のほうが{安|やす}いですね。', id: 'Toko sebelah sini lebih murah ya.' },
            { jp: '{電車|でんしゃ}より{自転車|じてんしゃ}のほうが{早|はや}いです。', id: 'Sepeda lebih cepat daripada kereta.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 13,
      topicJp: 'さまざまなサービス',
      topicId: 'Berbagai Layanan Publik',
      titleJp: '第13課 いろいろな資料を展示してあります',
      titleId: 'Berbagai Dokumen dan Benda Dipamerkan',
      patterns: [
        {
          code: '1',
          title: 'V-（ら）れます ＜受身④＞',
          formulas: ['N（建物・作品・道具） + は + 【時・人】に + V（受身形） (Dibangun / dibuat / digunakan)'],
          functionText:
            'Bentuk pasif fungsi keempat: menjelaskan sejarah bangunan, artefak museum, atau penemuan dengan fokus pada objeknya.',
          marugoto: 'V-（ら）れます',
          examples: [
            { jp: 'この{建物|たてもの}は、2{年|ねん}{前|まえ}に{建|た}てられました。', id: 'Bangunan ini dibangun 2 tahun yang lalu.' },
            { jp: 'このお{城|しろ}は400{年|ねん}ぐらい{前|まえ}に{作|つく}られました。', id: 'Kastil ini dibuat sekitar 400 tahun lalu.' },
            { jp: 'この{本|ほん}は{世界中|せかいじゅう}で{読|よ}まれています。', id: 'Buku ini dibaca di seluruh dunia.' },
          ],
        },
        {
          code: '2',
          title: 'V-てあります',
          formulas: ['N + が / を + V（他動詞）-て + あります (Sudah di-V dan kini masih dalam keadaan tersebut)'],
          functionText:
            'Menyatakan kondisi hasil tindakan yang sengaja dilakukan sebelumnya demi suatu tujuan (mis. dipamerkan, ditulis di papan, disiapkan).',
          marugoto: 'V-てあります (初級2 14課)',
          examples: [
            { jp: '{昔|むかし}、{使|つか}われた{道具|どうぐ}とか、いろいろな{資料|しりょう}を{展示|てんじ}してあります。', id: 'Berbagai peralatan yang dipakai zaman dahulu dan dokumen-dokumen dipamerkan di sana.' },
            { jp: '{入口|いりぐち}にパンフレットが{置|お}いてあります。', id: 'Di pintu masuk sudah diletakkan brosur.' },
            { jp: '{黒板|こくばん}に{予定|よてい}が{書|か}いてあります。', id: 'Di papan tulis sudah tertulis jadwalnya.' },
          ],
        },
        {
          code: '3',
          title: 'N1だけじゃなくて、N2も～',
          formulas: ['N1 + だけじゃなくて、 + N2 + も + S (Tidak hanya N1, tetapi N2 juga ...)'],
          functionText:
            'Menjelaskan fasilitas atau layanan tambahan yang melampaui perkiraan ("Bukan cuma N1, N2 juga ada/bisa").',
          marugoto: '※文法項目としては該当なし',
          examples: [
            { jp: '{本|ほん}だけじゃなくて、CDとか、DVDもただで{借|か}りられます。', id: 'Tidak hanya buku, tetapi CD, DVD, dll. juga bisa dipinjam gratis.' },
            { jp: 'この{施設|しせつ}は{図書館|としょかん}だけじゃなくて、カフェもあります。', id: 'Fasilitas ini tidak hanya perpustakaan, tapi juga ada kafe.' },
            { jp: '{日本語|にほんご}だけじゃなくて、{英語|えいご}やインドネシア{語|ご}の{本|ほん}もあります。', id: 'Tidak hanya bahasa Jepang, ada juga buku bahasa Inggris dan bahasa Indonesia.' },
          ],
        },
        {
          code: '4',
          title: 'Nなら、～',
          formulas: ['N（条件・範囲） + なら、 + S (Jika dalam lingkup / kategori N, maka S)'],
          functionText:
            'Menentukan syarat atau batas cakupan layanan ("Kalau perpustakaan dalam kota, ...").',
          marugoto: 'S（普通体）なら、～ (初中級 トピック1)',
          examples: [
            { jp: '{返却|へんきゃく}は、{市内|しない}の{図書館|としょかん}なら、どこに{返|かえ}してもいいです。', id: 'Untuk pengembalian, kalau perpustakaan di dalam kota ini, boleh dikembalikan di mana saja.' },
            { jp: 'この{市民|しみん}カードなら、{無料|むりょう}で{利用|りよう}できます。', id: 'Kalau memakai kartu warga ini, bisa dipakai secara gratis.' },
            { jp: '{平日|へいじつ}なら、{予約|よやく}なしで{入|はい}れます。', id: 'Kalau hari kerja, bisa masuk tanpa reservasi.' },
          ],
        },
        {
          code: '5',
          title: '【疑問詞】V-ても、～',
          formulas: ['いつ / {何|なに} / どこ / だれ + V-ても、 + S (Kapan pun / di mana pun / siapa pun melakukan V, tetap S)'],
          functionText:
            'Kata tanya + V-ても menyatakan kebebasan atau keterbukaan syarat tanpa batas ("di mana saja boleh", "kapan saja sama").',
          marugoto: 'いつ／なに／どこ／だれ＋V-ても、～',
          examples: [
            { jp: '{返却|へんきゃく}は、{市内|しない}の{図書館|としょかん}なら、どこに{返|かえ}してもいいです。', id: 'Pengembalian boleh dilakukan di perpustakaan mana saja dalam kota ini.' },
            { jp: 'わからないことがあったら、いつでも{聞|き}いてくださいね。', id: 'Kalau ada yang tidak dimengerti, silakan tanya kapan saja ya.' },
            { jp: 'だれが{参加|さんか}しても{無料|むりょう}です。', id: 'Siapa pun yang ikut tetap gratis.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 14,
      topicJp: 'さまざまなサービス',
      topicId: 'Berbagai Layanan Publik',
      titleJp: '第14課 前髪は、もう少し短く切ってもらえますか？',
      titleId: 'Bisakah Poninya Dipotong Sedikit Lebih Pendek?',
      patterns: [
        {
          code: '1',
          title: 'ナA-に／イA-く V',
          formulas: [
            'ナA（tanpa な） + に + V (Melakukan V secara ナA — mis. きれいに切る)',
            'イA（coret い） + く + V (Melakukan V menjadi イA — mis. 短く切る, 早く行く)',
          ],
          functionText:
            'Mengubah kata sifat menjadi kata keterangan (adverbia) yang menjelaskan cara atau hasil akhir dari suatu kata kerja (sangat berguna di salon, penjahit, bengkel).',
          marugoto: 'イA-く／ナA-に＋V (初級2 2課)',
          examples: [
            { jp: '{全体的|ぜんたいてき}に{短|みじか}く{切|き}ってください。', id: 'Tolong potong pendek secara keseluruhan.' },
            { jp: '{前髪|まえがみ}は、もう{少|すこ}し{短|みじか}く{切|き}ってもらえますか？', id: 'Poninya, bisakah dipotong sedikit lebih pendek?' },
            { jp: '{部屋|へや}をきれいに{掃除|そうじ}しました。', id: 'Saya membersihkan kamar hingga bersih.' },
          ],
        },
        {
          code: '2',
          title: 'Nのために、～',
          formulas: ['N（人・目的） + のために、 + S (Demi / untuk N, ...)'],
          functionText:
            'Menyatakan pihak penerima manfaat atau tujuan suatu layanan/usaha ("untuk / demi N").',
          marugoto: 'Nのために、～',
          examples: [
            { jp: '{外国|がいこく}の{方|かた}のために、いろいろなサービスがあります。', id: 'Untuk warga negara asing, tersedia berbagai macam layanan.' },
            { jp: '{家族|かぞく}のために、{毎日|まいにち}{仕事|しごと}をがんばっています。', id: 'Demi keluarga, saya bekerja keras setiap hari.' },
            { jp: '{健康|けんこう}のために、{毎朝|まいあさ}{野菜|やさい}ジュースを{飲|の}んでいます。', id: 'Demi kesehatan, saya minum jus sayur setiap pagi.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 15,
      topicJp: '自然と環境',
      topicId: 'Alam dan Lingkungan',
      titleJp: '第15課 会議室の電気がついたままでした',
      titleId: 'Lampu Ruang Rapat Masih Menyala Terus',
      patterns: [
        {
          code: '1',
          title: 'V-たままです',
          formulas: [
            'V-た + ままです / まま + V2 (Dibiarkan tetap dalam keadaan V tanpa diubah)',
            'Contoh: ついたまま (dibiarkan menyala), 開けたまま (dibiarkan terbuka)',
          ],
          functionText:
            'Menyatakan suatu keadaan tetap tidak berubah sebagaimana adanya (sering dipakai untuk hal yang terlupa dimatikan/ditutup atau pemborosan energi).',
          marugoto: 'V-たままです',
          examples: [
            { jp: '{会議室|かいぎしつ}の{電気|でんき}がついたままでしたよ。', id: 'Lampu ruang rapat tadi dibiarkan tetap menyala lho.' },
            { jp: '{窓|まど}を{開|あ}けたまま{寝|ね}てしまいました。', id: 'Saya ketiduran dengan jendela tetap terbuka.' },
            { jp: '{水|みず}を{出|だ}したままにしないでくださいね。', id: 'Jangan biarkan air keran terus mengalir ya.' },
          ],
        },
        {
          code: '2',
          title: 'V-るのにいいです',
          formulas: ['V-る（辞書形） + のに + いいです / {便利|べんり}です / {使|つか}います (Bagus / berguna untuk melakukan V)'],
          functionText:
            'Menyatakan kegunaan atau manfaat suatu barang/kebiasaan ramah lingkungan untuk tujuan V.',
          marugoto: 'V-るのにいいです／使います',
          examples: [
            { jp: 'マイストローは、ごみを{減|へ}らすのにいいんですよ。', id: 'Sedotan pribadi itu bagus lho untuk mengurangi sampah.' },
            { jp: 'マイバッグは{買|か}い{物|もの}をするのにとても{便利|べんり}です。', id: 'Tas belanja pribadi sangat praktis untuk berbelanja.' },
            { jp: 'このアプリは{電気代|でんきだい}を{節約|せつやく}するのに{役|やく}に{立|た}ちます。', id: 'Aplikasi ini bermanfaat untuk menghemat biaya listrik.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 16,
      topicJp: '自然と環境',
      topicId: 'Alam dan Lingkungan',
      titleJp: '第16課 地震が来ても、あわてて動かないでください',
      titleId: 'Meski Gempa Datang, Jangan Panik dan Bergerak',
      patterns: [
        {
          code: '1',
          title: 'V（命令形） / V-るな（禁止の命令形）',
          formulas: [
            '命令形 (Perintah darurat): Kel.I u→e (急げ・逃げろ) / Kel.II coret る+ろ (集まれ・逃げろ) / する→しろ / 来る→来い',
            '禁止形 (Larangan darurat): V-る（辞書形） + な (走るな・戻るな・押すな)',
          ],
          functionText:
            'Bentuk perintah dan larangan tegas yang dipakai dalam situasi darurat (bencana alam, kebakaran), rambu lalu lintas, atau sorakan olahraga.',
          marugoto: 'V(命令形） V-る＋な (初中級 トピック1)',
          examples: [
            { jp: '{急|いそ}げ。こっちに{集|あつ}まれ。{走|はし}るな。', id: 'Cepat! Berkumpul ke sini! Jangan lari!' },
            { jp: '{津波|つなみ}が{来|く}るぞ！{高|たか}いところへ{逃|に}げろ！', id: 'Tsunami datang! Larilah ke tempat yang tinggi!' },
            { jp: '{危|あぶ}ないから、{中|なか}に{入|はい}るな！', id: 'Berbahaya, jangan masuk ke dalam!' },
          ],
        },
        {
          code: '2',
          title: 'V-ないようにしてください',
          formulas: ['V-ない + ように + してください (Tolong usahakan agar tidak melakukan V)'],
          functionText:
            'Instruksi keselamatan atau imbauan sopan agar pendengar berhati-hati supaya tidak sampai melakukan tindakan berisiko.',
          marugoto: '※文法項目としては該当なし',
          examples: [
            { jp: 'できるだけ{煙|けむり}を{吸|す}わないようにしてください。', id: 'Sebisa mungkin usahakan agar tidak menghirup asap.' },
            { jp: '{割|わ}れたガラスでけがをしないようにしてください。', id: 'Usahakan agar tidak terluka oleh pecahan kaca.' },
            { jp: '{非常口|ひじょうぐち}の{前|まえ}に{荷物|にもつ}を{置|お}かないようにしてください。', id: 'Usahakan tidak menaruh barang di depan pintu darurat.' },
          ],
        },
        {
          code: '3',
          title: 'V-（られ）なくなります',
          formulas: ['V（可能形・ない形 coret い） + なくなります (Menjadi tidak bisa lagi melakukan V)'],
          functionText:
            'Menyatakan hilangnya kemampuan atau terhentinya akses/fungsi akibat suatu kejadian (pintu macet, listrik padam, bencana).',
          marugoto: 'V-（られ）なくなりました',
          examples: [
            { jp: 'ドアが{開|あ}かなくなると、{外|そと}に{逃|に}げられなくなります。', id: 'Jika pintu menjadi tidak bisa terbuka, kita jadi tidak bisa melarikan diri ke luar.' },
            { jp: '{停電|ていでん}すると、エレベーターが{使|つか}えなくなります。', id: 'Jika listrik padam, lift menjadi tidak bisa dipakai.' },
            { jp: '{災害|さいがい}のときは、{電話|でんわ}がつながりにくくなります。', id: 'Saat bencana, telepon menjadi sulit tersambung.' },
          ],
        },
        {
          code: '4',
          title: 'Sても、～',
          formulas: [
            'V-て + も、 + S2 (Meskipun terjadi V, tetap S2)',
            'イA-くても / ナA・N-でも、 + S2 (Walaupun ..., tetap ...)',
          ],
          functionText:
            'Menyatakan konsesi ("meskipun / walaupun terjadi S1, tetap lakukan S2"), sangat penting dalam panduan keselamatan bencana.',
          marugoto: 'N／ナA-でも／じゃなくても～ / イA-くても／なくても～ (初中級 トピック2)',
          examples: [
            { jp: '{大|おお}きな{地震|じしん}が{来|き}ても、あわてて{動|うご}かないでください。', id: 'Meskipun gempa besar datang, tolong jangan panik dan bergerak.' },
            { jp: '{雨|あめ}が{強|つよ}くても、{避難訓練|ひなんくんれん}は{行|おこな}われます。', id: 'Meskipun hujan deras, latihan evakuasi tetap dilaksanakan.' },
            { jp: '{夜|よる}でも{安全|あんぜん}に{逃|に}げられるように、{懐中電灯|かいちゅうでんとう}を{準備|じゅんび}します。', id: 'Saya menyiapkan senter agar tetap bisa mengungsi dengan aman meski malam hari.' },
          ],
        },
        {
          code: '5',
          title: 'V（普通形）かどうか、～',
          formulas: [
            'V / イA（普通形） + かどうか、 + わかりますか / わかりません / {調|しら}べます',
            'N / ナA（tanpa だ） + かどうか',
          ],
          functionText:
            'Menyisipkan pertanyaan Ya/Tidak ("apakah ... atau tidak") ke dalam kalimat utama saat mengecek informasi darurat atau situasi.',
          marugoto: 'S(普通体）かどうか、～ (中級2 トピック4)',
          examples: [
            { jp: '{店|みせ}が{開|あ}いているかどうか、わからないけど…。', id: 'Saya tidak tahu apakah tokonya buka atau tidak, tapi…' },
            { jp: '{電車|でんしゃ}が{動|うご}いているかどうか、スマホで{調|しら}べます。', id: 'Saya cek di ponsel apakah keretanya beroperasi atau tidak.' },
            { jp: '{明日|あした}の{会社|かいしゃ}が{休|やす}みかどうか、{確認|かくにん}してください。', id: 'Tolong pastikan apakah kantor besok libur atau tidak.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 17,
      topicJp: '私の人生',
      topicId: 'Kehidupan Saya',
      titleJp: '第17課 日本語が前より話せるようになりました',
      titleId: 'Saya Menjadi Lebih Bisa Berbahasa Jepang Dibanding Dulu',
      patterns: [
        {
          code: '1',
          title: 'V-（られ）るように なりました',
          formulas: [
            'V（可能形・辞書形） + ように + なりました (Menjadi bisa melakukan V — sebelumnya belum bisa)',
            'Negatif: V-ない + ように + なりました (Menjadi tidak lagi melakukan V)',
          ],
          functionText:
            'Menyatakan perkembangan kemampuan atau perubahan kebiasaan diri dari waktu ke waktu ("dulu tidak bisa, sekarang menjadi bisa").',
          marugoto: '変化④ V-（られ）るように なりました (初級2 18課)',
          examples: [
            { jp: '{最近|さいきん}は、ほかの{人|ひと}にお{店|みせ}の{情報|じょうほう}を{教|おし}えられるようになりました。', id: 'Akhir-akhir ini saya menjadi bisa memberi tahu informasi toko kepada orang lain.' },
            { jp: '{日本語|にほんご}が{前|まえ}より{話|はな}せるようになりました。', id: 'Saya menjadi lebih bisa berbicara bahasa Jepang dibanding sebelumnya.' },
            { jp: '{一人|ひとり}で{病院|びょういん}や{役所|やくしょ}に{行|い}けるようになりました。', id: 'Saya sudah menjadi bisa pergi sendiri ke rumah sakit dan kantor pemerintahan.' },
          ],
        },
      ],
    },
    {
      chapterNumber: 18,
      topicJp: '私の人生',
      topicId: 'Kehidupan Saya',
      titleJp: '第18課 将来、自分の会社を作ろうと思います',
      titleId: 'Di Masa Depan, Saya Berencana Membangun Perusahaan Sendiri',
      patterns: [
        {
          code: '1',
          title: 'V-（よ）うと思います／思っています',
          formulas: [
            '意志形 (Bentuk Volisional): Kel.I u→o + う (作ろう・行こう) / Kel.II coret る + よう (食べよう) / する→しよう / 来る→来よう',
            'V（意志形） + と + {思|おも}います (Baru memutuskan) / {思|おも}っています (Sudah direncanakan sejak lama)',
          ],
          functionText:
            'Menyatakan tekad, cita-cita, atau rencana masa depan. と思います dipakai saat baru memutuskan, sedangkan と思っています dipakai untuk rencana yang sudah dipikirkan sejak lama.',
          marugoto: 'V-（よ）うと思っています (初中級 トピック5)',
          examples: [
            { jp: '{将来|しょうらい}は、タイで、{自分|じぶん}の{会社|かいしゃ}を{作|つく}ろうと{思|おも}います。', id: 'Di masa depan, saya berencana membangun perusahaan sendiri di Thailand.' },
            { jp: '{来年|らいねん}、JLPTのN3に{挑戦|ちょうせん}しようと{思|おも}っています。', id: 'Tahun depan saya berencana mencoba ujian JLPT N3.' },
            { jp: '{日本|にほん}の{技術|ぎじゅつ}をもっと{学|まな}ぼうと{思|おも}っています。', id: 'Saya bertekad untuk belajar lebih banyak teknologi Jepang.' },
          ],
        },
        {
          code: '2',
          title: 'V-るために、～',
          formulas: [
            'V-る（意志動詞・辞書形） + ために、 + S (Demi / untuk tujuan melakukan V)',
            'N + の + ために、 + S',
          ],
          functionText:
            'Menyatakan tujuan yang jelas dan terencana yang ingin dicapai oleh pembicara (berbeda dengan ように yang memakai bentuk potensial/non-volisional).',
          marugoto: 'V-るために、～ (初級2 14課)',
          examples: [
            { jp: '{日本|にほん}に{住|す}むために、もっと{日本語|にほんご}をがんばろうと{思|おも}います。', id: 'Untuk bisa tinggal di Jepang, saya bertekad belajar bahasa Jepang lebih giat lagi.' },
            { jp: '{自分|じぶん}の{店|みせ}を{開|ひら}くために、お{金|かね}を{貯|た}めています。', id: 'Saya menabung uang untuk membuka toko sendiri.' },
            { jp: '{試験|しけん}に{合格|ごうかく}するために、{毎日|まいにち}1{時間|じかん}{勉強|べんきょう}しています。', id: 'Demi lulus ujian, saya belajar 1 jam setiap hari.' },
          ],
        },
        {
          code: '3',
          title: 'V-てあげます',
          formulas: ['（{私|わたし}は） + 【人】 + に + V-て + あげます (Melakukan suatu kebaikan V untuk orang lain)'],
          functionText:
            'Menyatakan melakukan suatu bantuan atau hal baik demi orang lain (jangan dipakai langsung kepada atasan/orang yang lebih tua agar tidak terkesan menggurui).',
          marugoto: 'V-てあげます (初中級 トピック6)',
          examples: [
            { jp: '{両親|りょうしん}に、{家|いえ}を{建|た}ててあげるつもりです。', id: 'Saya berniat membangunkan rumah untuk kedua orang tua saya.' },
            { jp: '{妹|いもうと}に{日本語|にほんご}を{教|おし}えてあげました。', id: 'Saya mengajari bahasa Jepang kepada adik perempuan saya.' },
            { jp: '{困|こま}っている{後輩|こうはい}の{仕事|しごと}を{手伝|てつだ}ってあげました。', id: 'Saya membantu pekerjaan junior yang sedang kesulitan.' },
          ],
        },
        {
          code: '4',
          title: 'V-てもらいます',
          formulas: ['（{私|わたし}は） + 【人】 + に + V-て + もらいます / もらいました (Menerima bantuan V dari seseorang)'],
          functionText:
            'Mengungkapkan rasa terima kasih saat menerima kebaikan atau bantuan dari orang lain dengan pembicara sebagai subjek.',
          marugoto: 'N（人）にV-てもらいます (初中級 トピック4)',
          examples: [
            { jp: 'JF{工業|こうぎょう}のみなさんには、とても{親切|しんせつ}にしてもらいました。', id: 'Saya menerima banyak kebaikan dan keramahan dari semua orang di JF Kogyo.' },
            { jp: '{先輩|せんぱい}に{仕事|しごと}のコツを{教|おし}えてもらいました。', id: 'Saya diajari tips bekerja oleh senior.' },
            { jp: '{友達|ともだち}に{引|ひ}っ{越|こ}しを{手伝|てつだ}ってもらいました。', id: 'Saya dibantu pindahan oleh teman.' },
          ],
        },
        {
          code: '5',
          title: 'V-てくれます',
          formulas: ['【人】 + は / が + （{私|わたし}に） + V-て + くれます / くれました (Seseorang berbaik hati melakukan V untuk saya)'],
          functionText:
            'Menyatakan rasa syukur bahwa orang lain (sebagai subjek kalimat) dengan sukarela melakukan suatu kebaikan untuk pembicara.',
          marugoto: 'N（人）は／がV-てくれます (初中級 トピック4)',
          examples: [
            { jp: '{山内|やまうち}さんは、{私|わたし}にたくさん、{日本語|にほんご}を{教|おし}えてくれました。', id: 'Pak Yamauchi telah mengajari saya sangat banyak bahasa Jepang.' },
            { jp: '{寮|りょう}の{管理人|かんりにん}さんがいつも{心配|しんぱい}してくれます。', id: 'Pengurus asrama selalu memperhatikan saya dengan baik.' },
            { jp: '{友達|ともだち}が{空港|くうこう}まで{見送|みおく}りに{来|き}てくれました。', id: 'Teman-teman datang mengantar saya sampai ke bandara.' },
          ],
        },
      ],
    },
  ],
};
