import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, parseISO } from 'date-fns';

export default function CalendarPage() {
  const { data, addCalendarEvent, deleteCalendarEvent } = useData();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', date: '', time: '', type: 'study' as const, description: '', reminder: false });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = monthStart.getDay();

  const getEventsForDay = (day: Date) => {
    return data.calendarEvents.filter(e => isSameDay(parseISO(e.date), day));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date) return;
    addCalendarEvent({
      title: form.title,
      date: form.date,
      time: form.time || undefined,
      type: form.type,
      description: form.description || undefined,
      reminder: form.reminder,
    });
    setForm({ title: '', date: '', time: '', type: 'study', description: '', reminder: false });
    setShowForm(false);
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(format(day, 'yyyy-MM-dd'));
    setForm(f => ({ ...f, date: format(day, 'yyyy-MM-dd') }));
  };

  const selectedEvents = selectedDate
    ? data.calendarEvents.filter(e => e.date === selectedDate).sort((a, b) => (a.time || '').localeCompare(b.time || ''))
    : [];

  const typeColors: Record<string, string> = {
    exam: 'bg-danger',
    assignment: 'bg-warning',
    study: 'bg-accent',
    reminder: 'bg-success',
    other: 'bg-dark-500',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Calendar</h1>
          <p className="text-dark-400 text-sm mt-1">Manage your exams, assignments, and study sessions</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dark text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-dark-800 rounded-xl border border-dark-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 text-dark-400 hover:text-dark-200">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-dark-100">{format(currentMonth, 'MMMM yyyy')}</h2>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 text-dark-400 hover:text-dark-200">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-dark-500 py-2">{d}</div>
            ))}
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {days.map(day => {
              const events = getEventsForDay(day);
              const isSelected = selectedDate === format(day, 'yyyy-MM-dd');
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square p-1 rounded-lg text-sm flex flex-col items-center justify-start gap-0.5 transition-colors relative
                    ${!isSameMonth(day, currentMonth) ? 'text-dark-600' : 'text-dark-300'}
                    ${isToday(day) ? 'bg-accent/10 text-accent-light font-bold' : ''}
                    ${isSelected ? 'ring-1 ring-accent' : 'hover:bg-dark-700'}
                  `}
                >
                  <span>{format(day, 'd')}</span>
                  {events.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {events.slice(0, 3).map(e => (
                        <div key={e.id} className={`w-1.5 h-1.5 rounded-full ${typeColors[e.type]}`} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Events Panel */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
          <h3 className="text-sm font-semibold text-dark-300 mb-4">
            {selectedDate ? format(parseISO(selectedDate), 'MMMM d, yyyy') : 'Select a date'}
          </h3>
          {selectedDate && selectedEvents.length === 0 && (
            <p className="text-sm text-dark-500">No events for this day</p>
          )}
          <div className="space-y-2">
            {selectedEvents.map(event => (
              <div key={event.id} className="p-3 bg-dark-700/50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${typeColors[event.type]}`} />
                    <span className="text-sm font-medium text-dark-200">{event.title}</span>
                  </div>
                  <button onClick={() => deleteCalendarEvent(event.id)} className="text-dark-500 hover:text-danger">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-1 ml-4">
                  <p className="text-xs text-dark-500">{event.type.charAt(0).toUpperCase() + event.type.slice(1)}{event.time && ` • ${event.time}`}</p>
                  {event.description && <p className="text-xs text-dark-400 mt-1">{event.description}</p>}
                  {event.reminder && <p className="text-xs text-accent mt-1">🔔 Reminder set</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Upcoming events */}
          <div className="mt-6 pt-4 border-t border-dark-700">
            <h4 className="text-xs font-semibold text-dark-400 uppercase mb-3">Upcoming</h4>
            <div className="space-y-2">
              {data.calendarEvents
                .filter(e => new Date(e.date) >= new Date(new Date().setHours(0,0,0,0)))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map(event => (
                  <div key={event.id} className="flex items-center gap-2 text-xs">
                    <div className={`w-1.5 h-1.5 rounded-full ${typeColors[event.type]}`} />
                    <span className="text-dark-300 flex-1 truncate">{event.title}</span>
                    <span className="text-dark-500">{format(parseISO(event.date), 'MMM d')}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark-100">Add Event</h3>
              <button onClick={() => setShowForm(false)} className="text-dark-400 hover:text-dark-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-dark-300 mb-1">Title</label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-accent" placeholder="Event title" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-dark-300 mb-1">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-accent" required />
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-1">Time</label>
                  <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-accent" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value as any})} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-accent">
                  <option value="exam">Exam</option>
                  <option value="assignment">Assignment</option>
                  <option value="study">Study Session</option>
                  <option value="reminder">Reminder</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-accent h-20 resize-none" placeholder="Optional notes..." />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.reminder} onChange={e => setForm({...form, reminder: e.target.checked})} className="w-4 h-4 rounded border-dark-600 bg-dark-700 text-accent focus:ring-accent" />
                <span className="text-sm text-dark-300">Set reminder</span>
              </label>
              <button type="submit" className="w-full py-2.5 bg-accent hover:bg-accent-dark text-white font-medium rounded-lg transition-colors">
                Add Event
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
