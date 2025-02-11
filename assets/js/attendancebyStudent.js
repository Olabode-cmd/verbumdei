// This function fetches the data and returns a promise
function fetchAttendanceData() {
    const url = "https://service.verbumdeiportal.com/attendance/attendance/student/VD20241217111930/";

    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            return data;
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            return null;
        });
}

// Export the function to be used elsewhere
export { fetchAttendanceData };
