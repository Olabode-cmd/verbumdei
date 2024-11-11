import { api } from "./api.js";

const token = localStorage.getItem("authToken");


document
  .getElementById("voucher")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("type", document.getElementById("inventory-type").value);
    formData.append("name", document.getElementById("name").value); // Fix here, 'name' field ID should be 'item-name'
    formData.append("quantity", document.getElementById("quantity").value);
    formData.append("unit_cost", document.getElementById("unit_cost").value);

    const response = await fetch(`${api}/voucher/`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (response.ok) {
      alert("You have successfully raised a voucher... Hold on for the accountant action!");
      document.getElementById("voucher").reset(); // Correct form reset
      window.location.reload();
    } else {
      const errorData = await response.json();
      alert(
        "Failed to raise voucher: " + (errorData.detail || "Unknown error")
      );
    }
  });


// Function to fetch data from the API and populate the table
async function fetchVouchers() {
  try {
    const response = await fetch(`${api}/voucher/`);
    const data = await response.json();

    // Get the table body element
    const tableBody = document.getElementById("voucher-table-body");
    tableBody.innerHTML = "";

    // Loop through each voucher and add a row to the table
    data.forEach((voucher) => {
      const row = document.createElement("tr");

      row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${
                  voucher.code
                }</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${
                  voucher.type
                }</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${
                  voucher.name
                }</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₦${voucher.unit_cost.toFixed(
                  2
                )}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${
                  voucher.quantity
                }</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(
                  voucher.created_at
                ).toLocaleString()}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="status-badge px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                      voucher.status
                    )}">
                        ${voucher.status}
                    </span>
                </td>
            `;

      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching vouchers:", error);
  }
}

// Function to get the background color class based on the status
function getStatusBadgeClass(status) {
  switch (status.toUpperCase()) {
    case "APPROVED":
      return "bg-green-100 text-green-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "DECLINED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// Fetch vouchers on page load
fetchVouchers();

