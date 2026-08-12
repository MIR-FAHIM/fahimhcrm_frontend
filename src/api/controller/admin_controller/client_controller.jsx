import axiosInstance from '../../axiosInstance.jsx'
import API_URL from '../../api_url';

const getTicketToken = () => {
  const storedUser = localStorage.getItem("loggedInUser") || localStorage.getItem("user");
  try {
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    if (parsedUser?.app_token) return parsedUser.app_token;
  } catch (error) {
    // Fall through to auth token fallback.
  }
  return localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
};

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
          'token': getTicketToken(), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching get-all-prospect:", error);
    return [];
  }
}
export const getAllTickets = async () => {
  try {
    const response = await axiosInstance.get(API_URL.ticketsAll,
      {
        headers: {
          'token': getTicketToken(),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all tickets:", error);
    throw error;
  }
}
export const getUnmatchedTickets = async () => {
  try {
    const response = await axiosInstance.get(API_URL.ticketsUnmatched,
      {
        headers: {
          'token': getTicketToken(),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching unmatched tickets:", error);
    throw error;
  }
}
export const addTicket = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.ticketsAddTicket, data,
      {
        headers: {
          'token': getTicketToken(), // Add the token in Authorization header
        },
      }
    );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error add checkProspectAvaiblity data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
export const changeTicketStatus = async (id, data) => {
  try {
    const response = await axiosInstance.patch(API_URL.ticketsChangeStatusById(id), data, {
      headers: { token: getTicketToken() },
    });
    return response.data;
  } catch (error) {
    console.error("Error changing ticket status:", error);
    throw error;
  }
}
export const updateTicket = async (id, data) => {
  try {
    const response = await axiosInstance.put(API_URL.ticketsUpdateById(id), data, {
      headers: { token: getTicketToken() },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating ticket:", error);
    throw error;
  }
}
export const deleteTicket = async (id) => {
  try {
    const response = await axiosInstance.delete(API_URL.ticketsDeleteById(id), {
      headers: { token: getTicketToken() },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting ticket:", error);
    throw error;
  }
}
export const matchTicketClient = async (id, data) => {
  try {
    const response = await axiosInstance.post(API_URL.ticketsMatchClientById(id), data, {
      headers: { token: getTicketToken() },
    });
    return response.data;
  } catch (error) {
    console.error("Error matching ticket client:", error);
    throw error;
  }
}
export const convertTicketToTask = async (id, data) => {
  try {
    const response = await axiosInstance.post(API_URL.ticketsConvertToTaskById(id), data, {
      headers: { token: getTicketToken() },
    });
    return response.data;
  } catch (error) {
    console.error("Error converting ticket to task:", error);
    throw error;
  }
}
