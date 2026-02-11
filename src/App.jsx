import React, { useState, useEffect, useRef, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import {
  Plus,
  CheckCircle2,
  Settings2,
  Trash2,
  Timer,
  BookOpen,
  PenLine,
  LayoutGrid,
  X,
  Lock,
  FileText,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';

import { firebaseConfig, appId, auth, db } from './config';

// YOUR UNIQUE ADMIN UID
const ADMIN_UID = 'poIxGXY4CdQvrOVgHjwex6SPd6z1';

export default function App() {
  const [user, setUser] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [masteredIds, setMasteredIds] = useState([]);
  const [userNotes, setUserNotes] = useState({});
  const [currentTopic, setCurrentTopic] = useState(null);
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [activeTab, setActiveTab] = useState('content'); // 'content', 'notes'

  // Study Timer State
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const editorRef = useRef(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: '',
    topic: '',
    title: '',
    body: '',
  });

  // STRICT ADMIN CHECK: Only you can post/edit
  const isAdmin = user && user.uid === ADMIN_UID;

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    // নিচের লাইনটি যোগ করুন আপনার আসল UID দেখার জন্য
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) console.log(u.uid);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubChapters = onSnapshot(
      collection(db, 'artifacts', appId, 'public', 'data', 'chapters'),
      (snap) => {
        setChapters(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
    );

    const unsubProgress = onSnapshot(
      doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'progress'),
      (d) => {
        if (d.exists()) {
          const data = d.data();
          setMasteredIds(data.mastered || []);
          setUserNotes(data.notes || {});
        }
      },
    );

    return () => {
      unsubChapters();
      unsubProgress();
    };
  }, [user]);

  // Timer Logic
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const activeChapter = useMemo(
    () => chapters.find((c) => c.id === activeChapterId),
    [chapters, activeChapterId],
  );

  const toggleMastery = async (id) => {
    if (!user) return;
    const newMastered = masteredIds.includes(id)
      ? masteredIds.filter((m) => m !== id)
      : [...masteredIds, id];
    await setDoc(
      doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'progress'),
      {
        mastered: newMastered,
        notes: userNotes,
      },
      { merge: true },
    );
  };

  const handleSaveContent = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Unauthorized: Only the project owner can publish.');
      return;
    }

    const bodyContent = editorRef.current?.innerHTML || '';
    if (!editData.topic.trim() || !editData.title.trim()) return;

    const data = {
      topic: editData.topic.trim(),
      title: editData.title.trim(),
      body: bodyContent,
      updatedAt: serverTimestamp(),
    };

    try {
      if (editData.id) {
        await updateDoc(
          doc(
            db,
            'artifacts',
            appId,
            'public',
            'data',
            'chapters',
            editData.id,
          ),
          data,
        );
      } else {
        await addDoc(
          collection(db, 'artifacts', appId, 'public', 'data', 'chapters'),
          data,
        );
      }
      setIsEditModalOpen(false);
      setCurrentTopic(data.topic);
    } catch (error) {
      alert('Error saving: ' + error.message);
    }
  };

  const sortedTopics = useMemo(
    () => [...new Set(chapters.map((c) => c.topic))].sort(),
    [chapters],
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-6"
            onClick={() => {
              setCurrentTopic(null);
              setActiveChapterId(null);
            }}
            style={{ cursor: 'pointer' }}
          >
            <h1 className="font-black text-xl tracking-tighter">
              CSE <span className="text-indigo-600">PRO</span>
            </h1>
            {isAdmin && (
              <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest flex items-center gap-1">
                <Lock size={10} /> Owner Mode
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => {
                  setEditData({
                    id: '',
                    topic: currentTopic || '',
                    title: '',
                    body: '',
                  });
                  setIsEditModalOpen(true);
                }}
                className="bg-slate-900 text-white p-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <Plus size={14} /> New Lesson
              </button>
            )}
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-6 overflow-x-auto no-scrollbar flex items-center gap-2 py-3 border-t border-slate-50">
          <button
            onClick={() => {
              setCurrentTopic(null);
              setActiveChapterId(null);
            }}
            className={`px-5 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 ${!currentTopic ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500'}`}
          >
            <LayoutGrid size={14} /> Dashboard
          </button>
          {sortedTopics.map((topic) => (
            <button
              key={topic}
              onClick={() => {
                setCurrentTopic(topic);
                setActiveChapterId(null);
              }}
              className={`px-5 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all border-2 ${currentTopic === topic ? 'bg-white border-indigo-600 text-indigo-600' : 'bg-white border-transparent text-slate-400'}`}
            >
              {topic}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {!currentTopic ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedTopics.map((topic) => {
              const tChapters = chapters.filter((c) => c.topic === topic);
              const prog = tChapters.length
                ? Math.round(
                    (tChapters.filter((c) => masteredIds.includes(c.id))
                      .length /
                      tChapters.length) *
                      100,
                  )
                : 0;
              return (
                <div
                  key={topic}
                  onClick={() => setCurrentTopic(topic)}
                  className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm cursor-pointer hover:shadow-xl transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <BookOpen size={24} />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mb-1">
                    {topic}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                    <span>{tChapters.length} Lessons</span>
                    <span>{prog}% Done</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-1000"
                      style={{ width: `${prog}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="w-full lg:w-72 shrink-0">
              <div className="sticky top-36 space-y-2">
                <h2 className="text-xl font-black mb-4 px-2">Lessons</h2>
                {chapters
                  .filter((c) => c.topic === currentTopic)
                  .map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setActiveChapterId(c.id);
                        setActiveTab('content');
                        setSeconds(0);
                        setIsActive(false);
                      }}
                      className={`w-full text-left p-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-between group ${activeChapterId === c.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border border-slate-100 hover:bg-slate-50 text-slate-600'}`}
                    >
                      <span className="truncate">{c.title}</span>
                      {masteredIds.includes(c.id) ? (
                        <CheckCircle2
                          size={16}
                          className={
                            activeChapterId === c.id
                              ? 'text-white'
                              : 'text-emerald-500'
                          }
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-200 group-hover:border-indigo-400"></div>
                      )}
                    </button>
                  ))}
              </div>
            </aside>

            <div className="flex-1 space-y-6">
              {activeChapter ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 w-fit">
                      <button
                        onClick={() => setActiveTab('content')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'content' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        <FileText size={14} /> Reading
                      </button>
                      <button
                        onClick={() => setActiveTab('notes')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'notes' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        <PenLine size={14} /> My Notes
                      </button>
                    </div>

                    {/* STUDY TIMER FEATURE */}
                    <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Timer size={16} className="text-indigo-600" />
                        <span className="font-mono font-black text-lg">
                          {formatTime(seconds)}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setIsActive(!isActive)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
                        >
                          {isActive ? <Pause size={16} /> : <Play size={16} />}
                        </button>
                        <button
                          onClick={() => {
                            setIsActive(false);
                            setSeconds(0);
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
                        >
                          <RotateCcw size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[40px] p-6 md:p-10 border border-slate-200 shadow-sm min-h-[600px]">
                    {activeTab === 'content' && (
                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex justify-between items-start mb-10">
                          <h1 className="text-4xl font-black text-slate-900 leading-tight flex-1">
                            {activeChapter.title}
                          </h1>
                          <div className="flex gap-2 shrink-0">
                            {isAdmin && (
                              <button
                                onClick={() => {
                                  setEditData({ ...activeChapter });
                                  setIsEditModalOpen(true);
                                  setTimeout(
                                    () =>
                                      (editorRef.current.innerHTML =
                                        activeChapter.body),
                                    100,
                                  );
                                }}
                                className="p-3 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-900 hover:text-white transition-all"
                              >
                                <Settings2 size={20} />
                              </button>
                            )}
                            <button
                              onClick={() => toggleMastery(activeChapter.id)}
                              className={`p-3 px-6 rounded-xl font-black text-sm transition-all ${masteredIds.includes(activeChapter.id) ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white shadow-lg active:scale-95'}`}
                            >
                              {masteredIds.includes(activeChapter.id)
                                ? 'Lesson Mastered'
                                : 'Mark as Done'}
                            </button>
                          </div>
                        </div>
                        <div
                          className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-lg"
                          dangerouslySetInnerHTML={{
                            __html: activeChapter.body,
                          }}
                        ></div>
                      </div>
                    )}

                    {activeTab === 'notes' && (
                      <div className="flex flex-col h-full animate-in fade-in duration-300">
                        <div className="mb-6">
                          <h2 className="text-2xl font-black flex items-center gap-2">
                            <PenLine className="text-amber-500" /> My Study
                            Notes
                          </h2>
                          <p className="text-slate-500 text-sm font-medium">
                            Personal notes for this lesson (Private to you)
                          </p>
                        </div>
                        <textarea
                          className="flex-1 w-full bg-amber-50/30 border-2 border-dashed border-amber-200 rounded-[32px] p-8 font-medium text-slate-700 outline-none focus:border-amber-400 transition-all resize-none min-h-[400px]"
                          placeholder="Start writing your key takeaways here..."
                          value={userNotes[activeChapter.id] || ''}
                          onChange={async (e) => {
                            const newNotes = {
                              ...userNotes,
                              [activeChapter.id]: e.target.value,
                            };
                            setUserNotes(newNotes);
                            await setDoc(
                              doc(
                                db,
                                'artifacts',
                                appId,
                                'users',
                                user.uid,
                                'settings',
                                'progress',
                              ),
                              {
                                notes: newNotes,
                                mastered: masteredIds,
                              },
                              { merge: true },
                            );
                          }}
                        />
                        <div className="mt-4 flex items-center gap-2 text-amber-600 font-bold text-[10px] uppercase tracking-widest">
                          <CheckCircle2 size={14} /> Auto-saved to your profile
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full bg-white rounded-[40px] flex flex-col items-center justify-center text-center py-40 border-2 border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
                    <BookOpen size={40} />
                  </div>
                  <h3 className="text-xl font-black text-slate-400">
                    Select a lesson to begin studying
                  </h3>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {isEditModalOpen && isAdmin && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto flex items-center justify-center">
          <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-black uppercase text-sm tracking-widest flex items-center gap-2">
                <Lock size={14} /> Lesson Editor
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X />
              </button>
            </div>
            <form onSubmit={handleSaveContent} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Topic Group
                  </label>
                  <input
                    placeholder="e.g. Algorithms"
                    value={editData.topic}
                    onChange={(e) =>
                      setEditData({ ...editData, topic: e.target.value })
                    }
                    className="w-full bg-slate-50 p-4 rounded-xl font-bold outline-none border border-transparent focus:border-indigo-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Lesson Title
                  </label>
                  <input
                    placeholder="e.g. Binary Search"
                    value={editData.title}
                    onChange={(e) =>
                      setEditData({ ...editData, title: e.target.value })
                    }
                    className="w-full bg-slate-50 p-4 rounded-xl font-bold outline-none border border-transparent focus:border-indigo-600"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Content (HTML Support)
                </label>
                <div
                  ref={editorRef}
                  contentEditable
                  className="min-h-[350px] p-6 bg-slate-50 rounded-2xl outline-none prose prose-slate border border-transparent focus:border-indigo-600 overflow-y-auto max-h-[500px]"
                ></div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                >
                  Publish Lesson
                </button>
                {editData.id && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm('Delete lesson?')) {
                        await deleteDoc(
                          doc(
                            db,
                            'artifacts',
                            appId,
                            'public',
                            'data',
                            'chapters',
                            editData.id,
                          ),
                        );
                        setIsEditModalOpen(false);
                      }
                    }}
                    className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
