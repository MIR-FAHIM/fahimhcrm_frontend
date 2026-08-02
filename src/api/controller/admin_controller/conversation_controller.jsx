import axiosInstance from '../../axiosInstance.jsx'
import API_URL from '../../api_url';

// Fetch posts from API

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
export const getChatMessageByConID = async (data) => {
    const token = localStorage.getItem("authToken"); // Retrieve token from localStorage
  
    if (!token) {
      console.error("No auth token found in localStorage.");
      return []; // Return an empty array or handle as necessary
    }
    try {
      const response = await axiosInstance.post(API_URL.getChatByConversationid, data ,
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
      const response = await axiosInstance.post(API_URL.getChatByProjectId, data ,
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
      const response = await axiosInstance.post(API_URL.conversationRoomAdd, data ,
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
      const response = await axiosInstance.post(API_URL.addChat, data ,
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
