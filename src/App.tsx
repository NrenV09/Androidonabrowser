import React, { useState, useRef, useEffect } from 'react';
import { AndroidSystemProvider, useAndroidSystem } from './runtime/AndroidSystemContext';
import { AndroidPhoneFrame } from './components/AndroidPhoneFrame';
import { ApkInspectorPanel } from './components/ApkInspectorPanel';
import { parseApkFile } from './utils/apkParser';
import { SAMPLE_APKS, generateSampleApk } from './utils/sampleApks';
import {
  FileUp,
  Maximize2,
  Minimize2,
  Sparkles,
  Terminal,
  Power,
  X,
  ChevronDown,
  Navigation,
  DownloadCloud,
} from 'lucide-react';

function EmulatorScreen() {
  const {
    isPowerOn,
    togglePower,
    sideloadApkPrompt,
    showToast,
    navMode,
    setNavMode,
    installApk,
    launchApp,
  } = useAndroidSystem();

  // Mode: 'fullscreen' (edge-to-edge Android display) or 'bezel' (Pixel 4 hardware chassis)
  const [screenMode, setScreenMode] = useState<'bezel' | 'fullscreen'>('bezel');
  const [showInspectorDrawer, setShowInspectorDrawer] = useState(false);
  const [showSamplesMenu, setShowSamplesMenu] = useState(false);
  const [isWindowDragOver, setIsWindowDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Prevent default drag and drop behavior & enable global file drop
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsWindowDragOver(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      // Only dismiss if leaving viewport
      if (!e.relatedTarget || (e.clientX <= 0 || e.clientY <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {
        setIsWindowDragOver(false);
      }
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      setIsWindowDragOver(false);
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        showToast(`Reading ${file.name}...`);
        try {
          const parsed = await parseApkFile(file);
          sideloadApkPrompt(parsed);
        } catch (err) {
          console.error(err);
          showToast('Could not sideload file');
        }
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [sideloadApkPrompt, showToast]);

  // Handle direct file upload via file picker
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      showToast(`Reading ${file.name}...`);
      try {
        const parsed = await parseApkFile(file);
        sideloadApkPrompt(parsed);
      } catch (err) {
        console.error(err);
        showToast('Error reading APK file');
      }
      e.target.value = '';
    }
  };

  const handleSideloadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSelectSample = async (sample: typeof SAMPLE_APKS[0]) => {
    setShowSamplesMenu(false);
    showToast(`Staging ${sample.name}...`);
    try {
      const parsed = await generateSampleApk(sample);
      sideloadApkPrompt(parsed);
    } catch {
      showToast('Error staging sample APK');
    }
  };

  return (
    <div
      id="android_emulator_root"
      className="fixed inset-0 w-screen h-screen overflow-hidden overscroll-none touch-none select-none bg-slate-950 text-slate-100 flex items-center justify-center"
    >
      {/* Hidden Native File Input for Direct APK Sideloading */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".apk,.xapk,.zip,*"
        className="hidden"
      />

      {/* Sleek Floating Control Pill - Ultra minimal, non-intrusive */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 p-1 px-2.5 bg-slate-900/85 hover:bg-slate-900/95 backdrop-blur-md rounded-full border border-slate-800/90 shadow-xl transition">
        {/* Sideload .APK Primary Action */}
        <button
          id="btn_sideload_apk"
          onClick={handleSideloadClick}
          title="Sideload custom .APK from computer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-full text-xs font-semibold shadow-md shadow-emerald-950 transition"
        >
          <FileUp size={13} />
          <span>Sideload .APK</span>
        </button>

        {/* Quick Sample APKs Dropdown */}
        <div className="relative">
          <button
            id="btn_sample_apks_toggle"
            onClick={() => setShowSamplesMenu(!showSamplesMenu)}
            title="Sample Pre-built APKs"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-full transition"
          >
            <Sparkles size={13} className="text-amber-400" />
            <span className="hidden sm:inline">Samples</span>
            <ChevronDown size={11} className="text-slate-400" />
          </button>

          {showSamplesMenu && (
            <div className="absolute top-full left-0 mt-1.5 w-48 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-1.5 flex flex-col gap-0.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <span className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                Select APK to Sideload
              </span>
              {SAMPLE_APKS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSample(s)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-left text-slate-200 hover:bg-slate-800 hover:text-white transition"
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="truncate">{s.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-slate-800 mx-0.5" />

        {/* Fullscreen / Bezel Toggle */}
        <button
          id="btn_fullscreen_toggle"
          onClick={() => setScreenMode(screenMode === 'fullscreen' ? 'bezel' : 'fullscreen')}
          title={screenMode === 'fullscreen' ? 'Switch to Pixel 4 Bezel Chassis' : 'Switch to Edge-to-Edge Fullscreen'}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition ${
            screenMode === 'fullscreen'
              ? 'bg-blue-600 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          {screenMode === 'fullscreen' ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          <span className="hidden md:inline">{screenMode === 'fullscreen' ? 'Bezel' : 'Fullscreen'}</span>
        </button>

        {/* Navigation Mode (Gestures vs 3-Button) */}
        <button
          id="btn_nav_mode_toggle"
          onClick={() => setNavMode(navMode === 'gestures' ? 'buttons' : 'gestures')}
          title={`Currently using ${navMode === 'gestures' ? 'Android 10 Full Gestures' : '3-Button Navigation'}. Click to toggle.`}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-full transition"
        >
          <Navigation size={12} className={navMode === 'gestures' ? 'text-emerald-400' : 'text-slate-400'} />
          <span className="hidden lg:inline">{navMode === 'gestures' ? 'Gestures' : '3-Buttons'}</span>
        </button>

        {/* ADB Terminal Drawer Toggle */}
        <button
          id="btn_adb_drawer_toggle"
          onClick={() => setShowInspectorDrawer(!showInspectorDrawer)}
          title="ADB Terminal & Logcat Console"
          className={`p-1.5 rounded-full text-xs transition ${
            showInspectorDrawer ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <Terminal size={14} />
        </button>

        {/* Power Toggle */}
        <button
          id="btn_power_toggle"
          onClick={togglePower}
          title={isPowerOn ? 'Turn Screen Off / Sleep' : 'Power On / Wake Up'}
          className={`p-1.5 rounded-full text-xs transition ${
            isPowerOn ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800/80' : 'text-emerald-400 hover:bg-emerald-950'
          }`}
        >
          <Power size={14} />
        </button>
      </div>

      {/* Main Virtual Phone Display Stage - Clean, Uncluttered, Edge-to-Edge or Center Fitted */}
      <main className="w-full h-full flex items-center justify-center overflow-hidden p-0">
        <AndroidPhoneFrame mode={screenMode} />
      </main>

      {/* Full-Window Drag & Drop APK Overlay */}
      {isWindowDragOver && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center border-4 border-dashed border-emerald-400 pointer-events-none animate-in fade-in duration-150">
          <DownloadCloud size={64} className="text-emerald-400 animate-bounce mb-4" />
          <h2 className="text-2xl font-bold text-white">Drop .APK to Sideload</h2>
          <p className="text-sm text-emerald-200/90 max-w-md mt-1.5">
            Release to stage and install in the virtual Android 10 runtime
          </p>
        </div>
      )}

      {/* Optional ADB Terminal & Inspector Slide-over Drawer (Cleanly Hidden by Default) */}
      {showInspectorDrawer && (
        <div
          id="adb_drawer_backdrop"
          onClick={() => setShowInspectorDrawer(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
        >
          <div
            id="adb_drawer_content"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-250"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  ADB Terminal & DevTools
                </h3>
              </div>
              <button
                onClick={() => setShowInspectorDrawer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Inspector Body */}
            <div className="flex-1 overflow-hidden">
              <ApkInspectorPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AndroidSystemProvider>
      <EmulatorScreen />
    </AndroidSystemProvider>
  );
}
