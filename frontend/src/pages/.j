import { Link, useParams } from "react-router-dom";

export default function TeacherCoursePage() {
  const { id } = useParams();
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Link to="/dashboard" className="text-sm text-slate-600 hover:underline">
        ← Back to dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-800">
        Course management
      </h1>
      <p className="mt-2 text-slate-600">
        Full course management for course #{id} coming in the next message.
      </p>
    </div>
  );
}