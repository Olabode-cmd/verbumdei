import { api } from "./api.js";

const token = localStorage.getItem("authToken");

// Function to populate a dropdown with terms
async function populateTermDropdown(dropdownId) {
  const termSelect = document.getElementById(dropdownId);
  try {
    const termResponse = await fetch(`${api}/term/all/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });

    if (!termResponse.ok) throw new Error("Failed to fetch term data");
    const termData = await termResponse.json();

    // Clear existing options and add default option
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
}

// Populate both dropdowns
populateTermDropdown("termPersonal");
populateTermDropdown("termSkill");
populateTermDropdown("termSense");
populateTermDropdown("termPys");
populateTermDropdown("termComment");





const person_id = localStorage.getItem("admin_id");

// Function to fetch classes
async function fetchClasses() {
  try {
    const response = await fetch(`${api}/class/classes/`, {
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok)
      throw new Error(`Request failed with status ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
}

// Function to create a dropdown with students
function createStudentDropdown(students, dataId) {
  const studentSelect = document.getElementById(dataId);

  if (!studentSelect) {
    console.error(`Element with ID ${dataId} not found.`);
    return;
  }

  // Clear existing options
  studentSelect.innerHTML = `<option value="">Select a student</option>`;

  // Populate dropdown with student data
  students.forEach((student) => {
    const option = document.createElement("option");
    option.value = student.registration_id; // Use registration_id as the value
    option.textContent = `${student.first_name} ${student.last_name} ${
      student.other_name || ""
    }`.trim(); // Full name as text
    studentSelect.appendChild(option);
  });
}

// Function to load classes and populate the dropdown
async function loadClasses() {
  const classes = await fetchClasses();
  console.log("Fetched classes:", classes); // Debugging

  const matchingClasses = classes.filter(
    (classItem) => classItem.teacher.staff_id === person_id
  );
  console.log("Matching classes:", matchingClasses); // Debugging

  if (matchingClasses.length > 0) {
    // Use the first matching class
    const students = matchingClasses[0].students;

    console.log("Students for dropdown:", students); // Debugging

    createStudentDropdown(students, "pStudent");
    createStudentDropdown(students, "sDStudent");
    createStudentDropdown(students, "sRStudent");
    createStudentDropdown(students, "PyStudent");
    createStudentDropdown(students, "CoStudent");
  } else {
    console.warn("No matching classes found for the current teacher.");
  }
}

// Call the function to load the classes and student dropdown when the page is loaded
document.addEventListener("DOMContentLoaded", loadClasses);

