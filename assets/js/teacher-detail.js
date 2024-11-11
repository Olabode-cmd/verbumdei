import { api } from "./api.js";

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const staffID = urlParams.get("staffID");
  const teacherApiUrl = `${api}/staff/staff/${staffID}`;
  if (staffID) {
    fetch(teacherApiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((teacher) => {
        renderTeacherDetails(teacher);
      })
      .catch((error) =>
        console.error("Error fetching teacher details:", error)
      );
  }

  function renderTeacherDetails(teacher) {
    // Populate the HTML elements with the teacher's details
    document.querySelector(
      ".teacher-name"
    ).textContent = `${teacher.first_name} ${teacher.last_name} ${teacher.other_name}`;
    document.querySelector(".teacher-id").textContent = teacher.staff_id;
    document.querySelector(".teacher-profile-image").src =
      teacher.img_url || "/assets/images/default-profile.png";
    document.querySelector(".gender").textContent = teacher.gender;
    document.querySelector(".employment-type").textContent =
      teacher.employment_type;
    document.querySelector(".employment-date").textContent = new Date(
      teacher.created_at
    ).toLocaleDateString();
    document.querySelector(".nin").textContent = teacher.nin; // Updated from 'expected-graduation-year' // Update with actual parent information if available
    document.querySelector(".address").textContent = teacher.home_address;
    document.querySelector(".status").textContent = teacher.status;
    // Correctly select and assign phone numbers
    document.querySelector(".phone-1").textContent = teacher.phone_number_1;
    document.querySelector(".phone-2").textContent = teacher.phone_number_2;
    document.querySelector(".email").textContent = teacher.email;
  }
});
