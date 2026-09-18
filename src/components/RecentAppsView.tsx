import React from 'react';
import { useAndroidSystem } from '../runtime/AndroidSystemContext';
import { X, Trash2, Smartphone } from 'lucide-react';

export function RecentAppsView() {
  const {
    runningApps,
    installedApps,
    launchApp,
    closeApp,
    clearAllRecents,
    closeRecents,
  } = useAndroidSystem();

  const runningAppObjs = runningApps
    .map((id) => {
      if (id === 'system_settings') {
        return {
          id: 'system_settings',
          name: 'Settings',
          packageName: 'com.android.settings',
          iconUrl: undefined,
        };
      }
      return installedApps.find((a) => a.id === id);
    })
    .filter(Boolean);

  return (
    <div
      id="recent_apps_view"
      onClick={closeRecents}
      className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-40 flex flex-col justify-between p-4 animate-in fade-in duration-150"
    >
      <div className="flex justify-between items-center text-white/80 pt-2 px-2">
        <span className="text-xs font-semibold uppercase tracking-wider">Overview Tasks</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            closeRecents();
          }}
          className="text-xs text-slate-300 hover:text-white px-2 py-1"
        >
          Done
        </button>
      </div>

      {runningAppObjs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Smartphone size={32} className="opacity-40" />
          <p className="text-xs font-medium">No recent items</p>
        </div>
      ) : (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex-1 flex items-center justify-center overflow-x-auto gap-4 py-6 scrollbar-none"
        >
          {runningAppObjs.map((app) => (
            <div
              key={app!.id}
              onClick={() => launchApp(app!.id)}
              className="relative w-56 h-80 bg-slate-800 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden shrink-0 cursor-pointer hover:border-emerald-500/50 hover:scale-[1.02] transition"
            >
              {/* Card top bar */}
              <div className="flex items-center justify-between p-2.5 bg-slate-900 border-b border-slate-700/60">
                <div className="flex items-center gap-2 min-w-0">
                  {app!.iconUrl ? (
                    <img src={app!.iconUrl} alt="icon" className="w-5 h-5 rounded object-cover" />
                  ) : (
                    <div className="w-5 h-5 rounded bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white">
                      {app!.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-200 truncate">{app!.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeApp(app!.id);
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Card preview representation */}
              <div className="flex-1 bg-gradient-to-b from-slate-850 to-slate-900 p-3 flex flex-col justify-center items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-2 shadow">
                  {app!.iconUrl ? (
                    <img src={app!.iconUrl} alt="icon" className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <Smartphone size={24} className="text-emerald-400" />
                  )}
                </div>
                <span className="text-xs font-semibold text-slate-300">{app!.name}</span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5">{app!.packageName}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clear All Button */}
      {runningAppObjs.length > 0 && (
        <div className="flex justify-center pb-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearAllRecents();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-xs font-semibold border border-slate-700 shadow-lg active:scale-95 transition"
          >
            <Trash2 size={13} />
            <span>Clear all</span>
          </button>
        </div>
      )}
    </div>
  );
}
