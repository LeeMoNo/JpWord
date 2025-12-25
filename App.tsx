
import React, { useState, useEffect } from 'react';
import { Home, BookOpen, BarChart3, User, Search, Settings, Mic, HelpCircle, Star, Gamepad2, ChevronRight, ChevronLeft, RefreshCw } from 'lucide-react';
import { ViewType, JLPTLevel, Word, StudySession } from './types';
import { MOCK_WORDS } from './constants';
import FlashcardView from './components/FlashcardView';
import StatsView from './components/StatsView';
import ProfileView from './components/ProfileView';
import SearchView from './components/SearchView';
import MatchingGameView from './components/MatchingGameView';
import ListeningGameView from './components/ListeningGameView';

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
      case 'stats':
        return <StatsView level={level} />;
      case 'search':
        return <SearchView />;
      case 'profile':
        return <ProfileView level={level} onLevelChange={setLevel} />;
      default:
        return <HomeView 
          session={session} 
          level={level} 
          setLevel={setLevel} 
          onStartLearning={() => setCurrentView('learn')}
          onStartGame={() => setCurrentView('game')}
          onStartListening={() => setCurrentView('listening')}
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
      <main className="flex-1 overflow-y-auto pb-24">
        {renderView()}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-20 bg-white/80 backdrop-blur-md border-t border-sakura-100 flex items-center justify-around px-6 z-50">
        <NavButton icon={<Home size={24} />} label="ホーム" active={currentView === 'home'} onClick={() => setCurrentView('home')} />
        <NavButton icon={<Search size={24} />} label="辞書" active={currentView === 'search'} onClick={() => setCurrentView('search')} />
        <NavButton icon={<BarChart3 size={24} />} label="進捗" active={currentView === 'stats'} onClick={() => setCurrentView('stats')} />
        <NavButton icon={<User size={24} />} label="アカウント" active={currentView === 'profile'} onClick={() => setCurrentView('profile')} />
      </nav>
    </div>
  );
};

const HomeView: React.FC<{ 
  session: StudySession, 
  level: JLPTLevel, 
  setLevel: (l: JLPTLevel) => void,
  onStartLearning: () => void,
  onStartGame: () => void,
  onStartListening: () => void
}> = ({ session, level, setLevel, onStartLearning, onStartGame, onStartListening }) => {
  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">日本語単語マスター</h1>
          <p className="text-slate-500 mt-1">こんにちは、学習を始めましょう！</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-sakura-100 flex items-center justify-center text-sakura-500 shadow-sm">
          <Settings size={20} />
        </button>
      </header>

      {/* Study Goals Section */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-sakura-100">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-xs font-bold text-sakura-400 uppercase tracking-wider">今日の目標</span>
            <h2 className="text-lg font-bold text-slate-800">50 単語</h2>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-slate-400">進捗: {session.completed}/{session.total}</span>
          </div>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-sakura-300 to-sakura-500 transition-all duration-1000" 
            style={{ width: `${(session.completed / session.total) * 100}%` }}
          />
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
      <section className="grid grid-cols-4 gap-4">
        <QuickAction 
          icon={<Mic className="text-blue-400" />} 
          label="発音練習" 
          onClick={onStartListening}
        />
        <QuickAction icon={<HelpCircle className="text-orange-400" />} label="ヒント" />
        <QuickAction icon={<Star className="text-yellow-400" />} label="お気に入り" />
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
    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
      {icon}
    </div>
    <span className="text-[10px] font-medium text-slate-500">{label}</span>
  </button>
);

const NavButton: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center space-y-1 transition-all ${active ? 'text-sakura-500 scale-110' : 'text-slate-400'}`}
  >
    {icon}
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

export default App;
