const express = require("express");
const cors = require("cors");
require("dotenv").config();

const productRoutes = require("./routes/products");
const orderRoutes   = require("./routes/orders");
const memberRoutes  = require("./routes/members");
const loyaltyRoutes = require("./routes/loyaltycards");

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/orders",   orderRoutes);
app.use("/api/members",  memberRoutes);
app.use("/api/loyalty",  loyaltyRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Namidori POS server is running! 🍃" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`🍃 Namidori POS server running on http://localhost:${PORT}`);
});