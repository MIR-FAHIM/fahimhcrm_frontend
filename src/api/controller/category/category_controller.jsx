// src/api/apiController.js
import axiosInstance from './axiosInstance.js'



// Fetch posts from API
export const fetchCategory = async () => {
  try {
    const response = await axiosInstance.get(`/api/getProductCategories`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching category:", error);
    return [];
  }
   
};

export const addMainCategory = async (data) => {
    try {
      const response = await axiosInstance.get(`/api/createMainCategory`, data);
      return response; // Return the response from the API
    } catch (error) {
      console.error("Error posting main cat data:", error);
      throw error; // Rethrow the error for further handling in your component
    }
  
  }