import React, { useState } from 'react';
import { AndroidSystemProvider, useAndroidSystem } from './runtime/AndroidSystemContext';
import { AndroidPhoneFrame } from './components/AndroidPhoneFrame';
import { ApkInspectorPanel } from './components/ApkInspectorPanel';
import { TopBar } from './components/TopBar';
import { ApkUploadModal } from './components/ApkUploadModal';
import { SAMPLE_APKS, generateSampleApk } from './utils/sampleApks';
import {
  Smartphone,
  Cpu,
  Layers,
  Sparkles,
  Terminal,
  FileUp,
  RotateCw,
  CheckCircle,
} from 'lucide-react';

function AppContent() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { isInitializing, installApk, launchApp, setInspectedApk, showToast } = useAndroidSystem();

  const handleQuickLoad = async (sample: typeof SAMPLE_APKS[0]) => {
    try {
      const parsed = await generateSampleApk(sample);
      await installApk(parsed);
      launchApp(parsed.id);
      setInspectedApk(parsed);
    } catch {
      showToast('Error loading sample APK');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Application Bar */}
      <TopBar onOpenUpload={() => setIsUploadModalOpen(true)} />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Virtual Android Phone Workspace */}
        <div
          id="virtual_phone_stage"
          className="flex-1 min-w-0 flex flex-col items-center justify-between p-4 overflow-y-auto bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950/60"
        >
          {/* Quick Preload Sample Badges Bar */}
          <div className="w-full max-w-xl flex items-center justify-between gap-2 px-2 py-1 mb-1 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Sparkles size={13} className="text-amber-400" />
              <span className="font-semibold text-slate-300">Quick Test APK:</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              {SAMPLE_APKS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleQuickLoad(s)}
                  className="px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-lg text-[11px] font-medium text-slate-300 hover:text-white transition shrink-0 flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span>{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Virtual Phone Canvas */}
          <div className="my-auto py-2">
            <AndroidPhoneFrame />
          </div>

          {/* Bottom Device Tips & Status */}
          <div className="w-full max-w-md bg-slate-900/70 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-2.5 px-4 flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Dalvik/ART WebAssembly JIT active</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
              >
                <FileUp size={12} />
                <span>Upload custom .apk</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: APK Inspector & DevTools Studio Panel */}
        <div className="w-full lg:w-[480px] xl:w-[540px] shrink-0 h-[480px] lg:h-full flex flex-col border-t lg:border-t-0 lg:border-l border-slate-800">
          <ApkInspectorPanel />
        </div>
      </div>

      {/* APK Upload Modal */}
      <ApkUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AndroidSystemProvider>
      <AppContent />
    </AndroidSystemProvider>
  );
}
