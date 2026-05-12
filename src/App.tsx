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
  X,
  Frown,
  Smile,
  BarChart3,
  TrendingUp,
  Search,
  Tag,
  Calendar,
  Filter,
  RefreshCw,
  Skull,
  Zap,
  Dices,
  Copy,
  Share2
} from 'lucide-react';
import { Task, ClassSection, UserProfile, Status, AppData, Student, TrackerCategory, ThemeMode, ColorTheme, MomentEntry, ChaosDecision } from './types';
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
  sections: [],
  moments: [],
  chaosHistory: []
};

// --- Components ---

const Logo = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M30 45 C 20 20, 50 20, 50 45 C 50 70, 80 70, 80 45 C 80 20, 50 20, 50 45" 
      stroke="currentColor" 
      strokeWidth="8" 
      strokeLinecap="round" 
    />
    <circle cx="40" cy="75" r="5" fill="currentColor" />
    <circle cx="60" cy="75" r="5" fill="currentColor" />
    <line x1="45" y1="85" x2="55" y2="85" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

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
    if (!parsed.moments) parsed.moments = [];
    if (!parsed.chaosHistory) parsed.chaosHistory = [];
    
    return parsed;
  });

  const [activeTab, setActiveTab] = useState<'tasks' | 'notebooks' | 'moments' | 'chaos' | 'settings' | 'profile'>('tasks');
  const [isSetup, setIsSetup] = useState(!data.profile.name);
  const [motivatingQuote, setMotivatingQuote] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial entrance delay
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

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

  const addMoment = (type: 'negative' | 'positive', title: string, note: string, tags: string[]) => {
    const newMoment: MomentEntry = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title,
      note: note.trim() || undefined,
      tags,
      createdAt: Date.now()
    };
    setData(prev => ({ ...prev, moments: [newMoment, ...(prev.moments || [])] }));
  };

  const deleteMoment = (id: string) => {
    setData(prev => ({ ...prev, moments: (prev.moments || []).filter(m => m.id !== id) }));
  };

  const addChaosDecision = (question: string, choices: string[], winner: string) => {
    const newDecision: ChaosDecision = {
      id: Math.random().toString(36).substr(2, 9),
      question,
      choices,
      winner,
      createdAt: Date.now()
    };
    setData(prev => ({ ...prev, chaosHistory: [newDecision, ...(prev.chaosHistory || [])].slice(0, 20) }));
  };

  const deleteChaosDecision = (id: string) => {
    setData(prev => ({ ...prev, chaosHistory: (prev.chaosHistory || []).filter(d => d.id !== id) }));
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
              <Logo size={40} />
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
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-bg-base flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="space-y-8"
            >
              <Logo size={48} className="mx-auto text-accent-primary opacity-20" />
              <p className="text-[11px] font-bold text-fg-muted uppercase tracking-[0.4em] leading-loose max-w-[200px] mx-auto opacity-60">
                if you’re here, you’re basically my person ✨
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header */}
      <header className="bg-bg-surface/80 backdrop-blur-md border-b border-border-subtle px-6 py-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-primary text-white rounded-2xl flex items-center justify-center">
              <Logo size={24} />
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
          {activeTab === 'moments' && (
            <MomentsView 
              data={data} 
              onAdd={addMoment} 
              onDelete={deleteMoment} 
            />
          )}
          {activeTab === 'chaos' && (
            <ChaosView 
              data={data} 
              onAdd={addChaosDecision} 
              onDelete={deleteChaosDecision} 
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
        <NavButton active={activeTab === 'moments'} onClick={() => setActiveTab('moments')} icon={<MessageSquare size={18} />} label="Moments" />
        <NavButton active={activeTab === 'chaos'} onClick={() => setActiveTab('chaos')} icon={<Zap size={18} />} label="Chaos 💀" />
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

function MomentsView({ data, onAdd, onDelete }: any) {
  const [activeType, setActiveType] = useState<'negative' | 'positive'>('negative');
  const [showAdd, setShowAdd] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const moments = data.moments || [];
  const filteredMoments = moments.filter((m: MomentEntry) => {
    const matchesType = m.type === activeType;
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) || 
                         (m.note && m.note.toLowerCase().includes(search.toLowerCase()));
    const matchesTag = filterTag ? m.tags.includes(filterTag) : true;
    return matchesType && matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(moments.filter((m: any) => m.type === activeType).flatMap((m: any) => m.tags)));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    onAdd(activeType, title, note, tags);
    setTitle('');
    setNote('');
    setTagsInput('');
    setShowAdd(false);
  };

  // Stats Logic
  const stats = React.useMemo(() => {
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const oneMonth = 30 * 24 * 60 * 60 * 1000;

    const typeMoments = moments.filter((m: any) => m.type === activeType);
    
    // Most repeated tags
    const tagCounts: Record<string, number> = {};
    typeMoments.forEach((m: any) => m.tags.forEach((t: string) => tagCounts[t] = (tagCounts[t] || 0) + 1));
    const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Most recurring thing (by title)
    const titleCounts: Record<string, number> = {};
    typeMoments.forEach((m: any) => titleCounts[m.title] = (titleCounts[m.title] || 0) + 1);
    const topRecurring = Object.entries(titleCounts).sort((a, b) => b[1] - a[1]).slice(0, 1)[0];

    // Trends
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now - (6 - i) * 24 * 60 * 60 * 1000);
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    });
    
    const trendData = last7Days.map((day, i) => {
      const dayStart = new Date(now - (6 - i) * 24 * 60 * 60 * 1000);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      
      const count = typeMoments.filter((m: any) => m.createdAt >= dayStart.getTime() && m.createdAt <= dayEnd.getTime()).length;
      return { day, count };
    });

    return {
      weeklyCount: typeMoments.filter((m: any) => now - m.createdAt < oneWeek).length,
      monthlyCount: typeMoments.filter((m: any) => now - m.createdAt < oneMonth).length,
      topTags,
      topRecurring,
      trendData
    };
  }, [moments, activeType]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex p-1 bg-bg-surface border border-border-subtle rounded-2xl w-fit">
          <button
            onClick={() => setActiveType('negative')}
            className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${activeType === 'negative' ? 'bg-[#FF4F4F]/10 text-[#FF4F4F] shadow-sm' : 'text-fg-muted hover:text-fg-base'}`}
          >
            <Frown size={16} />
            Pissed Me Off
          </button>
          <button
            onClick={() => setActiveType('positive')}
            className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${activeType === 'positive' ? 'bg-[#4FFF4F]/10 text-green-600 shadow-sm' : 'text-fg-muted hover:text-fg-base'}`}
          >
            <Smile size={16} />
            Made Me Smile
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className={`h-11 px-5 rounded-xl border flex items-center gap-2 transition-all ${showStats ? 'bg-accent-primary text-white border-accent-primary' : 'bg-bg-surface border-border-subtle text-fg-muted hover:border-accent-primary/50'}`}
          >
            <BarChart3 size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Stats</span>
          </button>
          <Button onClick={() => setShowAdd(!showAdd)} className="h-11 px-5 rounded-xl shrink-0">
            <Plus size={18} />
            <span className="text-sm">Log Moment</span>
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAdd}
            className="bg-bg-surface border border-border-subtle rounded-3xl p-8 overflow-hidden space-y-6 shadow-xl"
          >
            <div className="space-y-6">
              <input
                autoFocus
                type="text"
                placeholder={activeType === 'negative' ? "What ticked you off?" : "What made you smile?"}
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full text-2xl font-black bg-transparent border-b-2 border-border-subtle py-2 focus:border-accent-primary outline-none text-fg-base placeholder:text-fg-muted transition-colors"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-fg-muted px-1 block">Short Note (Optional)</label>
                  <input
                    type="text"
                    placeholder="Minimal details..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    className="w-full bg-bg-base border border-border-subtle px-5 py-3 rounded-2xl outline-none focus:border-accent-primary/50 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-fg-muted px-1 block">Tags (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="work, people, random..."
                    value={tagsInput}
                    onChange={e => setTagsInput(e.target.value)}
                    className="w-full bg-bg-base border border-border-subtle px-5 py-3 rounded-2xl outline-none focus:border-accent-primary/50 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-fg-muted hover:text-fg-base transition-colors"
              >
                Cancel
              </button>
              <Button type="submit" className="px-10 rounded-2xl shadow-lg">Save Moment</Button>
            </div>
          </motion.form>
        )}

        {showStats && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-[#1A1D24] text-white rounded-[2.5rem] p-8 border border-white/5 space-y-10"
          >
            <div className="flex items-center gap-3">
              <TrendingUp size={24} className="text-[#4F8CFF]" />
              <h4 className="text-xl font-black tracking-tight">{activeType === 'negative' ? 'Vibe Check: Annoyances' : 'Vibe Check: Joys'}</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9AA3B2]">Frequency</p>
                  <div className="flex gap-4">
                    <div className="flex-1 bg-[#2A2F3A] p-4 rounded-2xl border border-white/5">
                      <p className="text-2xl font-black">{stats.weeklyCount}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#9AA3B2]">This Week</p>
                    </div>
                    <div className="flex-1 bg-[#2A2F3A] p-4 rounded-2xl border border-white/5">
                      <p className="text-2xl font-black">{stats.monthlyCount}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#9AA3B2]">This Month</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9AA3B2]">Mostly Recurring</p>
                  <div className="bg-[#2A2F3A] p-5 rounded-2xl border border-white/5">
                    {stats.topRecurring ? (
                      <div>
                        <p className="text-sm font-bold text-[#E6EAF2]">“{stats.topRecurring[0]}”</p>
                        <p className="text-[10px] text-[#9AA3B2] uppercase tracking-[0.1em] mt-1 italic">Happened {stats.topRecurring[1]} times</p>
                      </div>
                    ) : (
                      <p className="text-xs text-[#9AA3B2] italic">Not enough data yet.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9AA3B2]">Top Categories</p>
                <div className="space-y-2">
                  {stats.topTags.map(([tag, count]) => (
                    <div key={tag} className="flex items-center justify-between p-3 bg-[#0F1115] rounded-xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#4F8CFF]" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#E6EAF2]">{tag}</span>
                      </div>
                      <span className="text-[10px] font-black text-[#9AA3B2]">{count}x</span>
                    </div>
                  ))}
                  {stats.topTags.length === 0 && <p className="text-xs text-[#9AA3B2] italic">No tags registered.</p>}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9AA3B2]">Activity Trends</p>
                <div className="h-40 flex items-end justify-between gap-1 px-2">
                  {stats.trendData.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1">
                      <div className="w-full bg-[#2A2F3A] rounded-t-lg relative group h-32 flex items-end">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(d.count / Math.max(...stats.trendData.map(val => val.count) || [1])) * 100}%` }}
                          className={`w-full rounded-t-lg transition-all ${activeType === 'negative' ? 'bg-[#FF4F4F]' : 'bg-[#4FFF4F]'}`}
                        />
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          {d.count}
                        </div>
                      </div>
                      <span className="text-[8px] font-black uppercase text-[#9AA3B2] tracking-tighter">{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-muted" size={18} />
          <input
            type="text"
            placeholder="Search entries..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-bg-surface border border-border-subtle pl-12 pr-6 py-3 rounded-2xl outline-none focus:border-accent-primary/40 text-sm transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar sm:max-w-xs md:max-w-md">
          <button
            onClick={() => setFilterTag(null)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${!filterTag ? 'bg-accent-primary text-white border-accent-primary' : 'bg-bg-surface border-border-subtle text-fg-muted hover:bg-bg-base'}`}
          >
            All Tags
          </button>
          {allTags.map(tag => (
            <button
              key={tag as string}
              onClick={() => setFilterTag(filterTag === tag ? null : tag as string)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${filterTag === tag ? 'bg-accent-primary text-white border-accent-primary' : 'bg-bg-surface border-border-subtle text-fg-muted hover:bg-bg-base'}`}
            >
              #{tag as string}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredMoments.length === 0 ? (
          <div className="text-center py-20 bg-bg-surface/30 rounded-[2.5rem] border border-dashed border-border-subtle">
            <Calendar size={48} className="mx-auto mb-4 text-fg-muted opacity-20" />
            <p className="text-fg-muted font-medium">Nothing logged here. Peace acquired? ✨</p>
          </div>
        ) : (
          filteredMoments.map((moment: MomentEntry) => (
            <motion.div
              layout
              key={moment.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="group relative bg-bg-surface border border-border-subtle rounded-3xl p-5 hover:border-accent-primary/20 transition-all hover:shadow-lg flex items-center gap-5"
            >
              <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center transition-colors ${moment.type === 'negative' ? 'bg-[#FF4F4F]/10 text-[#FF4F4F]' : 'bg-[#4FFF4F]/10 text-green-600'}`}>
                {moment.type === 'negative' ? <Frown size={24} /> : <Smile size={24} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-0.5">
                  <h5 className="text-base font-black tracking-tight text-fg-base truncate uppercase italic">“{moment.title}”</h5>
                  <p className="text-[10px] font-bold text-fg-muted tabular-nums">
                    {new Date(moment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {moment.note && <p className="text-xs text-fg-muted mb-3 line-clamp-1 italic">{moment.note}</p>}
                <div className="flex flex-wrap gap-2">
                  {moment.tags.map(tag => (
                    <span key={tag} className="text-[9px] font-bold uppercase tracking-widest text-accent-primary bg-accent-primary/10 px-2.5 py-1 rounded-lg">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => onDelete(moment.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-fg-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function ChaosView({ data, onAdd, onDelete }: any) {
  const [question, setQuestion] = useState('');
  const [choices, setChoices] = useState(['', '']);
  const [isDeciding, setIsDeciding] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState('');

  const loadingTexts = [
    "consulting the universe…",
    "this is so unserious",
    "terrible options honestly",
    "yk what…",
    "counting to 3 in Gen Z...",
    "slaying the decision tree...",
    "vibe checking the results...",
    "manifesting a choice...",
    "checking the cards"
  ];

  const handleAddChoice = () => {
    setChoices([...choices, '']);
  };

  const handleRemoveChoice = (index: number) => {
    if (choices.length > 2) {
      setChoices(choices.filter((_, i) => i !== index));
    }
  };

  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    setChoices(newChoices);
  };

  const handleDecide = () => {
    if (!question.trim() || choices.filter(c => c.trim()).length < 2) return;
    
    setIsDeciding(true);
    setWinner(null);
    let count = 0;
    const interval = setInterval(() => {
      setLoadingText(loadingTexts[Math.floor(Math.random() * loadingTexts.length)]);
      count++;
      if (count > 6) {
        clearInterval(interval);
        const validChoices = choices.filter(c => c.trim());
        const picked = validChoices[Math.floor(Math.random() * validChoices.length)];
        setWinner(picked);
        setIsDeciding(false);
        onAdd(question, validChoices, picked);
      }
    }, 600);
  };

  const reroll = () => {
    handleDecide();
  };

  const reset = () => {
    setQuestion('');
    setChoices(['', '']);
    setWinner(null);
  };

  const history = data.chaosHistory || [];

  return (
    <div className="space-y-10 pb-20">
      <div className="space-y-1">
        <h3 className="text-3xl font-black tracking-tighter italic">Chaos Decide 💀</h3>
        <p className="text-fg-muted font-bold uppercase tracking-widest text-[10px]">Let the universe handle your mid-life crisis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-8">
          <Card className="p-8 border border-border-subtle bg-bg-surface space-y-8 shadow-xl">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-fg-muted px-1">The Situation / Question</label>
              <input 
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="What should I do? (wrong answers only)"
                className="w-full text-2xl font-black bg-transparent border-b-2 border-border-subtle py-2 focus:border-accent-primary outline-none transition-colors"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-fg-muted px-1">Multiple Choices (Help me)</label>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {choices.map((choice, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex gap-3"
                    >
                      <div className="flex-1 relative group">
                        <input 
                          value={choice}
                          onChange={e => handleChoiceChange(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          className="w-full bg-bg-base border border-border-subtle rounded-2xl px-6 py-4 outline-none focus:border-accent-primary/40 text-sm font-bold transition-all"
                        />
                        <div className="absolute left-0 top-0 h-full w-1 bg-accent-primary/10 rounded-l-2xl group-focus-within:bg-accent-primary transition-colors" />
                      </div>
                      <button 
                        onClick={() => handleRemoveChoice(index)}
                        disabled={choices.length <= 2}
                        className="w-14 h-14 rounded-2xl bg-bg-base border border-border-subtle text-fg-muted hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-all disabled:opacity-20"
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                <button 
                  onClick={handleAddChoice}
                  className="w-full py-4 rounded-[2rem] border border-dashed border-border-subtle text-fg-muted hover:text-accent-primary hover:border-accent-primary/40 hover:bg-accent-primary/5 transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Add more chaos
                </button>
              </div>
            </div>

            <div className="pt-4">
              <AnimatePresence mode="wait">
                {isDeciding ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full py-6 flex flex-col items-center justify-center gap-4 bg-accent-primary/5 rounded-[2.5rem] border border-accent-primary/20"
                  >
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map(i => (
                        <motion.div 
                          key={i}
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
                          className="w-2 h-2 rounded-full bg-accent-primary"
                        />
                      ))}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-primary italic">{loadingText}</p>
                  </motion.div>
                ) : winner ? (
                  <motion.div 
                    key="result"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full p-10 bg-bg-base border-2 border-accent-primary rounded-[2.5rem] text-center space-y-6 shadow-2xl"
                  >
                    <div className="space-y-2">
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-fg-muted italic">Universe Picked:</p>
                       <h2 className="text-4xl font-black tracking-tight text-accent-primary uppercase italic break-words">{winner} won.</h2>
                    </div>
                    <p className="text-xs font-bold text-fg-muted italic">Congratulations I guess. It is what it is.</p>
                    <div className="flex gap-3 justify-center">
                      <button 
                        onClick={reroll}
                        className="px-6 py-3 bg-accent-primary text-white rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest shadow-lg shadow-accent-primary/30 active:scale-95 transition-all"
                      >
                        <RefreshCw size={16} />
                        Do it again 😭
                      </button>
                      <button 
                        onClick={reset}
                        className="px-6 py-3 bg-bg-surface border border-border-subtle text-fg-muted rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-fg-base active:scale-95 transition-all"
                      >
                        Reset
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <button 
                    onClick={handleDecide}
                    disabled={!question.trim() || choices.filter(c => c.trim()).length < 2}
                    className="w-full py-6 bg-accent-primary text-white rounded-[2.5rem] font-black text-lg tracking-tighter italic flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-accent-primary/20 hover:shadow-accent-primary/40 disabled:opacity-30 disabled:hover:scale-100 disabled:shadow-none"
                  >
                    <Zap size={24} fill="currentColor" />
                    {question.length > 20 ? "PICK MY FATE" : "BRO DECIDE FOR ME"}
                  </button>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 px-2">
            <Skull size={20} className="text-fg-muted" />
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-fg-muted">Past Traumas</h4>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {history.length === 0 ? (
               <div className="p-10 border border-dashed border-border-subtle rounded-[2rem] text-center space-y-4">
                  <Dices size={32} className="mx-auto text-fg-muted/20" />
                  <p className="text-[10px] font-bold text-fg-muted uppercase tracking-widest leading-loose">No decisions recorded.<br/>Live your life I guess.</p>
               </div>
            ) : (
              history.map((item: ChaosDecision) => (
                <motion.div 
                  layout
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-bg-surface border border-border-subtle p-5 rounded-3xl hover:border-accent-primary/30 transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-[#4F8CFF] uppercase tracking-widest">{item.question}</p>
                      <h5 className="text-base font-black tracking-tight text-fg-base italic uppercase truncate">“{item.winner}”</h5>
                      <div className="flex flex-wrap gap-1.5 opacity-40 group-hover:opacity-70 transition-opacity">
                        {item.choices.slice(0, 3).map((choice, i) => (
                          <span key={i} className="text-[9px] font-bold text-fg-muted bg-bg-base px-2 py-0.5 rounded-lg">
                            {choice}
                          </span>
                        ))}
                        {item.choices.length > 3 && <span className="text-[9px] font-bold text-fg-muted">+{item.choices.length - 3}</span>}
                      </div>
                    </div>
                    <button 
                      onClick={() => onDelete(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-fg-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsView({ data, onUpdateProfile }: any) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: 'loooop',
      text: 'Check out loooop - a super cute productivity companion! ✨',
      url: window.location.origin,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h3 className="text-3xl font-bold tracking-tight">Settings</h3>
        <p className="text-fg-muted">Personalize your teacher workspace.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-8">
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
        </div>

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

      <div className="space-y-12 pt-16 border-t border-border-subtle">
        <div className="max-w-md mx-auto space-y-6 text-center">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-fg-muted italic">share loooop</h4>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={handleShare}
                className="px-8 py-3 bg-accent-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-accent-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Share2 size={14} />
                Share link
              </button>
              <button 
                onClick={copyToClipboard}
                className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border transition-all active:scale-95 ${copied ? 'bg-green-500 border-green-500 text-white' : 'bg-bg-surface border-border-subtle text-fg-muted hover:bg-bg-base'}`}
              >
                {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
            <p className="text-[10px] font-bold text-fg-muted uppercase tracking-widest opacity-30 pt-4">
              if you’re here, you’re basically my person ✨
            </p>
        </div>

        <div className="flex justify-center">
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
