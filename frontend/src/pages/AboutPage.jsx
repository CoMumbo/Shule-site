export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-800">About our school</h1>

      <p className="mt-4 text-slate-700 leading-relaxed">
        Our school is a modern learning community dedicated to curiosity,
        rigor, and kindness. We offer programs across computer science,
        mathematics, and the humanities, and we believe great teaching starts
        with great relationships.
      </p>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="font-semibold text-slate-800">Our mission</h2>
          <p className="mt-2 text-sm text-slate-600">
            To help every student learn deeply, think independently, and
            contribute generously to the world around them.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="font-semibold text-slate-800">Our approach</h2>
          <p className="mt-2 text-sm text-slate-600">
            Small classes, strong mentorship, and a focus on projects that
            connect classroom ideas to real work.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="font-semibold text-slate-800">Our community</h2>
          <p className="mt-2 text-sm text-slate-600">
            Students, teachers, and families working together with respect,
            curiosity, and care for one another.
          </p>
        </div>
      </div>
    </div>
  );
}