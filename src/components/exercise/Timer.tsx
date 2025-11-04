'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw, Plus, Settings } from 'lucide-react';

export default function Timer() {
  const [time, setTime] = useState(0); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'stopwatch' | 'countdown' | 'interval'>('stopwatch');
  const [countdownTime, setCountdownTime] = useState(300); // 5 minutes default
  const [intervalWork, setIntervalWork] = useState(30);
  const [intervalRest, setIntervalRest] = useState(10);
  const [currentInterval, setCurrentInterval] = useState<'work' | 'rest'>('work');
  const [rounds, setRounds] = useState(8);
  const [currentRound, setCurrentRound] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          if (mode === 'stopwatch') {
            return prevTime + 1;
          } else if (mode === 'countdown') {
            if (prevTime <= 1) {
              setIsRunning(false);
              playBeep();
              return 0;
            }
            return prevTime - 1;
          } else if (mode === 'interval') {
            const newTime = prevTime - 1;
            
            if (newTime <= 0) {
              if (currentInterval === 'work') {
                setCurrentInterval('rest');
                setTime(intervalRest);
                playBeep();
              } else {
                if (currentRound >= rounds) {
                  setIsRunning(false);
                  setCurrentRound(1);
                  setCurrentInterval('work');
                  setTime(intervalWork);
                  playBeep(3); // Triple beep for completion
                  return 0;
                } else {
                  setCurrentRound(prev => prev + 1);
                  setCurrentInterval('work');
                  setTime(intervalWork);
                  playBeep();
                }
              }
              return newTime;
            }
            
            return newTime;
          }
          return prevTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, mode, currentInterval, currentRound, rounds, intervalWork, intervalRest]);

  const playBeep = (times = 1) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    
    for (let i = 0; i < times; i++) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, now + i * 0.3);
      gainNode.gain.linearRampToValueAtTime(0.3, now + i * 0.3 + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.3 + 0.2);
      
      oscillator.start(now + i * 0.3);
      oscillator.stop(now + i * 0.3 + 0.2);
    }
  };

  const startTimer = () => {
    if (mode === 'countdown' && time === 0) {
      setTime(countdownTime);
    } else if (mode === 'interval' && time === 0) {
      setTime(intervalWork);
      setCurrentInterval('work');
      setCurrentRound(1);
    }
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === 'stopwatch') {
      setTime(0);
    } else if (mode === 'countdown') {
      setTime(countdownTime);
    } else if (mode === 'interval') {
      setTime(intervalWork);
      setCurrentInterval('work');
      setCurrentRound(1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addTime = (amount: number) => {
    if (!isRunning) {
      if (mode === 'countdown') {
        setCountdownTime(prev => Math.max(0, prev + amount));
        setTime(prev => Math.max(0, prev + amount));
      } else if (mode === 'stopwatch') {
        setTime(prev => Math.max(0, prev + amount));
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        {/* Mode Selector */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { id: 'stopwatch', label: 'Stopwatch' },
              { id: 'countdown', label: 'Countdown' },
              { id: 'interval', label: 'Interval' }
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => {
                  setMode(id as any);
                  setIsRunning(false);
                  if (id === 'stopwatch') setTime(0);
                  else if (id === 'countdown') setTime(countdownTime);
                  else if (id === 'interval') {
                    setTime(intervalWork);
                    setCurrentInterval('work');
                    setCurrentRound(1);
                  }
                }}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  mode === id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-8">
          <div className={`text-8xl font-mono font-bold mb-4 ${
            mode === 'interval' && currentInterval === 'work' ? 'text-green-600' :
            mode === 'interval' && currentInterval === 'rest' ? 'text-blue-600' :
            'text-gray-900'
          }`}>
            {formatTime(time)}
          </div>

          {mode === 'interval' && (
            <div className="space-y-2">
              <div className={`text-xl font-semibold ${
                currentInterval === 'work' ? 'text-green-600' : 'text-blue-600'
              }`}>
                {currentInterval === 'work' ? '🔥 WORK' : '💧 REST'}
              </div>
              <div className="text-gray-600">
                Round {currentRound} of {rounds}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentInterval === 'work' ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ 
                    width: `${((currentInterval === 'work' ? intervalWork - time : intervalRest - time) / 
                             (currentInterval === 'work' ? intervalWork : intervalRest)) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Time Adjustments */}
        {(mode === 'countdown' || mode === 'stopwatch') && !isRunning && (
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => addTime(-60)}
              className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              -1 min
            </button>
            <button
              onClick={() => addTime(-30)}
              className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              -30s
            </button>
            <button
              onClick={() => addTime(30)}
              className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Plus className="w-3 h-3" />
              30s
            </button>
            <button
              onClick={() => addTime(60)}
              className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Plus className="w-3 h-3" />
              1 min
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={isRunning ? pauseTimer : startTimer}
            className={`flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-colors ${
              isRunning
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            {isRunning ? 'Pause' : 'Start'}
          </button>
          
          <button
            onClick={resetTimer}
            className="flex items-center gap-2 px-8 py-4 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-semibold text-lg transition-colors"
          >
            <RotateCcw className="w-6 h-6" />
            Reset
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-6 py-4 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-xl font-semibold text-lg transition-colors"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timer Settings</h3>
            
            {mode === 'countdown' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Countdown Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={Math.floor(countdownTime / 60)}
                    onChange={(e) => {
                      const minutes = parseInt(e.target.value) || 1;
                      setCountdownTime(minutes * 60);
                      if (!isRunning) setTime(minutes * 60);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {mode === 'interval' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Interval (seconds)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={intervalWork}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 30;
                      setIntervalWork(value);
                      if (!isRunning && currentInterval === 'work') setTime(value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rest Interval (seconds)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={intervalRest}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 10;
                      setIntervalRest(value);
                      if (!isRunning && currentInterval === 'rest') setTime(value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Rounds
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={rounds}
                    onChange={(e) => setRounds(parseInt(e.target.value) || 8)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Usage Tips */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Tips:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>Stopwatch:</strong> Perfect for tracking workout duration</li>
            <li>• <strong>Countdown:</strong> Set a specific workout time limit</li>
            <li>• <strong>Interval:</strong> Ideal for HIIT workouts with work/rest cycles</li>
            <li>• Audio beeps will notify you of interval changes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}