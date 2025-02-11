export function fetchStudentDetails() {
    const url = 'https://service.verbumdeiportal.com/student/student-by-reg-id/VD20241217111930/';

    return fetch(url)
        .then((response) => {
            console.log('Raw response:', response);
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            return response.json();
        })
        .then((studentDetails) => {
            console.log('Parsed JSON:', studentDetails);
            return studentDetails;
        })
        .catch((error) => {
            console.error('Error fetching student details:', error);
            return null;
        });
}