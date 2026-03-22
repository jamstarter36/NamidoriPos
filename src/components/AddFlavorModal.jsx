import { useState } from "react";

const FIELDS = [
  { label: "Name",         key: "name",  type: "text",   ph: "e.g. Strawberry Matcha" },
  { label: "Price (₱)",    key: "price", type: "number", ph: "160" },
  { label: "Stock qty",    key: "stock", type: "number", ph: "30" },
  { label: "Image URL",    key: "icon",  type: "text",   ph: "https://i.ibb.co/your-image.jpg" },
];

export const AddFlavorModal = ({ onAdd, onClose }) => {
  const [newItem, setNewItem]       = useState({ name: "", category: "Hot", price: "", icon: "", stock: "" });
  const [previewError, setPreviewError] = useState(false);

  const handleAdd = () => {
    if (!newItem.name || !newItem.price || !newItem.stock) return;
    onAdd(newItem);
    setNewItem({ name: "", category: "Hot", price: "", icon: "", stock: "" });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white border-2 border-[#a8b48a] rounded-t-2xl sm:rounded-2xl p-6 md:p-7 w-full sm:max-w-sm md:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-green-800 mb-5">Add New Flavor</h3>

        {FIELDS.map(({ label, key, type, ph }) => (
          <div key={key} className="mb-3.5">
            <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-1.5">{label}</label>
            <input
              type={type} value={newItem[key]} placeholder={ph}
              onChange={(e) => { setPreviewError(false); setNewItem((p) => ({ ...p, [key]: e.target.value })); }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-sm outline-none focus:border-green-400 focus:bg-white transition-all"
            />
          </div>
        ))}

        {/* Image URL preview */}
        {newItem.icon && newItem.icon.startsWith("http") && (
          <div className="mb-3.5">
            <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Preview</label>
            {previewError ? (
              <div className="w-full h-24 rounded-xl border-2 border-dashed border-red-300 bg-red-50 flex items-center justify-center">
                <p className="text-xs text-red-400">Invalid image URL</p>
              </div>
            ) : (
              <img src={newItem.icon} alt="preview" onError={() => setPreviewError(true)} className="w-full h-24 object-cover rounded-xl border-2 border-[#a8b48a]" />
            )}
          </div>
        )}

        <div className="mb-5">
          <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Category</label>
          <div className="flex gap-2">
            {["Hot", "Cold", "Seasonal"].map((cat) => (
              <button key={cat} onClick={() => setNewItem((p) => ({ ...p, category: cat }))}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  newItem.category === cat ? "bg-green-700 text-white border-green-700" : "bg-stone-50 text-stone-500 border-stone-200 hover:border-green-300 hover:text-green-700"
                }`}
              >{cat}</button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-400 text-sm font-semibold hover:bg-stone-50 transition-all">Cancel</button>
          <button onClick={handleAdd} className="flex-[2] py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-bold transition-all shadow-md active:scale-95">Add to Menu</button>
        </div>
      </div>
    </div>
  );
};