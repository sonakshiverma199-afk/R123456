import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Trash2, Edit2, X, Check, FileText } from 'lucide-react';
import { Assignment } from '../types';
import { format, parseISO, isPast } from 'date-fns';

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started', color: 'bg-dark-600 text-dark-300' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-accent/20 text-accent-light' },
  { value: 'completed', label: 'Completed', color: 'bg-success/20 text-success' },
  { value: 'submitted', label: 'Submitted', color: 'bg-purple-500/20 text-purple-400' },
];

export default function Assignments() {
  const { data, addAssignment, updateAssignment, deleteAssignment } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<Assignment['status']>('not_started');
  const [description, setDescription] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId || !deadline) return;
    if (editingId) {
      updateAssignment(editingId, { title: title.trim(), subjectId, deadline, status, description: description || undefined });
      setEditingId(null);
    } else {
      addAssignment({ title: title.trim(), subjectId, deadline, status, description: description || undefined });
    }
    setTitle('');
    setSubjectId('');
    setDeadline('');
    setStatus('not_started');
    setDescription('');
    setShowForm(false);
  };

  const handleEdit = (id: string) => {
    const a = data.assignments.find(a => a.id === id);
    if (a) {
      setTitle(a.title);
      setSubjectId(a.subjectId);
      setDeadline(a.deadline);
      setStatus(a.status);
      setDescription(a.description || '');
      setEditingId(id);
      setShowForm(true);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setTitle('');
    setSubjectId('');
    setDeadline('');
    setStatus('not_started');
    setDescription('');
  };

  const filteredAssignments = data.assignments
    .filter(a => statusFilter === 'all' || a.status === statusFilter)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const statusCounts = {
    not_started: data.assignments.filter(a => a.status === 'not_started').length,
    in_progress: data.assignments.filter(a => a.status === 'in_progress').length,
    completed: data.assignments.filter(a => a.status === 'completed').length,
    submitted: data.assignments.filter(a => a.status === 'submitted').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Assignments</h1>
          <p className="text-dark-400 text-sm mt-1">Track and manage your assignments</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dark text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Add Assignment
        </button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(statusFilter === opt.value ? 'all' : opt.value)}
            className={`p-3 rounded-xl border transition-colors ${
              statusFilter === opt.value ? 'border-accent bg-accent/5' : 'border-dark-700 bg-dark-800 hover:border-dark-600'
            }`}
          >
            <p className="text-xs text-dark-400">{opt.label}</p>
            <p className="text-xl font-bold text-dark-100 mt-1">{(statusCounts as any)[opt.value]}</p>
          </button>
        ))}
      </div>

      {/* Assignment List */}
      {filteredAssignments.length === 0 ? (
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-12 text-center">
          <FileText className="w-12 h-12 text-dark-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-dark-300 mb-2">No assignments</h3>
          <p className="text-dark-500 text-sm">Add your first assignment to start tracking</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAssignments.map(assignment => {
            const subject = data.subjects.find(s => s.id === assignment.subjectId);
            const isOverdue = isPast(parseISO(assignment.deadline)) && assignment.status !== 'submitted';
            const statusOpt = STATUS_OPTIONS.find(s => s.value === assignment.status);
            return (
              <div key={assignment.id} className="bg-dark-800 rounded-xl border border-dark-700 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-medium text-dark-100">{assignment.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusOpt?.color}`}>
                        {statusOpt?.label}
                      </span>
                      {isOverdue && <span className="text-xs px-2 py-0.5 rounded-full bg-danger/20 text-danger">Overdue</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-dark-500">
                      {subject && (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: subject.color }} />
                          {subject.name}
                        </span>
                      )}
                      <span>Due: {format(parseISO(assignment.deadline), 'MMM d, yyyy')}</span>
                      {assignment.submittedAt && (
                        <span className="text-success">Submitted: {format(parseISO(assignment.submittedAt), 'MMM d, yyyy')}</span>
                      )}
                    </div>
                    {assignment.description && (
                      <p className="text-xs text-dark-400 mt-2">{assignment.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <select
                      value={assignment.status}
                      onChange={e => updateAssignment(assignment.id, { status: e.target.value as any })}
                      className="text-xs bg-dark-700 border border-dark-600 rounded px-2 py-1 text-dark-300 focus:outline-none focus:border-accent"
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <button onClick={() => handleEdit(assignment.id)} className="p-1.5 text-dark-500 hover:text-accent rounded-lg hover:bg-dark-700 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { if (confirm('Delete this assignment?')) deleteAssignment(assignment.id); }} className="p-1.5 text-dark-500 hover:text-danger rounded-lg hover:bg-dark-700 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
              <h3 className="text-lg font-semibold text-dark-100">{editingId ? 'Edit Assignment' : 'Add Assignment'}</h3>
              <button onClick={handleCancel} className="text-dark-400 hover:text-dark-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-dark-300 mb-1">Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-accent" placeholder="Assignment title" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-dark-300 mb-1">Subject</label>
                  <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-accent" required>
                    <option value="">Select...</option>
                    {data.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-1">Deadline</label>
                  <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-accent" required />
                </div>
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-1">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-accent">
                  {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-1">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-accent h-20 resize-none" placeholder="Optional details..." />
              </div>
              <button type="submit" className="w-full py-2.5 bg-accent hover:bg-accent-dark text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> {editingId ? 'Save Changes' : 'Add Assignment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
