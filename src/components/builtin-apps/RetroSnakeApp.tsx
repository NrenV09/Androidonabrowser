import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAndroidSystem } from '../../runtime/AndroidSystemContext';
import { RotateCcw, Volume2, VolumeX, Trophy } from 'lucide-react';

type Point = { x: number; y: number };

export function RetroSnakeApp() {
  const { addLog, vibrateDevice, showToast } = useAndroidSystem();

  const GRID_SIZE = 18;
  const [snake, setSnake] = useState<Point[]>([
    { x: 9, y: 9 },
    { x: 9, y: 10 },
    { x: 9, y: 11 },
  ]);
  const [direction, setDirection] = useState<Point>({ x: 0, y: -1 });
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('retrosnake_high') || '0', 10);
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(130);

  const dirRef = useRef(direction);
  dirRef.current = direction;

  const spawnFood = useCallback((currentSnake: Point[]) => {
    while (true) {
      const rx = Math.floor(Math.random() * GRID_SIZE);
      const ry = Math.floor(Math.random() * GRID_SIZE);
      const collision = currentSnake.some((p) => p.x === rx && p.y === ry);
      if (!collision) return { x: rx, y: ry };
    }
  }, [GRID_SIZE]);

  const changeDirection = useCallback((newDir: Point) => {
    // Prevent 180-degree reversing
    if (dirRef.current.x + newDir.x === 0 && dirRef.current.y + newDir.y === 0) {
      return;
    }
    setDirection(newDir);
    vibrateDevice(8);
  }, [vibrateDevice]);

  const restartGame = useCallback(() => {
    const initSnake = [
      { x: 9, y: 9 },
      { x: 9, y: 10 },
      { x: 9, y: 11 },
    ];
    setSnake(initSnake);
    setDirection({ x: 0, y: -1 });
    setFood(spawnFood(initSnake));
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    setSpeed(130);
    vibrateDevice(25);
    addLog('D', 'SnakeActivity', 'Restarted game session');
  }, [spawnFood, vibrateDevice, addLog]);

  // Tick loop
  useEffect(() => {
    if (isGameOver || isPaused) return;

    const timer = setInterval(() => {
      setSnake((prevSnake) => {
        const head = {
          x: prevSnake[0].x + dirRef.current.x,
          y: prevSnake[0].y + dirRef.current.y,
        };

        // Wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setIsGameOver(true);
          vibrateDevice(100);
          addLog('W', 'SnakeActivity', 'Wall collision -> Game Over');
          return prevSnake;
        }

        // Self collision
        if (prevSnake.some((p) => p.x === head.x && p.y === head.y)) {
          setIsGameOver(true);
          vibrateDevice(100);
          addLog('W', 'SnakeActivity', 'Self collision -> Game Over');
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Food eaten
        if (head.x === food.x && head.y === food.y) {
          vibrateDevice(15);
          setScore((s) => {
            const next = s + 10;
            if (next > highScore) {
              setHighScore(next);
              localStorage.setItem('retrosnake_high', next.toString());
            }
            return next;
          });
          setFood(spawnFood(newSnake));
          setSpeed((sp) => Math.max(70, sp - 2));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    return () => clearInterval(timer);
  }, [isGameOver, isPaused, food, speed, highScore, spawnFood, vibrateDevice, addLog, GRID_SIZE]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') changeDirection({ x: 0, y: -1 });
      else if (e.key === 'ArrowDown' || e.key === 's') changeDirection({ x: 0, y: 1 });
      else if (e.key === 'ArrowLeft' || e.key === 'a') changeDirection({ x: -1, y: 0 });
      else if (e.key === 'ArrowRight' || e.key === 'd') changeDirection({ x: 1, y: 0 });
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [changeDirection]);

  return (
    <div id="retro_snake_app" className="w-full h-full flex flex-col bg-[#8fa428] text-[#1b2605] select-none p-3 justify-between font-mono">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between border-b-2 border-[#1b2605]/30 pb-1.5 mb-2">
          <div>
            <span className="text-xs font-black tracking-widest uppercase">SNAKE 97</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold">
            <span>SCR: {score}</span>
            <span>HI: {highScore}</span>
          </div>
        </div>
      </div>

      {/* Screen area with pixel border */}
      <div className="relative border-4 border-[#1b2605] bg-[#97ad2b] p-1 shadow-inner max-w-[310px] mx-auto w-full aspect-square">
        <div
          className="grid gap-[1px] w-full h-full"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
            const x = idx % GRID_SIZE;
            const y = Math.floor(idx / GRID_SIZE);
            const isHead = snake[0].x === x && snake[0].y === y;
            const isBody = !isHead && snake.some((p) => p.x === x && p.y === y);
            const isFood = food.x === x && food.y === y;

            return (
              <div
                key={idx}
                className={`w-full h-full rounded-[1px] ${
                  isHead
                    ? 'bg-[#1b2605] ring-1 ring-[#1b2605]'
                    : isBody
                    ? 'bg-[#1b2605]/80'
                    : isFood
                    ? 'bg-[#1b2605] animate-pulse scale-90'
                    : 'bg-[#97ad2b]'
                }`}
              />
            );
          })}
        </div>

        {/* Game over modal */}
        {isGameOver && (
          <div className="absolute inset-0 bg-[#97ad2b]/90 flex flex-col items-center justify-center p-3 text-center border-2 border-[#1b2605]">
            <span className="text-xl font-black mb-1">GAME OVER</span>
            <span className="text-xs mb-4">FINAL SCORE: {score}</span>
            <button
              onClick={restartGame}
              className="px-3 py-1.5 bg-[#1b2605] text-[#97ad2b] font-bold text-xs rounded border border-[#1b2605]"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* D-Pad */}
      <div className="flex flex-col items-center gap-1.5 pt-1">
        <button
          onClick={() => changeDirection({ x: 0, y: -1 })}
          className="w-12 h-9 bg-[#1b2605] active:bg-[#2d3f0a] text-[#8fa428] font-black rounded-lg text-sm flex items-center justify-center shadow"
        >
          ▲
        </button>
        <div className="flex gap-4">
          <button
            onClick={() => changeDirection({ x: -1, y: 0 })}
            className="w-12 h-9 bg-[#1b2605] active:bg-[#2d3f0a] text-[#8fa428] font-black rounded-lg text-sm flex items-center justify-center shadow"
          >
            ◀
          </button>
          <button
            onClick={() => changeDirection({ x: 0, y: 1 })}
            className="w-12 h-9 bg-[#1b2605] active:bg-[#2d3f0a] text-[#8fa428] font-black rounded-lg text-sm flex items-center justify-center shadow"
          >
            ▼
          </button>
          <button
            onClick={() => changeDirection({ x: 1, y: 0 })}
            className="w-12 h-9 bg-[#1b2605] active:bg-[#2d3f0a] text-[#8fa428] font-black rounded-lg text-sm flex items-center justify-center shadow"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}
