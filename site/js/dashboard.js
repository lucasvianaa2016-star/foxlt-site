const role = localStorage.getItem("role");
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "/auth/";
}

document.getElementById("roleText").innerText = role;

if (role === "admin") {
  document.getElementById("adminPanel").style.display = "block";
}

function logout() {
  localStorage.clear();
  window.location.href = "/auth/";
}