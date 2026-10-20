export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-slate-500 flex flex-col md:flex-row justify-between gap-2">
        <p>© {new Date().getFullYear()} School Site. All rights reserved.</p>
        <p>
          Built with React, Django, and PostgreSQL.
        </p>
      </div>
    </footer>
  );
}