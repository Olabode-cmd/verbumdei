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
    const submitButton = document.getElementById("submit-btn");
    const imagePreview = document.getElementById("imagePreview");
    const imageInput = document.getElementById("imageInput");
    const parentSelect = document.getElementById("parent_select");

    submitButton.disabled = true;

    let initialData = {};
    let initialImage = null;

    async function fetchStudentData() {
        try {
            const response = await fetch(`${api}/student/student/${studentID}/`, {
                headers: {
                    "Authorization": `Token ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch student data. Status: ${response.status}`);
            }

            const student = await response.json();
            console.log("Fetched Student Data:", student);

            // Populate input fields
            const fields = {
                firstName: student.first_name || "",
                otherName: student.other_name || "",
                lastName: student.last_name || "",
                dateOfBirth: student.date_of_birth || "",
                homeAddress: student.home_address || "",
                lga: student.local_government_area || "",
                stateOfOrigin: student.state_of_origin || "",
                nationality: student.nationality || "",
                religion: student.religion || "",
                gender: student.gender || "",
                studentType: student.type || ""
            };

            Object.keys(fields).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    element.value = fields[key];
                }
            });

            initialData = { ...fields };
            initialImage = student.img_url || null;

            // Handle Parent Select Field
            parentSelect.innerHTML = "";
            if (student.parent) {
                const parentOption = document.createElement("option");
                parentOption.value = student.parent;
                parentOption.textContent = student.parent;
                parentOption.selected = true;
                parentSelect.appendChild(parentOption);
            }

            // Handle image preview
            if (student.img_url) {
                imagePreview.src = student.img_url;
                imagePreview.classList.remove("hidden");
                document.getElementById("uploadIcon").classList.add("hidden");
            } else {
                imagePreview.classList.add("hidden");
                document.getElementById("uploadIcon").classList.remove("hidden");
            }

            submitButton.disabled = true;
        } catch (error) {
            console.error("Error fetching student data:", error.message);
            alert("Error fetching student details.");
        }
    }

    await fetchStudentData();

    // Detect changes in form fields
    form.addEventListener("input", () => {
        let isChanged = Object.keys(initialData).some(key => {
            const element = document.getElementById(key);
            return element && element.value.trim() !== initialData[key].trim();
        });

        submitButton.disabled = !isChanged;
    });

    parentSelect.addEventListener("change", () => {
        submitButton.disabled = parentSelect.value === initialData.parent;
    });

    // Handle form submission
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Clone the initial data to create the updated data object
        const updatedData = { ...initialData };

        let isChanged = false;

        // Update only the changed fields in the cloned object
        Object.keys(initialData).forEach(key => {
            const element = document.getElementById(key);
            if (element && element.value.trim() !== initialData[key].trim()) {
                updatedData[key] = element.value.trim();
                isChanged = true;
            }
        });

        // Update the parent field if it has changed
        if (parentSelect.value !== initialData.parent) {
            updatedData.parent = parentSelect.value;
            isChanged = true;
        }

        // Handle image upload
        const imageInput = document.getElementById("imageInput");
        if (imageInput.files.length > 0) {
            // A new image has been uploaded
            updatedData.upload = imageInput.files[0];
            isChanged = true;
        } else {
            // No new image uploaded, set upload to null
            updatedData.upload = null;
        }

        // Delete the `id` key from the object
        delete updatedData.id;

        if (!isChanged) return; // Don't send a request if no changes were made

        // Show loading state on the button
        submitButton.innerHTML = `
        <svg class="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 019.293-7.293 1 1 0 01.707 1.707A6 6 0 106 12H4z"></path>
        </svg>
    `;
        submitButton.disabled = true;

        console.log("Trying to update. New data", updatedData);

        try {
            // Create FormData for file upload
            const formData = new FormData();
            Object.keys(updatedData).forEach(key => {
                formData.append(key, updatedData[key]);
            });

            const updateResponse = await fetch(`${api}/student/student/${studentID}/`, {
                method: "PUT",
                headers: {
                    "Authorization": `Token ${token}`,
                },
                body: formData, // Use FormData for file upload
            });

            if (!updateResponse.ok) throw new Error("Failed to update student data.");

            alert("Student data updated successfully!");
            submitButton.disabled = true; // Disable button again after update
            submitButton.innerHTML = "Update Details"; // Reset button text
            await fetchStudentData(); // Refresh form data

        } catch (error) {
            console.error("Error updating student data:", error);
            alert("Failed to update student data.");
            submitButton.innerHTML = "Update Details"; // Reset button text
            submitButton.disabled = false;
        }
    });
});