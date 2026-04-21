function toggleAdminMenu() {
  const submenu = document.getElementById("adminSubmenu");

  if (submenu.style.display === "block") {
    submenu.style.display = "none";
  } else {
    submenu.style.display = "block";
  }
}