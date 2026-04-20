const role = localStorage.getItem("role");
const token = localStorage.getItem("token");

// 🔐 proteção simples
if (!token) {
  window.location.href = "/auth/";
}

// mostrar role
document.getElementById("roleText").innerText = role;

// mostrar admin panel se for admin
if (role === "admin") {
  document.getElementById("adminPanel").style.display = "block";
}

function logout() {
  localStorage.clear();
  window.location.href = "/auth/";
}