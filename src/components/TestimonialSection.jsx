import { useEffect, useState } from "react";
import { getAllTestimonials } from "../api"; // uses your existing api.js

// ── Star display ──────────────────────────────────────────────────────────────
function StarRating({ count }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`text-sm ${i <= count ? "text-amber-400" : "text-stone-200"}`}>★</span>
      ))}
    </div>
  );
}

// ── Single card ───────────────────────────────────────────────────────────────
function TestimonialCard({ full_name, testimony, stars }) {
  const initials = full_name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="bg-white border-2 border-[#d4dbb8] rounded-2xl p-6 shadow-sm flex flex-col gap-3
                    hover:-translate-y-1 hover:shadow-md transition-all duration-300">
      <span className="text-5xl leading-none text-[#d4dbb8] font-serif select-none -mb-2">"</span>
      <p className="text-sm text-[#4a5a3a] leading-loose flex-1 italic">"{testimony}"</p>
      <div className="flex items-center justify-between pt-3 border-t border-[#e8e4d8]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#d4dbb8] flex items-center justify-center
                          text-[11px] font-bold text-green-800 font-display tracking-wide shrink-0">
            {initials}
          </div>
          <p className="text-xs font-bold text-green-950 font-display tracking-wide truncate">
            {full_name}
          </p>
        </div>
        <StarRating count={stars} />
      </div>
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  useEffect(() => {
    getAllTestimonials()
      .then(({ data }) => setTestimonials(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="w-full bg-[#f5f2e8] py-20 px-6 sm:px-10 md:px-16 lg:px-24">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-12">
          <p className="text-[10px] font-bold tracking-[0.22em] text-[#5c3317] uppercase mb-3 font-display">
            What Readers Say
          </p>
          <h2 className="text-3xl font-semibold text-green-950 font-display">
            Matcha <span className="italic text-[#5c3317] font-normal">Memories</span>
          </h2>
          <p className="mt-3 text-sm text-[#4a5a3a] max-w-sm mx-auto leading-loose">
            Every sip leaves a story. Here's what our readers have to say.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-16 gap-2 text-[#8a9070]">
            <span className="animate-spin inline-block text-xl">🍃</span>
            <span className="text-sm font-display tracking-wide">Brewing testimonials…</span>
          </div>
        )}

        {!loading && error && (
          <p className="text-center text-sm text-red-400 py-10">
            Couldn't load testimonials: {error}
          </p>
        )}

        {!loading && !error && testimonials.length === 0 && (
          <p className="text-center text-sm text-[#8a9070] py-10 font-display tracking-wide">
            No testimonials yet — be the first! 🍃
          </p>
        )}

        {!loading && !error && testimonials.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <TestimonialCard key={t.id || i} {...t} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}