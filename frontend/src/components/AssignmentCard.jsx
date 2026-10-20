import { useEffect, useState } from "react";
import { listSubmissions, createSubmission } from "../api/submissions";

export default function AssignmentCard({ assignment, courseCode }) {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    let cancelled = false;
    listSubmissions({ assignment: assignment.id })
      .then((subs) => {
        if (!cancelled && subs.length > 0) setSubmission(subs[0]);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [assignment.id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("assignment", String(assignment.id));
      fd.append("file", file);
      const created = await createSubmission(fd);
      setSubmission(created);
      setFile(null);
      e.target.reset();
    } catch (err) {
      const data = err.response?.data;
      setError(
        typeof data === "object"
          ? data.file?.[0] || data.detail || "Upload failed"
          : "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  }

  const isPastDue = new Date(assignment.due_date) < new Date();

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {courseCode && (
            <p className="text-xs font-mono text-slate-500">{courseCode}</p>
          )}
          <h3 className="mt-1 font-semibold text-slate-800">
            {assignment.title}
          </h3>
          {assignment.description && (
            <p className="mt-1 text-sm text-slate-600">
              {assignment.description}
            </p>
          )}
          <p
            className={`mt-2 text-xs ${
              isPastDue ? "text-red-600" : "text-slate-500"
            }`}
          >
            Due {new Date(assignment.due_date).toLocaleString()}
            {isPastDue && " (past due)"}
          </p>
        </div>
        {assignment.file_url && (
          <a
            href={assignment.file_url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-slate-700 underline whitespace-nowrap"
          >
            Download
          </a>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        {loading ? (
          <p className="text-sm text-slate-400">Checking submission…</p>
        ) : submission ? (
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="inline-block px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                ✓ Submitted
              </span>
              <p className="mt-1 text-xs text-slate-500">
                {new Date(submission.submitted_at).toLocaleString()}
              </p>
            </div>
            {submission.file_url && (
              <a
                href={submission.file_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-700 underline"
              >
                View your file
              </a>
            )}
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-wrap items-center gap-2"
          >
            <input
              type="file"
              required
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-sm text-slate-600"
            />
            <button
              type="submit"
              disabled={uploading || !file}
              className="px-3 py-1 text-sm bg-slate-800 text-white rounded hover:bg-slate-900 disabled:opacity-40"
            >
              {uploading ? "Uploading…" : "Submit"}
            </button>
          </form>
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}