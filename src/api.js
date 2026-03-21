import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

// ── Products ──────────────────────────────────────────────────────────────────
export const getProducts    = ()           => api.get("/products");
export const addProduct     = (data)       => api.post("/products", data);
export const updateStock    = (id, stock)  => api.patch(`/products/${id}`, { stock });
export const deleteProduct  = (id)         => api.delete(`/products/${id}`);
export const getOrders  = ()     => api.get("/orders");
export const saveOrder  = (data) => api.post("/orders", data);
export const loginMember  = (data) => api.post("/members/login", data);
export const signupMember = (data) => api.post("/members/signup", data);
export const getMembers    = ()            => api.get("/members");
export const updateStamps  = (id, stamps)  => api.patch(`/members/${id}/stamps`, { stamps });
