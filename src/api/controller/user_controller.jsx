// src/api/apiController.js
import axiosInstance from '../axiosInstance.jsx'



// Fetch posts from API
export const getProfile = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/getProfile?id=${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching category:", error);
    return [];
  }
   
};

