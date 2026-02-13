import { useState } from 'react';
import {
  Upload,
  BookOpen,
  ArrowLeft,
  Shuffle,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

export default function FlashcardsPage({
  isAdmin,
  flashcardsByTopic,
  flashcards,
  onUploadCSV,
  selectedTopic,
  onSelectTopic,
  onDeleteFlashcards,
  studySession,
  currentIndex,
  isFlipped,
  onFlip,
  onNext,
  onPrev,
  onShuffle,
  onMarkKnown,
}) {
  const [showManage, setShowManage] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const topics = Object.keys(flashcardsByTopic).sort();

  // ====================== DELETE MODE HELPERS ======================
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    if (selectedIds.length === flashcards.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(flashcards.map((f) => f.id));
    }
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    await onDeleteFlashcards(selectedIds);
    setSelectedIds([]);
    setShowManage(false);
  };

  // ====================== STUDY MODE (unchanged) ======================
  if (selectedTopic) {
    const total = studySession.length;
    const currentCard = studySession[currentIndex];

    if (currentIndex >= total) {
      return (
        <div className="max-w-lg mx-auto text-center py-20">
          <div className="mx-auto w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-8">
            <CheckCircle2 size={48} className="text-emerald-600" />
          </div>
          <h2 className="text-4xl font-black mb-4">Well Done! 🎉</h2>
          <p className="text-xl text-slate-600 mb-10">
            You reviewed all {total} flashcards
          </p>
          <div className="flex flex-col gap-4">
            <button
              onClick={onShuffle}
              className="bg-indigo-600 text-white py-5 rounded-3xl font-bold text-lg flex items-center justify-center gap-3"
            >
              <Shuffle size={24} /> Study Again (Shuffle)
            </button>
            <button
              onClick={() => onSelectTopic(null)}
              className="py-5 border-2 border-slate-300 rounded-3xl font-bold text-lg"
            >
              Back to Topics
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => onSelectTopic(null)}
          className="flex items-center gap-2 text-slate-500 mb-8 hover:text-slate-900"
        >
          <ArrowLeft size={20} /> Back to Topics
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white rounded-3xl px-6 py-2 border">
            <span className="font-mono font-bold text-indigo-600">
              {currentIndex + 1}
            </span>
            <span className="text-slate-400">/</span>
            <span className="font-mono font-bold">{total}</span>
          </div>
        </div>

        <div
          className="relative w-full max-w-lg h-96 mx-auto cursor-pointer"
          style={{ perspective: '1200px' }}
          onClick={onFlip}
        >
          <div
            className={`absolute inset-0 transition-all duration-700 [transform-style:preserve-3d] ${
              isFlipped ? '[transform:rotateY(180deg)]' : ''
            }`}
          >
            <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl border border-slate-200 flex items-center justify-center p-10 backface-hidden">
              <div className="text-center">
                <div className="text-xs uppercase tracking-widest text-slate-400 mb-6">
                  QUESTION
                </div>
                <p className="text-3xl font-bold leading-tight text-slate-800">
                  {currentCard.front}
                </p>
              </div>
            </div>
            <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl border border-emerald-200 flex items-center justify-center p-10 backface-hidden [transform:rotateY(180deg)]">
              <div className="text-center">
                <div className="text-xs uppercase tracking-widest text-emerald-600 mb-6">
                  ANSWER
                </div>
                <p className="text-3xl font-bold leading-tight text-slate-800">
                  {currentCard.back}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-12">
          <button
            onClick={onPrev}
            className="flex-1 py-4 border-2 rounded-3xl font-bold"
          >
            Previous
          </button>
          <button
            onClick={onNext}
            className="flex-1 py-4 border-2 rounded-3xl font-bold"
          >
            Next
          </button>
          <button
            onClick={onMarkKnown}
            className="flex-1 bg-emerald-600 text-white py-4 rounded-3xl font-bold"
          >
            I Know This
          </button>
        </div>

        <button
          onClick={onShuffle}
          className="mt-6 w-full py-4 text-indigo-600 font-bold flex items-center justify-center gap-2"
        >
          <Shuffle size={20} /> Shuffle Cards
        </button>
      </div>
    );
  }

  // ====================== MANAGE / DELETE MODE ======================
  if (showManage) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black">Manage Flashcards</h1>
          <button
            onClick={() => {
              setShowManage(false);
              setSelectedIds([]);
            }}
            className="text-slate-500 hover:text-slate-900 font-bold"
          >
            Exit
          </button>
        </div>

        <div className="flex gap-4 mb-8 flex-wrap">
          <button
            onClick={selectAll}
            className="px-6 py-3 border border-slate-300 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50"
          >
            {selectedIds.length === flashcards.length
              ? 'Deselect All'
              : 'Select All'}
          </button>
          <button
            onClick={deleteSelected}
            disabled={selectedIds.length === 0}
            className="px-6 py-3 bg-red-600 text-white rounded-2xl font-bold flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 size={18} /> Delete Selected ({selectedIds.length})
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
          {flashcards.length === 0 ? (
            <p className="text-center text-slate-400 py-20">
              No flashcards yet
            </p>
          ) : (
            flashcards
              .sort(
                (a, b) =>
                  a.topic.localeCompare(b.topic) ||
                  a.front.localeCompare(b.front),
              )
              .map((card) => (
                <div
                  key={card.id}
                  className="flex items-start gap-4 bg-white p-6 rounded-3xl border border-slate-200 hover:border-red-200 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(card.id)}
                    onChange={() => toggleSelect(card.id)}
                    className="mt-1.5 w-5 h-5 accent-red-600 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-indigo-600 mb-1.5">
                      {card.topic}
                    </div>
                    <div className="font-medium text-slate-800 line-clamp-2 mb-1">
                      {card.front}
                    </div>
                    <div className="text-sm text-slate-500 line-clamp-2">
                      {card.back}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    );
  }

  // ====================== NORMAL TOPIC GRID ======================
  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-black">Flashcards</h1>
        <div className="flex gap-3">
          {isAdmin && (
            <>
              <label className="bg-slate-900 text-white px-8 py-4 rounded-3xl font-bold flex items-center gap-3 cursor-pointer hover:bg-slate-800 transition-all">
                <Upload size={20} />
                Upload CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={onUploadCSV}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setShowManage(true)}
                className="bg-red-50 text-red-600 px-8 py-4 rounded-3xl font-bold flex items-center gap-3 hover:bg-red-100 transition-all"
              >
                <Trash2 size={20} /> Manage / Delete
              </button>
            </>
          )}
        </div>
      </div>

      {topics.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          No flashcards yet.
          <br />
          Upload a CSV to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => {
            const count = flashcardsByTopic[topic].length;
            return (
              <div
                key={topic}
                onClick={() => onSelectTopic(topic)}
                className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-indigo-300 hover:shadow-2xl cursor-pointer transition-all group"
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <BookOpen size={32} />
                </div>
                <h3 className="text-2xl font-black mb-2">{topic}</h3>
                <p className="text-slate-500 font-medium">{count} cards</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
