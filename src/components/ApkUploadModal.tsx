import React, { useState, useRef } from 'react';
import { useAndroidSystem } from '../runtime/AndroidSystemContext';
import { parseApkFile } from '../utils/apkParser';
import { SAMPLE_APKS, generateSampleApk } from '../utils/sampleApks';
import { Upload, FileUp, X, CheckCircle2, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

interface ApkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApkUploadModal({ isOpen, onClose }: ApkUploadModalProps) {
  const { installApk, launchApp, showToast, sideloadApkPrompt } = useAndroidSystem();

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusStep, setStatusStep] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.apk') && !file.name.toLowerCase().endsWith('.zip')) {
      showToast('Please select a valid .apk file');
      return;
    }

    setIsProcessing(true);
    try {
      setStatusStep('Reading APK archive package...');
      await new Promise((r) => setTimeout(r, 200));

      setStatusStep('Parsing AndroidManifest.xml & AXML binary schema...');
      await new Promise((r) => setTimeout(r, 300));

      const parsed = await parseApkFile(file);

      setStatusStep('Opening Android 10 Package Installer...');
      await new Promise((r) => setTimeout(r, 250));

      sideloadApkPrompt(parsed);
      showToast(`Staged ${parsed.manifest.appName} for sideloading`);
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Failed to parse APK. Check file integrity.');
    } finally {
      setIsProcessing(false);
      setStatusStep('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = async (sample: any) => {
    setIsProcessing(true);
    try {
      setStatusStep(`Loading ${sample.name}...`);
      const parsed = await generateSampleApk(sample);
      sideloadApkPrompt(parsed);
      showToast(`Sideload prompt opened for ${sample.name}`);
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Error loading sample APK');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="apk_upload_modal_backdrop"
      onClick={onClose}
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        id="apk_upload_modal_content"
        onClick={(e) => e.stopPropagation()}
        className="relative bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 text-slate-100"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <FileUp size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Install Android APK</h3>
              <p className="text-xs text-slate-400">Run any Android package (.apk) in the browser</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drag & Drop Box */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition ${
            isDragging
              ? 'border-emerald-400 bg-emerald-500/10'
              : 'border-slate-700 hover:border-slate-600 bg-slate-950/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".apk,.zip"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          {isProcessing ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-emerald-400" />
              <span className="text-xs font-medium text-emerald-300 font-mono">{statusStep}</span>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3 text-emerald-400 shadow-inner">
                <Upload size={22} />
              </div>
              <h4 className="text-sm font-semibold text-slate-200">Drag & Drop your .apk file here</h4>
              <p className="text-xs text-slate-400 mt-1">or click to browse local files from your computer</p>
              <span className="mt-3 text-[10px] bg-slate-800/80 text-slate-400 px-2.5 py-1 rounded-full border border-slate-700">
                Supports Android APK, WebView, Cordova & Native Dalvik packages
              </span>
            </>
          )}
        </div>

        {/* Or pick a sample */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-400" />
            <span>Or test with ready-to-run APK samples</span>
          </span>
          <div className="grid grid-cols-3 gap-2">
            {SAMPLE_APKS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                disabled={isProcessing}
                className="p-2.5 bg-slate-800/70 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 rounded-xl text-left transition flex items-center gap-2 group"
              >
                <div
                  className="w-7 h-7 rounded-lg p-1 flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${sample.color}20`, color: sample.color }}
                >
                  <div dangerouslySetInnerHTML={{ __html: sample.iconSvg }} className="w-full h-full" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-200 block truncate group-hover:text-emerald-400">
                    {sample.name}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate">{sample.category}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
