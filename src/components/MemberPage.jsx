// ─── Star Picker (interactive) ────────────────────────────────────────────────
import { useState, useEffect } from "react";
const StarPicker = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          className={`text-xl transition-colors duration-150 ${
            i <= (hovered || value) ? "text-amber-400" : "text-slate-200"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

// ─── Member Page ──────────────────────────────────────────────────────────────

export const MemberPage = ({ member, onLogout }) => {
  const [cards, setCards] = useState([]);

  // testimony state
  const [testimony, setTestimony] = useState(null);
  const [text,      setText]      = useState("");
  const [stars,     setStars]     = useState(0);
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState("");

  useEffect(() => {
    getLoyaltyCards(member.id)
      .then((res) => setCards(res.data))
      .catch((err) => console.error("Failed to fetch cards:", err));

    getTestimony(member.id)
      .then((res) => {
        const t = res.data;
        if (t) {
          setTestimony(t);
          setText(t.testimony || "");
          setStars(t.stars    || 0);
        }
      })
      .catch((err) => console.error("Failed to fetch testimony:", err));
  }, [member.id]);

  const activeCard           = cards.find((c) => !c.completed);
  const completedUnusedCards = cards.filter((c) => c.completed && !c.used);
  const usedCards            = cards.filter((c) => c.used);
  const activeStamps         = activeCard ? activeCard.stamps : 0;
  const stampsLeft           = 8 - activeStamps;

  const handleSubmitTestimony = async () => {
    if (!text.trim()) return setError("Please write your testimony.");
    if (stars === 0)  return setError("Please select a star rating.");
    setError("");
    setLoading(true);
    try {
      await submitTestimony({
        member_id: member.id,
        full_name: member.full_name,
        testimony: text,
        stars,
      });
      setTestimony({ testimony: text, stars });
      setSuccess(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const initials = member.full_name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f5f2e8] font-body">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4 bg-[#5c3317] shadow-md">
        <div className="flex items-center gap-2.5 md:gap-3">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/20 flex items-center justify-center text-base md:text-lg"><img src={NamiLogo} /></div>
          <div>
            <p className="text-xs md:text-sm font-bold tracking-[0.14em] text-white uppercase font-display">NAMIDORI</p>
            <p className="hidden sm:block text-[9px] text-white/50 tracking-widest uppercase">Matcha Cafe</p>
          </div>
        </div>
        <button onClick={onLogout} className="px-4 md:px-5 py-1.5 md:py-2 rounded-lg text-[11px] font-semibold tracking-widest uppercase text-white border border-white/40 hover:border-white transition-all">
          Log Out
        </button>
      </nav>

      {/* Hero */}
      <section className="bg-[#d4dbb8] px-4 md:px-8 py-10 md:py-16 text-center">
        <div className="text-4xl md:text-5xl mb-3 md:mb-4">🍵</div>
        <p className="text-[10px] font-bold tracking-[0.22em] text-[#5c3317] uppercase mb-2 font-display">Welcome back</p>
        <h1 className="text-2xl md:text-4xl font-bold text-green-900 font-display tracking-wide mb-2">{member.full_name}</h1>
        <p className="text-sm text-[#4a5a3a]">Member since {member.joined_date}</p>
      </section>

      <section className="max-w-2xl mx-auto px-4 md:px-8 py-8 md:py-12">

        {/* Member info */}
        <div className="bg-white border-2 border-[#a8b48a] rounded-2xl shadow-sm overflow-hidden mb-5 md:mb-6">
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-stone-100 flex items-center gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-green-100 flex items-center justify-center text-lg md:text-xl">👤</div>
            <div>
              <p className="text-sm font-bold text-green-800 font-display">Member Profile</p>
              <p className="text-[10px] text-stone-400">Your account details</p>
            </div>
          </div>
          <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {[
              { label: "Full Name",    value: member.full_name,   icon: "👤" },
              { label: "Username",     value: member.email,       icon: "🪪" },
              { label: "Phone",        value: member.phone,       icon: "📱" },
              { label: "Member Since", value: member.joined_date, icon: "📅" },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-stone-50 rounded-xl border border-stone-100">
                <span className="text-lg md:text-xl">{icon}</span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">{label}</p>
                  <p className="text-xs md:text-sm font-medium text-stone-700 mt-0.5 truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active loyalty card */}
        <div className="bg-[#5c3317] rounded-2xl p-5 md:p-6 text-white shadow-lg mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60 font-display">Namidori</p>
              <p className="text-base md:text-lg font-bold font-display tracking-wide">Current Card</p>
            </div>
            <div className="w-10 h-10"><img src={NamiLogo} /></div>
          </div>
          <p className="text-xs text-white/60 mb-4">Collect 8 stamps to get a ₱145 discount!</p>
          <div className="flex gap-1.5 md:gap-2 flex-wrap mb-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`w-8 h-8 md:w-9 md:h-9 rounded-full border-2 flex items-center justify-center text-xs md:text-sm transition-all ${
                i < activeStamps ? "bg-green-800 border-green-200 text-white" : "border-white/30 bg-white/10"
              }`}>
                {i < activeStamps ? "🍵" : ""}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-white/60">
            {activeStamps} / 8 stamps
            {activeStamps === 0 ? " — Start ordering to collect stamps!"
              : activeStamps === 8 ? " — Card complete! 🎉"
              : ` — ${stampsLeft} more to go!`}
          </p>
        </div>

        {/* Completed unused cards */}
        {completedUnusedCards.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold text-green-800 uppercase tracking-widest mb-2">🎉 Rewards Available</p>
            {completedUnusedCards.map((card) => (
              <div key={card.id} className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-amber-700">₱145 Discount Ready!</p>
                    <p className="text-[10px] text-amber-600">Completed on {card.completed_date}</p>
                  </div>
                  <span className="text-2xl">🏆</span>
                </div>
                <div className="flex gap-1 mt-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex-1 h-1.5 rounded-full bg-amber-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Used cards history */}
        {usedCards.length > 0 && (
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">📜 Redeemed Cards</p>
            {usedCards.map((card) => (
              <div key={card.id} className="bg-white border border-stone-200 rounded-2xl p-4 mb-2 opacity-60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-stone-500">₱145 Discount Used</p>
                    <p className="text-[10px] text-stone-400">Redeemed on {card.used_date}</p>
                  </div>
                  <span className="text-xl">✅</span>
                </div>
                <div className="flex gap-1 mt-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex-1 h-1.5 rounded-full bg-stone-300" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Testimony ──────────────────────────────────────────────────────── */}
        <div className="mt-5 md:mt-6">

          <p className="text-xs font-bold text-[#5c3317] uppercase tracking-widest mb-3 font-display">⭐ My Testimony</p>

          {/* Existing testimony display */}
          {testimony && (
            <div className="bg-white border-2 border-[#a8b48a] rounded-2xl shadow-sm overflow-hidden mb-4">
              <div className="px-4 md:px-6 py-3 border-b border-stone-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center font-bold text-sm text-green-800">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-green-800 font-display">Your Submitted Testimony</p>
                  <p className="text-[10px] text-stone-400">Visible on the Namidori website</p>
                </div>
              </div>
              <div className="p-4 md:p-6">
                <div className="flex gap-0.5 mb-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className={`text-sm ${i <= testimony.stars ? "text-amber-400" : "text-stone-200"}`}>★</span>
                  ))}
                </div>
                <p className="text-xs md:text-sm text-stone-600 italic leading-relaxed mb-3">"{testimony.testimony}"</p>
                <p className="text-[11px] text-stone-400">
                  <span className="font-semibold text-stone-600">{member.full_name}</span>
                </p>
              </div>
            </div>
          )}

          {/* Submit / Update form */}
          <div className="bg-white border-2 border-[#a8b48a] rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 md:px-6 py-3 border-b border-stone-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-lg">✏️</div>
              <div>
                <p className="text-sm font-bold text-green-800 font-display">
                  {testimony ? "Update Testimony" : "Write a Testimony"}
                </p>
                <p className="text-[10px] text-stone-400">Your feedback helps us grow</p>
              </div>
            </div>
            <div className="p-4 md:p-6 flex flex-col gap-4">

              <div>
                <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Testimony</p>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Tell us about your experience at Namidori..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs md:text-sm text-stone-700 outline-none focus:border-[#a8b48a] transition-colors resize-none placeholder:text-stone-300"
                />
              </div>

              <div>
                <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Rating</p>
                <StarPicker value={stars} onChange={setStars} />
              </div>

              {error   && <p className="text-[11px] text-red-400">{error}</p>}
              {success && <p className="text-[11px] text-green-600 font-semibold">✅ Testimony submitted successfully!</p>}

              <button
                onClick={handleSubmitTestimony}
                disabled={loading}
                className="w-full py-2.5 bg-[#5c3317] text-white rounded-xl text-[11px] font-bold tracking-widest uppercase hover:bg-[#4a2810] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : testimony ? "Update Testimony" : "Submit Testimony"}
              </button>

            </div>
          </div>
        </div>
        {/* ── End Testimony ──────────────────────────────────────────────────── */}

      </section>
    </div>
  );
};