import { api } from "./api.js";

const token = localStorage.getItem("authToken");

  const termSelect = document.getElementById("termSelect");
  try {
    const termResponse = await fetch(`${api}/term/all/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });

    if (!termResponse.ok) throw new Error("Failed to fetch term data");
    const termData = await termResponse.json();
    termSelect.innerHTML = `<option value="">Select a term</option>`;
    termData.forEach((item) => {
      const option = document.createElement("option");
      option.dataset.id = item.id;
      option.value = item.name;
      option.textContent = item.name;
      termSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching terms:", error);
  }

function uploadCommentForm(formID, studentID, term, signature, comment, endPoint) {
  const form = document.getElementById(formID);
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent form from submitting normally

    // Create a FormData object and append the form fields
    const formData = new FormData();
    formData.append("term", document.getElementById(term).value);
    formData.append("student", document.getElementById(studentID).value);
    formData.append("comment", document.getElementById(comment).value);
    formData.append("upload", document.getElementById(signature).files[0]);

    try {
      // Send the form data to the server
      const response = await fetch(`${api}/result/${endPoint}/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
        },
        body: formData,
      });

      const alertContainer = document.getElementById("alertContainer");

      if (response.ok) {
        // Success case
        alertContainer.innerHTML = `
                <div class="flex items-center p-4 mb-4 border-l-4 bg-green-100 border-green-500 text-green-700" role="alert">
                    <span class="font-medium">Success:</span> Result uploaded successfully!
                </div>`;
        setTimeout(() => (alertContainer.innerHTML = ""), 5000);
        form.reset(); // Clear the form
      } else {
        // Error response from server
        const errorResponse = await response.json();
        console.error("Server response:", errorResponse);
        alertContainer.innerHTML = `
                <div class="flex items-center p-4 mb-4 border-l-4 bg-red-100 border-red-500 text-red-700" role="alert">
                    <span class="font-medium">Error:</span> ${
                      errorResponse.message || JSON.stringify(errorResponse)
                    }
                </div>`;
        setTimeout(() => (alertContainer.innerHTML = ""), 5000);
      }
    } catch (error) {
      // Handle unexpected errors
      console.error("Error uploading results:", error);
      const alertContainer = document.getElementById("alertContainer");
      alertContainer.innerHTML = `
            <div class="flex items-center p-4 mb-4 border-l-4 bg-red-100 border-red-500 text-red-700" role="alert">
                <span class="font-medium">Error:</span> An unexpected error occurred.
            </div>`;
      setTimeout(() => (alertContainer.innerHTML = ""), 5000);
    }
  });
}

uploadCommentForm("hot-comment", "registrationId", "termSelect", "hotsignature", "hotcomment", "head-teacher-commentary/upload");
