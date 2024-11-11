document.getElementById("logout").addEventListener("click", function (event) {
  event.preventDefault();

  localStorage.removeItem("authToken");
  localStorage.removeItem("user_id");
  localStorage.removeItem("username");
  localStorage.removeItem("email");
  localStorage.removeItem("role");
  localStorage.removeItem("admin_id");

  // Optionally remove first and last names if they exist
    if (localStorage.getItem("first_name")) {
      localStorage.removeItem("first_name");
    }
    if (localStorage.getItem("last_name")) {
      localStorage.removeItem("last_name");
    }
  alert("You have logged out successfully.");

  // Redirect to home page or login page
  window.location.href = "/index.html";
});
