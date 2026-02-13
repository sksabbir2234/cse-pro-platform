import { useRef, useEffect } from 'react';
import { X, Lock, Trash2 } from 'lucide-react';

export default function EditModal({
  isOpen,
  onClose,
  editData,
  setEditData,
  onSave,
  onDelete,
}) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (isOpen && editorRef.current) {
      editorRef.current.innerHTML = editData.body || '';
    }
  }, [isOpen, editData.body]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto flex items-center justify-center">
      <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-black uppercase text-sm tracking-widest flex items-center gap-2">
            <Lock size={14} /> Lesson Editor
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const bodyContent = editorRef.current?.innerHTML || '';
            onSave({ ...editData, body: bodyContent }); // pass body back
          }}
          className="p-8 space-y-4"
        >
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
                onClick={onDelete}
                className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
              >
                <Trash2 />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
