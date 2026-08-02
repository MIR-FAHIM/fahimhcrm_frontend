import API_URL from '../../../api_url';


import axiosInstance from '../../../axiosInstance.jsx'

// Fetch posts from API
export const getProjectDetails = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.getProjectDetailsById(id),
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
    const response = await axiosInstance.get(API_URL.projectMembersById(id),
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
export const getProjectTeamTaskCount = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.projectMembersTaskCountById(id),
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
    const response = await axiosInstance.post(API_URL.projectMembersAddMultiple, data,
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
    const response = await axiosInstance.post(API_URL.updatePhaseById(id),
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
