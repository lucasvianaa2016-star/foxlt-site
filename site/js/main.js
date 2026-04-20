async function handleAuth() {
  try {
    const username = document.getElementById("user").value.trim();
    const password = document.getElementById("pass").value.trim();

    if (!username || !password) {
      alert("Preencha tudo");
      return;
    }

    const res = await fetch("https://foxlt-site.onrender.com/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Conta criada com sucesso");
      window.location.href = "/";
    } else {
      alert(data.error || "Erro ao criar conta");
    }

  } catch (error) {
    console.log(error);
    alert("Erro de conexão com servidor");
  }
}