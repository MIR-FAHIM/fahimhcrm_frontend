// src/api/apiController.js
import axiosInstance from '../../axiosInstance.jsx'

// Fetch posts from API
export const fetchDepartment = async () => {
  try {
    const response = await axiosInstance.get(`/api/get-department`,
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
    const response = await axiosInstance.get(`/api/zones`,
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
    const response = await axiosInstance.get(`/api/get-department-with-user`,
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
    const response = await axiosInstance.get(`/api/get-designation`,
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
    const response = await axiosInstance.get(`/api/influencing-roles`,
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
    const response = await axiosInstance.get(`/api/get-role`,
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
    const response = await axiosInstance.post(`/api/add-department`, data,
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
    const response = await axiosInstance.post(`/api/add-designation`, data,
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
    const response = await axiosInstance.post(`/api/add-role`, data,
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
