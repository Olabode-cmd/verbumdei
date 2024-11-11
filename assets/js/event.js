import { api } from "./api.js";

const token = localStorage.getItem("authToken");

document
  .getElementById("eventForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    // Collect form data
    const formData = new FormData();
    formData.append("name", document.getElementById("event-name").value);
    formData.append("date", document.getElementById("event-date").value);

    try {
      const response = await fetch(`${api}/program/events/`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Token ${token}`, // Ensure user is authenticated
        },
      });

      if (response.ok) {
        alert("Event was successfully created");
        document.getElementById("eventForm").reset(); // Reset form fields
        window.location.reload(); // Reload the page
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.detail || "Could not create event"}`);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert("There was an error. Please try again.");
    }
  });
