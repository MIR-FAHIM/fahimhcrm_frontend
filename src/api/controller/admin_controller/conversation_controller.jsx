import axiosInstance from '../../axiosInstance.jsx'

// Fetch posts from API

export const fetchConversationRoom = async () => {
    const token = localStorage.getItem("authToken"); // Retrieve token from localStorage
  
    if (!token) {
      console.error("No auth token found in localStorage.");
      return []; // Return an empty array or handle as necessary
    }
    try {
      const response = await axiosInstance.get(`/api/conversation-room`,
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
export const getChatMessageByConID = async (data) => {
    const token = localStorage.getItem("authToken"); // Retrieve token from localStorage
  
    if (!token) {
      console.error("No auth token found in localStorage.");
      return []; // Return an empty array or handle as necessary
    }
    try {
      const response = await axiosInstance.post(`/api/get-chat-by-conversationid`, data ,
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
export const getChatMessageByProject = async (data) => {
    const token = localStorage.getItem("authToken"); // Retrieve token from localStorage
  
    if (!token) {
      console.error("No auth token found in localStorage.");
      return []; // Return an empty array or handle as necessary
    }
    try {
      const response = await axiosInstance.post(`/api/get-chat-by-projectId`, data ,
          {
              headers: {
                'token': localStorage.getItem("authToken"),// Add the token in Authorization header
              },}
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching getChatMessageByProject:", error);
      return [];
    }
  }
export const addNewConversation = async (data) => {
    const token = localStorage.getItem("authToken"); // Retrieve token from localStorage
  
    if (!token) {
      console.error("No auth token found in localStorage.");
      return []; // Return an empty array or handle as necessary
    }
    try {
      const response = await axiosInstance.post(`/api/conversation-room/add`, data ,
          {
              headers: {
                'token': localStorage.getItem("authToken"),// Add the token in Authorization header
              },}
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching getChatMessageByProject:", error);
      return [];
    }
  }
export const addChat = async (data) => {
    const token = localStorage.getItem("authToken"); // Retrieve token from localStorage
  
    if (!token) {
      console.error("No auth token found in localStorage.");
      return []; // Return an empty array or handle as necessary
    }
    try {
      const response = await axiosInstance.post(`/api/add-chat`, data ,
          {
              headers: {
                'token': localStorage.getItem("authToken"),// Add the token in Authorization header
              },}
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching add-chat:", error);
      return [];
    }
  }
