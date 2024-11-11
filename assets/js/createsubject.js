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

document.addEventListener("DOMContentLoaded", function () {
  const parentSelect = document.getElementById("class-name");

  async function fetchClass() {
    try {
      const response = await fetch(`${api}/class/classes`, {
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
          option.textContent = `${grade.name}`;
          parentSelect.appendChild(option);
        });
      } else {
        console.error("Failed to fetch parents");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  fetchClass();
});

document
  .getElementById("subject-creation")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("name", document.getElementById("subject-name").value);
    formData.append("grade", document.getElementById("class-name").value);
    formData.append("teacher", document.getElementById("teacher-name").value);

    try {
      const response = await fetch(`${api}/class/subjects/`, {
        method: "POST",
        body: formData,
        headers: {},
      });

      if (response.ok) {
        const data = await response.json();
        alert("Subject ecreated successfully!");
        document.getElementById("class-creation").reset();
      } else {
        const errorData = await response.json();
        alert("Failed to Create subject");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again later.");
    }
  });
