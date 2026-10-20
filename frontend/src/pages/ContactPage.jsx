import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    // No backend endpoint yet — just show a success message.
    // In a later step this will POST to /api/contact/.
    setSubmitted(true);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-800">Contact us</h1>
      <p className="mt-2 text-slate-600">
        Questions about programs, enrollment, or anything else? Send us a note.
      </p>

      {submitted ? (
        <div className="mt-6 bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg">
          Thanks — your message has been received. We'll get back to you soon.
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-6 bg-white p-6 rounded-xl border border-slate-200 space-y-4"
        >
          <label className="block text-sm font-medium text-slate-700">
            Name
            <input
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Message
            <textarea
              name="message"
              required
              rows={5}
              value={form.message}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </label>

          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
          >
            Send message
          </button>
        </form>
      )}
    </div>
  );
}