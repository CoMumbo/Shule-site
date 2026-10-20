import { listAnnouncements } from "../api/announcements";
import { useFetch } from "../hooks/useFetch";

export default function AnnouncementsPage() {
  const { data: announcements, loading, error } = useFetch(
    () => listAnnouncements(),
    []
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-800">News & Announcements</h1>
      <p className="mt-2 text-slate-600">
        Updates from the school and from course instructors.
      </p>

      {loading && <p className="mt-6 text-slate-500">Loading…</p>}
      {error && <p className="mt-6 text-red-600">Failed to load announcements.</p>}

      {!loading && !error && announcements && announcements.length === 0 && (
        <p className="mt-6 text-slate-500">No announcements yet.</p>
      )}

      {!loading && !error && announcements && announcements.length > 0 && (
        <ul className="mt-6 space-y-4">
          {announcements.map((a) => (
            <li
              key={a.id}
              className="bg-white p-6 rounded-xl border border-slate-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    {a.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {a.author_name || "School"}
                    {a.course_code ? ` · ${a.course_code}` : " · Site-wide"}
                  </p>
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {new Date(a.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-3 text-slate-700 whitespace-pre-line">{a.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}