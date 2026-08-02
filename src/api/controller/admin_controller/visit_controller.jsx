import axiosInstance from '../../axiosInstance.jsx'
import API_URL from '../../api_url';

export const getAllVisit = async () => {
  try {
    const response = await axiosInstance.get(API_URL.visitAll,
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getStock:", error);
    return [];
  }
}
export const getVisitByDateEmp = async (date, emp) => {
  try {
    const response = await axiosInstance.get(API_URL.visitDateEmp(date, emp),
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getStock:", error);
    return [];
  }
}
export const getDateWiseVisit = async () => {
  try {
    const response = await axiosInstance.get(API_URL.visitAllDatewise,
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getStock:", error);
    return [];
  }
}
export const getEmpVisit = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.visitEmployeeById(id),
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getStock:", error);
    return [];
  }
}

export const addVisit = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.visitAdd, data,
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching addProduct:", error);
    return [];
  }
}
