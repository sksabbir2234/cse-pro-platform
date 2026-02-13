import { BookOpen } from 'lucide-react';

export default function TopicGrid({ sortedTopics, chapters, masteredIds, onSelectTopic }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {sortedTopics.map((topic) => {
        const tChapters = chapters.filter((c) => c.topic === topic);
        const prog = tChapters.length
          ? Math.round(
              (tChapters.filter((c) => masteredIds.includes(c.id)).length / tChapters.length) * 100
            )
          : 0;

        return (
          <div
            key={topic}
            onClick={() => onSelectTopic(topic)}
            className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm cursor-pointer hover:shadow-xl transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <BookOpen size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-1">{topic}</h3>
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
  );
}