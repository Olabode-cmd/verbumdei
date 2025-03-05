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

document.addEventListener("DOMContentLoaded", async () => {
    await getParents();
    searchInput.addEventListener("input", () => {
        filterParents();
        renderTable();
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

    tableBody.innerHTML = ""; // Clear the table body before rendering new rows

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
            <td class='px-3 py-2 text-end text-sm font-medium'>
                <button class='view-btn py-1 px-2 text-sm border rounded bg-white text-gray-800 hover:bg-gray-50'>View</button>
            </td>`;
        tableBody.appendChild(row);

        // Add event listener to the "View" button
        const viewButton = row.querySelector(".view-btn");
        viewButton.addEventListener("click", () => showParentModal(parent));
    });

    updatePagination(filteredParents.length);
};

// Function to show the modal with parent details
const showParentModal = (parent) => {
    const modal = document.getElementById("parentModal");
    const modalParentName = document.getElementById("modalParentName");
    const modalParentEmail = document.getElementById("modalParentEmail");
    const modalParentPhone = document.getElementById("modalParentPhone");
    const modalParentAddress = document.getElementById("modalParentAddress");
    const modalParentCode = document.getElementById("modalParentCode");

    // Populate modal with parent details
    modalParentName.textContent = parent.parent_name;
    modalParentEmail.textContent = parent.email;
    modalParentPhone.textContent = `${parent.phone_number_1}, ${parent.phone_number_2 || ""}`;
    modalParentAddress.textContent = parent.home_address;
    modalParentCode.textContent = parent.code;

    // Show the modal
    modal.classList.remove("hidden");
};

// Close modal when clicking the close button or outside the modal
const closeModal = () => {
    const modal = document.getElementById("parentModal");
    modal.classList.add("hidden");
};

document.getElementById("closeModal").addEventListener("click", closeModal);
document.querySelector(".bg-black.bg-opacity-50").addEventListener("click", closeModal);

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