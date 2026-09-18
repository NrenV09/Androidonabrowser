import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAndroidSystem } from '../../runtime/AndroidSystemContext';
import { Smartphone, Battery, Compass, Volume2, Vibrate, CheckCircle2, Sliders } from 'lucide-react';

export function HardwareTesterApp() {
  const { batteryLevel, isCharging, vibrateDevice, addLog, showToast } = useAndroidSystem();

  const [activeTab, setActiveTab] = useState<'touch' | 'gyro' | 'battery' | 'audio'>('touch');
  const [touchPoints, setTouchPoints] = useState<{ x: number; y: number }[]>([]);
  const [ballPos, setBallPos] = useState({ x: 150, y: 150 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Touch test canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setTouchPoints([{ x, y }]);
  };

  // Gyroscope tilt simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setBallPos((prev) => {
        const nextX = Math.max(20, Math.min(280, prev.x + tilt.x * 3.5));
        const nextY = Math.max(20, Math.min(280, prev.y + tilt.y * 3.5));
        return { x: nextX, y: nextY };
      });
    }, 30);
    return () => clearInterval(interval);
  }, [tilt]);

  const testTone = (freq: number) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
      addLog('I', 'AudioHardware', `Speaker test emitted ${freq}Hz tone`);
    } catch {
      // ignore
    }
  };

  return (
    <div id="hardware_tester_app" className="w-full h-full flex flex-col bg-slate-900 text-slate-100 select-none">
      {/* Header */}
      <div className="px-4 py-2.5 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone size={16} className="text-emerald-400" />
          <span className="text-xs font-bold tracking-wide">Hardware & Sensors</span>
        </div>
        <span className="text-[10px] bg-emerald-950 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-800/60">
          API 34 PASS
        </span>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 bg-slate-950/60 text-[11px] font-medium border-b border-slate-800">
        <button
          onClick={() => setActiveTab('touch')}
          className={`py-2 text-center transition ${
            activeTab === 'touch' ? 'border-b-2 border-emerald-500 text-emerald-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Touch
        </button>
        <button
          onClick={() => setActiveTab('gyro')}
          className={`py-2 text-center transition ${
            activeTab === 'gyro' ? 'border-b-2 border-emerald-500 text-emerald-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Gyro
        </button>
        <button
          onClick={() => setActiveTab('battery')}
          className={`py-2 text-center transition ${
            activeTab === 'battery' ? 'border-b-2 border-emerald-500 text-emerald-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Power
        </button>
        <button
          onClick={() => setActiveTab('audio')}
          className={`py-2 text-center transition ${
            activeTab === 'audio' ? 'border-b-2 border-emerald-500 text-emerald-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Haptics
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-3 overflow-y-auto">
        {activeTab === 'touch' && (
          <div className="flex flex-col h-full gap-2">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Touch Screen Calibration</span>
              {touchPoints.length > 0 ? (
                <span className="text-emerald-400 font-mono">
                  X: {touchPoints[0].x} Y: {touchPoints[0].y}
                </span>
              ) : (
                <span className="text-slate-500 italic">Touch or drag below</span>
              )}
            </div>
            <div className="relative flex-1 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={300}
                height={350}
                onPointerMove={handlePointerMove}
                onPointerDown={handlePointerMove}
                className="w-full h-full cursor-crosshair touch-none"
              />
              {touchPoints.map((pt, i) => (
                <div
                  key={i}
                  className="absolute pointer-events-none w-10 h-10 -ml-5 -mt-5 rounded-full border-2 border-emerald-400 bg-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-200 font-mono"
                  style={{ left: pt.x, top: pt.y }}
                >
                  P1
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'gyro' && (
          <div className="flex flex-col h-full gap-3">
            <div className="flex justify-between text-xs text-slate-400">
              <span>3-Axis Gyroscope & Accelerometer</span>
              <span className="font-mono text-emerald-400">
                X:{tilt.x.toFixed(1)} Y:{tilt.y.toFixed(1)}
              </span>
            </div>

            {/* Virtual tilt area */}
            <div className="relative h-64 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden">
              <div className="w-full h-px bg-slate-800 absolute" />
              <div className="h-full w-px bg-slate-800 absolute" />
              <div className="w-32 h-32 rounded-full border border-slate-800/80 absolute" />
              <div
                className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.7)] transition-transform duration-75 flex items-center justify-center text-[9px] font-bold text-slate-950"
                style={{ left: ballPos.x, top: ballPos.y }}
              >
                G
              </div>
            </div>

            {/* Tilt controls */}
            <div className="bg-slate-800/70 p-3 rounded-xl flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-12 text-slate-400 font-mono">X-Tilt</span>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  step="0.1"
                  value={tilt.x}
                  onChange={(e) => setTilt((prev) => ({ ...prev, x: parseFloat(e.target.value) }))}
                  className="flex-1 accent-emerald-500"
                />
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-12 text-slate-400 font-mono">Y-Tilt</span>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  step="0.1"
                  value={tilt.y}
                  onChange={(e) => setTilt((prev) => ({ ...prev, y: parseFloat(e.target.value) }))}
                  className="flex-1 accent-emerald-500"
                />
              </div>
              <button
                onClick={() => setTilt({ x: 0, y: 0 })}
                className="text-[11px] text-emerald-400 self-end hover:underline pt-1"
              >
                Zero Sensor
              </button>
            </div>
          </div>
        )}

        {activeTab === 'battery' && (
          <div className="flex flex-col gap-3">
            <div className="bg-slate-800/70 p-4 rounded-2xl border border-slate-700/60 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-700/50 flex items-center justify-center font-black text-base">
                {batteryLevel}%
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-100">
                  {isCharging ? 'Fast Charging (30W USB-PD)' : 'Discharging on Battery'}
                </h4>
                <p className="text-xs text-slate-400">Health: Good • Li-ion 5050 mAh</p>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col gap-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Voltage</span>
                <span className="font-mono text-slate-200">4,192 mV</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Battery Temp</span>
                <span className="font-mono text-slate-200">29.8 °C</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Technology</span>
                <span className="font-mono text-slate-200">Li-Polymer</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Status</span>
                <span className="font-mono text-emerald-400">Charging / Healthy</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="flex flex-col gap-3">
            <div className="bg-slate-800/70 p-3.5 rounded-xl border border-slate-700/60 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Volume2 size={14} className="text-blue-400" />
                <span>Stereo Audio Frequency Test</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => testTone(440)}
                  className="py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-mono font-medium text-slate-200 active:scale-95 transition"
                >
                  440 Hz (A4)
                </button>
                <button
                  onClick={() => testTone(880)}
                  className="py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-mono font-medium text-slate-200 active:scale-95 transition"
                >
                  880 Hz (A5)
                </button>
                <button
                  onClick={() => testTone(1760)}
                  className="py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-mono font-medium text-slate-200 active:scale-95 transition"
                >
                  1.7 kHz
                </button>
              </div>
            </div>

            <div className="bg-slate-800/70 p-3.5 rounded-xl border border-slate-700/60 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Vibrate size={14} className="text-amber-400" />
                <span>Haptic Vibration Actuator</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    vibrateDevice(40);
                    showToast('Short tap vibration');
                  }}
                  className="py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium text-slate-200 active:scale-95 transition"
                >
                  Click (40ms)
                </button>
                <button
                  onClick={() => {
                    vibrateDevice(150);
                    showToast('Medium vibration');
                  }}
                  className="py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium text-slate-200 active:scale-95 transition"
                >
                  Pulse (150ms)
                </button>
                <button
                  onClick={() => {
                    vibrateDevice(350);
                    showToast('Heavy vibration');
                  }}
                  className="py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium text-slate-200 active:scale-95 transition"
                >
                  Heavy (350ms)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
