import axiosInstance from '../../../axiosInstance.jsx'
import API_URL from '../../../api_url';

// Fetch posts from API




export const getReportText = async () => {
  const token = localStorage.getItem("authToken"); // Retrieve token from localStorage

  if (!token) {
    console.error("No auth token found in localStorage.");
    return []; // Return an empty array or handle as necessary
  }
  try {
    const response = await axiosInstance.get(API_URL.reportText,
        {
            headers: {
              'token': localStorage.getItem("authToken"),// Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching report-text:", error);
    return [];
  }
}


export const fetchClients = async () => {
  const token = localStorage.getItem("authToken"); // Retrieve token from localStorage

  if (!token) {
    console.error("No auth token found in localStorage.");
    return []; // Return an empty array or handle as necessary
  }
  try {
    const response = await axiosInstance.get(API_URL.clients,
        {
            headers: {
              'token': localStorage.getItem("authToken"),// Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching fetchDepartment:", error);
    return [];
  }
}
export const addNotices = async (data) => {
  const token = localStorage.getItem("authToken"); // Retrieve token from localStorage

  if (!token) {
    console.error("No auth token found in localStorage.");
    return []; // Return an empty array or handle as necessary
  }
  try {
    const response = await axiosInstance.post(API_URL.noticeAdd, data,
        {
            headers: {
              'token': localStorage.getItem("authToken"),// Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching assNotices:", error);
    return [];
  }
}
export const deleteNotice = async (data) => {
  const token = localStorage.getItem("authToken"); // Retrieve token from localStorage

  if (!token) {
    console.error("No auth token found in localStorage.");
    return []; // Return an empty array or handle as necessary
  }
  try {
    const response = await axiosInstance.post(API_URL.deleteNotice, data,
        {
            headers: {
              'token': localStorage.getItem("authToken"),// Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching deleteNotice:", error);
    return [];
  }
}
export const updateNotice = async (data) => {
  const token = localStorage.getItem("authToken"); // Retrieve token from localStorage

  if (!token) {
    console.error("No auth token found in localStorage.");
    return []; // Return an empty array or handle as necessary
  }
  try {
    const response = await axiosInstance.post(API_URL.updateNotice, data,
        {
            headers: {
              'token': localStorage.getItem("authToken"),// Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching updateNotice:", error);
    return [];
  }
}
export const fetchNotices = async () => {
  const token = localStorage.getItem("authToken"); // Retrieve token from localStorage

  if (!token) {
    console.error("No auth token found in localStorage.");
    return []; // Return an empty array or handle as necessary
  }
  try {
    const response = await axiosInstance.get(API_URL.noticeAll,
        {
            headers: {
              'token': localStorage.getItem("authToken"),// Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching fetchNotices:", error);
    return [];
  }
}
