import axiosInstance from '../../axiosInstance.jsx'

// Fetch posts from API
export const getNotificationUser = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/get-notifications/${id}`,
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