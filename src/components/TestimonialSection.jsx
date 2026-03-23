import { useState, useEffect, useRef } from "react";
import { getAllTestimonials } from "../api";

const SWIPER_THRESHOLD = 5;

function StarRating({ count, size = "text-sm" }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`${size} ${i <= count ? "text-amber-400" : "text-[#c0c89e]"}`}>★</span>
      ))}
    </div>
  );
}

function TestimonialCard({ full_name, testimony, stars }) {
  const initials = full_name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
  return (
    <div className="bg-white border-2 border-[#d4dbb8] rounded-2xl p-5 flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-200 h-full">
      <span className="text-5xl leading-none text-[#d4dbb8] font-serif select-none -mb-2">"</span>
      <p className="text-sm text-[#4a5a3a] leading-loose italic flex-1 font-serif">"{testimony}"</p>
      <div className="flex items-center justify-between pt-3 border-t border-[#e8e4d8]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#d4dbb8] flex items-center justify-center text-[11px] font-bold text-green-800 tracking-wide shrink-0 font-display">
            {initials}
          </div>
          <p className="text-xs font-bold text-green-950 tracking-wide truncate font-display">{full_name}</p>
        </div>
        <StarRating count={stars} />
      </div>
    </div>
  );
}

function GridLayout({ testimonials }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {testimonials.map((t, i) => (
        <TestimonialCard key={t.id || i} {...t} />
      ))}
    </div>
  );
}

function SwiperLayout({ testimonials }) {
  const [current, setCurrent] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const wrapRef = useRef(null);
  const touchStartX = useRef(null);

  useEffect(() => {
    const update = () => {
      const w = wrapRef.current?.offsetWidth || window.innerWidth;
      if (w >= 1024) setVisibleCount(3);
      else if (w >= 640) setVisibleCount(2);
      else setVisibleCount(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = Math.max(0, testimonials.length - visibleCount);
  const safeCurrent = Math.min(current, maxIndex);
  const go = (dir) => setCurrent((prev) => Math.max(0, Math.min(prev + dir, maxIndex)));

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) go(diff > 0 ? 1 : -1);
    touchStartX.current = null;
  };

  const gap = 16;
  const cardWidth = `calc((100% - ${(visibleCount - 1) * gap}px) / ${visibleCount})`;

  return (
    <div ref={wrapRef}>
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(.4,0,.2,1)]"
          style={{
            gap: `${gap}px`,
            transform: `translateX(calc(-${safeCurrent} * (100% / ${visibleCount} + ${gap / visibleCount}px)))`,
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {testimonials.map((t, i) => (
            <div key={t.id || i} className="flex-shrink-0" style={{ width: cardWidth }}>
              <TestimonialCard {...t} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="flex gap-1.5">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === safeCurrent ? "w-5 bg-green-900" : "w-1.5 bg-[#aab890]"}`} />
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => go(-1)} disabled={safeCurrent === 0}
            className="w-9 h-9 rounded-full border border-[#b0ba90] text-[#4a5a3a] flex items-center justify-center hover:bg-green-900 hover:text-white hover:border-green-900 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed">←</button>
          <button onClick={() => go(1)} disabled={safeCurrent === maxIndex}
            className="w-9 h-9 rounded-full border border-[#b0ba90] text-[#4a5a3a] flex items-center justify-center hover:bg-green-900 hover:text-white hover:border-green-900 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed">→</button>
        </div>
      </div>
    </div>
  );
}

function OverallRating({ testimonials }) {
  const avg = (testimonials.reduce((s, t) => s + t.stars, 0) / testimonials.length).toFixed(1);
  return (
    <div className="flex justify-center mb-10">
      <div className="bg-[#eef1e4] border border-[#c0c89e] rounded-2xl px-5 py-4 flex items-center gap-4">
        <span className="text-4xl font-bold text-green-900 font-display leading-none">{avg}</span>
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold tracking-[0.15em] text-[#5c3317] uppercase font-display">Overall Rating</p>
          <StarRating count={Math.round(parseFloat(avg))} />
          <p className="text-[11px] text-[#7a8a6a] font-body">Based on {testimonials.length} reviews</p>
        </div>
      </div>
    </div>
  );
}

export function TestimonialSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllTestimonials()
      .then(({ data }) => setTestimonials(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, []);

  const useSwiper = testimonials.length > SWIPER_THRESHOLD;

  return (
    <section className="w-full bg-[#d4dbb8] py-20 px-6 sm:px-10 md:px-16 lg:px-24">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-10">
          <p className="text-[10px] font-bold tracking-[0.22em] text-[#5c3317] uppercase mb-3 font-display">
            What Readers Say
          </p>
          <h2 className="text-3xl font-semibold text-green-950 font-display">
            Matcha <span className="italic text-[#5c3317] font-normal">Memories</span>
          </h2>
          <p className="mt-3 text-sm text-[#4a5a3a] max-w-sm mx-auto leading-loose font-body">
            Every sip leaves a story. Here's what our readers have to say.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-16 gap-2 text-[#8a9070]">
            <span className="animate-spin inline-block text-xl">🍃</span>
            <span className="text-sm tracking-wide font-body">Brewing testimonials…</span>
          </div>
        )}

        {!loading && error && (
          <p className="text-center text-sm text-red-400 py-10 font-body">
            Couldn't load testimonials: {error}
          </p>
        )}

        {!loading && !error && testimonials.length === 0 && (
          <p className="text-center text-sm text-[#8a9070] py-10 tracking-wide font-body">
            No testimonials yet — be the first! 🍃
          </p>
        )}

        {!loading && !error && testimonials.length > 0 && (
          <>
            <OverallRating testimonials={testimonials} />
            {useSwiper ? <SwiperLayout testimonials={testimonials} /> : <GridLayout testimonials={testimonials} />}
          </>
        )}

      </div>
    </section>
  );
}