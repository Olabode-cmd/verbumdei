import { api } from "./api.js";

const token = localStorage.getItem("authToken");
document.addEventListener("DOMContentLoaded", function () {
  const parentSelect = document.getElementById("teacher-name");

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
          option.value = teacher.staff_id;
          option.textContent = `${teacher.first_name} ${teacher.last_name} `;
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
  .getElementById("subject-creation")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("name", document.getElementById("subject-name").value);

    try {
      const response = await fetch(`${api}/class/subjects/`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert("Subject created successfully!");
        document.getElementById("subject-creation").reset();
      } else {
        const errorData = await response.json();
        console.error("Error details:", errorData);
        alert("Failed to create subject. Please check your inputs.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again later.");
    }
  });
