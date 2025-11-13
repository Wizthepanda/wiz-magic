import React from 'react';

const card = 'bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-violet-100/40 px-5 py-6';

export default function RightInsightsPanel() {
  return (
    <aside className="px-6 py-6 space-y-6">
      {/* Trending Communities */}
      <div className={card}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-800">Trending Communities</h3>
        </div>
        <div className="space-y-3">
          {[{name:'Faceless Avatars', growth:72},{name:'Design Wizards',growth:54},{name:'Crypto Kings',growth:41}].map((c)=> (
            <div key={c.name} className="flex items-center justify-between">
              <span className="text-sm text-slate-700">{c.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 rounded-full bg-violet-100 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-pink-500" style={{ width: `${c.growth}%` }} />
                </div>
                <span className="text-xs text-gray-500">+{c.growth}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Contributors */}
      <div className={card}>
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Top Contributors</h3>
        <div className="space-y-3">
          {[{name:'Ale', xp:420, avatar:'/Profile Pics/Ale.jpg'}, {name:'Kai', xp:360, avatar:'/Profile Pics/Ale.jpg'}, {name:'Naya', xp:320, avatar:'/Profile Pics/Ale.jpg'}].map((u)=> (
            <div key={u.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                <span className="text-sm text-slate-700">{u.name}</span>
              </div>
              <span className="text-xs font-medium text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">{u.xp} ZAPs</span>
            </div>
          ))}
        </div>
      </div>

      {/* Creator Spotlight */}
      <div className={card}>
        <div className="rounded-2xl p-4 bg-gradient-to-br from-violet-500 to-pink-500 text-white">
          <div className="flex items-center gap-3">
            <img src="/Profile Pics/Ale.jpg" alt="Spotlight" className="w-10 h-10 rounded-full object-cover ring-2 ring-white/40" />
            <div>
              <div className="font-semibold">Creator Spotlight</div>
              <div className="text-xs text-white/80">@facelessavatars</div>
            </div>
          </div>
          <button className="mt-4 w-full py-2 text-sm font-medium rounded-full bg-white/90 text-slate-800 hover:bg-white">View Profile</button>
        </div>
      </div>
    </aside>
  );
}
