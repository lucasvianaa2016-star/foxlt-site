const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.https://qwjzessyfaizlpekxmih.supabase.co,
  process.env.SUPABASE_KEY
);

// LOGIN
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

  res.json({
    token: `${data.username}-token`,
    role: data.role
  });
});

// REGISTER (member direto)
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const { error } = await supabase
    .from("users")
    .insert([{ username, password, role: "member" }]);

  if (error) return res.status(400).json(error);

  res.json({ ok: true });
});

// CRIAR ADMIN (só você usa)
app.post("/create-admin", async (req, res) => {
  const { username, password } = req.body;

  await supabase
    .from("users")
    .insert([{ username, password, role: "admin" }]);

  res.json({ ok: true });
});

app.listen(3000, () => {
  console.log("backend ok");
});