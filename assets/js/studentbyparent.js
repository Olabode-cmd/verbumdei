import { api } from "./api.js";
const token = localStorage.getItem("authToken");
const parent_code = localStorage.getItem("admin_id");

// Fetch and populate term dropdown
async function fetchTerms() {
  try {
    const response = await fetch('https://service.verbumdeiportal.com/term/all/', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error("Failed to fetch terms:", response.status);
      return [];
    }
  } catch (error) {
    console.error("Error fetching terms:", error);
    return [];
  }
}

// Generate link to print-result page - make it globally accessible
window.generateReportLink = function(studentID, term) {
  if (!term) {
    alert("Please select a term.");
    return;
  }

  const encodedTerm = encodeURIComponent(term);
  const link = `../hot/print-result.html?studentID=${studentID}&term=${encodedTerm}`;
  
  // Redirect to the generated link
  window.location.href = link;
};

document.addEventListener("DOMContentLoaded", async function () {
  const apiUrl = `${api}/parent/dashboard/${parent_code}`;
  const wardContainer = document.getElementById("wardContainer");
  const loadingSpinner = document.getElementById("loadingSpinner");

  // Display spinner while fetching data
  loadingSpinner.style.display = "flex";

  try {
    // Fetch terms first
    const terms = await fetchTerms();
    
    // Fetch ward data
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    
    const data = await response.json();
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

            <div class="mt-6 flex items-center space-x-3">
                <select id="term-${ward.id}" class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-500 focus:outline-none">
                    <option value="">Select Term</option>
                    ${terms.map(term => `<option value="${term.name}">${term.name}</option>`).join('')}
                </select>
                <button onclick="generateReportLink(${ward.id}, document.getElementById('term-${ward.id}').value)" class="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    View Reports
                </button>
            </div>
        </div>
    </div>
`;

        wardContainer.appendChild(wardElement);
      });
    } else {
      wardContainer.innerHTML = `<p>No ward data found for this parent.</p>`;
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    loadingSpinner.style.display = "none"; // Hide spinner on error
    wardContainer.innerHTML = `<p>Error loading ward data. Please try again later.</p>`;
  }
});
