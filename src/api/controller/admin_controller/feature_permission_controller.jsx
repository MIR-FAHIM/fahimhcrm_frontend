import axiosInstance from '../../axiosInstance.jsx'


// Fetch posts from API

const authHeaders = () => ({
  headers: {
    'token': localStorage.getItem("authToken"),
  },
});

export const getFeaturePermissionByUser = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/user-feature-permissions/${id}`,
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
    const response = await axiosInstance.post(`/api/update-feature-permission`, data,
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
    const response = await axiosInstance.get(`/api/active-features-grouped`, authHeaders());
    return response.data;
  } catch (error) {
    console.error("Error fetching active grouped features:", error);
    throw error;
  }
}

export const getRoleFeaturePermissions = async (roleId) => {
  try {
    const response = await axiosInstance.get(`/api/role-feature-permissions/${roleId}`, authHeaders());
    return response.data;
  } catch (error) {
    console.error("Error fetching role feature permissions:", error);
    throw error;
  }
}

export const updateRoleFeaturePermissions = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/update-role-feature-permissions`, data, authHeaders());
    return response.data;
  } catch (error) {
    console.error("Error updating role feature permissions:", error);
    throw error;
  }
}
