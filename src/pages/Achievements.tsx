import React, { useState, useEffect } from 'react';
import {
  ListChecks,
  Plus,
  CheckCircle,
  Circle,
  PencilSimple,
  Trash,
  X,
  MagnifyingGlass,
  Sparkle,
  Clock,
  CheckSquare,
  ArrowCounterClockwise
} from '@phosphor-icons/react';
import { audioManager } from '../services/audioManager';

export type TaskPriority = 'urgent' | 'medium' | 'chill';
export type TaskCategory = 'personal' | 'work' | 'kaand' | 'secret';

export interface TodoTask {
  id: string;
  title: string;
  note?: string;
  priority: TaskPriority;
  category: TaskCategory;
  isCompleted: boolean;
  completedAt?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'ufd:todo_wall_tasks:v1';

const INITIAL_TASKS: TodoTask[] = [
  {
    id: 'starter-1',
    title: 'Subah uth ke sabse pehle 1 glass paani peena',
    note: 'Bina phone dekhe pehle 5 minute khud ke saath bethna mandatory hai.',
    priority: 'chill',
    category: 'personal',
    isCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'starter-2',
    title: 'Pending assignment aur zaroori kaam ka hisaab lagana',
    note: 'Last minute panic se behtar hai abhi 15 minute nikaal lo.',
    priority: 'urgent',
    category: 'work',
    isCompleted: false,
    dueDate: 'Aaj shaam tak',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'starter-3',
    title: 'Background music mein sukoon dhun sunke relax karna',
    note: 'Department ka official rule hai: Thoda chill karna banta hai.',
    priority: 'chill',
    category: 'kaand',
    isCompleted: true,
    completedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const PRIORITY_META: Record<TaskPriority, { label: string; badgeClass: string; color: string; border: string }> = {
  urgent: {
    label: '🚨 Bohot Zaroori',
    badgeClass: 'badge-coral',
    color: 'var(--color-coral)',
    border: '4px solid var(--color-coral)'
  },
  medium: {
    label: '⚡ Dhyan Do',
    badgeClass: 'badge',
    color: 'var(--color-cobalt)',
    border: '4px solid var(--color-cobalt)'
  },
  chill: {
    label: '☕ Aaram Se',
    badgeClass: 'badge-lime',
    color: 'var(--color-lime)',
    border: '4px solid var(--color-lime)'
  }
};

const CATEGORY_META: Record<TaskCategory, { label: string; emoji: string }> = {
  personal: { label: 'Personal Life', emoji: '👤' },
  work: { label: 'Padhai / Kaam', emoji: '📚' },
  kaand: { label: 'Mausami Kaand', emoji: '🔥' },
  secret: { label: 'Classified Mission', emoji: '🕵️' }
};

export const Achievements: React.FC = () => {
  const [tasks, setTasks] = useState<TodoTask[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load tasks from localStorage', e);
    }
    return INITIAL_TASKS;
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form state for Create / Edit
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState<string>('');
  const [noteInput, setNoteInput] = useState<string>('');
  const [priorityInput, setPriorityInput] = useState<TaskPriority>('medium');
  const [categoryInput, setCategoryInput] = useState<TaskCategory>('personal');
  const [dueDateInput, setDueDateInput] = useState<string>('');

  // Save to localStorage whenever tasks change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to localStorage', e);
    }
  }, [tasks]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const pendingTasks = totalTasks - completedTasks;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Sound effects & feedback
  const handleToggleComplete = (id: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === id) {
          const nextState = !task.isCompleted;
          if (nextState) {
            audioManager.playSfx('achievement');
          } else {
            audioManager.playSfx('ding');
          }
          return {
            ...task,
            isCompleted: nextState,
            completedAt: nextState ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString()
          };
        }
        return task;
      })
    );
  };

  const handleOpenCreateForm = () => {
    setEditingTaskId(null);
    setTitleInput('');
    setNoteInput('');
    setPriorityInput('medium');
    setCategoryInput('personal');
    setDueDateInput('');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (task: TodoTask) => {
    setEditingTaskId(task.id);
    setTitleInput(task.title);
    setNoteInput(task.note || '');
    setPriorityInput(task.priority);
    setCategoryInput(task.category);
    setDueDateInput(task.dueDate || '');
    setIsFormOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;

    const now = new Date().toISOString();

    if (editingTaskId) {
      // Edit existing task
      setTasks(prev =>
        prev.map(t =>
          t.id === editingTaskId
            ? {
                ...t,
                title: titleInput.trim(),
                note: noteInput.trim() || undefined,
                priority: priorityInput,
                category: categoryInput,
                dueDate: dueDateInput.trim() || undefined,
                updatedAt: now
              }
            : t
        )
      );
      audioManager.playSfx('ding');
    } else {
      // Create new task
      const newTask: TodoTask = {
        id: crypto.randomUUID(),
        title: titleInput.trim(),
        note: noteInput.trim() || undefined,
        priority: priorityInput,
        category: categoryInput,
        isCompleted: false,
        dueDate: dueDateInput.trim() || undefined,
        createdAt: now,
        updatedAt: now
      };
      setTasks(prev => [newTask, ...prev]);
      audioManager.playSfx('badge');
    }

    setIsFormOpen(false);
    setEditingTaskId(null);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    audioManager.playSfx('ding');
  };

  const handleClearCompleted = () => {
    if (window.confirm('Kya saare niptaye huye tasks hatana chahte ho?')) {
      setTasks(prev => prev.filter(t => !t.isCompleted));
      audioManager.playSfx('ding');
    }
  };

  // Filter tasks based on status, category, and search
  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'pending' && task.isCompleted) return false;
    if (activeFilter === 'completed' && !task.isCompleted) return false;
    if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchNote = task.note?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchNote) return false;
    }
    return true;
  });

  const getHinglishMessage = () => {
    if (totalTasks === 0) return 'Abhi list poori khaali hai. Naya task likh daalo!';
    if (completedTasks === totalTasks) return 'Officially saare targets achieve ho gaye! Ab mast aaram karo 🥳🏖️';
    if (progressPercent >= 60) return 'Aadha se zyada hisaab clear! Thoda sa dum aur lagao 💪';
    if (progressPercent > 0) return 'Raftaar pakad li hai! Ek-ek karke sab nipta denge ⚡';
    return 'Aaj ka mission shuru karo, ek task se shuruaat banti hai! 🎯';
  };

  return (
    <div style={{ padding: '20px 16px', maxWidth: '100%', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span className="badge badge-lime" style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ListChecks size={14} weight="bold" />
            <span>MISSION CONTROL • TO-DO WALL</span>
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            {completedTasks} / {totalTasks} Niptaye
          </span>
        </div>

        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-graphite)', marginBottom: '4px' }}>
          Aapka Kaam-Dhaam Task Wall
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          {getHinglishMessage()}
        </p>
      </div>

      {/* Retro Interactive Progress Bar */}
      <div
        className="card"
        style={{
          padding: '14px 16px',
          backgroundColor: '#FFFFFF',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-retro-sm)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Niptane Ka Report
          </span>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: progressPercent === 100 ? '#2B6E3F' : 'var(--color-cobalt)' }}>
            {progressPercent}% Complete
          </span>
        </div>

        <div
          style={{
            width: '100%',
            height: '12px',
            backgroundColor: '#E0DDD5',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            border: '2px solid var(--color-graphite)'
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              backgroundColor: progressPercent === 100 ? 'var(--color-lime)' : 'var(--color-cobalt)',
              transition: 'width 0.4s ease'
            }}
          />
        </div>
      </div>

      {/* Action Bar: Create Button + Search */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={handleOpenCreateForm}
          className="btn btn-primary"
          style={{
            flex: 1,
            padding: '12px',
            fontWeight: 800,
            fontSize: '0.95rem',
            backgroundColor: 'var(--color-lime)'
          }}
        >
          <Plus size={20} weight="bold" />
          <span>Naya Task Likh Daalo</span>
        </button>

        {completedTasks > 0 && (
          <button
            type="button"
            onClick={handleClearCompleted}
            title="Completed tasks hatayein"
            className="btn btn-outline"
            style={{
              padding: '10px 14px',
              fontSize: '0.85rem',
              backgroundColor: 'var(--color-ivory)'
            }}
          >
            <ArrowCounterClockwise size={18} weight="bold" />
            <span style={{ display: 'none' }}>Clear Done</span>
          </button>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className="btn"
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              minHeight: '34px',
              backgroundColor: activeFilter === 'all' ? 'var(--color-graphite)' : '#FFFFFF',
              color: activeFilter === 'all' ? '#FFFFFF' : 'var(--color-graphite)'
            }}
          >
            Sabhi ({totalTasks})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('pending')}
            className="btn"
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              minHeight: '34px',
              backgroundColor: activeFilter === 'pending' ? 'var(--color-graphite)' : '#FFFFFF',
              color: activeFilter === 'pending' ? '#FFFFFF' : 'var(--color-graphite)'
            }}
          >
            Pending ⏳ ({pendingTasks})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('completed')}
            className="btn"
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              minHeight: '34px',
              backgroundColor: activeFilter === 'completed' ? 'var(--color-graphite)' : '#FFFFFF',
              color: activeFilter === 'completed' ? '#FFFFFF' : 'var(--color-graphite)'
            }}
          >
            Nipta Diya ✅ ({completedTasks})
          </button>
        </div>

        {/* Search & Category Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Task ya note dhoondo..."
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                fontSize: '0.85rem'
              }}
            />
            <MagnifyingGlass
              size={16}
              weight="bold"
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={{
              fontSize: '0.82rem',
              padding: '8px 10px',
              fontWeight: 700
            }}
          >
            <option value="all">Sab Categories</option>
            <option value="personal">👤 Personal</option>
            <option value="work">📚 Padhai / Kaam</option>
            <option value="kaand">🔥 Kaand</option>
            <option value="secret">🕵️ Classified</option>
          </select>
        </div>
      </div>

      {/* CREATE / EDIT TASK MODAL CARD */}
      {isFormOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(32, 35, 41, 0.65)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={e => {
            if (e.target === e.currentTarget) setIsFormOpen(false);
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '500px',
              backgroundColor: '#FFFFFF',
              border: '3px solid var(--color-graphite)',
              boxShadow: 'var(--shadow-retro)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-lime">
                  {editingTaskId ? 'EDIT MISSION' : 'NEW MISSION'}
                </span>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  {editingTaskId ? 'Task Edit Karein' : 'Naya Task Likhein'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="btn btn-outline"
                style={{ padding: '6px', minHeight: 'auto' }}
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                  Kya Niptana Hai? (Title) *
                </label>
                <input
                  type="text"
                  required
                  value={titleInput}
                  onChange={e => setTitleInput(e.target.value)}
                  placeholder="e.g. Subah 8 baje bina snooze kiye uthna"
                  style={{ width: '100%', fontSize: '0.95rem', fontWeight: 600 }}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                  Thodi Extra Details (Optional Note)
                </label>
                <textarea
                  rows={2}
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  placeholder="Context, deadline ya koi secret advice..."
                  style={{ width: '100%', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                    Priority (Urgency)
                  </label>
                  <select
                    value={priorityInput}
                    onChange={e => setPriorityInput(e.target.value as TaskPriority)}
                    style={{ width: '100%', fontSize: '0.85rem', fontWeight: 700 }}
                  >
                    <option value="urgent">🚨 Bohot Zaroori</option>
                    <option value="medium">⚡ Dhyan Do (Medium)</option>
                    <option value="chill">☕ Aaram Se (Chill)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                    Category
                  </label>
                  <select
                    value={categoryInput}
                    onChange={e => setCategoryInput(e.target.value as TaskCategory)}
                    style={{ width: '100%', fontSize: '0.85rem', fontWeight: 700 }}
                  >
                    <option value="personal">👤 Personal</option>
                    <option value="work">📚 Padhai / Kaam</option>
                    <option value="kaand">🔥 Mausami Kaand</option>
                    <option value="secret">🕵️ Classified</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                  Target Time / Due (Optional)
                </label>
                <input
                  type="text"
                  value={dueDateInput}
                  onChange={e => setDueDateInput(e.target.value)}
                  placeholder="e.g. Aaj shaam 6 baje / Kal dopahar"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontWeight: 800,
                    backgroundColor: 'var(--color-lime)',
                    color: 'var(--color-graphite)'
                  }}
                >
                  <CheckSquare size={18} weight="bold" />
                  <span>{editingTaskId ? 'Changes Save Karo' : 'Wall Pe Chipka Do (Save)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="btn btn-outline"
                  style={{ padding: '12px', fontWeight: 700 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TASK LIST ITEMS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredTasks.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '36px 16px',
              backgroundColor: '#FFFFFF',
              boxShadow: 'var(--shadow-retro-sm)'
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-ivory)',
                border: '2px solid var(--color-graphite)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto'
              }}
            >
              <Sparkle size={26} weight="bold" color="var(--color-cobalt)" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '6px' }}>
              Koi Task Nahi Mila!
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {searchQuery || categoryFilter !== 'all' || activeFilter !== 'all'
                ? 'Aapke filter ke hisaab se koi matching task nahi mila.'
                : 'Poori list saaf hai! Naya task likho ya mast chill karo.'}
            </p>
            <button
              type="button"
              onClick={handleOpenCreateForm}
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <Plus size={16} weight="bold" />
              <span>Naya Task Banayein</span>
            </button>
          </div>
        ) : (
          filteredTasks.map(task => {
            const priorityInfo = PRIORITY_META[task.priority];
            const categoryInfo = CATEGORY_META[task.category];

            return (
              <div
                key={task.id}
                className="card"
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px 14px',
                  backgroundColor: task.isCompleted ? '#F8F6F1' : '#FFFFFF',
                  borderLeft: task.isCompleted ? '6px solid #2B6E3F' : priorityInfo.border,
                  transition: 'all 0.2s ease',
                  overflow: 'hidden'
                }}
              >
                {/* CREATIVE COMPLETED WATERMARK STAMP */}
                {task.isCompleted && (
                  <div
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '10px',
                      transform: 'rotate(-7deg)',
                      border: '2px dashed #2B6E3F',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 900,
                      color: '#2B6E3F',
                      backgroundColor: 'rgba(197, 230, 106, 0.45)',
                      letterSpacing: '0.5px',
                      pointerEvents: 'none',
                      userSelect: 'none'
                    }}
                  >
                    NIPTA DIYA ✓
                  </div>
                )}

                {/* Tactile Big Checkbox */}
                <button
                  type="button"
                  onClick={() => handleToggleComplete(task.id)}
                  title={task.isCompleted ? 'Mark as Pending' : 'Nipta Diya (Mark Complete)'}
                  style={{
                    cursor: 'pointer',
                    marginTop: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: task.isCompleted ? '#2B6E3F' : 'var(--color-graphite)',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  {task.isCompleted ? (
                    <CheckCircle size={28} weight="fill" color="#2B6E3F" />
                  ) : (
                    <Circle size={28} weight="bold" />
                  )}
                </button>

                {/* Task Details */}
                <div style={{ flex: 1, minWidth: 0, paddingRight: task.isCompleted ? '70px' : '0' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span
                      className={`badge ${priorityInfo.badgeClass}`}
                      style={{ fontSize: '0.7rem', padding: '1px 6px' }}
                    >
                      {priorityInfo.label}
                    </span>

                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        backgroundColor: '#EFECE6',
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}
                    >
                      {categoryInfo.emoji} {categoryInfo.label}
                    </span>

                    {task.dueDate && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: 'var(--color-cobalt)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}
                      >
                        <Clock size={12} weight="bold" />
                        <span>{task.dueDate}</span>
                      </span>
                    )}
                  </div>

                  {/* Title with strikethrough if completed */}
                  <h3
                    onClick={() => handleToggleComplete(task.id)}
                    style={{
                      fontSize: '0.98rem',
                      fontWeight: 800,
                      lineHeight: 1.35,
                      marginBottom: task.note ? '4px' : '0',
                      textDecoration: task.isCompleted ? 'line-through' : 'none',
                      color: task.isCompleted ? 'var(--text-muted)' : 'var(--color-graphite)',
                      cursor: 'pointer'
                    }}
                  >
                    {task.title}
                  </h3>

                  {/* Context Note */}
                  {task.note && (
                    <p
                      style={{
                        fontSize: '0.82rem',
                        color: task.isCompleted ? '#8E94A0' : 'var(--text-muted)',
                        lineHeight: 1.35,
                        marginTop: '2px'
                      }}
                    >
                      {task.note}
                    </p>
                  )}
                </div>

                {/* Edit & Delete Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: 'auto' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEditForm(task)}
                    title="Task Edit Karein"
                    className="btn btn-outline"
                    style={{
                      padding: '5px',
                      minHeight: 'auto',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <PencilSimple size={16} weight="bold" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    title="Task Delete Karein"
                    className="btn btn-outline"
                    style={{
                      padding: '5px',
                      minHeight: 'auto',
                      color: 'var(--color-coral)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <Trash size={16} weight="bold" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
