import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  GraduationCap, BookOpen, Calculator, Brain, 
  Plus, ChevronRight, ChevronDown, Bookmark, 
  CheckCircle2, Circle, Target, Flame, FileText,
  Upload, Trash2, Edit3, X, Play, Pause, Book
} from 'lucide-react';
import { apiFetch } from '../lib/apiFetch';

interface Subcategory {
  id: number;
  category_id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
  subcategories: Subcategory[];
}

interface Content {
  id: number;
  subcategory_id: number;
  title: string;
  description: string;
  created_at: string;
  is_bookmarked: number;
  revise_later: number;
}

interface Goal {
  id: number;
  description: string;
  is_completed: number;
  date: string;
}

interface PdfBook {
  id: number;
  title: string;
  category: string;
  file_path: string;
  total_pages: number;
  current_page: number;
  target_date: string | null;
  pages_per_day: number;
  created_at: string;
}

interface PdfNote {
  id: number;
  pdf_id: number;
  page_number: number;
  content: string;
  created_at: string;
}

export default function Learning() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'notes' | 'pdfs'>('notes');
  
  // Notes State
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<number | null>(null);
  const [content, setContent] = useState<Content[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  
  // PDF State
  const [pdfs, setPdfs] = useState<PdfBook[]>([]);
  const [activePdf, setActivePdf] = useState<PdfBook | null>(null);
  const [pdfNotes, setPdfNotes] = useState<PdfNote[]>([]);
  const [showUploadPdf, setShowUploadPdf] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // PDF Form State
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfCategory, setPdfCategory] = useState('English');
  const [pdfTargetDate, setPdfTargetDate] = useState('');
  const [pdfPagesPerDay, setPdfPagesPerDay] = useState('');
  
  // PDF Reader State
  const [readingPage, setReadingPage] = useState(1);
  const [showAddPdfNote, setShowAddPdfNote] = useState(false);
  const [newPdfNote, setNewPdfNote] = useState('');
  
  // Forms
  const [showAddContent, setShowAddContent] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchGoals();
    fetchPdfs();
  }, []);

  useEffect(() => {
    if (activeSubcategory) {
      fetchContent(activeSubcategory);
    }
  }, [activeSubcategory]);

  useEffect(() => {
    if (activePdf) {
      fetchPdfNotes(activePdf.id);
      setReadingPage(activePdf.current_page > 0 ? activePdf.current_page : 1);
    }
  }, [activePdf]);

  const fetchCategories = async () => {
    try {
      const res = await apiFetch('/api/learning/categories');
      const data = await res.json();
      setCategories(data);
      if (data.length > 0) {
        setActiveCategory(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const fetchContent = async (subcategoryId: number) => {
    try {
      const res = await apiFetch(`/api/learning/content/${subcategoryId}`);
      const data = await res.json();
      setContent(data);
    } catch (error) {
      console.error('Failed to fetch content', error);
    }
  };

  const fetchGoals = async () => {
    try {
      const res = await apiFetch('/api/learning/goals');
      const data = await res.json();
      setGoals(data);
    } catch (error) {
      console.error('Failed to fetch goals', error);
    }
  };

  const fetchPdfs = async () => {
    try {
      const res = await apiFetch('/api/learning/pdfs');
      const data = await res.json();
      setPdfs(data);
    } catch (error) {
      console.error('Failed to fetch PDFs', error);
    }
  };

  const fetchPdfNotes = async (pdfId: number) => {
    try {
      const res = await apiFetch(`/api/learning/pdfs/${pdfId}/notes`);
      const data = await res.json();
      setPdfNotes(data);
    } catch (error) {
      console.error('Failed to fetch PDF notes', error);
    }
  };

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubcategory) return;

    try {
      await apiFetch('/api/learning/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subcategory_id: activeSubcategory,
          title: newTitle,
          description: newDescription,
          is_bookmarked: 0,
          revise_later: 0
        })
      });
      setNewTitle('');
      setNewDescription('');
      setShowAddContent(false);
      fetchContent(activeSubcategory);
    } catch (error) {
      console.error('Failed to add content', error);
    }
  };

  const toggleBookmark = async (item: Content) => {
    try {
      await apiFetch(`/api/learning/content/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          is_bookmarked: item.is_bookmarked ? 0 : 1
        })
      });
      if (activeSubcategory) fetchContent(activeSubcategory);
    } catch (error) {
      console.error('Failed to toggle bookmark', error);
    }
  };

  const toggleReviseLater = async (item: Content) => {
    try {
      await apiFetch(`/api/learning/content/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          revise_later: item.revise_later ? 0 : 1
        })
      });
      if (activeSubcategory) fetchContent(activeSubcategory);
    } catch (error) {
      console.error('Failed to toggle revise later', error);
    }
  };

  const handleDeleteContent = async (id: number) => {
    try {
      await apiFetch(`/api/learning/content/${id}`, { method: 'DELETE' });
      if (activeSubcategory) fetchContent(activeSubcategory);
    } catch (error) {
      console.error('Failed to delete content', error);
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/learning/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: newGoal,
          is_completed: 0
        })
      });
      setNewGoal('');
      setShowAddGoal(false);
      fetchGoals();
    } catch (error) {
      console.error('Failed to add goal', error);
    }
  };

  const toggleGoal = async (goal: Goal) => {
    try {
      await apiFetch(`/api/learning/goals/${goal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...goal,
          is_completed: goal.is_completed ? 0 : 1
        })
      });
      fetchGoals();
    } catch (error) {
      console.error('Failed to toggle goal', error);
    }
  };

  const handleDeleteGoal = async (id: number) => {
    try {
      await apiFetch(`/api/learning/goals/${id}`, { method: 'DELETE' });
      fetchGoals();
    } catch (error) {
      console.error('Failed to delete goal', error);
    }
  };

  const handleUploadPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileInputRef.current?.files?.[0]) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('pdf', fileInputRef.current.files[0]);
    formData.append('title', pdfTitle);
    formData.append('category', pdfCategory);
    if (pdfTargetDate) formData.append('target_date', pdfTargetDate);
    if (pdfPagesPerDay) formData.append('pages_per_day', pdfPagesPerDay);

    try {
      await apiFetch('/api/learning/pdfs', {
        method: 'POST',
        body: formData
      });
      
      setPdfTitle('');
      setPdfCategory('English');
      setPdfTargetDate('');
      setPdfPagesPerDay('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowUploadPdf(false);
      fetchPdfs();
    } catch (error) {
      console.error('Failed to upload PDF', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePdf = async (id: number) => {
    if (!confirm('Are you sure you want to delete this PDF?')) return;
    try {
      await apiFetch(`/api/learning/pdfs/${id}`, { method: 'DELETE' });
      if (activePdf?.id === id) setActivePdf(null);
      fetchPdfs();
    } catch (error) {
      console.error('Failed to delete PDF', error);
    }
  };

  const updatePdfProgress = async (page: number) => {
    if (!activePdf) return;
    setReadingPage(page);
    try {
      await apiFetch(`/api/learning/pdfs/${activePdf.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_page: page,
          target_date: activePdf.target_date,
          pages_per_day: activePdf.pages_per_day
        })
      });
      
      // Update local state
      setPdfs(pdfs.map(p => p.id === activePdf.id ? { ...p, current_page: page } : p));
      setActivePdf({ ...activePdf, current_page: page });
    } catch (error) {
      console.error('Failed to update progress', error);
    }
  };

  const handleAddPdfNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePdf) return;

    try {
      await apiFetch(`/api/learning/pdfs/${activePdf.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_number: readingPage,
          content: newPdfNote
        })
      });
      setNewPdfNote('');
      setShowAddPdfNote(false);
      fetchPdfNotes(activePdf.id);
    } catch (error) {
      console.error('Failed to add note', error);
    }
  };

  const handleDeletePdfNote = async (id: number) => {
    try {
      await apiFetch(`/api/learning/pdf-notes/${id}`, { method: 'DELETE' });
      if (activePdf) fetchPdfNotes(activePdf.id);
    } catch (error) {
      console.error('Failed to delete note', error);
    }
  };

  const getCategoryIcon = (name: string) => {
    if (name.toLowerCase().includes('english')) return <BookOpen className="w-6 h-6" />;
    if (name.toLowerCase().includes('accounting')) return <Calculator className="w-6 h-6" />;
    if (name.toLowerCase().includes('psychology')) return <Brain className="w-6 h-6" />;
    return <GraduationCap className="w-6 h-6" />;
  };

  const completedGoals = goals.filter(g => g.is_completed).length;
  const progressPercentage = goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl">
            <GraduationCap className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold">{t('Learning')}</h1>
        </div>
        
        <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'notes' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            Notes & Concepts
          </button>
          <button 
            onClick={() => setActiveTab('pdfs')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'pdfs' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            PDF Library
          </button>
        </div>
      </div>

      {activeTab === 'notes' ? (
        <>
          {/* Top Section: Progress & Goals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Progress Card */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Daily Progress
                </h3>
                <span className="text-2xl font-bold text-blue-500">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-3 mb-4">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Flame className="w-5 h-5 text-orange-500" />
                <span>3 Day Streak</span>
              </div>
            </div>

            {/* Goals Card */}
            <div className="md:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Daily Goals</h3>
                <button 
                  onClick={() => setShowAddGoal(!showAddGoal)}
                  className="text-sm text-yellow-600 dark:text-yellow-500 font-medium hover:underline"
                >
                  + Add Goal
                </button>
              </div>

              {showAddGoal && (
                <form onSubmit={handleAddGoal} className="mb-4 flex gap-2">
                  <input
                    type="text"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="E.g., Learn 10 English words"
                    className="flex-1 p-2 border border-gray-200 dark:border-zinc-700 rounded-lg dark:bg-zinc-800"
                    required
                  />
                  <button type="submit" className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium">
                    Add
                  </button>
                </form>
              )}

              <div className="space-y-2">
                {goals.map(goal => (
                  <div key={goal.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleGoal(goal)}>
                        {goal.is_completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <span className={goal.is_completed ? 'line-through text-gray-400' : ''}>
                        {goal.description}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {goals.length === 0 && (
                  <p className="text-gray-500 text-center py-2">No goals set for today.</p>
                )}
              </div>
            </div>
          </div>

          {/* Main Learning Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map(category => (
              <div 
                key={category.id}
                className={`bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border transition-all ${activeCategory === category.id ? 'border-yellow-400 ring-1 ring-yellow-400' : 'border-gray-100 dark:border-zinc-800'}`}
              >
                <button 
                  className="w-full p-6 flex flex-col items-center gap-4 text-center"
                  onClick={() => {
                    setActiveCategory(category.id);
                    setActiveSubcategory(null);
                  }}
                >
                  <div className={`p-4 rounded-full ${activeCategory === category.id ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400'}`}>
                    {getCategoryIcon(category.name)}
                  </div>
                  <h2 className="text-xl font-bold">{category.name}</h2>
                </button>

                {/* Subcategories Dropdown (only visible if active) */}
                {activeCategory === category.id && (
                  <div className="border-t border-gray-100 dark:border-zinc-800 p-2">
                    {category.subcategories.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => setActiveSubcategory(sub.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors ${activeSubcategory === sub.id ? 'bg-gray-100 dark:bg-zinc-800 font-medium' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50'}`}
                      >
                        <span>{sub.name}</span>
                        <ChevronRight className={`w-4 h-4 ${activeSubcategory === sub.id ? 'text-black dark:text-white' : 'text-gray-400'}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Content Area */}
          {activeSubcategory && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {categories.find(c => c.id === activeCategory)?.subcategories.find(s => s.id === activeSubcategory)?.name}
                </h2>
                <button 
                  onClick={() => setShowAddContent(!showAddContent)}
                  className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Note
                </button>
              </div>

              {showAddContent && (
                <form onSubmit={handleAddContent} className="mb-8 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-zinc-700">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Title / Concept / Word</label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full p-3 border border-gray-200 dark:border-zinc-700 rounded-xl dark:bg-zinc-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description / Meaning / Example</label>
                      <textarea
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        className="w-full p-3 border border-gray-200 dark:border-zinc-700 rounded-xl dark:bg-zinc-800 min-h-[100px]"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => setShowAddContent(false)}
                        className="px-4 py-2 text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="px-6 py-2 bg-yellow-400 text-black font-medium rounded-xl hover:bg-yellow-500"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {content.map(item => (
                  <div key={item.id} className="p-5 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-800">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold">{item.title}</h3>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleReviseLater(item)}
                          className={`text-xs px-2 py-1 rounded-md font-medium ${item.revise_later ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-gray-200 text-gray-600 dark:bg-zinc-700 dark:text-gray-300'}`}
                        >
                          {item.revise_later ? 'Revise Later' : 'Mark to Revise'}
                        </button>
                        <button 
                          onClick={() => toggleBookmark(item)}
                          className={`p-1.5 rounded-lg ${item.is_bookmarked ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-500' : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700'}`}
                        >
                          <Bookmark className="w-4 h-4" fill={item.is_bookmarked ? "currentColor" : "none"} />
                        </button>
                        <button 
                          onClick={() => handleDeleteContent(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap font-mono text-sm bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-zinc-700">
                      {item.description}
                    </div>
                  </div>
                ))}
                {content.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-zinc-700" />
                    <p>No notes yet. Start learning!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        /* PDF Library Tab */
        <div className="space-y-6">
          {activePdf ? (
            /* PDF Reader View */
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col h-[80vh]">
              <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gray-50 dark:bg-zinc-800/50 rounded-t-2xl">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setActivePdf(null)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </button>
                  <div>
                    <h2 className="font-bold text-lg">{activePdf.title}</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="px-2 py-0.5 bg-gray-200 dark:bg-zinc-700 rounded-md">{activePdf.category}</span>
                      <span>Page {readingPage} of {activePdf.total_pages}</span>
                      <span>({Math.round((readingPage / activePdf.total_pages) * 100)}%)</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => updatePdfProgress(Math.max(1, readingPage - 1))}
                      className="p-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50"
                      disabled={readingPage <= 1}
                    >
                      Prev
                    </button>
                    <input 
                      type="number" 
                      value={readingPage}
                      onChange={(e) => updatePdfProgress(Math.min(activePdf.total_pages, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-16 p-2 text-center border border-gray-200 dark:border-zinc-700 rounded-lg dark:bg-zinc-900"
                      min={1}
                      max={activePdf.total_pages}
                    />
                    <button 
                      onClick={() => updatePdfProgress(Math.min(activePdf.total_pages, readingPage + 1))}
                      className="p-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50"
                      disabled={readingPage >= activePdf.total_pages}
                    >
                      Next
                    </button>
                  </div>
                  <button 
                    onClick={() => setShowAddPdfNote(!showAddPdfNote)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black rounded-lg font-medium hover:bg-yellow-500"
                  >
                    <Edit3 className="w-4 h-4" />
                    Add Note
                  </button>
                </div>
              </div>
              
              <div className="flex-1 flex overflow-hidden">
                {/* PDF Viewer */}
                <div className="flex-1 bg-gray-200 dark:bg-zinc-950 relative">
                  <iframe 
                    src={`/uploads/${activePdf.file_path}#page=${readingPage}`} 
                    className="w-full h-full border-none"
                    title={activePdf.title}
                  />
                </div>
                
                {/* Notes Sidebar */}
                <div className="w-80 border-l border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col">
                  <div className="p-4 border-b border-gray-100 dark:border-zinc-800 font-bold flex items-center gap-2">
                    <Book className="w-5 h-5 text-yellow-500" />
                    My Notes & Highlights
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {showAddPdfNote && (
                      <form onSubmit={handleAddPdfNote} className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-xl border border-yellow-200 dark:border-yellow-900/30">
                        <div className="text-xs font-medium text-yellow-800 dark:text-yellow-500 mb-2">Note for Page {readingPage}</div>
                        <textarea
                          value={newPdfNote}
                          onChange={(e) => setNewPdfNote(e.target.value)}
                          className="w-full p-2 text-sm border border-yellow-200 dark:border-yellow-900/50 rounded-lg dark:bg-zinc-800 min-h-[80px] mb-2"
                          placeholder="Type your note or highlight here..."
                          required
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <button 
                            type="button" 
                            onClick={() => setShowAddPdfNote(false)}
                            className="text-xs px-3 py-1.5 text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit"
                            className="text-xs px-3 py-1.5 bg-yellow-400 text-black font-medium rounded-lg hover:bg-yellow-500"
                          >
                            Save Note
                          </button>
                        </div>
                      </form>
                    )}
                    
                    {pdfNotes.map(note => (
                      <div key={note.id} className="bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-gray-100 dark:border-zinc-800 relative group">
                        <button 
                          onClick={() => handleDeletePdfNote(note.id)}
                          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => updatePdfProgress(note.page_number)}
                          className="text-xs font-medium text-blue-500 hover:underline mb-1 inline-block"
                        >
                          Page {note.page_number}
                        </button>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{note.content}</p>
                      </div>
                    ))}
                    
                    {pdfNotes.length === 0 && !showAddPdfNote && (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No notes yet.</p>
                        <p className="text-xs mt-1">Click "Add Note" to save highlights for the current page.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* PDF Library Grid */
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">My Study Books</h2>
                <button 
                  onClick={() => setShowUploadPdf(!showUploadPdf)}
                  className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload PDF
                </button>
              </div>

              {showUploadPdf && (
                <form onSubmit={handleUploadPdf} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 mb-6">
                  <h3 className="font-bold text-lg mb-4">Upload New Book</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Book Title</label>
                      <input
                        type="text"
                        value={pdfTitle}
                        onChange={(e) => setPdfTitle(e.target.value)}
                        className="w-full p-3 border border-gray-200 dark:border-zinc-700 rounded-xl dark:bg-zinc-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select
                        value={pdfCategory}
                        onChange={(e) => setPdfCategory(e.target.value)}
                        className="w-full p-3 border border-gray-200 dark:border-zinc-700 rounded-xl dark:bg-zinc-800"
                      >
                        <option value="English">English</option>
                        <option value="Accounting">Accounting</option>
                        <option value="Psychology">Psychology</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Target Completion Date (Optional)</label>
                      <input
                        type="date"
                        value={pdfTargetDate}
                        onChange={(e) => setPdfTargetDate(e.target.value)}
                        className="w-full p-3 border border-gray-200 dark:border-zinc-700 rounded-xl dark:bg-zinc-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Pages Per Day Goal (Optional)</label>
                      <input
                        type="number"
                        value={pdfPagesPerDay}
                        onChange={(e) => setPdfPagesPerDay(e.target.value)}
                        className="w-full p-3 border border-gray-200 dark:border-zinc-700 rounded-xl dark:bg-zinc-800"
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">PDF File</label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="application/pdf"
                      className="w-full p-3 border border-gray-200 dark:border-zinc-700 rounded-xl dark:bg-zinc-800 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button 
                      type="button" 
                      onClick={() => setShowUploadPdf(false)}
                      className="px-4 py-2 text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={uploading}
                      className="px-6 py-2 bg-yellow-400 text-black font-medium rounded-xl hover:bg-yellow-500 disabled:opacity-50 flex items-center gap-2"
                    >
                      {uploading ? 'Uploading...' : 'Upload Book'}
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pdfs.map(pdf => {
                  const percent = pdf.total_pages > 0 ? Math.round((pdf.current_page / pdf.total_pages) * 100) : 0;
                  const remaining = pdf.total_pages - pdf.current_page;
                  
                  return (
                    <div key={pdf.id} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden flex flex-col relative group">
                      <button 
                        onClick={() => handleDeletePdf(pdf.id)}
                        className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-black/90 rounded-full text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="p-6 flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-16 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800">
                            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg line-clamp-2 leading-tight mb-1">{pdf.title}</h3>
                            <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded-md text-gray-600 dark:text-gray-400">
                              {pdf.category}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium">{percent}% Completed</span>
                              <span className="text-gray-500">{pdf.current_page} / {pdf.total_pages}</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2">
                              <div 
                                className="bg-yellow-400 h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-xl">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{remaining}</div>
                              <div>Pages Left</div>
                            </div>
                            {pdf.pages_per_day > 0 && (
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {Math.ceil(remaining / pdf.pages_per_day)}
                                </div>
                                <div>Days Left</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => setActivePdf(pdf)}
                        className="w-full py-4 bg-gray-50 dark:bg-zinc-800/80 hover:bg-yellow-400 hover:text-black dark:hover:bg-yellow-500 transition-colors font-medium flex items-center justify-center gap-2 border-t border-gray-100 dark:border-zinc-800"
                      >
                        {pdf.current_page > 0 ? (
                          <>Continue Reading <Play className="w-4 h-4" /></>
                        ) : (
                          <>Start Reading <BookOpen className="w-4 h-4" /></>
                        )}
                      </button>
                    </div>
                  );
                })}
                
                {pdfs.length === 0 && !showUploadPdf && (
                  <div className="col-span-full bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700 p-12 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-zinc-600" />
                    <h3 className="text-lg font-bold mb-2">Your Library is Empty</h3>
                    <p className="text-gray-500 mb-6">Upload PDF books to start tracking your reading progress.</p>
                    <button 
                      onClick={() => setShowUploadPdf(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                    >
                      <Upload className="w-5 h-5" />
                      Upload First Book
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
