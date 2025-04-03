import { api } from "./api.js";

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const staffID = urlParams.get("staffID");
  const teacherApiUrl = `${api}/staff/staff/${staffID}/`;
  
  // Modal elements
  const editModal = document.getElementById("editTeacherModal");
  const editForm = document.getElementById("editTeacherForm");
  const editButton = document.getElementById("editTeacherButton");
  const closeEditModal = document.getElementById("closeEditTeacherModal");
  const editSubmitButton = document.getElementById("editTeacherSubmitButton");
  
  // Image upload elements
  const fileInput = document.getElementById("teacherFileInput");
  const imagePreview = document.getElementById("teacherImagePreview");
  const uploadIcon = document.getElementById("teacherUploadIcon");
  const imageUploadContainer = document.getElementById("teacherImageUploadContainer");

  if (staffID) {
    fetchTeacherDetails();
  }

  // Event listeners
  editButton.addEventListener("click", () => editModal.classList.remove("hidden"));
  closeEditModal.addEventListener("click", () => editModal.classList.add("hidden"));
  document.querySelector(".bg-black.bg-opacity-50").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) {
      editModal.classList.add("hidden");
    }
  });

  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await updateTeacher();
  });

  // Image upload handlers
  fileInput.addEventListener("change", handleImageUpload);
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
      handleImageUpload({ target: fileInput });
    }
  });

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
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
  }

  async function fetchTeacherDetails() {
    try {
      const response = await fetch(teacherApiUrl);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const teacher = await response.json();
      console.log(teacher);
      renderTeacherDetails(teacher);
      populateEditForm(teacher);
    } catch (error) {
      console.error("Error fetching teacher details:", error);
    }
  }

  function renderTeacherDetails(teacher) {
    document.querySelector(".teacher-name").textContent = 
      `${teacher.first_name} ${teacher.last_name} ${teacher.other_name || ""}`;
    document.querySelector(".teacher-id").textContent = teacher.staff_id;
    document.querySelector(".teacher-profile-image").src = 
      teacher.img_url || "/assets/images/default-profile.png";
    document.querySelector(".gender").textContent = teacher.gender;
    document.querySelector(".employment-type").textContent = teacher.employment_type;
    document.querySelector(".employment-date").textContent = new Date(
      teacher.created_at
    ).toLocaleDateString();
    document.querySelector(".nin").textContent = teacher.nin;
    document.querySelector(".address").textContent = teacher.home_address;
    document.querySelector(".status").textContent = teacher.status;
    document.querySelector(".phone-1").textContent = teacher.phone_number_1;
    document.querySelector(".phone-2").textContent = teacher.phone_number_2;
    document.querySelector(".email").textContent = teacher.email;
  }

  function populateEditForm(teacher) {
    document.getElementById("editFirstName").value = teacher.first_name;
    document.getElementById("editLastName").value = teacher.last_name;
    document.getElementById("editOtherName").value = teacher.other_name || "";
    
    // Set gender select with proper padding class
    const genderSelect = document.getElementById("editGender");
    genderSelect.value = teacher.gender;
    genderSelect.classList.add("py-2", "px-3");
    
    // Set employment type select with proper padding class
    const employmentTypeSelect = document.getElementById("editEmploymentType");
    employmentTypeSelect.value = teacher.employment_type;
    employmentTypeSelect.classList.add("py-2", "px-3");

    // Set staff type select with proper padding class
    const staffTypeSelect = document.getElementById("editStaffType");
    staffTypeSelect.value = teacher.staff_type;
    staffTypeSelect.classList.add("py-2", "px-3");

    // Set position
    document.getElementById("editPosition").value = teacher.position;
    
    document.getElementById("editNIN").value = teacher.nin;
    document.getElementById("editPhone1").value = teacher.phone_number_1;
    document.getElementById("editPhone2").value = teacher.phone_number_2 || "";
    document.getElementById("editEmail").value = teacher.email;
    document.getElementById("editAddress").value = teacher.home_address;
    
    // Set new required fields
    document.getElementById("editLGA").value = teacher.local_government_area;
    document.getElementById("editState").value = teacher.state_of_origin;
    document.getElementById("editNationality").value = teacher.nationality;
    document.getElementById("editReligion").value = teacher.religion;
    
    // Set status select with proper padding class
    const statusSelect = document.getElementById("editStatus");
    statusSelect.value = teacher.status;
    statusSelect.classList.add("py-2", "px-3");

    // Set image preview if exists
    if (teacher.img_url) {
      imagePreview.src = teacher.img_url;
      imagePreview.classList.remove("hidden");
      uploadIcon.classList.add("hidden");
    }
  }

  function setLoadingState(isLoading) {
    editSubmitButton.disabled = isLoading;
    editSubmitButton.innerHTML = isLoading ? `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Updating...
    ` : 'Update';
  }

  async function updateTeacher() {
    setLoadingState(true);
    try {
      const formData = new FormData(editForm);
      const data = {
        first_name: formData.get("first_name"),
        last_name: formData.get("last_name"),
        other_name: formData.get("other_name"),
        gender: formData.get("gender"),
        employment_type: formData.get("employment_type"),
        staff_type: formData.get("staff_type"),
        position: formData.get("position"),
        nin: formData.get("nin"),
        phone_number_1: formData.get("phone_number_1"),
        phone_number_2: formData.get("phone_number_2"),
        email: formData.get("email"),
        home_address: formData.get("home_address"),
        local_government_area: formData.get("local_government_area"),
        state_of_origin: formData.get("state_of_origin"),
        nationality: formData.get("nationality"),
        religion: formData.get("religion"),
        status: formData.get("status")
      };

      // Handle file upload
      if (fileInput.files.length > 0) {
        formData.append("upload", fileInput.files[0]);
      }

      console.log("Sending data:", data);

      const response = await fetch(teacherApiUrl, {
        method: "PUT",
        headers: {
          "Authorization": `Token ${localStorage.getItem("authToken")}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(`Failed to update teacher: ${JSON.stringify(errorData)}`);
      }

      const updatedTeacher = await response.json();
      renderTeacherDetails(updatedTeacher);
      editModal.classList.add("hidden");
      alert("Teacher details updated successfully!");
    } catch (error) {
      console.error("Error updating teacher:", error);
      alert(`Failed to update teacher details: ${error.message}`);
    } finally {
      setLoadingState(false);
    }
  }
});
