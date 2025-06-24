// src/api/apiController.js
import axiosInstance from '../axiosInstance.jsx'

// Fetch posts from API
export const fetchButtonClicksCount = async () => {
  try {
    const response = await axiosInstance.get(`/api/get-button-visit`);
    return response;
  } catch (error) {
    console.error("Error fetching click count:", error);
    return [];
  }
   
};