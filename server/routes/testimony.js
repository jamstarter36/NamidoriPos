const express = require("express");
const pool    = require("../db");  // adjust if your db file is named differently

const router = express.Router();

// GET /api/testimony/:member_id
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

// POST /api/testimony
router.post("/", async (req, res) => {
  const { member_id, full_name, company, position, testimony, stars } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO testimonies (member_id, full_name, company, position, testimony, stars)
       VALUES ($1, $2, $3, $4, $5, $6)
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

module.exports = router;