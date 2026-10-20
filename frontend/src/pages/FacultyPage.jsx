import { api } from "../api/client";
import { useFetch } from "../hooks/useFetch";

async function listTeachers() {
  // No dedicated endpoint yet — we derive from courses the teacher teaches.
  const res = await api.get("/courses/");
  const courses = res.data;
  const map = new Map();
  for (const c of courses) {
    if (c.teacher) {
      map.set(c.teacher.id, c.teacher);
    }
  }
  return Array.from(map.values());
}

export default function FacultyPage() {
  const { data: teachers, loading, error } = useFetch(listTeachers, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-800">Faculty</h1>
      <p className="mt-2 text-slate-600">
        Meet the instructors leading our courses.
      </p>

      {loading && <p className="mt-6 text-slate-500">Loading…</p>}
      {error && <p className="mt-6 text-red-600">Failed to load faculty.</p>}

      {!loading && !error && teachers && teachers.length === 0 && (
        <p className="mt-6 text-slate-500">No faculty listed yet.</p>
      )}

      {!loading && !error && teachers && teachers.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {teachers.map((t) => (
            <div
              key={t.id}
              className="bg-white p-6 rounded-xl border border-slate-200"
            >
              <h2 className="text-lg font-semibold text-slate-800">
                {t.first_name} {t.last_name}
              </h2>
              <p className="text-sm text-slate-500 mt-1">{t.email}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}