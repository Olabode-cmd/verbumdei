import { api } from "./api.js";

const token = localStorage.getItem("authToken");

function uploadForm(formID, studentID, term, title, score, endPoint) {
  const form = document.getElementById(formID);
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent form from submitting normally

    // Create a FormData object and append the form fields
    const formData = new FormData();
    formData.append("term", document.getElementById(term).value);
    formData.append("student", document.getElementById(studentID).value);
    formData.append("title", document.getElementById(title).value);
    formData.append("score", document.getElementById(score).value);

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

uploadForm("personal-dev", "pStudent", "termPersonal", "ptitle", "pscore", "personal-development/upload");
uploadForm("psycho-motor", "PyStudent", "termPys", "psySelect", "pychscore", "pyschomoto/upload");
uploadForm("sense-of-dev", "sRStudent", "termSense", "termSensR", "SRscore", "sense-of-responsibility/upload");
uploadForm("social-dev", "sDStudent", "termSkill", "titleSocial", "socscore", "social-development/upload");


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
uploadCommentForm("teacher-comment", "CoStudent", "termComment", "tcsignature", "tcomment", "teacher-commentary/upload");
