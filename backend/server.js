const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// banco temporário
const users = [];

// CADASTRO
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  const exists = users.find(u => u.username === username);
  if (exists) return res.status(400).json({ error: "usuário já existe" });

  users.push({
    username,
    password,
    role: "pending" // 🔥 novo usuário começa como pendente
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

  if (user.role === "pending") {
    return res.status(403).json({ error: "aguardando aprovação admin" });
  }

  const token = `${user.username}-token`;

  res.json({ token, role: user.role });
});

// ADMIN APROVA USUÁRIO (temporário)
app.post("/approve", (req, res) => {
  const { username } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ error: "não existe" });

  user.role = "member";

  res.json({ ok: true });
});

app.listen(3000, () => {
  console.log("API rodando");
});