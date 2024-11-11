import { api } from "./api.js";

const token = localStorage.getItem("authToken");
document.addEventListener("DOMContentLoaded", function () {
  const parentSelect = document.getElementById("teacher");

  async function fetchTeacher() {
    try {
      const response = await fetch(`${api}/staff/staff`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        data.forEach((teacher) => {
          const option = document.createElement("option");
          option.value = teacher.id;
          option.textContent = `${teacher.first_name} ${teacher.last_name}`;
          parentSelect.appendChild(option);
        });
      } else {
        console.error("Failed to fetch parents");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  fetchTeacher();
});

document
  .getElementById("class-creation")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    // Get the form inputs
    const className = document.getElementById("name").value;
    const teacherName = document.getElementById("teacher").value;

    // Validation: Check if class name or teacher name is empty
    if (!className || !teacherName) {
      alert("Class name and teacher name are required.");
      return;
    }

    const formData = new FormData();
    formData.append("name", className);
    formData.append("teacher", teacherName);

    try {
      const response = await fetch(`${api}/class/classes/`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert("Class created successfully!");
        document.getElementById("class-creation").reset(); // Reset the form on success
      } else {
        const errorData = await response.json();

        // Handling errorData.teacher, which may be an array
        if (
          Array.isArray(errorData.teacher) &&
          errorData.teacher.length === 0
        ) {
          alert("No teacher assigned.");
        } else if (Array.isArray(errorData.teacher)) {
          alert(errorData.teacher.join(", ")); // Show the teacher errors nicely
        } else {
          alert("An error occurred: " + JSON.stringify(errorData));
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again later.");
    }
  });

