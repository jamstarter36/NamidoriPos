export const CartRow = ({ item, onAdd, onRemove }) => {
  const isUrl        = item.icon && item.icon.startsWith("http");
  const reachedLimit = item.qty >= item.stock;

  return (
    <div className="flex items-stretch gap-2 py-2.5 border-b border-stone-100 last:border-0">
      {/* Icon */}
      {isUrl ? (
        <img src={item.icon} alt={item.name} className="w-8 h-8 rounded-lg object-cover border border-[#a8b48a] flex-shrink-0 mt-0.5" />
      ) : (
        <span className="text-lg md:text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-stone-700 break-words">{item.name}</p>

        {/* Size + addons tags */}
        <div className="flex flex-wrap gap-1 mt-0.5">
          {item.size && (
            <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">
              {item.size}
            </span>
          )}
          {item.addons && item.addons.map((a) => (
            <span key={a} className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">
              +{a}
            </span>
          ))}
        </div>

        <p className="text-[10px] text-stone-400 mt-0.5">₱{item.price} each</p>
      </div>

      {/* Qty controls */}
      <div className="flex items-center gap-1 md:gap-1.5 flex-shrink-0 self-end">
        <button
          onClick={onRemove}
          className="w-5 h-5 rounded-md border border-stone-200 bg-stone-50 text-stone-600 text-xs font-bold hover:bg-red-50 hover:border-red-300 hover:text-red-500 transition-all"
        >
          −
        </button>
        <span className="text-xs font-bold text-green-700 w-4 text-center">{item.qty}</span>
        <button
          onClick={() => !reachedLimit && onAdd()}
          className={`w-5 h-5 rounded-md text-xs font-bold transition-all ${
            reachedLimit ? "bg-stone-200 text-stone-400 cursor-not-allowed" : "bg-green-700 text-white hover:bg-green-800"
          }`}
        >
          +
        </button>
      </div>

      <span className="text-xs font-bold text-amber-700 w-10 text-right flex-shrink-0 self-end">
        ₱{item.price * item.qty}
      </span>
    </div>
  );
};