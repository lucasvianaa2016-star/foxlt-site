const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: "*"
}));

app.use(express.json());

// fake DB
const users = [
  { username: "admin", password: "123", role: "admin" },
  { username: "player", password: "123", role: "member" }
];

// LOGIN
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "login inválido" });
  }

  const token = `${user.username}-token-foxlt`;

  res.json({
    token,
    role: user.role
  });
});

// VERIFY
app.post("/verify", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ valid: false });
  }

  res.json({ valid: true });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Fox LT backend rodando 🚀 na porta " + PORT);
});