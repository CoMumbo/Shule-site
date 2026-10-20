import { Link, useParams } from "react-router-dom";
import { getCourse } from "../api/courses";
import { listAnnouncements } from "../api/announcements";
import { listAssignments } from "../api/assignments";
import { useFetch } from "../hooks/useFetch";
import { useAuth } from "../context/AuthContext";
import EnrollButton from "../components/EnrollButton";
import AssignmentCard from "../components/AssignmentCard";

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const { data: course, loading, error } = useFetch(() => getCourse(id), [id]);
  const { data: announcements } = useFetch(
    () => listAnnouncements({ course: id }),
    [id]
  );
  const { data: assignments } = useFetch(() => listAssignments(), []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-slate-500">
        Loading…
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-red-600">Course not found.</p>
        <Link
          to="/courses"
          className="mt-4 inline-block text-slate-700 underline"
        >
          ← Back to courses
        </Link>
      </div>
    );
  }

  const courseAssignments = (assignments || []).filter(
    (a) => a.course === course.id
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link to="/courses" className="text-sm text-slate-600 hover:underline">
        ← Back to courses
      </Link>

      <div className="mt-4 bg-white p-8 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between">
          <span className="font-mono text-slate-500">{course.code}</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
            {course.credits} credits
          </span>
        </div>

        <h1 className="mt-2 text-3xl font-bold text-slate-800">
          {course.title}
        </h1>

        {course.teacher && (
          <p className="mt-2 text-slate-600">
            Taught by {course.teacher.first_name} {course.teacher.last_name}
          </p>
        )}

        {course.description && (
          <p className="mt-6 text-slate-700 whitespace-pre-line">
            {course.description}
          </p>
        )}

        <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between gap-4 flex-wrap">
          <span className="text-sm text-slate-500">
            {course.enrollment_count}{" "}
            {course.enrollment_count === 1 ? "student" : "students"} enrolled
          </span>
          <div className="flex items-center gap-3">
            <span
              className={`text-sm px-3 py-1 rounded-full ${
                course.is_open
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {course.is_open ? "Open for enrollment" : "Closed"}
            </span>
            <EnrollButton courseId={course.id} />
          </div>
        </div>
      </div>

      {user?.role === "STUDENT" && courseAssignments.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-800">Assignments</h2>
          <div className="mt-3 space-y-3">
            {courseAssignments.map((a) => (
              <AssignmentCard key={a.id} assignment={a} />
            ))}
          </div>
        </div>
      )}

      {announcements && announcements.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-800">
            Course announcements
          </h2>
          <ul className="mt-3 space-y-3">
            {announcements.map((a) => (
              <li
                key={a.id}
                className="bg-white p-5 rounded-xl border border-slate-200"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">{a.title}</h3>
                  <span className="text-xs text-slate-500">
                    {new Date(a.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{a.body}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}