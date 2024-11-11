import { api } from "./api.js";

// tuition total-debt/

async function totalPayment() {
  // Corrected function name
  try {
    const response = await fetch(`${api}/payment/total-payment/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const totalData = await response.json();
      const sum = totalData.total_payment;

      const sumElement = document.getElementById("total-payment"); // Use a different ID for total payment
      if (sumElement) {
        sumElement.textContent = sum;
      }
    } else {
      console.error("Failed to fetch payment data");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Call the functions
totalDebt();


