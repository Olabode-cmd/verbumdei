import { api } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const studentID = urlParams.get("studentID");

  if (!studentID) {
    alert("Invalid Student ID.");
    return;
  }

  const token = localStorage.getItem("authToken");
  if (!token) {
    console.error("No auth token found. User might not be logged in.");
    return;
  }

  const form = document.getElementById("editStudentForm");
  const imageInput = document.getElementById("imageInput");
  const imagePreview = document.getElementById("imagePreview");

  // Fetch student details
  try {
    const response = await fetch(`${api}/student/student/${studentID}/`, {
      headers: { Authorization: `Token ${token}` },
    });

    if (response.ok) {
      const student = await response.json(); // ✅ Fix: Await the JSON response
      console.log("Fetched student data:", student);

      // Populate form fields
      document.getElementById("firstName").value = student.first_name;
      document.getElementById("otherName").value = student.other_name;
      document.getElementById("lastName").value = student.last_name;
      document.getElementById("dateOfBirth").value = student.date_of_birth;
      document.getElementById("gender").value = student.gender;
      document.getElementById("studentType").value = student.type;
      document.getElementById("homeAddress").value = student.home_address;
      document.getElementById("stateOfOrigin").value = student.state_of_origin;
      document.getElementById("lga").value = student.local_government_area;
      document.getElementById("nationality").value = student.nationality;
      document.getElementById("religion").value = student.religion;

      // Load existing profile image
      if (student.img_url) {
        imagePreview.src = student.img_url;
        imagePreview.classList.remove("hidden");
      }
    }
  } catch (error) {
    console.error("Error fetching student details:", error);
  }

  // Handle form submission
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("first_name", document.getElementById("firstName").value);
    formData.append("other_name", document.getElementById("otherName").value);
    formData.append("last_name", document.getElementById("lastName").value);
    formData.append(
      "date_of_birth",
      document.getElementById("dateOfBirth").value
    );
    formData.append("gender", document.getElementById("gender").value);
    formData.append("type", document.getElementById("studentType").value);
    formData.append(
      "home_address",
      document.getElementById("homeAddress").value
    );
    formData.append(
      "state_of_origin",
      document.getElementById("stateOfOrigin").value
    );
    formData.append(
      "local_government_area",
      document.getElementById("lga").value
    );
    formData.append("parent", document.getElementById("parent_select").value);
    formData.append(
      "nationality",
      document.getElementById("nationality").value
    );
    formData.append("religion", document.getElementById("religion").value);

    // Handle file upload
    if (imageInput.files.length > 0) {
      formData.append("upload", imageInput.files[0]);
    }

    try {
      const updateResponse = await fetch(
        `${api}/student/student/${studentID}/`,
        {
          method: "PUT", // ✅ Ensure the correct method is used
          headers: { Authorization: `Token ${token}` }, // ❌ Remove Content-Type (FormData handles it)
          body: formData, // ✅ Correct way to send FormData
        }
      );

      if (updateResponse.ok) {
        console.log("Student details updated successfully!");
        alert("Student details updated successfully!");
        window.location.reload();
      } else {
        console.error("Update failed:", await updateResponse.text());
        alert("Failed to update student details.");
      }
    } catch (error) {
      console.error("Error updating student:", error);
      alert("Failed to update student details.");
    }
  });
});
