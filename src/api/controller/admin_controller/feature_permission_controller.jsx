import axiosInstance from '../../axiosInstance.jsx'


// Fetch posts from API

export const getFeaturePermissionByUser = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/user-feature-permissions/${id}`,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error add Department data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
export const updateFeaturePermission = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/update-feature-permission`, data,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error add Department data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
