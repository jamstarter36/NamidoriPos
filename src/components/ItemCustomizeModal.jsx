import { useState, useEffect } from "react";
import { getProducts } from "../api";

export const ItemCustomizeModal = ({ item, onClose, onAddToCart }) => {
  const [size, setSize] = useState(null);
  const [addons, setAddons] = useState([]);
  const [allAddons, setAllAddons] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sizes, setSizes] = useState([]);

  // Fetch add-ons
  useEffect(() => {
    getProducts()
      .then((res) => {
        const addonItems = res.data.filter((p) => !p.category || p.category.trim() === "");
        const sizeItem = addonItems.find((p) => p.name.toLowerCase().includes("oz cup"));
        const addonOnly = addonItems.filter((p) => !p.name.toLowerCase().includes("oz cup"));

        setAllAddons(addonOnly);

        // Use item's own size_price if available, fallback to default 16oz cup price
        const sixteenOzPrice = item.size_price
          ? item.size_price
          : sizeItem ? sizeItem.price : 45;

        setSizes([
          { label: "12 oz", extraPrice: 0, id: null },
          ...(sizeItem ? [{ label: "16 oz", extraPrice: sixteenOzPrice, id: sizeItem.id }] : []),
        ]);

        setSize({ label: "12 oz", extraPrice: 0, id: null });
      })
      .finally(() => setLoading(false));
  }, []);

  // ✅ ADD (increase qty)
  const addAddon = (addon) => {
    setSelectedAddons((prev) => {
      const existing = prev.find((a) => a.id === addon.id);
      if (existing) {
        return prev.map((a) =>
          a.id === addon.id ? { ...a, qty: a.qty + 1 } : a
        );
      }
      return [...prev, { ...addon, qty: 1 }];
    });
  };

  // ✅ REMOVE (decrease qty)
  const removeAddon = (addon) => {
    setSelectedAddons((prev) => {
      const existing = prev.find((a) => a.id === addon.id);
      if (!existing) return prev;
      if (existing.qty === 1) {
        return prev.filter((a) => a.id !== addon.id);
      }
      return prev.map((a) =>
        a.id === addon.id ? { ...a, qty: a.qty - 1 } : a
      );
    });
  };

  // ✅ FIXED total
  const addonTotal = selectedAddons.reduce((s, a) => s + a.price * a.qty, 0);
  const totalPrice = size ? item.price + size.extraPrice + addonTotal : item.price;

  const handleAdd = () => {
    const customizedItem = {
      ...item,
      id: `${item.id}_${size?.label}_${selectedAddons.map(a => `${a.id}-${a.qty}`).join("_") || "plain"}`,
      originalId: item.id,
      price: totalPrice,
      size: size?.label,
      addons: selectedAddons.map((a) => `${a.name} x${a.qty}`),
      name: item.name,
      displayName: `${item.name}${
        selectedAddons.length > 0
          ? ` (+${selectedAddons.map(a => `${a.name} x${a.qty}`).join(", ")})`
          : ""
      }`,
    };

    onAddToCart(customizedItem);
    onClose();
  };

  const isUrl = item.icon && item.icon.startsWith("http");

  if (loading)
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <p className="text-white font-bold">Loading...</p>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
      <div className="bg-white border-2 border-[#a8b48a] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="relative flex-shrink-0 rounded-t-3xl overflow-hidden">
          {isUrl ? (
            <img
              src={item.icon}
              alt={item.name}
              className="w-full h-28 object-contain bg-white"
            />
          ) : (
            <div className="w-full h-28 bg-green-50 flex items-center justify-center text-5xl">
              {item.icon}
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/30 text-white flex items-center justify-center text-xs font-bold hover:bg-black/50 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-stone-800">{item.name}</h3>
              <p className="text-xs text-stone-400">{item.category}</p>
            </div>
            <p className="text-base font-bold text-amber-700">₱{totalPrice}</p>
          </div>

          {/* Sizes */}
          {sizes.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                Size
              </p>
              <div className="flex gap-2">
                {sizes.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setSize(s)}
                    className={`flex-1 py-2 rounded-xl border-2 transition-all ${
                      size?.label === s.label
                        ? "border-green-600 bg-green-50 text-green-800"
                        : "border-stone-200 bg-stone-50 text-stone-600 hover:border-green-300"
                    }`}
                  >
                    <p className="text-xs font-bold">{s.label}</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      {s.extraPrice === 0 ? "Base price" : `+₱${s.extraPrice}`}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons with qty */}
          {allAddons.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                Add-ons
              </p>
              <div className="flex flex-col gap-1.5">
                {allAddons.map((addon) => {
                  const selected = selectedAddons.find((a) => a.id === addon.id);

                  return (
                    <div
                      key={addon.id}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl border-2 transition-all ${
                        selected ? "border-green-600 bg-green-50" : "border-stone-200 bg-stone-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold">{addon.name}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => removeAddon(addon)}
                          className={`w-5 h-5 text-xs font-bold rounded transition-all ${
                            selected ? "bg-stone-200 text-stone-700 hover:bg-stone-300" : "bg-stone-100 text-stone-300 cursor-not-allowed"
                          }`}
                          disabled={!selected}
                        >
                          −
                        </button>

                        <span className="text-xs font-bold w-4 text-center">
                          {selected ? selected.qty : 0}
                        </span>

                        <button
                          onClick={() => addAddon(addon)}
                          className="w-5 h-5 text-xs font-bold bg-green-700 text-white rounded hover:bg-green-800 transition-all"
                        >
                          +
                        </button>

                        <span className="text-xs font-bold text-stone-500 ml-1">
                          ₱{addon.price}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Breakdown */}
          <div className="bg-stone-50 rounded-xl px-3 py-2.5 mb-3 border border-stone-100">
            <div className="flex justify-between text-xs text-stone-400 mb-1">
              <span>Base price ({size?.label})</span>
              <span>₱{item.price + (size?.extraPrice || 0)}</span>
            </div>

            {selectedAddons.map((a) => (
              <div
                key={a.id}
                className="flex justify-between text-xs text-stone-400 mb-1"
              >
                <span>
                  {a.name} x{a.qty}
                </span>
                <span>+₱{a.price * a.qty}</span>
              </div>
            ))}

            <div className="flex justify-between text-sm font-bold text-stone-800 border-t border-stone-200 pt-2 mt-1">
              <span>Total</span>
              <span className="text-amber-700">₱{totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="p-4 flex-shrink-0 border-t border-stone-100">
          <button
            onClick={handleAdd}
            className="w-full py-3 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-bold transition-all shadow-md active:scale-95"
          >
            Add to Cart — ₱{totalPrice}
          </button>
        </div>
      </div>
    </div>
  );
};