const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// 🔐 LOGIN (COM SESSÃO REAL)
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("password", password)
    .single();

  if (!data) {
    return res.status(401).json({ error: "login inválido" });
  }

  const token = jwt.sign(
    { id: data.id, role: data.role },
    "FOX_LT_SECRET",
    { expiresIn: "1h" }
  );

  res.cookie("session", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
  });

  res.json({ ok: true, role: data.role });
});

// 🧠 AUTH MIDDLEWARE
function auth(req, res, next) {
  const token = req.cookies.session;

  if (!token) {
    return res.status(401).json({ error: "sem sessão" });
  }

  try {
    const user = jwt.verify(token, "FOX_LT_SECRET");
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "sessão inválida" });
  }
}

// REGISTER
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const { error } = await supabase
    .from("users")
    .insert([{ username, password, role: "member" }]);

  if (error) return res.status(400).json(error);

  res.json({ ok: true });
});

// 🔒 ADMIN PROTEGIDO
app.get("/admin/users", auth, async (req, res) => {
  const { data } = await supabase.from("users").select("*");
  res.json(data);
});

// 🔒 TESTE DASHBOARD PROTEGIDO
app.get("/dashboard-data", auth, (req, res) => {
  res.json({
    msg: "logado com sessão real",
    user: req.user
  });
});

app.listen(3000);