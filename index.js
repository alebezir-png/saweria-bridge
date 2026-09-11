const express = require("express");
const app = express();
app.use(express.json());

const SECRET = "ndugal_c3ri4_J05J15";

let queue = [];

app.post("/api/webhook", (req, res) => {
  const body = req.body || {};
  const event = {
    id: body.id || body.transaction_id || Date.now().toString(),
    donator_name: body.donator_name || body.username || "",
    amount_raw: body.amount_raw || body.amount || 0,
    message: body.message || "",
    leaseToken: Math.random().toString(36).slice(2),
  };
  queue.push(event);
  console.log("Donasi masuk:", event.donator_name, "Rp." + event.amount_raw);
  res.json({ ok: true });
});

app.post("/api/pull", (req, res) => {
  const auth = req.headers["authorization"];
  if (auth !== SECRET) return res.status(401).json({ error: "unauthorized" });
  const limit = (req.body && req.body.limit) || 10;
  const items = queue.slice(0, limit);
  res.json({ items: items });
});

app.post("/api/ack", (req, res) => {
  const auth = req.headers["authorization"];
  if (auth !== SECRET) return res.status(401).json({ error: "unauthorized" });
  const ackItems = (req.body && req.body.items) || [];
  for (const ack of ackItems) {
    queue = queue.filter(function(item) { return item.id !== ack.id; });
  }
  res.json({ ok: true });
});

app.get("/", (req, res) => {
  res.json({ status: "ok", queue: queue.length });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Bridge Server berjalan di port " + PORT));
