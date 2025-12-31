
import React, { useState, useEffect, useRef } from 'react';
import { X, Check, AlertCircle, ChevronRight, BookOpen, Trophy, Clock, Flag, Eraser, RotateCcw, Scroll, Flower2 } from 'lucide-react';
import { RAW_JLPT_QUESTIONS_CSV } from '../constants';
import { JLPTQuestion, JLPTLevel } from '../types';

interface JLPTQuizViewProps {
  level: JLPTLevel;
  onBack: () => void;
}

type GameState = 'lobby' | 'playing' | 'result';

const TIME_PER_QUESTION = 60; // seconds per question estimate

const JLPTQuizView: React.FC<JLPTQuizViewProps> = ({ level, onBack }) => {
  // State
  const [gameState, setGameState] = useState<GameState>('lobby');
  const [questions, setQuestions] = useState<JLPTQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  
  // Tools state
  const [marked, setMarked] = useState<boolean>(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [wrongAnswers, setWrongAnswers] = useState<JLPTQuestion[]>([]);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Load Data
  useEffect(() => {
    const lines = RAW_JLPT_QUESTIONS_CSV.trim().split('\n');
    const parsedQuestions: JLPTQuestion[] = [];
    
    lines.forEach((line, index) => {
      const parts = line.split(',');
      if (parts.length >= 7) {
        const qLevel = parts[6].trim() as JLPTLevel;
        // Simple filter logic
        const targetLevel = (level === 'N5' || level === 'N4') ? 'N4' : 'N1';
        
        if (qLevel === targetLevel || (targetLevel === 'N1' && qLevel === 'N1')) {
            parsedQuestions.push({
                id: `q-${index}`,
                question: parts[0].trim(),
                options: [parts[1].trim(), parts[2].trim(), parts[3].trim(), parts[4].trim()],
                answer: parseInt(parts[5].trim(), 10),
                level: qLevel
            });
        }
      }
    });

    // Shuffle
    setQuestions(parsedQuestions.sort(() => 0.5 - Math.random()).slice(0, 10)); // Take max 10 for a session
  }, [level]);

  // Timer Logic
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
        timerRef.current = window.setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    finishQuiz();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }
    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, timeLeft]);

  // Actions
  const startQuiz = () => {
      setScore(0);
      setCurrentQIndex(0);
      setWrongAnswers([]);
      setTimeLeft(questions.length * TIME_PER_QUESTION);
      setGameState('playing');
      resetQuestionState();
  };

  const resetQuestionState = () => {
      setSelectedOption(null);
      setIsCorrect(null);
      setMarked(false);
      setEliminatedOptions([]);
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (selectedOption !== null || eliminatedOptions.includes(optionIndex)) return;

    setSelectedOption(optionIndex);
    const currentQuestion = questions[currentQIndex];
    const correct = (optionIndex + 1) === currentQuestion.answer;
    setIsCorrect(correct);

    if (correct) {
      setScore(s => s + 1);
    } else {
        setWrongAnswers(prev => [...prev, currentQuestion]);
    }
  };

  const handleEliminate = () => {
      if (selectedOption !== null || eliminatedOptions.length > 0) return;
      
      const currentQuestion = questions[currentQIndex];
      const correctIndex = currentQuestion.answer - 1;
      const wrongIndices = [0, 1, 2, 3].filter(i => i !== correctIndex);
      
      // Randomly pick 2 wrong answers to eliminate
      const shuffledWrong = wrongIndices.sort(() => 0.5 - Math.random());
      setEliminatedOptions(shuffledWrong.slice(0, 2));
  };

  const nextQuestion = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      resetQuestionState();
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      setGameState('result');
  };

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- RENDERERS ---

  // 1. LOBBY (Mock Exam Entrance)
  if (gameState === 'lobby') {
      return (
        <div className="flex flex-col h-full bg-sakura-50 animate-in fade-in duration-500 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#ff335c 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            <header className="p-6 relative z-10">
                <button onClick={onBack} className="p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-colors">
                    <X size={24} className="text-slate-600" />
                </button>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
                <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 rotate-3 border-4 border-sakura-100">
                    <span className="text-4xl font-bold text-sakura-500">{level}</span>
                </div>
                
                <h1 className="text-3xl font-bold text-slate-800 mb-2 font-serif">模擬試験会場</h1>
                <p className="text-slate-500 mb-10">合格を目指して頑張りましょう</p>

                <div className="w-full max-w-sm bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg border border-white mb-8 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <span className="text-slate-500 flex items-center gap-2"><BookOpen size={16}/> 問題数</span>
                        <span className="font-bold text-slate-800">{questions.length} 問</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500 flex items-center gap-2"><Clock size={16}/> 制限時間</span>
                        <span className="font-bold text-slate-800">{Math.floor((questions.length * TIME_PER_QUESTION) / 60)} 分</span>
                    </div>
                </div>

                <button 
                    onClick={startQuiz}
                    disabled={questions.length === 0}
                    className="w-full max-w-sm bg-sakura-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-sakura-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    {questions.length > 0 ? '試験開始' : '読み込み中...'} <ChevronRight size={20} />
                </button>
            </div>
        </div>
      );
  }

  // 2. RESULT (Analysis)
  if (gameState === 'result') {
      const percentage = Math.round((score / questions.length) * 100);
      let title = "";
      let subtitle = "";
      let titleColor = "";
      
      if (percentage === 100) {
          title = "桜の祭司"; // Sakura Priest / Perfect
          subtitle = "満点神様！素晴らしい成果です。";
          titleColor = "text-yellow-500";
      } else if (percentage >= 60) {
          title = "及格学子"; // Passing Student
          subtitle = "合格です！この調子で進みましょう。";
          titleColor = "text-sakura-500";
      } else {
          title = "修行不足"; // Needs Training
          subtitle = "もう少し練習が必要です。";
          titleColor = "text-slate-600";
      }

      return (
        <div className="flex flex-col h-full bg-sakura-50 animate-in fade-in duration-500 items-center justify-center p-6 relative">
            <div className="w-full max-w-sm bg-white p-8 rounded-[2rem] shadow-2xl text-center relative overflow-hidden border-8 border-sakura-50">
                {/* Result Stamp Effect */}
                <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-yellow-100 rounded-full opacity-20 blur-2xl"></div>

                <div className="mb-6 relative inline-block">
                    <Trophy size={64} className={`${percentage === 100 ? 'text-yellow-400' : percentage >= 60 ? 'text-sakura-400' : 'text-slate-300'}`} />
                    {percentage === 100 && <SparklesIcon className="absolute -top-2 -right-2 text-yellow-500 animate-pulse" />}
                </div>

                <h2 className={`text-3xl font-bold mb-2 font-serif ${titleColor}`}>{title}</h2>
                <p className="text-sm text-slate-400 mb-8">{subtitle}</p>

                <div className="text-6xl font-bold text-slate-800 mb-2 font-serif">
                    {score} <span className="text-xl text-slate-400">/ {questions.length}</span>
                </div>
                <div className="text-sm font-bold text-slate-400 mb-8 uppercase tracking-widest">Score</div>

                {wrongAnswers.length > 0 && (
                    <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between cursor-pointer hover:bg-red-100 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-400 shadow-sm">
                                <Scroll size={20} />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold text-red-400 uppercase">復習が必要</p>
                                <p className="text-sm font-bold text-slate-700 group-hover:underline">錯題錦囊 ({wrongAnswers.length}問)</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-red-300" />
                    </div>
                )}

                <div className="space-y-3">
                    <button 
                        onClick={startQuiz}
                        className="w-full bg-sakura-500 text-white font-bold py-3 rounded-xl shadow-md hover:bg-sakura-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={18} /> 再挑戦
                    </button>
                    <button 
                        onClick={onBack}
                        className="w-full bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        戻る
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // 3. QUIZ INTERFACE
  const currentQ = questions[currentQIndex];

  return (
    <div className="flex flex-col h-full bg-[#fdfbf7] animate-in fade-in duration-300 relative">
      {/* Top Bar: Progress & Timer */}
      <header className="px-6 py-4 bg-white/50 backdrop-blur-sm border-b border-stone-100 sticky top-0 z-20">
        <div className="flex justify-between items-center mb-2">
            <button onClick={onBack} className="p-1 -ml-1 text-stone-400 hover:text-stone-600">
                <X size={24} />
            </button>
            <div className="flex items-center gap-2 font-serif font-bold text-stone-600">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${timeLeft < 30 ? 'border-red-400 text-red-500 animate-pulse' : 'border-stone-300'}`}>
                    <Clock size={12} />
                </div>
                <span className="tabular-nums">{formatTime(timeLeft)}</span>
            </div>
        </div>
        
        {/* Sakura Path Progress */}
        <div className="relative h-2 w-full bg-stone-200 rounded-full mt-2 overflow-visible">
            <div 
                className="absolute left-0 top-0 h-full bg-sakura-300 rounded-full transition-all duration-500"
                style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
            ></div>
            {/* Moving Character/Icon */}
            <div 
                className="absolute top-1/2 -translate-y-1/2 transition-all duration-500"
                style={{ left: `${((currentQIndex + 1) / questions.length) * 100}%`, marginLeft: '-12px' }}
            >
                <div className="w-6 h-6 bg-white rounded-full border-2 border-sakura-400 flex items-center justify-center shadow-sm">
                    <Flower2 size={12} className="text-sakura-500" />
                </div>
            </div>
        </div>
      </header>

      {/* Main Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-6 pb-32">
         {/* Question Card - Washi Texture */}
         <div className="w-full bg-[#fffcf5] rounded-xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-stone-100 mb-8 relative">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sakura-200 via-sakura-400 to-sakura-200 opacity-50"></div>
             <span className="inline-block mb-4 text-xs font-bold tracking-widest text-sakura-500 border border-sakura-200 px-2 py-0.5 rounded bg-sakura-50">
                問 {currentQIndex + 1}
             </span>
             <h2 className="text-xl font-medium text-stone-800 leading-relaxed font-serif">
                 {currentQ.question}
             </h2>
             {/* Marked Indicator */}
             {marked && (
                 <div className="absolute top-4 right-4 text-yellow-500">
                     <Flag size={20} fill="currentColor" />
                 </div>
             )}
         </div>

         {/* Options */}
         <div className="space-y-4">
             {currentQ.options.map((option, index) => {
                 const isSelected = selectedOption === index;
                 const isAnswer = (index + 1) === currentQ.answer;
                 const isEliminated = eliminatedOptions.includes(index);
                 
                 let bgClass = "bg-white border-stone-200 hover:border-sakura-300";
                 let textClass = "text-stone-700 font-medium";
                 let content = option;
                 
                 if (isEliminated) {
                     bgClass = "bg-stone-50 border-stone-100 opacity-50 cursor-not-allowed";
                     textClass = "text-stone-300 line-through";
                 } else if (selectedOption !== null) {
                     if (isAnswer) {
                         bgClass = "bg-[#f0fdf4] border-green-400 shadow-sm"; // Light green
                         textClass = "text-green-800 font-bold";
                     } else if (isSelected && !isCorrect) {
                         bgClass = "bg-[#fef2f2] border-red-400 shadow-sm"; // Light red
                         textClass = "text-red-800 font-bold";
                     } else {
                         bgClass = "bg-stone-50 border-stone-100 opacity-60";
                         textClass = "text-stone-400";
                     }
                 } else if (isSelected) {
                     // Active selection state before confirmation (not used in immediate mode but good for future)
                     bgClass = "bg-sakura-50 border-sakura-400";
                 }

                 return (
                    <button
                        key={index}
                        onClick={() => handleOptionSelect(index)}
                        disabled={selectedOption !== null || isEliminated}
                        className={`w-full p-5 rounded-xl border-2 text-left transition-all relative flex items-center group ${bgClass}`}
                    >
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 shrink-0 transition-colors
                            ${isSelected || (selectedOption !== null && isAnswer) ? 'border-current' : 'border-stone-200 text-stone-400 group-hover:border-sakura-300 group-hover:text-sakura-300'}
                        `}>
                            {index + 1}
                        </div>
                        <span className={textClass}>{content}</span>

                        {/* Effects */}
                        {selectedOption !== null && isAnswer && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white animate-in zoom-in">
                                <Check size={14} strokeWidth={3} />
                            </div>
                        )}
                        {selectedOption !== null && isSelected && !isCorrect && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white animate-in zoom-in">
                                <X size={14} strokeWidth={3} />
                            </div>
                        )}
                    </button>
                 );
             })}
         </div>
      </div>

      {/* Bottom Toolbar (The "Desk") */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-stone-100 p-4 pb-8 flex items-center justify-between shadow-[0_-5px_15px_rgba(0,0,0,0.02)] z-30">
        <div className="flex gap-4">
            <button 
                onClick={() => setMarked(!marked)}
                className={`flex flex-col items-center gap-1 text-xs font-bold transition-colors ${marked ? 'text-yellow-500' : 'text-stone-400 hover:text-stone-600'}`}
            >
                <div className="p-2 rounded-full bg-stone-50 border border-stone-100"><Flag size={18} fill={marked ? "currentColor" : "none"} /></div>
                标记
            </button>
            <button 
                onClick={handleEliminate}
                disabled={selectedOption !== null || eliminatedOptions.length > 0}
                className={`flex flex-col items-center gap-1 text-xs font-bold transition-colors ${eliminatedOptions.length > 0 ? 'text-stone-300' : 'text-stone-400 hover:text-stone-600'}`}
            >
                <div className="p-2 rounded-full bg-stone-50 border border-stone-100"><Eraser size={18} /></div>
                排除
            </button>
        </div>

        {selectedOption !== null && (
             <button
                onClick={nextQuestion}
                className="bg-sakura-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-sakura-600 transition-transform active:scale-95 flex items-center gap-2 animate-in slide-in-from-right-4"
             >
                 {currentQIndex < questions.length - 1 ? '次へ' : '結果へ'} <ChevronRight size={18}/>
             </button>
         )}
      </div>
    </div>
  );
};

const SparklesIcon = ({ className }: { className?: string }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={`w-6 h-6 ${className}`}
    >
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
);

export default JLPTQuizView;
