import { useEffect, useState } from "react";
import { listCourses } from "../api/courses";
import CourseCard from "../components/CourseCard";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  // Debounce the search input to avoid a request per keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    listCourses({ open: true, search: debounced || undefined })
      .then((data) => {
        if (!cancelled) setCourses(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debounced]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-800">Courses</h1>
      <p className="mt-2 text-slate-600">
        Browse open courses and click one to see details.
      </p>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search courses by code or title…"
        className="mt-6 w-full md:w-96 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
      />

      {loading && <p className="mt-6 text-slate-500">Loading…</p>}
      {error && <p className="mt-6 text-red-600">Failed to load courses.</p>}

      {!loading && !error && courses.length === 0 && (
        <p className="mt-6 text-slate-500">
          No courses match your search.
        </p>
      )}

      {!loading && !error && courses.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}