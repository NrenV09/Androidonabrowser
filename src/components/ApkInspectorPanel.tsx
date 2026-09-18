import React, { useState } from 'react';
import { useAndroidSystem } from '../runtime/AndroidSystemContext';
import { ParsedApk } from '../types/apk';
import { SAMPLE_APKS, generateSampleApk } from '../utils/sampleApks';
import {
  FileCode,
  Shield,
  Layers,
  Terminal,
  FolderTree,
  Play,
  Copy,
  Check,
  Search,
  Trash2,
  Download,
  AlertTriangle,
  Cpu,
  Package,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export function ApkInspectorPanel() {
  const {
    inspectedApk,
    setInspectedApk,
    installApk,
    launchApp,
    logs,
    clearLogs,
    addLog,
    showToast,
    sideloadApkPrompt,
    executeAdbCommand,
  } = useAndroidSystem();

  const [activeTab, setActiveTab] = useState<'overview' | 'manifest' | 'permissions' | 'dex' | 'files' | 'logcat' | 'adb'>('overview');
  const [copied, setCopied] = useState(false);
  const [logFilter, setLogFilter] = useState('');
  const [logLevel, setLogLevel] = useState<'ALL' | 'V' | 'D' | 'I' | 'W' | 'E'>('ALL');
  const [fileFilter, setFileFilter] = useState('');
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [adbInput, setAdbInput] = useState('');
  const [adbHistory, setAdbHistory] = useState<Array<{ id: string; cmd: string; result: string }>>([
    {
      id: 'init-1',
      cmd: 'adb devices',
      result: 'List of devices attached\nemulator-5554\tdevice\t(Google Pixel 4 - Android 10 - API 29)\n',
    },
    {
      id: 'init-2',
      cmd: 'adb shell getprop ro.build.version.release',
      result: '10\n',
    },
  ]);

  const handleRunAdb = (cmdToRun?: string) => {
    const targetCmd = (cmdToRun !== undefined ? cmdToRun : adbInput).trim();
    if (!targetCmd) return;
    const output = executeAdbCommand(targetCmd);
    setAdbHistory((prev) => [
      ...prev,
      { id: Date.now().toString(), cmd: targetCmd, result: output },
    ]);
    setAdbInput('');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoadSample = async (sampleDef: any) => {
    setIsLoadingSample(true);
    try {
      const parsed = await generateSampleApk(sampleDef);
      await installApk(parsed);
      launchApp(parsed.id);
      setInspectedApk(parsed);
      addLog('I', 'PackageManager', `Loaded sample APK: ${sampleDef.name}`);
    } catch (err) {
      console.error(err);
      showToast('Error loading sample APK');
    } finally {
      setIsLoadingSample(false);
    }
  };

  const filteredLogs = logs.filter((l) => {
    const matchesLevel = logLevel === 'ALL' || l.level === logLevel;
    const matchesText =
      l.tag.toLowerCase().includes(logFilter.toLowerCase()) ||
      l.message.toLowerCase().includes(logFilter.toLowerCase());
    return matchesLevel && matchesText;
  });

  const filteredFiles = inspectedApk?.files.filter((f) =>
    f.path.toLowerCase().includes(fileFilter.toLowerCase())
  ) || [];

  return (
    <div id="apk_inspector_panel" className="flex-1 h-full flex flex-col bg-slate-900 border-l border-slate-800 text-slate-200 overflow-hidden">
      {/* Panel Navigation Tabs */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          <button
            id="tab_overview"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'overview' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Package size={14} />
            <span>APK Overview</span>
          </button>

          <button
            id="tab_manifest"
            onClick={() => setActiveTab('manifest')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'manifest' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCode size={14} />
            <span>Manifest XML</span>
          </button>

          <button
            id="tab_permissions"
            onClick={() => setActiveTab('permissions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'permissions' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Shield size={14} />
            <span>Permissions ({inspectedApk?.manifest.permissions.length || 0})</span>
          </button>

          <button
            id="tab_dex"
            onClick={() => setActiveTab('dex')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'dex' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Cpu size={14} />
            <span>DEX Bytecode</span>
          </button>

          <button
            id="tab_files"
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'files' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FolderTree size={14} />
            <span>APK Archive</span>
          </button>

          <button
            id="tab_logcat"
            onClick={() => setActiveTab('logcat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'logcat' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Terminal size={14} />
            <span>Live Logcat ({logs.length})</span>
          </button>

          <button
            id="tab_adb"
            onClick={() => setActiveTab('adb')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'adb' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Cpu size={14} />
            <span>ADB Terminal</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!inspectedApk && activeTab !== 'logcat' && activeTab !== 'adb' ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center gap-2">
            <Package size={40} className="opacity-30" />
            <p className="text-sm font-medium">No APK package selected</p>
            <p className="text-xs text-slate-600">Select an installed app or load a sample APK below.</p>
          </div>
        ) : null}

        {/* Tab 1: APK Overview */}
        {activeTab === 'overview' && inspectedApk && (
          <div className="flex flex-col gap-5">
            {/* Top header banner */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700/80 p-1 flex items-center justify-center shadow-lg shrink-0">
                  {inspectedApk.iconUrl ? (
                    <img src={inspectedApk.iconUrl} alt="App Icon" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Package size={32} className="text-emerald-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{inspectedApk.manifest.appName}</h2>
                    <span className="text-xs bg-emerald-950 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-800/60">
                      v{inspectedApk.manifest.versionName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{inspectedApk.manifest.packageName}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                    <span>Size: {(inspectedApk.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                    <span>•</span>
                    <span>Min SDK: {inspectedApk.manifest.minSdkVersion}</span>
                    <span>•</span>
                    <span>Target SDK: {inspectedApk.manifest.targetSdkVersion}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-stretch md:self-auto flex-wrap">
                <button
                  id="overview_sideload_apk_btn"
                  onClick={() => sideloadApkPrompt(inspectedApk)}
                  className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/30 transition"
                  title="Sideload APK through Android 10 Package Installer"
                >
                  <Download size={14} />
                  <span>Sideload to Device</span>
                </button>

                <button
                  id="overview_run_apk_btn"
                  onClick={() => launchApp(inspectedApk.id)}
                  className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/30 transition"
                >
                  <Play size={14} className="fill-white" />
                  <span>Launch App</span>
                </button>
              </div>
            </div>

            {/* Grid of details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Package Details */}
              <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 flex flex-col gap-2.5 text-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Package size={14} className="text-emerald-400" />
                  <span>Package Specification</span>
                </h4>
                <div className="divide-y divide-slate-700/50">
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-400">Main Launcher Activity</span>
                    <span className="font-mono text-emerald-300 text-right">{inspectedApk.manifest.launcherActivity || '.MainActivity'}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-400">Total Activities Declared</span>
                    <span className="font-semibold text-slate-200">{inspectedApk.manifest.activities.length}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-400">Runtime Architecture</span>
                    <span className="font-mono text-slate-200">arm64-v8a / WebAssembly</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-400">Archive Compression</span>
                    <span className="font-mono text-slate-200">ZIP Deflate</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-400">Web Assets Detected</span>
                    <span className="font-semibold text-emerald-400">{inspectedApk.hasWebAssets ? 'Yes (WebView Mode)' : 'No (Dalvik Mode)'}</span>
                  </div>
                </div>
              </div>

              {/* Security & Permissions Summary */}
              <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 flex flex-col gap-2.5 text-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Shield size={14} className="text-blue-400" />
                  <span>Security & Permissions Risk</span>
                </h4>
                <div className="flex gap-2 mb-1">
                  <div className="flex-1 bg-slate-900 p-2 rounded-xl text-center border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">NORMAL</span>
                    <span className="text-base font-bold text-slate-200">
                      {inspectedApk.manifest.permissions.filter((p) => p.risk === 'normal').length}
                    </span>
                  </div>
                  <div className="flex-1 bg-slate-900 p-2 rounded-xl text-center border border-slate-800">
                    <span className="text-[10px] text-amber-400 block font-semibold">DANGEROUS</span>
                    <span className="text-base font-bold text-amber-400">
                      {inspectedApk.manifest.permissions.filter((p) => p.risk === 'dangerous').length}
                    </span>
                  </div>
                  <div className="flex-1 bg-slate-900 p-2 rounded-xl text-center border border-slate-800">
                    <span className="text-[10px] text-purple-400 block font-semibold">SIGNATURE</span>
                    <span className="text-base font-bold text-purple-400">
                      {inspectedApk.manifest.permissions.filter((p) => p.risk === 'signature').length}
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto max-h-32 flex flex-col gap-1 pr-1">
                  {inspectedApk.manifest.permissions.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] py-1 border-b border-slate-800/70">
                      <span className="font-mono text-slate-300 truncate max-w-[180px]">{p.shortName}</span>
                      <span className={`text-[9px] uppercase px-1.5 rounded font-bold ${p.risk === 'dangerous' ? 'bg-rose-950 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
                        {p.risk}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Test Ready-to-Run Sample Library */}
            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-400" />
                    <span>Quick Test Pre-built APK Library</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Select any pre-compiled Android package to run instantly inside the virtual phone:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {SAMPLE_APKS.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleLoadSample(sample)}
                    disabled={isLoadingSample}
                    className="p-3 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition flex items-start gap-2.5 active:scale-98 group"
                  >
                    <div
                      className="w-9 h-9 rounded-lg p-1.5 flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${sample.color}20`, color: sample.color }}
                    >
                      <div dangerouslySetInnerHTML={{ __html: sample.iconSvg }} className="w-full h-full" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-200 block truncate group-hover:text-emerald-400 transition">
                        {sample.name}
                      </span>
                      <span className="text-[10px] text-slate-500 block">{sample.category} • {sample.sizeFormatted}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Manifest XML */}
        {activeTab === 'manifest' && inspectedApk && (
          <div className="flex flex-col h-full gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Decoded <code className="text-emerald-400">AndroidManifest.xml</code>
              </span>
              <button
                onClick={() => handleCopy(inspectedApk.manifest.rawXml)}
                className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 rounded-lg border border-slate-700"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy XML'}</span>
              </button>
            </div>

            <pre className="flex-1 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-[11px] font-mono text-emerald-300/90 overflow-x-auto overflow-y-auto leading-relaxed scrollbar-thin">
              {inspectedApk.manifest.rawXml}
            </pre>
          </div>
        )}

        {/* Tab 3: Permissions */}
        {activeTab === 'permissions' && inspectedApk && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Application Permissions Audit</h3>
                <p className="text-xs text-slate-400">
                  Total {inspectedApk.manifest.permissions.length} runtime & install-time permissions declared in manifest.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {inspectedApk.manifest.permissions.map((p, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/70 flex flex-col md:flex-row md:items-center justify-between gap-2"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl mt-0.5 ${p.risk === 'dangerous' ? 'bg-rose-950 text-rose-400' : 'bg-slate-900 text-emerald-400'}`}>
                      <Shield size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-200">{p.name}</span>
                        <span className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-bold ${
                          p.risk === 'dangerous'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-slate-900 text-slate-300 border border-slate-800'
                        }`}>
                          {p.risk}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{p.description}</p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-emerald-400 self-end md:self-auto bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/60">
                    GRANTED
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: DEX Bytecode */}
        {activeTab === 'dex' && inspectedApk && (
          <div className="flex flex-col gap-4">
            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                <Cpu size={14} className="text-emerald-400" />
                <span>classes.dex Header Metadata</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">CLASSES COUNT</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">{inspectedApk.dexInfo?.header.classDefsSize || 0}</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">METHODS COUNT</span>
                  <span className="text-sm font-mono font-bold text-blue-400">{inspectedApk.dexInfo?.header.methodIdsSize || 0}</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">STRINGS POOL</span>
                  <span className="text-sm font-mono font-bold text-amber-400">{inspectedApk.dexInfo?.header.stringIdsSize || 0}</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">FILE SIZE</span>
                  <span className="text-sm font-mono font-bold text-slate-200">{((inspectedApk.dexInfo?.header.fileSize || 0) / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            </div>

            {/* Extracted Classes */}
            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-300">Extracted Class Definitions</span>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto flex flex-col gap-1">
                {inspectedApk.dexInfo?.classes.map((c, i) => (
                  <div key={i} className="truncate hover:text-emerald-400 cursor-pointer">
                    • {c}
                  </div>
                ))}
              </div>
            </div>

            {/* Extracted Methods */}
            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-300">Extracted Method Descriptors</span>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto flex flex-col gap-1">
                {inspectedApk.dexInfo?.methods.map((m, i) => (
                  <div key={i} className="truncate hover:text-blue-400 cursor-pointer">
                    λ {m}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Archive Files */}
        {activeTab === 'files' && inspectedApk && (
          <div className="flex flex-col h-full gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter files (e.g. .png, res/, dex, assets)..."
                  value={fileFilter}
                  onChange={(e) => setFileFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <span className="text-xs text-slate-400 whitespace-nowrap">
                {filteredFiles.length} of {inspectedApk.files.length} files
              </span>
            </div>

            <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 overflow-y-auto divide-y divide-slate-800/60 font-mono text-xs">
              {filteredFiles.map((file, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-slate-900 transition">
                  <div className="flex items-center gap-2 truncate">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      file.type === 'manifest' ? 'bg-purple-950 text-purple-400' :
                      file.type === 'dex' ? 'bg-blue-950 text-blue-400' :
                      file.type === 'res' ? 'bg-emerald-950 text-emerald-400' :
                      file.type === 'asset' ? 'bg-amber-950 text-amber-400' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {file.type.toUpperCase()}
                    </span>
                    <span className="text-slate-300 truncate">{file.path}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 shrink-0">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Live Logcat */}
        {activeTab === 'logcat' && (
          <div className="flex flex-col h-full gap-3">
            {/* Logcat Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search size={14} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter log tag or message..."
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  className="bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none w-full"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {(['ALL', 'V', 'D', 'I', 'W', 'E'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setLogLevel(lvl)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                      logLevel === lvl
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}

                <button
                  onClick={clearLogs}
                  title="Clear Logcat"
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Log Console stream */}
            <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 p-3 font-mono text-[11px] overflow-y-auto flex flex-col gap-1 select-text scrollbar-thin">
              {filteredLogs.length === 0 ? (
                <div className="text-slate-600 text-center py-10 italic">No log entries matching filter</div>
              ) : (
                filteredLogs.map((l) => (
                  <div key={l.id} className="flex items-start gap-2 hover:bg-slate-900/50 py-0.5 px-1 rounded">
                    <span className="text-slate-600 shrink-0 text-[10px]">{l.timestamp}</span>
                    <span
                      className={`font-bold px-1 rounded text-[9px] shrink-0 ${
                        l.level === 'E' ? 'bg-rose-950 text-rose-400' :
                        l.level === 'W' ? 'bg-amber-950 text-amber-400' :
                        l.level === 'I' ? 'bg-blue-950 text-blue-400' :
                        l.level === 'D' ? 'bg-emerald-950 text-emerald-400' :
                        'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {l.level}
                    </span>
                    <span className="text-emerald-400 font-semibold shrink-0">[{l.tag}]</span>
                    <span className={`break-all ${l.level === 'E' ? 'text-rose-300' : l.level === 'W' ? 'text-amber-300' : 'text-slate-300'}`}>
                      {l.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 7: Interactive ADB Terminal */}
        {activeTab === 'adb' && (
          <div className="flex flex-col h-full gap-3">
            {/* Quick ADB Chips */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
                <Terminal size={12} className="text-emerald-400" />
                Quick Commands:
              </span>
              {[
                'adb devices',
                'adb install',
                'adb shell getprop ro.build.version.release',
                'adb shell getprop ro.product.model',
                'adb shell pm list packages',
                'adb shell dumpsys battery',
                'adb shell uname -a',
                'adb reboot',
              ].map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => handleRunAdb(cmd)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 hover:text-white rounded-lg text-[10px] font-mono border border-slate-700/60 transition cursor-pointer"
                >
                  {cmd}
                </button>
              ))}
              <button
                onClick={() => setAdbHistory([])}
                title="Clear ADB Terminal"
                className="ml-auto p-1 text-slate-500 hover:text-rose-400 rounded transition"
              >
                <Trash2 size={13} />
              </button>
            </div>

            {/* Terminal Console */}
            <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 p-4 font-mono text-xs overflow-y-auto flex flex-col gap-2 select-text scrollbar-thin shadow-inner">
              <div className="text-emerald-400 font-semibold border-b border-slate-800/80 pb-2">
                Android 10 Debug Bridge (adbd daemon active) • USB Debugging Connected
              </div>
              {adbHistory.map((item) => (
                <div key={item.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <span className="text-slate-500">$</span>
                    <span>{item.cmd}</span>
                  </div>
                  <pre className="text-slate-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed pl-4 border-l border-slate-800">
                    {item.result}
                  </pre>
                </div>
              ))}
            </div>

            {/* Terminal Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRunAdb();
              }}
              className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800"
            >
              <span className="text-emerald-400 font-mono text-xs pl-2 font-bold">$</span>
              <input
                type="text"
                value={adbInput}
                onChange={(e) => setAdbInput(e.target.value)}
                placeholder="Enter command (e.g. adb install, adb shell pm list packages)..."
                className="flex-1 bg-transparent text-white font-mono text-xs placeholder:text-slate-600 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg text-xs font-bold transition"
              >
                Execute
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
