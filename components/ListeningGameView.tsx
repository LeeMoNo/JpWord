
import React, { useState, useEffect, useRef } from 'react';
import { Word } from '../types';
import { X, Volume2, Heart, Play, Trophy, RotateCcw } from 'lucide-react';

interface ListeningGameViewProps {
  words: Word[];
  onBack: () => void;
}

interface FallingWord {
  id: string;
  word: Word;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  speed: number;
  isTarget: boolean;
  state: 'falling' | 'clicked-correct' | 'clicked-wrong' | 'missed';
}

const ListeningGameView: React.FC<ListeningGameViewProps> = ({ words, onBack }) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover'>('intro');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [fallingItems, setFallingItems] = useState<FallingWord[]>([]);
  const [currentRoundTarget, setCurrentRoundTarget] = useState<Word | null>(null);
  
  // Refs for game loop
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const roundActiveRef = useRef<boolean>(false);

  // Audio utility
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop previous
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setFallingItems([]);
    roundActiveRef.current = false;
    // Pass 3 explicitely to bypass the stale 'lives' state which is still 0 in this closure
    startNewRound(3);
  };

  const startNewRound = (initialLives?: number) => {
    // Use initialLives if provided (for game restart), otherwise use current state
    const currentLives = initialLives ?? lives;
    if (currentLives <= 0) return;

    // 1. Select Target
    const targetIndex = Math.floor(Math.random() * words.length);
    const targetWord = words[targetIndex];
    setCurrentRoundTarget(targetWord);

    // 2. Select Distractors (2 words)
    const otherWords = words.filter(w => w.id !== targetWord.id);
    const distractors = otherWords.sort(() => 0.5 - Math.random()).slice(0, 2);

    // 3. Create items
    const itemsToSpawn = [targetWord, ...distractors].sort(() => 0.5 - Math.random());
    
    // Distribute X positions nicely (15%, 50%, 85% approx with jitter)
    const newItems: FallingWord[] = itemsToSpawn.map((w, idx) => ({
      id: Math.random().toString(36).substr(2, 9),
      word: w,
      x: 15 + (idx * 35) + (Math.random() * 10 - 5),
      y: -20 - (Math.random() * 20), // Start above screen with stagger
      speed: 0.15 + (Math.random() * 0.05) + (score * 0.005), // Speed increases with score
      isTarget: w.id === targetWord.id,
      state: 'falling'
    }));

    setFallingItems(newItems);
    roundActiveRef.current = true;

    // Play sound after a tiny delay to let items prepare
    setTimeout(() => {
        speak(targetWord.kana);
    }, 500);
  };

  // Game Loop
  const updateGame = (time: number) => {
    if (gameState !== 'playing') return;
    
    // Simple delta time logic could be added here, currently assuming 60fps roughly
    // const deltaTime = time - (lastTimeRef.current || time);
    // lastTimeRef.current = time;

    setFallingItems(prevItems => {
      let roundEnded = false;
      let lifeLost = false;

      const nextItems = prevItems.map(item => {
        if (item.state !== 'falling') return item;

        const newY = item.y + item.speed;

        // Check if hit bottom
        if (newY > 110) {
          if (item.isTarget) {
            lifeLost = true;
            roundEnded = true;
            return { ...item, state: 'missed' as const };
          }
          return { ...item, state: 'missed' as const }; // Distractor fallen is fine
        }

        return { ...item, y: newY };
      });

      // Handle side effects outside of the map
      if (lifeLost) {
        setLives(l => {
            const newLives = l - 1;
            if (newLives <= 0) setGameState('gameover');
            return newLives;
        });
        roundActiveRef.current = false;
        // Delay next round
        setTimeout(() => startNewRound(), 1500);
      } else if (roundEnded && lives > 0) {
         // Should not happen if target hits bottom logic handles round end, 
         // but if distractors hit bottom, we wait for target.
      }

      return nextItems;
    });

    requestRef.current = requestAnimationFrame(updateGame);
  };

  useEffect(() => {
    if (gameState === 'playing') {
      requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, lives]); // Re-bind if vital state changes

  const handleItemClick = (id: string) => {
    if (gameState !== 'playing' || !roundActiveRef.current) return;

    setFallingItems(prev => {
      const item = prev.find(i => i.id === id);
      if (!item || item.state !== 'falling') return prev;

      if (item.isTarget) {
        // Correct!
        setScore(s => s + 10);
        roundActiveRef.current = false;
        setTimeout(() => startNewRound(), 1000); // Next round
        return prev.map(i => i.id === id ? { ...i, state: 'clicked-correct' } : i);
      } else {
        // Wrong!
        setLives(l => {
          const newLives = l - 1;
          if (newLives <= 0) {
             setGameState('gameover');
             roundActiveRef.current = false;
          }
          return newLives;
        });
        // Don't end round, just mark wrong
        return prev.map(i => i.id === id ? { ...i, state: 'clicked-wrong' } : i);
      }
    });
  };

  const handleReplayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentRoundTarget && gameState === 'playing') {
      speak(currentRoundTarget.kana);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-indigo-900 to-slate-900 relative overflow-hidden text-white">
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 50% 120%, #4f46e5, transparent 70%)'
      }}></div>

      {/* Intro Screen */}
      {gameState === 'intro' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 bg-black/60 backdrop-blur-md">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <Volume2 size={48} className="text-sakura-300" />
          </div>
          <h1 className="text-3xl font-bold mb-2">落樱辨音</h1>
          <p className="text-slate-300 text-center mb-8">聞こえた単語を選んでください。<br/>Listen and catch the falling sakura petals!</p>
          <button 
            onClick={startGame}
            className="w-full max-w-xs bg-sakura-500 hover:bg-sakura-600 text-white font-bold py-4 rounded-full shadow-lg transition-transform active:scale-95 flex items-center justify-center space-x-2"
          >
            <Play size={20} fill="currentColor" />
            <span>スタート</span>
          </button>
          <button onClick={onBack} className="mt-6 text-slate-400 font-bold text-sm underline">
            戻る
          </button>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 bg-black/80 backdrop-blur-md animate-in fade-in">
          <Trophy size={64} className="text-yellow-400 mb-6" />
          <h2 className="text-4xl font-bold mb-2">Game Over</h2>
          <p className="text-xl text-slate-300 mb-8">Score: {score}</p>
          <div className="flex flex-col w-full max-w-xs space-y-4">
            <button 
                onClick={startGame}
                className="w-full bg-sakura-500 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center space-x-2"
            >
                <RotateCcw size={20} />
                <span>もう一度</span>
            </button>
            <button 
                onClick={onBack}
                className="w-full bg-slate-700 text-white font-bold py-3 rounded-xl"
            >
                やめる
            </button>
          </div>
        </div>
      )}

      {/* Top HUD */}
      <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20">
        <button onClick={onBack} className="p-2 bg-white/10 rounded-full hover:bg-white/20 backdrop-blur-sm transition-colors">
          <X size={20} />
        </button>
        
        <div className="flex items-center space-x-1 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
           <Heart size={16} className={`text-sakura-500 ${lives < 2 ? 'animate-ping' : ''}`} fill="currentColor" />
           <span className="font-bold">{lives}</span>
        </div>

        <div className="font-bold text-xl tabular-nums bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
          {score}
        </div>
      </header>

      {/* Game Area */}
      <div className="flex-1 relative mt-16">
        {/* Falling Items */}
        {fallingItems.map(item => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className={`
              absolute transform -translate-x-1/2 cursor-pointer transition-transform
              flex flex-col items-center justify-center
              ${item.state === 'falling' ? 'active:scale-95' : ''}
              ${item.state === 'clicked-correct' ? 'scale-150 opacity-0 duration-500' : ''}
              ${item.state === 'clicked-wrong' ? 'animate-shake bg-slate-700 !text-slate-500' : ''}
              ${item.state === 'missed' ? 'opacity-0 duration-500' : ''}
            `}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transition: item.state === 'falling' ? 'none' : 'all 0.3s ease-out'
            }}
          >
             {/* Petal Visual */}
             <div className={`
                w-20 h-20 rounded-full flex items-center justify-center shadow-lg relative
                ${item.state === 'clicked-wrong' ? 'bg-slate-200' : 'bg-pink-200'}
             `}
             style={{
                borderRadius: '60% 40% 60% 40% / 50% 50% 50% 50%',
                background: item.state === 'clicked-wrong' ? '#cbd5e1' : 'radial-gradient(circle at 30% 30%, #fbcfe8, #f9a8d4)'
             }}>
                <span className="text-slate-800 font-bold text-lg drop-shadow-sm">
                  {item.word.kanji}
                </span>
                {/* Visual feedback for correct click */}
                {item.state === 'clicked-correct' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sakura-400 opacity-75"></span>
                    </div>
                )}
             </div>
             {/* Subtext (Kana) - Optional, maybe hides difficulty? Let's show it for now */}
             <span className="mt-1 text-xs font-bold text-white/80 bg-black/20 px-2 rounded-full backdrop-blur-sm">
                ???
             </span>
          </div>
        ))}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20">
         <button 
            onClick={handleReplayAudio}
            className="w-16 h-16 bg-sakura-500 hover:bg-sakura-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white/10 active:scale-95 transition-transform"
         >
            <Volume2 size={32} />
         </button>
      </div>
      <p className="absolute bottom-2 w-full text-center text-xs text-white/40">音声を再生する</p>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(-50%, 0) rotate(0deg); }
          25% { transform: translate(-55%, 0) rotate(-5deg); }
          75% { transform: translate(-45%, 0) rotate(5deg); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};

export default ListeningGameView;
