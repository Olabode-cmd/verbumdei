import { api } from "./api.js";

const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const loginSuccessAlert = document.getElementById("loginSuccessAlert");

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  const person_id = document.getElementById("person_id").value;
  const password = document.getElementById("password").value;
  const password2 = document.getElementById("password2").value;
  const role = document.getElementById("role").value;

  // Check if fields are not empty
  if (!person_id || !password || !password2 || !role) {
    alert("Please fill in all fields");
    return;
  }

  // Check if passwords match
  if (password !== password2) {
    alert("Passwords do not match");
    return;
  }

  // Show loading spinner
  loginButton.innerHTML = `
    <svg class="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 019.293-7.293 1 1 0 01.707 1.707A6 6 0 106 12H4z"></path>
    </svg>
  `;
  loginButton.disabled = true; // Disable button during loading

  try {
    // Create a FormData object and append necessary fields
    const formData = new FormData();
    formData.append("person_id", person_id);
    formData.append("password", password);
    formData.append("role", role);

    const response = await fetch(`${api}/user/signup/`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      loginSuccessAlert.style.display = "block"; // Show success message or redirect
      window.location.href = "index.html";
    } else {
      alert("Signup failed. Please check your details and try again.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again later.");
  } finally {
    // Restore button text and state
    loginButton.innerHTML = "Sign Up";
    loginButton.disabled = false;
  }
});
