const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// “banco fake” por enquanto
const users = [
  {
    username: "admin",
    password: "123",
    role: "admin"
  },
  {
    username: "player",
    password: "123",
    role: "member"
  }
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

  // token simples (depois a gente melhora com JWT)
  const token = `${user.username}-token-foxlt`;

  res.json({
    token,
    role: user.role
  });
});

// CHECAR TOKEN
app.post("/verify", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ valid: false });
  }

  res.json({
    valid: true
  });
});

app.listen(3000, () => {
  console.log("Fox LT backend rodando 🚀");
});