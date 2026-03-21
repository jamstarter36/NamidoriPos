import { useState } from "react";
import { MenuPanel } from "./MenuPanel";
import { CartPanel } from "./CartPanel";

export const PosView = ({ items, setItems, cart, onAdd, onRemove, onClear, payAnim, onCheckout, paid }) => {
  const [showCart, setShowCart] = useState(false);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  return (
    <div className="flex flex-1 overflow-hidden relative">

      {/* Menu panel — full width on mobile, flex-1 on desktop */}
      <div className={`${showCart ? "hidden" : "flex"} md:flex flex-1 flex-col overflow-hidden`}>
        <MenuPanel items={items} cart={cart} onAdd={onAdd} />
      </div>

      {/* Cart panel — slide in on mobile, fixed sidebar on desktop */}
      <div className={`${showCart ? "flex" : "hidden"} md:flex w-full md:w-72 bg-white border-l-0 md:border-l-2 border-[#a8b48a] flex-col flex-shrink-0 shadow-lg`}>
        <CartPanel
          cart={cart}
          onAdd={onAdd}
          onRemove={onRemove}
          onClear={onClear}
          onCheckout={onCheckout}
          payAnim={payAnim}
          items={items}
        />
      </div>

      {/* Mobile cart toggle button */}
      <button
        onClick={() => setShowCart(!showCart)}
        className="md:hidden fixed bottom-5 right-5 z-30 w-14 h-14 rounded-full bg-green-700 text-white shadow-xl flex items-center justify-center text-xl active:scale-95 transition-all"
      >
        {showCart ? "←" : "🛒"}
        {!showCart && cartCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </button>

      {/* Payment success overlay */}
      {paid && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-20" style={{ backgroundColor: "#d4dbb8f2" }}>
          <span className="text-6xl">✅</span>
          <p className="text-xl font-bold text-green-800">Payment Accepted!</p>
          <p className="text-sm text-stone-400">Order complete — stock updated</p>
        </div>
      )}
    </div>
  );
};