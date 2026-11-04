import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { Play, Pause, Square, Timer, TrendingUp, Target, Save } from 'lucide-react';

export default function StudyTimer() {
  const { data, addStudySession, getStudyHours, setDailyGoal, updateTodayCompletedMinutes } = useData();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [goalMinutes, setGoalMinutes] = useState(120);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!selectedSubject) return;
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    if (seconds > 0 && selectedSubject) {
      addStudySession(selectedSubject, seconds);
    }
    setSeconds(0);
  };

  const handleSaveGoal = () => {
    setDailyGoal(goalMinutes);
  };

  const dailyHours = getStudyHours(undefined, 'daily');
  const weeklyHours = getStudyHours(undefined, 'weekly');
  const monthlyHours = getStudyHours(undefined, 'monthly');
  const todayMinutes = getStudyHours(undefined, 'daily') * 60;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-100">Study Timer</h1>
        <p className="text-dark-400 text-sm mt-1">Track your study sessions and build consistency</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Timer Card */}
        <div className="lg:col-span-2 bg-dark-800 rounded-xl border border-dark-700 p-6">
          <div className="text-center space-y-6">
            {/* Subject selector */}
            <div className="max-w-xs mx-auto">
              <label className="block text-sm font-medium text-dark-300 mb-2">Select Subject</label>
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-200 focus:outline-none focus:border-accent"
                disabled={isRunning}
              >
                <option value="">Choose a subject...</option>
                {data.subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Timer Display */}
            <div className="py-8">
              <div className="text-6xl md:text-7xl font-mono font-bold text-dark-100 tracking-wider">
                {formatTime(seconds)}
              </div>
              {isRunning && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm text-success">Recording...</span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  disabled={!selectedSubject}
                  className="flex items-center gap-2 px-6 py-3 bg-success hover:bg-success/80 disabled:bg-dark-600 disabled:text-dark-500 text-white font-medium rounded-xl transition-colors"
                >
                  <Play className="w-5 h-5" /> Start
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="flex items-center gap-2 px-6 py-3 bg-warning hover:bg-warning/80 text-white font-medium rounded-xl transition-colors"
                >
                  <Pause className="w-5 h-5" /> Pause
                </button>
              )}
              <button
                onClick={handleStop}
                disabled={seconds === 0}
                className="flex items-center gap-2 px-6 py-3 bg-danger hover:bg-danger/80 disabled:bg-dark-600 disabled:text-dark-500 text-white font-medium rounded-xl transition-colors"
              >
                <Square className="w-5 h-5" /> Stop & Save
              </button>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-4">
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
            <h3 className="text-sm font-semibold text-dark-300 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" /> Study Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark-400">Today</span>
                <span className="text-sm font-medium text-dark-100">{dailyHours.toFixed(1)}h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark-400">This Week</span>
                <span className="text-sm font-medium text-dark-100">{weeklyHours.toFixed(1)}h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark-400">This Month</span>
                <span className="text-sm font-medium text-dark-100">{monthlyHours.toFixed(1)}h</span>
              </div>
            </div>
          </div>

          {/* Daily Goal */}
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
            <h3 className="text-sm font-semibold text-dark-300 mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-accent" /> Daily Goal
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={dailyGoal}
                  onChange={e => setDailyGoal(Number(e.target.value))}
                  className="flex-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-accent"
                  min={1}
                  max={720}
                />
                <span className="text-sm text-dark-400">min</span>
              </div>
              <button onClick={handleSaveGoal} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-accent/10 hover:bg-accent/20 text-accent-light text-sm font-medium rounded-lg transition-colors">
                <Save className="w-4 h-4" /> Save Goal
              </button>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-dark-400 mb-1">
                  <span>{Math.round(todayMinutes)} / {dailyGoal} min</span>
                  <span>{Math.round(Math.min(100, (todayMinutes / dailyGoal) * 100))}%</span>
                </div>
                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${Math.min(100, (todayMinutes / dailyGoal) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
            <h3 className="text-sm font-semibold text-dark-300 mb-4 flex items-center gap-2">
              <Timer className="w-4 h-4 text-accent" /> Recent Sessions
            </h3>
            {data.studySessions.length === 0 ? (
              <p className="text-xs text-dark-500">No sessions yet</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {[...data.studySessions].reverse().slice(0, 5).map(session => {
                  const subject = data.subjects.find(s => s.id === session.subjectId);
                  return (
                    <div key={session.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subject?.color || '#6366f1' }} />
                        <span className="text-dark-300">{subject?.name || 'Unknown'}</span>
                      </div>
                      <span className="text-dark-400">{(session.duration / 60).toFixed(0)}m</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
