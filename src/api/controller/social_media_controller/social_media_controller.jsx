// src/api/apiController.js
import axiosInstance from '../../axiosInstance.jsx'


export const socialPostProduct = async (productData) => {
    try {
      const response = await axiosInstance.post(`/api/create-post`, productData);
      return response; // Return the response from the API
    } catch (error) {
      console.error("Error posting data:", error);
      throw error; // Rethrow the error for further handling in your component
    }
  
  }


// Fetch posts from API
export const fetchSocialPosts = async () => {
    try {
        const response = await axiosInstance.get(`/api/getAllposts`); // Assuming your API endpoint to fetch posts
        return response.data.posts;
    } catch (error) {
        console.error("Error fetching posts:", error);
        throw error;
    }
};