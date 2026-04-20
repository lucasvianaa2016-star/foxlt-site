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

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const JWT_SECRET = process.env.JWT_SECRET || "FOX_LT_SECRET";

// =======================
// REGISTER
// =======================
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Preencha usuário e senha"
      });
    }

    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .single();

    if (existingUser) {
      return res.status(400).json({
        error: "Usuário já existe"
      });
    }

    const { error } = await supabase
      .from("users")
      .insert([
        {
          username,
          password,
          role: "member"
        }
      ]);

    if (error) {
      return res.status(400).json({
        error: error.message
      });
    }

    res.json({
      ok: true,
      message: "Conta criada com sucesso"
    });

  } catch (err) {
    res.status(500).json({
      error: "Erro interno no register"
    });
  }
});

// =======================
// LOGIN
// =======================
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single();

    if (!data) {
      return res.status(401).json({
        error: "Login inválido"
      });
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

  } catch (err) {
    res.status(500).json({
      error: "Erro interno no login"
    });
  }
});

// =======================
// MIDDLEWARE AUTH
// =======================
function auth(req, res, next) {
  const token = req.cookies.session;

  if (!token) {
    return res.status(401).json({
      error: "Sem sessão"
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({
      error: "Sessão inválida"
    });
  }
}

// =======================
// DASHBOARD
// =======================
app.get("/dashboard-data", auth, (req, res) => {
  res.json({
    ok: true,
    user: req.user
  });
});

// =======================
// ADMIN USERS
// =======================
app.get("/admin/users", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: "Acesso negado"
    });
  }

  const { data } = await supabase
    .from("users")
    .select("id, username, role, created_at");

  res.json(data);
});

// =======================
// LOGOUT
// =======================
app.post("/logout", (req, res) => {
  res.clearCookie("session", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  });

  res.json({
    ok: true
  });
});

// =======================
// ROOT TESTE
// =======================
app.get("/", (req, res) => {
  res.send("Fox LT Backend Online 🚀");
});

// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});