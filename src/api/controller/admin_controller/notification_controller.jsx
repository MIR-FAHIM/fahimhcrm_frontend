import axiosInstance from '../../axiosInstance.jsx'
import API_URL from '../../api_url';

// Fetch posts from API
export const getNotificationUser = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.getNotificationsById(id),
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching fetchDepartment:", error);
    return [];
  }
}
