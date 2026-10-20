import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useFetch } from "../hooks/useFetch";
import { getCourse } from "../api/courses";
import { listEnrollments } from "../api/enrollments";
import { listGrades, createGrade, updateGrade } from "../api/grades";
import {
  listAnnouncements,
  createAnnouncement,
} from "../api/announcements";
import {
  listAssignments,
  createAssignment,
  deleteAssignment,
} from "../api/assignments";

function scoreToLetter(score) {
  if (score === "" || score == null || isNaN(Number(score))) return "—";
  const s = Number(score);
  if (s >= 90) return "A";
  if (s >= 80) return "B";
  if (s >= 70) return "C";
  if (s >= 60) return "D";
  return "F";
}

function GradeRow({ enrollment, existingGrade, onSaved }) {
  const [score, setScore] = useState(
    existingGrade ? String(existingGrade.score) : ""
  );
  const [originalScore, setOriginalScore] = useState(
    existingGrade ? String(existingGrade.score) : ""
  );
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (existingGrade) {
      setScore(String(existingGrade.score));
      setOriginalScore(String(existingGrade.score));
    }
  }, [existingGrade]);

  const dirty = score !== originalScore;
  const letter = scoreToLetter(score);

  async function handleSave() {
    setSaving(true);
    setStatus(null);
    setErrorMsg(null);
    try {
      let result;
      if (existingGrade) {
        result = await updateGrade(existingGrade.id, { score: Number(score) });
      } else {
        result = await createGrade({
          enrollment: enrollment.id,
          score: Number(score),
        });
      }
      setOriginalScore(String(score));
      setStatus("saved");
      onSaved?.(result);
    } catch (err) {
      setStatus("error");
      const data = err.response?.data;
      setErrorMsg(
        typeof data === "object"
          ? data.score?.[0] || data.detail || "Failed to save"
          : "Failed to save"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="border-t border-slate-100">
      <td className="px-4 py-3">
        <p className="font-medium text-slate-800">
          {enrollment.student.first_name} {enrollment.student.last_name}
        </p>
        <p className="text-xs text-slate-500">{enrollment.student.email}</p>
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={score}
          onChange={(e) => {
            setScore(e.target.value);
            setStatus(null);
          }}
          placeholder="—"
          className="w-24 px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
      </td>
      <td className="px-4 py-3">
        <span className="inline-block px-2 py-1 text-xs rounded bg-slate-100 text-slate-700">
          {letter}
        </span>
      </td>
      <td className="px-4 py-3">
        {saving ? (
          <span className="text-sm text-slate-500">Saving…</span>
        ) : status === "saved" ? (
          <span className="text-sm text-green-600">✓ Saved</span>
        ) : status === "error" ? (
          <span className="text-sm text-red-600">{errorMsg}</span>
        ) : (
          <button
            onClick={handleSave}
            disabled={!dirty || score === ""}
            className="px-3 py-1 text-sm bg-slate-800 text-white rounded hover:bg-slate-900 disabled:opacity-40"
          >
            Save
          </button>
        )}
      </td>
    </tr>
  );
}

export default function TeacherCoursePage() {
  const { id } = useParams();

  const { data: course, loading: courseLoading } = useFetch(
    () => getCourse(id),
    [id]
  );
  const { data: enrollments, loading: enrollmentsLoading } = useFetch(
    () => listEnrollments({ course: id }),
    [id]
  );
  const { data: grades, loading: gradesLoading } = useFetch(
    () => listGrades(),
    []
  );
  const { data: announcements, loading: announcementsLoading } = useFetch(
    () => listAnnouncements({ course: id }),
    [id]
  );
  const { data: assignments, loading: assignmentsLoading } = useFetch(
    () => listAssignments(),
    []
  );

  const [gradesState, setGradesState] = useState([]);
  const [announcementsState, setAnnouncementsState] = useState([]);
  const [assignmentsState, setAssignmentsState] = useState([]);

  useEffect(() => {
    if (grades) setGradesState(grades);
  }, [grades]);
  useEffect(() => {
    if (announcements) setAnnouncementsState(announcements);
  }, [announcements]);
  useEffect(() => {
    if (assignments) setAssignmentsState(assignments);
  }, [assignments]);

  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    body: "",
  });
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState(null);

  async function handlePostAnnouncement(e) {
    e.preventDefault();
    setPosting(true);
    setPostError(null);
    try {
      const created = await createAnnouncement({
        title: announcementForm.title,
        body: announcementForm.body,
        course: Number(id),
      });
      setAnnouncementsState((prev) => [created, ...prev]);
      setAnnouncementForm({ title: "", body: "" });
    } catch (err) {
      const data = err.response?.data;
      setPostError(
        typeof data === "object"
          ? data.title?.[0] || data.body?.[0] || data.detail || "Failed to post"
          : "Failed to post"
      );
    } finally {
      setPosting(false);
    }
  }

  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    due_date: "",
  });
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  async function handleCreateAssignment(e) {
    e.preventDefault();
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("course", String(id));
      fd.append("title", assignmentForm.title);
      fd.append("description", assignmentForm.description);
      fd.append("due_date", new Date(assignmentForm.due_date).toISOString());
      if (assignmentFile) {
        fd.append("file", assignmentFile);
      }
      const created = await createAssignment(fd);
      setAssignmentsState((prev) => [...prev, created]);
      setAssignmentForm({ title: "", description: "", due_date: "" });
      setAssignmentFile(null);
      e.target.reset();
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        const firstKey = Object.keys(data)[0];
        setUploadError(`${firstKey}: ${data[firstKey]}`);
      } else {
        setUploadError("Failed to create assignment.");
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteAssignment(assignId) {
    if (!window.confirm("Delete this assignment?")) return;
    try {
      await deleteAssignment(assignId);
      setAssignmentsState((prev) => prev.filter((a) => a.id !== assignId));
    } catch {
      alert("Failed to delete assignment.");
    }
  }

  if (courseLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-slate-500">
        Loading…
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-red-600">Course not found.</p>
        <Link
          to="/dashboard"
          className="mt-4 inline-block text-slate-700 underline"
        >
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link to="/dashboard" className="text-sm text-slate-600 hover:underline">
        ← Back to dashboard
      </Link>

      <div className="mt-4 bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between">
          <span className="font-mono text-slate-500">{course.code}</span>
          <span
            className={`text-xs px-2 py-1 rounded ${
              course.is_open
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {course.is_open ? "Open" : "Closed"}
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-slate-800">
          {course.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {course.enrollment_count}{" "}
          {course.enrollment_count === 1 ? "student" : "students"} ·{" "}
          {course.credits} credits
        </p>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-800">
          Enrolled students & grades
        </h2>

        {(enrollmentsLoading || gradesLoading) && (
          <p className="mt-3 text-slate-500">Loading…</p>
        )}

        {!enrollmentsLoading &&
          !gradesLoading &&
          enrollments &&
          enrollments.length === 0 && (
            <p className="mt-3 text-slate-500">No students enrolled yet.</p>
          )}

        {!enrollmentsLoading &&
          !gradesLoading &&
          enrollments &&
          enrollments.length > 0 && (
            <div className="mt-3 bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Student</th>
                    <th className="text-left px-4 py-3 font-medium">Score</th>
                    <th className="text-left px-4 py-3 font-medium">Letter</th>
                    <th className="text-left px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((e) => {
                    const existing = gradesState.find(
                      (g) => g.enrollment === e.id
                    );
                    return (
                      <GradeRow
                        key={e.id}
                        enrollment={e}
                        existingGrade={existing}
                        onSaved={(saved) => {
                          setGradesState((prev) => {
                            const idx = prev.findIndex(
                              (g) => g.enrollment === saved.enrollment
                            );
                            if (idx === -1) return [...prev, saved];
                            const copy = [...prev];
                            copy[idx] = saved;
                            return copy;
                          });
                        }}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-800">Assignments</h2>

        <form
          onSubmit={handleCreateAssignment}
          className="mt-3 bg-white p-6 rounded-xl border border-slate-200 space-y-3"
        >
          {uploadError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {uploadError}
            </div>
          )}

          <label className="block text-sm font-medium text-slate-700">
            Title
            <input
              required
              value={assignmentForm.title}
              onChange={(e) =>
                setAssignmentForm({
                  ...assignmentForm,
                  title: e.target.value,
                })
              }
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Description
            <textarea
              rows={2}
              value={assignmentForm.description}
              onChange={(e) =>
                setAssignmentForm({
                  ...assignmentForm,
                  description: e.target.value,
                })
              }
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Due date
            <input
              type="datetime-local"
              required
              value={assignmentForm.due_date}
              onChange={(e) =>
                setAssignmentForm({
                  ...assignmentForm,
                  due_date: e.target.value,
                })
              }
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            File (optional)
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              onChange={(e) => setAssignmentFile(e.target.files?.[0] || null)}
              className="mt-1 block text-sm text-slate-600"
            />
          </label>

          <button
            type="submit"
            disabled={uploading}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Create assignment"}
          </button>
        </form>

        {assignmentsLoading && (
          <p className="mt-3 text-slate-500">Loading assignments…</p>
        )}

        {!assignmentsLoading && assignmentsState.length === 0 && (
          <p className="mt-3 text-slate-500">No assignments yet.</p>
        )}

        {!assignmentsLoading && assignmentsState.length > 0 && (
          <ul className="mt-3 space-y-2">
            {assignmentsState.map((a) => (
              <li
                key={a.id}
                className="bg-white p-4 rounded-xl border border-slate-200 flex items-start justify-between gap-3"
              >
                <div>
                  <h3 className="font-semibold text-slate-800">{a.title}</h3>
                  {a.description && (
                    <p className="mt-1 text-sm text-slate-600">
                      {a.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">
                    Due {new Date(a.due_date).toLocaleString()} ·{" "}
                    {a.submission_count} submission
                    {a.submission_count === 1 ? "" : "s"}
                  </p>
                  {a.file_url && (
                    <a
                      href={a.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm text-slate-700 underline"
                    >
                      Download attached file
                    </a>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteAssignment(a.id)}
                  className="text-xs text-red-600 hover:text-red-700 hover:underline whitespace-nowrap"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8 pb-12">
        <h2 className="text-lg font-semibold text-slate-800">
          Course announcements
        </h2>

        <form
          onSubmit={handlePostAnnouncement}
          className="mt-3 bg-white p-6 rounded-xl border border-slate-200 space-y-3"
        >
          {postError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {postError}
            </div>
          )}

          <label className="block text-sm font-medium text-slate-700">
            Title
            <input
              required
              value={announcementForm.title}
              onChange={(e) =>
                setAnnouncementForm({
                  ...announcementForm,
                  title: e.target.value,
                })
              }
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Body
            <textarea
              required
              rows={3}
              value={announcementForm.body}
              onChange={(e) =>
                setAnnouncementForm({
                  ...announcementForm,
                  body: e.target.value,
                })
              }
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </label>

          <button
            type="submit"
            disabled={posting}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:opacity-50"
          >
            {posting ? "Posting…" : "Post announcement"}
          </button>
        </form>

        {announcementsLoading && (
          <p className="mt-3 text-slate-500">Loading announcements…</p>
        )}

        {!announcementsLoading && announcementsState.length === 0 && (
          <p className="mt-3 text-slate-500">No announcements yet.</p>
        )}

        {!announcementsLoading && announcementsState.length > 0 && (
          <ul className="mt-3 space-y-3">
            {announcementsState.map((a) => (
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
                <p className="mt-1 text-sm text-slate-600 whitespace-pre-line">
                  {a.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}