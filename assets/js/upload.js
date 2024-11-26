import { api } from "./api.js";
const token = localStorage.getItem("authToken");
const adminId = localStorage.getItem("admin_id");

async function fetchClasses() {
  try {
    const response = await fetch(`${api}/class/classes/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch classes");
      return;
    }

    const classes = await response.json();
    populateClassDropdown(classes);
  } catch (error) {
    console.error("Error fetching classes:", error);
  }
}

function populateClassDropdown(classes) {
  const classSelect = document.getElementById("classSelect");
  classSelect.innerHTML = ""; // Clear any existing options

  // Create a default placeholder option
  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = "Select a class";
  classSelect.appendChild(placeholderOption);

  // Populate the dropdown with classes
  classes.forEach((classData) => {
    const option = document.createElement("option");
    option.value = classData.name; // Using the class ID as the value
    option.textContent = classData.name; // Using the class name as the display text
    classSelect.appendChild(option);
  });
}

async function fetchTerms() {
  try {
    const response = await fetch(`${api}/term/all/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch terms");
      return;
    }

    const terms = await response.json();
    populateTermDropdown(terms);
  } catch (error) {
    console.error("Error fetching terms:", error);
  }
}

function populateTermDropdown(terms) {
  const termSelect = document.getElementById("termSelect");
  termSelect.innerHTML = "";

  // Create a default placeholder option
  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = "Select a term";
  termSelect.appendChild(placeholderOption);

  // Populate the dropdown with terms
  terms.forEach((term) => {
    const option = document.createElement("option");
    option.value = term.name; // Using the term ID as the value
    option.textContent = term.name; // Using the term name as the display text
    termSelect.appendChild(option);
  });
}

async function fetchStudents() {
  try {
    const response = await fetch(`${api}/student/students/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch students");
      return;
    }

    const students = await response.json();
    // console.log(students)
    if (students && students.length > 0) {
      populateDropdown(students);
    } else {
      console.warn("No students found");
    }
  } catch (error) {
    console.error("Error fetching students:", error);
  }
}

async function fetchSubjects() {
  try {
    const response = await fetch(`${api}/class/subjects/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch subjects");
      return;
    }

    const subjects = await response.json();
    populateSubjectDropdown(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
  }
}

function populateSubjectDropdown(subjects) {
  const subjectSelect = document.getElementById("subjectSelect");
  subjects.forEach((subject) => {
    const option = document.createElement("option");
    option.value = subject.name;
    option.textContent = subject.name;
    subjectSelect.appendChild(option);
  });
}


function populateDropdown(students) {
  const dropdown = document.getElementById("studentsDropdown");

  // Clear any existing options
  dropdown.innerHTML = '<option value="">Select a student</option>';

  // Add options dynamically
  students.forEach((student) => {
    const option = document.createElement("option");
    option.value = student.name;
    option.textContent = student.name;
    dropdown.appendChild(option);
  });

  // Reinitialize Preline's Advanced Select
  Preline.plSelect(dropdown);
}

// Handle form submission
async function handleSubmit(event) {
  event.preventDefault();

  const studentId = document.getElementById("studentSearch").value;
  const subject = document.getElementById("subjectSelect").value;
  const classId = document.getElementById("classSelect").value;
  const termId = document.getElementById("termSelect").value;
  const continuousAssessment = document.getElementById(
    "continuousAssessment"
  ).value;
  const exam = document.getElementById("exam").value;

  const data = {
    student: studentId,
    subject: subject,
    grade: classId,
    term: termId,
    teacher: adminId,
    continous_assessment: continuousAssessment,
    examination: exam,
  };

  try {
    const response = await fetch(`${api}/result/upload/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      showAlert("Success!", "Result uploaded successfully!", "success");
      clearFields();
    } else {
      const errorResponse = await response.json();
      const errorMessage =
        errorResponse?.message || "Failed to upload results.";
      showAlert("Error", errorMessage, "error");
    }
  } catch (error) {
    console.error("Error uploading results:", error);
    showAlert("Error", "An unexpected error occurred.", "error");
  }
}

function showAlert(title, message, type) {
  const alertContainer = document.getElementById("alertContainer");
  const alertTypeClass =
    type === "success"
      ? "bg-green-100 border-green-500 text-green-700"
      : "bg-red-100 border-red-500 text-red-700";

  const alertHTML = `
    <div class="flex items-center p-4 mb-4 border-l-4 ${alertTypeClass}" role="alert">
      <svg
        aria-hidden="true"
        class="flex-shrink-0 w-5 h-5 mr-3"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg">
        <path d="M18 8A8 8 0 10.001 8a8 8 0 0018 0zm-8 4a.999.999 0 110-2 1 1 0 010 2zm0-3.5A1.5 1.5 0 118 6.5a1.5 1.5 0 012 0z"></path>
      </svg>
      <span class="sr-only">${type === "success" ? "Success" : "Error"}</span>
      <div>
        <span class="font-medium">${title}</span> ${message}
      </div>
    </div>
  `;

  alertContainer.innerHTML = alertHTML;

  setTimeout(() => {
    alertContainer.innerHTML = "";
  }, 5000);
}

function clearFields() {
  document.getElementById("studentSearch").value = "";
  document.getElementById("subjectSelect").value = "";
  document.getElementById("classSelect").value = "";
  document.getElementById("termSelect").value = "";
  document.getElementById("continuousAssessment").value = "";
  document.getElementById("exam").value = "";
}


document.addEventListener("DOMContentLoaded", () => {
  fetchStudents();
  fetchClasses();
  fetchTerms();
  fetchSubjects();

  const form = document.querySelector("form");
  form.addEventListener("submit", handleSubmit);
});