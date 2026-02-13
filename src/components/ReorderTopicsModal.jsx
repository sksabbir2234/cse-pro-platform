import { X, ArrowUp, ArrowDown } from 'lucide-react';

export default function ReorderTopicsModal({
  isOpen,
  onClose,
  tempTopicOrder,
  setTempTopicOrder,
  onSave,
}) {
  if (!isOpen) return null;

  const moveUp = (index) => {
    if (index === 0) return;
    const newOrder = [...tempTopicOrder];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    setTempTopicOrder(newOrder);
  };

  const moveDown = (index) => {
    if (index === tempTopicOrder.length - 1) return;
    const newOrder = [...tempTopicOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setTempTopicOrder(newOrder);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-black uppercase text-sm tracking-widest">Reorder Topics</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {tempTopicOrder.map((topic, index) => (
            <div
              key={topic}
              className="flex items-center justify-between bg-slate-50 px-6 py-4 rounded-2xl border"
            >
              <span className="font-bold text-slate-800">{topic}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="p-2 hover:bg-white rounded-xl disabled:opacity-30"
                >
                  <ArrowUp size={18} />
                </button>
                <button
                  onClick={() => moveDown(index)}
                  disabled={index === tempTopicOrder.length - 1}
                  className="p-2 hover:bg-white rounded-xl disabled:opacity-30"
                >
                  <ArrowDown size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t flex gap-3">
          <button
            onClick={onSave}
            className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black"
          >
            Save New Order
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl font-bold border"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}