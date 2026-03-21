export const StockRow = ({ item, onUpdateStock, onDelete }) => {
  const isOut = item.stock === 0;
  const isLow = item.stock > 0 && item.stock < 10;
  const isUrl = item.icon && item.icon.startsWith("http");

  return (
    <div className="flex items-center gap-3 md:gap-4 bg-white border-2 border-[#a8b48a] rounded-xl md:rounded-2xl px-3 md:px-5 py-3 md:py-3.5 shadow-sm hover:border-[#6b8a45] hover:shadow-md transition-all">
      {isUrl ? (
        <img src={item.icon} alt={item.name} className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover border border-[#a8b48a] flex-shrink-0" />
      ) : (
        <span className="text-xl md:text-2xl flex-shrink-0">{item.icon}</span>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-xs md:text-sm font-semibold text-stone-800 truncate">{item.name}</p>
        <div className="flex gap-2 mt-1">
          <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">{item.category}</span>
          <span className="text-[10px] text-amber-700 font-semibold">₱{item.price}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <span className="hidden sm:block text-xs text-stone-400">Stock:</span>
        <input
          type="number"
          value={item.stock}
          onChange={(e) => onUpdateStock(parseInt(e.target.value) || 0)}
          onFocus={(e) => e.target.select()}
          className={`w-12 md:w-16 text-center text-sm font-bold rounded-lg border py-1.5 outline-none transition-all ${
            isOut ? "border-red-300 bg-red-50 text-red-600"
            : isLow ? "border-amber-300 bg-amber-50 text-amber-700"
            : "border-stone-200 bg-stone-50 text-stone-700 focus:border-green-400"
          }`}
        />
        <span className={`hidden sm:block text-[10px] font-bold w-20 ${isOut ? "text-red-500" : isLow ? "text-amber-500" : "text-green-600"}`}>
          {isOut ? "● OUT" : isLow ? "▲ LOW" : "● OK"}
        </span>
      </div>

      <button onClick={onDelete} className="w-7 h-7 md:w-8 md:h-8 rounded-xl border border-red-200 bg-red-50 text-red-400 text-sm font-bold hover:bg-red-100 hover:text-red-600 transition-all flex-shrink-0">
        ✕
      </button>
    </div>
  );
};