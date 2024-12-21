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

  <td class="pl-6 lg:pl-3 xl:pl-0 pr-6 py-3 text-left">
    <div class="flex items-center gap-x-2">
      <img
        src="${student.img_url || "placeholder.jpg"}"
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
    <span class="text-xs font-semibold text-gray-800">${
      new Date().toISOString().split("T")[0]
    }</span>
  </td>
  <td class="px-6 py-3 text-left">
          <input
        type="checkbox"
        id="present-${student.registration_id}"
        class="present-checkbox shrink-0 border-gray-200 rounded text-blue-600 focus:ring-blue-500"
      />
  </td>
  <td class="px-6 py-3 text-left">
    <span class="text-xs font-semibold text-gray-800">
      ${grade}
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

async function sendAttendance(studentId, grade, date, present = false) {
  if (!studentId || !grade || !date) {
    console.error("Missing required parameters: studentId, grade, or date.");
    alert("Please provide all required attendance details.");
    return;
  }

  const attendanceData = {
    student: studentId,
    grade: grade,
    date: date,
    present: present,
  };

  console.log("Attendance payload:", attendanceData);

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

    if (!response.ok) {
      const errorData = await response.json(); // Log error details
      console.error("Server error response:", errorData);
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("Attendance saved:", data);
    alert("Attendance marked successfully!");
  } catch (error) {
    console.error("Error marking attendance:", error);
    alert("Failed to mark attendance. Please try again.");
  }
}



function attachSaveButtonEvent(row) {
  const saveButton = row.querySelector(".save-attendance-btn");
  saveButton.addEventListener("click", () => {
    const studentId = saveButton.getAttribute("data-student-id");
    const grade = saveButton.getAttribute("data-grade");
    const date = new Date().toISOString().split("T")[0]; // Today's date

    // Get the present checkbox in the same row using the studentId
    const presentCheckbox = row.querySelector(`#present-${studentId}`);

    // Log the checkbox element to ensure we're selecting the right one
    console.log("Present Checkbox Element:", presentCheckbox);

    // Get the 'checked' state of the checkbox
    const present = presentCheckbox ? presentCheckbox.checked : false; // true if checked, false if unchecked

    // Log the present value to debug
    console.log("Present status:", present);

    // Send attendance data with correct present status
    sendAttendance(studentId, grade, date, present);
  });
}



async function loadClasses() {
  const classes = await fetchClasses();
  console.log("Fetched classes:", classes); // Log all fetched classes

  const studentListContainer = document.getElementById(
    "student-list-container"
  );
  studentListContainer.innerHTML = ""; // Clear existing content

  // Filter all classes where the teacher matches the current person_id
  const matchingClasses = classes.filter(
    (classItem) => classItem.teacher.staff_id === person_id
  );

  console.log("Matching classes for teacher:", matchingClasses); // Log matching classes

  if (matchingClasses.length > 0) {
    matchingClasses.forEach((classItem) => {
      const grade = classItem.name;
      console.log(`Rendering students for class: ${grade}`); // Log class name
      classItem.students.forEach((student) => {
        console.log("Rendering student:", student); // Log each student being rendered

        const row = document.createElement("tr");
        row.innerHTML = createAttendanceRow(student, grade);
        studentListContainer.appendChild(row);
        attachSaveButtonEvent(row);
      });
    });
  } else {
    console.log("No matching classes found for this teacher.");
    studentListContainer.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-gray-500">No classes found for this teacher.</td>
      </tr>
    `;
  }
}

document.addEventListener("DOMContentLoaded", loadClasses);
