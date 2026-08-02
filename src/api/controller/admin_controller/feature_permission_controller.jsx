import axiosInstance from '../../axiosInstance.jsx'
import API_URL from '../../api_url';


// Fetch posts from API

const authHeaders = () => ({
  headers: {
    'token': localStorage.getItem("authToken"),
  },
});

export const getFeaturePermissionByUser = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.userFeaturePermissionsById(id),
      authHeaders()
    );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error add Department data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
export const updateFeaturePermission = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.updateFeaturePermission, data,
      authHeaders()
    );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error add Department data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}

export const getActiveFeaturesGrouped = async () => {
  try {
    const response = await axiosInstance.get(API_URL.activeFeaturesGrouped, authHeaders());
    return response.data;
  } catch (error) {
    console.error("Error fetching active grouped features:", error);
    throw error;
  }
}

export const getRoleFeaturePermissions = async (roleId) => {
  try {
    const response = await axiosInstance.get(API_URL.roleFeaturePermissionsByRoleId(roleId), authHeaders());
    return response.data;
  } catch (error) {
    console.error("Error fetching role feature permissions:", error);
    throw error;
  }
}

export const updateRoleFeaturePermissions = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.updateRoleFeaturePermissions, data, authHeaders());
    return response.data;
  } catch (error) {
    console.error("Error updating role feature permissions:", error);
    throw error;
  }
}
