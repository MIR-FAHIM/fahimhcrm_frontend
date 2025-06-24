// src/api/apiController.js
import axiosInstance from '../../axiosInstance.jsx'

// Fetch posts from API
export const getAttendanceByDate = async (date) => {
  try {
    const response = await axiosInstance.get(`/api/get-attendance-date?date=${date}`,
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching fetchDepartment:", error);
    return [];
  }
}

export const updateAttendance = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/update-attendance`, data, 
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching updateAttendance:", error);
    return [];
  }
}



export const getAttendanceReportByUser = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/get-attendance-report-user`, data,
        {
            headers: {
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
     );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error atttendance report data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}


export const getAttendanceAdjustment = async () => {
  const token = localStorage.getItem("authToken"); // Retrieve token from localStorage

  if (!token) {
    console.error("No auth token found in localStorage.");
    return []; // Return an empty array or handle as necessary
  }
  try {
    const response = await axiosInstance.get(`/api/get-attendance-adjustment`,
        {
            headers: {
              'token': localStorage.getItem("authToken"),// Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getAttendanceAdjustment:", error);
    return [];
  }
}




export const hasCheckedIn = async (userId) => {
  try {
    const response = await axiosInstance.get(`/api/is-checkedin-today?user_id=${userId}`,
        {
            headers: {
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
     );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error has checked in ? data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}

export const checkInNow = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/check-in-now`, data,
        {
            headers: {
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
     );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error checkInNow data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
export const requestAdjustment = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/request-attendance-adjustment`, data,
        {
            headers: {
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
     );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error requestAdjustment data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
export const approveAdjustment = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/approve-time-adjustment`, data,
        {
            headers: {
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
     );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error requestAdjustment data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
export const checkOutNow = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/check-out-now`, data,
        {
            headers: {
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
     );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error check out data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}