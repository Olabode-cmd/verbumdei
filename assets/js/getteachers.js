
import { api } from "./api.js";

const token = localStorage.getItem("authToken");
document.addEventListener("DOMContentLoaded", function () {
  fetch(`${api}/staff/staff/`, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      // Check if the response is okay (status in the range 200-299)
      if (!response.ok) {
        throw new Error("Network response was not ok: " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      const tableBody = document.getElementById("teacher-frame");

      if (data.length === 0) {
        console.log("No staff members found.");
        return;
      }

      data.forEach((staff) => {
        const row = `
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
                        <!-- Phone number hidden inside the icon -->
                        <a href="tel:${staff.phone_number_1}">
                            <i class="fa fa-phone bg-blue-600 text-white px-3 py-3 rounded-full"></i>
                        </a>

                        <!-- Email hidden inside the icon -->
                        <a href="mailto:${staff.email}">
                            <i class="fa fa-envelope bg-blue-600 text-white px-3 py-3 rounded-full"></i>
                        </a>
                    </div>
                </div>
            `;
        tableBody.innerHTML += row; // Append the new row to the table body
      });
    })
    .catch((error) => {
      console.error("Error fetching staff data:", error);
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
