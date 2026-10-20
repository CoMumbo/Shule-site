import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SiteHeader() {
  const { user, logout } = useAuth();

  const navLink = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition ${
      isActive
        ? "bg-slate-800 text-white"
        : "text-slate-700 hover:bg-slate-100"
    }`;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🎓</span>
          <span className="font-bold text-slate-800">School Site</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={navLink}>Home</NavLink>
          <NavLink to="/courses" className={navLink}>Courses</NavLink>
          <NavLink to="/announcements" className={navLink}>News</NavLink>
          <NavLink to="/about" className={navLink}>About</NavLink>
          <NavLink to="/faculty" className={navLink}>Faculty</NavLink>
          <NavLink to="/contact" className={navLink}>Contact</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Dashboard
              </Link>
              <span className="hidden sm:inline text-sm text-slate-500">
                {user.first_name}
              </span>
              <button
                onClick={logout}
                className="px-3 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-900"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-3 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-900"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}