import React, { useState } from 'react';
import { useAndroidSystem } from '../runtime/AndroidSystemContext';
import {
  Wifi,
  Volume2,
  Sun,
  Moon,
  Smartphone,
  HardDrive,
  Info,
  ChevronRight,
  ArrowLeft,
  Trash2,
  RotateCcw,
  Shield,
  Sliders,
} from 'lucide-react';

export function SystemSettingsApp() {
  const {
    wifiEnabled,
    toggleWifi,
    bluetoothEnabled,
    toggleBluetooth,
    airplaneMode,
    toggleAirplaneMode,
    brightness,
    setBrightness,
    isDarkMode,
    setDarkMode,
    volume,
    setVolume,
    installedApps,
    uninstallApp,
    batteryLevel,
    isCharging,
    restartDevice,
    showToast,
    allowUnknownSources,
    setAllowUnknownSources,
    launchApp,
  } = useAndroidSystem();

  const [currentSection, setCurrentSection] = useState<'main' | 'display' | 'apps' | 'about' | 'storage' | 'security'>('main');
  const [easterEggTaps, setEasterEggTaps] = useState(0);

  const handleAndroidVersionTap = () => {
    const next = easterEggTaps + 1;
    setEasterEggTaps(next);
    if (next >= 3) {
      setEasterEggTaps(0);
      showToast('Launching Android 10 Easter Egg!');
      launchApp('android10_easteregg');
    } else {
      showToast(`Tap ${3 - next} more times for Easter Egg`);
    }
  };

  return (
    <div id="system_settings_app" className="w-full h-full flex flex-col bg-slate-900 text-slate-100 select-none">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 border-b border-slate-700">
        {currentSection !== 'main' && (
          <button
            onClick={() => setCurrentSection('main')}
            className="p-1 -ml-1 text-slate-300 hover:text-white"
          >
            <ArrowLeft size={17} />
          </button>
        )}
        <h2 className="text-sm font-bold tracking-tight">
          {currentSection === 'main' && 'Settings'}
          {currentSection === 'display' && 'Display & Brightness'}
          {currentSection === 'apps' && 'Apps & Sideloading'}
          {currentSection === 'security' && 'Security & Unknown Apps'}
          {currentSection === 'storage' && 'Storage'}
          {currentSection === 'about' && 'About Emulated Phone'}
        </h2>
      </div>

      {/* Main Settings Menu */}
      <div className="flex-1 overflow-y-auto p-3">
        {currentSection === 'main' && (
          <div className="flex flex-col gap-2">
            {/* Quick toggles card */}
            <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/60 flex flex-col gap-2">
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${wifiEnabled ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                    <Wifi size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold block">Wi-Fi</span>
                    <span className="text-[10px] text-slate-400">{wifiEnabled ? 'Android-Virtual-AP (5GHz)' : 'Disconnected'}</span>
                  </div>
                </div>
                <button
                  onClick={toggleWifi}
                  className={`w-9 h-5 rounded-full transition-colors relative ${wifiEnabled ? 'bg-blue-600' : 'bg-slate-700'}`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${wifiEnabled ? 'left-4.5' : 'left-0.75'}`} />
                </button>
              </div>

              <div className="h-px bg-slate-700/60" />

              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${airplaneMode ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                    <Sliders size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold block">Airplane Mode</span>
                    <span className="text-[10px] text-slate-400">{airplaneMode ? 'All radios off' : 'Radios active'}</span>
                  </div>
                </div>
                <button
                  onClick={toggleAirplaneMode}
                  className={`w-9 h-5 rounded-full transition-colors relative ${airplaneMode ? 'bg-amber-600' : 'bg-slate-700'}`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${airplaneMode ? 'left-4.5' : 'left-0.75'}`} />
                </button>
              </div>
            </div>

            {/* Subpages navigation */}
            <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 overflow-hidden divide-y divide-slate-700/50">
              <button
                onClick={() => setCurrentSection('display')}
                className="w-full flex items-center justify-between p-3 hover:bg-slate-700/50 text-left transition"
              >
                <div className="flex items-center gap-3">
                  <Sun size={16} className="text-amber-400" />
                  <div>
                    <span className="text-xs font-semibold block">Display</span>
                    <span className="text-[10px] text-slate-400">Brightness, Dark theme</span>
                  </div>
                </div>
                <ChevronRight size={15} className="text-slate-500" />
              </button>

              <button
                onClick={() => setCurrentSection('apps')}
                className="w-full flex items-center justify-between p-3 hover:bg-slate-700/50 text-left transition"
              >
                <div className="flex items-center gap-3">
                  <Smartphone size={16} className="text-emerald-400" />
                  <div>
                    <span className="text-xs font-semibold block">Apps & APK Sideloads</span>
                    <span className="text-[10px] text-slate-400">{installedApps.length} packages installed</span>
                  </div>
                </div>
                <ChevronRight size={15} className="text-slate-500" />
              </button>

              <button
                onClick={() => setCurrentSection('security')}
                className="w-full flex items-center justify-between p-3 hover:bg-slate-700/50 text-left transition"
              >
                <div className="flex items-center gap-3">
                  <Shield size={16} className="text-blue-400" />
                  <div>
                    <span className="text-xs font-semibold block">Security & APK Sources</span>
                    <span className="text-[10px] text-slate-400">{allowUnknownSources ? 'Install unknown apps allowed' : 'Unknown apps restricted'}</span>
                  </div>
                </div>
                <ChevronRight size={15} className="text-slate-500" />
              </button>

              <button
                onClick={() => setCurrentSection('storage')}
                className="w-full flex items-center justify-between p-3 hover:bg-slate-700/50 text-left transition"
              >
                <div className="flex items-center gap-3">
                  <HardDrive size={16} className="text-purple-400" />
                  <div>
                    <span className="text-xs font-semibold block">Storage</span>
                    <span className="text-[10px] text-slate-400">Android 10 Scoped Storage active</span>
                  </div>
                </div>
                <ChevronRight size={15} className="text-slate-500" />
              </button>

              <button
                onClick={() => setCurrentSection('about')}
                className="w-full flex items-center justify-between p-3 hover:bg-slate-700/50 text-left transition"
              >
                <div className="flex items-center gap-3">
                  <Info size={16} className="text-teal-400" />
                  <div>
                    <span className="text-xs font-semibold block">About Emulated Phone</span>
                    <span className="text-[10px] text-slate-400">Pixel 4 • Android 10 (API 29)</span>
                  </div>
                </div>
                <ChevronRight size={15} className="text-slate-500" />
              </button>
            </div>

            {/* Restart button */}
            <button
              onClick={restartDevice}
              className="mt-2 w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-rose-400 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <RotateCcw size={13} />
              <span>Restart Virtual Android 10</span>
            </button>
          </div>
        )}

        {/* Display Subpage */}
        {currentSection === 'display' && (
          <div className="flex flex-col gap-3">
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 flex flex-col gap-2">
              <span className="text-xs font-semibold text-slate-200">Screen Brightness: {brightness}%</span>
              <div className="flex items-center gap-2">
                <Sun size={14} className="text-slate-400" />
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="flex-1 accent-emerald-500"
                />
                <Sun size={18} className="text-amber-400" />
              </div>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold block">Android 10 Dark Theme</span>
                <span className="text-[10px] text-slate-400">System-wide dark mode styling</span>
              </div>
              <button
                onClick={() => setDarkMode(!isDarkMode)}
                className={`w-9 h-5 rounded-full transition-colors relative ${isDarkMode ? 'bg-emerald-600' : 'bg-slate-700'}`}
              >
                <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${isDarkMode ? 'left-4.5' : 'left-0.75'}`} />
              </button>
            </div>
          </div>
        )}

        {/* Apps Subpage */}
        {currentSection === 'apps' && (
          <div className="flex flex-col gap-2">
            <span className="text-[11px] text-slate-400 uppercase font-semibold px-1">Installed APKs</span>
            {installedApps.map((app) => (
              <div
                key={app.id}
                className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {app.iconUrl ? (
                    <img src={app.iconUrl} alt="icon" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                      A
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-200 truncate">{app.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{app.packageName}</p>
                    <span className="text-[9px] text-slate-500">v{app.versionName} • Target SDK {app.apk.manifest.targetSdkVersion}</span>
                  </div>
                </div>

                <button
                  onClick={() => uninstallApp(app.id)}
                  title="Uninstall"
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-700 transition"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Security & Unknown Apps Subpage */}
        {currentSection === 'security' && (
          <div className="flex flex-col gap-3">
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold block text-white">Install Unknown Apps</span>
                <span className="text-[10px] text-slate-400">Allow sideloading APKs directly</span>
              </div>
              <button
                onClick={() => {
                  setAllowUnknownSources(!allowUnknownSources);
                  showToast(allowUnknownSources ? 'Unknown apps blocked' : 'Unknown apps allowed');
                }}
                className={`w-9 h-5 rounded-full transition-colors relative ${allowUnknownSources ? 'bg-emerald-600' : 'bg-slate-700'}`}
              >
                <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${allowUnknownSources ? 'left-4.5' : 'left-0.75'}`} />
              </button>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60 flex flex-col gap-1.5 text-xs">
              <span className="font-semibold text-emerald-400">Android 10 Privacy Protections</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                • Scoped Storage sandbox isolates APK files.<br />
                • Tri-state location permission: Foreground only.<br />
                • Background clipboard access restricted.
              </p>
            </div>
          </div>
        )}

        {/* Storage Subpage */}
        {currentSection === 'storage' && (
          <div className="flex flex-col gap-3">
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60">
              <span className="text-xs text-slate-400 block">Total Storage</span>
              <h3 className="text-xl font-bold text-slate-100 mt-0.5">22.4 GB used / 64 GB</h3>
              <div className="w-full h-2 bg-slate-700 rounded-full mt-2 overflow-hidden flex">
                <div className="w-[14%] bg-blue-500 h-full" title="Android 10 System" />
                <div className="w-[8%] bg-emerald-500 h-full" title="Sideloaded APKs" />
                <div className="w-[3%] bg-amber-500 h-full" title="Cache & Dalvik" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-2">
                <span>System 10 (8.9 GB)</span>
                <span>APKs (5.1 GB)</span>
                <span>Scoped Storage (8.4 GB)</span>
              </div>
            </div>
          </div>
        )}

        {/* About Subpage */}
        {currentSection === 'about' && (
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-3 flex flex-col gap-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-700">
              <span className="text-slate-400">Device Name</span>
              <span className="font-semibold text-slate-200">Google Pixel 4</span>
            </div>
            <div
              onClick={handleAndroidVersionTap}
              className="flex justify-between py-1 border-b border-slate-700 cursor-pointer hover:bg-slate-700/40 px-1 rounded transition"
              title="Tap 3 times for Android 10 Easter Egg!"
            >
              <span className="text-slate-400">Android Version</span>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-emerald-400">10 (API Level 29)</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1 rounded border border-emerald-800">Q</span>
              </div>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-700">
              <span className="text-slate-400">Build Number</span>
              <span className="font-mono text-[11px] text-slate-300">QQ3A.200805.001</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-700">
              <span className="text-slate-400">Security Patch</span>
              <span className="text-slate-300">August 5, 2020</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-700">
              <span className="text-slate-400">Kernel Version</span>
              <span className="font-mono text-[10px] text-slate-300">4.14.150-android-10-q</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-700">
              <span className="text-slate-400">VM Runtime</span>
              <span className="text-slate-200 font-mono text-[11px]">Android 10 ART / Dalvik VM</span>
            </div>
            <button
              onClick={() => {
                showToast('Launching Android 10 Easter Egg!');
                launchApp('android10_easteregg');
              }}
              className="mt-2 py-2 bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-700/60 text-emerald-300 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <span>Launch Android 10 Easter Egg</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
