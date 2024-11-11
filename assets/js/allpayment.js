import { api } from "./api.js";

const token = localStorage.getItem("authToken");
// Fetch and display existing payments
fetch(`${api}/payment/physical-payments/`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Token ${token}`,
  },
})
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    const tableBody = document.getElementById("paymentTableBody");
    tableBody.innerHTML = ""; // Clear existing content

    data.forEach((payment) => {
      const row = `
                <tr>
                    <td class="px-2 sm:px-5 py-2 sm:py-5 border-b border-gray-200 bg-white whitespace-nowrap">${
                      payment.id
                    }</td>
                    <td class="px-2 sm:px-5 py-2 sm:py-5 border-b border-gray-200 bg-white whitespace-nowrap">
                        ${payment.student.first_name} ${
        payment.student.last_name
      }
                    </td>
                    <td class="px-2 sm:px-5 py-2 sm:py-5 border-b border-gray-200 bg-white whitespace-nowrap">
                        ${payment.payment_name.title}
                    </td>
                    <td class="px-2 sm:px-5 py-2 sm:py-5 border-b border-gray-200 bg-white whitespace-nowrap">
                        &#8358;${payment.amount_paid}.00
                    </td>
                    <td class="px-2 sm:px-5 py-2 sm:py-5 border-b border-gray-200 bg-white whitespace-nowrap">
                        &#8358;${payment.balance}.00
                    </td>
                    <td class="px-2 sm:px-5 py-2 sm:py-5 border-b border-gray-200 bg-white whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            ${payment.status}
                        </span>
                    </td>
                    <td class="px-2 sm:px-5 py-2 sm:py-5 border-b border-gray-200 bg-white whitespace-nowrap">
                        ${payment.payment_id}
                    </td>
                    <td class="px-2 sm:px-5 py-2 sm:py-5 border-b border-gray-200 bg-white whitespace-nowrap">
                        ${payment.transaction_id}
                    </td>
                    <td class="px-2 sm:px-5 py-2 sm:py-5 border-b border-gray-200 bg-white whitespace-nowrap">
                        ${payment.method}
                    </td>
                    <td class="px-2 sm:px-5 py-2 sm:py-5 border-b border-gray-200 bg-white whitespace-nowrap">
                        ${new Date(payment.time).toLocaleString()}
                    </td>
                </tr>
            `;
      tableBody.insertAdjacentHTML("beforeend", row);
    });
  })
  .catch((error) => console.error("Error fetching payment data:", error));

// Call fetchPayments on window load
window.onload = fetchPayments;
