import { api } from "./api.js";

// Fetch classes and populate the dropdown
document.addEventListener("DOMContentLoaded", function () {
  const classSelect = document.getElementById("class-add");
  const apiUrl = `${api}/class/classes/`;

  async function fetchClasses() {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();

      // Populate dropdown
      data.forEach((classItem) => {
        const option = document.createElement("option");
        option.value = classItem.id; // Class ID
        option.textContent = classItem.name; // Class name
        classSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error fetching class data:", error);
      alert("Failed to fetch classes. Please try again later.");
    }
  }

  fetchClasses();
});

// Handle image upload functionality
document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("imageUploadContainer");
  const fileInput = document.getElementById("fileInput");
  const imagePreview = document.getElementById("imagePreview");
  const uploadIcon = document.getElementById("uploadIcon");

  function handleFileSelect(file) {
    if (!file || !file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large. Please select an image under 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      imagePreview.src = e.target.result;
      imagePreview.classList.remove("hidden");
      uploadIcon.classList.add("hidden");
    };
    reader.readAsDataURL(file);
  }

  container.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", (e) =>
    handleFileSelect(e.target.files[0])
  );

  container.addEventListener("dragover", (e) => {
    e.preventDefault();
    container.classList.add("border-blue-500");
  });

  container.addEventListener("dragleave", () =>
    container.classList.remove("border-blue-500")
  );

  container.addEventListener("drop", (e) => {
    e.preventDefault();
    container.classList.remove("border-blue-500");
    handleFileSelect(e.dataTransfer.files[0]);
  });
});

// Handle student enrollment form submission
document
  .getElementById("studentEnrollmentForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Authentication token missing. Please log in again.");
      return;
    }

    const fileInput = document.getElementById("fileInput").files[0];
    if (fileInput && fileInput.size > 10 * 1024 * 1024) {
      alert("Profile photo must be less than 10MB.");
      return;
    }

    const formData = new FormData();
    formData.append("upload", fileInput);
    formData.append("type", document.getElementById("studentType").value);
    formData.append("first_name", document.getElementById("firstName").value);
    formData.append("other_name", document.getElementById("otherName").value);
    formData.append("last_name", document.getElementById("lastName").value);
    formData.append(
      "date_of_birth",
      document.getElementById("dateOfBirth").value
    );
    formData.append("gender", document.getElementById("gender").value);
    formData.append("parent", document.getElementById("parent_select").value);
    formData.append("religion", document.getElementById("religion").value);
    formData.append(
      "home_address",
      document.getElementById("homeAddress").value
    );
    formData.append(
      "local_government_area",
      document.getElementById("lga").value
    );
    formData.append(
      "state_of_origin",
      document.getElementById("stateOfOrigin").value
    );
    formData.append(
      "nationality",
      document.getElementById("nationality").value
    );

    try {
      const response = await fetch(`${api}/student/students/`, {
        method: "POST",
        body: formData,
        headers: { Authorization: `Token ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Enrollment failed: ${JSON.stringify(errorData)}`);
      }

      const studentData = await response.json();
      alert("Student enrolled successfully!");
      alert("Now adding student to class, hold on.");

      // Add student to class
      const classId = document.getElementById("class-add").value;
      if (!classId) {
        alert("Please select a class.");
        return;
      }

      const payload = { students: [studentData.id] };

      const classResponse = await fetch(`${api}/class/patch/${classId}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (!classResponse.ok) {
        const errorData = await classResponse.json();
        throw new Error(
          `Failed to add student to class: ${
            errorData.detail || "Unknown error"
          }`
        );
      }

      alert("Class updated successfully!");
      document.getElementById("studentEnrollmentForm").reset();
      location.reload(); // Refresh page
    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "An error occurred. Please try again later.");
    }
  });
