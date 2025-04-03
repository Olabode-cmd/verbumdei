import { api } from "./api.js";

document.addEventListener("DOMContentLoaded", function () {
    const reassignButton = document.getElementById("reassign-teacher");
    const teacherContainer = document.getElementById("teacher-container");
    const classSelect = document.getElementById("class");
    let currentClassId = null;

    // Function to create and show the reassign modal
    function showReassignModal() {
        const modal = document.createElement("div");
        modal.id = "reassignModal";
        modal.className = "fixed inset-0 bg-gray-800 bg-opacity-75 hidden flex items-center justify-center z-50";
        
        modal.innerHTML = `
            <div class="formbox bg-white border border-gray-300 rounded-lg px-3 py-8 w-[95%] md:w-[55%] lg:w-[45%] mx-auto relative">
                <button onclick="closeReassignModal()" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <i class="fa fa-times"></i>
                </button>
                <h3 class="font-semibold text-lg text-center">Reassign Teacher</h3>
                <form id="reassign-form">
                    <div class="space-y-4">
                        <div class="max-w-sm mx-auto space-y-3">
                            <div>
                                <label for="class-name" class="block text-sm font-medium mb-2">Class Name</label>
                                <div class="relative">
                                    <input type="text" id="class-name" required
                                        class="py-3 px-4 ps-11 block w-full border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                                        placeholder="Enter class name">
                                    <div class="absolute inset-y-0 start-0 flex items-center pointer-events-none z-20 ps-4">
                                        <i class="fa fa-house text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label for="teacher-select" class="block text-sm font-medium mb-2">Select New Teacher</label>
                                <div class="relative">
                                    <select id="teacher-select" required
                                        class="py-3 px-4 ps-11 block w-full border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none">
                                        <option value="">Select teacher</option>
                                    </select>
                                    <div class="absolute inset-y-0 start-0 flex items-center pointer-events-none z-20 ps-4">
                                        <i class="fa fa-user text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="max-w-sm mx-auto mt-6">
                        <button type="submit" id="reassign-submit"
                            class="w-full px-3 py-3 bg-blue-600 hover:bg-blue-700 duration-200 text-sm font-medium text-white rounded-lg flex items-center justify-center">
                            <span class="mr-2">Reassign</span>
                            <div id="reassign-spinner" class="hidden">
                                <i class="fa fa-spinner fa-spin"></i>
                            </div>
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        return modal;
    }

    // Function to close the reassign modal
    window.closeReassignModal = function () {
        const modal = document.getElementById("reassignModal");
        if (modal) {
            modal.remove();
        }
    };

    // Function to fetch teachers and populate the select
    async function fetchTeachers() {
        try {
            const response = await fetch(`${api}/staff/staff/`, {
                // method: "PUT",
                headers: {
                    "Authorization": `Token ${localStorage.getItem("authToken")}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch teachers");
            }

            const teachers = await response.json();
            // console.log(teachers)
            const select = document.getElementById("teacher-select");
            select.innerHTML = '<option value="">Select teacher</option>';

            teachers.forEach(teacher => {
                const option = document.createElement("option");
                option.value = teacher.id;
                option.textContent = `${teacher.first_name} ${teacher.last_name}`;
                select.appendChild(option);
            });
        } catch (error) {
            console.error("Error fetching teachers:", error);
            alert("Failed to fetch teachers. Please try again.");
        }
    }

    // Function to handle reassignment
    async function reassignTeacher(classId, teacherId, className) {
        const submitButton = document.getElementById("reassign-submit");
        const spinner = document.getElementById("reassign-spinner");
        
        try {
            submitButton.disabled = true;
            spinner.classList.remove("hidden");
            
            const response = await fetch(`${api}/class/classes/${classId}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${localStorage.getItem("authToken")}`
                },
                body: JSON.stringify({ 
                    name: className,
                    teacher: teacherId
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to reassign teacher");
            }
            
            alert("Teacher reassigned successfully!");
            closeReassignModal();
            location.reload(); // Refresh to show updated teacher
        } catch (error) {
            console.error("Error reassigning teacher:", error);
            alert(`Failed to reassign teacher: ${error.message}`);
        } finally {
            submitButton.disabled = false;
            spinner.classList.add("hidden");
        }
    }

    // Event listener for class selection
    classSelect.addEventListener("change", function () {
        currentClassId = this.value;
    });

    // Event listener for reassign button
    reassignButton.addEventListener("click", async function() {
        if (!currentClassId) {
            alert("Please select a class first");
            return;
        }
        
        const modal = showReassignModal();
        modal.classList.remove("hidden");
        await fetchTeachers();
        
        // Set the current class name in the input
        const classNameInput = document.getElementById("class-name");
        classNameInput.value = classSelect.options[classSelect.selectedIndex].text;
        
        const form = document.getElementById("reassign-form");
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            const teacherId = document.getElementById("teacher-select").value;
            const className = document.getElementById("class-name").value;
            
            if (!teacherId) {
                alert("Please select a teacher");
                return;
            }
            if (!className) {
                alert("Please enter a class name");
                return;
            }
            
            reassignTeacher(currentClassId, teacherId, className);
        });
    });
});