
import React, { useState, useEffect } from 'react';
import { Home, BookOpen, BarChart3, User, Search, Settings, Mic, HelpCircle, Star, Gamepad2, ChevronRight, ChevronLeft, RefreshCw, PenTool, Keyboard, Coffee, GraduationCap } from 'lucide-react';
import { ViewType, JLPTLevel, Word, StudySession } from './types';
import { MOCK_WORDS } from './constants';
import FlashcardView from './components/FlashcardView';
import MatchingGameView from './components/MatchingGameView';
import ListeningGameView from './components/ListeningGameView';
import VerbQuizView from './components/VerbQuizView';
import KanaGameView from './components/KanaGameView';
import DailyQuizView from './components/DailyQuizView';
import JLPTQuizView from './components/JLPTQuizView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [level, setLevel] = useState<JLPTLevel>('N5');
  const [session, setSession] = useState<StudySession>({ total: 50, completed: 35, currentLevel: 'N5' });
  const [words, setWords] = useState<Word[]>(MOCK_WORDS['N5']);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    setWords(MOCK_WORDS[level] || []);
    setCurrentWordIndex(0);
  }, [level]);

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView 
          session={session} 
          level={level} 
          setLevel={setLevel} 
          onStartLearning={() => setCurrentView('learn')}
          onStartGame={() => setCurrentView('game')}
          onStartListening={() => setCurrentView('listening')}
          onStartVerbQuiz={() => setCurrentView('verbQuiz')}
          onStartKanaGame={() => setCurrentView('kanaGame')}
          onStartDailyQuiz={() => setCurrentView('dailyQuiz')}
          onStartJLPTQuiz={() => setCurrentView('jlptQuiz')}
          onOpenProfile={() => setCurrentView('profile')}
        />;
      case 'learn':
        return <FlashcardView 
          words={words} 
          currentIndex={currentWordIndex} 
          onNext={() => setCurrentWordIndex(prev => (prev + 1) % words.length)}
          onPrev={() => setCurrentWordIndex(prev => (prev - 1 + words.length) % words.length)}
          onBack={() => setCurrentView('home')}
        />;
      case 'game':
        return <MatchingGameView 
          words={words}
          onBack={() => setCurrentView('home')}
        />;
      case 'listening':
        return <ListeningGameView 
          words={words}
          onBack={() => setCurrentView('home')}
        />;
      case 'verbQuiz':
        return <VerbQuizView 
          level={level}
          onBack={() => setCurrentView('home')}
        />;
      case 'kanaGame':
        return <KanaGameView 
          onBack={() => setCurrentView('home')}
        />;
      case 'dailyQuiz':
        return <DailyQuizView 
          onBack={() => setCurrentView('home')}
        />;
      case 'jlptQuiz':
        return <JLPTQuizView 
          level={level}
          onBack={() => setCurrentView('home')}
        />;
      default:
        return <HomeView 
          session={session} 
          level={level} 
          setLevel={setLevel} 
          onStartLearning={() => setCurrentView('learn')}
          onStartGame={() => setCurrentView('game')}
          onStartListening={() => setCurrentView('listening')}
          onStartVerbQuiz={() => setCurrentView('verbQuiz')}
          onStartKanaGame={() => setCurrentView('kanaGame')}
          onStartDailyQuiz={() => setCurrentView('dailyQuiz')}
          onStartJLPTQuiz={() => setCurrentView('jlptQuiz')}
          onOpenProfile={() => setCurrentView('profile')}
        />;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto relative overflow-hidden bg-sakura-50 shadow-2xl">
      {/* Decorative Sakura Elements */}
      <div className="absolute top-[-20px] left-[-20px] w-40 h-40 opacity-20 pointer-events-none">
        <img src="https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-contain" alt="" />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {renderView()}
      </main>
    </div>
  );
};

const HomeView: React.FC<{ 
  session: StudySession, 
  level: JLPTLevel, 
  setLevel: (l: JLPTLevel) => void,
  onStartLearning: () => void,
  onStartGame: () => void,
  onStartListening: () => void,
  onStartVerbQuiz: () => void,
  onStartKanaGame: () => void,
  onStartDailyQuiz: () => void,
  onStartJLPTQuiz: () => void,
  onOpenProfile: () => void
}> = ({ session, level, setLevel, onStartLearning, onStartGame, onStartListening, onStartVerbQuiz, onStartKanaGame, onStartDailyQuiz, onStartJLPTQuiz, onOpenProfile }) => {
  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">日本語単語マスター</h1>
          <p className="text-slate-500 mt-1">こんにちは、学習を始めましょう！</p>
        </div>
        <button onClick={onOpenProfile} className="w-10 h-10 rounded-full bg-sakura-100 flex items-center justify-center text-sakura-500 shadow-sm transition-transform hover:scale-105">
          <Settings size={20} />
        </button>
      </header>

      {/* Level Selection Section (Moved from Profile) */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-sakura-100">
        <div className="flex items-center space-x-3 mb-4">
          <BookOpen size={20} className="text-sakura-400" />
          <h3 className="font-bold text-slate-800">学習レベルを選択</h3>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {(['N5', 'N4', 'N3', 'N2', 'N1'] as JLPTLevel[]).map(l => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                level === l 
                ? 'bg-sakura-500 text-white shadow-md scale-105 ring-2 ring-sakura-200' 
                : 'bg-sakura-50 text-sakura-400 hover:bg-sakura-100'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </section>

      {/* Main Study Card (Preview) */}
      <div 
        onClick={onStartLearning}
        className="relative group cursor-pointer"
      >
        <div className="absolute inset-0 bg-sakura-200 rounded-[2.5rem] rotate-3 scale-95 opacity-50 transition-transform group-hover:rotate-1"></div>
        <div className="absolute inset-0 bg-sakura-100 rounded-[2.5rem] -rotate-3 scale-95 opacity-50 transition-transform group-hover:rotate-[-1deg]"></div>
        
        <div className="relative bg-white rounded-[2.5rem] p-8 shadow-xl border border-white flex flex-col items-center justify-center min-h-[300px] text-center">
          <div className="absolute top-4 right-6 text-sakura-300">
             <img src="https://cdn-icons-png.flaticon.com/512/3232/3232812.png" className="w-8 h-8 opacity-60" alt="sakura petal" />
          </div>
          <span className="text-sakura-500 font-bold bg-sakura-50 px-3 py-1 rounded-full text-sm mb-6">{level} 集中コース</span>
          <h3 className="text-6xl font-bold mb-4 text-slate-800">勉</h3>
          <p className="text-2xl text-slate-400 mb-8">べんきょう</p>
          <button className="bg-sakura-400 text-white font-bold py-3 px-10 rounded-full shadow-lg hover:bg-sakura-500 transition-colors">
            学習を続ける
          </button>
        </div>
      </div>

      {/* Quick Action Grid */}
      <section className="grid grid-cols-3 gap-3">
        <QuickAction 
          icon={<Mic className="text-blue-400" />} 
          label="発音練習" 
          onClick={onStartListening}
        />
        <QuickAction 
          icon={<PenTool className="text-green-400" />} 
          label="動詞活用" 
          onClick={onStartVerbQuiz}
        />
        <QuickAction 
          icon={<Keyboard className="text-orange-400" />} 
          label="50音練習" 
          onClick={onStartKanaGame}
        />
        <QuickAction 
          icon={<GraduationCap className="text-pink-600" />} 
          label="JLPT問題集" 
          onClick={onStartJLPTQuiz}
        />
        <QuickAction 
          icon={<Coffee className="text-amber-700" />} 
          label="生活単語" 
          onClick={onStartDailyQuiz}
        />
        <QuickAction 
          icon={<Gamepad2 className="text-purple-400" />} 
          label="ミニゲーム" 
          onClick={onStartGame}
        />
      </section>
    </div>
  );
};

const QuickAction: React.FC<{ icon: React.ReactNode, label: string, onClick?: () => void }> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center space-y-2 hover:opacity-80 transition-opacity active:scale-95">
    <div className="w-full aspect-square bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
      {icon}
    </div>
    <span className="text-[10px] font-medium text-slate-500">{label}</span>
  </button>
);

export default App;
