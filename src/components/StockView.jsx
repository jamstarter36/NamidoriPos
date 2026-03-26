import { useState } from "react";
import { updateStock, updatePrice, updateSizePrice, addProduct, deleteProduct } from "../api";
import { StockRow } from "./StockRow";
import { AddFlavorModal } from "./AddFlavorModal";

export const StockView = ({ items, setItems }) => {
  const [showModal, setShowModal] = useState(false);

  const handleUpdateStock = (id, val) => {
    const newStock = Math.max(0, parseInt(val) || 0);
    const oldItems = items;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, stock: newStock } : i)));
    updateStock(id, newStock).catch((err) => { console.error(err); setItems(oldItems); });
  };

  const handleUpdateSizePrice = (id, val) => {
    const newSizePrice = Math.max(0, parseInt(val) || 0);
    const oldItems = items;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, size_price: newSizePrice } : i)));
    updateSizePrice(id, newSizePrice).catch((err) => { console.error(err); setItems(oldItems); });
  };

  const handleDelete = (id) => {
    const oldItems = items;
    setItems((prev) => prev.filter((i) => i.id !== id));
    deleteProduct(id).catch((err) => { console.error(err); setItems(oldItems); });
  };

  const handleAdd = (newItem) => {
    const tempId = Date.now();
    const optimisticItem = { ...newItem, id: tempId, price: parseInt(newItem.price), stock: parseInt(newItem.stock) };
    setItems((prev) => [...prev, optimisticItem]);
    setShowModal(false);
    addProduct(optimisticItem)
      .then((res) => setItems((prev) => prev.map((i) => (i.id === tempId ? res.data : i))))
      .catch((err) => { console.error(err); setItems((prev) => prev.filter((i) => i.id !== tempId)); });
  };

  

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-green-800">Stock Management</h2>
            <p className="text-xs text-stone-500">{items.length} items · {items.reduce((s, i) => s + i.stock, 0)} total units</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 md:px-5 py-2 md:py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs md:text-sm font-bold transition-all shadow-md active:scale-95"
          >
            + Add
          </button>
        </div>

        <div className="flex flex-col gap-2 md:gap-3">
          {items.map((item) => (
            <StockRow
              key={item.id}
              item={item}
              onUpdateStock={(val) => handleUpdateStock(item.id, val)}
              onUpdatePrice={(val) => handleUpdatePrice(item.id, val)}
              onUpdateSizePrice={(val) => handleUpdateSizePrice(item.id, val)}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </div>
      </div>

      {showModal && <AddFlavorModal onAdd={handleAdd} onClose={() => setShowModal(false)} />}
    </div>
  );
};