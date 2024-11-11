import { api } from "./api.js"; // Ensure you have the correct path for your API

document.addEventListener("DOMContentLoaded", function () {
  const classSelect = document.getElementById("class-add");
  const registrationIdInput = document.getElementById("registrationId");
  const studentDropdown = document.getElementById("studentDropdown");
  const studentList = document.getElementById("studentList");
  const selectedStudentList = document.getElementById("selectedStudentList");
  const token = localStorage.getItem("authToken");

  let students = []; // To store fetched students
  let selectedStudents = []; // To store selected students

  // Fetch class data and populate dropdown
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
          option.dataset.id = grade.id;
          option.value = grade.name;
          option.textContent = grade.name;
          classSelect.appendChild(option);
        });
      } else {
        console.error("Failed to fetch class");
      }
    } catch (error) {
      console.error("Error fetching class:", error);
    }
  }

  // Fetch students from API
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
          addStudentToSelection(student); // Add selected student
          studentDropdown.classList.add("hidden"); // Hide dropdown
          registrationIdInput.value = ""; // Clear input after selection
        });
        studentList.appendChild(listItem);
      });
    } else {
      studentDropdown.classList.add("hidden"); // Hide dropdown if no matches
    }
  });

  // Add selected student to the list and update UI
  function addStudentToSelection(student) {
    // Check if the student is already selected
    if (
      selectedStudents.some(
        (s) => s.registration_id === student.registration_id
      )
    ) {
      return; // Do not add duplicate students
    }

    // Add the student to the selected array
    selectedStudents.push(student);

    // Create list item for the selected student
    const listItem = document.createElement("li");
    listItem.textContent = `${student.first_name} ${student.last_name} (${student.registration_id})`;
    listItem.className =
      "py-2 px-4 bg-gray-100 rounded-lg flex justify-between items-center mt-2";

    // Add remove button for the selected student
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.className = "text-red-500 text-sm";
    removeBtn.addEventListener("click", () => {
      removeStudentFromSelection(student.registration_id, listItem); // Remove student on click
    });

    listItem.appendChild(removeBtn);
    selectedStudentList.appendChild(listItem); // Add student to the UI
  }

  // Remove student from the selection
  function removeStudentFromSelection(registrationId, listItem) {
    // Remove from the selected array
    selectedStudents = selectedStudents.filter(
      (s) => s.registration_id !== registrationId
    );
    // Remove from the UI
    selectedStudentList.removeChild(listItem);
  }

  // Hide dropdown when clicking outside
  document.addEventListener("click", (event) => {
    if (
      !studentDropdown.contains(event.target) &&
      event.target !== registrationIdInput
    ) {
      studentDropdown.classList.add("hidden");
    }
  });

  // Form submission handler
  document
    .getElementById("class-creation")
    .addEventListener("submit", async function (event) {
      event.preventDefault();
      console.log("Form submitted!");

      const selectedOption = classSelect.options[classSelect.selectedIndex];

      // Check if an option is selected
      if (!selectedOption || selectedOption.value === "Select class") {
        alert("Please select a class.");
        return;
      }

      const classId = selectedOption.dataset.id;

      const selectedStudentIds = selectedStudents.map((student) => student.id); // Use the actual ID of the student

      // Prepare the data to be sent
      const payload = {
        students: selectedStudentIds,
      };

      try {
        const response = await fetch(`${api}/class/patch/${classId}/`, {
          method: "PATCH",
          body: JSON.stringify(payload), // Send as JSON
          headers: {
            "Content-Type": "application/json", // Set content type to JSON
            Authorization: `Token ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          alert("Class students updated successfully!");
          document.getElementById("class-creation").reset(); // Reset form
          location.reload(); // Refresh page
        } else {
          const errorData = await response.json();
          alert(
            "Failed to add students: " + (errorData.detail || "Unknown error")
          );
        }
      } catch (error) {
        console.error("An error occurred. Please try again later:", error);
        alert("An error occurred. Please try again later.");
      }
    });

  // Initial fetch calls
  fetchClass();
  fetchStudents();
});
