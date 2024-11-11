// Fetch profile details from session storage
import { api } from "./api.js";

const token = localStorage.getItem("authToken");
const email = localStorage.getItem("email");
const first_name = localStorage.getItem("first_name");
const last_name = localStorage.getItem("last_name");
const fullname = `${first_name} ${last_name}`;

// Update the UI with profile details
const profileImageElement = document.getElementsByClassName(
  "shrink-0 size-[38px] rounded-full"
)[0];
const profileEmailElement = document.getElementsByClassName(
  "text-sm font-medium text-gray-800 dark:text-neutral-200"
)[0];
const fullnameElement = document.getElementById("user-fullname");

// Assuming you have a way to get the profile image, for example:

 profileImageElement.src = "/assets/images/profile-img.png"; // Set to default image if profile image not found
if (email && profileEmailElement) {
  profileEmailElement.textContent = email;
}

if (fullname && fullnameElement) {
  fullnameElement.textContent = fullname;
}

// Rest of your code...

// Fetch total number of students
async function fetchStudentCount() {
  try {
    const StudentCount = await fetch(`${api}/student/student-count/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });

    if (StudentCount.ok) {
      const studentCountData = await StudentCount.json();
      const count = studentCountData.count;

      const countElement = document.getElementById("student-count");
      if (countElement) {
        countElement.textContent = count;
      }
    } else {
      console.error("Failed to fetch student count");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Fetch total number of staff
async function fetchStaffCount() {
  try {
    const StaffCount = await fetch(`${api}/staff/staff-count/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (StaffCount.ok) {
      const staffCountData = await StaffCount.json();
      const count = staffCountData.count;

      const countElement = document.getElementById("staff-count");
      if (countElement) {
        countElement.textContent = count;
      }
    } else {
      console.error("Failed to fetch staff count");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Fetch total number of subject
async function fetchSubjectCount() {
  try {
    const SubjectCount = await fetch(`${api}/class/subjects/count/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    if (SubjectCount.ok) {
      const subjectCountData = await SubjectCount.json();
      const count = subjectCountData.count;

      const countElement = document.getElementById("subject-count");
      if (countElement) {
        countElement.textContent = count;
      }
    } else {
      console.error("Failed to fetch subject count");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Fetch total tuition
async function totalTuition() {
  try {
    const total = await fetch(`${api}/payment/total-tuition/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (total.ok) {
      const totalData = await total.json();
      const sum = totalData.total_tuition_for_current_month;
      const perc = totalData.percentage_change;

      const sumElement = document.getElementById("total-sum");
      const percElement = document.getElementById("perc-increase");
      if (sumElement) {
        sumElement.textContent = sum;
      }
      if (percElement) {
        percElement.textContent = perc;
      }
    } else {
      console.error("Failed to revenue data");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Call the functions to fetch the student and staff counts on page load
totalTuition();
fetchSubjectCount();
fetchStudentCount();
fetchStaffCount();

const calendarGrid = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");

let currentDate = new Date();
let allEvents = []; // Store all events globally

// Function to render the calendar
function renderCalendar(date) {
  const month = date.getMonth();
  const year = date.getFullYear();

  // Clear the calendar grid
  calendarGrid.innerHTML = "";

  // Set month and year in header
  monthYear.textContent =
    date.toLocaleString("default", { month: "long" }) + " " + year;

  // Create header for days of the week
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  days.forEach((day) => {
    const headerCell = document.createElement("div");
    headerCell.className = "header-cell";
    headerCell.textContent = day;
    calendarGrid.appendChild(headerCell);
  });

  // Get the first day of the month and the last day of the month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Get today's date
  const today = new Date();

  // Fill the calendar grid with empty divs until the first day
  for (let i = 0; i < firstDay.getDay(); i++) {
    calendarGrid.appendChild(document.createElement("div"));
  }

  // Fill the calendar with the days of the month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const dayCell = document.createElement("div");
    dayCell.className = "day-cell";
    dayCell.textContent = i;

    // Highlight the current date
    if (
      i === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      dayCell.classList.add("current-day");
    }

    // Highlight event dates
    const eventDate = new Date(year, month, i);
    const eventExists = allEvents.some((event) => {
      const eventDay = new Date(event.date).getDate();
      const eventMonth = new Date(event.date).getMonth();
      const eventYear = new Date(event.date).getFullYear();
      return eventDay === i && eventMonth === month && eventYear === year;
    });

    if (eventExists) {
      dayCell.classList.add("event-day");
    }

    calendarGrid.appendChild(dayCell);
  }
}

// Event listeners for navigation
prevMonth.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
});

nextMonth.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
});

// Fetch events from API
async function fetchEvents() {
  try {
    const response = await fetch(`${api}/program/events/`);
    allEvents = await response.json();
    displayEvents(allEvents.slice(0, 2)); // Display only first 2 events initially
    renderCalendar(currentDate); // Re-render calendar with events
  } catch (error) {
    console.error("Error fetching events:", error);
  }
}

// Function to display events
function displayEvents(events) {
  const eventsContainer = document.getElementById("events-container");
  eventsContainer.innerHTML = ""; // Clear existing content

  // Loop through events and create HTML
  events.forEach((event) => {
    const eventDate = new Date(event.date);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const formattedDate = eventDate.toLocaleDateString("en-US", options);

    const eventCard = `
                        <div class="bg-blue-800 px-3 py-2 border-l border-orange-400 border-l-2">
                            <h3 class="text-white text-sm font-bold">${formattedDate}</h3>
                            <p class="text-gray-50 text-xs my-1 font-medium">${event.name}</p>
                            <div class="flex justify-end">
                                <p class="text-white font-medium text-xs">${formattedDate}</p>
                            </div>
                        </div>
                    `;
    eventsContainer.innerHTML += eventCard;
  });
}

// Function to filter events
function filterEvents(filter) {
  let filteredEvents = allEvents;

  const today = new Date();
  switch (filter) {
    case "today":
      filteredEvents = allEvents.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === today.toDateString();
      });
      break;
    case "weekly":
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      filteredEvents = allEvents.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= nextWeek;
      });
      break;
    case "monthly":
      const nextMonth = new Date();
      nextMonth.setMonth(today.getMonth() + 1);
      filteredEvents = allEvents.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate < nextMonth;
      });
      break;
    default:
      break; // No filter applied
  }

  displayEvents(filteredEvents.slice(0, 2)); // Display only first 2 events
}

// Event listeners for filter buttons
document.getElementById("all-button").onclick = () => {
  filterEvents("all");
  document
    .getElementById("all-button")
    .classList.add("bg-blue-100", "border", "border-blue-100");
  document
    .getElementById("today-button")
    .classList.remove("bg-blue-100", "border", "border-blue-100");
  document
    .getElementById("weekly-button")
    .classList.remove("bg-blue-100", "border", "border-blue-100");
  document
    .getElementById("monthly-button")
    .classList.remove("bg-blue-100", "border", "border-blue-100");
};

document.getElementById("today-button").onclick = () => {
  filterEvents("today");
  document
    .getElementById("today-button")
    .classList.add("bg-blue-100", "border", "border-blue-100");
  document
    .getElementById("all-button")
    .classList.remove("bg-blue-100", "border", "border-blue-100");
  document
    .getElementById("weekly-button")
    .classList.remove("bg-blue-100", "border", "border-blue-100");
  document
    .getElementById("monthly-button")
    .classList.remove("bg-blue-100", "border", "border-blue-100");
};

document.getElementById("weekly-button").onclick = () => {
  filterEvents("weekly");
  document
    .getElementById("weekly-button")
    .classList.add("bg-blue-100", "border", "border-blue-100");
  document
    .getElementById("all-button")
    .classList.remove("bg-blue-100", "border", "border-blue-100");
  document
    .getElementById("today-button")
    .classList.remove("bg-blue-100", "border", "border-blue-100");
  document
    .getElementById("monthly-button")
    .classList.remove("bg-blue-100", "border", "border-blue-100");
};

document.getElementById("monthly-button").onclick = () => {
  filterEvents("monthly");
  document
    .getElementById("monthly-button")
    .classList.add("bg-blue-100", "border", "border-blue-100");
  document
    .getElementById("all-button")
    .classList.remove("bg-blue-100", "border", "border-blue-100");
  document
    .getElementById("today-button")
    .classList.remove("bg-blue-100", "border", "border-blue-100");
  document
    .getElementById("weekly-button")
    .classList.remove("bg-blue-100", "border", "border-blue-100");
};

// Call the fetchEvents function on page load
window.onload = fetchEvents;
