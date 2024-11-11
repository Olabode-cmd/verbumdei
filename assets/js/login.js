import { api } from "./api.js";

const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const loginSuccessAlert = document.getElementById("loginSuccessAlert");

// Function to show spinner
function showSpinner(button) {
  button.innerHTML = `
    <svg class="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 019.293-7.293 1 1 0 01.707 1.707A6 6 0 106 12H4z"></path>
    </svg>
  `;
  button.disabled = true;
}

// Function to hide spinner and restore button text
function hideSpinner(button, text = "Login") {
  button.innerHTML = text;
  button.disabled = false;
}

// Function to store user data in localStorage
function storeUserData(data) {
  localStorage.setItem("authToken", data.token);
  localStorage.setItem("user_id", data.user_id);
  localStorage.setItem("username", data.username);
  localStorage.setItem("email", data.email);
  localStorage.setItem("role", data.role);
  localStorage.setItem("admin_id", data.person_id);

  // Conditionally store first_name and last_name if they exist
  if (data.first_name) localStorage.setItem("first_name", data.first_name);
  if (data.last_name) localStorage.setItem("last_name", data.last_name);
}

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  const person_id = document.getElementById("person_id").value;
  const password = document.getElementById("password").value;

  // Check if fields are not empty
  if (!person_id || !password) {
    alert("Please fill in all fields");
    return;
  }

  showSpinner(loginButton);

  try {
    const response = await fetch(`${api}/user/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ person_id, password }),
    });

    if (response.ok) {
      const data = await response.json();
      const role = data.role;

      // Store user data in localStorage
      storeUserData(data);

      // Redirect based on role
      if (role === "HEAD TEACHER") {
        window.location.href = "hot/dashboard.html";
      } else if (role === "TEACHER") {
        window.location.href = "/teacher";
      } else if (role === "PARENT") {
        window.location.href = "/parent";
      } else if (role === "ACCOUNTANT") {
        window.location.href = "/account";
      } else if (role === "MANAGER") {
        window.location.href = "/facility_manager";
      } else {
        alert("Role not recognized. Redirecting to the home page.");
        window.location.href = "/";
      }

      // Show success alert
      loginSuccessAlert.classList.remove("hidden");
    } else {
      alert("Login failed. Please check your credentials.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again later.");
  } finally {
    hideSpinner(loginButton);
  }
});
