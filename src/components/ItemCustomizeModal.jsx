import { useState } from "react";

const SIZES = [
  { label: "12 oz", extraPrice: 0 },
  { label: "16 oz", extraPrice: 40 },
];

const ADDONS = [
  { key: "matcha",   label: "Extra Matcha",   desc: "2g matcha powder", price: 30 },
  { key: "seasalt",  label: "Sea Salt Cream",  desc: "10ml sea salt cream", price: 15 },
];

export const ItemCustomizeModal = ({ item, onClose, onAddToCart }) => {
  const [size, setSize]     = useState(SIZES[0]);
  const [addons, setAddons] = useState([]);

  const toggleAddon = (addon) => {
    setAddons((prev) =>
      prev.find((a) => a.key === addon.key)
        ? prev.filter((a) => a.key !== addon.key)
        : [...prev, addon]
    );
  };

  const addonTotal  = addons.reduce((s, a) => s + a.price, 0);
  const totalPrice  = item.price + size.extraPrice + addonTotal;

  const handleAdd = () => {
    const customizedItem = {
      ...item,
      // Give unique id so same item with different options = separate cart entry
      id: `${item.id}_${size.label}_${addons.map(a => a.key).join("_") || "plain"}`,
      originalId: item.id,
      price: totalPrice,
      size: size.label,
      addons: addons.map((a) => a.label),
      name: item.name,
      displayName: `${item.name}${addons.length > 0 ? ` (+${addons.map(a => a.label).join(", ")})` : ""}`,
    };
    onAddToCart(customizedItem);
    onClose();
  };

  const isUrl = item.icon && item.icon.startsWith("http");

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white border-2 border-[#a8b48a] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm shadow-2xl overflow-hidden">

        {/* Item header */}
        <div className="relative">
          {isUrl ? (
            <img src={item.icon} alt={item.name} className="w-full h-36 object-contain bg-white" />
          ) : (
            <div className="w-full h-36 bg-green-50 flex items-center justify-center text-6xl">
              {item.icon}
            </div>
          )}
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center text-sm font-bold hover:bg-black/50 transition-all"
          >
            ✕
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-stone-800">{item.name}</h3>
              <p className="text-xs text-stone-400">{item.category}</p>
            </div>
            <p className="text-lg font-bold text-amber-700">₱{totalPrice}</p>
          </div>

          {/* Size selector */}
          <div className="mb-4">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Size</p>
            <div className="flex gap-2">
              {SIZES.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setSize(s)}
                  className={`flex-1 py-2.5 rounded-xl border-2 transition-all ${
                    size.label === s.label
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

          {/* Add-ons */}
          <div className="mb-5">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Add-ons</p>
            <div className="flex flex-col gap-2">
              {ADDONS.map((addon) => {
                const selected = addons.find((a) => a.key === addon.key);
                return (
                  <button
                    key={addon.key}
                    onClick={() => toggleAddon(addon)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${
                      selected
                        ? "border-green-600 bg-green-50"
                        : "border-stone-200 bg-stone-50 hover:border-green-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        selected ? "border-green-600 bg-green-600" : "border-stone-300"
                      }`}>
                        {selected && <span className="text-white text-[10px] font-bold">✓</span>}
                      </div>
                      <div>
                        <p className={`text-xs font-semibold ${selected ? "text-green-800" : "text-stone-700"}`}>
                          {addon.label}
                        </p>
                        <p className="text-[10px] text-stone-400">{addon.desc}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold ${selected ? "text-green-700" : "text-stone-500"}`}>
                      +₱{addon.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="bg-stone-50 rounded-xl px-4 py-3 mb-4 border border-stone-100">
            <div className="flex justify-between text-xs text-stone-400 mb-1">
              <span>Base price ({size.label})</span>
              <span>₱{item.price + size.extraPrice}</span>
            </div>
            {addons.map((a) => (
              <div key={a.key} className="flex justify-between text-xs text-stone-400 mb-1">
                <span>{a.label}</span>
                <span>+₱{a.price}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-bold text-stone-800 border-t border-stone-200 pt-2 mt-1">
              <span>Total</span>
              <span className="text-amber-700">₱{totalPrice}</span>
            </div>
          </div>

          {/* Add to cart button */}
          <button
            onClick={handleAdd}
            className="w-full py-3.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-bold transition-all shadow-md active:scale-95"
          >
            Add to Cart — ₱{totalPrice}
          </button>
        </div>
      </div>
    </div>
  );
};