// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());
app.use(express.json());

let pool;
(async () => {
  pool = await mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
  });
})();

app.get("/health", (req, res) => res.json({ ok: true }));

// Users CRUD
app.post("/users", async (req, res) => {
  const { username, mobile, email } = req.body;
  if (!username || !mobile)
    return res.status(400).json({ error: "username and mobile required" });
  const conn = await pool.getConnection();
  try {
    const [existing] = await conn.execute(
      "SELECT id FROM users WHERE mobile=?",
      [mobile]
    );
    if (existing.length)
      return res.status(409).json({ error: "Mobile already exists" });
    await conn.execute(
      "INSERT INTO users (username, mobile, email) VALUES (?, ?, ?)",
      [username, mobile, email || null]
    );
    const [row] = await conn.execute(
      "SELECT * FROM users WHERE id = LAST_INSERT_ID()"
    );
    res.status(201).json(row[0]);
  } finally {
    conn.release();
  }
});

app.get("/users", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      "SELECT id, username, mobile, email, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(rows);
  } finally {
    conn.release();
  }
});

app.put("/users/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { username, mobile, email } = req.body;
  if (!username || !mobile)
    return res.status(400).json({ error: "username and mobile required" });
  const conn = await pool.getConnection();
  try {
    await conn.execute(
      "UPDATE users SET username=?, mobile=?, email=? WHERE id=?",
      [username, mobile, email || null, id]
    );
    const [rows] = await conn.execute("SELECT * FROM users WHERE id=?", [id]);
    res.json(rows[0]);
  } finally {
    conn.release();
  }
});

app.delete("/users/:id", async (req, res) => {
  const id = Number(req.params.id);
  const conn = await pool.getConnection();
  try {
    await conn.execute("DELETE FROM users WHERE id=?", [id]);
    res.status(204).end();
  } finally {
    conn.release();
  }
});

// Transactions CRUD
app.post("/transactions", async (req, res) => {
  const { user_id, txn_type, amount, txn_date, notes } = req.body;
  if (
    !user_id ||
    !["GIVEN", "RECEIVED"].includes(txn_type) ||
    !amount ||
    !txn_date
  ) {
    return res.status(400).json({ error: "Invalid payload" });
  }
  const conn = await pool.getConnection();
  try {
    await conn.execute(
      "INSERT INTO transactions (user_id, txn_type, amount, txn_date, notes) VALUES (?, ?, ?, ?, ?)",
      [user_id, txn_type, amount, txn_date, notes || null]
    );
    const [row] = await conn.execute(
      "SELECT * FROM transactions WHERE id = LAST_INSERT_ID()"
    );
    res.status(201).json(row[0]);
  } finally {
    conn.release();
  }
});

app.get("/transactions/user/:userId", async (req, res) => {
  const userId = Number(req.params.userId);
  const { from, to } = req.query;
  const conn = await pool.getConnection();
  try {
    let sql = "SELECT * FROM transactions WHERE user_id=?";
    const params = [userId];
    if (from && to) {
      sql += " AND txn_date BETWEEN ? AND ?";
      params.push(from, to);
    }
    sql += " ORDER BY txn_date DESC, id DESC";
    const [rows] = await conn.execute(sql, params);

    const [agg] = await conn.execute(
      `SELECT
         COALESCE(SUM(CASE WHEN txn_type='Paid' THEN amount END),0) AS total_given,
         COALESCE(SUM(CASE WHEN txn_type='Received' THEN amount END),0) AS total_received
       FROM transactions WHERE user_id=?`,
      [userId]
    );
    res.json({
      transactions: rows,
      totals: agg[0],
      net_balance: agg[0].total_given - agg[0].total_received,
    });
  } finally {
    conn.release();
  }
});

app.put("/transactions/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { txn_type, amount, txn_date, notes } = req.body;
  if (!["GIVEN", "RECEIVED"].includes(txn_type) || !amount || !txn_date) {
    return res.status(400).json({ error: "Invalid payload" });
  }
  const conn = await pool.getConnection();
  try {
    await conn.execute(
      "UPDATE transactions SET txn_type=?, amount=?, txn_date=?, notes=? WHERE id=?",
      [txn_type, amount, txn_date, notes || null, id]
    );
    const [rows] = await conn.execute("SELECT * FROM transactions WHERE id=?", [
      id,
    ]);
    res.json(rows[0]);
  } finally {
    conn.release();
  }
});

app.delete("/transactions/:id", async (req, res) => {
  const id = Number(req.params.id);
  const conn = await pool.getConnection();
  try {
    await conn.execute("DELETE FROM transactions WHERE id=?", [id]);
    res.status(204).end();
  } finally {
    conn.release();
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API listening on ${port}`));
