import React, { useState, useEffect, useMemo } from 'react';
import { ParsedApk } from '../../types/apk';
import { useAndroidSystem } from '../../runtime/AndroidSystemContext';
import { Play, Pause, Terminal, Layers, Cpu, Smartphone, ShieldCheck, RefreshCw, Send } from 'lucide-react';

interface GenericApkRunnerProps {
  apk: ParsedApk;
}

export function GenericApkRunner({ apk }: GenericApkRunnerProps) {
  const { addLog, showToast, vibrateDevice, batteryLevel } = useAndroidSystem();

  const [lifecycleState, setLifecycleState] = useState<'RESUMED' | 'PAUSED' | 'STOPPED'>('RESUMED');
  const [activeTab, setActiveTab] = useState<'ui' | 'dalvik' | 'permissions'>('ui');
  const [counter, setCounter] = useState(0);
  const [inputText, setInputText] = useState('');
  const [toastMessage, setToastMessage] = useState('Hello from Dalvik Activity!');
  const [logFilter, setLogFilter] = useState('');

  // Generate an isolated sandbox HTML for webview apps
  const webViewSrcDoc = useMemo(() => {
    if (!apk.hasWebAssets || !apk.entryHtmlContent) return null;

    // Inject Android Bridge script
    const bridgeScript = `
      <script>
        window.Android = {
          showToast: function(msg) {
            window.parent.postMessage({ type: 'ANDROID_TOAST', message: msg }, '*');
          },
          vibrate: function(ms) {
            window.parent.postMessage({ type: 'ANDROID_VIBRATE', duration: ms }, '*');
          },
          getBatteryLevel: function() {
            return ${batteryLevel};
          }
        };
      </script>
    `;

    return apk.entryHtmlContent.replace('<head>', `<head>${bridgeScript}`);
  }, [apk, batteryLevel]);

  // Listen for messages from WebView iframe
  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e.data?.type === 'ANDROID_TOAST') {
        showToast(e.data.message);
        addLog('D', 'WebViewBridge', `Toast: ${e.data.message}`);
      } else if (e.data?.type === 'ANDROID_VIBRATE') {
        vibrateDevice(e.data.duration || 40);
        addLog('D', 'WebViewBridge', `Vibrate: ${e.data.duration}ms`);
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, [showToast, vibrateDevice, addLog]);

  const triggerMethod = (methodName: string) => {
    vibrateDevice(15);
    addLog('D', 'DalvikVM', `invoke-virtual ${methodName}`);
    showToast(`Executed: ${methodName.split('->').pop() || methodName}`);
  };

  return (
    <div id="generic_apk_runner" className="w-full h-full flex flex-col bg-slate-900 text-slate-100 select-none overflow-hidden">
      {/* Top App Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2 min-w-0">
          {apk.iconUrl ? (
            <img src={apk.iconUrl} alt="icon" className="w-6 h-6 rounded object-cover" />
          ) : (
            <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center text-[10px] font-bold">
              APK
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-bold text-xs truncate text-slate-100">{apk.manifest.appName}</h3>
            <p className="text-[10px] text-slate-400 font-mono truncate">{apk.manifest.packageName}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
              lifecycleState === 'RESUMED'
                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                : 'bg-amber-950 text-amber-400 border-amber-800'
            }`}
          >
            {lifecycleState}
          </span>
        </div>
      </div>

      {/* Mode A: Embedded WebView Execution */}
      {apk.hasWebAssets && webViewSrcDoc ? (
        <div className="flex-1 w-full h-full relative bg-white">
          <iframe
            srcDoc={webViewSrcDoc}
            sandbox="allow-scripts allow-same-origin allow-forms"
            className="w-full h-full border-0 block"
            title="Android WebView"
          />
        </div>
      ) : (
        /* Mode B: Dalvik Activity Virtual Execution UI */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sub Navigation */}
          <div className="flex border-b border-slate-800 bg-slate-950/80 text-[11px] font-medium">
            <button
              onClick={() => setActiveTab('ui')}
              className={`flex-1 py-2 text-center transition ${
                activeTab === 'ui' ? 'border-b-2 border-emerald-400 text-emerald-400 font-semibold' : 'text-slate-400'
              }`}
            >
              Activity View
            </button>
            <button
              onClick={() => setActiveTab('dalvik')}
              className={`flex-1 py-2 text-center transition ${
                activeTab === 'dalvik' ? 'border-b-2 border-emerald-400 text-emerald-400 font-semibold' : 'text-slate-400'
              }`}
            >
              Dalvik VM
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`flex-1 py-2 text-center transition ${
                activeTab === 'permissions' ? 'border-b-2 border-emerald-400 text-emerald-400 font-semibold' : 'text-slate-400'
              }`}
            >
              Permissions
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {activeTab === 'ui' && (
              <div className="flex flex-col gap-3">
                {/* Simulated Android Activity Screen */}
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/70 flex flex-col gap-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                    <span className="text-[11px] font-mono text-emerald-400">
                      {apk.manifest.launcherActivity || '.MainActivity'}
                    </span>
                    <span className="text-[10px] text-slate-400">Android View Hierarchy</span>
                  </div>

                  {/* Interactive Dalvik Widgets */}
                  <div className="flex flex-col gap-2.5">
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                      <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                        android.widget.TextView (Title)
                      </label>
                      <h4 className="font-bold text-sm text-slate-100">{apk.manifest.appName}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Running inside Web Dalvik Emulation Engine • v{apk.manifest.versionName}
                      </p>
                    </div>

                    {/* Interactive Counter Widget */}
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">STATE VARIABLE</span>
                        <span className="text-xl font-bold font-mono text-emerald-400">{counter}</span>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            setCounter((c) => c - 1);
                            vibrateDevice(10);
                            addLog('D', 'MainActivity', `Counter updated: ${counter - 1}`);
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold"
                        >
                          -
                        </button>
                        <button
                          onClick={() => {
                            setCounter((c) => c + 1);
                            vibrateDevice(10);
                            addLog('D', 'MainActivity', `Counter updated: ${counter + 1}`);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Interactive Toast Dispatcher */}
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
                      <label className="text-[10px] text-slate-400 uppercase font-semibold">
                        android.widget.Toast Dispatcher
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={toastMessage}
                          onChange={(e) => setToastMessage(e.target.value)}
                          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          onClick={() => {
                            showToast(toastMessage);
                            vibrateDevice(20);
                            addLog('I', 'Toast', `Toast.makeText("${toastMessage}", LENGTH_SHORT).show()`);
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <Send size={12} />
                          <span>Show</span>
                        </button>
                      </div>
                    </div>

                    {/* Lifecycle Control Buttons */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <button
                        onClick={() => {
                          setLifecycleState('RESUMED');
                          vibrateDevice(15);
                          addLog('I', 'ActivityLifecycle', 'Activity.onResume() executed');
                        }}
                        className={`py-1.5 rounded-lg text-[10px] font-bold transition ${
                          lifecycleState === 'RESUMED' ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        onResume()
                      </button>
                      <button
                        onClick={() => {
                          setLifecycleState('PAUSED');
                          vibrateDevice(15);
                          addLog('I', 'ActivityLifecycle', 'Activity.onPause() executed');
                        }}
                        className={`py-1.5 rounded-lg text-[10px] font-bold transition ${
                          lifecycleState === 'PAUSED' ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        onPause()
                      </button>
                      <button
                        onClick={() => {
                          setLifecycleState('STOPPED');
                          vibrateDevice(20);
                          addLog('I', 'ActivityLifecycle', 'Activity.onStop() executed');
                        }}
                        className={`py-1.5 rounded-lg text-[10px] font-bold transition ${
                          lifecycleState === 'STOPPED' ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        onStop()
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dalvik' && (
              <div className="flex flex-col gap-2.5">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-2">
                    Extracted Dalvik Methods ({apk.dexInfo?.methods.length || 0})
                  </span>
                  <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto font-mono text-[11px]">
                    {apk.dexInfo?.methods.slice(0, 15).map((m, idx) => (
                      <button
                        key={idx}
                        onClick={() => triggerMethod(m)}
                        className="text-left px-2 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800/80 truncate active:scale-[0.99] transition"
                      >
                        ⚡ {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    DEX Bytecode Class Definitions
                  </span>
                  <div className="flex flex-col gap-1 font-mono text-[10px] text-slate-400 max-h-36 overflow-y-auto">
                    {apk.dexInfo?.classes.map((c, i) => (
                      <div key={i} className="truncate text-slate-300">
                        • {c}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'permissions' && (
              <div className="flex flex-col gap-2">
                <span className="text-xs text-slate-400">Declared in AndroidManifest.xml:</span>
                {apk.manifest.permissions.length === 0 ? (
                  <div className="text-xs text-slate-500 italic p-3 bg-slate-950 rounded-xl">
                    No runtime permissions requested.
                  </div>
                ) : (
                  apk.manifest.permissions.map((p, i) => (
                    <div key={i} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-emerald-300 font-semibold">{p.shortName}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            p.risk === 'dangerous'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {p.risk}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">{p.description}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
