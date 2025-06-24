

import axiosInstance from '../../../axiosInstance.jsx'

// Fetch posts from API
export const getProjectDetails = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/get-project-details/${id}`,
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getProjectDetails:", error);
    return [];
  }
}
export const getProjectTeam = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/project-members/${id}`,
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getProjectDetails:", error);
    return [];
  }
}
export const addProjectMembers = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/project-members/add-multiple`, data,
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getProjectDetails:", error);
    return [];
  }
}
export const updateProjectPhase = async (id, data) => {
  try {
    const response = await axiosInstance.post(`/api/update-phase/${id}`,
      data,
        {
          
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getProjectDetails:", error);
    return [];
  }
}