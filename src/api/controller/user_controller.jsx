import API_URL from '../api_url';
// src/api/apiController.js
import axiosInstance from '../axiosInstance.jsx'



// Fetch posts from API
export const getProfile = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.getProfile2(id));
    return response.data;
  } catch (error) {
    console.error("Error fetching category:", error);
    return [];
  }
   
};
