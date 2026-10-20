import { Link } from "react-router-dom";

export default function CourseCard({ course }) {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="block bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm text-slate-500">{course.code}</span>
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
          {course.credits} credits
        </span>
      </div>
      <h3 className="mt-2 text-lg font-semibold text-slate-800">
        {course.title}
      </h3>
      {course.teacher && (
        <p className="mt-1 text-sm text-slate-500">
          {course.teacher.first_name} {course.teacher.last_name}
        </p>
      )}
      {course.description && (
        <p className="mt-3 text-sm text-slate-600 line-clamp-2">
          {course.description}
        </p>
      )}
    </Link>
  );
}