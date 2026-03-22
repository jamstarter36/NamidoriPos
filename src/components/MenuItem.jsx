export const MenuItem = ({ item, inCart, onAdd }) => {
  const outOfStock = item.stock === 0;
  const isUrl      = item.icon && item.icon.startsWith("http");

  // inCart is now an array of cart entries for this item (different sizes/addons)
  const cartQty    = Array.isArray(inCart) ? inCart.reduce((s, c) => s + c.qty, 0) : (inCart?.qty || 0);
  const reachedLimit = cartQty >= item.stock;
  const disabled   = outOfStock || reachedLimit;

  return (
    <div
      onClick={() => !disabled && onAdd()}
      className={`relative rounded-xl md:rounded-2xl border-2 transition-all select-none overflow-hidden ${
        disabled
          ? "opacity-50 cursor-not-allowed bg-stone-100 border-[#a8b48a]"
          : cartQty > 0
          ? "bg-green-50 border-[#5c7a3a] shadow-md cursor-pointer hover:shadow-lg"
          : "bg-white border-[#a8b48a] cursor-pointer hover:border-[#6b8a45] hover:shadow-md"
      }`}
    >
      {/* Cart badge */}
      {cartQty > 0 && (
        <span className="absolute top-2 right-2 bg-green-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full z-10">
          ×{cartQty}
        </span>
      )}

      {/* MAX badge */}
      {reachedLimit && !outOfStock && (
        <span className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full z-10">
          MAX
        </span>
      )}

      {/* Image or emoji */}
      {isUrl ? (
        <div className="w-full h-20 md:h-24 overflow-hidden">
          <img src={item.icon} alt={item.name} className="w-full h-full object-contain bg-white" />
        </div>
      ) : (
        <div className="px-3 pt-3 text-2xl md:text-3xl">{item.icon}</div>
      )}

      {/* Info */}
      <div className="p-2.5 md:p-3.5 pt-1.5 md:pt-2">
        <p className="text-[11px] md:text-xs font-semibold text-stone-800 leading-snug mb-0.5 line-clamp-2">{item.name}</p>
        <p className="text-[9px] md:text-[10px] text-stone-400 mb-1.5 md:mb-2">{item.category}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs md:text-sm font-bold text-amber-700">₱{item.price}</span>
          <span className={`text-[9px] font-semibold ${
            outOfStock ? "text-red-500" : reachedLimit ? "text-amber-500" : item.stock < 10 ? "text-red-400" : "text-stone-300"
          }`}>
            {outOfStock ? "✕ OUT" : reachedLimit ? "MAX" : `${item.stock} left`}
          </span>
        </div>
      </div>
    </div>
  );
};