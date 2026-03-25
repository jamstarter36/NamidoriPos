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
        className="md:hidden fixed bottom-5 right-5 z-30 w-14 h-14 rounded-full bg-amber-900 text-white shadow-xl flex items-center justify-center active:scale-95 transition-all"
      >
        {showCart ? (
          <span className="text-lg font-bold">✕</span>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-9.8-3h10.6c.8 0 1.5-.4 1.8-1.1l3.4-6.9c.3-.6-.1-1-.7-1H5.2L4.3 4H1v2h2l3.6 8.6L5.2 17H19v-2H6.9l-.7-2z"/>
          </svg>
        )}
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