
import React, { useState } from 'react';
import { Word } from '../types';
import { ChevronLeft, ChevronRight, X, Volume2, RotateCw } from 'lucide-react';

interface FlashcardViewProps {
  words: Word[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onBack: () => void;
}

const FlashcardView: React.FC<FlashcardViewProps> = ({ words, currentIndex, onNext, onPrev, onBack }) => {
  const [flipped, setFlipped] = useState(false);
  const currentWord = words[currentIndex];

  if (!currentWord) return null;

  return (
    <div className="flex flex-col h-full bg-sakura-100 p-6 animate-in fade-in duration-300">
      <header className="flex justify-between items-center mb-10">
        <button onClick={onBack} className="p-2 bg-white/50 rounded-full text-slate-600 hover:bg-white transition-colors">
          <X size={20} />
        </button>
        <div className="text-center">
          <span className="text-xs font-bold text-sakura-500 uppercase">学習中</span>
          <p className="text-sm font-bold text-slate-500">{currentIndex + 1} / {words.length}</p>
        </div>
        <button className="p-2 bg-white/50 rounded-full text-sakura-500">
          <RotateCw size={20} />
        </button>
      </header>

      <div className="flex-1 flex flex-col justify-center items-center">
        {/* Flashcard with Flip Logic */}
        <div 
          onClick={() => setFlipped(!flipped)}
          className="relative w-full aspect-[4/5] perspective-1000 cursor-pointer group"
        >
          <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}>
            {/* Front Side */}
            <div className="absolute inset-0 backface-hidden bg-white rounded-[3rem] shadow-2xl p-10 flex flex-col items-center justify-center text-center border border-white">
              <div className="absolute top-8 left-8 text-sakura-200">
                <Volume2 size={32} />
              </div>
              <h2 className="text-8xl font-bold text-slate-800 mb-6">{currentWord.kanji}</h2>
              <p className="text-3xl text-slate-400 font-medium">{currentWord.kana}</p>
              <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                <p className="text-sakura-300 text-sm font-bold">タップして裏返す</p>
              </div>
            </div>

            {/* Back Side */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-[3rem] shadow-2xl p-10 flex flex-col items-center justify-center text-center border-4 border-sakura-100">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-sakura-400 uppercase mb-2">意味</h3>
                  <p className="text-4xl font-bold text-slate-800">{currentWord.meaning}</p>
                </div>
                <div className="pt-4 border-t border-sakura-50">
                  <h3 className="text-sm font-bold text-sakura-400 uppercase mb-2">読み方</h3>
                  <p className="text-xl text-slate-500">{currentWord.romaji}</p>
                </div>
                <div className="pt-4">
                  <h3 className="text-sm font-bold text-sakura-400 uppercase mb-2">例文</h3>
                  <p className="text-lg text-slate-700 italic">「{currentWord.example}」</p>
                </div>
              </div>
              <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                <p className="text-sakura-300 text-sm font-bold underline">タップして戻る</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-10 flex justify-between items-center px-4">
        <button 
          onClick={(e) => { e.stopPropagation(); onPrev(); setFlipped(false); }}
          className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-slate-400 hover:text-sakura-500 transition-colors"
        >
          <ChevronLeft size={32} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); setFlipped(!flipped); }}
          className="bg-sakura-500 text-white font-bold py-4 px-12 rounded-full shadow-lg hover:bg-sakura-600 transition-all active:scale-95"
        >
          {flipped ? '次へ進む' : '答えを見る'}
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onNext(); setFlipped(false); }}
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
      `}</style>
    </div>
  );
};

export default FlashcardView;
