import React, { useState } from 'react';
import { useAndroidSystem } from '../../runtime/AndroidSystemContext';
import { ArrowLeft, RotateCcw, Check, Sparkles, Grid3X3 } from 'lucide-react';

// 8x8 Picross puzzle representing the Android Bugdroid head icon
const PICROSS_TARGET = [
  [0, 1, 0, 0, 0, 0, 1, 0], // Antennas
  [0, 0, 1, 0, 0, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0], // Head dome
  [1, 1, 0, 1, 1, 0, 1, 1], // Eyes
  [1, 1, 1, 1, 1, 1, 1, 1], // Cheeks
  [1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0], // Neck gap
  [0, 1, 1, 1, 1, 1, 1, 0], // Torso top
];

export function Android10EasterEggApp() {
  const { pressBack, showToast, vibrateDevice, addLog } = useAndroidSystem();

  // '1' rotation in degrees: 0, 45, 90, 135, 180, 225, 270, 315
  const [rotation1, setRotation1] = useState(0);
  const [pos1, setPos1] = useState({ x: -28, y: 0 });
  const [isQFormed, setIsQFormed] = useState(false);
  const [showGame, setShowGame] = useState(false);

  // Picross grid state: 8x8 (0 = empty, 1 = filled)
  const [grid, setGrid] = useState<number[][]>(() =>
    Array(8).fill(0).map(() => Array(8).fill(0))
  );
  const [solved, setSolved] = useState(false);

  // Rotate '1'
  const handleRotate1 = () => {
    vibrateDevice(15);
    const nextRot = (rotation1 + 45) % 360;
    setRotation1(nextRot);

    // If rotation aligns (e.g. 45 or 225 deg) and overlapped with '0', form Q
    if ((nextRot === 45 || nextRot === 225) && Math.abs(pos1.x) < 35) {
      setIsQFormed(true);
      vibrateDevice(40);
      showToast('Android "Q" unlocked!');
      addLog('I', 'Android10EasterEgg', 'Easter Egg triggered: "Q" pattern recognized');
    }
  };

  const handleCellClick = (r: number, c: number) => {
    if (solved) return;
    vibrateDevice(10);
    const next = grid.map((row, ri) =>
      row.map((val, ci) => (ri === r && ci === c ? (val === 1 ? 0 : 1) : val))
    );
    setGrid(next);

    // Check solution
    let isCorrect = true;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (next[i][j] !== PICROSS_TARGET[i][j]) {
          isCorrect = false;
          break;
        }
      }
    }

    if (isCorrect) {
      setSolved(true);
      vibrateDevice(80);
      showToast('🎉 Android 10 Nonogram Solved!');
      addLog('I', 'Android10EasterEgg', 'Picross puzzle completed! Android icon verified.');
    }
  };

  const resetPicross = () => {
    setGrid(Array(8).fill(0).map(() => Array(8).fill(0)));
    setSolved(false);
  };

  const autoSolvePicross = () => {
    setGrid(PICROSS_TARGET.map((row) => [...row]));
    setSolved(true);
    vibrateDevice(40);
    showToast('Revealed Android Bugdroid Icon!');
  };

  return (
    <div
      id="android10_easter_egg"
      className="w-full h-full flex flex-col bg-slate-950 text-white select-none relative overflow-hidden"
    >
      {/* Background Animated Diagonal Pattern (Android 10 style) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #00875A 0, #00875A 10px, transparent 10px, transparent 20px)',
        }}
      />

      {/* Top action bar */}
      <div className="relative z-10 flex items-center justify-between px-3 py-2 bg-black/40 backdrop-blur-sm border-b border-white/10">
        <button
          onClick={pressBack}
          className="p-1 rounded-full text-slate-300 hover:text-white"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
            Android 10
          </span>
          <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
            API 29
          </span>
        </div>
        <button
          onClick={() => {
            setShowGame(!showGame);
            vibrateDevice(20);
          }}
          className="p-1 text-slate-400 hover:text-emerald-400 transition"
          title={showGame ? 'Back to Q Logo' : 'Play Picross'}
        >
          <Grid3X3 size={17} />
        </button>
      </div>

      {/* View 1: Interactive 'android 10' / 'Q' Logo */}
      {!showGame ? (
        <div className="flex-1 flex flex-col items-center justify-between p-6 relative z-10">
          <div className="text-center pt-4">
            <span className="text-xs font-mono text-slate-400 tracking-widest uppercase block">
              Android Q Easter Egg
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              Tap and drag the numbers to form the letter <strong className="text-emerald-400 font-mono">Q</strong>
            </p>
          </div>

          {/* Center Interactive Logo */}
          <div className="flex flex-col items-center justify-center my-auto">
            <span className="text-3xl font-bold tracking-tight text-slate-400 font-sans mb-4">
              android
            </span>

            {/* The interactive '1' and '0' numbers */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Digit 0 (Fixed Base) */}
              <div
                onClick={() => {
                  vibrateDevice(10);
                  setIsQFormed(true);
                }}
                className="w-32 h-32 rounded-full border-[18px] border-emerald-400 flex items-center justify-center shadow-[0_0_30px_rgba(52,168,83,0.3)] cursor-pointer active:scale-95 transition-transform"
              />

              {/* Digit 1 (Draggable & Rotatable) */}
              <div
                onClick={handleRotate1}
                title="Tap to rotate the 1"
                style={{
                  transform: `translate(${pos1.x}px, ${pos1.y}px) rotate(${rotation1}deg)`,
                  transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
                className="absolute w-5 h-28 bg-white rounded-full flex flex-col items-center justify-start cursor-pointer active:scale-105 shadow-xl select-none"
              >
                {/* 1's diagonal beak */}
                <div className="w-5 h-8 bg-white rounded-md -translate-x-2.5 -translate-y-1 rotate-45" />
              </div>
            </div>

            {/* Quick alignment toggles */}
            <div className="flex items-center gap-2 mt-6">
              <button
                onClick={handleRotate1}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 flex items-center gap-1.5 active:scale-95 transition"
              >
                <RotateCcw size={12} />
                <span>Rotate 1 ({rotation1}°)</span>
              </button>
              <button
                onClick={() => {
                  setRotation1(45);
                  setPos1({ x: 0, y: 0 });
                  setIsQFormed(true);
                  vibrateDevice(30);
                  showToast('Aligned into "Q"!');
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow active:scale-95 transition flex items-center gap-1"
              >
                <Sparkles size={12} />
                <span>Form Q</span>
              </button>
            </div>
          </div>

          {/* Bottom Launch Game Button */}
          <div className="w-full flex flex-col items-center gap-2 pb-2">
            <button
              onClick={() => {
                setShowGame(true);
                vibrateDevice(30);
              }}
              className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                isQFormed
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-900/40 animate-pulse'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Grid3X3 size={15} />
              <span>{isQFormed ? 'Launch Android 10 Nonogram Game' : 'Play Picross Puzzle'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* View 2: The Android 10 Nonogram / Picross Puzzle Minigame */
        <div className="flex-1 flex flex-col items-center justify-between p-4 relative z-10 overflow-y-auto">
          <div className="text-center">
            <h3 className="text-sm font-bold text-emerald-400 tracking-tight">
              Android 10 Nonogram Puzzle
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Fill the grid to reveal the hidden system icon
            </p>
          </div>

          {/* 8x8 Grid */}
          <div className="my-auto flex flex-col items-center bg-slate-900/90 p-3 rounded-2xl border border-slate-800 shadow-2xl">
            <div className="grid grid-cols-8 gap-1 p-1 bg-black/60 rounded-xl border border-slate-800">
              {grid.map((row, r) =>
                row.map((val, c) => (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md transition-all flex items-center justify-center font-bold text-xs ${
                      val === 1
                        ? solved
                          ? 'bg-emerald-400 text-slate-950 shadow-sm shadow-emerald-400/50'
                          : 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50'
                    }`}
                  >
                    {val === 1 && solved && (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                    )}
                  </button>
                ))
              )}
            </div>

            {solved && (
              <div className="mt-3 flex items-center gap-1.5 px-3 py-1 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-full text-xs font-semibold animate-in zoom-in-95">
                <Check size={14} />
                <span>Bugdroid Icon Unlocked!</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="w-full flex items-center gap-2 pt-2">
            <button
              onClick={resetPicross}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition"
            >
              Clear Grid
            </button>
            <button
              onClick={autoSolvePicross}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition"
            >
              Reveal Solution
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
