import {
  FileText,
  PenLine,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Settings2,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

export default function LessonViewer({
  activeChapter,
  activeTab,
  onTabChange,
  seconds,
  isActive,
  formatTime,
  onToggleTimer,
  onResetTimer,
  isAdmin,
  onEditLesson,
  onToggleMastery,
  currentNote,
  onNotesChange,
  masteredIds, // ← this new prop
}) {
  if (!activeChapter) {
    return (
      <div className="h-full bg-white rounded-[40px] flex flex-col items-center justify-center text-center py-40 border-2 border-dashed border-slate-200">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
          <BookOpen size={40} />
        </div>
        <h3 className="text-xl font-black text-slate-400">
          Select a lesson to begin studying
        </h3>
      </div>
    );
  }

  const isMastered = masteredIds.includes(activeChapter.id);

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 w-fit">
            <button
              onClick={() => onTabChange('content')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'content'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <FileText size={14} /> Reading
            </button>
            <button
              onClick={() => onTabChange('notes')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'notes'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <PenLine size={14} /> My Notes
            </button>
          </div>

          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Timer size={16} className="text-indigo-600" />
              <span className="font-mono font-black text-lg">
                {formatTime(seconds)}
              </span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={onToggleTimer}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
              >
                {isActive ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button
                onClick={onResetTimer}
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
                      onClick={onEditLesson}
                      className="p-3 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-900 hover:text-white transition-all"
                    >
                      <Settings2 size={20} />
                    </button>
                  )}
                  <button
                    onClick={onToggleMastery}
                    className={`p-3 px-6 rounded-xl font-black text-sm transition-all ${
                      isMastered
                        ? 'bg-emerald-500 text-white'
                        : 'bg-indigo-600 text-white shadow-lg active:scale-95'
                    }`}
                  >
                    {isMastered ? 'Lesson Mastered' : 'Mark as Done'}
                  </button>
                </div>
              </div>

              <div
                className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-lg"
                dangerouslySetInnerHTML={{ __html: activeChapter.body }}
              ></div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="flex flex-col h-full animate-in fade-in duration-300">
              <div className="mb-6">
                <h2 className="text-2xl font-black flex items-center gap-2">
                  <PenLine className="text-amber-500" /> My Study Notes
                </h2>
                <p className="text-slate-500 text-sm font-medium">
                  Personal notes for this lesson (Private to you)
                </p>
              </div>
              <textarea
                className="flex-1 w-full bg-amber-50/30 border-2 border-dashed border-amber-200 rounded-[32px] p-8 font-medium text-slate-700 outline-none focus:border-amber-400 transition-all resize-none min-h-[400px]"
                placeholder="Start writing your key takeaways here..."
                value={currentNote}
                onChange={(e) =>
                  onNotesChange(activeChapter.id, e.target.value)
                }
              />
              <div className="mt-4 flex items-center gap-2 text-amber-600 font-bold text-[10px] uppercase tracking-widest">
                <CheckCircle2 size={14} /> Auto-saved to your profile
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
