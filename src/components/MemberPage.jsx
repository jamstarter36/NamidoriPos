import { useState, useEffect } from "react";
import NamiLogo from "../images/NamiLogo.png";
import { getLoyaltyCards, getTestimony, submitTestimony } from "../api";

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

const LoyaltyCardUI = ({ card, isActive = false, activeStamps = 0, stampsLeft = 0 }) => (
  <div className={`rounded-2xl p-5 md:p-6 text-white shadow-lg ${
  card?.used
    ? "bg-gray-400"
    : card?.completed
    ? "bg-orange-400"
    : "bg-[#5c3317]"
  }`}>
    <div className="flex items-center justify-between mb-2">
      <div>
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60 font-display">Namidori</p>
        <p className="text-base md:text-lg font-bold font-display tracking-wide">
          {isActive ? "Current Card" : "Loyalty Card"}
        </p>
      </div>
      <div className="w-10 h-10"><img src={NamiLogo} /></div>
    </div>
    <p className="text-xs text-white/60 mb-4">
      {isActive
        ? "Collect 8 stamps to get a ₱145 discount!"
        : card?.used
        ? `Redeemed on ${card.used_date}`
        : `Completed on ${card?.completed_date} · ₱145 discount ready!`}
    </p>
    <div className="flex gap-1.5 md:gap-2 flex-wrap mb-3">
      {Array.from({ length: 8 }).map((_, i) => {
        const filled = isActive ? i < activeStamps : true;
        return (
          <div key={i} className={`w-8 h-8 md:w-9 md:h-9 rounded-full border-2 flex items-center justify-center text-xs md:text-sm transition-all ${
            filled
              ? card?.used
                ? "bg-white/10 border-white/20 text-white/40"
                : "bg-green-800 border-green-200 text-white"
              : "border-white/30 bg-white/10"
          }`}>
            {filled ? "🍵" : ""}
          </div>
        );
      })}
    </div>
    <p className="text-[11px]">
      {isActive ? (
        <span className="text-white/60">
          {activeStamps} / 8 stamps
          {activeStamps === 0 ? " — Start ordering to collect stamps!"
            : activeStamps === 8 ? " — Card complete! 🎉"
            : ` — ${stampsLeft} more to go!`}
        </span>
      ) : card?.used ? (
        <span className="text-white/40">✅ Discount used</span>
      ) : (
        <span className="text-amber-300 font-bold">🏆 Ready to redeem!</span>
      )}
    </p>
  </div>
);

export const MemberPage = ({ member, onLogout }) => {
  const [cards, setCards] = useState([]);
  const [testimony, setTestimony] = useState(null);
  const [text,      setText]      = useState("");
  const [stars,     setStars]     = useState(0);
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState("");

  // ✅ NEW: card order state
  const [cardOrder, setCardOrder] = useState([]);

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

  const allOtherCards = [...usedCards, ...completedUnusedCards];
  const stackCount    = allOtherCards.length;

  // ✅ NEW: sync order
  useEffect(() => {
    setCardOrder(allOtherCards);
  }, [cards]);

  // ✅ NEW: rotate function
  const rotateCards = () => {
    setCardOrder((prev) => {
      if (prev.length <= 1) return prev;
      const [first, ...rest] = prev;
      return [...rest, first];
    });
  };

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

        {/* ── Stacked Loyalty Cards ── */}
        <div className="mb-6">
          <p className="text-xs font-bold text-[#5c3317] uppercase tracking-widest mb-3 font-display">🎴 Loyalty Cards</p>

          <div
            className="relative"
            style={{ paddingBottom: stackCount > 0 ? `${stackCount * 10}px` : "0" }}
          >
            {cardOrder.map((card, index) => (
              <div
                key={card.id}
                onClick={rotateCards}
                className="absolute w-full cursor-pointer"
                style={{
                  top:    `${(stackCount - index) * 10}px`,
                  left:   `${(stackCount - index) * 4}px`,
                  right:  `-${(stackCount - index) * 4}px`,
                  zIndex: index + 1,
                  width:  `calc(100% - ${(stackCount - index) * 8}px)`,
                }}
              >
                <LoyaltyCardUI card={card} />
              </div>
            ))}

            <div className="relative" style={{ zIndex: stackCount + 1 }}>
              <LoyaltyCardUI
                isActive
                activeStamps={activeStamps}
                stampsLeft={stampsLeft}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};