import { api } from "./api.js";

const token = localStorage.getItem("authToken");
// Fetch class data
document.addEventListener("DOMContentLoaded", function () {
  const classSelect = document.getElementById("class"); // Update to correct ID
  const token = localStorage.getItem("authToken");

  async function fetchClass() {
    try {
      const response = await fetch(`${api}/class/classes/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        data.forEach((grade) => {
          const option = document.createElement("option");
          option.value = grade.name;
          option.textContent = grade.name;
          classSelect.appendChild(option); // Append to correct element
        });
      } else {
        console.error("Failed to fetch class");
      }
    } catch (error) {
      console.error("Error fetching class:", error);
    }
  }

  fetchClass();
});

// Fetch student
document.addEventListener("DOMContentLoaded", function () {
  const registrationIdInput = document.getElementById("registrationId");
  const studentDropdown = document.getElementById("studentDropdown");
  const studentList = document.getElementById("studentList");
  const token = localStorage.getItem("authToken");
  let students = []; // To store fetched students

  async function fetchStudents() {
    try {
      const response = await fetch(`${api}/student/students/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        students = await response.json(); // Store students globally
      } else {
        console.error("Failed to fetch students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  }

  // Show dropdown and filter options based on input
  registrationIdInput.addEventListener("input", function () {
    const filterValue = this.value.toLowerCase();
    studentList.innerHTML = ""; // Clear previous results
    const filteredStudents = students.filter((student) =>
      student.registration_id.toLowerCase().includes(filterValue)
    );

    // Show dropdown if there are matching students
    if (filteredStudents.length > 0 && filterValue) {
      studentDropdown.classList.remove("hidden");
      filteredStudents.forEach((student) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${student.first_name} ${student.last_name} (${student.registration_id})`;
        listItem.className = "py-2 px-4 hover:bg-blue-100 cursor-pointer";
        listItem.addEventListener("click", () => {
          registrationIdInput.value = student.registration_id; // Set input value
          studentDropdown.classList.add("hidden"); // Hide dropdown
        });
        studentList.appendChild(listItem);
      });
    } else {
      studentDropdown.classList.add("hidden"); // Hide dropdown if no matches
    }
  });

  // Hide dropdown when clicking outside
  document.addEventListener("click", (event) => {
    if (
      !studentDropdown.contains(event.target) &&
      event.target !== registrationIdInput
    ) {
      studentDropdown.classList.add("hidden");
    }
  });

  fetchStudents();
});

document.addEventListener("DOMContentLoaded", function () {
  const parentSelect = document.getElementById("payment-type");

  async function fetchPaymentType() {
    try {
      const response = await fetch(`${api}/payment/payment-types/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        data.forEach((type) => {
          const option = document.createElement("option");
          option.value = type.title;
          option.textContent = type.title;
          parentSelect.appendChild(option);
        });
      } else {
        console.error("Failed to fetch payment types");
      }
    } catch (error) {
      console.error("Error fetching payment types:", error);
    }
  }

  fetchPaymentType();
});
