import { api } from "./api.js";

const token = localStorage.getItem("authToken");

document
  .getElementById("annoucementForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    // Collect form data
    const formData = new FormData();
    formData.append("title", document.getElementById("title").value);
    formData.append("content", document.getElementById("content").value);

    try {
      const response = await fetch(`${api}/announcement/`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Token ${token}`, // Ensure user is authenticated
        },
      });

      if (response.ok) {
        alert("Annocement was successfully created");
        document.getElementById("annoucementForm").reset(); // Reset form fields
        window.location.reload(); // Reload the page
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.detail || "Could not create annoucement"}`);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert("There was an error. Please try again.");
    }
  });
