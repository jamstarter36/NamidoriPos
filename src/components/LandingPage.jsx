import { useState } from "react";
import { LoginModal } from "./LoginModal";
import { SignupModal } from "./SignupModal";
import NamiLogo from "../images/NamiLogo.png";

export const LandingPage = ({ onLoginSuccess, onSignupSuccess }) => {
  const [showLogin, setShowLogin]   = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f5f2e8] font-body">

      {/* ── Navbar ── */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4 sticky top-0 z-50 shadow-md bg-[#5c3317]">
        <div className="flex items-center gap-2.5 md:gap-3">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/20 flex items-center justify-center text-base md:text-lg"><img src={NamiLogo} /></div>
          <div>
            <p className="text-xs md:text-sm font-bold tracking-[0.14em] text-white uppercase font-display">NAMIDORI</p>
            <p className="hidden sm:block text-[9px] text-white/50 tracking-widest uppercase">Matcha Shop</p>
          </div>
        </div>

        {/* Desktop buttons */}
        <div className="hidden sm:flex gap-2 md:gap-3">
          <button
            onClick={() => setShowLogin(true)}
            className="px-4 md:px-5 py-2 rounded-lg text-[11px] font-semibold tracking-widest uppercase text-white border border-white/40 hover:border-white bg-transparent transition-all"
          >
            Log In
          </button>
          <button
            onClick={() => setShowSignup(true)}
            className="px-4 md:px-5 py-2 rounded-lg text-[11px] font-semibold tracking-widest uppercase text-green-800 bg-[#d4dbb8] border border-[#d4dbb8] hover:bg-[#c8d4a8] transition-all"
          >
            Sign Up
          </button>
        </div>

        {/* Mobile — single button */}
        <button
          onClick={() => setShowLogin(true)}
          className="sm:hidden px-4 py-2 rounded-lg text-[11px] font-semibold tracking-widest uppercase text-green-800 bg-[#d4dbb8] transition-all"
        >
          Get Started
        </button>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-28 overflow-hidden bg-[#d4dbb8]">
        <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-[#5c3317]/5 pointer-events-none" />
        <div className="absolute -bottom-20 -right-10 w-96 h-96 rounded-full bg-green-800/5 pointer-events-none" />

        {/* Falling leaves */}
        {[
          { left: "5%",  delay: "0s",    duration: "6s",  emoji: "🍃", size: 18 },
          { left: "15%", delay: "1.5s",  duration: "8s",  emoji: "🍂", size: 14 },
          { left: "25%", delay: "3s",    duration: "7s",  emoji: "🍃", size: 22 },
          { left: "40%", delay: "0.5s",  duration: "9s",  emoji: "🌿", size: 16 },
          { left: "55%", delay: "2s",    duration: "6.5s",emoji: "🍃", size: 20 },
          { left: "65%", delay: "4s",    duration: "8s",  emoji: "🍂", size: 15 },
          { left: "75%", delay: "1s",    duration: "7.5s",emoji: "🍃", size: 18 },
          { left: "85%", delay: "3.5s",  duration: "6s",  emoji: "🌿", size: 24 },
          { left: "92%", delay: "2.5s",  duration: "9s",  emoji: "🍃", size: 16 },
          { left: "48%", delay: "5s",    duration: "7s",  emoji: "🍂", size: 20 },
        ].map((leaf, i) => (
          <span key={i} className="leaf" style={{ left: leaf.left, animationDelay: leaf.delay, animationDuration: leaf.duration, fontSize: leaf.size }}>
            {leaf.emoji}
          </span>
        ))}

        <div className="text-6xl mb-5 drop-shadow-lg">🍵</div>
        <p className="text-[10px] font-bold tracking-[0.24em] text-[#5c3317] uppercase mb-4 font-display">
          Est. 2024 · Cebu City
        </p>
        <h1 className="text-5xl md:text-7xl font-semibold text-green-950 leading-tight mb-5 font-display tracking-wide">
          Where Every Sip<br />
          <span className="text-[#5c3317] font-normal italic">Tells a Story</span>
        </h1>
        <p className="text-sm text-[#4a5a3a] max-w-md leading-loose mb-9">
          Namidori is a cozy matcha shop crafting premium Japanese-inspired drinks made with love, quality ingredients, and a whole lot of green goodness.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <button
            onClick={() => setShowSignup(true)}
            className="px-8 py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase text-white bg-green-700 hover:bg-green-900 hover:-translate-y-0.5 transition-all shadow-lg shadow-green-700/30 font-display"
          >
            Join as Member 🍃
          </button>
          <button
            onClick={() => setShowLogin(true)}
            className="px-8 py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase text-green-700 bg-white border-2 border-[#a8b48a] hover:border-green-700 hover:-translate-y-0.5 transition-all font-display"
          >
            Log In
          </button>
        </div>
      </section>

      {/* ── About ── */}
      <section className="px-8 py-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] text-[#5c3317] uppercase mb-3 font-display">Our Story</p>
            <h2 className="text-3xl font-semibold text-green-950 leading-snug mb-4 font-display">
              Crafted with<br />
              <span className="italic text-[#5c3317] font-normal">Matcha & Heart</span>
            </h2>
            <p className="text-sm text-[#4a5a3a] leading-loose mb-3">
              Namidori — meaning "green wave" in Japanese — was born from a deep love of matcha culture. We source only the finest ceremonial-grade matcha, blended with locally inspired flavors to create something truly unique.
            </p>
            <p className="text-sm text-[#4a5a3a] leading-loose">
              Every cup is prepared with care, from our classic Matcha Latte to seasonal specials that celebrate the best of Filipino and Japanese flavors.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: "🌿", title: "Premium Matcha",  desc: "Ceremonial-grade matcha sourced directly from Japan" },
              { icon: "🤝", title: "Local Love",      desc: "Supporting local farmers and ingredients" },
              { icon: "✨", title: "Made to Order",   desc: "Every drink freshly prepared just for you" },
              { icon: "🌱", title: "Eco Friendly",    desc: "Sustainable cups and packaging" },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white border-2 border-[#d4dbb8] rounded-2xl p-5 shadow-sm">
                <div className="text-2xl mb-2">{icon}</div>
                <p className="text-xs font-bold text-green-700 mb-1 font-display tracking-wide">{title}</p>
                <p className="text-[11px] text-[#8a9070] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Menu highlights ── */}
      <section className="bg-[#d4dbb8] py-20 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-bold tracking-[0.22em] text-[#5c3317] uppercase mb-3 font-display">Our Menu</p>
            <h2 className="text-3xl font-semibold text-green-950 font-display">
              Fan <span className="italic text-[#5c3317] font-normal">Favorites</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🍵", name: "The Naturals",    price: "₱135", tag: "Bestseller" },
              { icon: "🍵", name: "A Little Life",     price: "₱135", tag: "Bestseller" },
              { icon: "🍵", name: "Thorns and Roses",     price: "₱145", tag: "Bestseller"   },
              { icon: "🍵", name: "Just for the Summer", price: "₱145", tag: "Bestseller"    },
              { icon: "✨", name: "Lucid Dream", price: "₱195", tag: "Special"    },
            ].map(({ icon, name, price, tag }) => (
              <div key={name} className="bg-white border-2 border-[#a8b48a] rounded-2xl overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all">
                <div className="bg-green-50 h-24 flex items-center justify-center text-4xl">{icon}</div>
                <div className="p-4">
                  <p className="text-xs font-bold text-green-950 mb-2 font-display tracking-wide">{name}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-amber-700 font-display">{price}</p>
                    <span className="text-[9px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold">{tag}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Membership CTA ── */}
      <section className="px-8 py-20 max-w-3xl mx-auto text-center">
        <p className="text-[10px] font-bold tracking-[0.22em] text-[#5c3317] uppercase mb-3 font-display">Membership</p>
        <h2 className="text-3xl font-semibold text-green-950 mb-4 font-display">
          Join the <span className="italic text-[#5c3317] font-normal">Namidori Family</span>
        </h2>
        <p className="text-sm text-[#4a5a3a] leading-loose mb-8 max-w-md mx-auto">
          Sign up as a member and enjoy exclusive perks, early access to seasonal drinks, and loyalty rewards every time you order.
        </p>
        <button
          onClick={() => setShowSignup(true)}
          className="px-10 py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase text-white bg-green-700 hover:bg-green-900 hover:-translate-y-0.5 transition-all shadow-lg shadow-green-700/30 font-display"
        >
          Sign Up Free 🍃
        </button>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#5c3317] px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-base"><img src={NamiLogo}/></div>
          <div>
            <p className="text-sm font-bold text-white tracking-widest font-display">NAMIDORI</p>
            <p className="text-[9px] text-white/40 tracking-widest">MATCHA SHOP</p>
          </div>
        </div>
        <p className="text-[11px] text-white/40">© 2024 Namidori. All rights reserved. · Cebu City, Philippines</p>
        <div className="flex gap-6">
          {["Instagram", "Facebook", "TikTok"].map((s) => (
            <p key={s} className="text-[11px] text-white/50 hover:text-white cursor-pointer transition-all">{s}</p>
          ))}
        </div>
      </footer>

      {/* ── Modals ── */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={onLoginSuccess}
        />
      )}
      {showSignup && (
        <SignupModal
          onClose={() => setShowSignup(false)}
          onSuccess={onSignupSuccess}
          onSwitchToLogin={() => { setShowSignup(false); setShowLogin(true); }}
        />
      )}
    </div>
  );
};