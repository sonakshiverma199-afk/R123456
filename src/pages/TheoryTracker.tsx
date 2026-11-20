import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Trash2, Check, X, Brain, BookOpen } from 'lucide-react';

export default function TheoryTracker() {
  const { data, addTheoryTopic, updateTheoryTopic, deleteTheoryTopic, getSubjectProgress } = useData();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [topicTitle, setTopicTitle] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim() || !selectedSubject) return;
    addTheoryTopic(selectedSubject, topicTitle.trim());
    setTopicTitle('');
    setNotes('');
    setShowForm(false);
  };

  const getTopicsForSubject = (subjectId: string) => {
    return data.theoryTopics.filter(t => t.subjectId === subjectId);
  };

  if (data.subjects.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Theory Tracker</h1>
          <p className="text-dark-400 text-sm mt-1">Track chapters and topics for each subject</p>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-12 text-center">
          <Brain className="w-12 h-12 text-dark-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-dark-300 mb-2">No subjects yet</h3>
          <p className="text-dark-500 text-sm">Add subjects first to start tracking theory topics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Theory Tracker</h1>
          <p className="text-dark-400 text-sm mt-1">Track chapters and topics completion</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dark text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Add Topic
        </button>
      </div>

      {/* Subject Overview */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.subjects.map(subject => {
          const topics = getTopicsForSubject(subject.id);
          const completed = topics.filter(t => t.completed).length;
          const progress = topics.length > 0 ? Math.round((completed / topics.length) * 100) : 0;
          return (
            <div key={subject.id} className="bg-dark-800 rounded-xl border border-dark-700 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
                <h3 className="font-medium text-dark-100 text-sm">{subject.name}</h3>
                <span className="ml-auto text-xs text-dark-400">{completed}/{topics.length}</span>
              </div>
              <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: subject.color }} />
              </div>
              <p className="text-xs text-dark-500 mt-2">{progress}% complete</p>
            </div>
          );
        })}
      </div>

      {/* Subject Detail */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm text-dark-300">View Subject:</label>
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-accent"
          >
            <option value="">Select a subject...</option>
            {data.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {selectedSubject ? (
          <div>
            {(() => {
              const subject = data.subjects.find(s => s.id === selectedSubject);
              const topics = getTopicsForSubject(selectedSubject);
              const completed = topics.filter(t => t.completed).length;
              const progress = topics.length > 0 ? Math.round((completed / topics.length) * 100) : 0;
              return (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium text-dark-200">{subject?.name} - Topics</span>
                    </div>
                    <span className="text-sm text-accent-light">{progress}% complete</span>
                  </div>

                  {topics.length === 0 ? (
                    <p className="text-sm text-dark-500 text-center py-8">No topics added yet. Click "Add Topic" to begin.</p>
                  ) : (
                    <div className="space-y-2">
                      {topics.map(topic => (
                        <div key={topic.id} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${topic.completed ? 'bg-success/5' : 'bg-dark-700/50'}`}>
                          <button
                            onClick={() => updateTheoryTopic(topic.id, { completed: !topic.completed })}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                              topic.completed ? 'bg-success border-success' : 'border-dark-500 hover:border-accent'
                            }`}
                          >
                            {topic.completed && <Check className="w-3 h-3 text-white" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm ${topic.completed ? 'line-through text-dark-500' : 'text-dark-200'}`}>
                              {topic.title}
                            </span>
                          </div>
                          <button onClick={() => deleteTheoryTopic(topic.id)} className="p-1 text-dark-500 hover:text-danger rounded hover:bg-dark-700 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        ) : (
          <p className="text-sm text-dark-500 text-center py-8">Select a subject to view its topics</p>
        )}
      </div>

      {/* Add Topic Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark-100">Add Topic</h3>
              <button onClick={() => setShowForm(false)} className="text-dark-400 hover:text-dark-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddTopic} className="space-y-4">
              <div>
                <label className="block text-sm text-dark-300 mb-1">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-accent"
                  required
                >
                  <option value="">Select subject...</option>
                  {data.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-1">Topic Title</label>
                <input type="text" value={topicTitle} onChange={e => setTopicTitle(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-accent" placeholder="e.g. Chapter 1: Introduction" required />
              </div>
              <button type="submit" className="w-full py-2.5 bg-accent hover:bg-accent-dark text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Add Topic
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
