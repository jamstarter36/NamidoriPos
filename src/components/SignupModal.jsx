import { useState } from "react";
import { signupMember } from "../api";

export const SignupModal = ({ onClose, onSuccess, onSwitchToLogin }) => {
  const [form, setForm]       = useState({ full_name: "", email: "", password: "", phone: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!form.full_name || !form.email || !form.password || !form.phone) { setError("Please fill in all fields"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true); setError("");
    try {
      const res = await signupMember(form);
      onSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: "Full Name",    key: "full_name", type: "text",     ph: "e.g. Juan dela Cruz" },
    { label: "Username",        key: "email",     type: "text",    ph: "e.g. juandelacruz" },
    { label: "Phone Number", key: "phone",     type: "number",      ph: "e.g. 09123456789" },
    { label: "Password",     key: "password",  type: "password", ph: "At least 6 characters" },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border-2 border-[#a8b48a] rounded-2xl p-6 w-full max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-5">
          <div className="text-4xl mb-3">🍵</div>
          <h2 className="text-xl font-bold text-green-800 font-display tracking-wide">Join Namidori</h2>
          <p className="text-xs text-stone-400 mt-1">Create your free member account</p>
        </div>

        {fields.map(({ label, key, type, ph }) => (
          <div key={key} className="mb-3.5">
            <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-1.5">{label}</label>
            <input type={type} value={form[key]} placeholder={ph}
              onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-stone-200 bg-stone-50 text-stone-800 text-sm outline-none focus:border-green-400 focus:bg-white transition-all"
            />
          </div>
        ))}

        {error && <p className="text-xs text-red-500 mb-3 text-center">{error}</p>}

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border-2 border-stone-200 text-stone-400 text-sm font-semibold hover:bg-stone-50 transition-all">Cancel</button>
          <button onClick={handleSignup} disabled={loading} className="flex-[2] py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-bold transition-all shadow-md active:scale-95 disabled:opacity-60">
            {loading ? "Creating account..." : "Sign Up For Free 🍃"}
          </button>
        </div>

        <p className="text-center text-xs text-stone-400 mt-4">
          Already a member?{" "}
          <span onClick={onSwitchToLogin} className="text-green-700 font-semibold cursor-pointer hover:underline">Log in here</span>
        </p>
      </div>
    </div>
  );
};