import React, { useState } from 'react';
import { useAndroidSystem } from '../runtime/AndroidSystemContext';
import {
  Upload,
  RotateCcw,
  Power,
  Smartphone,
  Sparkles,
  SlidersHorizontal,
  Layers,
  Terminal,
  GitBranch,
  CheckCircle2,
  X,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

interface TopBarProps {
  onOpenUpload: () => void;
}

export function TopBar({ onOpenUpload }: TopBarProps) {
  const {
    isPowerOn,
    togglePower,
    restartDevice,
    navMode,
    setNavMode,
    installedApps,
  } = useAndroidSystem();

  const [showDeployModal, setShowDeployModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const gitSnippet = `git remote add origin https://github.com/<YOUR-USER>/<YOUR-REPO>.git
git branch -M main
git push -u origin main`;

  const handleCopy = () => {
    navigator.clipboard.writeText(gitSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <header id="top_app_bar" className="w-full bg-slate-950 border-b border-slate-800/80 px-4 py-3 flex items-center justify-between gap-4 shrink-0 z-20">
      {/* Brand & Emulation Status */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-md shadow-emerald-950/50 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <svg className="w-5 h-5 fill-emerald-400" viewBox="0 0 24 24">
              <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 0 0-.1521-.5676.416.416 0 0 0-.5676.1521l-2.0223 3.503C15.5802 8.411 13.8447 8.09 12 8.09s-3.5802.321-5.1368.8597L4.8409 5.4467a.4161.4161 0 0 0-.5677-.1521.4157.4157 0 0 0-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
            </svg>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-white tracking-tight">Android 10 APK Runner</h1>
            <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800/60 font-semibold">
              Android 10 • API 29
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Pixel 4 virtual runtime • {installedApps.length} packages active • Sideloading enabled
          </p>
        </div>
      </div>

      {/* Center / Right Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Navigation Mode Switch */}
        <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-[11px] text-slate-400">
          <button
            onClick={() => setNavMode('buttons')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              navMode === 'buttons' ? 'bg-slate-800 text-white font-semibold shadow-xs' : 'hover:text-slate-200'
            }`}
          >
            3-Button Nav
          </button>
          <button
            onClick={() => setNavMode('gestures')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              navMode === 'gestures' ? 'bg-slate-800 text-white font-semibold shadow-xs' : 'hover:text-slate-200'
            }`}
          >
            Gestures
          </button>
        </div>

        {/* Restart Device Button */}
        <button
          id="topbar_restart_btn"
          onClick={restartDevice}
          title="Restart Virtual Android OS"
          className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition"
        >
          <RotateCcw size={15} />
        </button>

        {/* Power Button */}
        <button
          id="topbar_power_btn"
          onClick={togglePower}
          title={isPowerOn ? 'Turn Screen Off' : 'Wake Device'}
          className={`p-2 border rounded-xl transition ${
            isPowerOn
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-emerald-400'
              : 'bg-rose-950/60 border-rose-800/80 text-rose-400 hover:bg-rose-900/60'
          }`}
        >
          <Power size={15} />
        </button>

        {/* GitHub Auto-deploy Button */}
        <button
          id="topbar_github_deploy_btn"
          onClick={() => setShowDeployModal(true)}
          title="GitHub Auto-Deployment Setup"
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition"
        >
          <GitBranch size={14} className="text-emerald-400" />
          <span className="hidden md:inline">Auto Deploy</span>
        </button>

        {/* Upload .APK Button */}
        <button
          id="topbar_upload_apk_btn"
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/40 transition active:scale-95"
        >
          <Upload size={14} />
          <span>Sideload .APK</span>
        </button>
      </div>

      {/* GitHub Auto Deploy Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-5 flex flex-col gap-4 text-slate-200 select-none">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
                  <GitBranch size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    GitHub Actions Auto-Deployment
                    <span className="text-[10px] bg-emerald-900/60 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-700/60">
                      Configured
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Automated build and deploy pipeline configured in <code className="text-emerald-400 font-mono">.github/workflows/deploy.yml</code>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDeployModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Status & Pipeline Checklist */}
            <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-3.5 flex flex-col gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 size={16} />
                <span>Automated Workflow Ready</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">✔</span>
                  <span><strong>Trigger:</strong> Runs on every push to <code className="bg-slate-800 px-1 rounded text-slate-200">main</code> or <code className="bg-slate-800 px-1 rounded text-slate-200">master</code>, plus manual trigger.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">✔</span>
                  <span><strong>Build:</strong> Automatically runs <code className="bg-slate-800 px-1 rounded text-slate-200">npm run build</code> on Node 20.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">✔</span>
                  <span><strong>Vite Base Path:</strong> Configured with relative asset paths (<code className="bg-slate-800 px-1 rounded text-emerald-300">base: './'</code>) for GitHub Pages subpaths.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">✔</span>
                  <span><strong>GitHub Pages:</strong> Direct deployment using official <code className="bg-slate-800 px-1 rounded text-slate-200">actions/deploy-pages@v4</code>.</span>
                </li>
              </ul>
            </div>

            {/* Activation Guide */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-300">How to activate on your GitHub repo:</span>
              <ol className="text-xs text-slate-400 space-y-1.5 list-decimal pl-4">
                <li>Export or push this repository to your GitHub account.</li>
                <li>In your repository, click <strong>Settings</strong> → <strong>Pages</strong>.</li>
                <li>Under <strong>Build and deployment &gt; Source</strong>, choose <strong>GitHub Actions</strong>.</li>
                <li>Every push to <code className="text-slate-300">main</code> will automatically deploy your live app!</li>
              </ol>
            </div>

            {/* Quick Git Commands */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">Push to remote repo:</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-mono transition"
                >
                  {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <pre className="text-[11px] font-mono text-slate-300 bg-slate-900 p-2.5 rounded-lg overflow-x-auto leading-relaxed border border-slate-800">
                {gitSnippet}
              </pre>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800">
              <button
                onClick={() => setShowDeployModal(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-950/40"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
