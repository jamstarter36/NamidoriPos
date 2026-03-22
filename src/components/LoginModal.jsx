import { useState } from "react";
import { loginMember } from "../api";
import NamiLogo from "../images/NamiLogo.png";

export const LoginModal = ({ onClose, onSuccess }) => {
  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) { setError("Please fill in all fields"); return; }
    setLoading(true); setError("");
    try {
      const res = await loginMember(form);
      onSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border-2 border-[#a8b48a] rounded-2xl p-6 w-full max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="flex justify-center w-full h-20 mb-3"><img src={NamiLogo} /></div>
          <h2 className="text-xl font-bold text-green-800 font-display tracking-wide">Welcome Back</h2>
          <p className="text-xs text-stone-400 mt-1">Log in to your Namidori account</p>
        </div>

        {[
          { key: "email", label: "Username", type: "text", ph: "Enter your username" },
          { key: "password", label: "Password", type: "password", ph: "Enter your password" },
        ].map(({ key, label, type, ph }) => (
          <div key={key} className="mb-4">
            <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-1.5">{label}</label>
            <input type={type} value={form[key]} placeholder={ph}
              onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-stone-200 bg-stone-50 text-stone-800 text-sm outline-none focus:border-green-400 focus:bg-white transition-all"
            />
          </div>
        ))}

        {error && <p className="text-xs text-red-500 mb-3 text-center">{error}</p>}

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border-2 border-stone-200 text-stone-400 text-sm font-semibold hover:bg-stone-50 transition-all">Cancel</button>
          <button onClick={handleLogin} disabled={loading} className="flex-[2] py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-bold transition-all shadow-md active:scale-95 disabled:opacity-60">
            {loading ? "Logging in..." : "Log In"}
          </button>
        </div>
      </div>
    </div>
  );
};