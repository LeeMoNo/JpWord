
import React, { useState, useEffect, useRef } from 'react';
import { X, Check, AlertCircle, ChevronRight, Keyboard, Trophy, Eye, EyeOff } from 'lucide-react';
import { HIRAGANA_CHARS, KATAKANA_CHARS } from '../constants';
import { KanaChar } from '../types';

interface KanaGameViewProps {
  onBack: () => void;
}

const KanaGameView: React.FC<KanaGameViewProps> = ({ onBack }) => {
  const [gameMode, setGameMode] = useState<'hiragana' | 'katakana'>('hiragana');
  const [currentChar, setCurrentChar] = useState<KanaChar | null>(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [combo, setCombo] = useState(0);
  const [shake, setShake] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nextQuestion();
  }, [gameMode]);

  const nextQuestion = () => {
    const list = gameMode === 'hiragana' ? HIRAGANA_CHARS : KATAKANA_CHARS;
    const randomChar = list[Math.floor(Math.random() * list.length)];
    setCurrentChar(randomChar);
    setUserInput('');
    setFeedback('none');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const checkAnswer = () => {
    if (!currentChar) return;
    
    if (userInput.trim().toLowerCase() === currentChar.roman.toLowerCase()) {
      setFeedback('correct');
      setCombo(c => c + 1);
      setTimeout(nextQuestion, 1000);
    } else {
      setFeedback('incorrect');
      setCombo(0);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (feedback === 'incorrect') {
        nextQuestion();
      } else if (feedback === 'none') {
        checkAnswer();
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-sakura-50 animate-in fade-in duration-300">
      {/* Header */}
      <header className="flex justify-between items-center p-6 bg-white shadow-sm z-10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <X size={24} className="text-slate-600" />
        </button>
        <div className="flex flex-col items-center">
             <h1 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Keyboard size={18} className="text-sakura-500"/>
                50音タイピング
             </h1>
        </div>
        <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full text-yellow-600 font-bold text-sm">
             <Trophy size={14} />
             <span>Combo: {combo}</span>
        </div>
      </header>

      {/* Mode Tabs */}
      <div className="flex justify-center p-4 space-x-4">
        <Tab active={gameMode === 'hiragana'} onClick={() => setGameMode('hiragana')} label="平仮名 (Hiragana)" />
        <Tab active={gameMode === 'katakana'} onClick={() => setGameMode('katakana')} label="片仮名 (Katakana)" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
         {/* Question Card */}
         <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-xl border-4 border-sakura-100 text-center relative z-0">
             <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold mb-6">
                ローマ字を入力してください
             </span>
             
             <h2 className="text-8xl font-bold text-slate-800 mb-8 min-h-[6rem] flex items-center justify-center">
                 {currentChar?.char}
             </h2>

             {/* Input Area */}
             <div className={`mt-4 relative transition-transform ${shake ? 'animate-shake' : ''}`}>
                 <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Romaji..."
                    className={`w-full h-16 text-center text-xl font-bold rounded-2xl border-2 focus:outline-none transition-colors
                        ${feedback === 'correct' ? 'border-green-400 bg-green-50 text-green-700' : ''}
                        ${feedback === 'incorrect' ? 'border-red-400 bg-red-50 text-red-700' : ''}
                        ${feedback === 'none' ? 'border-slate-200 focus:border-sakura-400 bg-slate-50' : ''}
                    `}
                    autoComplete="off"
                    autoCapitalize="off"
                 />
                 
                 <div className="absolute right-4 top-1/2 -translate-y-1/2">
                     {feedback === 'correct' && <Check className="text-green-500 animate-bounce" size={24} />}
                     {feedback === 'incorrect' && <AlertCircle className="text-red-500 animate-pulse" size={24} />}
                 </div>
             </div>

             {/* Correction */}
             {feedback === 'incorrect' && (
                 <div className="mt-4 p-3 bg-red-100 rounded-xl animate-in slide-in-from-top-2">
                     <p className="text-xs text-red-500 font-bold uppercase">正解 (Answer)</p>
                     <p className="text-lg text-red-700 font-bold">{currentChar?.roman}</p>
                 </div>
             )}

             <button
                onClick={feedback === 'incorrect' ? nextQuestion : checkAnswer}
                className={`mt-8 w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95
                    ${feedback === 'incorrect' ? 'bg-slate-700 hover:bg-slate-800' : 'bg-sakura-500 hover:bg-sakura-600'}
                `}
             >
                 {feedback === 'incorrect' ? (
                     <span className="flex items-center justify-center gap-2">次へ <ChevronRight size={18}/></span>
                 ) : (
                     '確認する'
                 )}
             </button>
         </div>

         {/* Cheat Sheet Toggle */}
         <button 
            onClick={() => setShowChart(!showChart)}
            className="mt-6 flex items-center gap-2 text-sakura-500 font-bold text-sm bg-white/50 px-4 py-2 rounded-full hover:bg-white transition-colors"
         >
            {showChart ? <EyeOff size={16} /> : <Eye size={16} />}
            {showChart ? '早見表を隠す' : '早見表を表示'}
         </button>

         {/* Cheat Sheet Modal/Area */}
         {showChart && (
            <div className="mt-4 w-full max-w-sm bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white overflow-y-auto max-h-60 animate-in slide-in-from-bottom-4">
                <div className="grid grid-cols-5 gap-2">
                    {(gameMode === 'hiragana' ? HIRAGANA_CHARS : KATAKANA_CHARS).map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center p-1 bg-slate-50 rounded-lg">
                            <span className="text-xs text-slate-400">{item.roman}</span>
                            <span className="text-lg font-bold text-slate-700">{item.char}</span>
                        </div>
                    ))}
                </div>
            </div>
         )}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

const Tab: React.FC<{ active: boolean, label: string, onClick: () => void }> = ({ active, label, onClick }) => (
    <button
        onClick={onClick}
        className={`px-6 py-2 rounded-full text-sm font-bold transition-all border
            ${active 
                ? 'bg-sakura-500 text-white border-sakura-500 shadow-md' 
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}
        `}
    >
        {label}
    </button>
);

export default KanaGameView;
