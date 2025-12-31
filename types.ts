
export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export interface Word {
  id: string;
  kanji: string;
  kana: string;
  romaji: string;
  meaning: string;
  example: string;
  level: JLPTLevel;
}

export type ViewType = 'home' | 'learn' | 'profile' | 'game' | 'listening' | 'verbQuiz' | 'kanaGame' | 'dailyQuiz' | 'jlptQuiz';

export interface StudySession {
  total: number;
  completed: number;
  currentLevel: JLPTLevel;
}

export interface VerbData {
  dictionary: string; // 原形
  masu: string;       // ます形
  te: string;         // て形
  nai: string;        // ない形
  reading: string;    // 原形发音
  meaning: string;    // 中文
  ta?: string;        // た形
  imperative?: string;// 命令形
  causative?: string; // 使役形
  tai?: string;       // たい形
}

export interface KanaChar {
  char: string;
  roman: string;
}

export interface DailyWord {
  jp: string;
  reading: string;
  meaning: string;
}

export interface JLPTQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number; // 1-based index (1, 2, 3, 4)
  level: JLPTLevel;
}
