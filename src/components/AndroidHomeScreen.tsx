import React, { useState } from 'react';
import { useAndroidSystem } from '../runtime/AndroidSystemContext';
import { Search, Settings, Phone, MessageSquare, Camera, Globe, ChevronUp, Sparkles } from 'lucide-react';

export function AndroidHomeScreen() {
  const { installedApps, launchApp, setInspectedApk, showToast } = useAndroidSystem();
  const [showAppDrawer, setShowAppDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const filteredApps = installedApps.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      id="android_home_screen"
      className="relative w-full h-full flex flex-col justify-between p-4 select-none overflow-hidden"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 20%, #1e293b 0%, #0f172a 100%)',
      }}
    >
      {/* Dynamic Background Glow / Wallpaper */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-500/10 via-transparent to-indigo-500/15 pointer-events-none" />

      {/* Top At-A-Glance Widget */}
      <div className="relative z-10 pt-4 px-1">
        <div className="flex flex-col text-white drop-shadow">
          <span className="text-xs font-medium tracking-wide text-slate-200">{dateString}</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-2xl font-light tracking-tight text-white">72°F</span>
            <span className="text-xs text-slate-300">Sunny • Mountain View</span>
          </div>
        </div>
      </div>

      {/* Main Apps Grid (Top page) */}
      <div className="relative z-10 grid grid-cols-4 gap-y-4 gap-x-2 my-auto px-1">
        {installedApps.slice(0, 8).map((app) => (
          <button
            key={app.id}
            id={`home_app_${app.id}`}
            onClick={() => launchApp(app.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              setInspectedApk(app.apk);
              showToast(`Inspecting ${app.name} APK`);
            }}
            className="flex flex-col items-center gap-1.5 p-1 rounded-xl active:scale-95 transition group"
          >
            <div className="relative w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center overflow-hidden bg-slate-800 border border-white/10 group-hover:border-emerald-400/50 transition">
              {app.iconUrl ? (
                <img src={app.iconUrl} alt={app.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-emerald-600 flex items-center justify-center text-white font-bold text-base">
                  {app.name.charAt(0)}
                </div>
              )}
            </div>
            <span className="text-[11px] font-medium text-white/90 drop-shadow text-center truncate max-w-[64px] leading-tight">
              {app.name}
            </span>
          </button>
        ))}

        {/* Settings shortcut */}
        <button
          id="home_app_settings"
          onClick={() => launchApp('system_settings')}
          className="flex flex-col items-center gap-1.5 p-1 rounded-xl active:scale-95 transition"
        >
          <div className="w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center bg-slate-800 text-slate-200 border border-white/10">
            <Settings size={24} />
          </div>
          <span className="text-[11px] font-medium text-white/90 drop-shadow text-center truncate max-w-[64px] leading-tight">
            Settings
          </span>
        </button>
      </div>

      {/* Bottom Launcher Bar & Dock */}
      <div className="relative z-10 flex flex-col gap-3">
        {/* Google Search Widget */}
        <div
          onClick={() => setShowAppDrawer(true)}
          className="w-full py-2.5 px-4 bg-white/15 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/15 flex items-center gap-2.5 shadow-md cursor-pointer transition"
        >
          <Search size={16} className="text-white/80" />
          <span className="text-xs text-white/70 font-medium">Search apps & APKs...</span>
        </div>

        {/* Dock Icons */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-2 border border-white/10 flex items-center justify-around">
          <button
            onClick={() => showToast('Phone dialer')}
            className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow active:scale-95 transition"
          >
            <Phone size={20} />
          </button>
          <button
            onClick={() => showToast('Messages')}
            className="w-11 h-11 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow active:scale-95 transition"
          >
            <MessageSquare size={20} />
          </button>
          <button
            onClick={() => setShowAppDrawer(true)}
            title="App Drawer"
            className="w-11 h-11 rounded-2xl bg-white/20 text-white flex items-center justify-center shadow active:scale-95 transition"
          >
            <ChevronUp size={22} />
          </button>
          <button
            onClick={() => showToast('Browser')}
            className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow active:scale-95 transition"
          >
            <Globe size={20} />
          </button>
          <button
            onClick={() => showToast('Camera')}
            className="w-11 h-11 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow active:scale-95 transition"
          >
            <Camera size={20} />
          </button>
        </div>
      </div>

      {/* App Drawer Slide-Up Modal */}
      {showAppDrawer && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl z-30 flex flex-col p-4 animate-in fade-in slide-in-from-bottom-6 duration-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 relative">
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search all installed APKs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-800 rounded-xl text-xs text-white border border-slate-700 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              onClick={() => setShowAppDrawer(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto grid grid-cols-4 gap-4 p-1">
            {filteredApps.map((app) => (
              <button
                key={app.id}
                onClick={() => {
                  setShowAppDrawer(false);
                  launchApp(app.id);
                }}
                className="flex flex-col items-center gap-1.5 p-1 rounded-xl active:scale-95 transition"
              >
                <div className="w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center overflow-hidden bg-slate-800 border border-white/10">
                  {app.iconUrl ? (
                    <img src={app.iconUrl} alt={app.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-emerald-600 flex items-center justify-center text-white font-bold text-base">
                      {app.name.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-medium text-white/90 text-center truncate max-w-[64px] leading-tight">
                  {app.name}
                </span>
              </button>
            ))}

            <button
              onClick={() => {
                setShowAppDrawer(false);
                launchApp('system_settings');
              }}
              className="flex flex-col items-center gap-1.5 p-1 rounded-xl active:scale-95 transition"
            >
              <div className="w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center bg-slate-800 text-slate-200 border border-white/10">
                <Settings size={24} />
              </div>
              <span className="text-[11px] font-medium text-white/90 text-center truncate max-w-[64px] leading-tight">
                Settings
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
