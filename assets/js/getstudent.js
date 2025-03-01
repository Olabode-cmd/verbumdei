import { api } from "./api.js";

const token = localStorage.getItem("authToken");

// GET ALL STUDENTS AND LOAD INTO THE TABLE
document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("authToken");
  const studentsPerPage = 10;
  let currentPage = 1;
  let studentsData = [];
  const tableBody = document.getElementById("student-table-body");
  const searchInput = document.getElementById("hs-table-input-search");

  function fetchStudents() {
    tableBody.innerHTML = `
  <tr>
    <td colspan="8" class="text-center py-4">
      <div class="flex items-center justify-center gap-2">
        <svg class="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 019.293-7.293 1 1 0 01.707 1.707A6 6 0 106 12H4z"></path>
        </svg>
        <span class="text-gray-600 animate-pulse">Loading...</span>
      </div>
    </td>
  </tr>`;

    fetch(`${api}/student/students/`, {
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        studentsData = data;
        renderTable();
      })
      .catch((error) => {
        console.error("Error fetching student data:", error);
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-red-600">Failed to load students. Please try again.</td></tr>`;
      });
  }

  function renderTable(filteredData = studentsData) {
    tableBody.innerHTML = "";
    const start = (currentPage - 1) * studentsPerPage;
    const paginatedData = filteredData.slice(start, start + studentsPerPage);

    if (paginatedData.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" class="text-center py-4">No students found</td></tr>`;
      return;
    }

    paginatedData.forEach((student) => {
      const row = `
        <tr>
          <td class="py-3 ps-3">
            <div class="flex items-center h-5">
              <input type="checkbox" class="border-gray-300 rounded text-blue-600 focus:ring-blue-500">
            </div>
          </td>
          <td class="p-3 whitespace-nowrap text-sm font-medium text-gray-800">
            <img src="${student.img_url}" alt="${student.first_name} ${student.last_name}" class="w-10 h-10 rounded-full">
          </td>
          <td class="p-3 whitespace-nowrap text-sm font-medium text-gray-800">
            ${student.first_name} ${student.last_name} ${student.other_name || ""}
          </td>
          <td class="py-3 px-1 whitespace-nowrap text-sm text-gray-800">
            ${student.registration_id}
          </td>
          <td class="py-3 px-1 whitespace-nowrap text-sm text-gray-800">
            ${new Date(student.registration_date).toDateString()}
          </td>
          <td class="py-3 px-1 whitespace-nowrap text-sm text-gray-800">
            ${student.parent}
          </td>
          <td class="py-3 px-1 whitespace-nowrap text-sm text-gray-800">
            ${student.type}
          </td>
          <td class="p-3 whitespace-nowrap text-end text-sm font-medium">
            <a href="student-profile.html?studentID=${student.id}">
              <img src="/assets/images/dots.svg" alt="dots" class="cursor-pointer">
            </a>
          </td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });

    updatePagination(filteredData.length);
  }

  function updatePagination(totalStudents) {
    const totalPages = Math.ceil(totalStudents / studentsPerPage);
    const paginationContainer = document.querySelector(".pagination");
    paginationContainer.innerHTML = "";

    const createPageButton = (page) => `
      <a href="#" class="px-3 py-2 text-sm ${page === currentPage ? "text-white bg-blue-600 border-blue-600" : "text-gray-500 bg-white border-gray-200"}
      rounded hover:bg-gray-100 hover:text-gray-700" data-page="${page}">
        ${page}
      </a>
    `;

    // Previous button
    // if (currentPage > 1) {
    //   paginationContainer.innerHTML += `
    //     <a href="#" class="px-3 py-2 text-sm text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-100 hover:text-gray-700" data-page="${currentPage - 1}">
    //       <i class="fa fa-chevron-left"></i>
    //     </a>
    //   `;
    // }

    paginationContainer.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || 
        i === totalPages ||  // Last page
        i === totalPages - 1 || // Second to last page
        (i >= currentPage - 1 && i <= currentPage + 1) // Show current, previous, and next
      ) {
        paginationContainer.innerHTML += createPageButton(i);
      } else if (
        i === currentPage - 2 || i === currentPage + 2
      ) {
        paginationContainer.innerHTML += `<span class="mx-1">...</span>`; // Ellipsis for skipped pages
      }
    }


    // Next button
    // if (currentPage < totalPages) {
    //   paginationContainer.innerHTML += `
    //     <a href="#" class="px-3 py-2 text-sm text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-100 hover:text-gray-700" data-page="${currentPage + 1}">
    //       <i class="fa fa-chevron-right"></i>
    //     </a>
    //   `;
    // }

    document.querySelectorAll(".pagination a[data-page]").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const page = parseInt(e.target.getAttribute("data-page"));
        if (page > 0 && page <= totalPages) {
          currentPage = page;
          renderTable();
        }
      });
    });
  }

  searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredData = studentsData.filter(
      (student) =>
        student.first_name.toLowerCase().includes(searchTerm) ||
        student.last_name.toLowerCase().includes(searchTerm) ||
        (student.other_name && student.other_name.toLowerCase().includes(searchTerm))
    );
    currentPage = 1;
    renderTable(filteredData);
  });

  fetchStudents();
});




document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const token = localStorage.getItem("authToken");
  const studentID = urlParams.get("studentID");
  const studentApiUrl = `${api}/student/student/${studentID}`;
  const paymentApiUrl = `${api}/payment/student-payment/`;
  const termName = document.getElementById('term').value;
  
  if (studentID) {
    fetch(studentApiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    })
      .then((response) => response.json())
      .then((student) => {
        renderStudentDetails(student);
        // Fetch payment history using the student's registration_id
        const studentRegID = student.registration_id;
        fetchPaymentHistory(studentRegID);
      })
      .catch((error) =>
        console.error("Error fetching student details:", error)
      );
  }

  function renderStudentDetails(student) {
    document.querySelector(
      ".student-name"
    ).textContent = `${student.first_name} ${student.other_name} ${student.last_name}`;
    document.querySelector(".student-id").textContent = student.registration_id;
    document.querySelector(".student-profile-image").src =
      student.img_url || "assets/images/default-profile.png";
    document.querySelector(".age").textContent = `${student.date_of_birth} (${
      new Date().getFullYear() - new Date(student.date_of_birth).getFullYear()
    })`;
    document.querySelector(".gender").textContent = student.gender;
    document.querySelector(".registration-date").textContent = new Date(
      student.registration_date
    ).toLocaleDateString();
    document.querySelector(".parent").textContent = student.parent;
    document.querySelector(".home-address").textContent = student.home_address;

    // for the report sheet
    document.querySelector(
      ".fullname"
    ).textContent = `NAME: ${student.first_name} ${student.other_name} ${student.last_name}`;
    document.querySelector(".studentid").textContent = `REGISTRATION ID: ${student.registration_id}`;
    document.querySelector(".dob").textContent = `AGE: ${new Date().getFullYear() - new Date(student.date_of_birth).getFullYear()
    }`;
    document.querySelector(".sex").textContent = `GENDER: ${student.gender}`;
  
  }
  
  function fetchPaymentHistory(registrationID) {
    if (!registrationID) {
      console.error("Registration ID is missing.");
      return;
    }

    fetch(`${paymentApiUrl}${registrationID}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    })
      .then((response) => response.json())
      .then((payments) => {
        renderPaymentHistory(payments);
      })
      .catch((error) =>
        console.error("Error fetching payment history:", error)
      );
  }

  function renderPaymentHistory(payments) {
    const paymentHistoryTable = document.getElementById(
      "payment-history-table-body"
    );

    if (!paymentHistoryTable) {
      console.error("Payment history table body element not found.");
      return;
    }

    paymentHistoryTable.innerHTML = ""; // Clear the table before adding new rows

    if (payments.length === 0) {
      const row = `<tr><td colspan="5">No payment history found</td></tr>`;
      paymentHistoryTable.innerHTML = row;
    } else {
      payments.forEach((payment) => {
          const row = `
            <tr>
              <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">${payment.payment_id}</td>
              <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">${new Date(payment.time).toLocaleDateString()}</td>
              <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">${payment.amount_paid}</td>
              <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">${payment.balance}</td>
              <td class="px-4 py-2 whitespace-nowrap text-sm ${getStatusClass(payment.status)}">${payment.status}</td>
            </tr>
          `;

        paymentHistoryTable.innerHTML += row;
      });
    }
  }

  function getStatusClass(status) {
    switch (status) {
      case "COMPLETED":
        return "text-green-500";
      case "PENDING":
        return "text-amber-500";
      case "OUTSTANDING":
        return "text-red-500";
      default:
        return "";
    }
  }
});


// fetch terms as dropdown
const termSelect = document.getElementById("term");
const termResponse = await fetch(`${api}/term/all/`, {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Token ${token}`,
  },
});
if (!termResponse.ok) throw new Error("Failed to fetch term data");
const termData = await termResponse.json();

// Clear existing options and add default option
termSelect.innerHTML = `<option value="">Select a term</option>`;
termData.forEach((item) => {
  const option = document.createElement("option");
  option.dataset.id = item.id;
  option.value = item.name;
  option.textContent = item.name;
  termSelect.appendChild(option);
});

