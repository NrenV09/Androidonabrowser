import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAndroidSystem } from '../../runtime/AndroidSystemContext';
import { RotateCcw, Award, Undo2 } from 'lucide-react';

type Board = number[][];

export function App2048() {
  const { addLog, vibrateDevice, showToast } = useAndroidSystem();

  const [board, setBoard] = useState<Board>(() => getInitialBoard());
  const [prevBoard, setPrevBoard] = useState<Board | null>(null);
  const [score, setScore] = useState(0);
  const [prevScore, setPrevScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('android_2048_high') || '0', 10);
  });
  const [won, setWon] = useState(false);
  const [over, setOver] = useState(false);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  function getInitialBoard(): Board {
    const b: Board = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    addRandom(b);
    addRandom(b);
    return b;
  }

  function addRandom(b: Board): boolean {
    const empty: [number, number][] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (b[r][c] === 0) empty.push([r, c]);
      }
    }
    if (empty.length === 0) return false;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    b[r][c] = Math.random() < 0.9 ? 2 : 4;
    return true;
  }

  const resetGame = useCallback(() => {
    const b = getInitialBoard();
    setBoard(b);
    setPrevBoard(null);
    setScore(0);
    setWon(false);
    setOver(false);
    vibrateDevice(20);
    addLog('D', '2048App', 'New game started');
  }, [vibrateDevice, addLog]);

  const undoMove = useCallback(() => {
    if (!prevBoard) return;
    setBoard(prevBoard);
    setScore(prevScore);
    setPrevBoard(null);
    vibrateDevice(15);
  }, [prevBoard, prevScore, vibrateDevice]);

  // Movement logic
  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (over) return;

    let moved = false;
    let addedScore = 0;
    const currentCopy = board.map((row) => [...row]);
    const newBoard = board.map((row) => [...row]);

    const rotate = (m: Board): Board => {
      return m[0].map((_, i) => m.map((row) => row[i]).reverse());
    };

    let rotated = newBoard;
    let numRotations = 0;
    if (direction === 'up') {
      rotated = rotate(rotate(rotate(newBoard)));
      numRotations = 3;
    } else if (direction === 'right') {
      rotated = rotate(rotate(newBoard));
      numRotations = 2;
    } else if (direction === 'down') {
      rotated = rotate(newBoard);
      numRotations = 1;
    }

    // Slide left on rotated
    for (let r = 0; r < 4; r++) {
      const row = rotated[r].filter((v) => v !== 0);
      for (let c = 0; c < row.length - 1; c++) {
        if (row[c] === row[c + 1]) {
          row[c] *= 2;
          addedScore += row[c];
          if (row[c] === 2048 && !won) {
            setWon(true);
            showToast('You reached 2048!');
          }
          row.splice(c + 1, 1);
        }
      }
      while (row.length < 4) row.push(0);

      for (let c = 0; c < 4; c++) {
        if (rotated[r][c] !== row[c]) moved = true;
        rotated[r][c] = row[c];
      }
    }

    // Rotate back
    const restoreRotations = (4 - numRotations) % 4;
    for (let i = 0; i < restoreRotations; i++) {
      rotated = rotate(rotated);
    }

    if (moved) {
      setPrevBoard(currentCopy);
      setPrevScore(score);

      addRandom(rotated);
      setBoard(rotated);
      vibrateDevice(10);

      const newScore = score + addedScore;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('android_2048_high', newScore.toString());
      }

      // Check game over
      let hasMoves = false;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (rotated[r][c] === 0) hasMoves = true;
          if (r < 3 && rotated[r][c] === rotated[r + 1][c]) hasMoves = true;
          if (c < 3 && rotated[r][c] === rotated[r][c + 1]) hasMoves = true;
        }
      }
      if (!hasMoves) {
        setOver(true);
        addLog('W', '2048App', `No more valid moves -> Game Over! Final: ${newScore}`);
      }
    }
  }, [board, over, won, score, highScore, vibrateDevice, showToast, addLog]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') move('up');
      else if (e.key === 'ArrowDown' || e.key === 's') move('down');
      else if (e.key === 'ArrowLeft' || e.key === 'a') move('left');
      else if (e.key === 'ArrowRight' || e.key === 'd') move('right');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [move]);

  // Touch Swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) > 25) {
      if (absX > absY) {
        move(dx > 0 ? 'right' : 'left');
      } else {
        move(dy > 0 ? 'down' : 'up');
      }
    }
    touchStartRef.current = null;
  };

  const getTileColor = (val: number) => {
    switch (val) {
      case 2: return 'bg-amber-100 text-stone-800';
      case 4: return 'bg-amber-200 text-stone-800';
      case 8: return 'bg-orange-400 text-white font-bold';
      case 16: return 'bg-orange-500 text-white font-bold';
      case 32: return 'bg-rose-500 text-white font-bold';
      case 64: return 'bg-rose-600 text-white font-bold';
      case 128: return 'bg-yellow-400 text-white font-extrabold shadow-sm';
      case 256: return 'bg-yellow-500 text-white font-extrabold shadow-sm';
      case 512: return 'bg-yellow-600 text-white font-extrabold shadow-md';
      case 1024: return 'bg-amber-500 text-white font-black text-sm shadow-md';
      case 2048: return 'bg-amber-400 text-white font-black text-sm shadow-lg ring-2 ring-amber-300';
      default: return 'bg-stone-300/40 text-transparent';
    }
  };

  return (
    <div
      id="app_2048"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="w-full h-full flex flex-col bg-[#faf8ef] select-none p-3 justify-between"
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-black text-stone-700 tracking-tight leading-none">2048</h1>
            <p className="text-[11px] text-stone-500 font-medium">Join numbers to reach 2048!</p>
          </div>
          <div className="flex gap-1.5">
            <div className="bg-[#bbada0] px-2.5 py-1 rounded-lg text-center min-w-[55px]">
              <span className="text-[9px] font-bold uppercase text-amber-100 block leading-tight">Score</span>
              <span className="text-sm font-black text-white">{score}</span>
            </div>
            <div className="bg-[#bbada0] px-2.5 py-1 rounded-lg text-center min-w-[55px]">
              <span className="text-[9px] font-bold uppercase text-amber-100 block leading-tight">Best</span>
              <span className="text-sm font-black text-white">{highScore}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <button
            id="undo_2048_btn"
            onClick={undoMove}
            disabled={!prevBoard}
            className="flex items-center gap-1 px-2.5 py-1 bg-stone-200 disabled:opacity-40 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-300 transition"
          >
            <Undo2 size={12} />
            <span>Undo</span>
          </button>
          <button
            id="reset_2048_btn"
            onClick={resetGame}
            className="flex items-center gap-1 px-3 py-1 bg-[#8f7a66] hover:bg-[#7e6b59] text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            <RotateCcw size={12} />
            <span>New Game</span>
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="relative bg-[#bbada0] p-2 rounded-xl shadow-inner max-w-[320px] mx-auto w-full aspect-square">
        <div className="grid grid-cols-4 grid-rows-4 gap-2 w-full h-full">
          {board.map((row, r) =>
            row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                className={`rounded-lg flex items-center justify-center transition-all duration-100 ${getTileColor(
                  val
                )}`}
              >
                {val > 0 && (
                  <span className={`text-center font-sans ${val > 512 ? 'text-sm' : 'text-lg'}`}>
                    {val}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Game Over Modal */}
        {over && (
          <div className="absolute inset-0 bg-[#eee4da]/85 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-4 text-center animate-fade-in">
            <h3 className="text-2xl font-black text-stone-800 mb-1">Game Over!</h3>
            <p className="text-xs text-stone-600 mb-4 font-medium">Final score: {score}</p>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-[#8f7a66] text-white font-bold text-xs rounded-xl shadow hover:bg-[#7e6b59]"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Virtual D-pad for easy touch accessibility */}
      <div className="flex flex-col items-center gap-1 py-1">
        <button
          onClick={() => move('up')}
          className="w-10 h-7 bg-stone-200 active:bg-stone-300 rounded text-xs font-bold text-stone-700 shadow-sm"
        >
          ▲
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => move('left')}
            className="w-10 h-7 bg-stone-200 active:bg-stone-300 rounded text-xs font-bold text-stone-700 shadow-sm"
          >
            ◀
          </button>
          <button
            onClick={() => move('down')}
            className="w-10 h-7 bg-stone-200 active:bg-stone-300 rounded text-xs font-bold text-stone-700 shadow-sm"
          >
            ▼
          </button>
          <button
            onClick={() => move('right')}
            className="w-10 h-7 bg-stone-200 active:bg-stone-300 rounded text-xs font-bold text-stone-700 shadow-sm"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}
