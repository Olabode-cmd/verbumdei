import { api } from "./api.js";

document.addEventListener("DOMContentLoaded", function () {
  const eventsUrl = `${api}/program/events/`;
  const announcementsUrl = `${api}/announcement/`;

  const eventsBody = document.getElementById("events-body");
  const announcementsBody = document.getElementById("announcements-body");

  // Function to set loading state
  function setLoading(element) {
    element.innerHTML = `<div class="flex justify-center items-center w-full py-10">
      <svg class="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 019.293-7.293 1 1 0 01.707 1.707A6 6 0 106 12H4z"></path>
      </svg>
    </div>`;
  }

  // Function to handle errors
  function setError(element, message) {
    element.innerHTML = `<li class="text-center py-3 text-red-500">${message}</li>`;
  }

  // Apply loading state to both sections
  setLoading(eventsBody);
  setLoading(announcementsBody);

  // Fetch event data
  fetch(eventsUrl)
    .then((response) => response.json())
    .then((data) => {
      eventsBody.innerHTML = "";

      if (data.length === 0) {
        setError(eventsBody, "No upcoming events.");
        return;
      }

      data.forEach((event) => {
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString();
        const formattedTime = eventDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

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

        eventsBody.insertAdjacentHTML("beforeend", eventRow);
      });
    })
    .catch((error) => {
      console.error("Error fetching event data:", error);
      setError(eventsBody, "Failed to load events.");
    });

  // Fetch announcement data
  fetch(announcementsUrl)
    .then((response) => response.json())
    .then((data) => {
      announcementsBody.innerHTML = ""; // Clear loading state

      if (data.length === 0) {
        setError(announcementsBody, "No announcements available.");
        return;
      }

      data.forEach((announcement) => {
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

        announcementsBody.insertAdjacentHTML("beforeend", announcementRow);
      });
    })
    .catch((error) => {
      console.error("Error fetching announcement data:", error);
      setError(announcementsBody, "Failed to load announcements.");
    });
});

