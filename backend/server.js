const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://foxlt-site.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// JWT
const JWT_SECRET = process.env.JWT_SECRET || "FOXLT_HIPER_SECRETO";

// =======================
// REGISTER
// =======================
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Preencha usuário e senha" });
  }

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existing) {
    return res.status(400).json({ error: "Usuário já existe" });
  }

  const { error } = await supabase
    .from("users")
    .insert([
      {
        username,
        password,
        role: "member",
        money: 0,
        rank: "A",
        points: 0
      }
    ]);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ ok: true });
});

// =======================
// LOGIN
// =======================
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("password", password)
    .maybeSingle();

  if (!data) {
    return res.status(401).json({ error: "Login inválido" });
  }

  const token = jwt.sign(
    {
      id: data.id,
      username: data.username,
      role: data.role
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 86400000
  });

  res.json({
    ok: true,
    role: data.role
  });
});

// =======================
// AUTH MIDDLEWARE
// =======================
function auth(req, res, next) {
  const token = req.cookies.session;

  if (!token) {
    return res.status(401).json({ error: "Sem sessão" });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Sessão inválida" });
  }
}

// =======================
// DASHBOARD DATA
// =======================
app.get("/dashboard-data", auth, (req, res) => {
  res.json({
    ok: true,
    user: req.user
  });
});

// =======================
// ADMIN - LIST USERS
// =======================
app.get("/admin/users", auth, async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "owner") {
    return res.status(403).json({ error: "Acesso negado" });
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, username, role, money, rank, points, created_at");

  if (error) return res.status(400).json(error);

  res.json(data);
});

// =======================
// OWNER - UPDATE ROLE
// =======================
app.post("/admin/update-role", auth, async (req, res) => {
  if (req.user.role !== "owner") {
    return res.status(403).json({ error: "Somente owner pode mudar roles" });
  }

  const { username, role } = req.body;

  const { error } = await supabase
    .from("users")
    .update({ role })
    .eq("username", username);

  if (error) return res.status(400).json(error);

  res.json({ ok: true });
});

// =======================
// ADMIN - UPDATE STATS
// =======================
app.post("/admin/update-stats", auth, async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "owner") {
    return res.status(403).json({ error: "Acesso negado" });
  }

  const { username, money, rank, points } = req.body;

  const { error } = await supabase
    .from("users")
    .update({ money, rank, points })
    .eq("username", username);

  if (error) return res.status(400).json(error);

  res.json({ ok: true });
});

// =======================
// LOGOUT
// =======================
app.post("/logout", (req, res) => {
  res.clearCookie("session");
  res.json({ ok: true });
});

// =======================
// ROOT
// =======================
app.get("/", (req, res) => {
  res.send("Fox LT Backend Online 🚀");
});

// =======================
// START
// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});