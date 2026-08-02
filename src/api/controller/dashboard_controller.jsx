import API_URL from '../api_url';
// src/api/apiController.js
import axiosInstance from '../axiosInstance.jsx'

// Fetch posts from API
export const fetchButtonClicksCount = async () => {
  try {
    const response = await axiosInstance.get(API_URL.getButtonVisit);
    return response;
  } catch (error) {
    console.error("Error fetching click count:", error);
    return [];
  }
   
};
