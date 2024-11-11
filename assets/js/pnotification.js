import { api } from "./api.js";

document.addEventListener("DOMContentLoaded", function () {
  const eventsUrl = `${api}/program/events/`;
  const announcementsUrl = `${api}/announcement/`;

  // Fetch event data from API
  fetch(eventsUrl)
    .then((response) => response.json())
    .then((data) => {
      const eventsBody = document.getElementById("events-body");
      eventsBody.innerHTML = ""; // Clear existing content

      data.forEach((event) => {
        // Format date and time
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString();
        const formattedTime = eventDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        // Create a list item for each event
        const eventRow = ` 
          <li class="bg-gray-50">
              <div class="flex items-center px-4 py-3">
                  <div class="flex-shrink-0">
                      <i class="fas fa-calendar text-blue-500"></i>
                  </div>
                  <div class="ml-3">
                      <h3 class="text-lg font-medium leading-6 text-gray-900"><b>Upcoming event</b></h3>
                      <p class="text-sm font-medium text-gray-900">${event.name}</p>
                      <p class="mt-1 text-sm text-gray-500">Date: ${formattedDate} Time: ${formattedTime}</p>
                  </div>
              </div>
          </li>
        `;

        // Insert event row into the events list
        eventsBody.insertAdjacentHTML("beforeend", eventRow);
      });
    })
    .catch((error) => console.error("Error fetching event data:", error));

  // Fetch announcement data from API
  fetch(announcementsUrl)
    .then((response) => response.json())
    .then((data) => {
      const announcementsBody = document.getElementById("announcements-body");
      announcementsBody.innerHTML = ""; // Clear existing content

      data.forEach((announcement) => {
        // Create a list item for each announcement
        const announcementRow = ` 
          <li class="bg-gray-50">
              <div class="flex items-center px-4 py-3">
                  <div class="flex-shrink-0">
                      <i class="fas fa-bell text-yellow-500"></i>
                  </div>
                  <div class="ml-3">
                      <h3 class="text-lg font-medium leading-6 text-gray-900"><b>Announcement</b></h3>
                      <p class="text-sm font-medium text-gray-900">${announcement.title}</p>
                      <p class="mt-1 text-sm text-gray-500">${announcement.content}</p>
                  </div>
              </div>
          </li>
        `;

        // Insert announcement row into the announcements list
        announcementsBody.insertAdjacentHTML("beforeend", announcementRow);
      });
    })
    .catch((error) =>
      console.error("Error fetching announcement data:", error)
    );
});
