import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Trash2, Check, Edit2, X, ListTodo } from 'lucide-react';

export default function Todos() {
  const { data, addTodo, updateTodo, deleteTodo } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (editingId) {
      updateTodo(editingId, { title: title.trim(), subjectId: subjectId || undefined, dueDate: dueDate || undefined, priority });
      setEditingId(null);
    } else {
      addTodo({ title: title.trim(), completed: false, subjectId: subjectId || undefined, dueDate: dueDate || undefined, priority });
    }
    setTitle('');
    setSubjectId('');
    setDueDate('');
    setPriority('medium');
    setShowForm(false);
  };

  const handleEdit = (id: string) => {
    const todo = data.todos.find(t => t.id === id);
    if (todo) {
      setTitle(todo.title);
      setSubjectId(todo.subjectId || '');
      setDueDate(todo.dueDate || '');
      setPriority(todo.priority);
      setEditingId(id);
      setShowForm(true);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setTitle('');
    setSubjectId('');
    setDueDate('');
    setPriority('medium');
  };

  const filteredTodos = data.todos.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const pendingCount = data.todos.filter(t => !t.completed).length;
  const completedCount = data.todos.filter(t => t.completed).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">To-Do List</h1>
          <p className="text-dark-400 text-sm mt-1">{pendingCount} pending, {completedCount} completed</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dark text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'pending', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? 'bg-accent/10 text-accent-light' : 'bg-dark-800 text-dark-400 hover:text-dark-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Todo List */}
      {filteredTodos.length === 0 ? (
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-12 text-center">
          <ListTodo className="w-12 h-12 text-dark-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-dark-300 mb-2">
            {filter === 'all' ? 'No tasks yet' : filter === 'pending' ? 'No pending tasks' : 'No completed tasks'}
          </h3>
          <p className="text-dark-500 text-sm">
            {filter === 'all' ? 'Add your first task to get started' : 'Tasks will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTodos.map(todo => {
            const subject = data.subjects.find(s => s.id === todo.subjectId);
            return (
              <div key={todo.id} className={`bg-dark-800 rounded-xl border border-dark-700 p-4 flex items-center gap-4 transition-colors ${todo.completed ? 'opacity-60' : ''}`}>
                <button
                  onClick={() => updateTodo(todo.id, { completed: !todo.completed })}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    todo.completed ? 'bg-success border-success' : 'border-dark-500 hover:border-accent'
                  }`}
                >
                  {todo.completed && <Check className="w-3 h-3 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${todo.completed ? 'line-through text-dark-500' : 'text-dark-200'}`}>
                    {todo.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    {subject && (
                      <span className="text-xs flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: subject.color }} />
                        <span className="text-dark-500">{subject.name}</span>
                      </span>
                    )}
                    {todo.dueDate && (
                      <span className="text-xs text-dark-500">Due: {new Date(todo.dueDate).toLocaleDateString()}</span>
                    )}
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      todo.priority === 'high' ? 'bg-danger/10 text-danger' :
                      todo.priority === 'medium' ? 'bg-warning/10 text-warning' :
                      'bg-success/10 text-success'
                    }`}>
                      {todo.priority}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleEdit(todo.id)} className="p-1.5 text-dark-500 hover:text-accent rounded-lg hover:bg-dark-700 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteTodo(todo.id)} className="p-1.5 text-dark-500 hover:text-danger rounded-lg hover:bg-dark-700 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
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
              <h3 className="text-lg font-semibold text-dark-100">{editingId ? 'Edit Task' : 'Add Task'}</h3>
              <button onClick={handleCancel} className="text-dark-400 hover:text-dark-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-dark-300 mb-1">Task Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-accent" placeholder="What needs to be done?" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-dark-300 mb-1">Subject</label>
                  <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-accent">
                    <option value="">None</option>
                    {data.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-1">Due Date</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-accent" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-1">Priority</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <button key={p} type="button" onClick={() => setPriority(p)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      priority === p
                        ? p === 'high' ? 'bg-danger/20 text-danger' : p === 'medium' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                        : 'bg-dark-700 text-dark-400 hover:text-dark-200'
                    }`}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-accent hover:bg-accent-dark text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> {editingId ? 'Save Changes' : 'Add Task'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
