import { useState } from 'react';
import { Plus, Users, CheckCircle2, X } from 'lucide-react';
import ManageCourseModal from './ManageCourseModal';

export default function CoursesPage({
  isAdmin,
  courses,
  myEnrollments,
  onNewCourse,
  onEnroll,
  onOpenManage,
  onDeleteCourse,
}) {
  const [currentManageCourse, setCurrentManageCourse] = useState(null);
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState(null);
  const [enrollmentFormData, setEnrollmentFormData] = useState({
    name: '',
    phone: '',
  });
  const [enrollmentErrors, setEnrollmentErrors] = useState({});
  const [enrollmentInProgress, setEnrollmentInProgress] = useState(null);

  const handleManage = (course) => {
    setCurrentManageCourse(course);
    onOpenManage(course);
  };

  const handleCourseDeleted = () => {
    setCurrentManageCourse(null);
    if (onDeleteCourse) onDeleteCourse();
  };

  const handleEnrollClick = (course) => {
    setEnrollmentInProgress(course);
    setEnrollmentErrors({});
    setEnrollmentFormData({ name: '', phone: '' });
  };

  const validateEnrollmentForm = () => {
    const errors = {};
    if (!enrollmentFormData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!enrollmentFormData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9\s\-+()]+$/.test(enrollmentFormData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    } else if (enrollmentFormData.phone.replace(/\D/g, '').length < 10) {
      errors.phone = 'Phone number must be at least 10 digits';
    }
    return errors;
  };

  const handleEnrollmentSubmit = (e) => {
    e.preventDefault();
    const errors = validateEnrollmentForm();
    if (Object.keys(errors).length > 0) {
      setEnrollmentErrors(errors);
      return;
    }
    // Pass the enrollment data along with course ID
    onEnroll(enrollmentInProgress.id, {
      name: enrollmentFormData.name.trim(),
      phone: enrollmentFormData.phone.trim(),
    });
    setEnrollmentInProgress(null);
    setSelectedCourseForDetail(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-black">Our Courses</h1>
        {isAdmin && (
          <button
            onClick={onNewCourse}
            className="bg-slate-900 text-white px-8 py-4 rounded-3xl font-bold flex items-center gap-3"
          >
            <Plus size={20} /> Create New Course
          </button>
        )}
      </div>
      {courses.length === 0 ? (
        <div className="text-center py-20 text-slate-400">No courses yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const status = myEnrollments[course.id];
            return (
              <div
                key={course.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 hover:shadow-2xl transition-all flex flex-col"
              >
                {/* Course Image */}
                {course.imageUrl && (
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-40 object-cover"
                  />
                )}

                <div className="p-8 flex flex-col h-full">
                  <h3 className="font-black text-xl mb-2">{course.title}</h3>

                  {/* Instructor */}
                  {course.instructor && (
                    <p className="text-sm text-slate-600 mb-3">
                      By{' '}
                      <span className="font-semibold">{course.instructor}</span>
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-2 mb-4 text-xs">
                    {course.level && (
                      <span className="capitalize px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                        {course.level}
                      </span>
                    )}
                    {course.duration && (
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-medium">
                        {course.duration}
                      </span>
                    )}
                    {course.fee && (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                        {course.fee}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {course.description && (
                    <div
                      className="text-slate-600 flex-1 mb-6 prose prose-sm max-w-none line-clamp-3 overflow-hidden text-sm"
                      dangerouslySetInnerHTML={{ __html: course.description }}
                    />
                  )}

                  {/* Action Button */}
                  {isAdmin ? (
                    <button
                      onClick={() => handleManage(course)}
                      className="mt-auto flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-2xl font-bold hover:bg-slate-800"
                    >
                      <Users size={18} /> Manage Students
                    </button>
                  ) : (
                    <div className="mt-auto space-y-3 flex flex-col">
                      <button
                        onClick={() => setSelectedCourseForDetail(course)}
                        className="bg-slate-200 text-slate-900 py-3 rounded-2xl font-bold hover:bg-slate-300 transition-colors"
                      >
                        View Details
                      </button>
                      {status === 'approved' ? (
                        <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 py-3 rounded-2xl font-bold justify-center">
                          <CheckCircle2 size={20} /> Enrolled ✓
                        </div>
                      ) : status === 'pending' ? (
                        <div className="py-3 text-center font-bold text-amber-600">
                          Pending Approval
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEnrollClick(course)}
                          className="bg-indigo-600 text-white py-3 rounded-2xl font-bold hover:bg-indigo-700"
                        >
                          Enroll Now
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {currentManageCourse && (
        <ManageCourseModal
          course={currentManageCourse}
          onClose={() => setCurrentManageCourse(null)}
          onDeleteCourse={handleCourseDeleted}
        />
      )}
      {/* Course Detail Modal */}
      {selectedCourseForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh] my-8">
            {/* Fixed Header */}
            <div className="p-8 border-b flex justify-between items-start shrink-0">
              <h2 className="text-3xl font-black text-slate-900 pr-4">
                {selectedCourseForDetail.title}
              </h2>
              <button
                onClick={() => setSelectedCourseForDetail(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors shrink-0"
              >
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-8">
              {selectedCourseForDetail.imageUrl && (
                <img
                  src={selectedCourseForDetail.imageUrl}
                  alt={selectedCourseForDetail.title}
                  className="w-full h-64 object-cover rounded-2xl mb-6"
                />
              )}

              <div className="space-y-6">
                {selectedCourseForDetail.instructor && (
                  <div>
                    <h3 className="font-bold text-sm text-slate-600 mb-2">
                      INSTRUCTOR
                    </h3>
                    <p className="text-lg text-slate-900">
                      {selectedCourseForDetail.instructor}
                    </p>
                  </div>
                )}

                {/* Metadata Badges */}
                <div className="flex flex-wrap gap-2">
                  {selectedCourseForDetail.level && (
                    <span className="capitalize px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">
                      {selectedCourseForDetail.level}
                    </span>
                  )}
                  {selectedCourseForDetail.duration && (
                    <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full font-medium">
                      {selectedCourseForDetail.duration}
                    </span>
                  )}
                  {selectedCourseForDetail.fee && (
                    <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                      {selectedCourseForDetail.fee}
                    </span>
                  )}
                  {selectedCourseForDetail.maxStudents && (
                    <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-medium">
                      Max {selectedCourseForDetail.maxStudents} students
                    </span>
                  )}
                </div>

                {selectedCourseForDetail.description && (
                  <div>
                    <h3 className="font-bold text-sm text-slate-600 mb-3">
                      DESCRIPTION
                    </h3>
                    <div
                      className="text-slate-700 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: selectedCourseForDetail.description,
                      }}
                    />
                  </div>
                )}

                {selectedCourseForDetail.learningOutcomes && (
                  <div>
                    <h3 className="font-bold text-sm text-slate-600 mb-3">
                      LEARNING OUTCOMES
                    </h3>
                    <div
                      className="text-slate-700 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: selectedCourseForDetail.learningOutcomes,
                      }}
                    />
                  </div>
                )}

                {selectedCourseForDetail.prerequisites && (
                  <div>
                    <h3 className="font-bold text-sm text-slate-600 mb-3">
                      PREREQUISITES
                    </h3>
                    <div
                      className="text-slate-700 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: selectedCourseForDetail.prerequisites,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Footer with Action Buttons */}
            <div className="p-8 border-t bg-white shrink-0">
              {myEnrollments[selectedCourseForDetail.id] === 'approved' ? (
                <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 py-4 rounded-2xl font-bold justify-center">
                  <CheckCircle2 size={20} /> Enrolled ✓
                </div>
              ) : myEnrollments[selectedCourseForDetail.id] === 'pending' ? (
                <div className="py-4 text-center font-bold text-amber-600 bg-amber-50 rounded-2xl">
                  Pending Approval
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEnrollClick(selectedCourseForDetail)}
                    className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-colors"
                  >
                    Enroll Now
                  </button>
                  <button
                    onClick={() => setSelectedCourseForDetail(null)}
                    className="px-6 py-4 bg-slate-200 text-slate-900 rounded-2xl font-bold hover:bg-slate-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Enrollment Form Modal */}
      {enrollmentInProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-8">
            <h2 className="text-2xl font-black text-slate-900 mb-6">
              Complete Your Enrollment
            </h2>
            <p className="text-slate-600 mb-6">
              Please provide your details to enroll in{' '}
              <span className="font-bold">{enrollmentInProgress.title}</span>
            </p>

            <form onSubmit={handleEnrollmentSubmit} className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={enrollmentFormData.name}
                  onChange={(e) => {
                    setEnrollmentFormData({
                      ...enrollmentFormData,
                      name: e.target.value,
                    });
                    if (enrollmentErrors.name) {
                      setEnrollmentErrors({
                        ...enrollmentErrors,
                        name: '',
                      });
                    }
                  }}
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-colors ${
                    enrollmentErrors.name
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-slate-300 focus:border-indigo-500'
                  }`}
                />
                {enrollmentErrors.name && (
                  <p className="text-red-600 text-sm mt-1 font-medium">
                    {enrollmentErrors.name}
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={enrollmentFormData.phone}
                  onChange={(e) => {
                    setEnrollmentFormData({
                      ...enrollmentFormData,
                      phone: e.target.value,
                    });
                    if (enrollmentErrors.phone) {
                      setEnrollmentErrors({
                        ...enrollmentErrors,
                        phone: '',
                      });
                    }
                  }}
                  placeholder="Enter your phone number"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-colors ${
                    enrollmentErrors.phone
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-slate-300 focus:border-indigo-500'
                  }`}
                />
                {enrollmentErrors.phone && (
                  <p className="text-red-600 text-sm mt-1 font-medium">
                    {enrollmentErrors.phone}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-colors"
                >
                  Confirm Enrollment
                </button>
                <button
                  type="button"
                  onClick={() => setEnrollmentInProgress(null)}
                  className="px-4 py-3 bg-slate-200 text-slate-900 rounded-2xl font-bold hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}{' '}
    </div>
  );
}
