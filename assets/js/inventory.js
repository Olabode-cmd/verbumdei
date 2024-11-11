import { api } from "./api.js";

const token = localStorage.getItem("authToken");

document.addEventListener("DOMContentLoaded", function () {
  const parentSelect = document.getElementById("inventory-type");

  async function fetchCategory() {
    try {
      const response = await fetch(`${api}/inventory/all-type/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        data.forEach((category) => {
          const option = document.createElement("option");
          option.value = category.name;
          option.textContent =  category.name;
          parentSelect.appendChild(option);
        });
      } else {
        console.error("Failed to fetch Category");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  fetchCategory();
});


document
  .getElementById("invent")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("type", document.getElementById("inventory-type").value);
    formData.append("name", document.getElementById("item-name").value); // Fix here, 'name' field ID should be 'item-name'
    formData.append("quantity", document.getElementById("quantity").value);
    formData.append("unit_cost", document.getElementById("unit_cost").value);

    const response = await fetch(`${api}/inventory/all-inventory/`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (response.ok) {
      alert("Inventory saved successfully!");
      document.getElementById("invent").reset(); // Correct form reset
      window.location.reload();
    } else {
      const errorData = await response.json();
      alert(
        "Failed to save Inventory: " + (errorData.detail || "Unknown error")
      );
    }
  });

document
  .getElementById("category")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append("name", document.getElementById("name").value);
    const response = await fetch(`${api}/inventory/all-type/`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      alert("Category saved successfully!");
      document.getElementById("category").reset(); // Correct form reset
      window.location.reload();
    } else {
      const errorData = await response.json();
      alert(
        "Failed to save Inventory Category: " +
          (errorData.detail || "Unknown error")
      );
    }
  });


document.addEventListener("DOMContentLoaded", async function () {
  const inventoryBody = document.getElementById("inventory-body");

  // Fetch inventory data
  async function fetchInventory() {
    try {
      const response = await fetch(`${api}/inventory/all-inventory/`);
      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      data.forEach((item) => {
        const row = document.createElement("tr");

        // Log the raw time to the console
        console.log("Raw time from server:", item.time_of_purchase);

        row.innerHTML = `
                    <td class="py-4 px-6 text-sm text-gray-500">
                        <div class="flex items-center h-5">
                            <input type="checkbox" class="border-gray-300 rounded text-blue-600 focus:ring-blue-500">
                        </div>
                    </td>
                    <td class="py-4 px-6 text-sm text-gray-500">${item.name}</td>
                    <td class="py-4 px-6 text-sm text-gray-500">${item.type}</td>
                    <td class="py-4 px-6 text-sm text-gray-500">${item.quantity}</td>
                    <td class="py-4 px-6 text-sm text-gray-500">${item.unit_cost}</td>
                    <td class="py-4 px-6 text-sm text-gray-500">${item.total_cost}</td>
                  
                `;

        inventoryBody.appendChild(row);
      });
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    }
  }

  // Call the fetch function to populate the table
  fetchInventory();
});
