import {
  LayoutGrid,
  Plus,
  Lock,
  Search,
  X,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';

export default function Header({
  isAdmin,
  currentTopic,
  showFlashcards,
  onReset,
  onFlashcardsClick,
  searchQuery,
  onSearchChange,
  onNewLesson,
  onReorderTopics,
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile Back Button */}
          {(currentTopic || showFlashcards) && (
            <button
              onClick={onReset}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 active:scale-95 transition-transform"
            >
              <ArrowLeft size={26} />
            </button>
          )}

          <div
            className="flex items-center gap-6 cursor-pointer"
            onClick={onReset}
          >
            <h1 className="font-black text-xl tracking-tighter">
              CSE <span className="text-indigo-600">PRO</span>
            </h1>
            {isAdmin && (
              <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest flex items-center gap-1">
                <Lock size={10} /> Owner
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative w-48 sm:w-60 md:w-72">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-100 pl-11 pr-10 py-3 rounded-2xl text-sm focus:outline-none focus:bg-white border border-transparent focus:border-indigo-200"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {isAdmin && (
            <>
              <button
                onClick={onReorderTopics}
                className="hidden md:block px-4 py-2.5 text-xs font-bold border border-slate-300 rounded-xl hover:bg-slate-50"
              >
                Reorder
              </button>
              <button
                onClick={onNewLesson}
                className="bg-slate-900 text-white p-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <Plus size={16} /> New
              </button>
            </>
          )}
        </div>
      </div>

      {/* ONLY Dashboard + Flashcards tabs */}
      <div
        className={`max-w-[1600px] mx-auto px-6 overflow-x-auto no-scrollbar flex items-center gap-2 py-3 border-t border-slate-50 ${currentTopic ? 'hidden lg:flex' : 'flex'}`}
      >
        <button
          onClick={onReset}
          className={`px-6 py-3 rounded-full text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 ${
            !currentTopic && !showFlashcards
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          <LayoutGrid size={16} /> Dashboard
        </button>

        <button
          onClick={onFlashcardsClick}
          className={`px-6 py-3 rounded-full text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 ${
            showFlashcards
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          <BookOpen size={16} /> Flashcards
        </button>
      </div>
    </header>
  );
}
