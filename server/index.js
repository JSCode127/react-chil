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
//ログイン処理
const jwt = require("jsonwebtoken");

const SECRET = "supersecret";

app.post("/login", (req, res) => {
  const { username } = req.body;

  if(!username) {
    return res.status(400).json({
        error: {code: "INVALID_INPUT", message: "ユーザー名が必要です"}
    })
  }

  // 仮ログイン
  const token = jwt.sign({ username }, SECRET, {
    expiresIn: "15m",
  });

  res.json({ token });
});

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: { code: "NO_TOKEN", message: "未ログイン" }
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({
      error: { code: "INVALID_TOKEN", message: "無効なトークン" }
    });
  }
};

//バリデーション
app.post("/records", authMiddleware, (req, res) => {
  const { type, value, date } = req.body;

  if (!type || !value || !date) {
    return res.status(400).json({
      error: { code: "INVALID_INPUT", message: "入力不正" }
    });
  }

  const newRecord = {
    id: Date.now(),
    type,
    value,
    date
  };

  records.push(newRecord);

  res.json(newRecord);
});

// 仮データ
let records = [
  { id: 1, type: "ミルク", value: "120", date: "2026-04-13T10:00" },
];

// 取得
app.get("/records", authMiddleware, (req, res) => {
  res.json(records);
});

// 追加
app.post("/records", authMiddleware, (req, res) => {
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
app.put("/records/:id", authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const { type, value, date } = req.body;

  const index = records.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).json({
    error: {
        code: "NOT_FOUND",
        message: "対象のレコードが見つかりません"
    }
    });
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
app.delete("/records/:id", authMiddleware, (req, res) => {
  const id = Number(req.params.id);

  const newRecords = records.filter((r) => r.id !== id);

  if (newRecords.length === records.length) {
    return res.status(404).json({
    error: {
        code: "NOT_FOUND",
        message: "対象のレコードが見つかりません"
    }
    });
  }

  records = newRecords;

  res.json({ message: "削除しました" });
});