// src/api/apiController.js
import axiosInstance from '../axiosInstance.jsx'


export const fetchAllWithdraw = async () => {
    try {
      const response = await axiosInstance.get(`/api/get-all-withdraw`);
      return response.data;
    } catch (error) {
      console.error("Error fetching withdraw:", error);
      return [];
    }
     
  };
export const fetchAllWithdrawById = async (id) => {
    try {
      const response = await axiosInstance.get(`/api/get-withdraw-user/${id}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching withdraw:", error);
      return [];
    }
     
  };
// Fetch posts from API
export const markPaidWithdraw = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/mark-paid/${id}`);
    
        return response;
    
    
  } catch (error) {
    console.error("Error fetching mark paid:", error);
    return [];
  }
   
};