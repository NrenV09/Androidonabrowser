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

    let html = apk.entryHtmlContent;

    // Inject bundled assets by replacing script and link tags
    if (apk.bundledAssets) {
      Object.entries(apk.bundledAssets).forEach(([assetPath, content]) => {
        const fileName = assetPath.split('/').pop();
        if (!fileName) return;

        // Inline JavaScript
        if (fileName.endsWith('.js')) {
          const scriptRegex = new RegExp(`<script[^>]*src=["'].*?${fileName}["'][^>]*>\\s*</script>`, 'gi');
          if (scriptRegex.test(html)) {
            html = html.replace(scriptRegex, `<script>${content}</script>`);
          } else {
             // If not matched by exact name, maybe just append it if we must, but usually better to replace.
          }
        }
        // Inline CSS
        else if (fileName.endsWith('.css')) {
          const linkRegex = new RegExp(`<link[^>]*href=["'].*?${fileName}["'][^>]*>`, 'gi');
          if (linkRegex.test(html)) {
            html = html.replace(linkRegex, `<style>${content}</style>`);
          }
        }
        // Replace Image URLs with blob URLs
        else {
          const imgRegex = new RegExp(`src=["'].*?${fileName}["']`, 'gi');
          html = html.replace(imgRegex, `src="${content}"`);
        }
      });
    }

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

    return html.replace('<head>', `<head>${bridgeScript}`);
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
              <div className="flex flex-col gap-3 h-full items-center justify-center p-4 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-center mb-2">
                  <ShieldCheck size={28} className="text-emerald-400" />
                </div>
                <h2 className="text-sm font-bold text-slate-100">Native Execution Not Supported</h2>
                <p className="text-xs text-slate-400 max-w-[240px] leading-relaxed">
                  This APK contains compiled ARM/x86 native code and Dalvik bytecode. Web browsers cannot execute native Android binaries directly.
                </p>
                <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 mt-2 text-left w-full">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-2">APK Details</span>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-slate-400">Package</span>
                    <span className="text-xs font-mono text-emerald-400 truncate max-w-[120px]">{apk.manifest.packageName}</span>
                  </div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-slate-400">Version</span>
                    <span className="text-xs font-mono text-slate-300">{apk.manifest.versionName}</span>
                  </div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-slate-400">Target SDK</span>
                    <span className="text-xs font-mono text-slate-300">API {apk.manifest.targetSdkVersion}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Type</span>
                    <span className="text-xs font-mono text-slate-300">Native Android App</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">
                  Please use the Dalvik VM and Permissions tabs to inspect the app's contents statically. Only web-based (Capacitor/Cordova) APKs can run inside this simulator.
                </p>
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
