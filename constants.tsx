
import { Word } from './types';

export const MOCK_WORDS: Record<string, Word[]> = {
  N5: [
    { id: '1', kanji: '桜', kana: 'さくら', romaji: 'sakura', meaning: 'Cherry blossom', example: '桜が咲いています。', level: 'N5' },
    { id: '2', kanji: '学校', kana: 'がっこう', romaji: 'gakkou', meaning: 'School', example: '学校へ行きます。', level: 'N5' },
    { id: '3', kanji: '食べる', kana: 'たべる', romaji: 'taberu', meaning: 'To eat', example: 'りんごを食べます。', level: 'N5' },
    { id: '4', kanji: '日本', kana: 'にっぽん', romaji: 'nippon', meaning: 'Japan', example: '日本は美しいです。', level: 'N5' },
    { id: '5', kanji: '水', kana: 'みず', romaji: 'mizu', meaning: 'Water', example: '水を飲みます。', level: 'N5' },
  ],
  N4: [
    { id: '101', kanji: '準備', kana: 'じゅんび', romaji: 'junbi', meaning: 'Preparation', example: '試験の準備をする。', level: 'N4' },
    { id: '102', kanji: '理由', kana: 'りゆう', romaji: 'riyuu', meaning: 'Reason', example: '理由を教えてください。', level: 'N4' },
  ],
  N3: [
    { id: '201', kanji: '経験', kana: 'けいけん', romaji: 'keiken', meaning: 'Experience', example: 'いい経験になりました。', level: 'N3' },
  ],
  N2: [
    { id: '301', kanji: '影響', kana: 'えいきょう', romaji: 'eikyou', meaning: 'Influence', example: '環境に影響を与える。', level: 'N2' },
  ],
  N1: [
    { id: '401', kanji: '謙虚', kana: 'けんきょ', romaji: 'kenkyo', meaning: 'Humble', example: '彼は非常に謙虚だ。', level: 'N1' },
  ]
};
