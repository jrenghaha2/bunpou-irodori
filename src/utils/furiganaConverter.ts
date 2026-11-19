import type { RubySegment } from '../types/bunpou';

interface FuriganaEntry {
  match: string;
  kanji: string;
  reading: string;
}

/**
 * Curated Kanji + Furigana dictionary covering vocabulary across all 54 Irodori A1-A2 chapters.
 * Longest matches are applied first so compound words (e.g. にほんりょうり, しんかんせん)
 * are converted accurately before shorter roots (e.g. にほん, ほん).
 */
const RAW_ENTRIES: FuriganaEntry[] = [
  // Existing Kanji in source text
  { match: '田中', kanji: '田中', reading: 'たなか' },
  { match: '入門', kanji: '入門', reading: 'にゅうもん' },
  { match: '初級', kanji: '初級', reading: 'しょきゅう' },

  // Compound words & multi-kanji nouns (ordered long -> short at runtime)
  { match: 'にほんりょうり', kanji: '日本料理', reading: 'にほんりょうり' },
  { match: 'しんかんせん', kanji: '新幹線', reading: 'しんかんせん' },
  { match: 'てんきよほう', kanji: '天気予報', reading: 'てんきよほう' },
  { match: 'せかいじゅう', kanji: '世界中', reading: 'せかいじゅう' },
  { match: 'あさごはん', kanji: '朝ご飯', reading: 'あさごはん' },
  { match: 'ひるごはん', kanji: '昼ご飯', reading: 'ひるごはん' },
  { match: 'ばんごはん', kanji: '晩ご飯', reading: 'ばんごはん' },
  { match: 'なつやすみ', kanji: '夏休み', reading: 'なつやすみ' },
  { match: 'おしょうがつ', kanji: 'お正月', reading: 'おしょうがつ' },
  { match: 'ほっかいどう', kanji: '北海道', reading: 'ほっかいどう' },
  { match: 'きんようび', kanji: '金曜日', reading: 'きんようび' },
  { match: 'としょかん', kanji: '図書館', reading: 'としょかん' },
  { match: 'ゴミぶくろ', kanji: 'ゴミ袋', reading: 'ごみぶくろ' },
  { match: 'ゴミばこ', kanji: 'ゴミ箱', reading: 'ごみばこ' },
  { match: 'だしかた', kanji: '出し方', reading: 'だしかた' },
  { match: 'すてかた', kanji: '捨て方', reading: 'すてかた' },
  { match: 'にほんご', kanji: '日本語', reading: 'にほんご' },
  { match: 'とうきょう', kanji: '東京', reading: 'とうきょう' },
  { match: 'おおさか', kanji: '大阪', reading: 'おおさか' },
  { match: 'しんじゅく', kanji: '新宿', reading: 'しんじゅく' },
  { match: 'ちゅうごく', kanji: '中国', reading: 'ちゅうごく' },
  { match: 'ふじさん', kanji: '富士山', reading: 'ふじさん' },
  { match: 'きょうしつ', kanji: '教室', reading: 'きょうしつ' },
  { match: 'びょういん', kanji: '病院', reading: 'びょういん' },
  { match: 'びょうき', kanji: '病気', reading: 'びょうき' },
  { match: 'べんきょう', kanji: '勉強', reading: 'べんきょう' },
  { match: 'りょうり', kanji: '料理', reading: 'りょうり' },
  { match: 'りょこう', kanji: '旅行', reading: 'りょこう' },
  { match: 'りよう', kanji: '利用', reading: 'りよう' },
  { match: 'せつめい', kanji: '説明', reading: 'せつめい' },
  { match: 'せいかつ', kanji: '生活', reading: 'せいかつ' },
  { match: 'しょうらい', kanji: '将来', reading: 'しょうらい' },
  { match: 'しゅうかん', kanji: '習慣', reading: 'しゅうかん' },
  { match: 'ごうかく', kanji: '合格', reading: 'ごうかく' },
  { match: 'ほんもの', kanji: '本物', reading: 'ほんもの' },
  { match: 'ほんとう', kanji: '本当', reading: 'ほんとう' },
  { match: 'たべもの', kanji: '食べ物', reading: 'たべもの' },
  { match: 'おもいで', kanji: '思い出', reading: 'おもいで' },
  { match: 'おまつり', kanji: 'お祭り', reading: 'おまつり' },
  { match: 'おみやげ', kanji: 'お土産', reading: 'おみやげ' },
  { match: 'おてら', kanji: 'お寺', reading: 'おてら' },
  { match: 'おちゃ', kanji: 'お茶', reading: 'おちゃ' },
  { match: 'おさけ', kanji: 'お酒', reading: 'おさけ' },
  { match: 'おいわい', kanji: 'お祝い', reading: 'おいわい' },
  { match: 'おんがく', kanji: '音楽', reading: 'おんがく' },
  { match: 'おんせん', kanji: '温泉', reading: 'おんせん' },
  { match: 'ともだち', kanji: '友達', reading: 'ともだち' },
  { match: 'まいにち', kanji: '毎日', reading: 'まいにち' },
  { match: 'まいとし', kanji: '毎年', reading: 'まいとし' },
  { match: 'まいばん', kanji: '毎晩', reading: 'まいばん' },
  { match: 'らいしゅう', kanji: '来週', reading: 'らいしゅう' },
  { match: 'らいげつ', kanji: '来月', reading: 'らいげつ' },
  { match: 'らいねん', kanji: '来年', reading: 'らいねん' },
  { match: 'さいきん', kanji: '最近', reading: 'さいきん' },
  { match: 'たいふう', kanji: '台風', reading: 'たいふう' },
  { match: 'しんぶん', kanji: '新聞', reading: 'しんぶん' },
  { match: 'しりょう', kanji: '資料', reading: 'しりょう' },
  { match: 'しゃしん', kanji: '写真', reading: 'しゃしん' },
  { match: 'しょくじ', kanji: '食事', reading: 'しょくじ' },
  { match: 'かいもの', kanji: '買い物', reading: 'かいもの' },
  { match: 'かいしゃ', kanji: '会社', reading: 'かいしゃ' },
  { match: 'かいぎ', kanji: '会議', reading: 'かいぎ' },
  { match: 'こうえん', kanji: '公園', reading: 'こうえん' },
  { match: 'けんこう', kanji: '健康', reading: 'けんこう' },
  { match: 'けしき', kanji: '景色', reading: 'けしき' },
  { match: 'きょうみ', kanji: '興味', reading: 'きょうみ' },
  { match: 'じょうず', kanji: '上手', reading: 'じょうず' },
  { match: 'じかん', kanji: '時間', reading: 'じかん' },
  { match: 'じしん', kanji: '地震', reading: 'じしん' },
  { match: 'じしょ', kanji: '辞書', reading: 'じしょ' },
  { match: 'じぶん', kanji: '自分', reading: 'じぶん' },
  { match: 'じまん', kanji: '自慢', reading: 'じまん' },
  { match: 'でんしゃ', kanji: '電車', reading: 'でんしゃ' },
  { match: 'てんき', kanji: '天気', reading: 'てんき' },
  { match: 'がくせい', kanji: '学生', reading: 'がくせい' },
  { match: 'せんせい', kanji: '先生', reading: 'せんせい' },
  { match: 'かんじ', kanji: '漢字', reading: 'かんじ' },
  { match: 'かぞく', kanji: '家族', reading: 'かぞく' },
  { match: 'えいが', kanji: '映画', reading: 'えいが' },
  { match: 'しゅみ', kanji: '趣味', reading: 'しゅみ' },
  { match: 'しごと', kanji: '仕事', reading: 'しごと' },
  { match: 'そうじ', kanji: '掃除', reading: 'そうじ' },
  { match: 'よやく', kanji: '予約', reading: 'よやく' },
  { match: 'よてい', kanji: '予定', reading: 'よてい' },
  { match: 'さんか', kanji: '参加', reading: 'さんか' },
  { match: 'ぶんか', kanji: '文化', reading: 'ぶんか' },
  { match: 'ぼうさい', kanji: '防災', reading: 'ぼうさい' },
  { match: 'げんき', kanji: '元気', reading: 'げんき' },
  { match: 'きけん', kanji: '危険', reading: 'きけん' },
  { match: 'にもつ', kanji: '荷物', reading: 'にもつ' },
  { match: 'なまえ', kanji: '名前', reading: 'なまえ' },
  { match: 'やさい', kanji: '野菜', reading: 'やさい' },
  { match: 'くすり', kanji: '薬', reading: 'くすり' },
  { match: 'くるま', kanji: '車', reading: 'くるま' },
  { match: 'たまご', kanji: '卵', reading: 'たまご' },
  { match: 'つくえ', kanji: '机', reading: 'つくえ' },
  { match: 'あたま', kanji: '頭', reading: 'あたま' },
  { match: 'さいふ', kanji: '財布', reading: 'さいふ' },
  { match: 'ふくろ', kanji: '袋', reading: 'ふくろ' },
  { match: 'みやこ', kanji: '都', reading: 'みやこ' },
  { match: 'ばしょ', kanji: '場所', reading: 'ばしょ' },
  { match: 'わたし', kanji: '私', reading: 'わたし' },
  { match: 'にほん', kanji: '日本', reading: 'にほん' },
  { match: 'きのう', kanji: '昨日', reading: 'きのう' },
  { match: 'きょう', kanji: '今日', reading: 'きょう' },
  { match: 'あした', kanji: '明日', reading: 'あした' },
  { match: 'やすみ', kanji: '休み', reading: 'やすみ' },
  { match: 'あいだ', kanji: '間', reading: 'あいだ' },
  { match: 'ぜんぶ', kanji: '全部', reading: 'ぜんぶ' },
  { match: 'ひとり', kanji: '一人', reading: 'ひとり' },
  { match: 'ふたり', kanji: '二人', reading: 'ふたり' },
  { match: 'いちばん', kanji: '一番', reading: 'いちばん' },
  { match: 'いちど', kanji: '一度', reading: 'いちど' },
  { match: 'みっつ', kanji: '三つ', reading: 'みっつ' },
  { match: 'にはい', kanji: '二杯', reading: 'にはい' },
  { match: '2かい', kanji: '2階', reading: 'にかい' },
  { match: '8がつ', kanji: '8月', reading: 'はちがつ' },
  { match: '8じはん', kanji: '8時半', reading: 'はちじはん' },
  { match: '9じ', kanji: '9時', reading: 'くじ' },
  { match: '8じ', kanji: '8時', reading: 'はちじ' },
  { match: '7じ', kanji: '7時', reading: 'しちじ' },
  { match: '5じ', kanji: '5時', reading: 'ごじ' },
  { match: '3じ', kanji: '3時', reading: 'さんじ' },
  { match: 'じん', kanji: '人', reading: 'じん' },

  // Common 1-kanji nouns & adjectives
  { match: 'あたらしい', kanji: '新しい', reading: 'あたらしい' },
  { match: 'たのしかった', kanji: '楽しかった', reading: 'たのしかった' },
  { match: 'たのしく', kanji: '楽しく', reading: 'たのしく' },
  { match: 'たのしみ', kanji: '楽しみ', reading: 'たのしみ' },
  { match: 'おおきい', kanji: '大きい', reading: 'おおきい' },
  { match: 'おおきすぎて', kanji: '大きすぎて', reading: 'おおきすぎて' },
  { match: 'おおくの', kanji: '多くの', reading: 'おおくの' },
  { match: 'ちいさい', kanji: '小さい', reading: 'ちいさい' },
  { match: 'あつかったです', kanji: '暑かったです', reading: 'あつかったです' },
  { match: 'あつい', kanji: '暑い', reading: 'あつい' },
  { match: 'さむい', kanji: '寒い', reading: 'さむい' },
  { match: 'さむく', kanji: '寒く', reading: 'さむく' },
  { match: 'すずしい', kanji: '涼しい', reading: 'すずしい' },
  { match: 'やすい', kanji: '安い', reading: 'やすい' },
  { match: 'やすく', kanji: '安く', reading: 'やすく' },
  { match: 'はやい', kanji: '速い', reading: 'はやい' },
  { match: 'はやく', kanji: '早く', reading: 'はやく' },
  { match: 'せまい', kanji: '狭い', reading: 'せまい' },
  { match: 'いたい', kanji: '痛い', reading: 'いたい' },
  { match: 'しずか', kanji: '静か', reading: 'しずか' },
  { match: 'ゆうめい', kanji: '有名', reading: 'ゆうめい' },
  { match: 'すき', kanji: '好き', reading: 'すき' },
  { match: 'とくい', kanji: '得意', reading: 'とくい' },
  { match: 'にがて', kanji: '苦手', reading: 'にがて' },
  { match: 'ひま', kanji: '暇', reading: 'ひま' },
  { match: 'へや', kanji: '部屋', reading: 'へや' },
  { match: 'まち', kanji: '町', reading: 'まち' },
  { match: 'みせ', kanji: '店', reading: 'みせ' },
  { match: 'いえ', kanji: '家', reading: 'いえ' },
  { match: 'くに', kanji: '国', reading: 'くに' },
  { match: 'しま', kanji: '島', reading: 'しま' },
  { match: 'うみ', kanji: '海', reading: 'うみ' },
  { match: 'みず', kanji: '水', reading: 'みず' },
  { match: 'あめ', kanji: '雨', reading: 'あめ' },
  { match: 'はれ', kanji: '晴れ', reading: 'はれ' },
  { match: 'はる', kanji: '春', reading: 'はる' },
  { match: 'はな', kanji: '花', reading: 'はな' },
  { match: 'いぬ', kanji: '犬', reading: 'いぬ' },
  { match: 'こめ', kanji: '米', reading: 'こめ' },
  { match: 'ねつ', kanji: '熱', reading: 'ねつ' },
  { match: 'かぜ', kanji: '風邪', reading: 'かぜ' },
  { match: 'かべ', kanji: '壁', reading: 'かべ' },
  { match: 'あさ', kanji: '朝', reading: 'あさ' },
  { match: 'よる', kanji: '夜', reading: 'よる' },
  { match: 'ひと', kanji: '人', reading: 'ひと' },
  { match: 'ほん', kanji: '本', reading: 'ほん' },
  { match: 'うえ', kanji: '上', reading: 'うえ' },
  { match: 'した', kanji: '下', reading: 'した' },
  { match: 'まえ', kanji: '前', reading: 'まえ' },
  { match: 'なか', kanji: '中', reading: 'なか' },
  { match: 'すこし', kanji: '少し', reading: 'すこし' },

  // Common verbs in Irodori examples
  { match: 'すんでいます', kanji: '住んでいます', reading: 'すんでいます' },
  { match: 'はたらきます', kanji: '働きます', reading: 'はたらきます' },
  { match: 'はたらく', kanji: '働く', reading: 'はたらく' },
  { match: 'おきます', kanji: '起きます', reading: 'おきます' },
  { match: 'おきて', kanji: '起きて', reading: 'おきて' },
  { match: 'おきたら', kanji: '起きたら', reading: 'おきたら' },
  { match: 'たべます', kanji: '食べます', reading: 'たべます' },
  { match: 'たべません', kanji: '食べません', reading: 'たべません' },
  { match: 'たべました', kanji: '食べました', reading: 'たべました' },
  { match: 'たべたい', kanji: '食べたい', reading: 'たべたい' },
  { match: 'たべて', kanji: '食べて', reading: 'たべて' },
  { match: 'たべる', kanji: '食べる', reading: 'たべる' },
  { match: 'のみすぎて', kanji: '飲みすぎて', reading: 'のみすぎて' },
  { match: 'のんでいます', kanji: '飲んでいます', reading: 'のんでいます' },
  { match: 'のまなければ', kanji: '飲まなければ', reading: 'のまなければ' },
  { match: 'よみます', kanji: '読みます', reading: 'よみます' },
  { match: 'よめます', kanji: '読めます', reading: 'よめます' },
  { match: 'よめる', kanji: '読める', reading: 'よめる' },
  { match: 'よむ', kanji: '読む', reading: 'よむ' },
  { match: 'かいて', kanji: '書いて', reading: 'かいて' },
  { match: 'かきやすい', kanji: '書きやすい', reading: 'かきやすい' },
  { match: 'かけません', kanji: '書けません', reading: 'かけません' },
  { match: 'かく', kanji: '描く', reading: 'かく' },
  { match: 'いきます', kanji: '行きます', reading: 'いきます' },
  { match: 'いきません', kanji: '行きません', reading: 'いきません' },
  { match: 'いきましょう', kanji: '行きましょう', reading: 'いきましょう' },
  { match: 'いきたい', kanji: '行きたい', reading: 'いきたい' },
  { match: 'いこう', kanji: '行こう', reading: 'いこう' },
  { match: 'いった', kanji: '行った', reading: 'いった' },
  { match: 'いける', kanji: '行ける', reading: 'いける' },
  { match: 'いく', kanji: '行く', reading: 'いく' },
  { match: 'きました', kanji: '来ました', reading: 'きました' },
  { match: 'こなかった', kanji: '来なかった', reading: 'こなかった' },
  { match: 'こなくても', kanji: '来なくても', reading: 'こなくても' },
  { match: 'かえらせて', kanji: '帰らせて', reading: 'かえらせて' },
  { match: 'かえったら', kanji: '帰ったら', reading: 'かえったら' },
  { match: 'かえる', kanji: '帰る', reading: 'かえる' },
  { match: 'かいました', kanji: '買いました', reading: 'かいました' },
  { match: 'かった', kanji: '買った', reading: 'かった' },
  { match: 'はなします', kanji: '話します', reading: 'はなします' },
  { match: 'はなしました', kanji: '話しました', reading: 'はなしました' },
  { match: 'ききながら', kanji: '聞きながら', reading: 'ききながら' },
  { match: 'きいて', kanji: '聞いて', reading: 'きいて' },
  { match: 'みません', kanji: '見ません', reading: 'みません' },
  { match: 'みながら', kanji: '見ながら', reading: 'みながら' },
  { match: 'みすぎる', kanji: '見すぎる', reading: 'みすぎる' },
  { match: 'みられています', kanji: '見られています', reading: 'みられています' },
  { match: 'みたい', kanji: '見たい', reading: 'みたい' },
  { match: 'みる', kanji: '見る', reading: 'みる' },
  { match: 'つくります', kanji: '作ります', reading: 'つくります' },
  { match: 'つかいます', kanji: '使います', reading: 'つかいます' },
  { match: 'つかわずに', kanji: '使わずに', reading: 'つかわずに' },
  { match: 'つづけます', kanji: '続けます', reading: 'つづけます' },
  { match: 'つづけたい', kanji: '続けたい', reading: 'つづけたい' },
  { match: 'おわってから', kanji: '終わってから', reading: 'おわってから' },
  { match: 'のりかえます', kanji: '乗り換えます', reading: 'のりかえます' },
  { match: 'おります', kanji: '降ります', reading: 'おります' },
  { match: 'でます', kanji: '出ます', reading: 'でます' },
  { match: 'だして', kanji: '出して', reading: 'だして' },
  { match: 'だせば', kanji: '出せば', reading: 'だせば' },
  { match: 'はいって', kanji: '入って', reading: 'はいって' },
  { match: 'はいるな', kanji: '入るな', reading: 'はいるな' },
  { match: 'いれます', kanji: '入れます', reading: 'いれます' },
  { match: 'とらないで', kanji: '撮らないで', reading: 'とらないで' },
  { match: 'とって', kanji: '撮って', reading: 'とって' },
  { match: 'とる', kanji: '撮る', reading: 'とる' },
  { match: 'とめては', kanji: '止めては', reading: 'とめては' },
  { match: 'とまれ', kanji: '止まれ', reading: 'とまれ' },
  { match: 'にげろ', kanji: '逃げろ', reading: 'にげろ' },
  { match: 'おします', kanji: '押します', reading: 'おします' },
  { match: 'おすと', kanji: '押すと', reading: 'おすと' },
  { match: 'あきます', kanji: '開きます', reading: 'あきます' },
  { match: 'やすみます', kanji: '休みます', reading: 'やすみます' },
  { match: 'おもいます', kanji: '思います', reading: 'おもいます' },
  { match: 'おもっています', kanji: '思っています', reading: 'おもっています' },
  { match: 'おくれました', kanji: '遅れました', reading: 'おくれました' },
  { match: 'おくれた', kanji: '遅れた', reading: 'おくれた' },
  { match: 'ふりそうです', kanji: '降りそうです', reading: 'ふりそうです' },
  { match: 'ふる', kanji: '降る', reading: 'ふる' },
  { match: 'はれる', kanji: '晴れる', reading: 'はれる' },
  { match: 'のぼった', kanji: '登った', reading: 'のぼった' },
  { match: 'あいます', kanji: '会います', reading: 'あいます' },
  { match: 'あいたい', kanji: '会いたい', reading: 'あいたい' },
  { match: 'あうか', kanji: '合うか', reading: 'あうか' },
  { match: 'もちましょう', kanji: '持ちましょう', reading: 'もちましょう' },
  { match: 'おもちします', kanji: 'お持ちします', reading: 'おもちします' },
  { match: 'もとう', kanji: '持とう', reading: 'もとう' },
  { match: 'おすわり', kanji: 'お座り', reading: 'おすわり' },
  { match: 'おとして', kanji: '落として', reading: 'おとして' },
  { match: 'すてない', kanji: '捨てない', reading: 'すてない' },
  { match: 'かよう', kanji: '通う', reading: 'かよう' },
  { match: 'おこなわれます', kanji: '行われます', reading: 'おこなわれます' },
  { match: 'ちがいます', kanji: '違います', reading: 'ちがいます' },
  { match: 'てつだって', kanji: '手伝って', reading: 'てつだって' },
  { match: 'おしえて', kanji: '教えて', reading: 'おしえて' },
  { match: 'わすれない', kanji: '忘れない', reading: 'わすれない' },
  { match: 'よばれています', kanji: '呼ばれています', reading: 'よばれています' },
  { match: 'とどく', kanji: '届く', reading: 'とどく' },
  { match: 'とどいている', kanji: '届いている', reading: 'とどいている' },
  { match: 'しらべます', kanji: '調べます', reading: 'しらべます' },
  { match: 'こわれやすい', kanji: '壊れやすい', reading: 'こわれやすい' },
  { match: 'くらべて', kanji: '比べて', reading: 'くらべて' },
  { match: 'ちかづいている', kanji: '近づいている', reading: 'ちかづいている' },
  { match: 'ふりかえる', kanji: '振り返る', reading: 'ふりかえる' },
  { match: 'おくる', kanji: '送る', reading: 'おくる' },
  { match: 'つく', kanji: '着く', reading: 'つく' },
  { match: 'もうしこみます', kanji: '申し込みます', reading: 'もうしこみます' },
  { match: 'きをつけて', kanji: '気をつけて', reading: 'きをつけて' },
];

// Sort longest match first to prevent partial word replacements
const SORTED_ENTRIES = [...RAW_ENTRIES].sort((a, b) => b.match.length - a.match.length);

/**
 * Converts an Irodori Japanese text string into RubySegments with authentic Kanji
 * and Furigana readings.
 */
export function buildRubySegments(japaneseText: string): RubySegment[] {
  if (!japaneseText) return [];

  // Fast path: if text contains explicit {漢字|かな} ruby markup, parse directly with 100% accuracy.
  if (japaneseText.includes('{') && japaneseText.includes('|')) {
    const segments: RubySegment[] = [];
    const rubyRegex = /\{([^{}|]+)\|([^{}|]+)\}/g;
    let lastIdx = 0;
    let match: RegExpExecArray | null;
    while ((match = rubyRegex.exec(japaneseText)) !== null) {
      if (match.index > lastIdx) {
        segments.push({ text: japaneseText.slice(lastIdx, match.index) });
      }
      segments.push({ text: match[1], reading: match[2] });
      lastIdx = rubyRegex.lastIndex;
    }
    if (lastIdx < japaneseText.length) {
      segments.push({ text: japaneseText.slice(lastIdx) });
    }
    return segments;
  }

  const segments: RubySegment[] = [];
  let cursor = 0;

  while (cursor < japaneseText.length) {
    let matchedEntry: FuriganaEntry | null = null;

    for (const entry of SORTED_ENTRIES) {
      if (japaneseText.startsWith(entry.match, cursor)) {
        // Avoid replacing short hiragana substrings in the middle of a hiragana word
        const prevChar = cursor > 0 ? japaneseText[cursor - 1] : '';
        const nextChar =
          cursor + entry.match.length < japaneseText.length
            ? japaneseText[cursor + entry.match.length]
            : '';

        const isShortKana =
          entry.match.length <= 2 && /^[ぁ-ん]+$/.test(entry.match);

        if (isShortKana) {
          const prevIsKana = /^[ぁ-ん]$/.test(prevChar);
          const nextIsKana =
            /^[ぁ-ん]$/.test(nextChar) &&
            !['は', 'が', 'を', 'に', 'で', 'へ', 'と', 'の', 'も', 'か', 'や', 'ば', 'し'].includes(
              nextChar
            );
          if (prevIsKana || nextIsKana) {
            continue;
          }
        }

        matchedEntry = entry;
        break;
      }
    }

    if (matchedEntry) {
      // Split kanji portion vs trailing okurigana so furigana sits naturally over kanji
      const { kanji, reading } = matchedEntry;
      let suffixLen = 0;
      while (
        suffixLen < kanji.length &&
        suffixLen < reading.length &&
        kanji[kanji.length - 1 - suffixLen] === reading[reading.length - 1 - suffixLen] &&
        /^[ぁ-ん]$/.test(kanji[kanji.length - 1 - suffixLen])
      ) {
        suffixLen++;
      }

      let prefixLen = 0;
      while (
        prefixLen < kanji.length - suffixLen &&
        prefixLen < reading.length - suffixLen &&
        kanji[prefixLen] === reading[prefixLen] &&
        /^[ぁ-んァ-ヶ0-9]$/.test(kanji[prefixLen])
      ) {
        prefixLen++;
      }

      const prefix = kanji.slice(0, prefixLen);
      const kanjiCore = kanji.slice(prefixLen, kanji.length - suffixLen);
      const readingCore = reading.slice(prefixLen, reading.length - suffixLen);
      const suffix = suffixLen > 0 ? kanji.slice(kanji.length - suffixLen) : '';

      if (prefix) {
        segments.push({ text: prefix });
      }
      if (kanjiCore && readingCore && kanjiCore !== readingCore) {
        segments.push({ text: kanjiCore, reading: readingCore });
      } else if (kanjiCore) {
        segments.push({ text: kanjiCore });
      }
      if (suffix) {
        segments.push({ text: suffix });
      }

      cursor += matchedEntry.match.length;
    } else {
      const char = japaneseText[cursor];
      const last = segments[segments.length - 1];
      if (last && !last.reading) {
        last.text += char;
      } else {
        segments.push({ text: char });
      }
      cursor += 1;
    }
  }

  return segments;
}

/**
 * Strips inline {漢字|かな} markup returning clean Japanese Kanji text.
 */
export function stripFuriganaMarkup(japaneseText: string): string {
  return japaneseText.replace(/\{([^{}|]+)\|[^{}|]+\}/g, '$1');
}

/**
 * Strips inline {漢字|かな} markup returning reading-only kana text (useful for hiragana search).
 */
export function extractFuriganaReading(japaneseText: string): string {
  return japaneseText.replace(/\{[^{}|]+\|([^{}|]+)\}/g, '$1');
}

/**
 * Normalizes Japanese text for Web Speech API (removes ruby markup, extra learning spaces and brackets).
 */
export function getPlainSpeechText(japaneseText: string): string {
  return stripFuriganaMarkup(japaneseText)
    .replace(/\s+/g, '')
    .replace(/／/g, '、')
    .replace(/―/g, '、')
    .replace(/（　　）/g, '')
    .trim();
}
