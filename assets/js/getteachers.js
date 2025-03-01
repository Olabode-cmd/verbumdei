
import { api } from "./api.js";

const token = localStorage.getItem("authToken");
// GET ALL TEACHERS

document.addEventListener("DOMContentLoaded", function () {
  const teacherFrame = document.getElementById("teacher-frame");
  const searchInput = document.querySelector("input[placeholder='Search teachers list...']");
  let teachersData = []; // Store fetched teachers data for filtering

  // Show loading state
  teacherFrame.innerHTML = `
    <div class="md:col-span-4 flex justify-center items-center w-full py-10">
      <svg class="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 019.293-7.293 1 1 0 01.707 1.707A6 6 0 106 12H4z"></path>
      </svg>
    </div>
  `;

  fetch(`${api}/staff/staff/`, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok: " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      teachersData = data; // Store fetched data
      renderTeachers(data); // Display teachers
    })
    .catch((error) => {
      console.error("Error fetching staff data:", error);
      teacherFrame.innerHTML = `<p class="text-center text-red-500 font-semibold">Failed to load staff data.</p>`;
    });

  // Function to render teachers
  function renderTeachers(teachers) {
    if (teachers.length === 0) {
      teacherFrame.innerHTML = `<p class="text-center text-gray-600">No teachers found.</p>`;
      return;
    }

    teacherFrame.innerHTML = teachers
      .map((staff) => {
        return `
          <div class="bg-white px-3 py-5 rounded-lg text-center">
              <div class="flex items-center justify-between">
                  <span class="p-2 bg-green-500 rounded-full"></span>
                  <a href="teacher-profile.html?staffID=${staff.id}">
                      <img src="/assets/images/dots.svg" alt="dots">
                  </a>
              </div>

              <img src="${staff.img_url}" alt="teacher" class="rounded-full w-[50%] mx-auto">

              <h3 class="mt-2 text-blue-600 font-semibold text-2xl">${staff.first_name} ${staff.last_name}</h3>

              <div class="flex justify-center items-center space-x-2 cursor-pointer mt-1" onclick="copyToClipboard('${staff.staff_id}')">
                  <p class="text-gray-800 font-medium text-xs">${staff.staff_id}</p>
                  <img src="/assets/images/copy-regular.svg" alt="copy icon" class="w-[16px]">
              </div>
              <hr class="my-3" />

              <div class="flex justify-center items-center space-x-3">
                  <a href="tel:${staff.phone_number_1}">
                      <i class="fa fa-phone bg-blue-600 text-white px-3 py-3 rounded-full"></i>
                  </a>
                  <a href="mailto:${staff.email}">
                      <i class="fa fa-envelope bg-blue-600 text-white px-3 py-3 rounded-full"></i>
                  </a>
              </div>
          </div>
        `;
      })
      .join("");
  }

  // Search functionality
  searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredTeachers = teachersData.filter((staff) =>
      `${staff.first_name} ${staff.last_name}`.toLowerCase().includes(searchTerm)
    );
    renderTeachers(filteredTeachers);
  });
});



// Function to copy the staff_id to clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(function () {
    // Optionally, you can display a success message
    alert('Copied to clipboard: ' + text);
  }).catch(function (error) {
    console.error('Error copying text: ', error);
  });
}
