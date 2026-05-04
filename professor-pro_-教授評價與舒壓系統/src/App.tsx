import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Star, 
  MessageSquare, 
  Hammer, 
  Plus, 
  ArrowLeft,
  ArrowRight,
  User, 
  Quote, 
  Target, 
  Zap, 
  Coffee, 
  BookOpen, 
  Trophy 
} from 'lucide-react';

// --- Types ---
interface Metrics {
  score: number;      // 給分慷慨度
  sweety: number;     // 甜度
  coolness: number;   // 涼度
  knowledge: number;  // 知識度
}

interface Comment {
  id: string;
  text: string;
  author: string;
  courseName: string; // Added courseName
  date: string;
  metrics: Metrics;
}

interface Professor {
  id: string;
  name: string;
  department: string;
  courses: string[]; 
  relatedProfessors: string[]; 
  searchCount: number; 
  avgMetrics: Metrics;
  comments: Comment[];
  beatenCount: number;
  photoUrl: string;
  photoHitUrl: string;
}

// --- Initial Data ---
const INITIAL_PROFESSORS: Professor[] = [
  {
    id: '1',
    name: '王小明',
    department: '資訊工程學系',
    courses: ['資料結構', '演算法', '作業系統'],
    relatedProfessors: ['2', '5'],
    searchCount: 150,
    avgMetrics: { score: 4.5, sweety: 4.8, coolness: 3.5, knowledge: 4.2 },
    beatenCount: 12,
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400&h=300&auto=format&fit=crop',
    photoHitUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=400&h=300&auto=format&fit=crop',
    comments: [
      { 
        id: 'c1', text: '老師教得很清楚，大推！', author: '資工二', courseName: '資料結構', date: '2024-03-20',
        metrics: { score: 5, sweety: 5, coolness: 4, knowledge: 5 }
      },
    ]
  },
  {
    id: '2',
    name: '李大華',
    department: '電機工程學系',
    courses: ['電路學', '電子學', '訊號與系統'],
    relatedProfessors: ['1', '3'],
    searchCount: 200,
    avgMetrics: { score: 2.2, sweety: 1.5, coolness: 1.2, knowledge: 3.8 },
    beatenCount: 85,
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&h=300&auto=format&fit=crop',
    photoHitUrl: 'https://images.unsplash.com/photo-1555952517-2e8e729e0b44?q=80&w=400&h=300&auto=format&fit=crop',
    comments: [
      { 
        id: 'c3', text: '考試超難... 建議要有心理準備。', author: '電機三', courseName: '電子學', date: '2024-05-10',
        metrics: { score: 2, sweety: 1, coolness: 1, knowledge: 4 }
      },
    ]
  },
  {
    id: '3',
    name: '張志強',
    department: '心理學系',
    courses: ['心理學導論', '社會心理學', '認知心理學'],
    relatedProfessors: ['4', '5'],
    searchCount: 120,
    avgMetrics: { score: 4.8, sweety: 4.2, coolness: 4.9, knowledge: 4.0 },
    beatenCount: 5,
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=300&auto=format&fit=crop',
    photoHitUrl: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?q=80&w=400&h=300&auto=format&fit=crop',
    comments: [
      { 
        id: 'c5', text: '幽默風趣，課堂氣氛很好。', author: '心理一', courseName: '心理學導論', date: '2024-02-14',
        metrics: { score: 5, sweety: 4, coolness: 5, knowledge: 4 }
      },
    ]
  },
  {
    id: '4',
    name: '林美雲',
    department: '外國語文學系',
    courses: ['英語讀寫', '語言學概論', '英美文學'],
    relatedProfessors: ['3', '5'],
    searchCount: 180,
    avgMetrics: { score: 4.0, sweety: 4.5, coolness: 4.0, knowledge: 4.5 },
    beatenCount: 18,
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&h=300&auto=format&fit=crop',
    photoHitUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&h=300&auto=format&fit=crop',
    comments: [
      { 
        id: 'c6', text: '老師發音很美，上課很充實。', author: '外文四', courseName: '英美文學', date: '2024-04-20',
        metrics: { score: 4, sweety: 5, coolness: 4, knowledge: 5 }
      },
    ]
  },
  {
    id: '5',
    name: '周杰',
    department: '音樂學系',
    courses: ['樂理', '古典音樂史', '鋼琴演奏'],
    relatedProfessors: ['1', '4'],
    searchCount: 90,
    avgMetrics: { score: 3.5, sweety: 3.0, coolness: 3.0, knowledge: 4.5 },
    beatenCount: 42,
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&h=300&auto=format&fit=crop',
    photoHitUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=400&h=300&auto=format&fit=crop',
    comments: []
  }
];

type ViewState = 'search' | 'detail' | 'stress';

export default function App() {
  const [view, setView] = useState<ViewState>('search');
  const [professors, setProfessors] = useState<Professor[]>(INITIAL_PROFESSORS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  
  const [isHit, setIsHit] = useState(false);
  const [hitEffects, setHitEffects] = useState<{ id: number; x: number; y: number }[]>([]);

  const selectedProfessor = useMemo(() => 
    professors.find(p => p.id === selectedId), [professors, selectedId]);

  const topSearched = useMemo(() => 
    [...professors].sort((a, b) => b.searchCount - a.searchCount).slice(0, 4), 
  [professors]);

  const filteredProfessors = useMemo(() => 
    professors.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.department.toLowerCase().includes(searchTerm.toLowerCase())
    ), [professors, searchTerm]);

  const handleSelectProfessor = (id: string) => {
    setSelectedId(id);
    setProfessors(prev => prev.map(p => p.id === id ? { ...p, searchCount: p.searchCount + 1 } : p));
    setView('detail');
    setSearchTerm('');
  };

  const handleRate = (id: string, metrics: Metrics, commentText: string, courseName: string) => {
    setProfessors(prev => prev.map(p => {
      if (p.id === id) {
        const newComments: Comment[] = [
          ...p.comments,
          { 
            id: Math.random().toString(36).substr(2, 9), 
            text: commentText, 
            author: '熱心同學', 
            courseName,
            date: new Date().toISOString().split('T')[0],
            metrics
          }
        ];
        const count = newComments.length;
        const newAvg = {
          score: Number((newComments.reduce((sum, c) => sum + c.metrics.score, 0) / count).toFixed(1)),
          sweety: Number((newComments.reduce((sum, c) => sum + c.metrics.sweety, 0) / count).toFixed(1)),
          coolness: Number((newComments.reduce((sum, c) => sum + c.metrics.coolness, 0) / count).toFixed(1)),
          knowledge: Number((newComments.reduce((sum, c) => sum + c.metrics.knowledge, 0) / count).toFixed(1)),
        };
        return { ...p, comments: newComments, avgMetrics: newAvg };
      }
      return p;
    }));
    setIsRatingModalOpen(false);
  };

  const handleThrowPie = (e: React.MouseEvent) => {
    if (!selectedId) return;
    setIsHit(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setHitEffects(prev => [...prev, { id: Date.now(), x, y }]);
    setProfessors(prev => prev.map(p => 
      p.id === selectedId ? { ...p, beatenCount: p.beatenCount + 1 } : p
    ));
    
    setTimeout(() => setIsHit(false), 200);
    setTimeout(() => {
      setHitEffects(prev => prev.filter(p => Date.now() - p.id < 1000));
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-babyblue">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setView('search')}
          >
            <div className="bg-babyblue p-2 rounded-xl text-white shadow-sm transition-transform group-hover:scale-110">
              <User size={22} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Prof Pro</h1>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {view === 'search' ? '探索課程' : view === 'detail' ? '評價詳情' : '教授菜菜撈撈'}
             </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        <AnimatePresence mode="wait">
          {view === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-12 md:space-y-20"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight">
                  尋找你的 <span className="text-blue-400">理想導師</span>
                </h2>
                <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto leading-relaxed">
                  匿名分享真實上課體驗，為下一位同學點亮前行的明燈。
                </p>
              </div>

              <div className="max-w-2xl mx-auto space-y-8">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Search size={22} className="text-slate-300 group-focus-within:text-babyblue transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="教授姓名或開課系所..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-200 h-16 pl-14 pr-6 text-lg rounded-2xl focus:outline-none focus:ring-4 focus:ring-babyblue/20 focus:border-babyblue transition-all shadow-sm"
                  />
                  
                  {/* Results Dropdown */}
                  {searchTerm && (
                    <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-2xl z-50 shadow-xl max-h-[400px] overflow-hidden">
                      {filteredProfessors.length > 0 ? filteredProfessors.map(p => (
                        <div 
                          key={p.id} 
                          onClick={() => handleSelectProfessor(p.id)}
                          className="p-5 hover:bg-babyblue-light cursor-pointer border-b border-slate-50 flex justify-between items-center group/item transition-colors"
                        >
                          <div>
                            <p className="font-semibold text-slate-900">{p.name}</p>
                            <p className="text-xs font-medium text-slate-400">{p.department}</p>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold">
                            <Star size={14} fill="currentColor" />
                            <span>{p.avgMetrics.score}</span>
                          </div>
                        </div>
                      )) : (
                        <div className="p-10 text-center text-slate-400 font-medium">查無相關資訊...</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">熱搜榜單</span>
                  <div className="flex flex-wrap justify-center gap-3">
                    {topSearched.map((prof, idx) => (
                      <motion.button
                        key={prof.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => handleSelectProfessor(prof.id)}
                        className="bg-white border border-slate-100 px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-babyblue-light hover:text-blue-600 hover:border-babyblue transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <Zap size={14} className="text-babyblue" /> {prof.name}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'detail' && selectedProfessor && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <div className="lg:col-span-8 space-y-10">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <button 
                    onClick={() => setView('search')}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-200 transition-all shadow-sm"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                       <span className="px-3 py-1 bg-babyblue-light text-blue-600 rounded-lg text-sm font-bold tracking-wide uppercase shadow-sm">
                        {selectedProfessor.department}
                       </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-4">
                      <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">{selectedProfessor.name}</h2>
                      <div className="flex flex-wrap items-center gap-3">
                        {selectedProfessor.courses.map((course, idx) => {
                          const courseComments = selectedProfessor.comments.filter(c => c.courseName === course).length;
                          return (
                            <span key={idx} className="px-2.5 py-1.5 bg-white border border-slate-100 text-slate-500 rounded-xl text-[10px] font-bold flex items-center gap-2 shadow-sm">
                              {course}
                              <span className="bg-babyblue text-slate-900 px-2 py-0.5 rounded-lg text-[9px] min-w-[20px] text-center">
                                {courseComments}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                   <MetricCard icon={<Star size={18}/>} label="總分" value={selectedProfessor.avgMetrics.score} color="bg-amber-100 text-amber-600" />
                   <MetricCard icon={<Zap size={18}/>} label="甜度" value={selectedProfessor.avgMetrics.sweety} color="bg-rose-100 text-rose-600" />
                   <MetricCard icon={<Coffee size={18}/>} label="涼度" value={selectedProfessor.avgMetrics.coolness} color="bg-sky-100 text-sky-600" />
                   <MetricCard icon={<BookOpen size={18}/>} label="知識" value={selectedProfessor.avgMetrics.knowledge} color="bg-emerald-100 text-emerald-600" />
                </div>

                <div className="bg-white border border-slate-100 rounded-[2rem] p-8 md:p-10 shadow-sm space-y-10">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-50">
                    <div>
                      <h4 className="text-2xl font-bold text-slate-900">同學留言</h4>
                      <p className="text-slate-400 text-sm font-medium">共有 {selectedProfessor.comments.length} 則真實分享</p>
                    </div>
                    <button 
                      onClick={() => setIsRatingModalOpen(true)}
                      className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm tracking-wide hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                    >
                      分享我的體驗
                    </button>
                  </div>

                  <div className="space-y-6">
                    {selectedProfessor.comments.length === 0 ? (
                      <div className="py-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                          <MessageSquare size={32} />
                        </div>
                        <p className="text-slate-300 font-medium">目前尚無評價，勇敢做第一個分享的人吧！</p>
                      </div>
                    ) : (
                      selectedProfessor.comments.map(c => (
                        <div key={c.id} className="group p-6 rounded-2xl border border-slate-50 hover:bg-slate-50/50 transition-all">
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-slate-400 bg-white border border-slate-100 px-2.5 py-1 rounded-lg">{c.author}</span>
                              <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-lg">{c.courseName}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-300 tracking-wider font-mono">{c.date}</span>
                          </div>
                          <p className="text-slate-700 font-medium leading-relaxed mb-6">「{c.text}」</p>
                          <div className="flex gap-3 overflow-x-auto pb-2">
                             <Tag label="給分" value={c.metrics.score} />
                             <Tag label="甜度" value={c.metrics.sweety} />
                             <Tag label="涼度" value={c.metrics.coolness} />
                             <Tag label="知識" value={c.metrics.knowledge} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit space-y-6">
                <div className="bg-babyblue text-slate-900 rounded-[2rem] p-8 shadow-md border border-white/50 space-y-6 relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                  
                  <div className="space-y-2 relative">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm mb-4">
                      <Target size={24} />
                    </div>
                    <h4 className="text-xl font-bold tracking-tight">教授菜菜撈撈</h4>
                    <p className="text-sm font-bold text-slate-900 leading-relaxed">
                      教授!!!!，作業要交不完拉，我要扁你!!!
                    </p>
                  </div>

                  <button 
                    onClick={() => setView('stress')}
                    className="w-full bg-slate-900 text-white rounded-xl py-4 font-bold text-sm tracking-wide hover:shadow-lg transition-all active:scale-[0.98] relative"
                  >
                    開扁 ➔
                  </button>

                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500 pt-4 border-t border-slate-900/5">
                    <span>憤怒指數</span>
                    <span className="text-xl font-bold text-slate-900">{selectedProfessor.beatenCount}</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-[2rem] p-8 space-y-6 shadow-sm">
                  <h5 className="font-bold text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Search size={14} className="text-babyblue" /> 你可能好奇的教授
                  </h5>
                  <div className="space-y-3">
                    {selectedProfessor.relatedProfessors.map(relId => {
                      const relProf = professors.find(p => p.id === relId);
                      if (!relProf) return null;
                      return (
                        <div 
                          key={relId} 
                          onClick={() => handleSelectProfessor(relId)}
                          className="p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 cursor-pointer transition-all flex items-center gap-4 group"
                        >
                          <img src={relProf.photoUrl} alt={relProf.name} className="w-10 h-10 rounded-xl object-cover border border-slate-100 ring-4 ring-white" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 group-hover:text-blue-500 transition-colors truncate">{relProf.name}</p>
                            <p className="text-[10px] font-medium text-slate-400 truncate">{relProf.department}</p>
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-babyblue-light group-hover:text-blue-500 group-hover:border-babyblue transition-all">
                             <ArrowRight size={14} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[9px] font-medium text-slate-300 text-center italic">
                    * 根據曾搜尋此教授的同學紀錄推薦
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'stress' && selectedProfessor && (
            <motion.div
              key="stress"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-3xl mx-auto space-y-10"
            >
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                <button 
                  onClick={() => setView('detail')}
                  className="flex items-center gap-2 font-bold text-xs text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
                >
                  <ArrowLeft size={16} /> 返回課程詳情
                </button>
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-bold text-slate-900">教授菜菜撈撈</h2>
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Target: {selectedProfessor.name}</p>
                </div>
                <div className="w-20 hidden sm:block" />
              </div>

              <div className="bg-white rounded-[3rem] border border-slate-100 p-4 md:p-8 shadow-2xl overflow-hidden cursor-crosshair">
                <div 
                  className="w-full aspect-[16/10] bg-slate-50 rounded-[2rem] flex items-center justify-center relative select-none overflow-hidden"
                  onClick={handleThrowPie}
                >
                  <img 
                    src={isHit ? selectedProfessor.photoHitUrl : selectedProfessor.photoUrl}
                    alt="Professor"
                    className={`w-full h-full object-cover transition-all duration-300 ${isHit ? 'scale-105 saturate-150' : 'scale-100'}`}
                  />
                  
                  {isHit && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 2 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                    >
                      <span className="text-9xl filter drop-shadow-xl select-none">🥧</span>
                    </motion.div>
                  )}
                  
                  {hitEffects.map(effect => (
                    <motion.div
                      key={effect.id}
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      className="absolute pointer-events-none z-20 text-4xl"
                      style={{ left: effect.x - 20, top: effect.y - 20 }}
                    >
                      ✨
                    </motion.div>
                  ))}
                </div>

                <div className="p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="text-center md:text-left space-y-1">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">憤怒指數</p>
                    <motion.h3 
                      key={selectedProfessor.beatenCount}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className={`font-bold tracking-tighter ${
                        selectedProfessor.beatenCount < 100 
                          ? 'text-emerald-500 text-3xl' // 1/2 of 6xl/7xl approximately
                          : selectedProfessor.beatenCount < 1000
                            ? 'text-amber-500 text-5xl' // Roughly 3/4 size
                            : 'text-rose-600 text-7xl'  // Red stays at full size
                      }`}
                    >
                      {selectedProfessor.beatenCount.toLocaleString()}
                    </motion.h3>
                  </div>
                  <div className="text-center md:text-right space-y-4">
                    <p className="text-xs font-bold text-rose-500 px-4 py-2 bg-rose-50 rounded-full inline-block">點擊照片 用力扁下去</p>
                    <button 
                       onClick={() => setView('detail')}
                       className="bg-slate-900 text-white rounded-xl px-10 py-4 font-bold text-sm tracking-wide hover:shadow-lg transition-all"
                    >
                      回去乖乖念書
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Rating Modal */}
      <AnimatePresence>
        {isRatingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm"
              onClick={() => setIsRatingModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2.5rem] border border-slate-100 w-full max-w-xl p-8 md:p-12 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold text-slate-900">新增課程評價</h3>
                  <p className="text-slate-400 font-medium">你的真實心聲，對同學很有參考價值。</p>
                </div>
                <button onClick={() => setIsRatingModalOpen(false)} className="text-slate-300 hover:text-slate-900 transition-colors text-2xl">×</button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const metrics: Metrics = {
                  score: Number(formData.get('score')),
                  sweety: Number(formData.get('sweety')),
                  coolness: Number(formData.get('coolness')),
                  knowledge: Number(formData.get('knowledge')),
                };
                handleRate(selectedId!, metrics, formData.get('comment') as string, formData.get('courseName') as string);
              }} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">修習課程</label>
                    <select 
                      name="courseName" 
                      required 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:border-babyblue outline-none transition-all"
                    >
                      <option value="">請選擇課程</option>
                      {selectedProfessor?.courses.map(course => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                  </div>
                  <RatingControl name="score" label="推薦得分" />
                  <RatingControl name="sweety" label="課程甜度" />
                  <RatingControl name="coolness" label="修課涼度" />
                  <RatingControl name="knowledge" label="知識內容" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">詳細心得 / 修課指南</label>
                  <textarea 
                    name="comment"
                    rows={4}
                    required
                    className="w-full bg-slate-50 rounded-2xl p-5 text-slate-700 font-medium border border-transparent focus:bg-white focus:border-babyblue focus:ring-4 focus:ring-babyblue/10 focus:outline-none transition-all placeholder:text-slate-300"
                    placeholder="例如：考試題型、點名規則、適合什麼樣的同學..."
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button 
                  type="button"
                  onClick={() => setIsRatingModalOpen(false)}
                  className="flex-1 py-4 font-bold text-sm text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    再想想
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] bg-slate-900 text-white py-4 rounded-xl font-bold text-sm tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95"
                  >
                    提交評價 ➔
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="py-20 bg-white border-t border-slate-100 flex items-center justify-center">
        <div className="max-w-5xl mx-auto px-6 w-full flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-lg font-bold text-slate-900">Prof Pro</h4>
            <p className="text-xs font-medium text-slate-300 max-w-sm leading-relaxed">
              本平台旨在促進校園透明資訊交流與情緒舒緩。使用者應對其言論負責，維護健康網路環境。
            </p>
          </div>
          <div className="flex gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-babyblue" />
            <div className="w-1.5 h-1.5 rounded-full bg-rose-200" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-200" />
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- Sub-components ---

function MetricCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col items-center gap-3 group hover:scale-[1.02] transition-all">
      <div className={`${color} p-2 rounded-xl`}>
        {icon}
      </div>
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
        <p className="text-xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function MetricProgressBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-bold text-slate-900">{value} <span className="text-slate-300 font-medium">/ 5</span></span>
      </div>
      <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden p-0.5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(value / 5) * 100}%` }}
          className={`h-full rounded-full ${color} shadow-sm`} 
        />
      </div>
    </div>
  );
}

function Tag({ label, value }: { label: string; value: number }) {
  return (
    <div className="whitespace-nowrap px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500 shadow-sm">
      {label} <span className="text-blue-400 ml-1">{value}</span>
    </div>
  );
}

function RatingControl({ name, label }: { name: string; label: string }) {
  const [selected, setSelected] = useState(3);
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
        {label}
      </label>
      <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl">
        {[1, 2, 3, 4, 5].map(v => (
          <label key={v} className="flex-1 cursor-pointer">
            <input 
              type="radio" 
              name={name} 
              value={v} 
              className="sr-only peer" 
              required 
              checked={selected === v}
              onChange={() => setSelected(v)}
            />
            <div className={`h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${selected === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:text-slate-400'}`}>
              {v}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
