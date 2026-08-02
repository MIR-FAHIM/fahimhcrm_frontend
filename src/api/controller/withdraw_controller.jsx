import API_URL from '../api_url';
// src/api/apiController.js
import axiosInstance from '../axiosInstance.jsx'


export const fetchAllWithdraw = async () => {
    try {
      const response = await axiosInstance.get(API_URL.getAllWithdraw);
      return response.data;
    } catch (error) {
      console.error("Error fetching withdraw:", error);
      return [];
    }
     
  };
export const fetchAllWithdrawById = async (id) => {
    try {
      const response = await axiosInstance.get(API_URL.getWithdrawUserById(id));
      return response.data.data;
    } catch (error) {
      console.error("Error fetching withdraw:", error);
      return [];
    }
     
  };
// Fetch posts from API
export const markPaidWithdraw = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.markPaidById(id));
    
        return response;
    
    
  } catch (error) {
    console.error("Error fetching mark paid:", error);
    return [];
  }
   
};
