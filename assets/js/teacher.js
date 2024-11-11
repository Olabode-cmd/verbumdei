import { api } from "./api.js";
const token = localStorage.getItem("authToken");

document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("imageUploadContainer");
  const fileInput = document.getElementById("fileInput");
  const imagePreview = document.getElementById("imagePreview");
  const uploadIcon = document.getElementById("uploadIcon");

  // Function to handle file selection
  function handleFileSelect(file) {
    if (file && file.type.startsWith("image/")) {
      if (file.size <= 2 * 1024 * 1024) {
        // 2MB limit
        const reader = new FileReader();
        reader.onload = function (e) {
          imagePreview.src = e.target.result;
          imagePreview.classList.remove("hidden");
          uploadIcon.classList.add("hidden");
        };
        reader.readAsDataURL(file);
      } else {
        alert("File is too large. Please select an image under 2MB.");
      }
    } else {
      alert("Please select a valid image file.");
    }
  }

  // Click to upload
  container.addEventListener("click", function () {
    fileInput.click();
  });

  fileInput.addEventListener("change", function (e) {
    handleFileSelect(e.target.files[0]);
  });

  // Drag and drop functionality
  container.addEventListener("dragover", function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.add("border-blue-500");
  });

  container.addEventListener("dragleave", function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove("border-blue-500");
  });

  container.addEventListener("drop", function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove("border-blue-500");
    handleFileSelect(e.dataTransfer.files[0]);
  });
});

document
  .getElementById("staffRegistrationForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const fileInput = document.getElementById("fileInput").files[0];
    if (fileInput && fileInput.size > 2 * 1024 * 1024) {
      alert("Profile photo must be less than 2MB.");
      return;
    }

    const formData = new FormData();
    formData.append("upload", fileInput);
    formData.append("first_name", document.getElementById("first_name").value);
    formData.append("other_name", document.getElementById("other_name").value);
    formData.append("last_name", document.getElementById("last_name").value);
    formData.append(
      "date_of_birth",
      document.getElementById("dateOfBirth").value
    );
    formData.append("gender", document.getElementById("gender").value);
    formData.append(
      "employment_type",
      document.getElementById("staff_type").value
    );
    formData.append("staff_type", document.getElementById("type").value);
    formData.append("status", document.getElementById("status").value);
    formData.append("nin", document.getElementById("nin").value);
    formData.append("email", document.getElementById("email").value);
    formData.append("position", document.getElementById("position").value);
    formData.append(
      "phone_number_1",
      document.getElementById("phone_number_1").value
    );
    formData.append(
      "phone_number_2",
      document.getElementById("phone_number_2").value
    );
    formData.append("religion", document.getElementById("religion").value);
    formData.append(
      "home_address",
      document.getElementById("home_address").value
    );
    formData.append(
      "local_government_area",
      document.getElementById("local_government_area").value
    );
    formData.append(
      "state_of_origin",
      document.getElementById("state_of_origin").value
    );
    formData.append(
      "nationality",
      document.getElementById("nationality").value
    );

    try {
      const response = await fetch(`${api}/staff/staff/`, {
        method: "POST",
        body: formData,
        headers: {
          "X-CSRFToken": getCSRFToken(),
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert("Staff registration successfully!");
        document.getElementById("staffRegistrationForm").reset();
        document.getElementById("imagePreview").classList.add("hidden"); // Hide preview after submission
      } else {
        const errorData = await response.json();
        alert("Failed to enroll staff. Error: " + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again later.");
    }
  });

// Image Preview Functionality
document
  .getElementById("fileInput")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    const imagePreview = document.getElementById("imagePreview");

    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        imagePreview.src = e.target.result;
        imagePreview.classList.remove("hidden"); // Show preview
        document.getElementById("uploadIcon").classList.add("hidden"); // Hide upload icon
      };
      reader.readAsDataURL(file);
    } else {
      imagePreview.classList.add("hidden"); // Hide preview if no file
      document.getElementById("uploadIcon").classList.remove("hidden"); // Show upload icon
    }
  });

function getCSRFToken() {
  let csrfToken = null;
  const cookies = document.cookie.split(";");
  cookies.forEach((cookie) => {
    const trimmedCookie = cookie.trim();
    if (trimmedCookie.startsWith("csrftoken=")) {
      csrfToken = trimmedCookie.split("=")[1];
    }
  });
  return csrfToken;
}
