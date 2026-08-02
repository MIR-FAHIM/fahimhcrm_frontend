import API_URL from '../api_url';
// src/api/apiController.js
import axiosInstance from '../axiosInstance.jsx'



// Fetch posts from API
export const getAddBalanceDataByUser = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.getBalanceAddDataUserById(id));
    
        return response;
    
    
  } catch (error) {
    console.error("Error fetching add balance his:", error);
    return [];
  }
   
};
