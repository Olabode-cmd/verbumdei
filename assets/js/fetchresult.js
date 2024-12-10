import { api } from "./api.js";

const token = localStorage.getItem("authToken"); // Replace with your actual token

// Render table rows
function renderTable(data) {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = ""; // Clear existing rows

  if (data.length > 0) {
    data.forEach((item) => {
      const status = item.total_marks >= 50 ? "Pass" : "Fail";
      const statusClass =
        status === "Pass"
          ? "text-green-600 bg-green-100"
          : "text-red-600 bg-red-100";

      const row = `
        <tr>
          <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">${
            item.student_full_name || "Unknown"
          }</td>
          <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">${
            item.subject || "N/A"
          }</td>
        <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">${
                item.first_ca || 0
        }</td>
        <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">${
            item.second_ca || 0
          }</td>
        <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">${
              item.third_ca || 0
          }</td>
          <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">${
            item.continous_assessment || 0
          }</td>
          <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">${
            item.examination || 0
          }</td>
          <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">${
            item.total_marks || 0
          }%</td>
          <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">${
            item.grade || "N/A"
          }</td>
          <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
            <span class="${statusClass} text-sm font-medium px-2 py-1 rounded-lg">${status}</span>
          </td>
          <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">${
            item.remark || "No Remark"
          }</td>
        </tr>
      `;
      tbody.insertAdjacentHTML("beforeend", row);
    });
  } else {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-4 text-sm text-gray-500">No results found.</td>
      </tr>
    `;
  }
}

// Fetch and populate student dropdown
async function fetchStudent() {
  const studentSelect = document.querySelector('select[name="Student"]');

  try {
    const response = await fetch(`${api}/student/students/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();

      // Clear existing options
      studentSelect.innerHTML = '<option value="">Select Student</option>';

      // Populate student options
      data.forEach((student) => {
        const option = document.createElement("option");
        option.value = student.registration_id;
        option.textContent = `${student.registration_id} ${student.first_name} ${student.last_name}`;
        studentSelect.appendChild(option);
      });
    } else {
      console.error("Failed to fetch students:", response.status);
    }
  } catch (error) {
    console.error("Error fetching students:", error);
  }
}

// Fetch and populate term dropdown
async function fetchTerm() {
  const termSelect = document.querySelector('select[name="Term"]');

  try {
    const response = await fetch(`${api}/term/all/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();

      // Clear existing options
      termSelect.innerHTML = '<option value="">Select Term</option>';

      // Populate term options
      data.forEach((term) => {
        const option = document.createElement("option");
        option.value = term.name;
        option.textContent = term.name;
        termSelect.appendChild(option);
      });
    } else {
      console.error("Failed to fetch terms:", response.status);
    }
  } catch (error) {
    console.error("Error fetching terms:", error);
  }
}

// Fetch and render result data
async function fetchAndRenderTable() {
  try {
    const response = await fetch(`${api}/result/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      renderTable(data);
    } else {
      console.error("Failed to fetch results:", response.status);
    }
  } catch (error) {
    console.error("Error fetching results:", error);
  }
}

// rendered filter result
async function filterResults() {
  const studentID = document.getElementById("student").value;
  const termName = document.getElementById("term").value;

  try {
    // Use await to resolve the fetch promise
    const response = await fetch(
      `${api}/result/${studentID}/?term=${encodeURIComponent(termName)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      }
    );

    if (response.ok) {
      // Use await to resolve the JSON parsing
      const data = await response.json();
      console.log(data);
      renderTable(data);
    } else {
      console.error("Failed to fetch filtered results:", response.status);
    }
  } catch (error) {
    console.error("Error fetching filtered results:", error);
  }
}

// Event listeners
document.querySelector(".filter-button").addEventListener("click", (event) => {
  event.preventDefault(); // Prevent default form submission
  filterResults();
});

// Load data on page load
window.onload = () => {
  fetchStudent();
  fetchAndRenderTable();
  fetchTerm();
};
