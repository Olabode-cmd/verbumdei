import { api } from "./api.js";

document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = `${api}/program/events/`;

  // Fetch event data from API
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      const tableBody = document.getElementById("events-tbody");
      tableBody.innerHTML = ""; // Clear existing content

      data.forEach((event) => {
        // Format date and time
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString();
        const formattedTime = eventDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        const createdAtDate = new Date(event.created_at);
        const formattedCreatedAt = createdAtDate.toLocaleDateString();

        // Create a table row
        const row = `
                    <tr>
                        <td class="py-1 px-3 pe-0">
                            <div class="flex items-center h-5">
                                <input type="checkbox" class="border-gray-300 rounded text-blue-600 focus:ring-blue-500">
                            </div>
                        </td>
                        <td class="py-1">${event.name}</td>
                        <td class="py-1">${formattedDate}</td>
                        <td class="py-1">${formattedTime}</td>
                        <td class="py-1">${formattedCreatedAt}</td>
                    </tr>
                `;

        // Insert row into table
        tableBody.insertAdjacentHTML("beforeend", row);
      });
    })
    .catch((error) => console.error("Error fetching event data:", error));
});
