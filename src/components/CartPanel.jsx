  import { useState, useEffect, useRef } from "react";
  import { CartRow } from "./CartRow";
  import { getMembers, getLoyaltyCards, addStamps, saveOrder } from "../api";

  export const CartPanel = ({ cart, onAdd, onRemove, onClear, onCheckout, payAnim, items }) => {
    const [vatEnabled, setVatEnabled]         = useState(false);
    const [vatRate, setVatRate]               = useState(12);
    const [editingVat, setEditingVat]         = useState(false);
    const [members, setMembers]               = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [loyaltyCards, setLoyaltyCards]     = useState([]);
    const [search, setSearch]                 = useState("");
    const [showDropdown, setShowDropdown]     = useState(false);
    const [discountsToUse, setDiscountsToUse] = useState(0);
    const [tendered, setTendered]             = useState("");

    const selectedMemberRef = useRef(selectedMember);
    useEffect(() => { selectedMemberRef.current = selectedMember; }, [selectedMember]);

    const fetchMembers = () => {
      getMembers()
        .then((res) => {
          setMembers(res.data);
          const current = selectedMemberRef.current;
          if (current) {
            const updated = res.data.find((m) => m.id === current.id);
            if (updated) setSelectedMember(updated);
          }
        })
        .catch((err) => console.error("Failed to fetch members:", err));
    };

    useEffect(() => {
      fetchMembers();
      const interval = setInterval(fetchMembers, 5000);
      return () => clearInterval(interval);
    }, []);

    const fetchLoyaltyCards = (member_id) => {
      getLoyaltyCards(member_id)
        .then((res) => setLoyaltyCards(res.data))
        .catch((err) => console.error("Failed to fetch loyalty cards:", err));
    };

    const filteredMembers = members.filter((m) =>
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelectMember = (member) => {
      setSelectedMember(member);
      setSearch(member.full_name);
      setShowDropdown(false);
      setUseDiscount(false);
      fetchLoyaltyCards(member.id);
    };

    const handleClearMember = () => {
      setSelectedMember(null);
      setLoyaltyCards([]);
      setSearch("");
      setShowDropdown(false);
      setUseDiscount(false);
    };

    const subtotal   = cart.reduce((s, c) => s + c.price * c.qty, 0);
    const vatAmount  = vatEnabled ? Math.round(subtotal * (vatRate / 100)) : 0;
    const totalItems = cart.filter(c => !c.isFree).reduce((s, c) => s + c.qty, 0);

    const activeCard           = loyaltyCards.find((c) => !c.completed);
    const activeStamps         = activeCard ? activeCard.stamps : 0;
    const completedUnusedCards = loyaltyCards.filter((c) => c.completed && !c.used);
    const hasDiscount          = completedUnusedCards.length > 0;

    const DISCOUNT_AMOUNT = 165;
    const discount = Math.min(DISCOUNT_AMOUNT * discountsToUse, subtotal + vatAmount);
    const total    = Math.max(0, subtotal + vatAmount - discount);

    const handleCheckout = () => {
      onCheckout(subtotal, vatEnabled ? vatRate : 0, vatAmount, total, selectedMember, discount, totalItems);
      setTendered("");
    };

    return (
      <div className="w-full md:w-72 bg-white flex flex-col h-full overflow-hidden border-l-4 border-[#a8b48a]">

        {/* Scrollable area */}
        <div className="flex-1 overflow-y-auto flex flex-col min-h-0">

          {/* Header */}
          <div className="px-4 md:px-5 py-3 md:py-3.5 border-b border-stone-100">
            <p className="text-sm font-bold text-green-800">Current Order</p>
            <p className="text-[11px] text-stone-400">{cart.reduce((s, c) => s + c.qty, 0)} item(s)</p>
          </div>

          {/* Member section */}
          <div className="px-4 md:px-5 pt-3 pb-3 border-b border-stone-100 bg-[#f5f2e8]">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Attach Member</p>

            <div className="relative">
              <input
                type="text"
                value={search}
                placeholder="🔍 Search member name..."
                onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); setSelectedMember(null); setLoyaltyCards([]); }}
                onFocus={() => setShowDropdown(true)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-[#a8b48a] bg-white text-stone-700 text-xs font-semibold outline-none focus:border-green-500 transition-all"
              />
              {search && (
                <button onClick={handleClearMember} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-red-400 text-sm font-bold">✕</button>
              )}
              {showDropdown && search && filteredMembers.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border-2 border-[#a8b48a] rounded-xl mt-1 shadow-lg z-20 max-h-36 overflow-y-auto">
                  {filteredMembers.map((m) => (
                    <button key={m.id} onClick={() => handleSelectMember(m)}
                      className="w-full text-left px-3 py-2.5 hover:bg-green-50 transition-all border-b border-stone-100 last:border-0">
                      <p className="text-xs font-semibold text-stone-700">{m.full_name}</p>
                      <p className="text-[10px] text-stone-400">{m.email}</p>
                    </button>
                  ))}
                </div>
              )}
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
                      <p className="text-[10px] text-stone-400">{activeStamps} stamps · {completedUnusedCards.length} reward{completedUnusedCards.length !== 1 ? "s" : ""} available</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    +{totalItems} new
                  </span>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className={`flex-1 h-2 rounded-full transition-all ${
                      i < activeStamps ? "bg-green-500" : "bg-stone-200"
                    }`} />
                  ))}
                </div>
                <p className="text-[10px] text-stone-400 mt-1 text-right">{activeStamps}/8</p>
              </div>
            )}
            {hasDiscount && (
              <div className="mt-2 bg-amber-50 border-2 border-amber-200 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs font-bold text-amber-700">🎉 Rewards Available</p>
                    <p className="text-[10px] text-amber-600 mt-0.5">
                      {completedUnusedCards.length} card{completedUnusedCards.length !== 1 ? "s" : ""} · ₱{DISCOUNT_AMOUNT} each
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-stone-500 font-semibold">Apply how many?</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDiscountsToUse((v) => Math.max(0, v - 1))}
                      className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 font-bold text-sm hover:bg-amber-300 transition-all"
                    >−</button>
                    <span className="text-sm font-bold text-amber-700 w-4 text-center">{discountsToUse}</span>
                    <button
                      onClick={() => setDiscountsToUse((v) => Math.min(completedUnusedCards.length, v + 1))}
                      className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 font-bold text-sm hover:bg-amber-300 transition-all"
                    >+</button>
                  </div>
                </div>
                {discountsToUse > 0 && (
                  <p className="text-[10px] text-green-700 font-semibold mt-2 text-center">
                    ✅ ₱{DISCOUNT_AMOUNT * discountsToUse} discount will be applied!
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Cart items */}
          <div className="flex-1 px-4 md:px-5 py-2">
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

          {/* Totals + inputs */}
          {cart.length > 0 && (
            <div className="px-4 md:px-5 pt-4 pb-2 border-t border-stone-100 bg-stone-50">

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

              {/* Line items */}
              <div className="flex justify-between text-xs text-stone-400 mb-1"><span>Subtotal</span><span>₱{subtotal}</span></div>
              <div className={`flex justify-between text-xs mb-1 ${vatEnabled ? "text-stone-400" : "text-stone-300 line-through"}`}>
                <span>VAT ({vatRate}%)</span><span>₱{vatAmount}</span>
              </div>
              {discountsToUse > 0 && (
                <div className="flex justify-between text-xs text-green-600 font-semibold mb-1">
                  <span>🎉 Loyalty Discount</span>
                  <span>-₱{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold border-t border-stone-200 pt-2 mt-1 mb-3">
                <span className="text-stone-700">Total</span>
                <span className="text-amber-700">₱{total}</span>
              </div>

              {/* Amount Tendered */}
              <div className="mb-3">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Amount Tendered</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">₱</span>
                  <input
                    type="number"
                    min={0}
                    value={tendered}
                    onChange={(e) => setTendered(e.target.value)}
                    placeholder={total}
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl border-2 border-[#a8b48a] bg-white text-stone-700 text-sm font-bold outline-none focus:border-green-500 transition-all"
                  />
                </div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {[20, 50, 100, 200, 500, 1000]
                    .filter((bill) => bill >= total)
                    .slice(0, 4)
                    .map((bill) => (
                      <button
                        key={bill}
                        onClick={() => setTendered(String(bill))}
                        className="px-2.5 py-1 rounded-lg border border-[#a8b48a] text-[10px] font-bold text-green-800 bg-white hover:bg-green-50 hover:border-green-500 transition-all"
                      >
                        ₱{bill}
                      </button>
                    ))}
                  <button
                    onClick={() => setTendered(String(total))}
                    className="px-2.5 py-1 rounded-lg border border-amber-300 text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-all"
                  >
                    Exact
                  </button>
                </div>
              </div>

              {/* Change */}
              {tendered !== "" && Number(tendered) >= total && (
                <div className="flex justify-between items-center bg-green-50 border-2 border-green-300 rounded-xl px-3 py-2.5 mb-1">
                  <span className="text-xs font-bold text-green-700">Change</span>
                  <span className="text-lg font-bold text-green-700">₱{Number(tendered) - total}</span>
                </div>
              )}
              {tendered !== "" && Number(tendered) < total && (
                <div className="flex justify-between items-center bg-red-50 border-2 border-red-200 rounded-xl px-3 py-2.5 mb-1">
                  <span className="text-xs font-bold text-red-500">Short by</span>
                  <span className="text-lg font-bold text-red-500">₱{total - Number(tendered)}</span>
                </div>
              )}
            </div>
          )}

        </div>
        {/* END scrollable area */}

        {/* Pinned buttons — always visible */}
        {cart.length > 0 && (
          <div className="px-4 md:px-5 pb-4 pt-2 bg-stone-50 border-t border-stone-100 flex-shrink-0 border-l-4 border-[#a8b48a]">
            <button
              onClick={handleCheckout}
              disabled={payAnim || tendered === "" || Number(tendered) < total}
              className={`w-full py-3 rounded-xl text-sm font-bold text-white transition-all shadow-md
                ${payAnim ? "bg-green-600 scale-95"
                : tendered === "" || Number(tendered) < total ? "bg-stone-300 cursor-not-allowed"
                : "bg-green-700 hover:bg-green-800 active:scale-95"}`}
            >
              {payAnim ? "⏳ Processing…"
              : tendered === "" ? "Enter Amount Tendered"
              : Number(tendered) < total ? `Short by ₱${total - Number(tendered)}`
              : `💳 Checkout — ₱${total}`}
            </button>
            <button
              onClick={() => { onClear(); setSearch(""); setSelectedMember(null); setLoyaltyCards([]); setDiscountsToUse(0); setTendered(""); }}
              className="w-full mt-2 py-2 rounded-lg text-xs text-stone-400 border border-stone-200 hover:border-red-300 hover:text-red-400 transition-all bg-white"
            >
              Clear Order
            </button>
          </div>
        )}

      </div>
    );
  };