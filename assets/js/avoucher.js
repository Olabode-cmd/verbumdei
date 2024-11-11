import { api } from "./api.js";

const token = localStorage.getItem("authToken");
const spinner = document.getElementById("loading-spinner");

// Function to show the loading spinner
function showSpinner() {
  if (spinner) {
    spinner.style.display = "block";
  }
}

// Function to hide the loading spinner
function hideSpinner() {
  if (spinner) {
    spinner.style.display = "none";
  }
}

// Function to update the status of a voucher// Function to update the status of a voucher
async function updateVoucherStatus(voucherId, status) {
  showSpinner(); // Show spinner when request starts

  try {
    // Fetch the existing voucher details first
    const fetchResponse = await fetch(`${api}/voucher/${voucherId}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!fetchResponse.ok) {
      const errorData = await fetchResponse.json();
      alert(`Error fetching voucher details: ${errorData.detail || "Unknown error"}`);
      return;
    }

    const voucherData = await fetchResponse.json();

    // Update the status while keeping other fields unchanged
    voucherData.status = status;

    // Send the updated voucher data
    const response = await fetch(`${api}/voucher/${voucherId}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(voucherData),
    });

    if (response.ok) {
      alert(`Voucher ${status.toLowerCase()} successfully!`);
      await fetchVouchers(); // Refresh the list after update
    } else {
      const errorData = await response.json();
      alert(`Failed to update voucher status: ${errorData.detail || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Error updating voucher status:", error);
    alert("Error updating voucher status. Please try again.");
  } finally {
    hideSpinner(); // Hide spinner when request finishes
  }
}

window.updateVoucherStatus = updateVoucherStatus;

// Function to fetch vouchers and update the table
async function fetchVouchers() {
  showSpinner(); // Show spinner while fetching
  try {
    const response = await fetch(`${api}/voucher/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert(`Error fetching vouchers: ${errorData.detail || "Unknown error"}`);
      return;
    }

    const data = await response.json();
    const tableBody = document.getElementById("voucher-table-body");
    tableBody.innerHTML = "";

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
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div class="flex space-x-2">
            <button onclick="updateVoucherStatus('${
              voucher.id
            }', 'APPROVED')" class="text-white bg-green-500 p-2 rounded hover:bg-green-600">
              APPROVE
            </button>
            <button onclick="updateVoucherStatus('${
              voucher.id
            }', 'DECLINED')" class="text-white bg-red-500 p-2 rounded hover:bg-red-600">
              DECLINE
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    alert("Error fetching vouchers. Please try again.");
  } finally {
    hideSpinner(); // Hide spinner when done
  }
}

// Function to get the class for status badge
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

// Fetch vouchers when the page loads
fetchVouchers();
