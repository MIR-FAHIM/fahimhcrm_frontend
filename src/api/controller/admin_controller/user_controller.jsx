import axiosInstance from '../../axiosInstance.jsx'
import { companyID } from '../../config'
import API_URL from '../../api_url';
const getUserAppToken = () => {
  const storedUser = localStorage.getItem("loggedInUser") || localStorage.getItem("user");
  let appToken = "";
  try {
    appToken = storedUser ? JSON.parse(storedUser)?.app_token : "";
  } catch (error) {
    appToken = "";
  }
  return appToken || localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
};

// Fetch posts from API

export const registerEmployee = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.registerEmployee, data,
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
    const response = await axiosInstance.post(API_URL.uploadUserImage, data,
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
    const response = await axiosInstance.post(API_URL.login, data,
      //prefix_67e12b036e3f06.63889147
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
    const response = await axiosInstance.post(API_URL.addUserActivity, data,
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
    const response = await axiosInstance.get(API_URL.getAllEmployee,
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
    const response = await axiosInstance.get(API_URL.modulePermissionByCompanyID(companyID),
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
    const response = await axiosInstance.get(API_URL.getDashboardReport,
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
    const response = await axiosInstance.get(API_URL.attendanceReportDashboard,
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
    const response = await axiosInstance.get(API_URL.getFacebookLeads,
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
    const response = await axiosInstance.get(API_URL.getAllUserActivity,
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
    const response = await axiosInstance.get(API_URL.getUserActivity(id),
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
    const response = await axiosInstance.get(API_URL.getContactUs,
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
    const response = await axiosInstance.get(API_URL.getProfile(id),
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
    const response = await axiosInstance.get(API_URL.logout(id),
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
    const response = await axiosInstance.post(API_URL.updateUserinfo, data,
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

export const updateEmployeeInfo = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.updateUserinfo, data, {
      headers: { token: getUserAppToken() },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating employee info:", error);
    throw error;
  }
};
export const changePassController = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.changePassword, data,
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
export const getUserModePreference = async (userId) => {
  try {
    const response = await axiosInstance.get(API_URL.getUserModePreference(userId),
      {
        headers: {
          'token': localStorage.getItem("authToken"),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user mode preference:", error);
    throw error;
  }
};

export const updateUserModePreference = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.updateUserModePreference, data,
      {
        headers: {
          'token': localStorage.getItem("authToken"),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating user mode preference:", error);
    throw error;
  }
};
export const changeEmployeeRole = async (userId, data) => {
  try {
    const response = await axiosInstance.post(API_URL.changeRoleByUserId(userId), data, {
      headers: { token: getUserAppToken() },
    });
    return response.data;
  } catch (error) {
    console.error("Error changing employee role:", error);
    throw error;
  }
};

export const changeEmployeeDepartment = async (userId, data) => {
  try {
    const response = await axiosInstance.post(API_URL.changeDepartmentByUserId(userId), data, {
      headers: { token: getUserAppToken() },
    });
    return response.data;
  } catch (error) {
    console.error("Error changing employee department:", error);
    throw error;
  }
};

export const changeEmployeeDesignation = async (userId, data) => {
  try {
    const response = await axiosInstance.post(API_URL.changeDesignationByUserId(userId), data, {
      headers: { token: getUserAppToken() },
    });
    return response.data;
  } catch (error) {
    console.error("Error changing employee designation:", error);
    throw error;
  }
};
