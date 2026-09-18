import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAndroidSystem } from '../../runtime/AndroidSystemContext';
import { Play, RotateCcw, Volume2, VolumeX, Trophy } from 'lucide-react';

export function FlappyDroidApp() {
  const { addLog, showToast, vibrateDevice } = useAndroidSystem();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('flappydroid_high') || '0', 10);
  });
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Audio synthesizer for retro arcade sound
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playTone = useCallback((freq: number, duration: number, type: OscillatorType = 'square') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // ignore audio failure
    }
  }, [soundEnabled]);

  // Game Engine physics refs
  const stateRef = useRef({
    birdY: 200,
    velocity: 0,
    gravity: 0.38,
    jump: -6.5,
    pipes: [] as { x: number; top: number; bottom: number; passed: boolean }[],
    frameCount: 0,
    isPlaying: false,
  });

  const jump = useCallback(() => {
    if (gameState === 'ready') {
      setGameState('playing');
      stateRef.current.isPlaying = true;
      stateRef.current.velocity = stateRef.current.jump;
      playTone(400, 0.08);
      vibrateDevice(20);
      addLog('D', 'FlappyDroid', 'Game started -> initial jump');
    } else if (gameState === 'playing') {
      stateRef.current.velocity = stateRef.current.jump;
      playTone(480, 0.08);
      vibrateDevice(15);
    }
  }, [gameState, playTone, vibrateDevice, addLog]);

  const restart = useCallback(() => {
    stateRef.current = {
      birdY: 200,
      velocity: 0,
      gravity: 0.38,
      jump: -6.5,
      pipes: [],
      frameCount: 0,
      isPlaying: false,
    };
    setScore(0);
    setGameState('ready');
    vibrateDevice(30);
    addLog('D', 'FlappyDroid', 'Activity reset');
  }, [vibrateDevice, addLog]);

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Clear sky background
      ctx.fillStyle = '#70c5ce';
      ctx.fillRect(0, 0, w, h);

      // Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(80, 100, 24, 0, Math.PI * 2);
      ctx.arc(110, 95, 30, 0, Math.PI * 2);
      ctx.arc(140, 100, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(260, 140, 20, 0, Math.PI * 2);
      ctx.arc(285, 135, 26, 0, Math.PI * 2);
      ctx.arc(310, 140, 20, 0, Math.PI * 2);
      ctx.fill();

      // Ground
      const groundH = 70;
      ctx.fillStyle = '#ded895';
      ctx.fillRect(0, h - groundH, w, groundH);
      ctx.fillStyle = '#73bf2e';
      ctx.fillRect(0, h - groundH, w, 14);

      if (stateRef.current.isPlaying) {
        stateRef.current.frameCount++;

        // Physics
        stateRef.current.velocity += stateRef.current.gravity;
        stateRef.current.birdY += stateRef.current.velocity;

        // Spawn pipes
        if (stateRef.current.frameCount % 95 === 0) {
          const gap = 110;
          const minTop = 60;
          const maxTop = h - groundH - gap - 60;
          const top = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;
          stateRef.current.pipes.push({
            x: w,
            top,
            bottom: top + gap,
            passed: false,
          });
        }

        // Update & Draw pipes
        for (let i = stateRef.current.pipes.length - 1; i >= 0; i--) {
          const p = stateRef.current.pipes[i];
          p.x -= 2.2;

          // Pipe styling
          ctx.fillStyle = '#73bf2e';
          ctx.strokeStyle = '#558022';
          ctx.lineWidth = 3;

          // Top pipe
          ctx.fillRect(p.x, 0, 48, p.top);
          ctx.strokeRect(p.x, 0, 48, p.top);
          // Top cap
          ctx.fillRect(p.x - 3, p.top - 20, 54, 20);
          ctx.strokeRect(p.x - 3, p.top - 20, 54, 20);

          // Bottom pipe
          const bH = h - groundH - p.bottom;
          ctx.fillRect(p.x, p.bottom, 48, bH);
          ctx.strokeRect(p.x, p.bottom, 48, bH);
          // Bottom cap
          ctx.fillRect(p.x - 3, p.bottom, 54, 20);
          ctx.strokeRect(p.x - 3, p.bottom, 54, 20);

          // Check score pass
          if (!p.passed && p.x + 48 < 90) {
            p.passed = true;
            setScore((s) => {
              const next = s + 1;
              playTone(680, 0.1);
              if (next > highScore) {
                setHighScore(next);
                localStorage.setItem('flappydroid_high', next.toString());
              }
              return next;
            });
          }

          // Collision detection with pipe
          const birdX = 90;
          const birdY = stateRef.current.birdY;
          const birdRadius = 14;

          if (
            birdX + birdRadius > p.x &&
            birdX - birdRadius < p.x + 48 &&
            (birdY - birdRadius < p.top || birdY + birdRadius > p.bottom)
          ) {
            handleGameOver();
          }

          // Remove off-screen pipes
          if (p.x < -60) {
            stateRef.current.pipes.splice(i, 1);
          }
        }

        // Floor / ceiling collision
        if (stateRef.current.birdY + 14 >= h - groundH || stateRef.current.birdY - 14 <= 0) {
          handleGameOver();
        }
      }

      // Draw Android Green Droid Bird
      const bx = 90;
      const by = stateRef.current.birdY;
      const angle = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, stateRef.current.velocity * 0.08));

      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(angle);

      // Green droid body
      ctx.fillStyle = '#3DDC84';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2BA862';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(6, -4, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#202124';
      ctx.beginPath();
      ctx.arc(7, -4, 2, 0, Math.PI * 2);
      ctx.fill();

      // Antennas
      ctx.strokeStyle = '#3DDC84';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-4, -14);
      ctx.lineTo(-8, -22);
      ctx.moveTo(4, -14);
      ctx.lineTo(8, -22);
      ctx.stroke();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    const handleGameOver = () => {
      stateRef.current.isPlaying = false;
      setGameState('gameover');
      playTone(180, 0.35, 'sawtooth');
      vibrateDevice(150);
      addLog('W', 'FlappyDroid', `Collision detected -> Game Over! Score: ${score}`);
      showToast(`Game Over! Score: ${score}`);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameState, highScore, playTone, vibrateDevice, addLog, showToast, score]);

  return (
    <div id="flappy_droid_app" className="relative w-full h-full flex flex-col bg-slate-900 select-none overflow-hidden">
      {/* Top App Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-emerald-800 text-white shadow z-10">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-emerald-400 flex items-center justify-center font-bold text-xs text-emerald-950">
            FD
          </div>
          <span className="font-semibold text-xs tracking-wide">Flappy Droid</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="flappy_toggle_sound"
            onClick={() => setSoundEnabled((s) => !s)}
            className="p-1 rounded hover:bg-emerald-700/60 text-emerald-100"
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
          <div className="flex items-center gap-1 text-xs font-mono bg-emerald-950/60 px-2 py-0.5 rounded-full text-emerald-300">
            <Trophy size={11} className="text-amber-400" />
            <span>{highScore}</span>
          </div>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div
        id="flappy_canvas_area"
        onClick={jump}
        className="relative flex-1 w-full cursor-pointer touch-none"
      >
        <canvas
          ref={canvasRef}
          width={360}
          height={540}
          className="w-full h-full object-cover block"
        />

        {/* Live Score Overlay */}
        {gameState === 'playing' && (
          <div className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none">
            <span className="text-4xl font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] font-mono">
              {score}
            </span>
          </div>
        )}

        {/* Ready Overlay */}
        {gameState === 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/25 backdrop-blur-[1px] p-4 text-center">
            <div className="bg-white/95 rounded-2xl p-5 shadow-xl max-w-[260px] text-slate-800 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                <Play size={24} className="ml-1" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Flappy Droid</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
                Tap anywhere or press space to fly through the green pipes.
              </p>
              <button
                id="flappy_start_btn"
                onClick={(e) => {
                  e.stopPropagation();
                  jump();
                }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition"
              >
                Tap to Start
              </button>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 backdrop-blur-sm p-4 text-center">
            <div className="bg-white rounded-2xl p-5 shadow-2xl max-w-[260px] w-full text-slate-800 flex flex-col items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">Crash!</span>
              <h3 className="font-black text-xl text-slate-900 mb-3">Game Over</h3>
              
              <div className="w-full bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100 flex justify-around">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-medium">SCORE</span>
                  <span className="text-xl font-bold text-slate-800">{score}</span>
                </div>
                <div className="w-px bg-slate-200" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-medium">BEST</span>
                  <span className="text-xl font-bold text-amber-600">{highScore}</span>
                </div>
              </div>

              <button
                id="flappy_restart_btn"
                onClick={(e) => {
                  e.stopPropagation();
                  restart();
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow"
              >
                <RotateCcw size={13} />
                <span>Play Again</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
