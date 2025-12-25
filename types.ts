
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

export type ViewType = 'home' | 'learn' | 'stats' | 'profile' | 'search' | 'game' | 'listening';

export interface StudySession {
  total: number;
  completed: number;
  currentLevel: JLPTLevel;
}
