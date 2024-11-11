import { api } from "./api.js";
const token = localStorage.getItem("authToken");
const parent_code = localStorage.getItem("admin_id");

document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = `${api}/parent/dashboard/${parent_code}`;
  const wardContainer = document.getElementById("wardContainer");
  const loadingSpinner = document.getElementById("loadingSpinner");

  // Display spinner while fetching data
  loadingSpinner.style.display = "flex";

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      loadingSpinner.style.display = "none"; // Hide spinner once data is loaded
      if (data.parent && data.parent["ward(s)"]) {
        const wards = data.parent["ward(s)"];
        wards.forEach((ward) => {
          const wardElement = document.createElement("div");
          wardElement.className =
            "bg-white p-4 border border-gray-300 rounded-lg w-full mb-4";
          wardElement.innerHTML = `
    <div class="flex items-start gap-3">
        <img src="${ward.img_url}" alt="${ward.first_name} ${
            ward.last_name
          }" class="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover">
        <div class="flex-grow min-w-0">
            <div class="flex items-start justify-between">
                <div>
                    <h3 class="font-bold text-lg truncate">${ward.first_name} ${
            ward.last_name
          }</h3>
                    <div class="flex items-center space-x-2 mt-0.5">
                        <span class="text-xs font-medium text-gray-600">${
                          ward.registration_id
                        }</span>
                        <img src="../assets/images/copy-regular.svg" alt="copy" class="w-3 h-3">
                    </div>
                </div>
                <span class="px-2 py-1 font-medium text-xs bg-green-100 text-green-600 rounded-xl whitespace-nowrap">
                    ${ward.type}
                </span>
            </div>

            <div class="mt-2 space-y-1">
                <p class="text-sm font-medium">Date of Birth: ${new Date(
                  ward.date_of_birth
                ).toLocaleDateString()}</p>
                <p class="text-xs font-medium text-gray-600">Gender: ${
                  ward.gender
                }</p>
                <p class="text-sm font-medium">Phone: <a href="tel:${
                  data.parent.phone_number_1
                }" class="text-blue-600 hover:underline">${
            data.parent.phone_number_1
          }</a></p>
            </div>

            <div class="mt-6">
                <a id="view-student-details-${
                  ward.id
                }" href="./student-report.html?studentID=${
            ward.id
          }" class="inline-block w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    View Reports
                </a>
            </div>
        </div>
    </div>
`;

          wardContainer.appendChild(wardElement);
        });
      } else {
        wardContainer.innerHTML = `<p>No ward data found for this parent.</p>`;
      }
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
      loadingSpinner.style.display = "none"; // Hide spinner on error
      wardContainer.innerHTML = `<p>Error loading ward data. Please try again later.</p>`;
    });
});
