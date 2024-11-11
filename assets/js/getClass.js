import { api } from "./api.js";

const token = localStorage.getItem("authToken");
document.addEventListener("DOMContentLoaded", function () {
  const viewTeacherDetailsLink = document.getElementById(
    "view-teacher-details"
  );
  const classUrl = `${api}/class/classes/`;
  const token = localStorage.getItem("authToken");

  fetch(classUrl, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      populateClassDropdown(data);
    })
    .catch((error) => console.error("Error fetching class data:", error));

  function populateClassDropdown(classes) {
    const classSelect = document.getElementById("class");
    classes.forEach((classData) => {
      const option = document.createElement("option");
      option.value = classData.id;
      option.textContent = classData.name;
      classSelect.appendChild(option);
    });

    classSelect.addEventListener("change", function () {
      const selectedClassId = this.value;
      if (selectedClassId) {
        fetchClassDetails(selectedClassId);
      }
    });
  }

  function fetchClassDetails(classId) {
    const classDetailsUrl = `${classUrl}${classId}/`;

    fetch(classDetailsUrl)
      .then((response) => response.json())
      .then((classData) => {
        populateStudentTable(classData.students);
        renderTeacherInfo(classData.teacher);
        document.getElementById("teacher-container").style.display = "block";
      })
      .catch((error) => console.error("Error fetching class details:", error));
  }

  function populateStudentTable(students) {
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    students.forEach((student) => {
      const row = document.createElement("tr");

      const checkboxCell = document.createElement("td");
      checkboxCell.classList.add("py-3", "ps-4");
      const checkboxDiv = document.createElement("div");
      checkboxDiv.classList.add("flex", "items-center", "h-5");
      const checkbox = document.createElement("input");
      checkbox.setAttribute("type", "checkbox");
      checkbox.classList.add(
        "border-gray-200",
        "rounded",
        "text-blue-600",
        "focus:ring-blue-500"
      );
      checkboxDiv.appendChild(checkbox);
      checkboxCell.appendChild(checkboxDiv);
      row.appendChild(checkboxCell);

      const profileImageCell = document.createElement("td");
      profileImageCell.classList.add(
        "px-6",
        "py-4",
        "whitespace-nowrap",
        "text-sm",
        "font-medium",
        "text-gray-800"
      );
      const profileImage = document.createElement("img");
      profileImage.setAttribute(
        "src",
        student.img_url || "assets/images/default-profile.png"
      );
      profileImage.setAttribute(
        "alt",
        `${student.first_name} ${student.last_name}`
      );
      profileImage.classList.add("w-10", "h-10", "rounded-full");
      profileImageCell.appendChild(profileImage);
      row.appendChild(profileImageCell);

      const fullnameCell = document.createElement("td");
      fullnameCell.classList.add(
        "px-6",
        "py-4",
        "whitespace-nowrap",
        "text-sm",
        "text-gray-800"
      );
      fullnameCell.textContent = `${student.first_name} ${student.last_name}`;
      row.appendChild(fullnameCell);

      const studentIdCell = document.createElement("td");
      studentIdCell.classList.add(
        "px-6",
        "py-4",
        "whitespace-nowrap",
        "text-sm",
        "text-gray-800"
      );
      studentIdCell.textContent = student.registration_id;
      row.appendChild(studentIdCell);

      const performanceCell = document.createElement("td");
      performanceCell.classList.add(
        "px-6",
        "py-4",
        "whitespace-nowrap",
        "text-sm",
        "text-gray-800"
      );
      performanceCell.textContent = student.performance;
      row.appendChild(performanceCell);

      const actionCell = document.createElement("td");
      actionCell.classList.add(
        "px-6",
        "py-4",
        "whitespace-nowrap",
        "text-sm",
        "text-gray-800",
        "text-end"
      );
      const actionLink = document.createElement("a");
      actionLink.setAttribute("href", "student-profile.html");
      actionLink.classList.add("text-blue-600", "hover:underline");
      actionLink.textContent = "View Profile";
      actionCell.appendChild(actionLink);
      row.appendChild(performanceCell);

      tbody.appendChild(row);
    });
  }

  function renderTeacherInfo(teacher) {
    const teacherProfileImage = document.querySelector(
      ".teacher-profile-image"
    );
    const teacherName = document.querySelector(".teacher-name");
    const teacherSubject = document.querySelector(".teacher-subject");
    const teacherStaffID = document.querySelector(".teacher-id");
    const teacherUrl = document.querySelector(".profile-url");

    if (teacher) {
      teacherProfileImage.src =
        teacher.img_url || "assets/images/teacher-pfp.png";
      teacherName.textContent = `${teacher.first_name} ${teacher.last_name}`;
      teacherStaffID.textContent = teacher.staff_id;
      viewTeacherDetailsLink.setAttribute(
        "href",
        `teacher-profile.html?staffID=${teacher.id}`
      );
    } else {
      teacherProfileImage.src = "assets/images/default-profile.png";
      teacherName.textContent = "No teacher assigned";
      teacherSubject.textContent = "";
      teacherId.textContent = "";
    }
  }
});

var options = {
  chart: {
    type: "donut",
  },
  series: [80, 20], // Percentage of attendance
  labels: ["Present", "Absent"],
  colors: ["#6366F1", "#FBBF24"], // Corresponds to Present and Absent colors
  legend: {
    show: false,
  },
  dataLabels: {
    enabled: true,
    formatter: function (val) {
      return val + "%";
    },
  },
};

var chart = new ApexCharts(
  document.querySelector("#attendance-chart"),
  options
);
chart.render();
