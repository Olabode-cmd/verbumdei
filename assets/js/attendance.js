import { api } from "./api.js";

const person_id = localStorage.getItem("admin_id");
const token = localStorage.getItem("authToken");

async function fetchClasses() {
  try {
    const response = await fetch(`${api}/class/classes/`, {
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok)
      throw new Error(`Request failed with status ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
}

function createAttendanceRow(student, grade) {
  return `
<tr>
  <td class="pl-6 py-3 text-left">
    <label class="flex">
      <input
        type="checkbox"
        id="present-${student.registration_id}"
        class="present-checkbox shrink-0 border-gray-200 rounded text-blue-600 focus:ring-blue-500"
      />
    </label>
  </td>
  <td class="pl-6 lg:pl-3 xl:pl-0 pr-6 py-3 text-left">
    <div class="flex items-center gap-x-2">
      <img
        src="${student.img_url}"
        alt="${student.first_name}"
        class="h-8 w-8 rounded-full"
      />
      <span
        class="text-xs font-semibold uppercase tracking-wide text-gray-800"
      >
        ${student.first_name} ${student.last_name}
      </span>
    </div>
    <input type="hidden" value="${
      student.registration_id
    }" class="student-id" />
  </td>
  <td class="px-6 py-3 text-left">
    <span class="text-xs font-semibold text-gray-800">${grade}</span>
  </td>
    <td class="px-6 py-3 text-left">
        <input type="checkbox" name="present" class="border-gray-200 rounded text-blue-600 focus:ring-blue-500">
    </td>
  <td class="px-6 py-3 text-left">
    <span class="text-xs font-semibold text-gray-800">
      ${new Date().toISOString().split("T")[0]}
    </span>
  </td>
  <td class="px-6 py-3 text-left">
    <button
      type="button"
      class="save-attendance-btn py-2 my-4 px-3 inline-flex justify-center items-center gap-2 rounded-md border font-medium bg-blue-600 text-white shadow-sm hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm"
      data-student-id="${student.registration_id}"
      data-grade="${grade}"
    >
      mark
    </button>
  </td>
</tr>

  `;
}

async function sendAttendance(studentId, grade, date) {
  const attendanceData = { student: studentId, grade, date };

  try {
    const response = await fetch(
      `${api}/attendance/attendance/create/${person_id}/`,
      {
        method: "POST",
        body: JSON.stringify(attendanceData),
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok)
      throw new Error(`Request failed with status ${response.status}`);
    const data = await response.json();
    console.log("Attendance saved:", data);
    alert("Attendance marked successfully!");
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to mark attendance. Please try again.");
  }
}

function attachSaveButtonEvent(row) {
  const saveButton = row.querySelector(".save-attendance-btn");
  saveButton.addEventListener("click", () => {
    const studentId = saveButton.getAttribute("data-student-id");
    const grade = saveButton.getAttribute("data-grade");
    const date = new Date().toISOString().split("T")[0]; // Today's date

    sendAttendance(studentId, grade, date);
  });
}

async function loadClasses() {
  const classes = await fetchClasses();
  const studentListContainer = document.getElementById(
    "student-list-container"
  );
  studentListContainer.innerHTML = ""; // Clear existing content

  if (classes.length > 0) {
    const grade = classes[0].name;
    classes[0].students.forEach((student) => {
      const row = document.createElement("tr");
      row.innerHTML = createAttendanceRow(student, grade);
      studentListContainer.appendChild(row);
      attachSaveButtonEvent(row);
    });
  }
}

document.addEventListener("DOMContentLoaded", loadClasses);
