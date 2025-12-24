
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { JLPTLevel } from '../types';
import { Trophy, Calendar, Target, Flame } from 'lucide-react';

const data = [
  { name: '月', count: 20 },
  { name: '火', count: 45 },
  { name: '水', count: 30 },
  { name: '木', count: 65 },
  { name: '金', count: 50 },
  { name: '土', count: 80 },
  { name: '日', count: 95 },
];

const StatsView: React.FC<{ level: JLPTLevel }> = ({ level }) => {
  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">学習進捗</h1>
        <p className="text-slate-500 mt-1">あなたの努力は実を結んでいます！</p>
      </header>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={<Flame size={20} className="text-orange-500" />} label="ストリーク" value="12 日" bg="bg-orange-50" />
        <StatCard icon={<Trophy size={20} className="text-yellow-500" />} label="習得語彙" value="1,240" bg="bg-yellow-50" />
        <StatCard icon={<Calendar size={20} className="text-blue-500" />} label="学習日数" value="48 日" bg="bg-blue-50" />
        <StatCard icon={<Target size={20} className="text-green-500" />} label="平均正解率" value="88%" bg="bg-green-50" />
      </div>

      {/* Chart Section */}
      <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-sakura-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6">週間学習レポート</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff99ad" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ff99ad" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ stroke: '#ff99ad', strokeWidth: 2 }}
              />
              <Area type="monotone" dataKey="count" stroke="#ff335c" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Achievements */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 px-2">実績バッジ</h3>
        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          <Badge icon="🌸" label="初心者" unlocked={true} />
          <Badge icon="🏮" label="夜型" unlocked={true} />
          <Badge icon="🗻" label="頂上へ" unlocked={false} />
          <Badge icon="🍣" label="日本通" unlocked={false} />
          <Badge icon="🎋" label="願い事" unlocked={false} />
        </div>
      </section>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, bg: string }> = ({ icon, label, value, bg }) => (
  <div className={`${bg} rounded-3xl p-5 flex flex-col justify-between h-32 border border-white/50 shadow-sm`}>
    <div className="p-2 bg-white rounded-xl w-fit shadow-xs">{icon}</div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const Badge: React.FC<{ icon: string, label: string, unlocked: boolean }> = ({ icon, label, unlocked }) => (
  <div className={`flex-shrink-0 w-24 h-28 rounded-3xl flex flex-col items-center justify-center space-y-2 border transition-all ${unlocked ? 'bg-white border-sakura-100' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
    <span className="text-4xl">{icon}</span>
    <span className="text-[10px] font-bold text-slate-600">{label}</span>
  </div>
);

export default StatsView;
