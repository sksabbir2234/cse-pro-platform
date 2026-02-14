import React, { useState } from 'react';

export default function NewCourseModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    duration: '',
    fee: '',
    level: 'beginner',
    learningOutcomes: '',
    prerequisites: '',
    imageUrl: '',
    maxStudents: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a course title');
      return;
    }
    onSave({ ...formData, title: formData.title.trim() });
    setFormData({
      title: '',
      description: '',
      instructor: '',
      duration: '',
      fee: '',
      level: 'beginner',
      learningOutcomes: '',
      prerequisites: '',
      imageUrl: '',
      maxStudents: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-lg my-8">
        <h2 className="text-2xl font-bold mb-6 text-slate-900">
          Create New Course
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="border-b pb-4 mb-4">
            <h3 className="font-bold text-lg text-slate-800 mb-3">
              Basic Information
            </h3>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Course Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Advanced Web Development"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Instructor Name
                </label>
                <input
                  type="text"
                  name="instructor"
                  value={formData.instructor}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Level
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Course Details */}
          <div className="border-b pb-4 mb-4">
            <h3 className="font-bold text-lg text-slate-800 mb-3">
              Course Details
            </h3>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Description
              </label>
              <div className="text-xs text-slate-500 mb-2 p-2 bg-blue-50 rounded">
                💡 Supports HTML & images. Paste formatted content here.
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed course description..."
                rows="3"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Duration (e.g., "8 weeks" or "40 hours")
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g., 8 weeks"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Fee/Price (leave empty for free)
                </label>
                <input
                  type="text"
                  name="fee"
                  value={formData.fee}
                  onChange={handleChange}
                  placeholder="e.g., $99 or Free"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Learning & Prerequisites */}
          <div className="border-b pb-4 mb-4">
            <h3 className="font-bold text-lg text-slate-800 mb-3">
              Learning Path
            </h3>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                What Students Will Learn
              </label>
              <textarea
                name="learningOutcomes"
                value={formData.learningOutcomes}
                onChange={handleChange}
                placeholder="e.g., Build responsive websites, Master React, etc."
                rows="2"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Prerequisites (if any)
              </label>
              <textarea
                name="prerequisites"
                value={formData.prerequisites}
                onChange={handleChange}
                placeholder="e.g., Basic HTML & CSS knowledge recommended"
                rows="2"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Additional Settings */}
          <div className="border-b pb-4 mb-4">
            <h3 className="font-bold text-lg text-slate-800 mb-3">
              Additional Settings
            </h3>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Course Image URL
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/course-image.jpg"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Max Students (leave empty for unlimited)
              </label>
              <input
                type="number"
                name="maxStudents"
                value={formData.maxStudents}
                onChange={handleChange}
                placeholder="e.g., 50"
                min="1"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 text-slate-700 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
            >
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
