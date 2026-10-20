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
import { listMyCourses } from "../api/teacher";
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

export default function TeacherDashboard() {
  const { user } = useAuth();

  const { data: allCourses, loading: coursesLoading } = useFetch(
    listMyCourses,
    []
  );
  const { data: stats, loading: statsLoading } = useFetch(
    getDashboardStats,
    []
  );

  // Filter to courses this teacher actually teaches
  const myCourses =
    allCourses?.filter((c) => c.teacher && c.teacher.id === user.id) || [];

  const enrollmentChartData = stats?.enrollment_by_course || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-800">
        Welcome, {user.first_name}
      </h1>
      <p className="mt-1 text-slate-600">Teacher dashboard</p>

      {/* Stats cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Courses taught"
          value={statsLoading ? "…" : stats?.courses_taught ?? 0}
          sublabel="Active courses"
          accent="blue"
        />
        <StatCard
          label="Total students"
          value={statsLoading ? "…" : stats?.total_students ?? 0}
          sublabel="Across all your courses"
          accent="purple"
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
          sublabel="Across graded students"
          accent="green"
        />
      </div>

      {/* Enrollment chart */}
      <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">
          Enrollment by course
        </h2>
        <p className="text-sm text-slate-500">
          How many students are enrolled in each of your courses.
        </p>
        <div className="mt-4 h-64">
          {enrollmentChartData.length === 0 ? (
            <p className="text-slate-500 text-sm">No courses yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enrollmentChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="code" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#334155" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* My courses */}
      <div className="mt-8 pb-12">
        <h2 className="text-lg font-semibold text-slate-800">My courses</h2>

        {coursesLoading && (
          <p className="mt-3 text-slate-500">Loading…</p>
        )}

        {!coursesLoading && myCourses.length === 0 && (
          <p className="mt-3 text-slate-500">
            You don't teach any courses yet. An admin can assign you to
            courses from the admin panel.
          </p>
        )}

        {!coursesLoading && myCourses.length > 0 && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            {myCourses.map((c) => (
              <Link
                key={c.id}
                to={`/teacher/courses/${c.id}`}
                className="block bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-slate-500">
                    {c.code}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      c.is_open
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {c.is_open ? "Open" : "Closed"}
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-slate-800">
                  {c.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {c.enrollment_count}{" "}
                  {c.enrollment_count === 1 ? "student" : "students"} ·{" "}
                  {c.credits} credits
                </p>
                <p className="mt-3 text-sm text-slate-700 font-medium">
                  Manage course →
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}