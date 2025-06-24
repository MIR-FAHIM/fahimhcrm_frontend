import axiosInstance from '../../../axiosInstance.jsx'

// Fetch posts from API
export const getUserLeaveDaysRemain = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/get-emp-leave-report/${id}`,
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching leave daYS REMA:", error);
    return [];
  }
}
export const getUserLeaveRequests = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/get-emp-leave/${id}`,
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching leave daYS REMA:", error);
    return [];
  }
}
export const getLeaveType = async () => {
  try {
    const response = await axiosInstance.get(`/api/get-leave-type`,
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching leave daYS REMA:", error);
    return [];
  }
}
export const getAllLeave = async () => {
  try {
    const response = await axiosInstance.get(`/api/get-all-leave`,
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching leave daYS REMA:", error);
    return [];
  }
}
export const addLeave = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/add-leave`, data,
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error add leave:", error);
    return [];
  }
}
export const approveLeave = async (data,id) => {
  try {
    const response = await axiosInstance.post(`/api/approve-leave/${id}`, data,
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error add leave:", error);
    return [];
  }
}
export const rejectLeave = async (data,id) => {
  try {
    const response = await axiosInstance.post(`/api/reject-leave/${id}`, data,
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error reject leave:", error);
    return [];
  }
}
