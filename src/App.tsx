import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckSquare, 
  BookOpen, 
  Settings as SettingsIcon, 
  Plus, 
  Trash2, 
  Check,
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  ChevronRight,
  User,
  GraduationCap,
  Sun,
  Moon,
  ClipboardCheck,
  MessageSquare,
  BookCheck,
  Camera,
  Edit2,
  X
} from 'lucide-react';
import { Task, ClassSection, UserProfile, Status, AppData, Student, TrackerCategory, ThemeMode, ColorTheme } from './types';
import { SALUTATIONS, TASK_TEMPLATES, THEME_MODES, COLOR_THEMES, MOTIVATING_DESCRIPTIONS } from './constants';

const STORAGE_KEY = 'loooop_data_v1';

const INITIAL_DATA: AppData = {
  profile: {
    name: '',
    salutation: 'Miss',
    themeMode: 'system',
    colorTheme: 'Classic',
    profilePicture: undefined
  },
  tasks: [],
  sections: []
};

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }: any) => {
  const variants: any = {
    primary: 'bg-accent-primary text-white hover:opacity-90 shadow-sm shadow-accent-primary/20',
    secondary: 'bg-bg-surface text-fg-base border border-border-subtle hover:bg-bg-base shadow-sm',
    ghost: 'bg-transparent text-fg-muted hover:text-fg-base hover:bg-bg-base/50',
    danger: 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`px-4 py-2.5 rounded-2xl font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '', onClick }: any) => (
  <div 
    onClick={onClick}
    className={`card-minimal ${className}`}
  >
    {children}
  </div>
);

export default function App() {
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : INITIAL_DATA;
    // Migrate old data
    if (parsed.profile) {
      if (!parsed.profile.themeMode) {
        parsed.profile.themeMode = 'system';
        parsed.profile.colorTheme = 'Classic';
      }
    }
    if (parsed.sections) {
      parsed.sections = parsed.sections.map((s: any) => {
        const students = (s.students || []).map((st: any) => ({
          id: st.id,
          name: st.name
        }));

        const categories = s.categories || [
          {
            id: 'cat-notebooks',
            name: 'Notebooks',
            completions: (s.students || []).reduce((acc: any, st: any) => {
              if (st.isNotebookChecked) acc[st.id] = true;
              return acc;
            }, {})
          },
          {
            id: 'cat-workbooks',
            name: 'Workbooks',
            completions: (s.students || []).reduce((acc: any, st: any) => {
              // Best effort migration from anything that resembles workbook/homework
              if (st.isQuestionnaireDone) acc[st.id] = true;
              return acc;
            }, {})
          },
          {
            id: 'cat-pasting',
            name: 'Pasting',
            completions: (s.students || []).reduce((acc: any, st: any) => {
              if (st.isPastingDone) acc[st.id] = true;
              return acc;
            }, {})
          }
        ];

        return {
          ...s,
          students,
          categories
        };
      });
    }
    if (!parsed.tasks) parsed.tasks = [];
    if (!parsed.sections) parsed.sections = [];
    
    return parsed;
  });

  const [activeTab, setActiveTab] = useState<'tasks' | 'notebooks' | 'settings' | 'profile'>('tasks');
  const [isSetup, setIsSetup] = useState(!data.profile.name);
  const [motivatingQuote, setMotivatingQuote] = useState('');

  // Randomize motivating quote when entering profile
  useEffect(() => {
    if (activeTab === 'profile') {
      setMotivatingQuote(MOTIVATING_DESCRIPTIONS[Math.floor(Math.random() * MOTIVATING_DESCRIPTIONS.length)]);
    }
  }, [activeTab]);

  // Theme Management
  useEffect(() => {
    const root = document.documentElement;
    const mode = data.profile.themeMode;
    
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (root.getAttribute('data-mode') !== (prefersDark ? 'dark' : 'light')) {
        root.setAttribute('data-mode', prefersDark ? 'dark' : 'light');
      }
    } else {
      if (root.getAttribute('data-mode') !== mode) {
        root.setAttribute('data-mode', mode);
      }
    }
    
    if (root.getAttribute('data-theme') !== data.profile.colorTheme) {
      root.setAttribute('data-theme', data.profile.colorTheme);
    }
  }, [data.profile.themeMode, data.profile.colorTheme]);

  // Persistence logic
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addTask = (title: string) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      completed: false,
      createdAt: Date.now()
    };
    setData(prev => ({ ...prev, tasks: [newTask, ...(prev.tasks || [])] }));
  };

  const toggleTask = (id: string) => {
    setData(prev => ({
      ...prev,
      tasks: (prev.tasks || []).map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    }));
  };

  const deleteTask = (id: string) => {
    setData(prev => ({ ...prev, tasks: (prev.tasks || []).filter(t => t.id !== id) }));
  };

  const addSection = (name: string, subject: string, count: number) => {
    const newSection: ClassSection = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      subject,
      status: 'Not checked',
      studentCount: count,
      students: [],
      categories: [
        { id: 'cat-notebooks', name: 'Notebooks', completions: {} },
        { id: 'cat-workbooks', name: 'Workbooks', completions: {} },
        { id: 'cat-pasting', name: 'Pasting', completions: {} }
      ],
      updatedAt: Date.now()
    };
    setData(prev => ({ ...prev, sections: [newSection, ...(prev.sections || [])] }));
  };

  const updateSectionStudents = (id: string, students: Student[]) => {
    setData(prev => ({
      ...prev,
      sections: (prev.sections || []).map(s => s.id === id ? { ...s, students, updatedAt: Date.now() } : s)
    }));
  };

  const addCategoryToSection = (sectionId: string, categoryName: string) => {
    setData(prev => ({
      ...prev,
      sections: (prev.sections || []).map(s => s.id === sectionId ? {
        ...s,
        categories: [...s.categories, {
          id: Math.random().toString(36).substr(2, 9),
          name: categoryName,
          completions: {}
        }],
        updatedAt: Date.now()
      } : s)
    }));
  };

  const updateCategoryCompletion = (sectionId: string, categoryId: string, completions: Record<string, boolean>) => {
    setData(prev => ({
      ...prev,
      sections: (prev.sections || []).map(s => s.id === sectionId ? {
        ...s,
        categories: s.categories.map(c => c.id === categoryId ? { ...c, completions } : c),
        updatedAt: Date.now()
      } : s)
    }));
  };

  const deleteCategoryFromSection = (sectionId: string, categoryId: string) => {
    setData(prev => ({
      ...prev,
      sections: (prev.sections || []).map(s => s.id === sectionId ? {
        ...s,
        categories: s.categories.filter(c => c.id !== categoryId),
        updatedAt: Date.now()
      } : s)
    }));
  };

  const updateSectionStatus = (id: string, status: Status) => {
    setData(prev => ({
      ...prev,
      sections: (prev.sections || []).map(s => s.id === id ? { ...s, status, updatedAt: Date.now() } : s)
    }));
  };

  const deleteSection = (id: string) => {
    setData(prev => ({ ...prev, sections: (prev.sections || []).filter(s => s.id !== id) }));
  };

  if (isSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-bg-base text-fg-base">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-bg-surface border border-border-subtle p-8 rounded-[2.5rem] shadow-sm"
        >
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-accent-primary/10 rounded-3xl flex items-center justify-center text-accent-primary">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8" />
                <path d="M20 12c0-4.418-3.582-8-8-8" opacity="0.3" />
                <circle cx="12" cy="12" r="2.5" fill="currentColor" />
              </svg>
            </div>
          </div>
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome to loooop</h1>
            <p className="text-fg-muted">Your minimal companion for staying on top of things.</p>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            setIsSetup(false);
          }} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-fg-muted uppercase tracking-widest mb-2 px-1">Your Details</label>
                <div className="flex gap-2">
                  <select 
                    value={data.profile.salutation || 'Miss'}
                    onChange={e => setData(prev => ({ ...prev, profile: { ...prev.profile, salutation: e.target.value } }))}
                    className="bg-bg-base border border-border-subtle rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent-primary outline-none appearance-none"
                  >
                    {SALUTATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input 
                    type="text" 
                    required
                    placeholder="Full Name"
                    value={data.profile.name || ''}
                    onChange={e => setData(prev => ({ ...prev, profile: { ...prev.profile, name: e.target.value } }))}
                    className="flex-1 bg-bg-base border border-border-subtle rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-accent-primary outline-none"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full py-4 text-base tracking-tight rounded-3xl mt-4">
              Get Started
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base pb-32 transition-colors duration-500">
      {/* Header */}
      <header className="bg-bg-surface/80 backdrop-blur-md border-b border-border-subtle px-6 py-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-primary text-white rounded-2xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8" />
                <path d="M20 12c0-4.418-3.582-8-8-8" opacity="0.5" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">loooop</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-fg-muted font-bold uppercase tracking-widest leading-none mb-1">Welcome back</p>
              <p className="text-sm font-semibold">{data.profile.salutation} {data.profile.name}</p>
            </div>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-10 h-10 rounded-full border flex items-center justify-center overflow-hidden transition-all ${activeTab === 'profile' ? 'border-accent-primary ring-2 ring-accent-primary/20' : 'border-border-subtle hover:border-accent-primary/50'}`}
            >
              {data.profile.profilePicture ? (
                <img src={data.profile.profilePicture} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User size={18} className="text-fg-muted" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Tab Content */}
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="min-h-[400px]"
        >
          {activeTab === 'tasks' && <TasksView data={data} onToggle={toggleTask} onDelete={deleteTask} onAdd={addTask} />}
          {activeTab === 'notebooks' && (
            <NotebookView 
              data={data} 
              onUpdate={updateSectionStatus} 
              onDelete={deleteSection} 
              onAdd={addSection} 
              onUpdateStudents={updateSectionStudents}
              onAddCategory={addCategoryToSection}
              onDeleteCategory={deleteCategoryFromSection}
              onUpdateCategory={updateCategoryCompletion}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsView 
              data={data} 
              onUpdateProfile={(p) => setData(prev => ({ ...prev, profile: p }))} 
            />
          )}
          {activeTab === 'profile' && (
            <ProfileView 
              data={data} 
              quote={motivatingQuote}
              onUpdateProfile={(p) => setData(prev => ({ ...prev, profile: p }))} 
            />
          )}
        </motion.div>
      </main>

      {/* Minimal Navigation */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-fit glass rounded-[2rem] p-1.5 flex gap-1 z-50">
        <NavButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon={<CheckSquare size={18} />} label="Tasks" />
        <NavButton active={activeTab === 'notebooks'} onClick={() => setActiveTab('notebooks')} icon={<BookOpen size={18} />} label="Notebooks" />
        <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={18} />} label="Settings" />
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-full flex items-center gap-2.5 transition-all duration-300 ${active ? 'bg-accent-primary text-white shadow-md' : 'text-fg-muted hover:bg-bg-base/80'}`}
    >
      {icon}
      <span className={`text-xs font-bold whitespace-nowrap overflow-hidden transition-all duration-300 ${active ? 'max-w-20' : 'max-w-0'}`}>{label}</span>
    </button>
  );
}

// --- Sub-Views ---

function TasksView({ data, onToggle, onDelete, onAdd }: any) {
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAdd(newTitle);
    setNewTitle('');
    setShowAdd(false);
  };

  const tasks = data.tasks || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold tracking-tight px-1 lowercase italic">you said you would</h3>
        <Button onClick={() => setShowAdd(!showAdd)} variant="primary" className="h-10 px-4 rounded-xl">
          <Plus size={18} />
          <span className="text-sm">+ What now?</span>
        </Button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="bg-bg-surface border border-border-subtle rounded-3xl p-6 overflow-hidden space-y-6 shadow-sm"
          >
            <input 
              autoFocus
              type="text" 
              placeholder="What's the plan?"
              value={newTitle || ''}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full text-lg font-medium bg-transparent border-b-2 border-border-subtle py-2 focus:border-accent-primary outline-none text-fg-base placeholder:text-fg-muted transition-colors"
            />
            
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-fg-muted ml-1">Quick Add</p>
              <div className="flex flex-wrap gap-2">
                {TASK_TEMPLATES.map(tmp => (
                  <button
                    key={tmp.title}
                    type="button"
                    onClick={() => setNewTitle(tmp.title)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-bg-base border border-border-subtle rounded-xl text-[11px] font-semibold text-fg-muted hover:bg-accent-primary/10 hover:text-accent-primary hover:border-accent-primary/20 transition-all active:scale-95"
                  >
                    <span>{tmp.icon}</span>
                    <span>{tmp.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button onClick={() => setShowAdd(false)} variant="ghost" className="px-6 rounded-2xl text-sm">Cancel</Button>
              <Button type="submit" className="px-8 rounded-2xl text-sm">Save Task</Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {tasks.length === 0 && (
          <div className="text-center py-20 bg-bg-surface/30 rounded-[2.5rem] border border-dashed border-border-subtle">
            <CheckSquare size={48} className="mx-auto mb-4 text-fg-muted opacity-20" />
            <p className="text-fg-muted font-medium">Nothing here… suspicious 👀</p>
          </div>
        )}
        {tasks.map((task: Task) => (
          <motion.div
            layout
            key={task.id}
            drag="x"
            dragConstraints={{ left: -100, right: 100 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (Math.abs(info.offset.x) > 60) {
                onToggle(task.id);
              }
            }}
            className="relative"
          >
            <div className={`absolute inset-0 rounded-3xl flex items-center justify-between px-8 text-white transition-colors ${task.completed ? 'bg-fg-muted' : 'bg-accent-primary'}`}>
              <CheckCircle2 size={24} />
              <CheckCircle2 size={24} />
            </div>
            <div className={`relative group flex items-center gap-4 bg-bg-surface p-5 rounded-3xl border border-border-subtle transition-all duration-300 ${task.completed ? 'opacity-50' : 'hover:border-accent-primary/30 shadow-sm'}`}>
              <button 
                onClick={() => onToggle(task.id)}
                className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-accent-primary border-accent-primary text-white scale-95' : 'border-border-subtle hover:border-accent-primary/30'}`}
              >
                {task.completed ? <CheckCircle2 size={24} /> : <div className="w-1.5 h-1.5 rounded-full bg-border-subtle group-hover:bg-accent-primary/50" />}
              </button>
              <div className="flex-1 min-w-0" onClick={() => onToggle(task.id)}>
                <h4 className={`text-base font-semibold text-fg-base truncate transition-all ${task.completed ? 'line-through text-fg-muted' : ''}`}>
                  {task.title}
                </h4>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                className="text-fg-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-xl hover:bg-red-500/10"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function NotebookView({ data, onUpdate, onDelete, onAdd, onUpdateStudents, onAddCategory, onDeleteCategory, onUpdateCategory }: any) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [count, setCount] = useState(30);

  const pendingCount = (data.sections || []).filter((s: any) => s.status !== 'Done').length;

  // Sorting and Filtering for Sections
  const [sectionSort, setSectionSort] = useState<'updated' | 'name' | 'subject'>('updated');
  const [sectionFilter, setSectionFilter] = useState<'all' | 'pending' | 'done'>('all');

  // For Details View
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [individualName, setIndividualName] = useState('');
  const [batchNames, setBatchNames] = useState('');
  const [studentFilter, setStudentFilter] = useState<'all' | 'incomplete'>('all');
  const [studentSort, setStudentSort] = useState<'az' | 'za'>('az');
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!name || !subject) return;
    onAdd(name, subject, count);
    setName('');
    setSubject('');
    setShowAdd(false);
  };

  const statusColors: any = {
    'Not checked': 'bg-bg-base text-fg-muted border-border-subtle',
    'Working on it': 'bg-accent-primary/10 text-accent-primary border-accent-primary/20',
    'Done': 'bg-green-500/10 text-green-600 border-green-500/20'
  };

  const selectedSection = data.sections.find((s: any) => s.id === selectedSectionId);

  const filteredSections = (data.sections || [])
    .filter((s: any) => {
      if (sectionFilter === 'pending') return s.status !== 'Done';
      if (sectionFilter === 'done') return s.status === 'Done';
      return true;
    })
    .sort((a: any, b: any) => {
      if (sectionSort === 'name') return a.name.localeCompare(b.name);
      if (sectionSort === 'subject') return a.subject.localeCompare(b.subject);
      return b.updatedAt - a.updatedAt;
    });

  const handleIndividualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSectionId || !individualName.trim()) return;
    const newStudent: Student = {
      id: Math.random().toString(36).substr(2, 9),
      name: individualName.trim()
    };
    onUpdateStudents(selectedSectionId, [...(selectedSection?.students || []), newStudent]);
    setIndividualName('');
  };

  const handleBatchAdd = () => {
    if (!selectedSectionId || !batchNames.trim()) return;
    const names = batchNames.split('\n').filter(n => n.trim());
    const newStudents: Student[] = names.map(n => ({
      id: Math.random().toString(36).substr(2, 9),
      name: n.trim()
    }));

    onUpdateStudents(selectedSectionId, [...(selectedSection?.students || []), ...newStudents]);
    setBatchNames('');
  };

  const removeStudent = (studentId: string) => {
    if (!selectedSection) return;
    const updatedStudents = selectedSection.students.filter((s: any) => s.id !== studentId);
    onUpdateStudents(selectedSection.id, updatedStudents);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSectionId || !newCategoryName.trim()) return;
    onAddCategory(selectedSectionId, newCategoryName.trim());
    setNewCategoryName('');
    setShowAddCategory(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-bold tracking-tight px-1">What’s left 📚</h3>
          {pendingCount > 0 && (
            <p className="text-[10px] font-bold text-accent-primary uppercase tracking-[0.15em] px-1 animate-pulse">
              {pendingCount} sections still waiting 👀
            </p>
          )}
        </div>
        {!selectedSectionId && (
          <div className="flex gap-2">
            <select 
              value={sectionFilter}
              onChange={e => setSectionFilter(e.target.value as any)}
              className="bg-bg-surface border border-border-subtle rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-accent-primary/50"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="done">Done</option>
            </select>
            <Button onClick={() => setShowAdd(!showAdd)} variant="secondary" className="h-10 px-4 rounded-xl border-fg-muted/20">
              <Plus size={18} />
              <span className="text-sm">New Group</span>
            </Button>
          </div>
        )}
        {selectedSectionId && (
          <Button onClick={() => setSelectedSectionId(null)} variant="secondary" className="h-10 px-4 rounded-xl">
            <span className="text-sm">Back to Classes</span>
          </Button>
        )}
      </div>

      {!selectedSectionId && (
        <div className="flex items-center gap-4 px-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-fg-muted">Sort By:</p>
          <div className="flex gap-2">
            {(['updated', 'name', 'subject'] as const).map(sort => (
              <button
                key={sort}
                onClick={() => setSectionSort(sort)}
                className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg transition-all ${sectionSort === sort ? 'bg-accent-primary/10 text-accent-primary' : 'text-fg-muted hover:text-fg-base'}`}
              >
                {sort}
              </button>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {!selectedSectionId && showAdd && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="bg-bg-surface border border-border-subtle rounded-3xl p-6 overflow-hidden shadow-sm space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-fg-muted px-1">Class / Section Name</label>
                <input 
                  autoFocus
                  type="text" 
                  placeholder="e.g. Grade 10 - Section B"
                  value={name || ''}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-bg-base border border-border-subtle px-5 py-3 rounded-2xl outline-none focus:border-fg-muted/40 transition-all text-fg-base"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-fg-muted px-1">Subject</label>
                <input 
                  type="text" 
                  placeholder="e.g. English Literature"
                  value={subject || ''}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full bg-bg-base border border-border-subtle px-5 py-3 rounded-2xl outline-none focus:border-fg-muted/40 transition-all text-fg-base"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button onClick={() => setShowAdd(false)} variant="ghost" className="px-6 rounded-2xl text-sm">Cancel</Button>
              <Button type="submit" className="px-8 rounded-2xl text-sm">Create Class Folder</Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid gap-6 sm:grid-cols-2">
        {!selectedSectionId && filteredSections.length === 0 && (
          <div className="col-span-2 text-center py-20 bg-bg-surface/30 rounded-[2.5rem] border border-dashed border-border-subtle">
            <BookOpen size={48} className="mx-auto mb-4 text-fg-muted opacity-20" />
            <p className="text-fg-muted font-medium">No classes yet. Your workspace is waiting. ✨</p>
          </div>
        )}
        
        {!selectedSectionId && filteredSections.map((section: ClassSection) => {
          const totalCompletions = section.categories.reduce((acc, cat) => acc + Object.keys(cat.completions).length, 0);
          const totalPossible = section.students.length * section.categories.length;
          const overallProgress = totalPossible > 0 ? (totalCompletions / totalPossible) * 100 : 0;

          return (
            <motion.div 
              key={section.id}
              drag="x"
              dragConstraints={{ left: -120, right: 120 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 80) {
                  onDelete(section.id);
                }
              }}
              className="relative"
            >
              <div className="absolute inset-0 bg-red-500 rounded-[2rem] flex items-center justify-between px-8 text-white">
                <Trash2 size={24} />
                <Trash2 size={24} />
              </div>
              <Card className="group relative border border-border-subtle hover:border-fg-muted/30 hover:shadow-lg transition-all duration-300 bg-white">
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    onDelete(section.id); 
                  }}
                  className="absolute top-4 right-4 text-fg-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-xl hover:bg-red-500/10 z-20"
                >
                  <Trash2 size={16} />
                </button>
                
                <div onClick={() => setSelectedSectionId(section.id)} className="cursor-pointer p-8 space-y-6">
                  {/* ... contents ... */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-bg-base border border-border-subtle rounded-2xl flex items-center justify-center text-fg-base">
                      <BookOpen size={28} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-fg-muted">{section.subject}</p>
                      <h4 className="text-xl font-bold tracking-tight text-fg-base">{section.name}</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-bg-base/50 rounded-2xl p-4 border border-border-subtle">
                      <p className="text-[10px] font-bold uppercase text-fg-muted tracking-widest mb-1">Students</p>
                      <p className="text-lg font-bold">{section.students.length}</p>
                    </div>
                    <div className="bg-bg-base/50 rounded-2xl p-4 border border-border-subtle">
                      <p className="text-[10px] font-bold uppercase text-fg-muted tracking-widest mb-1">Sections</p>
                      <p className="text-lg font-bold">{section.categories.length}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-bold uppercase text-fg-muted tracking-widest">Total Progress</p>
                      <p className="text-[10px] font-bold text-fg-base">{Math.round(overallProgress)}%</p>
                    </div>
                    <div className="w-full h-1.5 bg-border-subtle rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${overallProgress}%` }}
                        className="h-full bg-fg-muted/40"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border-subtle/50 space-y-2">
                     {section.categories.slice(0, 3).map(cat => {
                       const count = Object.keys(cat.completions).length;
                       return (
                         <div key={cat.id} className="flex justify-between items-center text-[10px] font-semibold text-fg-muted">
                           <span>{cat.name}</span>
                           <span className="text-fg-base">{count}/{section.students.length}</span>
                         </div>
                       );
                     })}
                     {section.categories.length > 3 && (
                       <p className="text-[9px] text-fg-muted font-bold uppercase tracking-widest pt-1">+{section.categories.length - 3} more sections</p>
                     )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}

        {selectedSectionId && selectedSection && (
          <div className="col-span-2 space-y-6">
            {/* Class Main View - Folder Header */}
            <div className="bg-[#1A1D24] border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-black/40 space-y-8">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-[#2A2F3A] border border-white/5 rounded-[2rem] flex items-center justify-center text-[#E6EAF2]">
                      <BookCheck size={32} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#9AA3B2] mb-1">Class Workspace</p>
                      <h2 className="text-3xl font-black tracking-tight text-[#E6EAF2]">{selectedSection.name}</h2>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex bg-[#0F1115] p-1.5 rounded-2xl border border-white/5">
                      <button 
                        onClick={() => setStudentFilter('all')}
                        className={`px-6 py-2 text-xs font-bold rounded-xl transition-all ${studentFilter === 'all' ? 'bg-[#4F8CFF] shadow-lg shadow-[#4F8CFF]/20 text-white' : 'text-[#9AA3B2] hover:text-[#E6EAF2]'}`}
                      >
                        Full Class
                      </button>
                      <button 
                        onClick={() => setStudentFilter('incomplete')}
                        className={`px-6 py-2 text-xs font-bold rounded-xl transition-all ${studentFilter === 'incomplete' ? 'bg-[#4F8CFF] shadow-lg shadow-[#4F8CFF]/20 text-white' : 'text-[#9AA3B2] hover:text-[#E6EAF2]'}`}
                      >
                        Needs Work
                      </button>
                    </div>
                    <div className="flex bg-[#0F1115] p-1.5 rounded-2xl border border-white/5">
                      <button 
                        onClick={() => setStudentSort('az')}
                        className={`flex-1 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${studentSort === 'az' ? 'bg-white/10 text-white' : 'text-[#9AA3B2]'}`}
                      >
                        A-Z
                      </button>
                      <button 
                        onClick={() => setStudentSort('za')}
                        className={`flex-1 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${studentSort === 'za' ? 'bg-white/10 text-white' : 'text-[#9AA3B2]'}`}
                      >
                        Z-A
                      </button>
                    </div>
                  </div>
               </div>

               {/* Section Management / Adding */}
               <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/5">
                  <div className="flex flex-wrap gap-2">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-[#9AA3B2] mr-2 flex items-center">Trackers:</p>
                     {selectedSection.categories.map(cat => (
                        <div key={cat.id} className="flex items-center gap-2 px-4 py-2 bg-[#2A2F3A] border border-white/10 rounded-full text-[11px] font-bold text-[#E6EAF2] hover:border-[#4F8CFF]/50 transition-all group/badge">
                          <span>{cat.name}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteCategory(selectedSection.id, cat.id);
                            }}
                            className="text-[#9AA3B2] hover:text-red-400 p-1 rounded-full hover:bg-red-500/20 transition-all ml-1"
                          >
                            <X size={14} />
                          </button>
                        </div>
                     ))}
                  </div>
                  <button 
                    onClick={() => setShowAddCategory(!showAddCategory)} 
                    className="h-11 rounded-xl px-5 text-[11px] font-black uppercase tracking-widest whitespace-nowrap bg-[#2A2F3A] text-[#E6EAF2] border border-white/10 hover:border-[#4F8CFF]/50 hover:shadow-[0_0_15px_rgba(79,140,255,0.2)] transition-all flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Tracker
                  </button>
               </div>

               <AnimatePresence>
                  {showAddCategory && (
                    <motion.form 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onSubmit={handleCreateCategory}
                      className="bg-[#0F1115] border border-white/5 p-6 rounded-3xl flex flex-col sm:flex-row gap-4"
                    >
                      <input 
                        autoFocus
                        type="text"
                        placeholder="Section Name (e.g. Unit Test 1)"
                        value={newCategoryName || ''}
                        onChange={e => setNewCategoryName(e.target.value)}
                        className="flex-1 bg-[#1A1D24] border border-white/5 px-5 py-3 rounded-2xl outline-none focus:border-[#4F8CFF]/50 text-[#E6EAF2] text-sm font-medium"
                      />
                       <div className="flex gap-2">
                         <button type="submit" className="flex-1 sm:flex-none px-8 py-3 bg-[#4F8CFF] text-white rounded-2xl text-sm font-bold shadow-lg shadow-[#4F8CFF]/20 hover:opacity-90 transition-all">Create</button>
                         <button onClick={() => setShowAddCategory(false)} className="px-6 py-3 bg-[#2A2F3A] text-[#9AA3B2] hover:text-[#E6EAF2] rounded-2xl text-sm font-bold transition-all">Cancel</button>
                       </div>
                    </motion.form>
                  )}
               </AnimatePresence>
            </div>

            {/* Accordion List of Categories */}
            <div className="space-y-4">
               {selectedSection.categories.map((category: TrackerCategory) => (
                 <TrackerCategorySection 
                    key={category.id}
                    category={category}
                    students={selectedSection.students}
                    sectionId={selectedSection.id}
                    onUpdateCategory={onUpdateCategory}
                    onDeleteCategory={(catId: string) => onDeleteCategory(selectedSection.id, catId)}
                    isExpanded={expandedCategoryId === category.id}
                    onToggle={() => setExpandedCategoryId(expandedCategoryId === category.id ? null : category.id)}
                    filter={studentFilter}
                    sort={studentSort}
                 />
               ))}
            </div>

            {/* Student Roster Management - Keep at Bottom */}
            <div className="bg-[#1A1D24] border border-white/5 rounded-[2.5rem] p-8 space-y-8 mt-12 shadow-2xl shadow-black/40">
               <div className="flex items-center justify-between px-2">
                  <h4 className="text-xl font-black tracking-tight text-[#E6EAF2]">Roster Management</h4>
                  <div className="text-[10px] font-black uppercase text-[#9AA3B2] bg-[#2A2F3A] border border-white/5 px-4 py-2 rounded-xl tracking-widest">
                    {selectedSection.students.length} Enrolled
                  </div>
               </div>

               <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <form onSubmit={handleIndividualAdd} className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9AA3B2] px-1">Add Single Student</label>
                       <div className="flex gap-2">
                          <input 
                             type="text" 
                             value={individualName || ''}
                             onChange={e => setIndividualName(e.target.value)}
                             placeholder="Full name"
                             className="flex-1 bg-[#0F1115] border border-white/5 rounded-2xl px-5 py-3 text-[#E6EAF2] text-sm focus:border-[#4F8CFF]/50 outline-none transition-all"
                          />
                          <button type="submit" className="h-12 w-12 bg-[#2A2F3A] border border-white/5 text-[#E6EAF2] rounded-2xl flex items-center justify-center hover:bg-[#4F8CFF] hover:text-white transition-all shadow-lg active:scale-95">
                             <Plus size={20} />
                          </button>
                       </div>
                    </form>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9AA3B2] px-1">Batch Import List</label>
                       <textarea 
                          value={batchNames || ''}
                          onChange={e => setBatchNames(e.target.value)}
                          placeholder="Paste names here... (one per line)"
                          className="w-full h-32 bg-[#0F1115] border border-white/5 rounded-[2rem] p-5 text-[#E6EAF2] text-sm font-medium outline-none focus:border-[#4F8CFF]/30 resize-none transition-all"
                       />
                       <button onClick={handleBatchAdd} className="w-full py-4 bg-[#2A2F3A] text-[#E6EAF2] border border-white/5 hover:border-[#4F8CFF]/30 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] transition-all shadow-lg active:scale-95">
                          Import Batch List
                       </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9AA3B2] px-1">Active Students</p>
                     <div className="custom-scrollbar max-h-[300px] overflow-y-auto space-y-2 pr-2">
                        {selectedSection.students.length === 0 ? (
                           <div className="text-center py-10 opacity-30 italic text-xs text-[#9AA3B2]">No students yet</div>
                        ) : (
                          selectedSection.students.map((student: Student) => (
                            <div key={student.id} className="flex items-center justify-between p-4 bg-[#0F1115] rounded-2xl border border-white/5 group hover:border-[#4F8CFF]/20 transition-all">
                               <span className="text-sm font-bold text-[#E6EAF2] px-2">{student.name}</span>
                               <button 
                                 onClick={() => removeStudent(student.id)}
                                 className="text-[#9AA3B2] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-xl hover:bg-red-500/10"
                               >
                                  <Trash2 size={16} />
                               </button>
                            </div>
                          ))
                        )}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TrackerCategorySection({ category, students, sectionId, onUpdateCategory, onDeleteCategory, isExpanded, onToggle, filter, sort }: any) {
  const [draftCompletions, setDraftCompletions] = useState<Record<string, boolean>>(category.completions);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setDraftCompletions(category.completions);
    setHasChanges(false);
  }, [category.completions, isExpanded]);

  const completedCount = Object.keys(draftCompletions).length;
  const progressPercent = students.length > 0 ? (completedCount / students.length) * 100 : 0;

  const handleToggleStudent = (studentId: string) => {
    const newDraft = { ...draftCompletions };
    if (newDraft[studentId]) {
      delete newDraft[studentId];
    } else {
      newDraft[studentId] = true;
    }
    setDraftCompletions(newDraft);
    setHasChanges(true);
  };

  const handleSetAllDraft = (val: boolean) => {
    const newDraft: Record<string, boolean> = {};
    if (val) {
      students.forEach((s: any) => newDraft[s.id] = true);
    }
    setDraftCompletions(newDraft);
    setHasChanges(true);
  };

  const handleApplyChanges = () => {
    onUpdateCategory(sectionId, category.id, draftCompletions);
    setHasChanges(false);
  };

  const filteredList = students.filter((s: any) => {
    if (filter === 'incomplete') return !draftCompletions[s.id];
    return true;
  }).sort((a: any, b: any) => {
    if (sort === 'za') return b.name.localeCompare(a.name);
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="bg-[#1A1D24] border border-white/5 rounded-[2rem] overflow-hidden shadow-xl transition-all duration-300">
       <div 
         className="p-6 cursor-pointer hover:bg-white/5 flex items-center justify-between transition-colors group"
         onClick={onToggle}
       >
          <div className="flex items-center gap-4">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isExpanded ? 'bg-[#4F8CFF] text-white shadow-lg shadow-[#4F8CFF]/20' : 'bg-[#2A2F3A] text-[#9AA3B2]'}`}>
                {isExpanded ? <BookCheck size={22} /> : <BookOpen size={20} />}
             </div>
             <div>
                <h4 className="text-lg font-bold tracking-tight text-[#E6EAF2]">{category.name}</h4>
                <div className="flex items-center gap-3 mt-1">
                   <div className="w-32 h-1.5 bg-[#2A2F3A] rounded-full overflow-hidden">
                      <div className="h-full bg-[#4F8CFF]" style={{ width: `${progressPercent}%` }} />
                   </div>
                   <span className="text-[10px] font-black text-[#9AA3B2] uppercase tracking-[0.2em]">{completedCount} / {students.length} Done</span>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={(e) => {
                 e.stopPropagation();
                 onDeleteCategory(category.id);
               }}
               className="w-10 h-10 flex items-center justify-center text-[#9AA3B2] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
               title="Delete Tracker"
             >
                <Trash2 size={18} />
             </button>
             <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                <ChevronRight size={20} className="text-[#9AA3B2]" />
             </div>
          </div>
       </div>

       <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/5"
            >
               <div className="p-4 bg-[#0F1115] flex flex-wrap items-center justify-between gap-4 border-b border-white/5">
                  <div className="flex gap-2">
                     <button 
                       onClick={() => handleSetAllDraft(true)}
                       className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-[#2A2F3A] text-[#E6EAF2] border border-white/5 rounded-xl hover:bg-[#4F8CFF] hover:text-white transition-all shadow-sm"
                     >
                       Mark All
                     </button>
                     <button 
                       onClick={() => handleSetAllDraft(false)}
                       className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-[#2A2F3A] text-[#9AA3B2] border border-white/5 rounded-xl hover:bg-red-500/80 hover:text-white transition-all shadow-sm"
                     >
                       Clear All
                     </button>
                  </div>

                  {hasChanges && (
                    <motion.button 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={handleApplyChanges}
                      className="px-6 py-2 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all"
                    >
                      Save Changes
                    </motion.button>
                  )}

                  <div className="text-[10px] font-bold text-[#9AA3B2] uppercase tracking-[0.25em] px-2 italic opacity-50">
                     Live Check: {category.name}
                  </div>
               </div>

               <div className="max-h-[500px] overflow-y-auto custom-scrollbar bg-[#0F1115]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-4">
                     {filteredList.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-xs text-fg-muted italic opacity-50">
                           No students matching this view
                        </div>
                     ) : (
                       filteredList.map((student: any) => {
                         const isDone = !!draftCompletions[student.id];
                         return (
                           <button
                             key={student.id}
                             onClick={() => handleToggleStudent(student.id)}
                             className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left group ${
                                isDone 
                               ? 'bg-[#2A2F3A] border-[#4F8CFF]/20 text-[#E6EAF2]' 
                               : 'bg-[#1A1D24] border-white/5 text-[#9AA3B2] hover:border-white/10 hover:text-[#E6EAF2]'
                             }`}
                           >
                              <span className={`text-sm font-bold truncate pr-3 ${isDone ? 'text-white' : ''}`}>{student.name}</span>
                              <div className={`flex-shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                                isDone 
                                ? 'bg-[#4F8CFF] border-[#4F8CFF] text-white scale-110 shadow-[0_0_10px_rgba(79,140,255,0.4)]' 
                                : 'bg-[#0F1115] border-white/10 text-transparent group-hover:border-[#4F8CFF]/50'
                              }`}>
                                 <Check size={14} strokeWidth={4} />
                              </div>
                           </button>
                         )
                       })
                     )}
                  </div>
               </div>
            </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
}

function SettingsView({ data, onUpdateProfile }: any) {
  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h3 className="text-3xl font-bold tracking-tight">Settings</h3>
        <p className="text-fg-muted">Personalize your teacher workspace.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Profile Card */}
        <Card className="p-8 space-y-8 border border-border-subtle bg-bg-surface">
           <div className="space-y-6">
              <div className="flex items-center gap-4 border-b border-border-subtle pb-6">
                 <div className="w-16 h-16 bg-accent-primary/10 rounded-[2rem] flex items-center justify-center text-accent-primary text-xl">
                    <User size={32} />
                 </div>
                 <div>
                    <h4 className="text-xl font-bold">{data.profile.name}</h4>
                    <p className="text-xs text-fg-muted font-bold uppercase tracking-widest">{data.profile.salutation}</p>
                 </div>
              </div>
           </div>
        </Card>

        {/* Theme Settings */}
        <div className="space-y-8">
          <Card className="p-8 space-y-8 border border-border-subtle bg-bg-surface">
             <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-fg-muted mb-4 block px-1">Appearance</label>
                  <div className="grid grid-cols-3 gap-3">
                     {THEME_MODES.map(mode => (
                       <button
                         key={mode}
                         onClick={() => onUpdateProfile({ ...data.profile, themeMode: mode })}
                         className={`flex flex-col items-center gap-2 py-4 px-3 rounded-2xl border transition-all ${data.profile.themeMode === mode ? 'bg-accent-primary/10 border-accent-primary text-accent-primary' : 'bg-bg-base border-border-subtle text-fg-muted hover:border-accent-primary/30'}`}
                       >
                          {mode === 'light' ? <Sun size={20} /> : mode === 'dark' ? <Moon size={20} /> : <div className="flex gap-0.5"><Sun size={12} /> <Moon size={12} /></div>}
                          <span className="text-[10px] font-bold uppercase tracking-widest">{mode}</span>
                       </button>
                     ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-fg-muted mb-4 block px-1">Accent Color</label>
                  <div className="flex flex-wrap gap-3">
                     {COLOR_THEMES.map(theme => (
                       <button
                         key={theme}
                         onClick={() => onUpdateProfile({ ...data.profile, colorTheme: theme })}
                         className={`h-10 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${data.profile.colorTheme === theme ? 'bg-accent-primary text-white border-accent-primary' : 'bg-bg-base text-fg-muted border-border-subtle hover:border-accent-primary/30'}`}
                       >
                          {theme}
                       </button>
                     ))}
                  </div>
                </div>
             </div>
          </Card>
        </div>
      </div>

      <div className="flex justify-center pt-10">
         <button 
           onClick={() => {
             if (confirm('Are you sure you want to reset all data and settings?')) {
               localStorage.removeItem(STORAGE_KEY);
               window.location.reload();
             }
           }}
           className="text-[10px] font-bold uppercase tracking-widest text-fg-muted hover:text-red-500 transition-colors px-6 py-2 rounded-full hover:bg-red-500/10"
         >
           Reset Workspace
         </button>
      </div>
    </div>
  );
}

function ProfileView({ data, quote, onUpdateProfile }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(data.profile.name || '');
  const [editSalutation, setEditSalutation] = useState(data.profile.salutation || 'Sir');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 512) {
        alert('Image is too large. Please select an image under 512KB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateProfile({ ...data.profile, profilePicture: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onUpdateProfile({ 
      ...data.profile, 
      name: editName, 
      salutation: editSalutation 
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full border-4 border-accent-primary flex items-center justify-center overflow-hidden bg-bg-surface shadow-lg">
            {data.profile.profilePicture ? (
              <img src={data.profile.profilePicture} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User size={48} className="text-fg-muted" />
            )}
          </div>
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-1 right-1 bg-accent-primary text-white p-2.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
          >
            <Camera size={18} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        <div className="space-y-2">
          {!isEditing ? (
            <>
              <div className="flex items-center justify-center gap-3">
                <h2 className="text-3xl font-bold tracking-tight">
                  {data.profile.salutation} {data.profile.name}
                </h2>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-fg-muted hover:text-accent-primary transition-colors"
                >
                  <Edit2 size={18} />
                </button>
              </div>
              <p className="text-fg-muted font-medium max-w-xs mx-auto text-sm leading-relaxed px-4 italic">
                {quote}
              </p>
            </>
          ) : (
            <Card className="p-6 space-y-4 max-w-sm mx-auto border-accent-primary/20 bg-accent-primary/5">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-fg-muted">Edit Identity</p>
                <button onClick={() => setIsEditing(false)} className="text-fg-muted hover:text-fg-base">
                  <X size={16} />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <select 
                    value={editSalutation}
                    onChange={e => setEditSalutation(e.target.value)}
                    className="bg-bg-base border border-border-subtle rounded-xl px-2 py-2 text-sm focus:ring-2 focus:ring-accent-primary outline-none"
                  >
                    {SALUTATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Full Name"
                    className="flex-1 bg-bg-base border border-border-subtle rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-accent-primary outline-none"
                  />
                </div>
                <Button onClick={handleSave} className="w-full h-10 rounded-xl text-sm">
                  Save Changes
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <Card className="p-6 border-border-subtle/50 flex items-center gap-5">
          <div className="w-12 h-12 bg-accent-primary/10 rounded-2xl flex items-center justify-center text-accent-primary shrink-0">
             <ClipboardCheck size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-fg-muted uppercase tracking-widest leading-none mb-1">Consistency</p>
            <p className="text-lg font-bold">Top Tier</p>
            <p className="text-[10px] text-fg-muted italic">You’re actually doing it. ✨</p>
          </div>
        </Card>
      </div>

      <div className="pt-6 text-center">
        <p className="text-[10px] text-fg-muted font-bold uppercase tracking-[0.2em] mb-4">Quick Stats</p>
        <div className="flex justify-center gap-12 sm:gap-20">
          <div className="text-center">
            <p className="text-3xl font-bold tabular-nums">{(data.tasks || []).filter((t:any) => t.completed).length}</p>
            <p className="text-[10px] text-fg-muted font-bold uppercase tracking-widest">Tasks Done</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold tabular-nums">{(data.sections || []).filter((s:any) => s.status === 'Done').length}</p>
            <p className="text-[10px] text-fg-muted font-bold uppercase tracking-widest">Checked Lists</p>
          </div>
        </div>
      </div>
    </div>
  );
}
