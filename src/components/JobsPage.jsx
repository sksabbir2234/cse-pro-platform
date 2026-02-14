import { useState } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, Calendar } from 'lucide-react';

export default function JobsPage({ isAdmin, jobs, onNewJob, onEditJob, onDeleteJob }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-black">Job Circulars</h1>
        {isAdmin && (
          <button onClick={onNewJob} className="bg-slate-900 text-white px-8 py-4 rounded-3xl font-bold flex items-center gap-3">
            <Plus size={20} /> Post New Job
          </button>
        )}
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-20 text-slate-400">No jobs posted yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs
            .sort((a, b) => new Date(b.deadline) - new Date(a.deadline))
            .map((job) => (
              <div key={job.id} className="bg-white rounded-3xl p-8 border border-slate-200 hover:shadow-2xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-black text-2xl">{job.designation}</h3>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button onClick={() => onEditJob(job)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit2 size={18} /></button>
                      <button onClick={() => onDeleteJob(job.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={18} /></button>
                    </div>
                  )}
                </div>

                {job.company && <p className="text-indigo-600 font-bold mb-4">{job.company}</p>}

                <div className="flex items-center gap-6 text-sm text-slate-500 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} /> Start: {job.startDate || 'Immediate'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} /> Deadline: {job.deadline}
                  </div>
                </div>

                <p className="text-slate-600 leading-relaxed mb-8 line-clamp-4">{job.description}</p>

                <a
                  href={job.link}
                  target="_blank"
                  className="block w-full bg-indigo-600 text-white text-center py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  Job Link <ExternalLink size={18} />
                </a>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}