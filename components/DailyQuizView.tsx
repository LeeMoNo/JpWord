
import React, { useState, useEffect, useRef } from 'react';
import { X, Check, AlertCircle, ChevronRight, Sparkles, Trophy, Coffee, Volume2 } from 'lucide-react';
import { RAW_DAILY_WORDS_CSV } from '../constants';
import { DailyWord } from '../types';

interface DailyQuizViewProps {
  onBack: () => void;
}

const DailyQuizView: React.FC<DailyQuizViewProps> = ({ onBack }) => {
  const [words, setWords] = useState<DailyWord[]>([]);
  const [currentWord, setCurrentWord] = useState<DailyWord | null>(null);
  const [quizType, setQuizType] = useState<'cn_to_jp' | 'jp_to_reading'>('cn_to_jp');
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [combo, setCombo] = useState(0);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Parse CSV
    const lines = RAW_DAILY_WORDS_CSV.split('\n');
    const parsedWords: DailyWord[] = [];
    
    lines.forEach(line => {
      // CSV Format: JP, Reading, CN
      const parts = line.split(',');
      if (parts.length >= 3) {
        if (parts[0].trim() !== '') {
            parsedWords.push({
                jp: parts[0].trim(),
                reading: parts[1].trim(),
                meaning: parts[2].trim()
            });
        }
      }
    });
    setWords(parsedWords);
  }, []);

  useEffect(() => {
    if (words.length > 0) {
      nextQuestion();
    }
  }, [words, quizType]);

  const nextQuestion = () => {
    if (words.length === 0) return;
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(randomWord);
    setUserInput('');
    setFeedback('none');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        window.speechSynthesis.speak(utterance);
    }
  };

  const checkAnswer = () => {
    if (!currentWord) return;

    let expectedAnswer = '';
    // If quiz is CN -> JP, answer is JP. 
    // If quiz is JP -> Reading, answer is Reading.
    if (quizType === 'cn_to_jp') {
        expectedAnswer = currentWord.jp;
    } else {
        expectedAnswer = currentWord.reading;
    }

    // Normalize check
    const isCorrect = userInput.trim() === expectedAnswer || 
                     (quizType === 'cn_to_jp' && userInput.trim() === currentWord.reading); // Allow reading as answer for JP

    if (isCorrect) {
      setFeedback('correct');
      setCombo(c => c + 1);
      setTimeout(nextQuestion, 1000);
    } else {
      setFeedback('incorrect');
      setCombo(0);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      // Speak on error to help learning
      speak(currentWord.jp);
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
                <Coffee size={18} className="text-sakura-500"/>
                生活単語クイズ
             </h1>
        </div>
        <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full text-yellow-600 font-bold text-sm">
             <Trophy size={14} />
             <span>Combo: {combo}</span>
        </div>
      </header>

      {/* Mode Tabs */}
      <div className="flex justify-center p-4 space-x-2">
        <Tab active={quizType === 'cn_to_jp'} onClick={() => setQuizType('cn_to_jp')} label="中 → 日" />
        <Tab active={quizType === 'jp_to_reading'} onClick={() => setQuizType('jp_to_reading')} label="日 → 読み" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
         {/* Background Decoration */}
         <div className="absolute top-10 left-10 opacity-10 pointer-events-none">
             <Sparkles size={120} className="text-sakura-500" />
         </div>

         {/* Question Card */}
         <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-xl border-4 border-sakura-100 text-center relative z-0">
             <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold mb-6">
                {quizType === 'cn_to_jp' ? '日本語を入力してください' : '読み方を入力してください'}
             </span>
             
             <h2 className="text-4xl font-bold text-slate-800 mb-2 min-h-[3rem] flex items-center justify-center break-words w-full">
                 {quizType === 'cn_to_jp' ? currentWord?.meaning : currentWord?.jp}
             </h2>

             {/* Audio Button for JP Mode */}
             {quizType === 'jp_to_reading' && (
                 <button 
                    onClick={() => currentWord && speak(currentWord.jp)}
                    className="mx-auto mt-2 p-2 bg-sakura-100 rounded-full text-sakura-500 hover:bg-sakura-200 transition-colors"
                 >
                     <Volume2 size={20} />
                 </button>
             )}

             {/* Input Area */}
             <div className={`mt-8 relative transition-transform ${shake ? 'animate-shake' : ''}`}>
                 <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="答えを入力..."
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
                 <div className="mt-4 p-3 bg-red-100 rounded-xl animate-in slide-in-from-top-2 text-left">
                     <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-red-500 font-bold uppercase">正解 (Answer)</span>
                        <button onClick={() => currentWord && speak(currentWord.jp)} className="text-red-400"><Volume2 size={16}/></button>
                     </div>
                     <p className="text-lg text-red-700 font-bold">{currentWord?.jp}</p>
                     <p className="text-sm text-red-600">{currentWord?.reading}</p>
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

export default DailyQuizView;
