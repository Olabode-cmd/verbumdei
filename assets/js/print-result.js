import { api } from "./api.js";
import { fetchStudentDetails } from './getStudentById.js';
import { fetchAttendanceData } from "./attendancebyStudent.js";

let student = null;

async function setStudentDetails() {
  return student;
}

// --- AGGREGATE SECTION LOGIC ---
async function fetchTermResults(registrationID, termName, token) {
  const response = await fetch(
    `${api}/result/all/${registrationID}/?term=${encodeURIComponent(termName)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );
  if (!response.ok) throw new Error(`Failed to fetch results for ${termName}`);
  return response.json();
}

function getTermNamesForAggregate(termName) {
  // e.g. 'THIRD TERM 2024/2025' => ['FIRST TERM 2024/2025', 'SECOND TERM 2024/2025', 'THIRD TERM 2024/2025']
  const match = termName.match(/THIRD TERM (\d{4}\/\d{4})/i);
  if (!match) return null;
  const session = match[1];
  return [
    `FIRST TERM ${session}`,
    `SECOND TERM ${session}`,
    `THIRD TERM ${session}`,
  ];
}

async function renderAggregateSectionIfThirdTerm(student, token, currentTermName) {
  const aggregateSection = document.getElementById('aggregate-section');
  const aggregateContent = document.getElementById('aggregate-content');
  const registrationID = student.registration_id;
  const termNames = getTermNamesForAggregate(currentTermName);
  if (!termNames) {
    aggregateSection.classList.add('hidden');
    return;
  }
  // Show loading
  aggregateSection.classList.remove('hidden');
  aggregateContent.innerHTML = '<p>Loading annual aggregate data...</p>';
  const termLabels = ['First Term', 'Second Term', 'Third Term'];
  let resultsArr = [null, null, null];
  let errorsArr = [null, null, null];
  // Fetch all three terms in parallel, but handle errors per-term
  await Promise.all(termNames.map(async (term, idx) => {
    try {
      resultsArr[idx] = await fetchTermResults(registrationID, term, token);
    } catch (err) {
      errorsArr[idx] = true;
    }
  }));
  // Compute per-term totals and aggregate
  let html = '<table class="table-auto border-collapse border border-gray-300 w-full text-xs mb-2">';
  html += '<thead><tr class="bg-gray-100">';
  html += '<th class="border border-gray-300 px-2 py-1">Term</th>';
  html += '<th class="border border-gray-300 px-2 py-1">Total Marks</th>';
  html += '<th class="border border-gray-300 px-2 py-1">Max Marks</th>';
  html += '<th class="border border-gray-300 px-2 py-1">Weighted Average (%)</th>';
  html += '</tr></thead><tbody>';
  let grandTotal = 0, grandMax = 0, validTermCount = 0;
  resultsArr.forEach((result, idx) => {
    if (errorsArr[idx] || !result || !Array.isArray(result.academic_results) || result.academic_results.length === 0) {
      html += `<tr><td class="border border-gray-300 px-2 py-1">${termLabels[idx]}</td><td colspan="3" class="border border-gray-300 px-2 py-1 text-gray-500">No data available for ${termLabels[idx]}</td></tr>`;
      return;
    }
    const results = result.academic_results;
    const total = results.reduce((sum, r) => sum + (r.total_marks || 0), 0);
    const max = results.length * 100;
    const avg = max ? ((total / max) * 100).toFixed(2) : '0.00';
    grandTotal += total;
    grandMax += max;
    validTermCount++;
    html += `<tr><td class="border border-gray-300 px-2 py-1">${termLabels[idx]}</td><td class="border border-gray-300 px-2 py-1">${total}</td><td class="border border-gray-300 px-2 py-1">${max}</td><td class="border border-gray-300 px-2 py-1">${avg}%</td></tr>`;
  });
  // Aggregate row
  const grandAvg = grandMax ? ((grandTotal / grandMax) * 100).toFixed(2) : '0.00';
  html += `<tr class="font-bold bg-blue-50"><td class="border border-gray-300 px-2 py-1">Aggregate</td><td class="border border-gray-300 px-2 py-1">${grandTotal}</td><td class="border border-gray-300 px-2 py-1">${grandMax}</td><td class="border border-gray-300 px-2 py-1">${grandAvg}%</td></tr>`;
  html += '</tbody></table>';
  // Optionally, add a summary
  html += `<div class="text-sm mt-2"><strong>Annual Weighted Average:</strong> ${grandAvg}%</div>`;
  aggregateContent.innerHTML = html;
}


document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("authToken");
  const urlParams = new URLSearchParams(window.location.search);
  const studentID = urlParams.get("studentID");
  const termName = urlParams.get("term");
  const academicTerm = document.querySelector(".term-tile");
  const termTableName = document.getElementById('termName')
  academicTerm.textContent = `END OF ${termName} Academic Session Result`;
  termTableName.textContent = `${termName} Academic Session`;

  const parts = termName.split(" ");
  const sessionYear = parts[parts.length - 1];
  const termCycle = parts.slice(0, parts.length - 1).join(" ");

  const session = document.getElementById('session');
  const term = document.getElementById('term');
  session.textContent = `${sessionYear} SESSION`
  term.textContent = `${termCycle}`


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

    student = await studentResponse.json();
    await setStudentDetails();
    await displayStudentDetails();
    // console.log(student);
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
    // console.log(academicResults);
    renderResultsTable(academicResults.academic_results);
    renderDevelopmentSections(academicResults);
    renderRemarks(academicResults);
    renderStudentDetails(student, academicResults);

    // --- AGGREGATE SECTION ---
    await renderAggregateSectionIfThirdTerm(student, token, termName);

  } catch (error) {
    console.error("Error:", error);
  }
});

function calculateAge(birthDateString) {
  // Ensure the date format is correctly parsed
  const birthDate = new Date(birthDateString);
  if (isNaN(birthDate)) {
    return 'Invalid date';
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

function calculateWeightedAverage(academicResults) {
  // Accepts either an array or an object with academic_results property
  let resultsArray = academicResults;
  if (academicResults && !Array.isArray(academicResults) && Array.isArray(academicResults.academic_results)) {
    resultsArray = academicResults.academic_results;
  }
  if (!Array.isArray(resultsArray) || resultsArray.length === 0) return 0;
  const totalMarks = resultsArray.reduce(
    (total, result) => total + (result.total_marks || 0),
    0
  );
  const maxMarks = resultsArray.length * 100;
  return maxMarks ? (totalMarks / maxMarks) * 100 : 0;
}

// Student details
async function displayStudentDetails() { 
  const studentDetails = await setStudentDetails();
  // console.log(studentDetails);

  if (studentDetails) {
    const age = calculateAge(studentDetails.date_of_birth);

    // document.getElementById('gender').textContent = `${studentDetails.gender || 'N/A'}`;
    // document.getElementById('age').textContent = `${age}`;

    const studentImage = document.getElementById('student-image');
    studentImage.src = studentDetails.img_url;
    studentImage.alt = `${studentDetails.first_name} ${studentDetails.last_name}`;

    let dob = document.getElementById('dob')
    dob.textContent = studentDetails.date_of_birth
  } else {
    document.getElementById('student-details').innerText = 'Failed to fetch student details.';
  }
  // fetchStudentDetails(id)
  //   .then((studentDetails) => {
  //     console.log('Student details fetched:', studentDetails);

  //     if (studentDetails) {
  //       const age = calculateAge(studentDetails.date_of_birth);

  //       document.getElementById('gender').innerText = `${studentDetails.gender || 'N/A'}`;
  //       document.getElementById('age').innerText = `${age}`;
  //     } else {
  //       document.getElementById('student-details').innerText = 'Failed to fetch student details.';
  //     }
  //   });
}

function displayAttendanceCount() {
  fetchAttendanceData()
    .then((attendanceData) => {
      console.log('Attendance data fetched:', attendanceData);

      if (attendanceData) {
        document.getElementById('attendanceCount').innerText = `${attendanceData.total_attendance}`;
      } else {
        document.getElementById('attendanceCount').innerText = 'Failed to fetch attendance count.';
      }
    });
}

displayAttendanceCount();

// Render Results Table
function renderResultsTable(academicResults) {
  const tbody = document.getElementById("academic-data");
  const overallPercentageElement = document.getElementById("overall-percentage"); // Target the h1 element
  const totalMarksElement = document.getElementById("total-marks");
  tbody.innerHTML = ""; // Clear existing rows
  document.getElementById('studentClass').innerText = `${academicResults[0]?.grade || 'N/A'}`;

  let totalMarksSum = 0; // To hold the sum of total_marks
  let maxMarks = 0; // To hold the total possible marks

  // let totalCourses = academicResults.length;

  if (academicResults && academicResults.length > 0) {
    academicResults.forEach((item) => {
      totalMarksSum += item.total_marks || 0;
      maxMarks += 100;

      // Determine the grade and remark based on total_marks
      let grade = "N/A";
      let remark = "N/A";

      if (item.total_marks >= 90) {
        grade = "A+";
        remark = "Excellent";
      } else if (item.total_marks >= 80) {
        grade = "A";
        remark = "Very Good";
      } else if (item.total_marks >= 70) {
        grade = "B";
        remark = "Good";
      } else if (item.total_marks >= 60) {
        grade = "C";
        remark = "Fairly Good";
      } else if (item.total_marks >= 50) {
        grade = "D";
        remark = "Fair";
      } else {
        grade = "E";
        remark = "Poor";
      }

      const row = `
      <tr>
        <td class="border border-gray-300 px-4 py-2 text-xs text-gray-900 whitespace-nowrap">
          ${item.subject || "N/A"}
        </td>
        <td class="border border-gray-300 px-4 py-2 text-xs text-gray-900 whitespace-nowrap">
          ${item.first_ca || 0}
        </td>
        <td class="border border-gray-300 px-4 py-2 text-xs text-gray-900 whitespace-nowrap">
          ${item.second_ca || 0}
        </td>
        <td class="border border-gray-300 px-4 py-2 text-xs text-gray-900 whitespace-nowrap">
          ${item.third_ca || 0}
        </td>
        <td class="border border-gray-300 px-4 py-2 text-xs text-gray-900 whitespace-nowrap">
          ${item.examination || 0}
        </td>
        <td class="border border-gray-300 px-4 py-2 text-xs text-gray-900 whitespace-nowrap">
          ${item.first_ca + item.second_ca + item.third_ca + item.examination || 0}
        </td>
        <td class="border border-gray-300 px-4 py-2 text-xs text-gray-900 whitespace-nowrap">
          ${item.total_marks || 0}%
        </td>
        <td class="border border-gray-300 px-4 py-2 text-xs text-gray-900 whitespace-nowrap">
          ${grade}
        </td>
        <td class="border border-gray-300 px-4 py-2 text-xs text-gray-900 whitespace-nowrap">
          ${remark}
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

    // Clear the <h1> tag if there are no results
    overallPercentageElement.textContent = "No results to calculate the overall percentage.";
  }

  // Calculate overall percentage
  const overallPercentage = ((totalMarksSum / maxMarks) * 100).toFixed(2);

  // Display overall percentage and total marks in the table
  const overallPercentageRow = `
  <tr>
    <td colspan="5" class="border border-gray-300 text-right py-4 text-xs text-gray-900 font-bold">
      Total Marks Scored: &nbsp;
    </td>
    <td class="border border-gray-300 px-2 py-2 text-xs text-gray-900 font-bold">
      ${totalMarksSum} / ${maxMarks}
    </td>
    <td colspan="2" class="border border-gray-300 text-right py-4 pl-1 text-xs text-gray-900 font-bold">
      Weighted Average: &nbsp;
    </td>
    <td class="border border-gray-300 px-2 py-2 text-xs text-gray-900 font-bold">
      ${overallPercentage}%
    </td>
  </tr>
`;
  tbody.insertAdjacentHTML("beforeend", overallPercentageRow);
}



// Render Development Sections
// function renderDevelopmentSections(results) {
//   const sections = [
//     { key: "personal_development", selector: ".personal-development" },
//     { key: "social_development", selector: ".social-development" },
//     { key: "psychomotor", selector: ".psychomotor-development" },
//     { key: "sense_of_responsibility", selector: ".sense-of-responsibility" },
//   ];

//   sections.forEach(({ key, selector }) => {
//     const container = document.querySelector(selector);
//     console.log("Selector:", selector, "Container:", container);
//     const items = results[key] || [];
//     container.innerHTML = items.length
//       ? items
//           .map(
//             (item) =>
//               `<p class="text-sm text-gray-700">${item.title}: ${item.score}</p>`
//           )
//           .join("")
//       : `<p class="text-sm text-gray-500">No data available.</p>`;
//   });
// }

function renderDevelopmentSections(results) {
  const sections = [
    { key: "personal_development", selector: ".personal-development" },
    { key: "social_development", selector: ".social-development" },
    { key: "psychomotor", selector: ".psychomotor-development" },
    { key: "sense_of_responsibility", selector: ".sense-of-responsibility" },
  ];

  sections.forEach(({ key, selector }) => {
    const container = document.querySelector(selector);
    // console.log("Selector:", selector, "Container:", container);
    const items = results[key] || [];

    // Generate the tbody content
    container.innerHTML = items.length
      ? `<table class="table-auto border-collapse border border-gray-300 w-full">
          <thead>
            <tr class="bg-gray-100">
              <th class="border border-gray-300 px-2 py-2 uppercase text-xs">Title</th>
              <th class="border border-gray-300 px-2 py-2 uppercase text-xs">Score</th>
            </tr>
          </thead>
          <tbody class="text-gray-700 text-sm">
            ${items
        .map(
          (item) =>
            `<tr class="hover:bg-gray-100 text-left">
                    <th class="border border-gray-300 px-2 py-2 uppercase text-[7.5px]">${item.title}</th>
                    <td class="border border-gray-300 px-2 py-2 font-medium text-[13px]">${item.score}</td>
                  </tr>`
        )
        .join("")}
          </tbody>
        </table>`
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
      ${teacherComment.img_url
      ? `<div class='flex space-x-3 items-end pb-3 border-b border-gray-500'>
            <h3>Signature: </h3>
            <img src="${teacherComment.img_url}" alt="Teacher's signature" style="width: 50px; height: auto; display: block; margin-top: 10px;" />
        </div>`
        : ""
      }
    `;
    teacherRemarksContainer.innerHTML = teacherCommentHTML;
  } else {
    teacherRemarksContainer.innerHTML = `<p>No teacher remarks available for this term.</p>`;
  }

  // src="${teacherComment.img_url}

  // Render Head Teacher's Comment
  const headTeacherRemarksContainer = document.querySelector(
    ".head-teacher-remarks"
  );
  if (remarks.head_teacher_comments.length > 0) {
    const headTeacherComment = remarks.head_teacher_comments[0];
    const headTeacherCommentHTML = `
      <p>${headTeacherComment.comment || "No comment provided."}</p>
      ${headTeacherComment.img_url
        ? `<div class='flex space-x-3 items-end pb-3 border-b border-gray-400'>
            <h3>Signature: </h3>
            <img src="${headTeacherComment.img_url}" alt="Head teacher's signature" style="width: 50px; height: auto; display: block; margin-top: 10px;" />
        </div>`
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
  // console.log(fullName || 'No data yet')
  if (nameElement) nameElement.textContent = `${fullName}` || "N/A";
  if (regIdElement) regIdElement.textContent = `${student.registration_id}` || "N/A";

  // Adjust according to actual data field

  // Calculate Grand Total and Weighted Average
  // const grandTotal = calculateGrandTotal(academicResults);
  const weightedAverage = calculateWeightedAverage(academicResults);

  // if (grandTotalElement) grandTotalElement.textContent = `Grand Total: ${grandTotal}`;
  if (weightedAverageElement) weightedAverageElement.textContent = `Weighted Average: ${weightedAverage.toFixed(
    2
  )}%`;
}

// Calculate Grand Total
// function calculateGrandTotal(academicResults) {
//   return academicResults.reduce((total, result) => {
//     if (result && typeof result.total_marks === "number") {
//       return total + result.total_marks;
//     }
//     return total;
//   }, 0);
// }


// Calculate Weighted Average
// function calculateWeightedAverage(academicResults) {
//   const totalMarks = academicResults.reduce(
//     (total, result) => total + result.total_marks,
//     0
//   );
//   const maxMarks = academicResults.length * 100;
//   return (totalMarks / maxMarks) * 100;
// }