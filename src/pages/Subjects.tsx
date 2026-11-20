import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Edit2, Trash2, X, Check, BookOpen } from 'lucide-react';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#22c55e', '#06b6d4', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316', '#3b82f6'];

export default function Subjects() {
  const { data, addSubject, updateSubject, deleteSubject, getStudyHours, getSubjectProgress } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (addSubject(name.trim(), color)) {
      setName('');
      setColor(COLORS[0]);
      setShowForm(false);
    }
  };

  const handleEdit = (id: string) => {
    const subject = data.subjects.find(s => s.id === id);
    if (subject) {
      setName(subject.name);
      setColor(subject.color);
      setEditingId(id);
      setShowForm(true);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !editingId) return;
    updateSubject(editingId, name.trim(), color);
    setName('');
    setColor(COLORS[0]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setName('');
    setColor(COLORS[0]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Subjects</h1>
          <p className="text-dark-400 text-sm mt-1">Manage your subjects ({data.subjects.length}/10)</p>
        </div>
        {data.subjects.length < 10 && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dark text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Add Subject
          </button>
        )}
      </div>

      {data.subjects.length === 0 ? (
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-12 text-center">
          <BookOpen className="w-12 h-12 text-dark-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-dark-300 mb-2">No subjects yet</h3>
          <p className="text-dark-500 text-sm">Add your first subject to start tracking progress</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.subjects.map(subject => {
            const hours = getStudyHours(subject.id);
            const progress = getSubjectProgress(subject.id);
            const topicCount = data.theoryTopics.filter(t => t.subjectId === subject.id).length;
            const completedTopics = data.theoryTopics.filter(t => t.subjectId === subject.id && t.completed).length;
            return (
              <div key={subject.id} className="bg-dark-800 rounded-xl border border-dark-700 p-5 hover:border-dark-600 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${subject.color}20` }}>
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: subject.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-dark-100">{subject.name}</h3>
                      <p className="text-xs text-dark-500">{hours.toFixed(1)}h studied</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(subject.id)} className="p-1.5 text-dark-500 hover:text-accent rounded-lg hover:bg-dark-700 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { if (confirm('Delete this subject?')) deleteSubject(subject.id); }} className="p-1.5 text-dark-500 hover:text-danger rounded-lg hover:bg-dark-700 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-dark-400 mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: subject.color }} />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-dark-500">
                    <span>{completedTopics}/{topicCount} topics</span>
                    <span>{data.assignments.filter(a => a.subjectId === subject.id).length} assignments</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={handleCancel}>
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark-100">{editingId ? 'Edit Subject' : 'Add Subject'}</h3>
              <button onClick={handleCancel} className="text-dark-400 hover:text-dark-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={editingId ? handleSaveEdit : handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm text-dark-300 mb-1">Subject Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-accent" placeholder="e.g. Mathematics" required maxLength={50} />
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-offset-dark-800 scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-accent hover:bg-accent-dark text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> {editingId ? 'Save Changes' : 'Add Subject'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
