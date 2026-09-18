import React, { useState, useCallback } from 'react';
import { useAndroidSystem } from '../../runtime/AndroidSystemContext';
import { Delete, History, Sparkles } from 'lucide-react';

export function MaterialCalculatorApp() {
  const { vibrateDevice, addLog } = useAndroidSystem();

  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isScientific, setIsScientific] = useState(false);

  const handleDigit = useCallback((digit: string) => {
    vibrateDevice(10);
    setDisplay((prev) => {
      if (prev === '0' || prev === 'Error') return digit;
      return prev + digit;
    });
  }, [vibrateDevice]);

  const handleOperator = useCallback((op: string) => {
    vibrateDevice(15);
    setExpression((prev) => `${expression ? expression : ''} ${display} ${op}`);
    setDisplay('0');
  }, [vibrateDevice, display, expression]);

  const handleClear = useCallback(() => {
    vibrateDevice(20);
    setDisplay('0');
    setExpression('');
  }, [vibrateDevice]);

  const handleDelete = useCallback(() => {
    vibrateDevice(10);
    setDisplay((prev) => {
      if (prev.length <= 1 || prev === 'Error') return '0';
      return prev.slice(0, -1);
    });
  }, [vibrateDevice]);

  const handleEqual = useCallback(() => {
    vibrateDevice(25);
    try {
      const fullExpr = `${expression} ${display}`.trim();
      if (!fullExpr) return;

      // Safe sanitized arithmetic evaluation
      const sanitized = fullExpr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E');

      // Function constructor evaluation with math bounds
      const result = Function(`'use strict'; return (${sanitized})`)();
      const formatted = Number.isFinite(result)
        ? parseFloat(result.toFixed(8)).toString()
        : 'Error';

      setHistory((prev) => [`${fullExpr} = ${formatted}`, ...prev.slice(0, 20)]);
      setExpression('');
      setDisplay(formatted);
      addLog('D', 'CalculatorActivity', `Calculate: ${fullExpr} = ${formatted}`);
    } catch {
      setDisplay('Error');
      addLog('E', 'CalculatorActivity', 'Arithmetic syntax error');
    }
  }, [expression, display, vibrateDevice, addLog]);

  const handleScientific = useCallback((fn: string) => {
    vibrateDevice(15);
    const num = parseFloat(display);
    if (isNaN(num)) return;

    let res = 0;
    switch (fn) {
      case 'sin': res = Math.sin((num * Math.PI) / 180); break;
      case 'cos': res = Math.cos((num * Math.PI) / 180); break;
      case 'tan': res = Math.tan((num * Math.PI) / 180); break;
      case 'sqrt': res = Math.sqrt(num); break;
      case 'log': res = Math.log10(num); break;
      case 'ln': res = Math.log(num); break;
      case 'sq': res = Math.pow(num, 2); break;
      case 'neg': res = -num; break;
      case 'pct': res = num / 100; break;
    }
    const formatted = parseFloat(res.toFixed(8)).toString();
    setDisplay(formatted);
  }, [display, vibrateDevice]);

  return (
    <div id="material_calculator_app" className="w-full h-full flex flex-col bg-[#f7f9fc] select-none text-slate-800">
      {/* Top action bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200/70">
        <span className="text-xs font-semibold text-slate-600">Calculator</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsScientific((s) => !s)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              isScientific ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            Scientific
          </button>
          <button
            onClick={() => setShowHistory((h) => !h)}
            className={`p-1 rounded text-slate-600 hover:bg-slate-200 transition ${
              showHistory ? 'text-blue-600' : ''
            }`}
          >
            <History size={15} />
          </button>
        </div>
      </div>

      {/* History Slide Panel */}
      {showHistory ? (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 bg-slate-100/80">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">History Tape</span>
            <button
              onClick={() => setHistory([])}
              className="text-[11px] text-rose-500 hover:underline"
            >
              Clear
            </button>
          </div>
          {history.length === 0 ? (
            <div className="text-xs text-slate-400 py-6 text-center italic">No calculation history yet</div>
          ) : (
            history.map((h, i) => (
              <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-200/80 text-xs font-mono text-right text-slate-700">
                {h}
              </div>
            ))
          )}
        </div>
      ) : (
        /* Display Area */
        <div className="flex-1 flex flex-col justify-end px-5 py-3 text-right">
          <div className="text-xs font-mono text-slate-400 h-5 overflow-hidden text-ellipsis whitespace-nowrap">
            {expression}
          </div>
          <div className="text-4xl font-light text-slate-900 tracking-tight overflow-x-auto whitespace-nowrap scrollbar-none py-1">
            {display}
          </div>
        </div>
      )}

      {/* Keypad */}
      <div className="bg-white rounded-t-3xl p-3 border-t border-slate-200 shadow-sm flex flex-col gap-1.5">
        {/* Scientific row if enabled */}
        {isScientific && (
          <div className="grid grid-cols-5 gap-1.5 mb-1 text-xs">
            <button onClick={() => handleScientific('sin')} className="py-2 bg-slate-100 rounded-lg font-medium text-slate-700 active:bg-slate-200">sin</button>
            <button onClick={() => handleScientific('cos')} className="py-2 bg-slate-100 rounded-lg font-medium text-slate-700 active:bg-slate-200">cos</button>
            <button onClick={() => handleScientific('tan')} className="py-2 bg-slate-100 rounded-lg font-medium text-slate-700 active:bg-slate-200">tan</button>
            <button onClick={() => handleScientific('sqrt')} className="py-2 bg-slate-100 rounded-lg font-medium text-slate-700 active:bg-slate-200">√</button>
            <button onClick={() => handleScientific('log')} className="py-2 bg-slate-100 rounded-lg font-medium text-slate-700 active:bg-slate-200">log</button>
          </div>
        )}

        <div className="grid grid-cols-4 gap-1.5 text-base">
          <button onClick={handleClear} className="h-12 bg-rose-50 text-rose-600 rounded-2xl font-semibold active:bg-rose-100">AC</button>
          <button onClick={handleDelete} className="h-12 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center active:bg-slate-200">
            <Delete size={17} />
          </button>
          <button onClick={() => handleScientific('pct')} className="h-12 bg-slate-100 text-slate-700 rounded-2xl font-medium active:bg-slate-200">%</button>
          <button onClick={() => handleOperator('÷')} className="h-12 bg-blue-100 text-blue-700 rounded-2xl font-semibold text-lg active:bg-blue-200">÷</button>

          <button onClick={() => handleDigit('7')} className="h-12 bg-slate-50 text-slate-800 rounded-2xl font-medium active:bg-slate-200">7</button>
          <button onClick={() => handleDigit('8')} className="h-12 bg-slate-50 text-slate-800 rounded-2xl font-medium active:bg-slate-200">8</button>
          <button onClick={() => handleDigit('9')} className="h-12 bg-slate-50 text-slate-800 rounded-2xl font-medium active:bg-slate-200">9</button>
          <button onClick={() => handleOperator('×')} className="h-12 bg-blue-100 text-blue-700 rounded-2xl font-semibold text-lg active:bg-blue-200">×</button>

          <button onClick={() => handleDigit('4')} className="h-12 bg-slate-50 text-slate-800 rounded-2xl font-medium active:bg-slate-200">4</button>
          <button onClick={() => handleDigit('5')} className="h-12 bg-slate-50 text-slate-800 rounded-2xl font-medium active:bg-slate-200">5</button>
          <button onClick={() => handleDigit('6')} className="h-12 bg-slate-50 text-slate-800 rounded-2xl font-medium active:bg-slate-200">6</button>
          <button onClick={() => handleOperator('−')} className="h-12 bg-blue-100 text-blue-700 rounded-2xl font-semibold text-lg active:bg-blue-200">−</button>

          <button onClick={() => handleDigit('1')} className="h-12 bg-slate-50 text-slate-800 rounded-2xl font-medium active:bg-slate-200">1</button>
          <button onClick={() => handleDigit('2')} className="h-12 bg-slate-50 text-slate-800 rounded-2xl font-medium active:bg-slate-200">2</button>
          <button onClick={() => handleDigit('3')} className="h-12 bg-slate-50 text-slate-800 rounded-2xl font-medium active:bg-slate-200">3</button>
          <button onClick={() => handleOperator('+')} className="h-12 bg-blue-100 text-blue-700 rounded-2xl font-semibold text-lg active:bg-blue-200">+</button>

          <button onClick={() => handleScientific('neg')} className="h-12 bg-slate-50 text-slate-800 rounded-2xl font-medium active:bg-slate-200">±</button>
          <button onClick={() => handleDigit('0')} className="h-12 bg-slate-50 text-slate-800 rounded-2xl font-medium active:bg-slate-200">0</button>
          <button onClick={() => handleDigit('.')} className="h-12 bg-slate-50 text-slate-800 rounded-2xl font-semibold active:bg-slate-200">.</button>
          <button onClick={handleEqual} className="h-12 bg-blue-600 text-white rounded-2xl font-bold text-lg active:bg-blue-700 shadow-sm">=</button>
        </div>
      </div>
    </div>
  );
}
