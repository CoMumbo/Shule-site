import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listEnrollments, createEnrollment } from "../api/enrollments";
import { useAuth } from "../context/AuthContext";

export default function EnrollButton({ courseId }) {
  const { user } = useAuth();
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "STUDENT") {
      setLoading(false);
      return;
    }
    let cancelled = false;
    listEnrollments()
      .then((enrollments) => {
        if (!cancelled) {
          setEnrolled(enrollments.some((e) => e.course.id === Number(courseId)));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId, user]);

  if (!user) {
    return (
      <Link
        to="/login"
        className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 text-sm font-medium"
      >
        Log in to enroll
      </Link>
    );
  }

  if (user.role !== "STUDENT") {
    return (
      <span className="text-sm text-slate-500">
        Only students can enroll.
      </span>
    );
  }

  if (loading) {
    return <span className="text-sm text-slate-400">Checking enrollment…</span>;
  }

  if (enrolled) {
    return (
      <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium">
        ✓ Enrolled
      </span>
    );
  }

  async function handleEnroll() {
    setError(null);
    setSubmitting(true);
    try {
      await createEnrollment(Number(courseId));
      setEnrolled(true);
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.course_id?.[0] ||
        "Enrollment failed.";
      setError(detail);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleEnroll}
        disabled={submitting}
        className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:opacity-50 text-sm font-medium"
      >
        {submitting ? "Enrolling…" : "Enroll in this course"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}