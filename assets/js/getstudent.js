import { api } from "./api.js";

const token = localStorage.getItem("authToken");

document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("authToken");
  fetch(`${api}/student/students/`, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const tableBody = document.getElementById("student-table-body");
      const noResultsDiv = document.getElementById("no-results");

      if (data.length === 0) {
        noResultsDiv.style.display = "block";
      } else {
        noResultsDiv.style.display = "none";

        data.forEach((student) => {
          const row = `
            <tr>
                <td class="py-3 ps-3">
                    <div class="flex items-center h-5">
                        <input type="checkbox" class="border-gray-300 rounded text-blue-600 focus:ring-blue-500">
                    </div>
                </td>
                <td class="p-3 whitespace-nowrap text-sm font-medium text-gray-800">
                    <img src="${student.img_url}" alt="${student.first_name} ${
            student.last_name
          }" class="w-10 h-10 rounded-full">
                </td>
                <td class="p-3 whitespace-nowrap text-sm font-medium text-gray-800">
                    ${student.first_name} ${student.last_name} ${
            student.other_name
          }
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
                    <a id="view-teacher-details-${student.id}" href="#">
                        <img src="/assets/images/dots.svg" alt="dots" class="cursor-pointer self-end inline-flex">
                    </a>
                </td>
            </tr>
          `;
          tableBody.innerHTML += row;

          const viewTeacherDetailsLink = document.getElementById(
            `view-teacher-details-${student.id}`
          );
          viewTeacherDetailsLink.setAttribute(
            "href",
            `student-profile.html?studentID=${student.id}`
          );
        });
      }
    })
    .catch((error) => {
      console.error("Error fetching student data:", error);
    });
});

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const token = localStorage.getItem("authToken");
  const studentID = urlParams.get("studentID");
  const studentApiUrl = `${api}/student/student/${studentID}`;
  const paymentApiUrl = `${api}/payment/student-payment/`;

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
        fetchPaymentHistory(student.registration_id);
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
