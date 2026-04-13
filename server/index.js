const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// 仮データ
let records = [
  { id: 1, type: "ミルク", value: "120", date: "2026-04-13T10:00" },
];

// 取得
app.get("/records", (req, res) => {
  res.json(records);
});

// 追加
app.post("/records", (req, res) => {
  const { type, value, date } = req.body;

  const newRecord = {
    id: Date.now(),
    type,
    value,
    date
  };

  records.push(newRecord);

  res.json(newRecord);
});

// 更新
app.put("/records/:id", (req, res) => {
  const id = Number(req.params.id);
  const { type, value, date } = req.body;

  const index = records.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "見つかりません" });
  }

  records[index] = {
    ...records[index],
    type,
    value,
    date
  };

  res.json(records[index]);
});
// 削除
app.delete("/records/:id", (req, res) => {
  const id = Number(req.params.id);

  const newRecords = records.filter((r) => r.id !== id);

  if (newRecords.length === records.length) {
    return res.status(404).json({ message: "見つかりません" });
  }

  records = newRecords;

  res.json({ message: "削除しました" });
});