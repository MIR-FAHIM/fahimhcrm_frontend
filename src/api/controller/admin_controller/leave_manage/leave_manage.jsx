import axiosInstance from '../../../axiosInstance.jsx'
import API_URL from '../../../api_url';

// Fetch posts from API
export const getUserLeaveDaysRemain = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.getEmpLeaveReportById(id),
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
    const response = await axiosInstance.get(API_URL.getEmpLeaveById(id),
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
    const response = await axiosInstance.get(API_URL.getLeaveType,
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
    const response = await axiosInstance.get(API_URL.getAllLeave,
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
    const response = await axiosInstance.post(API_URL.addLeave, data,
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
    const response = await axiosInstance.post(API_URL.approveLeaveById(id), data,
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
    const response = await axiosInstance.post(API_URL.rejectLeaveById(id), data,
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
