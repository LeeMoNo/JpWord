
import React from 'react';
import { JLPTLevel } from '../types';
import { User, LogOut, Shield, Bell, HelpCircle, ChevronRight, BookOpen } from 'lucide-react';

interface ProfileViewProps {
  level: JLPTLevel;
  onLevelChange: (l: JLPTLevel) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ level, onLevelChange }) => {
  const levels: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      {/* Profile Header */}
      <header className="flex flex-col items-center py-6">
        <div className="relative">
          <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-sakura-200 p-1">
             <img src="https://picsum.photos/seed/user/200/200" className="w-full h-full object-cover rounded-full" alt="avatar" />
          </div>
          <div className="absolute bottom-0 right-0 bg-sakura-500 text-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
            <Shield size={16} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mt-4">学習者さん</h2>
        <p className="text-sakura-500 font-bold bg-sakura-50 px-4 py-1 rounded-full text-xs mt-2">ゴールドメンバー</p>
      </header>

      {/* Level Selection Section */}
      <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-sakura-100">
        <div className="flex items-center space-x-3 mb-6">
          <BookOpen size={20} className="text-sakura-400" />
          <h3 className="font-bold text-slate-800">学習レベルを選択</h3>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {levels.map(l => (
            <button
              key={l}
              onClick={() => onLevelChange(l)}
              className={`h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all ${
                level === l 
                ? 'bg-sakura-500 text-white shadow-lg scale-105 ring-2 ring-sakura-200' 
                : 'bg-sakura-50 text-sakura-400 hover:bg-sakura-100'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </section>

      {/* Menu Settings */}
      <div className="space-y-4">
        <MenuButton icon={<Bell size={20} className="text-blue-400" />} label="通知設定" />
        <MenuButton icon={<Shield size={20} className="text-green-400" />} label="プライバシー" />
        <MenuButton icon={<HelpCircle size={20} className="text-purple-400" />} label="ヘルプ＆サポート" />
        <MenuButton icon={<LogOut size={20} className="text-red-400" />} label="ログアウト" danger />
      </div>

      <div className="text-center pt-4">
        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Version 1.2.4 (Sakura Edition)</p>
      </div>
    </div>
  );
};

const MenuButton: React.FC<{ icon: React.ReactNode, label: string, danger?: boolean }> = ({ icon, label, danger }) => (
  <button className="w-full flex items-center justify-between p-4 bg-white rounded-3xl shadow-sm border border-slate-50 hover:bg-slate-50 transition-colors">
    <div className="flex items-center space-x-4">
      <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center">
        {icon}
      </div>
      <span className={`font-bold ${danger ? 'text-red-500' : 'text-slate-700'}`}>{label}</span>
    </div>
    <ChevronRight size={18} className="text-slate-300" />
  </button>
);

export default ProfileView;
