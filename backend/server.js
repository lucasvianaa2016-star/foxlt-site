const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// banco simples
const users = [
  {
    username: "admin",
    password: "123",
    role: "admin"
  }
];

// REGISTER (member direto)
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  const exists = users.find(u => u.username === username);
  if (exists) return res.status(400).json({ error: "já existe" });

  users.push({
    username,
    password,
    role: "member"
  });

  res.json({ ok: true });
});

// LOGIN
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "login inválido" });
  }

  res.json({
    token: `${user.username}-token`,
    role: user.role
  });
});

// criar admin manual (só você usa isso)
app.post("/create-admin", (req, res) => {
  const { username, password } = req.body;

  users.push({
    username,
    password,
    role: "admin"
  });

  res.json({ ok: true });
});

app.listen(3000, () => {
  console.log("Fox LT backend rodando 🚀");
});