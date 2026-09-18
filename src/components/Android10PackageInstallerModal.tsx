import React, { useState, useEffect } from 'react';
import { ParsedApk } from '../types/apk';
import { useAndroidSystem } from '../runtime/AndroidSystemContext';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Package,
  Layers,
  Settings,
  HardDrive,
  MapPin,
  Camera,
  Mic,
  Wifi,
  Loader2,
} from 'lucide-react';

interface Android10PackageInstallerModalProps {
  apk: ParsedApk | null;
  onCancel: () => void;
  onInstalled: (appId: string) => void;
}

export function Android10PackageInstallerModal({
  apk,
  onCancel,
  onInstalled,
}: Android10PackageInstallerModalProps) {
  const {
    installApk,
    allowUnknownSources,
    setAllowUnknownSources,
    addLog,
    vibrateDevice,
    showToast,
  } = useAndroidSystem();

  const [stage, setStage] = useState<'staging' | 'prompt' | 'unknown_blocked' | 'installing' | 'finished'>('staging');
  const [showPermissions, setShowPermissions] = useState(false);
  const [installProgress, setInstallProgress] = useState(15);
  const [installedAppId, setInstalledAppId] = useState<string | null>(null);

  // Staging phase
  useEffect(() => {
    if (!apk) {
      setStage('staging');
      return;
    }

    setStage('staging');
    setInstallProgress(15);

    const timer = setTimeout(() => {
      if (!allowUnknownSources) {
        setStage('unknown_blocked');
        addLog('W', 'PackageInstaller', `Blocked install from unknown source for: ${apk.manifest.packageName}`);
      } else {
        setStage('prompt');
        addLog('I', 'PackageInstaller', `Staged package: ${apk.manifest.packageName} (v${apk.manifest.versionName})`);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [apk, allowUnknownSources, addLog]);

  if (!apk) return null;

  const handleStartInstall = async () => {
    vibrateDevice(20);
    setStage('installing');
    addLog('I', 'PackageManager', `dex2oat --dex-file=${apk.fileName} --oat-file=/data/dalvik-cache/arm64/...`);

    // Simulated dex2oat compilation progress
    const p1 = setTimeout(() => setInstallProgress(45), 250);
    const p2 = setTimeout(() => setInstallProgress(75), 500);

    try {
      const app = await installApk(apk);
      setInstalledAppId(app.id);

      setTimeout(() => {
        setInstallProgress(100);
        setStage('finished');
        vibrateDevice(35);
        addLog('I', 'PackageInstaller', `App installed successfully: ${app.packageName}`);
      }, 700);
    } catch (e) {
      showToast('Installation failed');
      onCancel();
    }
  };

  const handleOpenApp = () => {
    if (installedAppId) {
      onInstalled(installedAppId);
    } else {
      onCancel();
    }
  };

  return (
    <div
      id="android10_package_installer_backdrop"
      className="absolute inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-2 animate-in fade-in duration-150"
    >
      <div
        id="android10_package_installer_sheet"
        className="w-full max-w-sm bg-slate-900 border border-slate-700/90 rounded-3xl p-4 text-slate-100 shadow-2xl flex flex-col gap-3.5 select-none"
      >
        {/* Android 10 Package Installer Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Package size={13} />
            </div>
            <span className="text-[11px] font-mono text-slate-300 font-bold uppercase tracking-wider">
              Package Installer • Android 10
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">API 29</span>
        </div>

        {/* State 1: Staging APK */}
        {stage === 'staging' && (
          <div className="py-6 flex flex-col items-center justify-center gap-3">
            <Loader2 size={30} className="animate-spin text-emerald-400" />
            <span className="text-xs font-semibold text-slate-200">Staging application...</span>
            <span className="text-[10px] text-slate-400 font-mono">{apk.fileName}</span>
          </div>
        )}

        {/* State 2: Unknown Sources Security Block (Android 10 Signature Security) */}
        {stage === 'unknown_blocked' && (
          <div className="flex flex-col gap-3 py-1">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <ShieldAlert size={22} />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white">Install unknown apps?</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  For your security, your phone is not allowed to install unknown apps from this source.
                </p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">Android 10 Security:</span> Sideloaded APKs require explicit authorization from Settings.
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setAllowUnknownSources(true);
                  vibrateDevice(25);
                  showToast('Allowed unknown apps for this session');
                  addLog('I', 'SecurityManager', 'Granted REQUEST_INSTALL_PACKAGES authorization');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition"
              >
                <Settings size={13} />
                <span>Allow from this source</span>
              </button>
            </div>
          </div>
        )}

        {/* State 3: Installation Confirmation Prompt */}
        {stage === 'prompt' && (
          <div className="flex flex-col gap-3 py-1">
            {/* App metadata header */}
            <div className="flex items-center gap-3 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                {apk.iconUrl ? (
                  <img src={apk.iconUrl} alt="icon" className="w-full h-full object-cover" />
                ) : (
                  <Package size={24} className="text-emerald-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-white truncate">{apk.manifest.appName}</h3>
                <p className="text-[11px] text-slate-400 font-mono truncate">{apk.manifest.packageName}</p>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                  <span>v{apk.manifest.versionName}</span>
                  <span>•</span>
                  <span>{(apk.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">Target SDK {apk.manifest.targetSdkVersion}</span>
                </div>
              </div>
            </div>

            {/* Question */}
            <div className="px-1">
              <p className="text-xs text-slate-300">
                Do you want to install this application? It will get access to requested Android 10 capabilities.
              </p>
            </div>

            {/* Collapsible Permissions list */}
            <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-hidden">
              <button
                onClick={() => setShowPermissions(!showPermissions)}
                className="w-full px-3 py-2 flex items-center justify-between text-[11px] font-semibold text-slate-300 hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>Permissions ({apk.manifest.permissions.length})</span>
                </div>
                {showPermissions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showPermissions && (
                <div className="p-3 pt-1 border-t border-slate-800/60 max-h-36 overflow-y-auto flex flex-col gap-2 text-[10px]">
                  {apk.manifest.permissions.length === 0 ? (
                    <span className="text-slate-500 italic">No special permissions requested.</span>
                  ) : (
                    apk.manifest.permissions.map((p, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                        <div>
                          <span className="font-mono font-semibold text-slate-200">{p.shortName}</span>
                          <p className="text-slate-400 leading-tight">{p.description}</p>
                        </div>
                      </div>
                    ))
                  )}
                  {/* Android 10 Scoped Storage notice */}
                  <div className="mt-1 pt-1.5 border-t border-slate-800 flex items-center gap-2 text-slate-400 text-[10px]">
                    <HardDrive size={12} className="text-blue-400 shrink-0" />
                    <span>Enforces Android 10 isolated Scoped Storage.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                id="package_installer_install_btn"
                onClick={handleStartInstall}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950 transition active:scale-95"
              >
                Install
              </button>
            </div>
          </div>
        )}

        {/* State 4: Installing with Animated Bar */}
        {stage === 'installing' && (
          <div className="py-5 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Package size={22} className="animate-pulse" />
            </div>
            <div className="text-center">
              <h4 className="text-xs font-bold text-white">Installing {apk.manifest.appName}...</h4>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Android 10 ART compiling DEX...</p>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${installProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* State 5: Finished */}
        {stage === 'finished' && (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center gap-3 bg-emerald-950/40 p-3 rounded-2xl border border-emerald-800/60">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-300">App installed.</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Ready to launch on Android 10 runtime.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition"
              >
                Done
              </button>
              <button
                id="package_installer_open_btn"
                onClick={handleOpenApp}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950 transition active:scale-95"
              >
                Open
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
