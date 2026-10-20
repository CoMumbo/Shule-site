import { useAuth } from "../context/AuthContext";
import StudentDashboard from "./StudentDashboard";
import TeacherDashboard from "./TeacherDashboard";
import AdminDashboard from "./AdminDashboard";

export default function DashboardPage() {
  const { user } = useAuth();

  if (user.role === "STUDENT") {
    return <StudentDashboard />;
  }

  if (user.role === "TEACHER") {
    return <TeacherDashboard />;
  }

  if (user.role === "ADMIN") {
    return <AdminDashboard />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome, {user.first_name}
        </h1>
        <p className="mt-2 text-slate-600">
          Role: <span className="font-mono">{user.role}</span>
        </p>
      </div>
    </div>
  );
}