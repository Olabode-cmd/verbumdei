import { api } from "./api.js";

document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("authToken");
  const urlParams = new URLSearchParams(window.location.search);
  const studentID = urlParams.get("studentID");
  const termName = urlParams.get("term");
  const academicTerm = document.querySelector(".term-tile");
  academicTerm.textContent = `END OF ${termName} Academic Session Result sheet`;

  if (!studentID || !token || !termName) {
    console.error("Missing student ID, authentication token, or term name.");
    return;
  }

  try {
    // Fetch and render student details
    const studentResponse = await fetch(
      `${api}/student/student/${studentID}/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      }
    );

    if (!studentResponse.ok) {
      throw new Error("Failed to fetch student details");
    }

    const student = await studentResponse.json();
    const registrationID = student.registration_id;

    // Fetch and render academic results
    const resultResponse = await fetch(
      `${api}/result/all/${registrationID}/?term=${encodeURIComponent(
        termName
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      }
    );

    if (!resultResponse.ok) {
      throw new Error("Failed to fetch academic results");
    }

    const academicResults = await resultResponse.json();
    renderResultsTable(academicResults.academic_results);
    renderDevelopmentSections(academicResults);
    renderRemarks(academicResults);
    renderStudentDetails(student, academicResults);
  } catch (error) {
    console.error("Error:", error);
  }
});

// Render Results Table
function renderResultsTable(academicResults) {
  const tbody = document.getElementById("academic-data");
  tbody.innerHTML = ""; // Clear existing rows

  if (academicResults && academicResults.length > 0) {
    academicResults.forEach((item) => {
      const row = `
        <tr>
          <td class="border border-gray-300 px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
            ${item.subject || "N/A"}
          </td>
          <td class="border border-gray-300 px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
            ${item.first_ca || 0}
          </td>
          <td class="border border-gray-300 px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
            ${item.second_ca || 0}
          </td>
          <td class="border border-gray-300 px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
            ${item.third_ca || 0}
          </td>
          <td class="border border-gray-300 px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
            ${item.examination || 0}
          </td>
          <td class="border border-gray-300 px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
            ${item.total_marks || 0}%
          </td>
          <td class="border border-gray-300 px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
            ${item.grade || "N/A"}
          </td>
        </tr>
      `;
      tbody.insertAdjacentHTML("beforeend", row);
    });
  } else {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="border border-gray-300 text-center py-4 text-sm text-gray-500">
          No academic results found for the term.
        </td>
      </tr>
    `;
  }
}

// Render Development Sections
function renderDevelopmentSections(results) {
  const sections = [
    { key: "personal_development", selector: ".personal-development" },
    { key: "social_development", selector: ".social-development" },
    { key: "psychomotor", selector: ".psychomotor-development" },
    { key: "sense_of_responsibility", selector: ".sense-of-responsibility" },
  ];

  sections.forEach(({ key, selector }) => {
    const container = document.querySelector(selector);
    const items = results[key] || [];
    container.innerHTML = items.length
      ? items
          .map(
            (item) =>
              `<p class="text-sm text-gray-700">${item.title}: ${item.score}</p>`
          )
          .join("")
      : `<p class="text-sm text-gray-500">No data available.</p>`;
  });
}

// Render Remarks
function renderRemarks(remarks) {
  // Render Teacher's Comment
  const teacherRemarksContainer = document.querySelector(".teacher-remarks");
  if (remarks.teacher_comments.length > 0) {
    const teacherComment = remarks.teacher_comments[0]; // Assuming only one comment per term
    const teacherCommentHTML = `
      <p>${teacherComment.comment || "No comment provided."}</p>
      ${
        teacherComment.img_url
          ? `<img src="${teacherComment.img_url}" alt="Teacher's signature" style="width: 150px; height: auto; display: block; margin-top: 10px;" />`
          : ""
      }
    `;
    teacherRemarksContainer.innerHTML = teacherCommentHTML;
  } else {
    teacherRemarksContainer.innerHTML = `<p>No teacher remarks available for this term.</p>`;
  }

  // Render Head Teacher's Comment
  const headTeacherRemarksContainer = document.querySelector(
    ".head-teacher-remarks"
  );
  if (remarks.head_teacher_comments.length > 0) {
    const headTeacherComment = remarks.head_teacher_comments[0]; // Assuming only one comment per term
    const headTeacherCommentHTML = `
      <p>${headTeacherComment.comment || "No comment provided."}</p>
      ${
        headTeacherComment.img_url
          ? `<img src="${headTeacherComment.img_url}" alt="Head teacher's signature" style="width: 150px; height: auto; display: block; margin-top: 10px;" />`
          : ""
      }
    `;
    headTeacherRemarksContainer.innerHTML = headTeacherCommentHTML;
  } else {
    headTeacherRemarksContainer.innerHTML = `<p>No head teacher remarks available for this term.</p>`;
  }
}

function renderStudentDetails(student, academicResults) {
  const nameElement = document.querySelector(".name");
  const regIdElement = document.querySelector(".reg-id");
  const grandTotalElement = document.querySelector(".grand-total");
  const weightedAverageElement = document.querySelector(".weighted-average");


  // Populate name, registration ID, class, and age
  const fullName = `${student.first_name} ${student.last_name} ${student.other_name}`;
  nameElement.textContent = `FULLNAME: ${fullName}` || "N/A";
  regIdElement.textContent = `REGISTRATION ID: ${student.registration_id}` || "N/A";
 
// Adjust according to actual data field

  // Calculate Grand Total and Weighted Average
  const grandTotal = calculateGrandTotal(academicResults);
  const weightedAverage = calculateWeightedAverage(academicResults);

  grandTotalElement.textContent = `Grand Total: ${grandTotal}`;
  weightedAverageElement.textContent = `Weighted Average: ${weightedAverage.toFixed(
    2
  )}%`;
}

// Calculate Grand Total (sum of total marks)function calculateGrandTotal(academicResults) {function calculateGrandTotal(academicResults) {
function calculateGrandTotal(academicResults) {
  return academicResults.reduce((total, result) => {
    // Check if total_marks exists and is a valid number
    if (result && typeof result.total_marks === "number") {
      return total + result.total_marks;
    }
    return total; // If total_marks is invalid, return the current total
  }, 0);
}


// Calculate Weighted Average
function calculateWeightedAverage(academicResults) {
  const totalMarks = academicResults.reduce(
    (total, result) => total + result.total_marks,
    0
  );
  const maxMarks = academicResults.length * 100; // Assuming 100 is the maximum mark for each subject
  return (totalMarks / maxMarks) * 100;
}