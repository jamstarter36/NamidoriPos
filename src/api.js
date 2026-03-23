import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

// ── Products ──────────────────────────────────────────────────────────────────
export const getProducts   = ()          => api.get("/products");
export const addProduct    = (data)      => api.post("/products", data);
export const updateStock   = (id, stock) => api.patch(`/products/${id}`, { stock });
export const deleteProduct = (id)        => api.delete(`/products/${id}`);

// ── Orders ────────────────────────────────────────────────────────────────────
export const getOrders = ()     => api.get("/orders");
export const saveOrder = (data) => api.post("/orders", data);

// ── Members ───────────────────────────────────────────────────────────────────
export const loginMember  = (data) => api.post("/members/login", data);
export const signupMember = (data) => api.post("/members/signup", data);
export const getMembers   = ()     => api.get("/members");

// ── Loyalty Cards ─────────────────────────────────────────────────────────────
export const getLoyaltyCards = (member_id)                    => api.get(`/loyalty/${member_id}`);
export const addStamps       = (member_id, stamps_to_add, discount_used) => api.patch(`/loyalty/${member_id}/addstamps`, { stamps_to_add, discount_used });
export const createCard      = (member_id)                    => api.post("/loyalty", { member_id });

// ── Testimony ─────────────────────────────────────────────────────────────────
export const getTestimony    = (member_id) => api.get(`/testimony/${member_id}`);
export const submitTestimony = (data)      => api.post("/testimony", data);