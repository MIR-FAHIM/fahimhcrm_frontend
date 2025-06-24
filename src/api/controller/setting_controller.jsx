// src/api/apiController.js
import axiosInstance from '../axiosInstance.jsx'


export const addAttribute = async (data) => {
    try {
      const response = await axiosInstance.post(`/api/add-attribute`, data);
      return response; // Return the response from the API
    } catch (error) {
      console.error("Error posting data:", error);
      throw error; // Rethrow the error for further handling in your component
    }
  
  }


// Fetch posts from API
export const getAttributes = async () => {
    try {
        const response = await axiosInstance.get(`/api/get-attribute`); // Assuming your API endpoint to fetch posts
        return response;
    } catch (error) {
        console.error("Error fetching posts:", error);
        throw error;
    }}
export const addAttributeValue = async (data) => {
    try {
      const response = await axiosInstance.post(`/api/add-attribute-value`, data);
      return response; // Return the response from the API
    } catch (error) {
      console.error("Error posting data:", error);
      throw error; // Rethrow the error for further handling in your component
    }
  
  }


// Fetch posts from API
export const getAttributesValues = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/get-attribute-value/${id}`); // Assuming your API endpoint to fetch posts
        return response;
    } catch (error) {
        console.error("Error fetching posts:", error);
        throw error;
    }
};