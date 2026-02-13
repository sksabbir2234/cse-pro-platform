import React, { useState, useEffect, useMemo } from 'react';
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
} from 'firebase/firestore';

import { firebaseConfig, appId, auth, db } from './config';
import { ADMIN_UID } from './constants';
import { useStudyTimer } from './hooks/useStudyTimer';

import Header from './components/Header';
import WelcomeBanner from './components/WelcomeBanner';
import TopicGrid from './components/TopicGrid';
import LessonSidebar from './components/LessonSidebar';
import LessonViewer from './components/LessonViewer';
import EditModal from './components/EditModal';
import ReorderTopicsModal from './components/ReorderTopicsModal';
import SearchResults from './components/SearchResults';

export default function App() {
  const [user, setUser] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [masteredIds, setMasteredIds] = useState([]);
  const [userNotes, setUserNotes] = useState({});
  const [currentTopic, setCurrentTopic] = useState(null);
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [activeTab, setActiveTab] = useState('content');

  const { seconds, isActive, toggleTimer, resetTimer, formatTime } =
    useStudyTimer();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: '',
    topic: '',
    title: '',
    body: '',
  });

  // ==================== NEW STATES ====================
  const [searchQuery, setSearchQuery] = useState('');
  const [topicOrder, setTopicOrder] = useState([]);
  const [isReorderOpen, setIsReorderOpen] = useState(false);
  const [tempTopicOrder, setTempTopicOrder] = useState([]);

  const isAdmin = user && user.uid === ADMIN_UID;

  // ====================== AUTH ======================
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) console.log(u.uid);
    });
  }, []);

  // ====================== FIREBASE DATA ======================
  useEffect(() => {
    if (!user) return;
    const unsubChapters = onSnapshot(
      collection(db, 'artifacts', appId, 'public', 'data', 'chapters'),
      (snap) => setChapters(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
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

  // ==================== TOPIC ORDER (global) ====================
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      doc(db, 'artifacts', appId, 'settings', 'topicOrder'),
      (d) => {
        setTopicOrder(d.exists() ? d.data().order || [] : []);
      },
    );
    return unsub;
  }, [user]);

  const activeChapter = useMemo(
    () => chapters.find((c) => c.id === activeChapterId),
    [chapters, activeChapterId],
  );

  // ==================== SORTED TOPICS (smart) ====================
  const sortedTopics = useMemo(() => {
    const allTopics = [...new Set(chapters.map((c) => c.topic))];
    if (topicOrder.length === 0) return allTopics.sort();

    const ordered = topicOrder.filter((t) => allTopics.includes(t));
    const remaining = allTopics.filter((t) => !topicOrder.includes(t)).sort();
    return [...ordered, ...remaining];
  }, [chapters, topicOrder]);

  // ==================== OVERALL PROGRESS ====================
  const overallProgress = useMemo(() => {
    if (!chapters.length) return 0;
    return Math.round((masteredIds.length / chapters.length) * 100);
  }, [masteredIds, chapters]);

  // ==================== SEARCH FILTER ====================
  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return chapters.filter(
      (c) =>
        c.title.toLowerCase().includes(q) || c.topic.toLowerCase().includes(q),
    );
  }, [chapters, searchQuery]);

  // ====================== HANDLERS ======================
  const toggleMastery = async (id) => {
    if (!user) return;
    const newMastered = masteredIds.includes(id)
      ? masteredIds.filter((m) => m !== id)
      : [...masteredIds, id];

    await setDoc(
      doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'progress'),
      { mastered: newMastered, notes: userNotes },
      { merge: true },
    );
  };

  const handleNotesChange = async (chapterId, newText) => {
    const newNotes = { ...userNotes, [chapterId]: newText };
    setUserNotes(newNotes);
    await setDoc(
      doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'progress'),
      { notes: newNotes, mastered: masteredIds },
      { merge: true },
    );
  };

  const handleDelete = async () => {
    if (confirm('Delete lesson?')) {
      await deleteDoc(
        doc(db, 'artifacts', appId, 'public', 'data', 'chapters', editData.id),
      );
      setIsEditModalOpen(false);
    }
  };

  // ==================== LESSON REORDER HELPERS ====================
  const moveLessonUp = async (id) => {
    if (!isAdmin) return;
    const lesson = chapters.find((c) => c.id === id);
    if (!lesson) return;

    const topicLessons = chapters
      .filter((c) => c.topic === lesson.topic)
      .sort(
        (a, b) =>
          (a.order ?? 0) - (b.order ?? 0) || a.title.localeCompare(b.title),
      );

    const idx = topicLessons.findIndex((c) => c.id === id);
    if (idx <= 0) return;

    const prev = topicLessons[idx - 1];
    await updateDoc(
      doc(db, 'artifacts', appId, 'public', 'data', 'chapters', id),
      { order: prev.order ?? 0 },
    );
    await updateDoc(
      doc(db, 'artifacts', appId, 'public', 'data', 'chapters', prev.id),
      { order: lesson.order ?? 0 },
    );
  };

  const moveLessonDown = async (id) => {
    if (!isAdmin) return;
    const lesson = chapters.find((c) => c.id === id);
    if (!lesson) return;

    const topicLessons = chapters
      .filter((c) => c.topic === lesson.topic)
      .sort(
        (a, b) =>
          (a.order ?? 0) - (b.order ?? 0) || a.title.localeCompare(b.title),
      );

    const idx = topicLessons.findIndex((c) => c.id === id);
    if (idx === -1 || idx === topicLessons.length - 1) return;

    const next = topicLessons[idx + 1];
    await updateDoc(
      doc(db, 'artifacts', appId, 'public', 'data', 'chapters', id),
      { order: next.order ?? 0 },
    );
    await updateDoc(
      doc(db, 'artifacts', appId, 'public', 'data', 'chapters', next.id),
      { order: lesson.order ?? 0 },
    );
  };

  // ==================== TOPIC REORDER ====================
  const openReorderTopics = () => {
    setTempTopicOrder([...sortedTopics]);
    setIsReorderOpen(true);
  };

  const saveTopicOrder = async () => {
    await setDoc(doc(db, 'artifacts', appId, 'settings', 'topicOrder'), {
      order: tempTopicOrder,
    });
    setIsReorderOpen(false);
  };

  // ==================== SAVE LESSON (with order) ====================
  const handleSaveContent = async (formData) => {
    if (!isAdmin) {
      alert('Unauthorized: Only the project owner can publish.');
      return;
    }

    const data = {
      topic: formData.topic.trim(),
      title: formData.title.trim(),
      body: formData.body,
      updatedAt: serverTimestamp(),
    };

    // NEW: calculate order for new lessons
    if (!formData.id) {
      const topicChaps = chapters.filter((c) => c.topic === data.topic);
      const maxOrder = topicChaps.length
        ? Math.max(...topicChaps.map((c) => c.order ?? 0))
        : 0;
      data.order = maxOrder + 1;
    }

    try {
      if (formData.id) {
        await updateDoc(
          doc(
            db,
            'artifacts',
            appId,
            'public',
            'data',
            'chapters',
            formData.id,
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
      alert('Error: ' + error.message);
    }
  };

  // ==================== CONTINUE LEARNING ====================
  const continueLearning = () => {
    if (chapters.length === 0) return;

    // Find topic with lowest progress
    let bestTopic = null;
    let bestProgress = 101;

    sortedTopics.forEach((topic) => {
      const tChaps = chapters.filter((c) => c.topic === topic);
      const done = tChaps.filter((c) => masteredIds.includes(c.id)).length;
      const prog = tChaps.length ? (done / tChaps.length) * 100 : 100;
      if (prog < bestProgress) {
        bestProgress = prog;
        bestTopic = topic;
      }
    });

    if (!bestTopic) return;

    const topicLessons = chapters
      .filter((c) => c.topic === bestTopic)
      .sort(
        (a, b) =>
          (a.order ?? 0) - (b.order ?? 0) || a.title.localeCompare(b.title),
      );

    const nextLesson =
      topicLessons.find((c) => !masteredIds.includes(c.id)) || topicLessons[0];

    setCurrentTopic(bestTopic);
    setActiveChapterId(nextLesson.id);
    setActiveTab('content');
    resetTimer();
  };

  // ==================== RETURN (clean) ====================
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20">
      <Header
        isAdmin={isAdmin}
        currentTopic={currentTopic}
        onReset={() => {
          setCurrentTopic(null);
          setActiveChapterId(null);
          setSearchQuery('');
        }}
        sortedTopics={sortedTopics}
        onTopicSelect={(t) => {
          setCurrentTopic(t);
          setSearchQuery('');
        }}
        onNewLesson={() => {
          setEditData({
            id: '',
            topic: currentTopic || '',
            title: '',
            body: '',
          });
          setIsEditModalOpen(true);
        }}
        onReorderTopics={openReorderTopics}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {!currentTopic && !searchQuery && <WelcomeBanner />}

        {/* Overall Progress */}
        {!currentTopic && !searchQuery && chapters.length > 0 && (
          <div className="mb-8 bg-white p-6 rounded-3xl border border-slate-200">
            <div className="flex justify-between items-end mb-3">
              <div className="text-sm font-bold text-slate-500">
                OVERALL PROGRESS
              </div>
              <div className="text-4xl font-black text-indigo-600">
                {overallProgress}%
              </div>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            {overallProgress < 100 && (
              <button
                onClick={continueLearning}
                className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700"
              >
                Resume Learning →
              </button>
            )}
          </div>
        )}

        {!currentTopic && !searchQuery ? (
          <TopicGrid
            sortedTopics={sortedTopics}
            chapters={chapters}
            masteredIds={masteredIds}
            onSelectTopic={setCurrentTopic}
          />
        ) : searchQuery ? (
          <SearchResults
            results={searchResults}
            searchQuery={searchQuery}
            onSelect={(id, topic) => {
              setCurrentTopic(topic);
              setActiveChapterId(id);
              setSearchQuery('');
              setActiveTab('content');
              resetTimer();
            }}
          />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <LessonSidebar
              chapters={chapters}
              currentTopic={currentTopic}
              activeChapterId={activeChapterId}
              masteredIds={masteredIds}
              isAdmin={isAdmin}
              onSelectLesson={(id) => {
                setActiveChapterId(id);
                setActiveTab('content');
                resetTimer();
              }}
              onMoveLessonUp={moveLessonUp}
              onMoveLessonDown={moveLessonDown}
            />

            <LessonViewer
              activeChapter={activeChapter}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              seconds={seconds}
              isActive={isActive}
              formatTime={formatTime}
              onToggleTimer={toggleTimer}
              onResetTimer={resetTimer}
              isAdmin={isAdmin}
              onEditLesson={() => {
                setEditData({ ...activeChapter });
                setIsEditModalOpen(true);
              }}
              onToggleMastery={() => toggleMastery(activeChapter.id)}
              currentNote={userNotes[activeChapter?.id] || ''}
              onNotesChange={handleNotesChange}
              masteredIds={masteredIds}
            />
          </div>
        )}
      </main>

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editData={editData}
        setEditData={setEditData}
        onSave={handleSaveContent}
        onDelete={handleDelete}
      />

      <ReorderTopicsModal
        isOpen={isReorderOpen}
        onClose={() => setIsReorderOpen(false)}
        tempTopicOrder={tempTopicOrder}
        setTempTopicOrder={setTempTopicOrder}
        onSave={saveTopicOrder}
      />
    </div>
  );
}
