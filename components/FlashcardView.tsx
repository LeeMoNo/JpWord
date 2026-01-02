
import React, { useState, useEffect, useMemo } from 'react';
import { Word } from '../types';
import { ChevronLeft, ChevronRight, X, Volume2, RotateCw, Clock, Users, Coins, ListOrdered, Box, Book, Shirt, Tv, Cat, Coffee, Layers } from 'lucide-react';

interface FlashcardViewProps {
  words: Word[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onBack: () => void;
}

// Category Definitions
const CATEGORIES = [
  { id: 'all', label: '全部', icon: Layers, color: 'bg-slate-500' },
  { id: 'time', label: '時間', icon: Clock, color: 'bg-blue-400' },
  { id: 'people', label: '人物', icon: Users, color: 'bg-pink-400' },
  { id: 'money', label: '貨幣', icon: Coins, color: 'bg-yellow-400' },
  { id: 'order', label: '回数', icon: ListOrdered, color: 'bg-green-400' },
  { id: 'general', label: '物品', icon: Box, color: 'bg-orange-400' },
  { id: 'book', label: '書籍', icon: Book, color: 'bg-indigo-400' },
  { id: 'clothes', label: '服飾', icon: Shirt, color: 'bg-rose-400' },
  { id: 'machine', label: '機械', icon: Tv, color: 'bg-gray-400' },
  { id: 'animal', label: '動物', icon: Cat, color: 'bg-amber-500' },
  { id: 'drink', label: '飲食', icon: Coffee, color: 'bg-emerald-500' },
];

const FlashcardView: React.FC<FlashcardViewProps> = ({ words, currentIndex, onNext, onPrev, onBack }) => {
  const [flipped, setFlipped] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [localIndex, setLocalIndex] = useState(0);

  // Helper to categorize words
  const categorizeWord = (word: Word): string => {
    const k = word.kanji;
    // Time: 課/年/月/日/時/分/間
    if (/[課年月日時分間]/.test(k)) return 'time';
    // People: 人/歳
    if (/[人歳]/.test(k)) return 'people';
    // Currency: 円/万/億 (Check logic: 万/億 could be numbers, but user classified them as currency related counters)
    if (/[円万億]/.test(k)) return 'money';
    // Order: 回/度/番/階
    if (/[回度番階]/.test(k)) return 'order';
    // General: つ/個/枚/本
    if (/[個枚本]/.test(k) || k.endsWith('つ') || k === '十') return 'general';
    // Books/Dishes: 冊/皿
    if (/[冊皿]/.test(k)) return 'book';
    // Clothes: 足/着
    if (/[足着]/.test(k)) return 'clothes';
    // Machines: 台
    if (/[台]/.test(k)) return 'machine';
    // Animals: 匹/頭/羽
    if (/[匹頭羽]/.test(k)) return 'animal';
    // Drink: 杯
    if (/[杯]/.test(k)) return 'drink';
    
    return 'other';
  };

  // Filter words based on category if level is Basic
  const filteredWords = useMemo(() => {
    // Only apply filtering logic if the first word is Basic level
    if (words.length > 0 && words[0].level === 'Basic') {
      if (selectedCategory === 'all') return words;
      return words.filter(w => categorizeWord(w) === selectedCategory);
    }
    return words;
  }, [words, selectedCategory]);

  // Reset index when category changes
  useEffect(() => {
    setLocalIndex(0);
    setFlipped(false);
  }, [selectedCategory]);

  // Sync initial global index if 'all' is selected, otherwise maintain local
  useEffect(() => {
    if (selectedCategory === 'all') {
        setLocalIndex(currentIndex);
    }
  }, [currentIndex, selectedCategory]);

  const currentWord = filteredWords[localIndex];
  const isBasicLevel = words.length > 0 && words[0].level === 'Basic';

  const handleNext = () => {
    setFlipped(false);
    setLocalIndex(prev => (prev + 1) % filteredWords.length);
  };

  const handlePrev = () => {
    setFlipped(false);
    setLocalIndex(prev => (prev - 1 + filteredWords.length) % filteredWords.length);
  };

  if (!currentWord) return (
      <div className="flex flex-col h-full bg-sakura-100 p-6 items-center justify-center">
          <p className="text-slate-500">このカテゴリには単語がありません。</p>
          <button onClick={() => setSelectedCategory('all')} className="mt-4 text-sakura-500 underline">全て表示</button>
          <button onClick={onBack} className="mt-8 p-2 bg-white rounded-full"><X/></button>
      </div>
  );

  return (
    <div className="flex flex-col h-full bg-sakura-100 p-6 animate-in fade-in duration-300 relative">
      <header className="flex justify-between items-center mb-4 z-10">
        <button onClick={onBack} className="p-2 bg-white/50 rounded-full text-slate-600 hover:bg-white transition-colors">
          <X size={20} />
        </button>
        <div className="text-center">
          <span className="text-xs font-bold text-sakura-500 uppercase">
            {isBasicLevel ? CATEGORIES.find(c => c.id === selectedCategory)?.label : '学習中'}
          </span>
          <p className="text-sm font-bold text-slate-500">{localIndex + 1} / {filteredWords.length}</p>
        </div>
        <button className="p-2 bg-white/50 rounded-full text-sakura-500">
          <RotateCw size={20} />
        </button>
      </header>

      {/* Category Filter (Only for Basic Level) */}
      {isBasicLevel && (
        <div className="mb-6 -mx-6 px-6 overflow-x-auto scrollbar-hide py-2">
            <div className="flex space-x-3 w-max">
                {CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const isActive = selectedCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full transition-all border
                                ${isActive 
                                    ? `${cat.color} text-white border-transparent shadow-md scale-105` 
                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}
                            `}
                        >
                            <Icon size={14} />
                            <span className="text-xs font-bold whitespace-nowrap">{cat.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center items-center relative z-0">
        {/* Flashcard with Flip Logic */}
        <div 
          onClick={() => setFlipped(!flipped)}
          className="relative w-full aspect-[4/5] perspective-1000 cursor-pointer group"
        >
          <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}>
            {/* Front Side */}
            <div className="absolute inset-0 backface-hidden bg-white rounded-[3rem] shadow-2xl p-6 sm:p-10 flex flex-col items-center justify-center text-center border border-white">
              <div className="absolute top-8 left-8 text-sakura-200">
                <Volume2 size={32} />
              </div>
              <h2 className="text-6xl sm:text-8xl font-bold text-slate-800 mb-6 break-words w-full">{currentWord.kanji}</h2>
              <p className="text-2xl sm:text-3xl text-slate-400 font-medium">{currentWord.kana}</p>
              <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                <p className="text-sakura-300 text-sm font-bold">タップして裏返す</p>
              </div>
            </div>

            {/* Back Side */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-[3rem] shadow-2xl p-6 sm:p-10 flex flex-col items-center justify-center text-center border-4 border-sakura-100">
              <div className="space-y-6 w-full">
                <div>
                  <h3 className="text-sm font-bold text-sakura-400 uppercase mb-2">意味</h3>
                  <p className="text-2xl sm:text-4xl font-bold text-slate-800 break-words">{currentWord.meaning}</p>
                </div>
                <div className="pt-4 border-t border-sakura-50">
                  <h3 className="text-sm font-bold text-sakura-400 uppercase mb-2">読み方</h3>
                  <p className="text-xl text-slate-500">{currentWord.romaji || currentWord.kana}</p>
                </div>
                {currentWord.example && (
                    <div className="pt-4">
                    <h3 className="text-sm font-bold text-sakura-400 uppercase mb-2">例文</h3>
                    <p className="text-lg text-slate-700 italic">「{currentWord.example}」</p>
                    </div>
                )}
              </div>
              <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                <p className="text-sakura-300 text-sm font-bold underline">タップして戻る</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-6 flex justify-between items-center px-4 z-10">
        <button 
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-slate-400 hover:text-sakura-500 transition-colors"
        >
          <ChevronLeft size={32} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); setFlipped(!flipped); }}
          className="bg-sakura-500 text-white font-bold py-4 px-8 sm:px-12 rounded-full shadow-lg hover:bg-sakura-600 transition-all active:scale-95 whitespace-nowrap"
        >
          {flipped ? '次へ進む' : '答えを見る'}
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-slate-400 hover:text-sakura-500 transition-colors"
        >
          <ChevronRight size={32} />
        </button>
      </footer>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
};

export default FlashcardView;
