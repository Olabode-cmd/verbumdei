import { api } from "./api.js";

const tableBody = document.getElementById("parent-table-body");
const searchInput = document.getElementById("parent-search");
const paginationInfo = document.getElementById("pagination-info");
const paginationContainer = document.querySelector(".pagination");
const info = document.getElementById('pagination-info')
const itemsPerPage = 10;
let parents = [];
let filteredParents = [];
let currentPage = 1;

// Edit Modal Elements
const editModal = document.getElementById("editParentModal");
const editForm = document.getElementById("editParentForm");
const editSubmitButton = document.getElementById("editSubmitButton");

document.addEventListener("DOMContentLoaded", async () => {
    await getParents();
    searchInput.addEventListener("input", () => {
        filterParents();
        renderTable();
    });

    // Handle edit form submission
    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const parentId = editForm.dataset.parentId;
        await updateParent(parentId);
    });
});

const getParents = async () => {
    showLoadingState();
    try {
        const response = await fetch(`${api}/parent/`);
        if (!response.ok) throw new Error("Failed to fetch parents");
        parents = await response.json();
        filteredParents = parents;
        renderTable();
    } catch (error) {
        console.error("Error fetching parents:", error);
        showNoResults();
    }
};

const showLoadingState = () => {
    tableBody.innerHTML = `<tr><td colspan='8' class='text-center py-4'>
        <div class='flex items-center justify-center gap-2'>
            <svg class='animate-spin h-5 w-5 text-blue-500' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                <circle class='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' stroke-width='4'></circle>
                <path class='opacity-75' fill='currentColor' d='M4 12a8 8 0 019.293-7.293 1 1 0 01.707 1.707A6 6 0 106 12H4z'></path>
            </svg>
            <span class='text-gray-600 animate-pulse'>Loading...</span>
        </div>
    </td></tr>`;
};

const showNoResults = () => {
    tableBody.innerHTML = `<tr><td colspan='8' class='text-center py-4 text-gray-500'>No results found</td></tr>`;
};

const renderTable = () => {
    let paginatedParents = paginate(filteredParents, currentPage, itemsPerPage);

    if (paginatedParents.length === 0) {
        showNoResults();
        return;
    }

    tableBody.innerHTML = "";

    paginatedParents.forEach((parent) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class='px-3 py-2 text-sm font-medium text-gray-800'>${parent.parent_name}</td>
            <td class='px-3 py-2 text-sm text-gray-800'>${parent.email}</td>
            <td class='px-3 py-2 text-sm text-gray-800'>${parent.phone_number_1}, ${parent.phone_number_2 || ""}</td>
            <td class="px-3 py-2 text-sm text-gray-800 max-w-xs truncate" title="${parent.home_address}">
                ${parent.home_address.length > 25 ? parent.home_address.substring(0, 25) + "..." : parent.home_address}
            </td>
            <td class='px-3 py-2 text-sm text-gray-800'>${parent.code}</td>
            <td class='px-3 py-2 text-end text-sm font-medium space-x-2'>
                <button class='view-btn py-1 px-2 text-sm border rounded bg-white text-gray-800 hover:bg-gray-50'>
                    <i class="fa fa-eye"></i> View
                </button>
                <button class='edit-btn py-1 px-2 text-sm border rounded bg-blue-600 text-white hover:bg-blue-700'>
                    <i class="fa fa-edit"></i> Edit
                </button>
            </td>`;
        tableBody.appendChild(row);

        // Add event listeners
        const viewButton = row.querySelector(".view-btn");
        const editButton = row.querySelector(".edit-btn");
        
        viewButton.addEventListener("click", () => showParentModal(parent));
        editButton.addEventListener("click", () => showEditModal(parent));
    });

    updatePagination(filteredParents.length);
};

// Function to show the view modal with parent details
const showParentModal = (parent) => {
    const modal = document.getElementById("parentModal");
    const modalParentName = document.getElementById("modalParentName");
    const modalParentEmail = document.getElementById("modalParentEmail");
    const modalParentPhone = document.getElementById("modalParentPhone");
    const modalParentAddress = document.getElementById("modalParentAddress");
    const modalParentCode = document.getElementById("modalParentCode");

    modalParentName.textContent = parent.parent_name;
    modalParentEmail.textContent = parent.email;
    modalParentPhone.textContent = `${parent.phone_number_1}, ${parent.phone_number_2 || ""}`;
    modalParentAddress.textContent = parent.home_address;
    modalParentCode.textContent = parent.code;

    // Store the parent ID for deletion
    modal.dataset.parentId = parent.id;

    modal.classList.remove("hidden");
};

// Function to show the edit modal
const showEditModal = (parent) => {
    editForm.dataset.parentId = parent.id;
    document.getElementById("editParentName").value = parent.parent_name;
    document.getElementById("editParentEmail").value = parent.email;
    document.getElementById("editParentPhone1").value = parent.phone_number_1;
    document.getElementById("editParentPhone2").value = parent.phone_number_2 || "";
    document.getElementById("editParentAddress").value = parent.home_address;
    // document.getElementById("editParentCode").value = parent.code;

    editModal.classList.remove("hidden");
};

// Function to update parent data
const updateParent = async (parentId) => {
    setEditLoadingState(true);
    try {
        const formData = new FormData(editForm);
        const data = {
            parent_name: formData.get("parent_name"),
            email: formData.get("email"),
            phone_number_1: formData.get("phone_number_1"),
            phone_number_2: formData.get("phone_number_2"),
            home_address: formData.get("home_address"),
            // code: formData.get("code")
        };

        const response = await fetch(`${api}/parent/${parentId}/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error("Failed to update parent");

        alert("Parent updated successfully!");
        closeEditModal();
        await getParents(); // Refresh the table
    } catch (error) {
        console.error("Error updating parent:", error);
        alert("Failed to update parent. Please try again.");
    } finally {
        setEditLoadingState(false);
    }
};

// Loading state for edit form
const setEditLoadingState = (isLoading) => {
    editSubmitButton.disabled = isLoading;
    editSubmitButton.innerHTML = isLoading ? `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Updating...
    ` : 'Update';
};

// Function to show the delete confirmation modal
const showDeleteConfirmModal = (parentId) => {
    const confirmModal = document.getElementById("deleteConfirmModal");
    confirmModal.dataset.parentId = parentId;
    confirmModal.classList.remove("hidden");
};

// Function to delete a parent
const deleteParent = async (parentId) => {
    console.log(`${api}/parent/${parentId}/`)
    try {
        const response = await fetch(`${api}/parent/${parentId}/`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${localStorage.getItem("authToken")}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to delete parent");
        }

        alert("Parent deleted successfully!");
        closeDeleteConfirmModal();
        closeModal();
        await getParents(); // Refresh the table
    } catch (error) {
        console.error("Error deleting parent:", error);
        alert(`Failed to delete parent: ${error.message}`);
    }
};

// Close modals
const closeModal = () => {
    document.getElementById("parentModal").classList.add("hidden");
};

const closeEditModal = () => {
    editModal.classList.add("hidden");
};

const closeDeleteConfirmModal = () => {
    document.getElementById("deleteConfirmModal").classList.add("hidden");
};

// Event listeners for closing modals
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("closeModalBtn").addEventListener("click", closeModal);
document.getElementById("closeEditModal").addEventListener("click", closeEditModal);
document.getElementById("closeDeleteModal").addEventListener("click", closeDeleteConfirmModal);

// Event listener for delete button
document.getElementById("deleteParentBtn").addEventListener("click", function() {
    const parentId = document.getElementById("parentModal").dataset.parentId;
    showDeleteConfirmModal(parentId);
});

// Event listener for cancel delete button
document.getElementById("cancelDeleteBtn").addEventListener("click", closeDeleteConfirmModal);

// Event listener for confirm delete button
document.getElementById("confirmDeleteBtn").addEventListener("click", function() {
    const parentId = document.getElementById("deleteConfirmModal").dataset.parentId;
    deleteParent(parentId);
});

document.querySelector(".bg-black.bg-opacity-50").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) {
        closeModal();
        closeEditModal();
        closeDeleteConfirmModal();
    }
});

const filterParents = () => {
    const query = searchInput.value.toLowerCase().trim();
    filteredParents = parents.filter(
        (parent) =>
            parent.parent_name.toLowerCase().includes(query) ||
            parent.email.toLowerCase().includes(query) ||
            parent.phone_number_1.toLowerCase().includes(query) ||
            parent.code.toLowerCase().includes(query)
    );
    currentPage = 1;
};

const paginate = (items, page, perPage) => {
    const start = (page - 1) * perPage;
    return items.slice(start, start + perPage);
};

const updatePagination = (totalItems) => {
    paginationContainer.innerHTML = "";
    let totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement("a");
        pageLink.href = "#";
        pageLink.textContent = i;
        pageLink.className = `px-3 py-2 text-sm border rounded ${i === currentPage ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-100"
            }`;
        pageLink.addEventListener("click", (e) => {
            e.preventDefault();
            currentPage = i;
            renderTable();
        });
        paginationContainer.appendChild(pageLink);
    }
};