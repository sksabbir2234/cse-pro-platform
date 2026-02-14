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
  query,
  where,
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
import FlashcardsPage from './components/FlashcardsPage';
import JobsPage from './components/JobsPage';
import CoursesPage from './components/CoursesPage';
import ManageCourseModal from './components/ManageCourseModal';
import NewJobModal from './components/NewJobModal';
import NewCourseModal from './components/NewCourseModal';

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
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [selectedFlashcardTopic, setSelectedFlashcardTopic] = useState(null);
  const [studySession, setStudySession] = useState([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [flashcards, setFlashcards] = useState([]);

  const [showCourses, setShowCourses] = useState(false);
  const [showJobs, setShowJobs] = useState(false);
  const [courses, setCourses] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [manageCourse, setManageCourse] = useState(null);
  const [myEnrollments, setMyEnrollments] = useState({});
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);

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

  // ==================== FLASHCARDS DATA ====================
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      collection(db, 'artifacts', appId, 'public', 'data', 'flashcards'),
      (snap) => {
        setFlashcards(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
    );
    return unsub;
  }, [user]);

  // ==================== COURSES & JOBS ====================
  useEffect(() => {
    if (!user) return;
    const unsubCourses = onSnapshot(
      collection(db, 'artifacts', appId, 'public', 'data', 'courses'),
      (snap) => {
        setCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
    );
    const unsubJobs = onSnapshot(
      collection(db, 'artifacts', appId, 'public', 'data', 'jobs'),
      (snap) => {
        setJobs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
    );
    return () => {
      unsubCourses();
      unsubJobs();
    };
  }, [user]);

  // ==================== MY ENROLLMENTS (for user) ====================
  useEffect(() => {
    if (!user) {
      setMyEnrollments({});
      return;
    }
    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'enrollments'),
      where('uid', '==', user.uid),
    );
    const unsub = onSnapshot(q, (snap) => {
      const map = {};
      snap.docs.forEach((d) => {
        map[d.data().courseId] = d.data().status;
      });
      setMyEnrollments(map);
    });
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

  const flashcardsByTopic = useMemo(() => {
    const grouped = {};
    flashcards.forEach((f) => {
      if (!grouped[f.topic]) grouped[f.topic] = [];
      grouped[f.topic].push(f);
    });
    return grouped;
  }, [flashcards]);

  // ==================== SEARCH FILTER ====================
  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return chapters.filter(
      (c) =>
        c.title.toLowerCase().includes(q) || c.topic.toLowerCase().includes(q),
    );
  }, [chapters, searchQuery]);

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result.trim();
      const lines = text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line);

      if (lines.length < 1) {
        alert('CSV file is empty');
        return;
      }

      // Parse first row to detect if it has headers
      const firstRow = lines[0].toLowerCase();
      const hasHeader =
        firstRow.includes('topic') ||
        firstRow.includes('category') ||
        firstRow.includes('question') ||
        firstRow.includes('front') ||
        firstRow.includes('answer') ||
        firstRow.includes('back');

      let topicIdx = -1,
        frontIdx = -1,
        backIdx = -1;

      if (hasHeader) {
        // Normal case with header row
        const headers = lines[0]
          .toLowerCase()
          .split(',')
          .map((h) => h.trim());
        topicIdx = headers.findIndex(
          (h) => h === 'topic' || h === 'category' || h === 'group',
        );
        frontIdx = headers.findIndex(
          (h) => h === 'question' || h === 'front' || h === 'q',
        );
        backIdx = headers.findIndex(
          (h) => h === 'answer' || h === 'back' || h === 'a',
        );
      } else {
        // No header → assume first 3 columns: Topic, Front, Back
        topicIdx = 0;
        frontIdx = 1;
        backIdx = 2;
      }

      if (topicIdx === -1 || frontIdx === -1 || backIdx === -1) {
        alert(
          'CSV must have columns for Topic, Question/Front, and Answer/Back.\n\n' +
            'Example with header:\nTopic,Question,Answer\n...\n\n' +
            'Or without header (first 3 columns only):\nData Structures,What is a Stack?,LIFO...',
        );
        return;
      }

      let added = 0;
      const startRow = hasHeader ? 1 : 0;

      for (let i = startRow; i < lines.length; i++) {
        // Better CSV splitting (handles commas inside quotes)
        const values = lines[i]
          .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
          .map((v) => v.trim().replace(/^"|"$/g, ''));

        if (values.length <= Math.max(topicIdx, frontIdx, backIdx)) continue;

        const topic = values[topicIdx]?.trim();
        const front = values[frontIdx]?.trim();
        const back = values[backIdx]?.trim();

        if (topic && front && back) {
          await addDoc(
            collection(db, 'artifacts', appId, 'public', 'data', 'flashcards'),
            {
              topic,
              front,
              back,
              createdAt: serverTimestamp(),
            },
          );
          added++;
        }
      }

      if (added > 0) {
        alert(`${added} flashcards added successfully!`);
      } else {
        alert('No valid flashcards found in the file.');
      }
    };

    reader.readAsText(file);
  };

  const startFlashcardStudy = (topic) => {
    const cards = flashcardsByTopic[topic] || [];
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setStudySession(shuffled);
    setSelectedFlashcardTopic(topic);
    setCurrentFlashcardIndex(0);
    setIsCardFlipped(false);
  };

  const handleFlip = () => setIsCardFlipped(!isCardFlipped);
  const handleNext = () => {
    if (currentFlashcardIndex < studySession.length - 1) {
      setCurrentFlashcardIndex(currentFlashcardIndex + 1);
      setIsCardFlipped(false);
    }
  };
  const handlePrev = () => {
    if (currentFlashcardIndex > 0) {
      setCurrentFlashcardIndex(currentFlashcardIndex - 1);
      setIsCardFlipped(false);
    }
  };
  const handleMarkKnown = handleNext; // for now just go next
  const handleShuffle = () => {
    const shuffled = [...studySession].sort(() => Math.random() - 0.5);
    setStudySession(shuffled);
    setCurrentFlashcardIndex(0);
    setIsCardFlipped(false);
  };

  const deleteFlashcards = async (ids) => {
    if (!ids || ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} selected flashcards permanently?`))
      return;

    try {
      for (const id of ids) {
        await deleteDoc(
          doc(db, 'artifacts', appId, 'public', 'data', 'flashcards', id),
        );
      }
      alert(`${ids.length} flashcards deleted successfully!`);
    } catch (error) {
      alert('Error deleting: ' + error.message);
    }
  };

  // ====================== HANDLERS ======================
  // Jobs
  const openNewJob = () => {
    setIsNewJobModalOpen(true);
  };

  const handleSaveNewJob = async (jobData) => {
    try {
      await addDoc(
        collection(db, 'artifacts', appId, 'public', 'data', 'jobs'),
        {
          designation: jobData.designation,
          company: jobData.company || '',
          startDate: jobData.startDate || '',
          deadline: jobData.deadline,
          link: jobData.link,
          description: jobData.description || '',
          postedAt: serverTimestamp(),
        },
      );
      setIsNewJobModalOpen(false);
      alert('Job posted successfully!');
    } catch (error) {
      alert('Error posting job: ' + error.message);
    }
  };

  const deleteJob = async (id) => {
    if (confirm('Delete this job?')) {
      await deleteDoc(
        doc(db, 'artifacts', appId, 'public', 'data', 'jobs', id),
      );
    }
  };

  // Courses
  const openNewCourse = () => {
    setIsNewCourseModalOpen(true);
  };

  const handleSaveNewCourse = async (courseData) => {
    try {
      await addDoc(
        collection(db, 'artifacts', appId, 'public', 'data', 'courses'),
        {
          title: courseData.title,
          description: courseData.description || '',
          instructor: courseData.instructor || '',
          duration: courseData.duration || '',
          fee: courseData.fee || '',
          level: courseData.level || 'beginner',
          learningOutcomes: courseData.learningOutcomes || '',
          prerequisites: courseData.prerequisites || '',
          imageUrl: courseData.imageUrl || '',
          maxStudents: courseData.maxStudents
            ? parseInt(courseData.maxStudents)
            : null,
          createdAt: serverTimestamp(),
        },
      );
      setIsNewCourseModalOpen(false);
      alert('Course created successfully!');
    } catch (error) {
      alert('Error creating course: ' + error.message);
    }
  };

  const enrollInCourse = async (courseId, userData) => {
    if (!user) return alert('Please login first');

    // Validate required enrollment data
    if (!userData?.name?.trim()) {
      return alert('Name is required to enroll');
    }
    if (!userData?.phone?.trim()) {
      return alert('Phone number is required to enroll');
    }

    await addDoc(
      collection(db, 'artifacts', appId, 'public', 'data', 'enrollments'),
      {
        courseId,
        uid: user.uid,
        status: 'pending',
        enrolledAt: serverTimestamp(),
        whatsapp: userData.phone.trim(),
        name: userData.name.trim(),
        phone: userData.phone.trim(),
      },
    );
    alert('Enrollment request sent! Waiting for approval.');
  };

  const openManageCourse = (course) => {
    setManageCourse(course);
  };

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
        showFlashcards={showFlashcards}
        showCourses={showCourses}
        showJobs={showJobs}
        onReset={() => {
          setCurrentTopic(null);
          setActiveChapterId(null);
          setSearchQuery('');
          setShowFlashcards(false);
          setShowCourses(false);
          setShowJobs(false);
          setSelectedFlashcardTopic(null);
        }}
        onFlashcardsClick={() => {
          setShowFlashcards(true);
          setShowCourses(false);
          setShowJobs(false);
          setCurrentTopic(null);
        }}
        onCoursesClick={() => {
          setShowCourses(true);
          setShowFlashcards(false);
          setShowJobs(false);
          setCurrentTopic(null);
        }}
        onJobsClick={() => {
          setShowJobs(true);
          setShowFlashcards(false);
          setShowCourses(false);
          setCurrentTopic(null);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
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
      />

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {showJobs ? (
          <JobsPage
            isAdmin={isAdmin}
            jobs={jobs}
            onNewJob={openNewJob}
            onDeleteJob={deleteJob}
          />
        ) : showCourses ? (
          <CoursesPage
            isAdmin={isAdmin}
            courses={courses}
            myEnrollments={myEnrollments}
            user={user}
            onNewCourse={openNewCourse}
            onEnroll={enrollInCourse}
            onOpenManage={openManageCourse}
            onDeleteCourse={() => {
              // Course was deleted, just refresh UI
              setCourses(courses.filter(() => true)); // This triggers re-render
            }}
          />
        ) : showFlashcards ? (
          <FlashcardsPage
            isAdmin={isAdmin}
            flashcardsByTopic={flashcardsByTopic}
            flashcards={flashcards}
            onUploadCSV={handleCSVUpload}
            selectedTopic={selectedFlashcardTopic}
            onSelectTopic={startFlashcardStudy}
            onBackToDashboard={() => setShowFlashcards(false)}
            studySession={studySession}
            currentIndex={currentFlashcardIndex}
            isFlipped={isCardFlipped}
            onFlip={handleFlip}
            onNext={handleNext}
            onPrev={handlePrev}
            onShuffle={handleShuffle}
            onMarkKnown={handleMarkKnown}
            onDeleteFlashcards={deleteFlashcards}
          />
        ) : !currentTopic && !searchQuery ? (
          <>
            <WelcomeBanner />
            {chapters.length > 0 && (
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
            <TopicGrid
              sortedTopics={sortedTopics}
              chapters={chapters}
              masteredIds={masteredIds}
              onSelectTopic={setCurrentTopic}
            />
          </>
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

        {manageCourse && (
          <ManageCourseModal
            course={manageCourse}
            onClose={() => setManageCourse(null)}
          />
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

      <NewJobModal
        isOpen={isNewJobModalOpen}
        onClose={() => setIsNewJobModalOpen(false)}
        onSave={handleSaveNewJob}
      />

      <NewCourseModal
        isOpen={isNewCourseModalOpen}
        onClose={() => setIsNewCourseModalOpen(false)}
        onSave={handleSaveNewCourse}
      />
    </div>
  );
}
