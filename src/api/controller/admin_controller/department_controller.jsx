import API_URL from '../../api_url';
// src/api/apiController.js
import axiosInstance from '../../axiosInstance.jsx'

const getMasterDataToken = () => {
  const storedUser = localStorage.getItem("loggedInUser") || localStorage.getItem("user");
  let appToken = "";
  try {
    appToken = storedUser ? JSON.parse(storedUser)?.app_token : "";
  } catch (error) {
    appToken = "";
  }
  return appToken || localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
}

// Fetch posts from API
export const fetchDepartment = async () => {
  try {
    const response = await axiosInstance.get(API_URL.getDepartment,
        {
            headers: {
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching fetchDepartment:", error);
    return [];
  }
}

export const fetchZone = async () => {
  try {
    const response = await axiosInstance.get(API_URL.zones,
        {
            headers: {
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching fetchZone:", error);
    return [];
  }
}
export const fetchDepartmentWiseEmp = async () => {
  try {
    const response = await axiosInstance.get(API_URL.getDepartmentWithUser,
        {
            headers: {
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching Department:", error);
    return [];
  }
}
export const fetchDesignation = async () => {
  try {
    const response = await axiosInstance.get(API_URL.getDesignation,
        {
            headers: {
              'token':localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching fetchDepartment:", error);
    return [];
  }
}
export const fetchInfluenceRoles = async () => {
  try {
    const response = await axiosInstance.get(API_URL.influencingRoles,
        {
            headers: {
              'token':localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching fetchInfluenceRoles:", error);
    return [];
  }
}
export const fetchRole = async () => {
  try {
    const response = await axiosInstance.get(API_URL.getRole,
        {
            headers: {
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching fetchDepartment:", error);
    return [];
  }
}

export const addDepartment = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.addDepartment, data,
        {
            headers: {
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
     );
    return response; // Return the response from the API
  } catch (error) {
    console.error("Error add Department data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
export const addDesignation = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.addDesignation, data,
        {
            headers: {
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
     );
    return response; // Return the response from the API
  } catch (error) {
    console.error("Error add Department data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
export const addRole = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.addRole, data,
        {
            headers: {
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
     );
    return response; // Return the response from the API
  } catch (error) {
    console.error("Error add Department data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
export const updateDepartment = async (id, data) => {
  try {
    const response = await axiosInstance.put(API_URL.updateDepartmentById(id), data, {
      headers: { 'token': getMasterDataToken() },
    });
    return response.data;
  } catch (error) {
    console.error("Error updateDepartment:", error);
    throw error;
  }
}

export const deleteDepartment = async (id) => {
  try {
    const response = await axiosInstance.delete(API_URL.deleteDepartmentById(id), {
      headers: { 'token': getMasterDataToken() },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleteDepartment:", error);
    throw error;
  }
}

export const updateDesignation = async (id, data) => {
  try {
    const response = await axiosInstance.put(API_URL.updateDesignationById(id), data, {
      headers: { 'token': getMasterDataToken() },
    });
    return response.data;
  } catch (error) {
    console.error("Error updateDesignation:", error);
    throw error;
  }
}

export const deleteDesignation = async (id) => {
  try {
    const response = await axiosInstance.delete(API_URL.deleteDesignationById(id), {
      headers: { 'token': getMasterDataToken() },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleteDesignation:", error);
    throw error;
  }
}

export const updateRole = async (id, data) => {
  try {
    const response = await axiosInstance.put(API_URL.updateRoleById(id), data, {
      headers: { 'token': getMasterDataToken() },
    });
    return response.data;
  } catch (error) {
    console.error("Error updateRole:", error);
    throw error;
  }
}

export const deleteRole = async (id) => {
  try {
    const response = await axiosInstance.delete(API_URL.deleteRoleById(id), {
      headers: { 'token': getMasterDataToken() },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleteRole:", error);
    throw error;
  }
}
