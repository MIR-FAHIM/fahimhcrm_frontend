import axiosInstance from '../../axiosInstance.jsx'
import API_URL from '../../api_url';

// Fetch posts from API




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
export const fetchConversationRoom = async () => {
  const token = localStorage.getItem("authToken"); // Retrieve token from localStorage

  if (!token) {
    console.error("No auth token found in localStorage.");
    return []; // Return an empty array or handle as necessary
  }
  try {
    const response = await axiosInstance.get(API_URL.conversationRoom,
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
export const getClientDetails = async (id) => {
  const token = localStorage.getItem("authToken"); // Retrieve token from localStorage

  if (!token) {
    console.error("No auth token found in localStorage.");
    return []; // Return an empty array or handle as necessary
  }
  try {
    const response = await axiosInstance.get(API_URL.getClientDetailsById(id),
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
export const getTicketByClient = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.ticketsGetTicketClientById(id),
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching get-all-prospect:", error);
    return [];
  }
}
export const addTicket = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.ticketsAddTicket, data,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error add checkProspectAvaiblity data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
