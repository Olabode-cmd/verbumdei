import { api } from "./api.js";

const token = localStorage.getItem("authToken");
const person_id = localStorage.getItem("admin_id");

let allResultsData = [];
let currentPage = 1;
const resultsPerPage = 10;

// Render table rows with pagination
function renderTable(data, showPrompt = false) {
  const tbody = document.querySelector("tbody.bg-white");
  tbody.innerHTML = "";
  if (showPrompt) {
    tbody.innerHTML = `<tr><td colspan="11" class="text-center py-4 text-gray-500">Select a student and term to get started.</td></tr>`;
    renderPagination(0);
    return;
  }
  if (!Array.isArray(data) || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" class="text-center py-4 text-gray-500">No results found</td></tr>`;
    renderPagination(0);
    return;
  }
  // Pagination logic
  const startIdx = (currentPage - 1) * resultsPerPage;
  const endIdx = startIdx + resultsPerPage;
  const paginatedData = data.slice(startIdx, endIdx);
  paginatedData.forEach((item) => {
    const status = item.total_marks >= 50 ? "Pass" : "Fail";
    const statusClass =
      status === "Pass"
        ? "text-green-600 bg-green-100"
        : "text-red-600 bg-red-100";
    const row = `
      <tr>
        <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">${item.student_full_name || "Unknown"}</td>
        <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">${item.subject || "N/A"}</td>
        <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">${item.first_ca || 0}</td>
        <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">${item.second_ca || 0}</td>
        <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">${item.third_ca || 0}</td>
        <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">${item.continous_assessment || 0}</td>
        <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">${item.examination || 0}</td>
        <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">${item.total_marks || 0}%</td>
        <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">${item.grade || "N/A"}</td>
        <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap"><span class="${statusClass} text-sm font-medium px-2 py-1 rounded-lg">${status}</span></td>
        <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">${item.remark || ""}</td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
  renderPagination(data.length);
}

// Render pagination controls
function renderPagination(totalItems) {
  let paginationContainer = document.getElementById('pagination-container');
  if (!paginationContainer) {
    paginationContainer = document.createElement('div');
    paginationContainer.id = 'pagination-container';
    paginationContainer.className = 'flex justify-center mt-4';
    const tableParent = document.querySelector('.bg-white.px-3.py-4.rounded-lg.border');
    if (tableParent) tableParent.appendChild(paginationContainer);
  }
  paginationContainer.innerHTML = '';
  const totalPages = Math.ceil(totalItems / resultsPerPage);
  if (totalPages <= 1) return;
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = `mx-1 px-3 py-1 rounded ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`;
    btn.addEventListener('click', () => {
      currentPage = i;
      renderTable(allResultsData);
    });
    paginationContainer.appendChild(btn);
  }
}

// Fetch and filter students assigned to this teacher
async function fetchTeacherStudents() {
  try {
    const response = await fetch(`${api}/class/classes/`, {
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch classes");
    const classes = await response.json();
    // Filter for classes assigned to this teacher
    const matchingClasses = classes.filter(
      (classItem) => classItem.teacher.staff_id === person_id
    );
    // Collect all students from these classes
    let students = [];
    matchingClasses.forEach((classItem) => {
      if (Array.isArray(classItem.students)) {
        students = students.concat(classItem.students);
      }
    });
    return students;
  } catch (err) {
    return [];
  }
}

// Populate student dropdown with only teacher's students
async function populateStudentDropdown() {
  const studentSelect = document.querySelector('select[name="Student"]');
  if (!studentSelect) return;
  const students = await fetchTeacherStudents();
  studentSelect.innerHTML = '<option value="">Select Student</option>';
  students.forEach((student) => {
    const option = document.createElement("option");
    option.value = student.registration_id;
    option.textContent = `${student.registration_id} ${student.first_name} ${student.last_name}`;
    studentSelect.appendChild(option);
  });
}

// Fetch and populate term dropdown
async function fetchTerm() {
  const termSelect = document.querySelector('select[name="Term"]');
  if (!termSelect) return;
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
      termSelect.innerHTML = '<option value="">Select Term</option>';
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

// Fetch all results for all teacher's students
async function fetchAllResultsForTeacher() {
  const students = await fetchTeacherStudents();
  let data = [];
  for (const student of students) {
    const response = await fetch(
      `${api}/result/${student.registration_id}/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      }
    );
    if (response.ok) {
      const studentResults = await response.json();
      if (Array.isArray(studentResults)) {
        data = data.concat(studentResults);
      }
    }
  }
  return data;
}

// Filter results to only teacher's students
async function filterResults() {
  const studentID = document.getElementById("student").value;
  const termName = document.getElementById("term").value;
  const students = await fetchTeacherStudents();
  try {
    let data = [];
    if (studentID) {
      // Fetch results for selected student only if in teacher's list
      if (students.some(s => s.registration_id === studentID)) {
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
          data = await response.json();
        }
      }
    } else {
      // Fetch results for all teacher's students
      for (const student of students) {
        const response = await fetch(
          `${api}/result/${student.registration_id}/?term=${encodeURIComponent(termName)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
          }
        );
        if (response.ok) {
          const studentResults = await response.json();
          if (Array.isArray(studentResults)) {
            data = data.concat(studentResults);
          }
        }
      }
    }
    renderTable(data);
  } catch (error) {
    console.error("Error fetching filtered results:", error);
  }
}

// Event listeners
document.querySelector(".filter-button").addEventListener("click", (event) => {
  event.preventDefault(); // Prevent default form submission
  filterResults();
});

// On page load, show all results for all teacher's students
window.addEventListener("DOMContentLoaded", async function () {
  await fetchTerm();
  await populateStudentDropdown();
  // On initial load, show prompt
  renderTable([], true);
  // Optionally, add event listeners for filter button, etc.
  const filterBtn = document.querySelector('.filter-button');
  if (filterBtn) {
    filterBtn.addEventListener('click', async function () {
      const studentID = document.getElementById("student").value;
      const termName = document.getElementById("term").value;
      if (!studentID || !termName) {
        renderTable([], true);
        return;
      }
      // Fetch and filter results for selected student and term
      const students = await fetchTeacherStudents();
      let filtered = [];
      if (studentID && termName) {
        // Fetch results for the selected student and term
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
          filtered = await response.json();
        }
      }
      currentPage = 1;
      renderTable(filtered);
    });
  }
});
