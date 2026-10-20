import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listCourses } from "../api/courses";
import { listAnnouncements } from "../api/announcements";
import { useFetch } from "../hooks/useFetch";
import CourseCard from "../components/CourseCard";

export default function HomePage() {
  const { user } = useAuth();

  const {
    data: courses,
    loading: coursesLoading,
    error: coursesError,
  } = useFetch(() => listCourses({ open: true }), []);

  const {
    data: announcements,
    loading: announcementsLoading,
  } = useFetch(() => listAnnouncements({ scope: "site" }), []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Learn with purpose.
          </h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl">
            A modern school platform for students, teachers, and administrators.
            Browse courses, track grades, and stay connected.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/courses"
              className="px-5 py-3 bg-white text-slate-900 font-medium rounded-lg hover:bg-slate-100"
            >
              Browse courses
            </Link>
            {!user && (
              <Link
                to="/register"
                className="px-5 py-3 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600"
              >
                Create account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Featured courses */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Featured courses</h2>
          <Link to="/courses" className="text-sm text-slate-600 hover:underline">
            View all →
          </Link>
        </div>

        {coursesLoading && <p className="mt-4 text-slate-500">Loading courses…</p>}
        {coursesError && (
          <p className="mt-4 text-red-600">Failed to load courses.</p>
        )}
        {courses && courses.length === 0 && (
          <p className="mt-4 text-slate-500">No courses yet.</p>
        )}
        {courses && courses.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.slice(0, 3).map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </section>

      {/* Latest news */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-slate-800">Latest news</h2>

        {announcementsLoading && (
          <p className="mt-4 text-slate-500">Loading news…</p>
        )}
        {announcements && announcements.length === 0 && (
          <p className="mt-4 text-slate-500">No announcements yet.</p>
        )}
        {announcements && announcements.length > 0 && (
          <ul className="mt-4 space-y-3">
            {announcements.slice(0, 3).map((a) => (
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
        )}
      </section>
    </div>
  );
}