import { BookOpen } from 'lucide-react';

export default function SearchResults({ results, searchQuery, onSelect }) {
  if (results.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400">
        No lessons found for “{searchQuery}”
      </div>
    );
  }

  // Group by topic
  const grouped = results.reduce((acc, c) => {
    if (!acc[c.topic]) acc[c.topic] = [];
    acc[c.topic].push(c);
    return acc;
  }, {});

  return (
    <div>
      <h2 className="text-3xl font-black mb-8">
        Results for <span className="text-indigo-600">“{searchQuery}”</span>
      </h2>
      {Object.entries(grouped).map(([topic, lessons]) => (
        <div key={topic} className="mb-12">
          <h3 className="text-xl font-black mb-4 flex items-center gap-3">
            <BookOpen className="text-indigo-600" /> {topic}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => onSelect(lesson.id, topic)}
                className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl cursor-pointer transition-all"
              >
                <h4 className="font-bold text-xl mb-2">{lesson.title}</h4>
                <p className="text-sm text-slate-500">in {topic}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}