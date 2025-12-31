
import React, { useState, useEffect, useRef } from 'react';
import { X, Check, AlertCircle, ChevronRight, PenTool, Sparkles, Trophy } from 'lucide-react';
import { RAW_VERB_N5_CSV, RAW_VERB_N4_CSV } from '../constants';
import { VerbData, JLPTLevel } from '../types';

interface VerbQuizViewProps {
  level?: JLPTLevel;
  onBack: () => void;
}

type QuizType = 'meaning_to_dict' | 'dict_to_masu' | 'dict_to_te' | 'dict_to_nai';

const VerbQuizView: React.FC<VerbQuizViewProps> = ({ level = 'N5', onBack }) => {
  const [verbs, setVerbs] = useState<VerbData[]>([]);
  const [currentVerb, setCurrentVerb] = useState<VerbData | null>(null);
  const [quizType, setQuizType] = useState<QuizType>('meaning_to_dict');
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [combo, setCombo] = useState(0);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Select CSV based on level. Fallback to N5 if N1-N3 are selected as we don't have data yet.
    // Ideally we would merge them or have specific files for each.
    // For now, if level is N4 use N4, otherwise N5 (defaulting N1-N3 to N5 to avoid empty screen)
    let csvContent = RAW_VERB_N5_CSV;
    let isN4 = false;

    if (level === 'N4') {
        csvContent = RAW_VERB_N4_CSV;
        isN4 = true;
    }

    const lines = csvContent.split('\n');
    const parsedVerbs: VerbData[] = [];
    
    lines.forEach(line => {
      // Basic CSV parsing, filtering out headers or malformed lines
      const parts = line.split(',');
      if (parts.length >= 5) {
        // Filter out headers, empty lines, and separator lines (lines with just commas)
        if (!parts[0].includes('動詞') && !parts[0].includes('五段') && parts[0].trim() !== '') {
            
            if (isN4) {
                // N4 CSV Format: 
                // 0:Dict, 1:Masu, 2:Nai, 3:Te, 4:Mean, ..., 9:Reading
                parsedVerbs.push({
                    dictionary: parts[0].trim(),
                    masu: parts[1].trim(),
                    nai: parts[2].trim(), // Nai is at 2 in N4 CSV
                    te: parts[3].trim(),  // Te is at 3 in N4 CSV
                    meaning: parts[4].trim(), // Mean is at 4
                    reading: parts[9] ? parts[9].trim() : parts[0].trim() // Reading at 9
                  });
            } else {
                // N5 CSV Format (Existing):
                // 0:Dict, 1:Masu, 2:Te, 3:Nai, ..., 7:Read, 9:Mean
                parsedVerbs.push({
                    dictionary: parts[0].trim(),
                    masu: parts[1].trim(),
                    te: parts[2].trim(),
                    nai: parts[3].trim(),
                    reading: parts[7] ? parts[7].trim() : parts[0].trim(), 
                    meaning: parts[9] ? parts[9].trim() : '' 
                  });
            }
        }
      }
    });
    
    setVerbs(parsedVerbs);
  }, [level]);

  // Init first question when verbs are loaded
  useEffect(() => {
    if (verbs.length > 0) {
      nextQuestion();
    }
  }, [verbs]);

  const nextQuestion = () => {
    if (verbs.length === 0) return;
    const randomVerb = verbs[Math.floor(Math.random() * verbs.length)];
    setCurrentVerb(randomVerb);
    setUserInput('');
    setFeedback('none');
    // Focus input on next question (mobile might block this, but good for desktop/sim)
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const checkAnswer = () => {
    if (!currentVerb) return;

    let expectedAnswer = '';
    switch (quizType) {
      case 'meaning_to_dict': expectedAnswer = currentVerb.dictionary; break;
      case 'dict_to_masu': expectedAnswer = currentVerb.masu; break;
      case 'dict_to_te': expectedAnswer = currentVerb.te; break;
      case 'dict_to_nai': expectedAnswer = currentVerb.nai; break;
    }

    // Normalize input (trim)
    if (userInput.trim() === expectedAnswer) {
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
        // If already incorrect, pressing enter moves to next
        nextQuestion();
      } else if (feedback === 'none') {
        checkAnswer();
      }
    }
  };

  const getQuestionText = () => {
    if (!currentVerb) return 'Loading...';
    if (quizType === 'meaning_to_dict') return currentVerb.meaning;
    return `${currentVerb.dictionary} (${currentVerb.reading})`;
  };

  const getQuestionLabel = () => {
    switch(quizType) {
      case 'meaning_to_dict': return '中国語の意味 → 辞書形';
      case 'dict_to_masu': return '辞書形 → ます形';
      case 'dict_to_te': return '辞書形 → て形';
      case 'dict_to_nai': return '辞書形 → ない形';
      default: return '';
    }
  };

  const getExpectedAnswer = () => {
      if (!currentVerb) return '';
      switch (quizType) {
        case 'meaning_to_dict': return currentVerb.dictionary;
        case 'dict_to_masu': return currentVerb.masu;
        case 'dict_to_te': return currentVerb.te;
        case 'dict_to_nai': return currentVerb.nai;
      }
      return '';
  }

  return (
    <div className="flex flex-col h-full bg-sakura-50 animate-in fade-in duration-300">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-white shadow-sm z-10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 transition-colors shrink-0">
          <X size={20} className="text-slate-600" />
        </button>
        
        <div className="flex items-center justify-center flex-1 mx-2 overflow-hidden">
             <h1 className="font-bold text-slate-800 flex items-center gap-2 text-sm sm:text-base whitespace-nowrap overflow-hidden text-ellipsis">
                <PenTool size={16} className="text-sakura-500 shrink-0"/>
                <span>動詞活用 ({level})</span>
             </h1>
        </div>
        
        <div className="flex items-center gap-1.5 bg-yellow-100 px-3 py-1.5 rounded-full text-yellow-600 font-bold text-xs shrink-0 border border-yellow-200">
             <Trophy size={14} />
             <span>{combo}</span>
        </div>
      </header>

      {/* Mode Tabs */}
      <div className="flex overflow-x-auto p-4 space-x-2 scrollbar-hide bg-white/50 backdrop-blur-sm border-b border-white">
        <Tab active={quizType === 'meaning_to_dict'} onClick={() => setQuizType('meaning_to_dict')} label="辞書形" />
        <Tab active={quizType === 'dict_to_masu'} onClick={() => setQuizType('dict_to_masu')} label="ます形" />
        <Tab active={quizType === 'dict_to_te'} onClick={() => setQuizType('dict_to_te')} label="て形" />
        <Tab active={quizType === 'dict_to_nai'} onClick={() => setQuizType('dict_to_nai')} label="ない形" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
         {/* Background Decoration */}
         <div className="absolute top-10 left-10 opacity-10 pointer-events-none">
             <Sparkles size={120} className="text-sakura-500" />
         </div>

         {/* Question Card */}
         <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-xl border-4 border-sakura-100 text-center relative z-0">
             <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold mb-6">
                {getQuestionLabel()}
             </span>
             
             <h2 className="text-4xl font-bold text-slate-800 mb-2 min-h-[3rem] flex items-center justify-center break-words w-full">
                 {getQuestionText()}
             </h2>
             
             {/* Hint for Meaning Mode */}
             {quizType === 'meaning_to_dict' && currentVerb && (
                 <p className="text-sm text-slate-400 font-bold mb-4">Hint: {currentVerb.reading}</p>
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
                 
                 {/* Feedback Icon */}
                 <div className="absolute right-4 top-1/2 -translate-y-1/2">
                     {feedback === 'correct' && <Check className="text-green-500 animate-bounce" size={24} />}
                     {feedback === 'incorrect' && <AlertCircle className="text-red-500 animate-pulse" size={24} />}
                 </div>
             </div>

             {/* Correction Display */}
             {feedback === 'incorrect' && (
                 <div className="mt-4 p-3 bg-red-100 rounded-xl animate-in slide-in-from-top-2">
                     <p className="text-xs text-red-500 font-bold uppercase">正解 (Correct Answer)</p>
                     <p className="text-lg text-red-700 font-bold">{getExpectedAnswer()}</p>
                 </div>
             )}

             {/* Action Button */}
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
        className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all border shrink-0
            ${active 
                ? 'bg-sakura-500 text-white border-sakura-500 shadow-md' 
                : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'}
        `}
    >
        {label}
    </button>
);

export default VerbQuizView;
