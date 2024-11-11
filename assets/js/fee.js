import { api } from "./api.js";
const token = localStorage.getItem("authToken");

document.addEventListener("DOMContentLoaded", function () {
  const termSelect = document.getElementById("term-m");

  async function fetchTerm() {
    try {
      const response = await fetch(`${api}/term/all/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Ensure data is not empty and is the expected format
        if (Array.isArray(data) && data.length > 0) {
          data.forEach((term) => {
            const option = document.createElement("option");
            option.value = term.name;
            option.textContent = term.name;
            termSelect.appendChild(option);
          });
        } else {
          console.error("No terms found or invalid data format.");
        }
      } else {
        const errorMsg = await response.text();
        console.error("Failed to fetch terms:", errorMsg);
      }
    } catch (error) {
      console.error("Error fetching terms:", error);
    }
  }

  fetchTerm();
});
