
import { api } from "./api.js";


async function getParent() {
  const parentSelect = document.getElementById("parent_select");
  const token = localStorage.getItem("authToken");

  if (!token) {
    console.error("No auth token found. User might not be logged in.");
    return;
  }

  try {
    const response = await fetch(`${api}/parent/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (response.status === 200) {
      const parents = await response.json();

      // Clear previous options except the first "Select a parent" one
      parentSelect.innerHTML = '<option value="">Select a parent</option>';

      // Populate dropdown with parents
      parents.forEach((parent) => {
        const option = document.createElement("option");
        option.value = parent.parent_name;
        option.textContent = parent.parent_name;
        parentSelect.appendChild(option);
      });
    } else {
      console.error("Failed to fetch parents.");
    }
  } catch (error) {
    console.error("Error fetching parents:", error);
  }
}

// Call the function when the page loads
document.addEventListener("DOMContentLoaded", getParent);
