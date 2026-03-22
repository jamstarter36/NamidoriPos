import { useState, useEffect, useRef } from "react";
import { CartRow } from "./CartRow";
import { getMembers } from "../api";

export const CartPanel = ({ cart, onAdd, onRemove, onClear, onCheckout, payAnim, items }) => {
  const [vatEnabled, setVatEnabled]         = useState(false);
  const [vatRate, setVatRate]               = useState(12);
  const [editingVat, setEditingVat]         = useState(false);
  const [members, setMembers]               = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showFreeDrink, setShowFreeDrink]   = useState(false);
  const [freeAdded, setFreeAdded]           = useState(false);
  const [search, setSearch]                 = useState("");
  const [showDropdown, setShowDropdown]     = useState(false);

  const selectedMemberRef = useRef(selectedMember);
  useEffect(() => { selectedMemberRef.current = selectedMember; }, [selectedMember]);

  const fetchMembers = (silent = true) => {
    getMembers()
      .then((res) => {
        setMembers(res.data);
        const current = selectedMemberRef.current;
        if (current) {
          const updated = res.data.find((m) => m.id === current.id);
          if (updated) setSelectedMember({ ...updated, stamps: parseInt(updated.stamps) || 0 });
        }
      })
      .catch((err) => console.error("Failed to fetch members:", err));
  };

  useEffect(() => {
    fetchMembers();
    const interval = setInterval(() => fetchMembers(), 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredMembers = members.filter((m) =>
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectMember = (member) => {
    member.stamps = parseInt(member.stamps) || 0;
    setSelectedMember(member);
    setSearch(member.full_name);
    setShowDropdown(false);
    setFreeAdded(false);
  };

  const handleClearMember = () => {
    setSelectedMember(null);
    setSearch("");
    setShowDropdown(false);
    setFreeAdded(false);
  };

  const subtotal   = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const vatAmount  = vatEnabled ? Math.round(subtotal * (vatRate / 100)) : 0;
  const total      = subtotal + vatAmount;
  const totalItems = cart.filter(c => !c.isFree).reduce((s, c) => s + c.qty, 0);
  const hasFreeItem = cart.some((c) => c.price === 0 && c.isFree);

  const handleCheckout = () => {
    onCheckout(subtotal, vatEnabled ? vatRate : 0, vatAmount, total, selectedMember);
  };

  const stampsAfter   = selectedMember ? (parseInt(selectedMember.stamps) || 0) + totalItems : 0;
  const reachesTarget = selectedMember && stampsAfter >= 8 && !hasFreeItem && !freeAdded;

  const handleAddFreeDrink = (item) => {
    onAdd({ ...item, id: `free_${item.id}_${Date.now()}`, price: 0, isFree: true, qty: 1, name: `${item.name} (FREE 🎉)` });
    setFreeAdded(true);
    setShowFreeDrink(false);
  };

  return (
    <div className="w-full md:w-72 bg-white border-l-0 md:border-l-2 border-[#a8b48a] flex flex-col h-full shadow-lg">

      {/* Header */}
      <div className="px-4 md:px-5 py-3 md:py-3.5 border-b border-stone-100">
        <p className="text-sm font-bold text-green-800">Current Order</p>
        <p className="text-[11px] text-stone-400">{cart.reduce((s, c) => s + c.qty, 0)} item(s)</p>
      </div>

      {/* Member section */}
      <div className="px-4 md:px-5 pt-3 pb-3 border-b border-stone-100 bg-[#f5f2e8]">
        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Attach Member</p>

        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={search}
            placeholder="🔍 Search member name..."
            onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); setSelectedMember(null); }}
            onFocus={() => setShowDropdown(true)}
            className="w-full px-3 py-2.5 rounded-xl border-2 border-[#a8b48a] bg-white text-stone-700 text-xs font-semibold outline-none focus:border-green-500 transition-all"
          />
          {search && (
            <button onClick={handleClearMember} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-red-400 text-sm font-bold">
              ✕
            </button>
          )}

          {/* Dropdown results */}
          {showDropdown && search && filteredMembers.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border-2 border-[#a8b48a] rounded-xl mt-1 shadow-lg z-20 max-h-36 overflow-y-auto">
              {filteredMembers.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectMember(m)}
                  className="w-full text-left px-3 py-2.5 hover:bg-green-50 transition-all border-b border-stone-100 last:border-0"
                >
                  <p className="text-xs font-semibold text-stone-700">{m.full_name}</p>
                  <p className="text-[10px] text-stone-400">{m.stamps} stamp{m.stamps !== 1 ? "s" : ""} · {m.email}</p>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {showDropdown && search && filteredMembers.length === 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border-2 border-[#a8b48a] rounded-xl mt-1 shadow-lg z-20 p-3 text-center">
              <p className="text-xs text-stone-400">No member found</p>
            </div>
          )}
        </div>

        {selectedMember && (
          <div className="mt-2.5 bg-white border-2 border-[#a8b48a] rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-sm">👤</div>
                <div>
                  <p className="text-xs font-bold text-green-800">{selectedMember.full_name}</p>
                  <p className="text-[10px] text-stone-400">{selectedMember.stamps} stamps collected</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                +{totalItems} new
              </span>
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`flex-1 h-2 rounded-full transition-all ${
                  i < (parseInt(selectedMember.stamps) || 0) ? "bg-green-500"
                  : i < stampsAfter ? "bg-amber-400" : "bg-stone-200"
                }`} />
              ))}
            </div>
            <p className="text-[10px] text-stone-400 mt-1 text-right">{Math.min(stampsAfter, 8)}/8</p>
          </div>
        )}

        {reachesTarget && (
          <button onClick={() => setShowFreeDrink(true)} className="mt-2 w-full py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[11px] font-bold tracking-wide transition-all shadow-md hover:shadow-lg active:scale-95">
            🎉 8 Stamps Reached! Choose Free Drink
          </button>
        )}
        {freeAdded && (
          <div className="mt-2 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-green-50 border border-green-200">
            <span className="text-xs">✅</span>
            <p className="text-[11px] text-green-700 font-bold">Free drink added to cart!</p>
          </div>
        )}
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto px-4 md:px-5 py-2">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-stone-300 gap-2 pb-8">
            <span className="text-4xl">🍵</span>
            <p className="text-xs">Tap an item to begin</p>
          </div>
        ) : (
          cart.map((item) => (
            <CartRow key={item.id} item={item} onAdd={() => onAdd(item)} onRemove={() => onRemove(item.id)} />
          ))
        )}
      </div>

      {/* Totals + Checkout */}
      {cart.length > 0 && (
        <div className="px-4 md:px-5 py-4 border-t border-stone-100 bg-stone-50">
          {/* VAT Toggle */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button onClick={() => setVatEnabled((v) => !v)} className={`relative w-9 h-5 rounded-full transition-all flex-shrink-0 ${vatEnabled ? "bg-green-600" : "bg-stone-300"}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${vatEnabled ? "left-4" : "left-0.5"}`} />
              </button>
              <span className="text-xs text-stone-500 font-medium">VAT</span>
            </div>
            {vatEnabled && (
              <div className="flex items-center gap-1">
                {editingVat ? (
                  <>
                    <input type="number" value={vatRate} min={0} max={100} autoFocus
                      onChange={(e) => setVatRate(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-12 text-center text-xs font-bold border-2 border-green-400 rounded-lg py-0.5 outline-none bg-white text-stone-700"
                    />
                    <span className="text-xs text-stone-400">%</span>
                    <button onClick={() => setEditingVat(false)} className="text-[10px] font-bold text-white bg-green-600 px-2 py-0.5 rounded-lg hover:bg-green-700 transition-all">✓</button>
                  </>
                ) : (
                  <button onClick={() => setEditingVat(true)} className="text-xs font-bold text-green-700 border-2 border-dashed border-green-300 px-2 py-0.5 rounded-lg hover:bg-green-50 transition-all">
                    {vatRate}% ✎
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between text-xs text-stone-400 mb-1"><span>Subtotal</span><span>₱{subtotal}</span></div>
          <div className={`flex justify-between text-xs mb-3 ${vatEnabled ? "text-stone-400" : "text-stone-300 line-through"}`}>
            <span>VAT ({vatRate}%)</span><span>₱{vatAmount}</span>
          </div>
          <div className="flex justify-between text-base font-bold mb-4">
            <span className="text-stone-700">Total</span>
            <span className="text-amber-700">₱{total}</span>
          </div>

          <button onClick={handleCheckout} className={`w-full py-3 rounded-xl text-sm font-bold text-white transition-all shadow-md ${payAnim ? "bg-green-600 scale-95" : "bg-green-700 hover:bg-green-800 active:scale-95"}`}>
            {payAnim ? "⏳ Processing…" : `💳 Checkout — ₱${total}`}
          </button>
          <button
            onClick={() => {
              onClear();
              setFreeAdded(false);
              setShowFreeDrink(false);
              if (selectedMember) fetchMembers();
            }}
            className="w-full mt-2 py-2 rounded-lg text-xs text-stone-400 border border-stone-200 hover:border-red-300 hover:text-red-400 transition-all bg-white"
          >
            Clear Order
          </button>
        </div>
      )}

      {/* Free drink modal */}
      {showFreeDrink && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-[#a8b48a] rounded-2xl p-6 md:p-7 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-lg font-bold text-green-800">Congratulations!</h3>
              <p className="text-xs text-stone-400 mt-1">{selectedMember?.full_name} earned a free drink!</p>
            </div>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto mb-5">
              {items.map((item) => (
                <button key={item.id} onClick={() => handleAddFreeDrink(item)}
                  className="flex items-center gap-3 p-3 rounded-xl border-2 border-[#a8b48a] hover:border-green-500 hover:bg-green-50 transition-all text-left"
                >
                  {item.icon && item.icon.startsWith("http") ? (
                    <img src={item.icon} alt={item.name} className="w-8 h-8 rounded-lg object-cover" />
                  ) : (
                    <span className="text-2xl">{item.icon}</span>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-stone-800">{item.name}</p>
                    <p className="text-xs text-stone-400 line-through">₱{item.price}</p>
                  </div>
                  <span className="ml-auto text-xs font-bold text-green-600">FREE</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowFreeDrink(false)} className="w-full py-2.5 rounded-xl border border-stone-200 text-stone-400 text-sm font-semibold hover:bg-stone-50 transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};