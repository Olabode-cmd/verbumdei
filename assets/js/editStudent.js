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
  const fileInput = document.getElementById("fileInput");
  const imagePreview = document.getElementById("imagePreview");
  const uploadIcon = document.getElementById("uploadIcon");
  const imageUploadContainer = document.getElementById("imageUploadContainer");
  const parentSelect = document.getElementById("parent_select");
  const submitButton = document.getElementById("submit-btn");

  // Function to set loading state
  const setLoadingState = (isLoading) => {
    if (isLoading) {
      submitButton.disabled = true;
      submitButton.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Updating...
      `;
    } else {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Proceed';
    }
  };

  // Fetch parents list
  try {
    const parentsResponse = await fetch(`${api}/parent/parents/`, {
      headers: { Authorization: `Token ${token}` },
    });

    if (!parentsResponse.ok) {
      throw new Error(`HTTP error! status: ${parentsResponse.status}`);
    }

    const parents = await parentsResponse.json();
    
    // Clear existing options except the default one
    parentSelect.innerHTML = '<option value="">Select a parent</option>';
    
    // Add parent options
    parents.forEach(parent => {
      const option = document.createElement('option');
      option.value = parent.id;
      option.textContent = `${parent.first_name} ${parent.last_name}`;
      parentSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching parents:", error);
  }

  // Handle image preview
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("File size should be less than 5MB");
        fileInput.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.classList.remove("hidden");
        uploadIcon.classList.add("hidden");
      };
      reader.readAsDataURL(file);
    }
  });

  // Handle drag and drop
  imageUploadContainer.addEventListener("dragover", (e) => {
    e.preventDefault();
    imageUploadContainer.classList.add("border-blue-500");
  });

  imageUploadContainer.addEventListener("dragleave", (e) => {
    e.preventDefault();
    imageUploadContainer.classList.remove("border-blue-500");
  });

  imageUploadContainer.addEventListener("drop", (e) => {
    e.preventDefault();
    imageUploadContainer.classList.remove("border-blue-500");
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }
      fileInput.files = e.dataTransfer.files;
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.classList.remove("hidden");
        uploadIcon.classList.add("hidden");
      };
      reader.readAsDataURL(file);
    }
  });

  // Fetch student details
  try {
    const response = await fetch(`${api}/student/student/${studentID}/`, {
      headers: { Authorization: `Token ${token}` },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const student = await response.json();
    console.log("Fetched student data:", student);

    // Populate form fields with default values
    document.getElementById("firstName").value = student.first_name || "";
    document.getElementById("otherName").value = student.other_name || "";
    document.getElementById("lastName").value = student.last_name || "";
    document.getElementById("dateOfBirth").value = student.date_of_birth || "";
    document.getElementById("gender").value = student.gender || "MALE"; // Default to MALE if not set
    document.getElementById("studentType").value = student.type || "DAY"; // Default to DAY if not set
    document.getElementById("homeAddress").value = student.home_address || "";
    document.getElementById("stateOfOrigin").value = student.state_of_origin || "";
    document.getElementById("lga").value = student.local_government_area || "";
    document.getElementById("nationality").value = student.nationality || "";
    document.getElementById("religion").value = student.religion || "";

    // Set parent select value
    if (student.parent) {
      parentSelect.value = student.parent;
    }

    // Load existing profile image
    if (student.upload) {
      imagePreview.src = student.upload;
      imagePreview.classList.remove("hidden");
      uploadIcon.classList.add("hidden");
    }
  } catch (error) {
    console.error("Error fetching student details:", error);
    alert("Failed to fetch student details. Please try again.");
  }

  // Handle form submission
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Validate required fields
    const requiredFields = {
      firstName: "First name",
      lastName: "Last name",
      dateOfBirth: "Date of birth",
      gender: "Gender",
      studentType: "Student type",
      parent_select: "Parent"
    };

    for (const [fieldId, fieldName] of Object.entries(requiredFields)) {
      const field = document.getElementById(fieldId);
      if (!field.value.trim()) {
        alert(`Please fill in the ${fieldName} field`);
        field.focus();
        return;
      }
    }

    const formData = new FormData();
    formData.append("first_name", document.getElementById("firstName").value);
    formData.append("other_name", document.getElementById("otherName").value);
    formData.append("last_name", document.getElementById("lastName").value);
    formData.append("date_of_birth", document.getElementById("dateOfBirth").value);
    formData.append("gender", document.getElementById("gender").value);
    formData.append("type", document.getElementById("studentType").value);
    formData.append("home_address", document.getElementById("homeAddress").value);
    formData.append("state_of_origin", document.getElementById("stateOfOrigin").value);
    formData.append("local_government_area", document.getElementById("lga").value);
    formData.append("parent", document.getElementById("parent_select").value);
    formData.append("nationality", document.getElementById("nationality").value);
    formData.append("religion", document.getElementById("religion").value);

    // Handle file upload
    if (fileInput.files.length > 0) {
      formData.append("upload", fileInput.files[0]);
    }

    try {
      setLoadingState(true);
      const updateResponse = await fetch(`${api}/student/student/${studentID}/`, {
        method: "PUT",
        headers: { Authorization: `Token ${token}` },
        body: formData,
      });

      if (updateResponse.ok) {
        alert("Student details updated successfully!");
        window.location.href = "students.html"; // Redirect to students list
      } else {
        const errorData = await updateResponse.json();
        console.error("Update failed:", errorData);
        alert("Failed to update student details. Please try again.");
      }
    } catch (error) {
      console.error("Error updating student:", error);
      alert("Failed to update student details. Please try again.");
    } finally {
      setLoadingState(false);
    }
  });
});
