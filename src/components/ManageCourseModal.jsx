import { useState, useEffect } from 'react';
import { X, Check, XCircle, Trash2 } from 'lucide-react';
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { db, appId } from '../config'; // adjust path if needed

export default function ManageCourseModal({ course, onClose, onDeleteCourse }) {
  const [enrollments, setEnrollments] = useState([]);
  const [whatsappValues, setWhatsappValues] = useState({});

  useEffect(() => {
    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'enrollments'),
      where('courseId', '==', course.id),
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setEnrollments(list);

      const map = {};
      list.forEach((e) => {
        if (e.whatsapp) map[e.id] = e.whatsapp;
      });
      setWhatsappValues(map);
    });

    return unsub;
  }, [course.id]);

  const approve = async (id) => {
    await updateDoc(
      doc(db, 'artifacts', appId, 'public', 'data', 'enrollments', id),
      { status: 'approved' },
    );
  };

  const reject = async (id) => {
    await updateDoc(
      doc(db, 'artifacts', appId, 'public', 'data', 'enrollments', id),
      { status: 'rejected' },
    );
  };

  const saveWhatsapp = async (enrollmentId) => {
    const whatsapp = whatsappValues[enrollmentId] || '';
    await updateDoc(
      doc(
        db,
        'artifacts',
        appId,
        'public',
        'data',
        'enrollments',
        enrollmentId,
      ),
      { whatsapp },
    );
    alert('WhatsApp saved!');
  };

  const handleDelete = async () => {
    if (
      confirm(
        'Are you sure you want to delete this course? This action cannot be undone.',
      )
    ) {
      try {
        await deleteDoc(
          doc(db, 'artifacts', appId, 'public', 'data', 'courses', course.id),
        );
        if (onDeleteCourse) onDeleteCourse();
        onClose();
        alert('Course deleted successfully!');
      } catch (error) {
        alert('Error deleting course: ' + error.message);
      }
    }
  };

  const pending = enrollments.filter((e) => e.status === 'pending');
  const approved = enrollments.filter((e) => e.status === 'approved');

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden">
        <div className="p-6 border-b flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-black text-xl">Manage → {course.title}</h3>
            {course.instructor && (
              <p className="text-sm text-slate-600 mt-1">
                By <span className="font-semibold">{course.instructor}</span>
              </p>
            )}
            {course.description && (
              <div
                className="text-sm text-slate-600 mt-2 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />
            )}
            {/* Course Metadata */}
            <div className="flex flex-wrap gap-4 mt-3 text-sm">
              {course.level && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Level:</span>
                  <span className="capitalize px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    {course.level}
                  </span>
                </div>
              )}
              {course.duration && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Duration:</span>
                  <span className="font-medium">{course.duration}</span>
                </div>
              )}
              {course.fee && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Fee:</span>
                  <span className="font-medium text-emerald-600">
                    {course.fee}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              title="Delete Course"
            >
              <Trash2 size={24} />
            </button>
            <button onClick={onClose}>
              <X size={28} />
            </button>
          </div>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {/* Pending */}
          <h4 className="font-bold text-lg mb-4 text-amber-600">
            Pending Requests ({pending.length})
          </h4>
          {pending.length === 0 ? (
            <p className="text-slate-400 mb-10">No pending requests</p>
          ) : (
            pending.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between bg-amber-50 p-6 rounded-2xl mb-4"
              >
                <div>
                  <div className="font-bold">
                    {e.name || 'No name provided'}
                  </div>
                  <div className="text-sm text-slate-600">
                    📱 {e.phone || 'No phone provided'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    UID: {e.uid.slice(-8)}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => approve(e.id)}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-xl flex items-center gap-2"
                  >
                    <Check size={18} /> Approve
                  </button>
                  <button
                    onClick={() => reject(e.id)}
                    className="bg-red-100 text-red-600 px-6 py-2 rounded-xl flex items-center gap-2"
                  >
                    <XCircle size={18} /> Reject
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Approved */}
          <h4 className="font-bold text-lg mb-4 mt-12 text-emerald-600">
            Approved Students ({approved.length})
          </h4>
          {approved.length === 0 ? (
            <p className="text-slate-400">No approved students yet</p>
          ) : (
            approved.map((e) => (
              <div
                key={e.id}
                className="bg-white border border-slate-200 p-6 rounded-2xl mb-4 flex items-center gap-6"
              >
                <div className="flex-1">
                  <div className="font-bold">
                    {e.name || 'No name provided'}
                  </div>
                  <div className="text-sm text-slate-600">
                    📱 {e.phone || 'No phone provided'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    UID: {e.uid.slice(-8)}
                  </div>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="WhatsApp number or group link"
                    value={whatsappValues[e.id] || ''}
                    onChange={(ev) =>
                      setWhatsappValues({
                        ...whatsappValues,
                        [e.id]: ev.target.value,
                      })
                    }
                    className="w-full border border-slate-300 rounded-2xl px-5 py-3 text-sm"
                  />
                </div>
                <button
                  onClick={() => saveWhatsapp(e.id)}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold"
                >
                  Save
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
