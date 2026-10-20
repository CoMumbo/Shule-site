import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { useAuth } from "../context/AuthContext";
import { useFetch } from "../hooks/useFetch";
import { getDashboardStats } from "../api/stats";
import { listCourses } from "../api/courses";
import { listAnnouncements } from "../api/announcements";
import {
  listUsers,
  createUser,
  createCourse,
  deleteCourse,
  createSiteAnnouncement,
  deleteAnnouncement,
} from "../api/admin";

const ROLE_COLORS = {
  ADMIN: "#1e293b",
  TEACHER: "#3b82f6",
  STUDENT: "#10b981",
};

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

function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
      {message}
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: stats, loading: statsLoading } = useFetch(
    getDashboardStats,
    []
  );
  const { data: users, loading: usersLoading } = useFetch(listUsers, []);
  const { data: courses, loading: coursesLoading } = useFetch(
    () => listCourses(),
    []
  );
  const { data: announcements, loading: announcementsLoading } = useFetch(
    () => listAnnouncements(),
    []
  );

  const [usersState, setUsersState] = useState([]);
  const [coursesState, setCoursesState] = useState([]);
  const [announcementsState, setAnnouncementsState] = useState([]);

  useEffect(() => {
    if (users) setUsersState(users);
  }, [users]);
  useEffect(() => {
    if (courses) setCoursesState(courses);
  }, [courses]);
  useEffect(() => {
    if (announcements) setAnnouncementsState(announcements);
  }, [announcements]);

  const roleData = (stats?.users_by_role || []).map((r) => ({
    name: r.role,
    value: r.count,
  }));

  const enrollmentData = stats?.enrollment_by_course || [];

  // ---------- User creation form ----------
  const [userForm, setUserForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "TEACHER",
  });
  const [userSubmitting, setUserSubmitting] = useState(false);
  const [userError, setUserError] = useState(null);

  async function handleCreateUser(e) {
    e.preventDefault();
    setUserSubmitting(true);
    setUserError(null);
    try {
      const created = await createUser(userForm);
      setUsersState((prev) => [created, ...prev]);
      setUserForm({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "TEACHER",
      });
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        const firstKey = Object.keys(data)[0];
        setUserError(`${firstKey}: ${data[firstKey]}`);
      } else {
        setUserError("Failed to create user.");
      }
    } finally {
      setUserSubmitting(false);
    }
  }

  // ---------- Course creation form ----------
  const [courseForm, setCourseForm] = useState({
    code: "",
    title: "",
    description: "",
    credits: 3,
    teacher_id: "",
    is_open: true,
  });
  const [courseSubmitting, setCourseSubmitting] = useState(false);
  const [courseError, setCourseError] = useState(null);

  const teachers = usersState.filter((u) => u.role === "TEACHER");

  async function handleCreateCourse(e) {
    e.preventDefault();
    setCourseSubmitting(true);
    setCourseError(null);
    try {
      const payload = {
        code: courseForm.code,
        title: courseForm.title,
        description: courseForm.description,
        credits: Number(courseForm.credits),
        is_open: courseForm.is_open,
      };
      if (courseForm.teacher_id) {
        payload.teacher_id = Number(courseForm.teacher_id);
      }
      const created = await createCourse(payload);
      setCoursesState((prev) => [...prev, created]);
      setCourseForm({
        code: "",
        title: "",
        description: "",
        credits: 3,
        teacher_id: "",
        is_open: true,
      });
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        const firstKey = Object.keys(data)[0];
        setCourseError(`${firstKey}: ${data[firstKey]}`);
      } else {
        setCourseError("Failed to create course.");
      }
    } finally {
      setCourseSubmitting(false);
    }
  }

  async function handleDeleteCourse(id) {
    if (!window.confirm("Delete this course? Enrollments will be removed.")) return;
    try {
      await deleteCourse(id);
      setCoursesState((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Failed to delete course.");
    }
  }

  // ---------- Announcement form ----------
  const [annForm, setAnnForm] = useState({ title: "", body: "" });
  const [annSubmitting, setAnnSubmitting] = useState(false);
  const [annError, setAnnError] = useState(null);

  async function handleCreateAnnouncement(e) {
    e.preventDefault();
    setAnnSubmitting(true);
    setAnnError(null);
    try {
      const created = await createSiteAnnouncement({
        title: annForm.title,
        body: annForm.body,
      });
      setAnnouncementsState((prev) => [created, ...prev]);
      setAnnForm({ title: "", body: "" });
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        const firstKey = Object.keys(data)[0];
        setAnnError(`${firstKey}: ${data[firstKey]}`);
      } else {
        setAnnError("Failed to post announcement.");
      }
    } finally {
      setAnnSubmitting(false);
    }
  }

  async function handleDeleteAnnouncement(id) {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await deleteAnnouncement(id);
      setAnnouncementsState((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("Failed to delete announcement.");
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-800">
        Welcome, {user.first_name}
      </h1>
      <p className="mt-1 text-slate-600">Admin dashboard</p>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total users"
          value={statsLoading ? "…" : stats?.total_users ?? 0}
          sublabel="Across all roles"
          accent="blue"
        />
        <StatCard
          label="Total courses"
          value={statsLoading ? "…" : stats?.total_courses ?? 0}
          sublabel="Active courses"
          accent="purple"
        />
        <StatCard
          label="Total enrollments"
          value={statsLoading ? "…" : stats?.total_enrollments ?? 0}
          sublabel="Student-course pairs"
          accent="green"
        />
      </div>

      {/* Charts */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            Users by role
          </h2>
          <p className="text-sm text-slate-500">
            Distribution across admin, teacher, and student accounts.
          </p>
          <div className="mt-4 h-64">
            {roleData.length === 0 ? (
              <p className="text-slate-500 text-sm">No users yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.name} (${entry.value})`}
                  >
                    {roleData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={ROLE_COLORS[entry.name] || "#94a3b8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            Enrollment by course
          </h2>
          <p className="text-sm text-slate-500">
            How many students are enrolled in each course.
          </p>
          <div className="mt-4 h-64">
            {enrollmentData.length === 0 ? (
              <p className="text-slate-500 text-sm">No courses yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentData}>
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
      </div>

      {/* Users */}
      <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">Users</h2>

        <form onSubmit={handleCreateUser} className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            placeholder="First name"
            required
            value={userForm.first_name}
            onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
          <input
            placeholder="Last name"
            required
            value={userForm.last_name}
            onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
          <input
            type="email"
            placeholder="Email"
            required
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
          <input
            type="password"
            placeholder="Password (8+)"
            required
            minLength={8}
            value={userForm.password}
            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
          <div className="flex gap-2">
            <select
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm flex-1"
            >
              <option value="TEACHER">Teacher</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button
              type="submit"
              disabled={userSubmitting}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-900 disabled:opacity-50"
            >
              {userSubmitting ? "…" : "Create"}
            </button>
          </div>
        </form>

        <ErrorBox message={userError} />

        {usersLoading && <p className="mt-4 text-slate-500 text-sm">Loading users…</p>}

        {!usersLoading && usersState.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Name</th>
                  <th className="text-left px-4 py-2 font-medium">Email</th>
                  <th className="text-left px-4 py-2 font-medium">Role</th>
                </tr>
              </thead>
              <tbody>
                {usersState.map((u) => (
                  <tr key={u.id} className="border-t border-slate-100">
                    <td className="px-4 py-2 text-slate-800">
                      {u.first_name} {u.last_name}
                    </td>
                    <td className="px-4 py-2 text-slate-600">{u.email}</td>
                    <td className="px-4 py-2">
                      <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Courses */}
      <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">Courses</h2>

        <form onSubmit={handleCreateCourse} className="mt-4 grid grid-cols-1 md:grid-cols-6 gap-3">
          <input
            placeholder="Code"
            required
            value={courseForm.code}
            onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
          <input
            placeholder="Title"
            required
            value={courseForm.title}
            onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm md:col-span-2"
          />
          <input
            type="number"
            min="1"
            max="10"
            placeholder="Credits"
            required
            value={courseForm.credits}
            onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
          <select
            value={courseForm.teacher_id}
            onChange={(e) => setCourseForm({ ...courseForm, teacher_id: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="">No teacher</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.first_name} {t.last_name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={courseSubmitting}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-900 disabled:opacity-50"
          >
            {courseSubmitting ? "…" : "Create"}
          </button>
        </form>

        <ErrorBox message={courseError} />

        {coursesLoading && <p className="mt-4 text-slate-500 text-sm">Loading courses…</p>}

        {!coursesLoading && coursesState.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Code</th>
                  <th className="text-left px-4 py-2 font-medium">Title</th>
                  <th className="text-left px-4 py-2 font-medium">Teacher</th>
                  <th className="text-left px-4 py-2 font-medium">Students</th>
                  <th className="text-left px-4 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {coursesState.map((c) => (
                  <tr key={c.id} className="border-t border-slate-100">
                    <td className="px-4 py-2 font-mono text-slate-700">{c.code}</td>
                    <td className="px-4 py-2 text-slate-800">{c.title}</td>
                    <td className="px-4 py-2 text-slate-600">
                      {c.teacher
                        ? `${c.teacher.first_name} ${c.teacher.last_name}`
                        : "—"}
                    </td>
                    <td className="px-4 py-2 text-slate-600">{c.enrollment_count}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => handleDeleteCourse(c.id)}
                        className="text-xs text-red-600 hover:text-red-700 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Announcements */}
      <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">
          Site-wide announcements
        </h2>

        <form onSubmit={handleCreateAnnouncement} className="mt-4 space-y-3">
          <input
            placeholder="Title"
            required
            value={annForm.title}
            onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
          <textarea
            placeholder="Body"
            required
            rows={2}
            value={annForm.body}
            onChange={(e) => setAnnForm({ ...annForm, body: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
          <button
            type="submit"
            disabled={annSubmitting}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-900 disabled:opacity-50"
          >
            {annSubmitting ? "Posting…" : "Post announcement"}
          </button>
        </form>

        <ErrorBox message={annError} />

        {announcementsLoading && (
          <p className="mt-4 text-slate-500 text-sm">Loading announcements…</p>
        )}

        {!announcementsLoading && announcementsState.length > 0 && (
          <ul className="mt-4 space-y-2">
            {announcementsState.map((a) => (
              <li
                key={a.id}
                className="p-4 rounded-lg border border-slate-200 flex items-start justify-between gap-3"
              >
                <div>
                  <h3 className="font-semibold text-slate-800">{a.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{a.body}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {a.course_code || "Site-wide"} ·{" "}
                    {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteAnnouncement(a.id)}
                  className="text-xs text-red-600 hover:text-red-700 hover:underline whitespace-nowrap"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}