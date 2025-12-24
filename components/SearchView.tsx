
import React, { useState } from 'react';
import { Search, Mic, ArrowLeft, History, TrendingUp, Sparkles } from 'lucide-react';

const SearchView: React.FC = () => {
  const [query, setQuery] = useState('');

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="relative group">
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="単語、漢字、読み方で検索..."
          className="w-full bg-white h-16 rounded-[2rem] px-14 border border-sakura-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-sakura-200 transition-all text-lg"
        />
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-sakura-400" size={20} />
        <Mic className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-sakura-500 cursor-pointer" size={20} />
      </div>

      {!query ? (
        <div className="space-y-10">
          <section className="space-y-4">
            <div className="flex items-center space-x-2 text-slate-400 font-bold text-xs uppercase tracking-widest px-2">
              <History size={14} />
              <span>最近の検索</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['夏祭り', 'ひまわり', '花火', '涼しい'].map(tag => (
                <span key={tag} className="bg-white px-4 py-2 rounded-full text-sm font-bold text-slate-600 border border-slate-100 hover:border-sakura-200 cursor-pointer transition-colors">
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center space-x-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                <TrendingUp size={14} />
                <span>トレンド単語</span>
              </div>
              <Sparkles size={14} className="text-yellow-400" />
            </div>
            <div className="space-y-3">
              {[
                { word: '憧れ', kana: 'あこがれ', mean: 'Admiration/Yearning' },
                { word: '絆', kana: 'きずな', mean: 'Bonds/Connections' },
                { word: '一生懸命', kana: 'いっしょうけんめい', mean: 'With all one\'s effort' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-3xl border border-white shadow-sm group hover:scale-[1.02] transition-transform cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-bold text-sakura-300 w-6">0{idx + 1}</span>
                    <div>
                      <h4 className="font-bold text-slate-800">{item.word}</h4>
                      <p className="text-[10px] text-slate-400 font-medium uppercase">{item.kana}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400">{item.mean}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
           <img src="https://images.unsplash.com/photo-1542332213-31f87348057f?auto=format&fit=crop&q=80&w=200" className="w-40 h-40 object-contain grayscale mb-4" alt="not found" />
           <p className="font-bold text-slate-600">「{query}」の検索結果を読み込んでいます...</p>
        </div>
      )}
    </div>
  );
};

export default SearchView;
