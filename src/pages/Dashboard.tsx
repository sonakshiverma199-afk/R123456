import React from 'react';
import { useData } from '../context/DataContext';
import { Clock, Flame, BookOpen, CheckCircle2, AlertTriangle, Calendar, TrendingUp, Target } from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

export default function Dashboard() {
  const { data, getStudyHours, getTodayStudyMinutes, getStreak, getSubjectProgress } = useData();

  const todayMinutes = getTodayStudyMinutes();
  const streak = getStreak();
  const weeklyHours = getStudyHours(undefined, 'weekly');
  const pendingTodos = data.todos.filter(t => !t.completed);
  const upcomingEvents = data.calendarEvents
    .filter(e => new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);
  const activeAssignments = data.assignments.filter(a => a.status !== 'submitted');
  const todayGoals = data.dailyGoals.find(g => g.date === format(new Date(), 'yyyy-MM-dd'));

  const statCards = [
    { label: 'Today\'s Study', value: `${Math.round(todayMinutes)}m`, icon: Clock, color: 'text-accent-light', bg: 'bg-accent/10' },
    { label: 'Weekly Hours', value: `${weeklyHours.toFixed(1)}h`, icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Study Streak', value: `${streak} days`, icon: Flame, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Subjects', value: `${data.subjects.length}`, icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-100">Dashboard</h1>
        <p className="text-dark-400 text-sm mt-1">Welcome back! Here's your academic overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-dark-800 rounded-xl border border-dark-700 p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-xs text-dark-400">{card.label}</p>
                <p className="text-lg font-bold text-dark-100">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-dark-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-accent" />
              Today's Tasks
            </h2>
            <span className="text-xs bg-dark-700 px-2 py-1 rounded-full text-dark-400">
              {pendingTodos.filter(t => t.completed === false).length} pending
            </span>
          </div>
          {pendingTodos.length === 0 ? (
            <p className="text-dark-500 text-sm">No pending tasks. Great job!</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {pendingTodos.slice(0, 8).map(todo => (
                <div key={todo.id} className="flex items-center gap-3 p-2 rounded-lg bg-dark-700/50">
                  <div className={`w-2 h-2 rounded-full ${todo.priority === 'high' ? 'bg-danger' : todo.priority === 'medium' ? 'bg-warning' : 'bg-success'}`} />
                  <span className="text-sm text-dark-200 flex-1 truncate">{todo.title}</span>
                  {todo.dueDate && (
                    <span className="text-xs text-dark-500">{format(parseISO(todo.dueDate), 'MMM d')}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-dark-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              Upcoming Events
            </h2>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="text-dark-500 text-sm">No upcoming events</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {upcomingEvents.map(event => (
                <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg bg-dark-700/50">
                  <div className={`w-2 h-2 rounded-full ${
                    event.type === 'exam' ? 'bg-danger' : event.type === 'assignment' ? 'bg-warning' : 'bg-accent'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-dark-200 truncate">{event.title}</p>
                    <p className="text-xs text-dark-500">
                      {isToday(parseISO(event.date)) ? 'Today' : isTomorrow(parseISO(event.date)) ? 'Tomorrow' : format(parseISO(event.date), 'MMM d, yyyy')}
                      {event.time && ` at ${event.time}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subject Progress */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
          <h2 className="text-lg font-semibold text-dark-100 flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-accent" />
            Subject Progress
          </h2>
          {data.subjects.length === 0 ? (
            <p className="text-dark-500 text-sm">Add subjects to track progress</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {data.subjects.map(subject => {
                const progress = getSubjectProgress(subject.id);
                const hours = getStudyHours(subject.id);
                return (
                  <div key={subject.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
                        <span className="text-sm text-dark-200">{subject.name}</span>
                      </div>
                      <span className="text-xs text-dark-400">{hours.toFixed(1)}h • {progress}%</span>
                    </div>
                    <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: subject.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Assignment Status */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-dark-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-accent" />
              Assignments
            </h2>
          </div>
          {activeAssignments.length === 0 ? (
            <p className="text-dark-500 text-sm">All assignments submitted!</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {activeAssignments.slice(0, 8).map(a => {
                const subject = data.subjects.find(s => s.id === a.subjectId);
                const deadline = parseISO(a.deadline);
                const isOverdue = deadline < new Date() && a.status !== 'submitted';
                return (
                  <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg bg-dark-700/50">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subject?.color || '#6366f1' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-dark-200 truncate">{a.title}</p>
                      <p className="text-xs text-dark-500">{subject?.name}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        a.status === 'not_started' ? 'bg-dark-600 text-dark-300' :
                        a.status === 'in_progress' ? 'bg-accent/20 text-accent-light' :
                        'bg-success/20 text-success'
                      }`}>
                        {a.status.replace('_', ' ')}
                      </span>
                      {isOverdue && <p className="text-xs text-danger mt-1">Overdue</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Daily Goal */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
        <h2 className="text-lg font-semibold text-dark-100 flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-accent" />
          Daily Study Goal
        </h2>
        {todayGoals ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-dark-400">{Math.round(todayGoals.completedMinutes)} / {todayGoals.targetMinutes} minutes</span>
              <span className="text-accent-light">{Math.round((todayGoals.completedMinutes / todayGoals.targetMinutes) * 100)}%</span>
            </div>
            <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${Math.min(100, (todayGoals.completedMinutes / todayGoals.targetMinutes) * 100)}%` }} />
            </div>
          </div>
        ) : (
          <p className="text-dark-500 text-sm">Set a daily goal in the Study Timer to track your progress</p>
        )}
      </div>
    </div>
  );
}
