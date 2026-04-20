async function handleAuth() {
  const username = document.getElementById("user").value.trim();
  const password = document.getElementById("pass").value.trim();

  if (!username || !password) {
    alert("Preencha tudo");
    return;
  }

  const res = await fetch("https://SEU-RENDER.onrender.com/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (res.ok) {
    alert("Conta criada com sucesso");
  } else {
    alert("Erro ao criar conta");
    console.log(data);
  }
}