import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 
import { 
  Search, 
  Star, 
  MessageSquare, 
  Plus, 
  ArrowLeft,
  ArrowRight,
  User, 
  Target, 
  Zap, 
  Coffee, 
  BookOpen, 
  Heart,
  Flower,
} from 'lucide-react';
import { api, Professor, Comment } from './api';

// --- Types ---
interface Metrics {
  score: number;      
  sweety: number;     
  coolness: number;   
  knowledge: number;  
}

type ViewState = 'search' | 'gallery' | 'detail' | 'stress' | 'thanks';
type ScoreLevel = 'all' | 'high' | 'mid' | 'low';

export default function App() {
  const [view, setView] = useState<ViewState>('search');
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [galleryDepartment, setGalleryDepartment] = useState('all');
  const [gallerySurname, setGallerySurname] = useState('');
  const [galleryScoreLevel, setGalleryScoreLevel] = useState<ScoreLevel>('all');
  const [gallerySort, setGallerySort] = useState<'name' | 'score' | 'search'>('name');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isAddProfessorModalOpen, setIsAddProfessorModalOpen] = useState(false);
  const [isEditProfessorModalOpen, setIsEditProfessorModalOpen] = useState(false);
  
  const [isHit, setIsHit] = useState(false);
  const [hitEffects, setHitEffects] = useState<{ id: number; x: number; y: number; shape?: 'heart' | 'flower' }[]>([]);

  useEffect(() => {
    api.getProfessors().then(data => {
      setProfessors(data || []);
    });
  }, []);

  const selectedProfessor = useMemo(() => 
    professors.find(p => p.id === selectedId), [professors, selectedId]);

  const topSearched = useMemo(() => 
    [...(professors || [])].sort((a, b) => b.searchCount - a.searchCount).slice(0, 4), 
  [professors]);

  const filteredProfessors = useMemo(() => 
    (professors || []).filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.department.toLowerCase().includes(searchTerm.toLowerCase())
    ), [professors, searchTerm]);

  const galleryDepartments = useMemo(
    () => ['all', ...Array.from(new Set((professors || []).map(p => p.department)))],
    [professors]
  );

  const similarProfessors = useMemo(() => {
    if (!selectedProfessor) return [];
    return professors
      .filter(p => p.id !== selectedProfessor.id)
      .map(p => {
        const commonCourses = p.courses.filter(course => selectedProfessor.courses.includes(course));
        return { professor: p, commonCoursesCount: commonCourses.length, commonCourses };
      })
      .filter(x => x.commonCoursesCount > 0)
      .sort((a, b) => {
        if (b.commonCoursesCount !== a.commonCoursesCount) return b.commonCoursesCount - a.commonCoursesCount;
        return b.professor.searchCount - a.professor.searchCount;
      })
      .slice(0, 3)
      .map(x => x.professor);
  }, [professors, selectedProfessor]);

  const galleryProfessors = useMemo(() => {
    return (professors || [])
      .filter(p => {
        if (galleryDepartment !== 'all' && p.department !== galleryDepartment) return false;
        if (gallerySurname && !p.name.startsWith(gallerySurname)) return false;
        if (galleryScoreLevel === 'high' && p.avgMetrics.score < 4) return false;
        if (galleryScoreLevel === 'mid' && (p.avgMetrics.score < 3 || p.avgMetrics.score >= 4)) return false;
        if (galleryScoreLevel === 'low' && p.avgMetrics.score >= 3) return false;
        return true;
      })
      .sort((a, b) => {
        if (gallerySort === 'name') return a.name.localeCompare(b.name, 'zh-Hant');
        if (gallerySort === 'score') return b.avgMetrics.score - a.avgMetrics.score;
        return b.searchCount - a.searchCount;
      });
  }, [professors, galleryDepartment, gallerySurname, galleryScoreLevel, gallerySort]);

  const handleSelectProfessor = async (id: string) => {
    setSelectedId(id);
    await api.incrementSearch(id);
    const updatedProfessors = await api.getProfessors();
    setProfessors(updatedProfessors || []);
    setView('detail');
    setSearchTerm('');
  };

  const handleRate = async (id: string, metrics: Metrics, commentText: string, courseName: string) => {
    const newComment = {
      text: commentText,
      author: '熱心同學',
      courseName,
      date: new Date().toISOString().split('T')[0],
      metrics
    };
    await api.addComment(id, newComment);
    const updatedProfessors = await api.getProfessors();
    setProfessors(updatedProfessors || []);
    setIsRatingModalOpen(false);
  };

  const handleAddProfessor = async (name: string, department: string, courses: string[], photoUrl?: string) => {
    const newProfessor = {
      name,
      department,
      courses,
      relatedProfessors: [], 
      searchCount: 0,
      avgMetrics: { score: 0, sweety: 0, coolness: 0, knowledge: 0 },
      comments: [],
      beatenCount: 0,
      heartCount: 0,
      flowerCount: 0,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=300&auto=format&fit=crop',
      photoHitUrl: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?q=80&w=400&h=300&auto=format&fit=crop'
    };
    const addedProfessor = await api.addProfessor(newProfessor);
    setProfessors(prev => [...prev, addedProfessor]);
    setIsAddProfessorModalOpen(false);
  };

  const handleEditProfessor = async (id: string, name: string, department: string, courses: string[], photoUrl?: string) => {
    const updates = {
      name,
      department,
      courses,
      photoUrl: photoUrl || undefined,
    };
    const updatedProfessor = await api.updateProfessor(id, updates);
    setProfessors(prev => prev.map(p => p.id === id ? updatedProfessor : p));
    setIsEditProfessorModalOpen(false);
  };

  const handleGiveHeart = async (id: string) => {
    const result = await api.giveHeart(id);
    setProfessors(prev => prev.map(p => p.id === id ? { ...p, heartCount: result.heartCount } : p));
  };

  const handleGiveFlower = async (id: string) => {
    const result = await api.giveFlower(id);
    setProfessors(prev => prev.map(p => p.id === id ? { ...p, flowerCount: result.flowerCount } : p));
  };

  const handleAffectPhoto = async (e: React.MouseEvent, id: string) => {
    if (!selectedId) return;
    setIsHit(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const action = Math.random() < 0.5 ? 'heart' : 'flower';
    setHitEffects(prev => [...prev, { id: Date.now(), x, y, shape: action }]);
    if (action === 'heart') {
      await handleGiveHeart(id);
    } else {
      await handleGiveFlower(id);
    }

    setTimeout(() => setIsHit(false), 200);
    setTimeout(() => {
      setHitEffects(prev => prev.filter(p => Date.now() - p.id < 1000));
    }, 1000);
  };

  const handleThrowPie = async (e: React.MouseEvent) => {
    if (!selectedId) return;
    setIsHit(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setHitEffects(prev => [...prev, { id: Date.now(), x, y }]);
    await api.incrementBeaten(selectedId);
    
    setProfessors(prev => prev.map(p => p.id === selectedId ? {...p, beatenCount: p.beatenCount + 1} : p));

    setTimeout(() => setIsHit(false), 200);
    setTimeout(() => {
      setHitEffects(prev => prev.filter(p => Date.now() - p.id < 1000));
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setView('search')}
          >
            <div className="bg-blue-500 p-2 rounded-xl text-white shadow-sm transition-transform group-hover:scale-110">
              <User size={22} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">叫獸情報局</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setView('search')}
                className={`px-3 py-2 rounded-full text-xs font-semibold transition ${view === 'search' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >探索</button>
              <button
                onClick={() => setView('gallery')}
                className={`px-3 py-2 rounded-full text-xs font-semibold transition ${view === 'gallery' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >資料庫</button>
            </div>
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
                  教授的 <span className="text-blue-500">真實檔案</span>
                </h2>
                <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto leading-relaxed">
                  蒐集最狂授課傳說，讓你在校園裡先知先覺。
                </p>
              </div>

              <div className="max-w-2xl mx-auto space-y-8">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Search size={22} className="text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="教授姓名或開課系所..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-200 h-16 pl-14 pr-6 text-lg rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                  />
                  
                  {searchTerm && (
                    <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-2xl z-50 shadow-xl max-h-[400px] overflow-auto">
                      {filteredProfessors.length > 0 ? filteredProfessors.map(p => (
                        <div 
                          key={p.id} 
                          onClick={() => handleSelectProfessor(p.id)}
                          className="p-5 hover:bg-blue-50 cursor-pointer border-b border-slate-50 flex justify-between items-center group/item transition-colors"
                        >
                          <div>
                            <p className="font-semibold text-slate-900">{p.name}</p>
                            <p className="text-xs font-medium text-slate-400">{p.department}</p>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold">
                            <Star size={14} fill="currentColor" />
                            <span>{p.avgMetrics.score.toFixed(1)}</span>
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
                    {topSearched?.slice(0, 4).map((prof, idx) => (
                      <motion.button
                        key={prof.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => handleSelectProfessor(prof.id)}
                        className="bg-white border border-slate-100 px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <Zap size={14} className="text-blue-400" /> {prof.name}
                      </motion.button>
                    ))}
                  </div>
                  <div className="pt-4">
                    <button 
                      onClick={() => setIsAddProfessorModalOpen(true)}
                      className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm tracking-wide hover:bg-slate-800 transition-all shadow-lg active:scale-95 flex items-center gap-2 mx-auto"
                    >
                      <Plus size={16} /> 新增教授檔案
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-10"
            >
              <div className="grid gap-4 md:grid-cols-[1fr_260px] items-start">
                <div className="space-y-5">
                  <div>
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">教授與牠們的產地</h2>
                    <p className="text-slate-500 font-medium text-lg max-w-2xl leading-relaxed mt-3">
                      以系所、姓氏與分數等級篩選資料庫。
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <select
                      value={galleryDepartment}
                      onChange={(e) => setGalleryDepartment(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-sm font-semibold focus:outline-none focus:border-blue-500 transition-all"
                    >
                      {galleryDepartments.map(department => (
                        <option key={department} value={department}>
                          {department === 'all' ? '所有系所' : department}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={gallerySurname}
                      onChange={(e) => setGallerySurname(e.target.value)}
                      placeholder="姓氏搜尋"
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-sm font-semibold focus:outline-none focus:border-blue-500 transition-all"
                    />
                    <select
                      value={galleryScoreLevel}
                      onChange={(e) => setGalleryScoreLevel(e.target.value as ScoreLevel)}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-sm font-semibold focus:outline-none focus:border-blue-500 transition-all"
                    >
                      <option value="all">所有分數</option>
                      <option value="high">高分 ≥ 4</option>
                      <option value="mid">中等 3–4</option>
                      <option value="low">低分 {'<'} 3</option>
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setGallerySort('name')}
                      className={`flex-1 py-3 rounded-2xl font-semibold text-sm transition ${gallerySort === 'name' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >姓名</button>
                    <button
                      onClick={() => setGallerySort('score')}
                      className={`flex-1 py-3 rounded-2xl font-semibold text-sm transition ${gallerySort === 'score' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >評分</button>
                    <button
                      onClick={() => setGallerySort('search')}
                      className={`flex-1 py-3 rounded-2xl font-semibold text-sm transition ${gallerySort === 'search' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >人氣</button>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm hidden md:block">
                  <div className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400 mb-4">資料庫說明</div>
                  <div className="space-y-3 text-xs text-slate-500 leading-loose">
                    <p>● 姓名篩選依照「姓氏開頭」。</p>
                    <p>● 分數等級助你快速避雷。</p>
                    <p>● 點選卡片查看詳細分析。</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {galleryProfessors.map((prof) => (
                  <motion.div
                    key={prof.id}
                    whileHover={{ y: -4 }}
                    className="group rounded-[2rem] border border-slate-100 bg-white shadow-sm overflow-hidden transition-all"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img src={prof.photoUrl} alt={prof.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex flex-col justify-end p-6">
                        <p className="text-[10px] uppercase tracking-widest text-white/70 font-bold">{prof.department}</p>
                        <h3 className="text-xl font-bold text-white">{prof.name}</h3>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Star size={12} fill="currentColor" /> {prof.avgMetrics.score.toFixed(1)}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{prof.comments?.length || 0} 則評價</span>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-1">課程：{prof.courses?.join('、') || '暫無資訊'}</p>
                      <button
                        onClick={() => handleSelectProfessor(prof.id)}
                        className="w-full bg-slate-100 text-slate-900 rounded-xl py-3 text-sm font-bold hover:bg-blue-500 hover:text-white transition-all"
                      >查看檔案</button>
                    </div>
                  </motion.div>
                ))}
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
              <div className="lg:col-span-8 space-y-8">
                <div className="flex items-center gap-4">
                  <button onClick={() => setView('gallery')} className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                    <ArrowLeft size={20} />
                  </button>
                  <div>
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{selectedProfessor.department}</span>
                    <h2 className="text-4xl font-bold text-slate-900">{selectedProfessor.name}</h2>
                  </div>
                </div>

                <div className="overflow-hidden rounded-[2rem] border border-slate-100 shadow-sm">
                  <img src={selectedProfessor.photoUrl} alt={selectedProfessor.name} className="w-full h-[420px] object-cover" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                   <MetricCard icon={<Star size={18}/>} label="總分" value={selectedProfessor.avgMetrics.score.toFixed(1)} color="bg-amber-100 text-amber-600" />
                   <MetricCard icon={<Zap size={18}/>} label="甜度" value={selectedProfessor.avgMetrics.sweety.toFixed(1)} color="bg-rose-100 text-rose-600" />
                   <MetricCard icon={<Coffee size={18}/>} label="涼度" value={selectedProfessor.avgMetrics.coolness.toFixed(1)} color="bg-sky-100 text-sky-600" />
                   <MetricCard icon={<BookOpen size={18}/>} label="知識" value={selectedProfessor.avgMetrics.knowledge.toFixed(1)} color="bg-emerald-100 text-emerald-600" />
                </div>

                <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm space-y-8">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-50 pb-6">
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">同學評價</h4>
                      <p className="text-sm text-slate-500 mt-1">也可以送愛心或送花給喜歡的老師。</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <span className="inline-flex items-center gap-2 bg-slate-100 text-slate-500 px-4 py-3 rounded-2xl font-bold text-sm">
                        <Heart size={16} className="text-rose-500" /> {selectedProfessor.heartCount}
                      </span>
                      <span className="inline-flex items-center gap-2 bg-slate-100 text-slate-500 px-4 py-3 rounded-2xl font-bold text-sm">
                        <Flower size={16} className="text-emerald-500" /> {selectedProfessor.flowerCount}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {(selectedProfessor.comments?.length === 0) ? (
                      <p className="text-center py-10 text-slate-400 font-medium italic">目前尚無評價，勇敢做第一個分享的人吧！</p>
                    ) : (
                      selectedProfessor.comments?.map(c => (
                        <div key={c.id} className="p-6 rounded-2xl border border-slate-50 hover:bg-slate-50/50 transition-all">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-lg">{c.courseName}</span>
                            <span className="text-[10px] font-bold text-slate-300 font-mono">{c.date}</span>
                          </div>
                          <p className="text-slate-700 font-medium mb-4">「{c.text}」</p>
                          <div className="flex gap-2">
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

                {similarProfessors.length > 0 && (
                  <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold text-slate-900">推薦類似課程教授</h4>
                      <span className="text-xs uppercase tracking-[0.24em] text-slate-400">根據共同課程</span>
                    </div>
                    <div className="space-y-4">
                      {similarProfessors.map(prof => (
                        <button
                          key={prof.id}
                          onClick={() => handleSelectProfessor(prof.id)}
                          className="w-full text-left p-4 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-blue-50 transition-all"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-bold text-slate-900">{prof.name}</p>
                              <p className="text-xs text-slate-500">{prof.department}</p>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">查看</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="bg-blue-500 text-white rounded-[2rem] p-8 shadow-xl space-y-6 relative overflow-hidden group">
                  <div className="relative z-10 space-y-2">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-4">
                      <Target size={24} />
                    </div>
                    <h4 className="text-xl font-bold">教授菜菜撈撈</h4>
                    <p className="text-xs text-blue-100 leading-relaxed">
                      作業太重？考太難？來這裡宣洩你的不滿！
                    </p>
                  </div>
                  <button 
                    onClick={() => setView('stress')}
                    className="w-full bg-white text-blue-600 rounded-xl py-4 font-bold text-sm hover:shadow-lg transition-all active:scale-[0.98]"
                  >開扁 ➔</button>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest pt-4 border-t border-white/10">
                    <span>憤怒指數</span>
                    <span className="text-xl font-bold">{selectedProfessor.beatenCount}</span>
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-xl space-y-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-3xl flex items-center justify-center text-rose-500">
                        <Heart size={20} />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-900">感恩教授、讚嘆教授</h4>
                        <p className="text-sm text-slate-500">偶爾想送教授愛心也很正常吧？比如說被保送的時候......</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setView('thanks')}
                      className="w-full bg-rose-500 text-white rounded-xl py-4 font-bold text-sm hover:bg-rose-600 transition-all active:scale-[0.98]"
                    >送啦</button>
                  </div>
                </div>

                <button 
                  onClick={() => setIsEditProfessorModalOpen(true)}
                  className="w-full bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                >
                  <Plus size={16} /> 編輯此教授資訊
                </button>
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
              <div className="flex justify-between items-center">
                <button onClick={() => setView('detail')} className="flex items-center gap-2 font-bold text-xs text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">
                  <ArrowLeft size={16} /> 返回
                </button>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-slate-900">壓力釋放室</h2>
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Target: {selectedProfessor.name}</p>
                </div>
                <div className="w-12" />
              </div>

              <div className="bg-white rounded-[3rem] border border-slate-100 p-4 md:p-8 shadow-2xl overflow-hidden cursor-crosshair">
                <div 
                  className="w-full aspect-video bg-slate-50 rounded-[2rem] flex items-center justify-center relative select-none overflow-hidden"
                  onClick={handleThrowPie}
                >
                  <img 
                    src={isHit ? (selectedProfessor.photoHitUrl || selectedProfessor.photoUrl) : selectedProfessor.photoUrl}
                    alt="Professor"
                    className={`w-full h-full object-cover transition-all duration-100 ${isHit ? 'scale-105' : 'scale-100'}`}
                  />
                  {isHit && (
                    <motion.div initial={{ scale: 0.5 }} animate={{ scale: 2 }} className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                      <span className="text-9xl filter drop-shadow-xl">🥧</span>
                    </motion.div>
                  )}
                  {hitEffects.map(effect => (
                    <motion.div key={effect.id} initial={{ scale: 1, opacity: 1 }} animate={{ scale: 1.5, opacity: 0 }} className="absolute pointer-events-none z-20 text-4xl" style={{ left: effect.x - 20, top: effect.y - 20 }}>
                      💥
                    </motion.div>
                  ))}
                </div>
                <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">累積被扁次數</p>
                    <motion.h3 key={selectedProfessor.beatenCount} initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-5xl font-black text-rose-500 tabular-nums">
                      {selectedProfessor.beatenCount.toLocaleString()}
                    </motion.h3>
                  </div>
                  <button onClick={() => setView('detail')} className="bg-slate-900 text-white rounded-xl px-10 py-4 font-bold text-sm hover:shadow-lg transition-all">回去上課</button>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'thanks' && selectedProfessor && (
            <motion.div
              key="thanks"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-3xl mx-auto space-y-10"
            >
              <div className="flex justify-between items-center">
                <button onClick={() => setView('detail')} className="flex items-center gap-2 font-bold text-xs text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">
                  <ArrowLeft size={16} /> 返回
                </button>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-slate-900">感恩教授、讚嘆教授</h2>
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">偶爾想送教授愛心也很正常吧？比如說被保送的時候......</p>
                </div>
                <div className="w-12" />
              </div>

              <div className="bg-white rounded-[3rem] border border-slate-100 p-4 md:p-8 shadow-2xl overflow-hidden cursor-pointer">
                <div 
                  className="w-full aspect-video bg-slate-50 rounded-[2rem] flex items-center justify-center relative select-none overflow-hidden"
                  onClick={(e) => handleAffectPhoto(e, selectedProfessor.id)}
                >
                  <img 
                    src={selectedProfessor.photoUrl}
                    alt="Professor"
                    className={`w-full h-full object-cover transition-all duration-100 ${isHit ? 'scale-105' : 'scale-100'}`}
                  />
                  {isHit && (
                    <motion.div initial={{ scale: 0.5 }} animate={{ scale: 2 }} className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                      <span className="text-9xl filter drop-shadow-xl">{hitEffects[hitEffects.length - 1]?.shape === 'flower' ? '🌸' : '❤️'}</span>
                    </motion.div>
                  )}
                  {hitEffects.map(effect => (
                    <motion.div key={effect.id} initial={{ scale: 1, opacity: 1 }} animate={{ scale: 1.5, opacity: 0 }} className="absolute pointer-events-none z-20 text-4xl" style={{ left: effect.x - 20, top: effect.y - 20 }}>
                      {effect.shape === 'flower' ? '🌸' : '❤️'}
                    </motion.div>
                  ))}
                </div>
                <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="bg-rose-50 rounded-3xl p-6 text-center">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-rose-500">愛心</p>
                      <p className="text-4xl font-bold text-rose-600">{selectedProfessor.heartCount}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-3xl p-6 text-center">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-emerald-500">花束</p>
                      <p className="text-4xl font-bold text-emerald-600">{selectedProfessor.flowerCount}</p>
                    </div>
                  </div>
                  <button onClick={() => setView('detail')} className="bg-slate-900 text-white rounded-xl px-10 py-4 font-bold text-sm hover:shadow-lg transition-all">回去上課</button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isRatingModalOpen && (
          <Modal title="新增評價" onClose={() => setIsRatingModalOpen(false)}>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const metrics = {
                score: Number(formData.get('score')),
                sweety: Number(formData.get('sweety')),
                coolness: Number(formData.get('coolness')),
                knowledge: Number(formData.get('knowledge')),
              };
              handleRate(selectedId!, metrics, formData.get('comment') as string, formData.get('courseName') as string);
            }} className="space-y-6">
              <select name="courseName" required className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold">
                <option value="">請選擇課程</option>
                {selectedProfessor?.courses?.map(course => <option key={course} value={course}>{course}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <RatingControl name="score" label="推薦分" />
                <RatingControl name="sweety" label="甜度" />
                <RatingControl name="coolness" label="涼度" />
                <RatingControl name="knowledge" label="內容" />
              </div>
              <textarea name="comment" rows={3} required className="w-full bg-slate-50 rounded-xl p-4 text-sm border-none focus:ring-2 focus:ring-blue-500 outline-none" placeholder="寫下你的心得..." />
              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-sm">送出評價</button>
            </form>
          </Modal>
        )}
        
        {isAddProfessorModalOpen && (
          <Modal title="新增教授" onClose={() => setIsAddProfessorModalOpen(false)}>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddProfessor(
                formData.get('name') as string,
                formData.get('department') as string,
                (formData.get('courses') as string).split(',').map(s => s.trim()),
                formData.get('photoUrl') as string
              );
            }} className="space-y-4">
              <input name="name" placeholder="教授姓名" required className="w-full p-3 bg-slate-50 rounded-xl border-none" />
              <input name="department" placeholder="系所" required className="w-full p-3 bg-slate-50 rounded-xl border-none" />
              <input name="courses" placeholder="開課(逗號分隔)" required className="w-full p-3 bg-slate-50 rounded-xl border-none" />
              <input name="photoUrl" placeholder="照片 URL" className="w-full p-3 bg-slate-50 rounded-xl border-none" />
              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-sm">新增資料</button>
            </form>
          </Modal>
        )}

        {isEditProfessorModalOpen && selectedProfessor && (
          <Modal title="編輯資料" onClose={() => setIsEditProfessorModalOpen(false)}>
             <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleEditProfessor(
                selectedProfessor?.id ?? '',
                formData.get('name') as string,
                formData.get('department') as string,
                (formData.get('courses') as string).split(',').map(s => s.trim()),
                formData.get('photoUrl') as string
              );
            }} className="space-y-4">
              <input name="name" defaultValue={selectedProfessor?.name ?? ''} placeholder="姓名" required className="w-full p-3 bg-slate-50 rounded-xl border-none" />
              <input name="department" defaultValue={selectedProfessor?.department ?? ''} placeholder="系所" required className="w-full p-3 bg-slate-50 rounded-xl border-none" />
              <input name="courses" defaultValue={selectedProfessor?.courses?.join(', ') ?? ''} placeholder="開課" required className="w-full p-3 bg-slate-50 rounded-xl border-none" />
              <input name="photoUrl" defaultValue={selectedProfessor?.photoUrl ?? ''} placeholder="照片 URL" className="w-full p-3 bg-slate-50 rounded-xl border-none" />
              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-sm">儲存更新</button>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-components ---

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-900 text-2xl">×</button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

function MetricCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2">
      <div className={`${color} p-2 rounded-xl`}>{icon}</div>
      <div className="text-center">
        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <p className="text-lg font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function Tag({ label, value }: { label: string; value: number }) {
  return (
    <span className="px-2 py-1 bg-white border border-slate-100 rounded-lg text-[9px] font-bold text-slate-500">
      {label} <span className="text-blue-500 ml-1">{value}</span>
    </span>
  );
}

function RatingControl({ name, label }: { name: string; label: string }) {
  const [val, setVal] = useState(3);
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 uppercase">{label}</label>
      <div className="flex gap-1 bg-slate-50 p-1 rounded-lg">
        {[1, 2, 3, 4, 5].map(v => (
          <button key={v} type="button" onClick={() => setVal(v)} className={`flex-1 py-1 rounded text-xs font-bold transition ${val === v ? 'bg-white shadow-sm text-blue-500' : 'text-slate-300'}`}>
            {v}
            <input type="radio" name={name} value={v} checked={val === v} className="hidden" readOnly />
          </button>
        ))}
      </div>
    </div>
  );
}

