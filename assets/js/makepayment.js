import { api } from "./api.js";

document
  .getElementById("add-payment")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    console.log("Form submitted!");

    const token = localStorage.getItem("authToken");

    const formData = new FormData();
    formData.append(
      "payment_name",
      document.getElementById("payment-type").value
    );
    formData.append("student", document.getElementById("registrationId").value);
    formData.append("term", document.getElementById("term-m").value);
    formData.append("method", document.getElementById("payment_method").value);
    formData.append("amount_paid", document.getElementById("deposit").value);

    const paymentMethod = document.getElementById("payment_method").value;
    const transactionNumberInput =
      document.getElementById("transaction_number");

    if (paymentMethod === "POS" || paymentMethod === "TRANSFER") {
      formData.append("transaction_id", transactionNumberInput.value);
    }

    try {
      const response = await fetch(`${api}/payment/physical-payments/`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Token ${token}`, // Token required for authenticated API
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert("Payment successful!");
        document.getElementById("add-payment").reset(); // Reset the form after success
        location.reload(); // Reload the page to reflect the changes
      } else {
        const errorData = await response.json();
        alert(
          "Failed to save payment: " + (errorData.detail || "Unknown error")
        );
      }
    } catch (error) {
      console.error("An error occurred. Please try again later:", error);
      alert("An error occurred. Please try again later.");
    }
  });

// Toggle the transaction number input based on payment method selection
document
  .getElementById("payment_method")
  .addEventListener("change", function () {
    const transactionInputDiv = document.getElementById("transaction-input");
    const transactionNumberInput =
      document.getElementById("transaction_number");

    if (this.value === "POS" || this.value === "TRANSFER") {
      transactionInputDiv.style.display = "block";
      transactionNumberInput.setAttribute("required", "true");
    } else {
      transactionInputDiv.style.display = "none";
      transactionNumberInput.removeAttribute("required");
    }
  });
