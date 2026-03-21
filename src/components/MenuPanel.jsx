import { useState } from "react";
import { CATEGORIES } from "../data/Constants";
import { MenuItem } from "./MenuItem";
import { ItemCustomizeModal } from "./ItemCustomizeModal";

export const MenuPanel = ({ items, cart, onAdd }) => {
  const [filter, setFilter]           = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);

  const filtered = filter === "All" ? items : items.filter((i) => i.category === filter);

  return (
    <div className="flex-1 flex flex-col p-3 md:p-4 overflow-hidden">
      {/* Category filters */}
      <div className="flex gap-2 mb-3 md:mb-4 flex-shrink-0 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 md:px-4 py-1.5 rounded-full text-xs font-medium border transition-all flex-shrink-0 ${
              filter === cat
                ? "bg-green-700 text-white border-green-700"
                : "bg-white text-stone-500 border-stone-200 hover:border-green-400 hover:text-green-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3 overflow-y-auto pb-20 md:pb-2">
        {filtered.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            inCart={cart.filter((c) => c.originalId === item.id || c.id === item.id)}
            onAdd={() => setSelectedItem(item)}
          />
        ))}
      </div>

      {/* Customize modal */}
      {selectedItem && (
        <ItemCustomizeModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={(customizedItem) => {
            onAdd(customizedItem);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
};