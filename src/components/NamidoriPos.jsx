import { useState, useEffect } from "react";
import { getProducts, updateStock, saveOrder, updateStamps } from "../api";
import { Header } from "./Header";
import { PosView } from "./PosView";
import { SalesView } from "./SalesView";
import { StockView } from "./StockView";

export const NamidoriPos = ({ onLogout }) => {
  const [view, setView]       = useState("pos");
  const [items, setItems]     = useState([]);
  const [cart, setCart]       = useState([]);
  const [paid, setPaid]       = useState(false);
  const [payAnim, setPayAnim] = useState(false);
  const [checkoutKey, setCheckoutKey] = useState(0);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    getProducts()
      .then((res) => setItems(res.data))
      .catch((err) => console.error("Failed to fetch products:", err))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (item) =>
    setCart((prev) => {
      // Free items always added as separate entry
      if (item.isFree) return [...prev, { ...item, qty: 1 }];
      // Match on full id (includes size+addons) so same drink different size = separate row
      const ex = prev.find((c) => c.id === item.id);
      return ex
        ? prev.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c))
        : [...prev, { ...item, qty: 1 }];
    });

  const removeFromCart = (id) =>
    setCart((prev) => {
      const ex = prev.find((c) => c.id === id);
      return ex.qty === 1
        ? prev.filter((c) => c.id !== id)
        : prev.map((c) => (c.id === id ? { ...c, qty: c.qty - 1 } : c));
    });

  // ── Checkout ──────────────────────────────────────────────────────────────
  const handleCheckout = (subtotal, vatRate, vatAmount, total, member) => {
    if (!cart.length) return;
    setPayAnim(true);
    setTimeout(async () => {
      try {
        // Update stock for non-free items
        const stockUpdates = cart
          .filter((c) => !c.isFree)
          .map((c) => updateStock(c.originalId || c.id, Math.max(0, c.stock - c.qty)));

        // Save order
        const order = {
          items: cart,
          subtotal,
          vat_rate: vatRate,
          vat_amount: vatAmount,
          total,
          member_name: member ? member.full_name : "Walk-in",
        };

        await Promise.all([...stockUpdates, saveOrder(order)]);

        // Update member stamps if attached
        if (member) {
          const earnedStamps = cart
            .filter((c) => !c.isFree)
            .reduce((s, c) => s + c.qty, 0);
          const currentStamps = parseInt(member.stamps) || 0;
          const hasFreeItem   = cart.some((c) => c.isFree);

          // If free drink was redeemed, reset stamps after adding earned ones
          let newStamps = currentStamps + earnedStamps;
          if (hasFreeItem) newStamps = newStamps - 10;

          await updateStamps(member.id, Math.max(0, newStamps));
        }

        getProducts().then((res) => setItems(res.data));
        setCart([]);
        setPaid(true);
        setPayAnim(false);
        setCheckoutKey((k) => k + 1); // resets CartPanel state
        setTimeout(() => setPaid(false), 2200);
      } catch (err) {
        console.error("Checkout failed:", err);
        setPayAnim(false);
      }
    }, 900);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center" style={{ backgroundColor: "#d4dbb8" }}>
      <p className="text-green-800 font-bold text-lg">Loading menu... 🍵</p>
    </div>
  );

  return (
    <div className="flex flex-col h-screen text-stone-800 font-sans overflow-hidden" style={{ backgroundColor: "#d4dbb8" }}>
      <Header view={view} setView={setView} onLogout={onLogout} />

      {view === "pos" && (
        <PosView
          key={checkoutKey}
          items={items}
          setItems={setItems}
          cart={cart}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onClear={() => setCart([])}
          onCheckout={handleCheckout}
          payAnim={payAnim}
          paid={paid}
        />
      )}

      {view === "sales" && <SalesView />}

      {view === "stock" && (
        <StockView items={items} setItems={setItems} />
      )}
    </div>
  );
};