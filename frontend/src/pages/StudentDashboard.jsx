import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { useAuth } from "../context/AuthContext";
import { useFetch } from "../hooks/useFetch";
import { listEnrollments } from "../api/enrollments";
import { listGrades } from "../api/grades";
import { listAnnouncements } from "../api/announcements";
import { getDashboardStats } from "../api/stats";

function StatCard({ label, value, sublabel, accent = "slate" }) {
  const accentClass = {
    slate: "border-slate-200",
    green: "border-green-200",
    blue: "border-blue-200",
    purple: "border-purple-200",
  }[accent];

  return (
    <div className={`bg-white p-6 rounded-xl border ${accentClass} shadow-sm`}>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-slate-500">{sublabel}</p>}
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();

  const { data: stats, loading: statsLoading } = useFetch(getDashboardStats, []);
  const { data: enrollments, loading: enrollmentsLoading } = useFetch(
    () => listEnrollments(),
    []
  );
  const { data: grades, loading: gradesLoading } = useFetch(
    () => listGrades(),
    []
  );
  const { data: announcements } = useFetch(
    () => listAnnouncements(),
    []
  );

  const letterData = stats
    ? Object.entries(stats.letter_breakdown || {}).map(([letter, count]) => ({
        letter,
        count,
      }))
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-800">
        Welcome, {user.first_name}
      </h1>
      <p className="mt-1 text-slate-600">Student dashboard</p>

      {/* Stats cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Enrolled courses"
          value={statsLoading ? "…" : stats?.enrolled_courses ?? 0}
          sublabel="This term"
          accent="blue"
        />
        <StatCard
          label="Average score"
          value={
            statsLoading
              ? "…"
              : stats?.average_score != null
              ? `${stats.average_score}`
              : "—"
          }
          sublabel="Across all graded courses"
          accent="green"
        />
        <StatCard
          label="Graded courses"
          value={
            statsLoading
              ? "…"
              : stats
              ? Object.values(stats.letter_breakdown || {}).reduce(
                  (a, b) => a + b,
                  0
                )
              : 0
          }
          sublabel="Courses with a score"
          accent="purple"
        />
      </div>

      {/* Chart */}
      <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">
          Grade distribution
        </h2>
        <p className="text-sm text-slate-500">
          How your grades spread across letter bands.
        </p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={letterData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="letter" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#334155" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* My courses */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-800">My courses</h2>
        {enrollmentsLoading && (
          <p className="mt-3 text-slate-500">Loading…</p>
        )}
        {!enrollmentsLoading && enrollments && enrollments.length === 0 && (
          <p className="mt-3 text-slate-500">
            You're not enrolled in any courses yet.{" "}
            <Link to="/courses" className="text-slate-800 underline">
              Browse courses →
            </Link>
          </p>
        )}
        {!enrollmentsLoading && enrollments && enrollments.length > 0 && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrollments.map((e) => (
              <Link
                key={e.id}
                to={`/courses/${e.course.id}`}
                className="block bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-slate-500">
                    {e.course.code}
                  </span>
                  <span className="text-xs text-slate-500">
                    {e.course.credits} credits
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-slate-800">
                  {e.course.title}
                </h3>
                {e.course.teacher && (
                  <p className="mt-1 text-sm text-slate-500">
                    {e.course.teacher.first_name} {e.course.teacher.last_name}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* My grades */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-800">My grades</h2>
        {gradesLoading && <p className="mt-3 text-slate-500">Loading…</p>}
        {!gradesLoading && grades && grades.length === 0 && (
          <p className="mt-3 text-slate-500">No grades yet.</p>
        )}
        {!gradesLoading && grades && grades.length > 0 && (
          <div className="mt-3 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Course</th>
                  <th className="text-left px-4 py-3 font-medium">Score</th>
                  <th className="text-left px-4 py-3 font-medium">Letter</th>
                  <th className="text-left px-4 py-3 font-medium">Graded</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g) => (
                  <tr key={g.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-mono text-slate-700">
                      {g.course_code}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{g.score}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-1 text-xs rounded bg-slate-100 text-slate-700">
                        {g.letter}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(g.graded_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Announcements */}
      <div className="mt-8 pb-12">
        <h2 className="text-lg font-semibold text-slate-800">Announcements</h2>
        {announcements && announcements.length === 0 && (
          <p className="mt-3 text-slate-500">No announcements yet.</p>
        )}
        {announcements && announcements.length > 0 && (
          <ul className="mt-3 space-y-3">
            {announcements.slice(0, 5).map((a) => (
              <li
                key={a.id}
                className="bg-white p-5 rounded-xl border border-slate-200"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">{a.title}</h3>
                  <span className="text-xs text-slate-500">
                    {a.course_code || "Site-wide"} ·{" "}
                    {new Date(a.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{a.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}