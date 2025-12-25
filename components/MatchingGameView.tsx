
import React, { useState, useEffect } from 'react';
import { Word } from '../types';
import { X, RefreshCw, Trophy, Sparkles } from 'lucide-react';

interface MatchingGameViewProps {
  words: Word[];
  onBack: () => void;
}

interface Petal {
  id: string;
  wordId: string;
  content: string;
  type: 'question' | 'answer';
  x: number;
  y: number;
  rotation: number;
  matched: boolean;
  shaking: boolean;
}

const MatchingGameView: React.FC<MatchingGameViewProps> = ({ words, onBack }) => {
  const [petals, setPetals] = useState<Petal[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [moveCount, setMoveCount] = useState(0);

  // Initialize game
  useEffect(() => {
    startNewGame();
  }, [words]);

  const startNewGame = () => {
    // Pick random 6 words (or fewer if not enough)
    const gameWords = [...words].sort(() => 0.5 - Math.random()).slice(0, 6);
    
    // Create petals
    const newPetals: Petal[] = [];
    gameWords.forEach((word) => {
      // Question petal (Kanji/Kana)
      newPetals.push({
        id: `${word.id}-q`,
        wordId: word.id,
        content: word.kanji || word.kana,
        type: 'question',
        x: 0, y: 0, rotation: 0, matched: false, shaking: false
      });
      // Answer petal (Meaning)
      newPetals.push({
        id: `${word.id}-a`,
        wordId: word.id,
        content: word.meaning,
        type: 'answer',
        x: 0, y: 0, rotation: 0, matched: false, shaking: false
      });
    });

    // Shuffle positions using a grid with jitter
    const cols = 3;
    const rows = 4;
    const shuffledPetals = newPetals.sort(() => 0.5 - Math.random());
    
    shuffledPetals.forEach((petal, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      // Base grid position in %
      const baseX = (col * 33) + 16;
      const baseY = (row * 20) + 15; // Start a bit lower
      
      // Add randomness (Jitter)
      const jitterX = (Math.random() * 10) - 5;
      const jitterY = (Math.random() * 10) - 5;
      
      petal.x = baseX + jitterX;
      petal.y = baseY + jitterY;
      petal.rotation = (Math.random() * 40) - 20;
    });

    setPetals(shuffledPetals);
    setSelectedId(null);
    setCompleted(false);
    setMoveCount(0);
  };

  const handlePetalClick = (id: string) => {
    if (completed) return;
    const clickedPetal = petals.find(p => p.id === id);
    if (!clickedPetal || clickedPetal.matched) return;

    // Deselect if clicking the same one
    if (selectedId === id) {
      setSelectedId(null);
      return;
    }

    // If no other selected, just select this one
    if (!selectedId) {
      setSelectedId(id);
      return;
    }

    // Try to match
    const selectedPetal = petals.find(p => p.id === selectedId);
    if (!selectedPetal) return;

    setMoveCount(prev => prev + 1);

    if (selectedPetal.wordId === clickedPetal.wordId) {
      // Match found!
      setPetals(prev => prev.map(p => 
        (p.id === id || p.id === selectedId) 
          ? { ...p, matched: true } 
          : p
      ));
      setSelectedId(null);

      // Check win condition
      const remaining = petals.filter(p => !p.matched && p.id !== id && p.id !== selectedId).length;
      if (remaining === 0) {
        setTimeout(() => setCompleted(true), 1000); // Delay for animation
      }
    } else {
      // Mismatch - Shake both
      setPetals(prev => prev.map(p => 
        (p.id === id || p.id === selectedId) 
          ? { ...p, shaking: true } 
          : p
      ));
      
      // Remove shake class after animation and deselect
      setTimeout(() => {
        setPetals(prev => prev.map(p => ({ ...p, shaking: false })));
        setSelectedId(null);
      }, 500);
    }
  };

  return (
    <div className="flex flex-col h-full bg-sakura-50 relative overflow-hidden">
      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute text-sakura-200 opacity-30 animate-pulse" 
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}>
            <Sparkles size={24 + Math.random() * 24} />
          </div>
        ))}
      </div>

      <header className="flex justify-between items-center p-6 z-10">
        <button onClick={onBack} className="p-2 bg-white rounded-full text-slate-600 hover:bg-slate-100 shadow-sm transition-colors">
          <X size={20} />
        </button>
        <div className="text-center">
          <span className="text-xs font-bold text-sakura-500 uppercase tracking-widest">単語合わせ</span>
          <p className="text-sm font-bold text-slate-500">ペアを見つけよう</p>
        </div>
        <button onClick={startNewGame} className="p-2 bg-white rounded-full text-sakura-500 hover:bg-sakura-50 shadow-sm transition-colors">
          <RefreshCw size={20} />
        </button>
      </header>

      {/* Game Area */}
      <div className="flex-1 relative mx-4 mb-4">
        {petals.map(petal => (
          <div
            key={petal.id}
            onClick={() => handlePetalClick(petal.id)}
            className={`
              absolute w-24 h-24 flex items-center justify-center p-2 text-center select-none cursor-pointer
              transition-all duration-500 ease-out
              ${petal.matched ? 'opacity-0 scale-150 pointer-events-none' : 'opacity-100 scale-100'}
              ${petal.shaking ? 'animate-shake' : ''}
              ${selectedId === petal.id ? 'z-20 scale-110 drop-shadow-xl' : 'z-10 drop-shadow-md hover:scale-105'}
            `}
            style={{
              left: `${petal.x}%`,
              top: `${petal.y}%`,
              transform: `translate(-50%, -50%) rotate(${petal.rotation}deg)`,
            }}
          >
            {/* Petal Shape Background */}
            <div className={`
              absolute inset-0 
              ${selectedId === petal.id ? 'bg-sakura-400' : (petal.type === 'question' ? 'bg-white' : 'bg-sakura-100')}
              rounded-full opacity-90 border-2
              ${selectedId === petal.id ? 'border-sakura-500' : 'border-sakura-200'}
              shadow-inner
            `} 
            style={{
               borderRadius: '60% 40% 60% 40% / 50% 50% 50% 50%', // Organic shape
            }}
            />
            
            {/* Content */}
            <span className={`
              relative z-10 font-bold text-sm leading-tight
              ${selectedId === petal.id ? 'text-white' : 'text-slate-700'}
            `}>
              {petal.content}
            </span>
          </div>
        ))}
      </div>

      {/* Victory Overlay */}
      {completed && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl border-4 border-sakura-100 text-center max-w-xs mx-4 transform animate-in zoom-in-50 duration-300">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-500 animate-bounce">
              <Trophy size={40} />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">お見事！</h2>
            <p className="text-slate-500 mb-6">すべての桜を集めました。</p>
            
            <div className="space-y-3">
              <button 
                onClick={startNewGame}
                className="w-full bg-sakura-500 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-sakura-600 transition-colors"
              >
                もう一度遊ぶ
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
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
          25% { transform: translate(-55%, -50%) rotate(-5deg); }
          75% { transform: translate(-45%, -50%) rotate(5deg); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};

export default MatchingGameView;
