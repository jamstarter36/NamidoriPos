import { useState, useEffect } from "react";
import { getOrders } from "../api";

export const SalesView = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Failed to fetch orders:", err))
      .finally(() => setLoading(false));
  }, []);

  const totalSales   = orders.reduce((s, o) => s + o.total, 0);
  const totalOrders  = orders.length;
  const totalVat     = orders.reduce((s, o) => s + o.vat_amount, 0);
  const averageOrder = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

  if (loading) return (
    <div className="flex flex-1 items-center justify-center" style={{ backgroundColor: "#d4dbb8" }}>
      <p className="text-green-800 font-bold text-lg">Loading sales... 🍵</p>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6" style={{ backgroundColor: "#d4dbb8" }}>
      <div className="max-w-4xl mx-auto">

        {/* Title */}
        <div className="mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold text-green-800">Sales Overview</h2>
          <p className="text-xs text-stone-500">{totalOrders} total transactions</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          {[
            { label: "Total Sales",  value: `₱${totalSales.toLocaleString()}` },
            { label: "Total Orders", value: totalOrders },
            { label: "Total VAT",    value: `₱${totalVat.toLocaleString()}` },
            { label: "Avg. Order",   value: `₱${averageOrder.toLocaleString()}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border-2 border-[#a8b48a] rounded-2xl px-4 md:px-5 py-3 md:py-4 shadow-sm">
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-1">{label}</p>
              <p className="text-xl md:text-2xl font-bold text-green-800">{value}</p>
            </div>
          ))}
        </div>

        {/* Transactions */}
        <div className="bg-white border-2 border-[#a8b48a] rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 md:px-5 py-3 md:py-4 border-b border-stone-100">
            <p className="text-sm font-bold text-green-800">Transaction History</p>
          </div>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-stone-300 gap-2">
              <span className="text-4xl">📊</span>
              <p className="text-sm">No transactions yet</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-100">
                      {["Order ID", "Date", "Time", "Items & Details", "Subtotal", "VAT", "Total"].map((h) => (
                        <th key={h} className={`px-5 py-3 text-[10px] font-semibold text-stone-400 uppercase tracking-widest ${h === "Subtotal" || h === "VAT" || h === "Total" ? "text-right" : "text-left"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...orders].reverse().map((order, index) => (
                      <tr key={index} className="border-b border-stone-50 hover:bg-stone-50 transition-all">
                        <td className="px-5 py-3 text-xs font-bold text-green-700">#{order.order_id}</td>
                        <td className="px-5 py-3 text-xs text-stone-500">{order.date}</td>
                        <td className="px-5 py-3 text-xs text-stone-500">{order.time}</td>
                        <td className="px-5 py-3 text-xs text-stone-600 max-w-[220px]">
                          {order.items.split("||").map((entry, i) => {
                            const [name, size, addons] = entry.split("|");
                            return (
                              <div key={i} className="mb-1.5 last:mb-0">
                                <p className="font-bold text-stone-700">{name}</p>
                                <p className="text-[10px] text-stone-400">
                                  {size}{addons ? ` · ${addons}` : ""}
                                </p>
                              </div>
                            );
                          })}
                          {order.discount > 0 && (
                            <p className="text-[10px] text-green-600 font-semibold mt-1">🎉 -₱{order.discount} loyalty</p>
                          )}
                        </td>
                        <td className="px-5 py-3 text-xs text-stone-500 text-right">₱{order.subtotal}</td>
                        <td className="px-5 py-3 text-xs text-stone-500 text-right">{order.vat_rate > 0 ? `₱${order.vat_amount} (${order.vat_rate}%)` : "—"}</td>
                        <td className="px-5 py-3 text-sm font-bold text-amber-700 text-right">₱{order.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden flex flex-col divide-y divide-stone-100">
                {[...orders].reverse().map((order, index) => (
                  <div key={index} className="p-4 hover:bg-stone-50 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-green-700">#{order.order_id}</span>
                      <span className="text-sm font-bold text-amber-700">₱{order.total}</span>
                    </div>
                    <p className="text-xs font-semibold text-stone-600 mb-1">{order.items}</p>
                    {order.items.split("||").map((entry, i) => {
                      const [name, size, addons] = entry.split("|");
                      return (
                        <div key={i} className="mb-1.5 last:mb-0">
                          <p className="text-xs font-bold text-stone-700">{name}</p>
                          <p className="text-[10px] text-stone-400">
                            {size}{addons ? ` · ${addons}` : ""}
                          </p>
                        </div>
                      );
                    })}
                    {order.discount > 0 && (
                      <p className="text-[10px] text-green-600 font-semibold mb-1">🎉 -₱{order.discount} loyalty</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-stone-400">{order.date} · {order.time}</span>
                      <span className="text-[10px] text-stone-400">
                        {order.vat_rate > 0 ? `VAT ₱${order.vat_amount}` : "No VAT"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};