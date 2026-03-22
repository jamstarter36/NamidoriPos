import { useState, useEffect } from "react";
import NamiLogo from "../images/NamiLogo.png"

export const Header = ({ view, setView, onLogout }) => {
  const [menuOpen, setMenuOpen]     = useState(false);
  const [serverStatus, setServerStatus] = useState("checking"); // "online" | "offline" | "checking"

  useEffect(() => {
    const checkStatus = () => {
      fetch(`${import.meta.env.VITE_API_URL}/health`)
        .then(() => setServerStatus("online"))
        .catch(() => setServerStatus("offline"));
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    online:   { color: "bg-green-400",  text: "Live",     pulse: true  },
    offline:  { color: "bg-red-500",    text: "Offline",  pulse: false },
    checking: { color: "bg-yellow-400", text: "Checking", pulse: true  },
  };

  const status = statusConfig[serverStatus];

  const tabs = [
    { key: "pos",   label: "⚡ Order" },
    { key: "sales", label: "📊 Sales" },
    { key: "stock", label: "📦 Stock" },
  ];

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 flex-shrink-0 shadow-md bg-[#5c3317]">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/20 flex items-center justify-center text-base md:text-lg shadow-sm"><img src={NamiLogo} /></div>
        <div>
          <p className="text-xs md:text-sm font-bold tracking-widest text-white uppercase">Namidori</p>
          <p className="hidden sm:block text-[9px] text-white/50 tracking-widest uppercase">Matcha Cafe · POS</p>
        </div>
      </div>

      {/* Desktop Nav tabs */}
      <div className="hidden md:flex gap-2">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`px-4 py-1.5 rounded-lg text-[11px] font-semibold tracking-widest uppercase transition-all border ${
              view === key
                ? "bg-white text-stone-800 border-white shadow"
                : "bg-transparent text-white/60 border-white/30 hover:border-white/70 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${status.color} ${status.pulse ? "animate-pulse" : ""}`} />
          <span className="text-[11px] text-white/60">{status.text}</span>
        </div>
        <button
          onClick={onLogout}
          className="hidden md:block px-4 py-1.5 rounded-lg text-[11px] font-semibold tracking-widest uppercase text-white/60 border border-white/30 hover:border-white hover:text-white transition-all"
        >
          Log Out
        </button>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1 p-1"
        >
          <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
          <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-[#5c3317] border-t border-white/10 z-50 shadow-lg">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setView(key); setMenuOpen(false); }}
              className={`w-full text-left px-6 py-3 text-sm font-semibold transition-all ${
                view === key ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={onLogout}
            className="w-full text-left px-6 py-3 text-sm font-semibold text-red-300 hover:bg-white/10 transition-all border-t border-white/10"
          >
            🚪 Log Out
          </button>
        </div>
      )}
    </header>
  );
};