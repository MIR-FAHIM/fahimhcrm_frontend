import axiosInstance from '../../axiosInstance.jsx'
import { companyID } from '../../config'

// Fetch posts from API

export const registerEmployee = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/register-employee`, data,
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
export const uploadProfileImage = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/upload-user-image`, data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error upload Image data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
export const loginController = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/login`, data,
      {
        headers: {
          'token': 'prefix_67e12b036e3f06.63889147', // Add the token in Authorization header
        },
      }
    );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error login data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
export const addUserActivity = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/add-user-activity`, data,
      {
        headers: {
          'token': 'prefix_67e12b036e3f06.63889147', // Add the token in Authorization header
        },
      }
    );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error login data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
export const fetchEmployees = async () => {
  const token = localStorage.getItem("authToken"); // Retrieve token from localStorage

  if (!token) {
    console.error("No auth token found in localStorage.");
    return []; // Return an empty array or handle as necessary
  }
  try {
    const response = await axiosInstance.get(`/api/get-all-employee`,
      {
        headers: {
          'token': localStorage.getItem("authToken"),// Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching fetchDepartment:", error);
    return [];
  }
}
export const modulePermission = async () => {
  const token = localStorage.getItem("authToken"); // Retrieve token from localStorage

  if (!token) {
    console.error("No auth token found in localStorage.");
    return []; // Return an empty array or handle as necessary
  }
  try {
    const response = await axiosInstance.get(`/api/module/permission/${companyID}`,
      {
        headers: {
          'token': localStorage.getItem("authToken"),// Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching fetchDepartment:", error);
    return [];
  }
}
export const dashBoardReport = async () => {
  const token = localStorage.getItem("authToken"); // Retrieve token from localStorage

  if (!token) {
    console.error("No auth token found in localStorage.");
    return []; // Return an empty array or handle as necessary
  }
  try {
    const response = await axiosInstance.get(`/api/get-dashboard-report`,
      {
        headers: {
          'token': localStorage.getItem("authToken"),// Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching dashBoardReport:", error);
    return [];
  }
}


export const attendanceDashboardReportController = async () => {
  const token = localStorage.getItem("authToken"); // Retrieve token from localStorage

  if (!token) {
    console.error("No auth token found in localStorage.");
    return []; // Return an empty array or handle as necessary
  }
  try {
    const response = await axiosInstance.get(`/api/attendance-report-dashboard`,
      {
        headers: {
          'token': localStorage.getItem("authToken"),// Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching dashBoardReport:", error);
    return [];
  }
}



export const getFacebookLeads = async () => {
  const token = localStorage.getItem("authToken"); // Retrieve token from localStorage

  if (!token) {
    console.error("No auth token found in localStorage.");
    return []; // Return an empty array or handle as necessary
  }
  try {
    const response = await axiosInstance.get(`/api/get-facebook-leads`,
      {
        headers: {
          'token': localStorage.getItem("authToken"),// Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching dashBoardReport:", error);
    return [];
  }
}
export const getAllUserTrack = async () => {
  const token = localStorage.getItem("authToken"); // Retrieve token from localStorage

  if (!token) {
    console.error("No auth token found in localStorage.");
    return []; // Return an empty array or handle as necessary
  }
  try {
    const response = await axiosInstance.get(`/api/get-all-user-activity`,
      {
        headers: {
          'token': localStorage.getItem("authToken"),// Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching dashBoardReport:", error);
    return [];
  }
}
export const getUserActivity = async (id) => {
  const token = localStorage.getItem("authToken"); // Retrieve token from localStorage

  if (!token) {
    console.error("No auth token found in localStorage.");
    return []; // Return an empty array or handle as necessary
  }
  try {
    const response = await axiosInstance.get(`/api/get-user-activity?user_id=${id}`,
      {
        headers: {
          'token': localStorage.getItem("authToken"),// Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getUserActivity:", error);
    return [];
  }
}


export const getContactUsLeads = async () => {
  const token = localStorage.getItem("authToken"); // Retrieve token from localStorage

  if (!token) {
    console.error("No auth token found in localStorage.");
    return []; // Return an empty array or handle as necessary
  }
  try {
    const response = await axiosInstance.get(`/api/get-contact-us`,
      {
        headers: {
          'token': localStorage.getItem("authToken"),// Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching dashBoardReport:", error);
    return [];
  }
}

export const getProfile = async (id, navigate) => {


  try {
    const response = await axiosInstance.get(`/api/get-profile?user_id=${id}`,
      {
        headers: {
          'token': localStorage.getItem("authToken"),// Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);

    if (error.response.status === 450) {
      // Remove invalid token and redirect to login
      localStorage.removeItem("authToken");
      navigate('/login');
    }
    return [];
  }
}
export const logOut = async (id) => {


  try {
    const response = await axiosInstance.get(`/api/logout?user_id=${id}`,
      {
        headers: {
          'token': localStorage.getItem("authToken"),// Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);

    if (error.response.status === 450) {
      // Remove invalid token and redirect to login
      localStorage.removeItem("authToken");
      navigate('/login');
    }
    return [];
  }
}

export const updateProfile = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/update-userinfo`, data,
      {
        headers: {

          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updateProfile:", error);
    return [];
  }

};
export const changePassController = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/change-password`, data,
      {
        headers: {

          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error changePassController:", error);
    return [];
  }

};