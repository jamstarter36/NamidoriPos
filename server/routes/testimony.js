import express from "express";
import pool from "../db.js"; // adjust to your db import

const router = express.Router();

// GET /testimony/:member_id
router.get("/:member_id", async (req, res) => {
  const { member_id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM testimonies WHERE member_id = $1 LIMIT 1",
      [member_id]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /testimony
router.post("/", async (req, res) => {
  const { member_id, full_name, company, position, testimony, stars } = req.body;
  try {
    // Upsert — update if exists, insert if not
    const result = await pool.query(
      `INSERT INTO testimonies (member_id, full_name, company, position, testimony, stars)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (member_id)
       DO UPDATE SET full_name=$2, company=$3, position=$4, testimony=$5, stars=$6
       RETURNING *`,
      [member_id, full_name, company, position, testimony, stars]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;