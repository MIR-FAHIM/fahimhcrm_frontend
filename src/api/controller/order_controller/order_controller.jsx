import API_URL from '../../api_url';
// src/api/apiController.js
import axiosInstance from '../../axiosInstance.jsx'



// Fetch posts from API
export const fetchAllOrders = async () => {
  try {
    const response = await axiosInstance.get(API_URL.getAllOrders);
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
   
};
export const getOrderDetail = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.getOrderDetailsById(id));
  
    return response;
  } catch (error) {
    console.error("Error fetching orders detaIL:", error);
    return [];
  }
   
};

export const changeOrderStatus = async (data) => {
    try {
      const response = await axiosInstance.post(API_URL.changeOrderStatus, data);
      return response; // Return the response from the API
    } catch (error) {
      console.error("Error changing order status data:", error);
      throw error; // Rethrow the error for further handling in your component
    }
  
  }
