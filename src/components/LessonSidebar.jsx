import { CheckCircle2, ArrowUp, ArrowDown } from 'lucide-react';

export default function LessonSidebar({
  chapters,
  currentTopic,
  activeChapterId,
  masteredIds,
  isAdmin,
  onSelectLesson,
  onMoveLessonUp,
  onMoveLessonDown,
}) {
  const topicLessons = chapters
    .filter((c) => c.topic === currentTopic)
    .sort(
      (a, b) =>
        (a.order ?? 0) - (b.order ?? 0) || a.title.localeCompare(b.title),
    );

  return (
    <aside className="w-full lg:w-72 shrink-0">
      <div className="sticky top-36 space-y-2">
        <h2 className="text-xl font-black mb-4 px-2">Lessons</h2>
        {topicLessons.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelectLesson(c.id)}
            className={`group w-full text-left p-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-between cursor-pointer ${
              activeChapterId === c.id
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white border border-slate-100 hover:bg-slate-50 text-slate-600'
            }`}
          >
            <span className="truncate">{c.title}</span>

            <div className="flex items-center gap-3">
              {masteredIds.includes(c.id) ? (
                <CheckCircle2
                  size={16}
                  className={
                    activeChapterId === c.id ? 'text-white' : 'text-emerald-500'
                  }
                />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-slate-200 group-hover:border-indigo-400" />
              )}

              {isAdmin && (
                <div className="flex gap-px opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveLessonUp(c.id);
                    }}
                    className="p-1 hover:bg-white/30 rounded-lg"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveLessonDown(c.id);
                    }}
                    className="p-1 hover:bg-white/30 rounded-lg"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
