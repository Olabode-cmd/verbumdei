import { api } from "./api.js";

// Fetch authentication token from local storage
const token = localStorage.getItem("authToken");

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", async () => {
  // Fetch and populate classes
  const classSelect = document.getElementById("classSelect");
  try {
    const classResponse = await fetch(`${api}/class/classes/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });

    if (!classResponse.ok) throw new Error("Failed to fetch class data");
    const classData = await classResponse.json();
    classSelect.innerHTML = `<option value="">Select a class</option>`;
    classData.forEach((item) => {
      const option = document.createElement("option");
      option.dataset.id = item.id;
      option.value = item.name;
      option.textContent = item.name;
      classSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching classes:", error);
  }

  // Fetch and populate terms
  const termSelect = document.getElementById("termSelect");
  try {
    const termResponse = await fetch(`${api}/term/all/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });

    if (!termResponse.ok) throw new Error("Failed to fetch term data");
    const termData = await termResponse.json();
    termSelect.innerHTML = `<option value="">Select a term</option>`;
    termData.forEach((item) => {
      const option = document.createElement("option");
      option.dataset.id = item.id;
      option.value = item.name;
      option.textContent = item.name;
      termSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching terms:", error);
  }

  // Fetch and populate subjects
  const subjectSelect = document.getElementById("subjectSelect");
  try {
    const subjectResponse = await fetch(`${api}/class/subjects/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });

    if (!subjectResponse.ok) throw new Error("Failed to fetch subject data");
    const subjectData = await subjectResponse.json();
    subjectSelect.innerHTML = `<option value="">Select a subject</option>`;
    subjectData.forEach((item) => {
      const option = document.createElement("option");
      option.dataset.id = item.id;
      option.value = item.name;
      option.textContent = item.name;
      subjectSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching subjects:", error);
  }

  // Handle form submission
const form = document.getElementById("academic");
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData();
  formData.append("student", document.getElementById("registrationId").value);
  formData.append("subject", document.getElementById("subjectSelect").value);
  formData.append("grade", document.getElementById("classSelect").value);
  formData.append("term", document.getElementById("termSelect").value);
  formData.append("first_ca", document.getElementById("first_ca").value);
  formData.append("second_ca", document.getElementById("second_ca").value);
  formData.append("third_ca", document.getElementById("third_ca").value);
  formData.append("examination", document.getElementById("exam").value);
  formData.append("comment", document.getElementById("comment").value);

try {
  const response = await fetch(`${api}/result/upload/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
    },
    body: formData,
  });

  const alertContainer = document.getElementById("alertContainer");
  if (response.ok) {
    alertContainer.innerHTML = `
      <div class="flex items-center p-4 mb-4 border-l-4 bg-green-100 border-green-500 text-green-700" role="alert">
        <span class="font-medium">Success:</span> Result uploaded successfully!
      </div>`;
    setTimeout(() => (alertContainer.innerHTML = ""), 5000);
    form.reset(); // Clear the form
  } else {
    const errorResponse = await response.json();
    console.error("Server response:", errorResponse);
    alertContainer.innerHTML = `
      <div class="flex items-center p-4 mb-4 border-l-4 bg-red-100 border-red-500 text-red-700" role="alert">
        <span class="font-medium">Error:</span> ${
          errorResponse.message || JSON.stringify(errorResponse)
        }
      </div>`;
    setTimeout(() => (alertContainer.innerHTML = ""), 5000);
  }
} catch (error) {
  console.error("Error uploading results:", error);
  const alertContainer = document.getElementById("alertContainer");
  alertContainer.innerHTML = `
    <div class="flex items-center p-4 mb-4 border-l-4 bg-red-100 border-red-500 text-red-700" role="alert">
      <span class="font-medium">Error:</span> An unexpected error occurred.
    </div>`;
  setTimeout(() => (alertContainer.innerHTML = ""), 5000);
}

});
});
