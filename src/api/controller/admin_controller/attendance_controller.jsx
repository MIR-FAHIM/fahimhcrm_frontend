import API_URL from '../../api_url';
// src/api/apiController.js
import axiosInstance from '../../axiosInstance.jsx'

const authHeaders = () => ({
  headers: {
    token: localStorage.getItem("authToken"),
  },
});

// Fetch posts from API
export const getAttendanceByDate = async (date) => {
  try {
    const response = await axiosInstance.get(API_URL.getAttendanceDate(date),
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching fetchDepartment:", error);
    return [];
  }
}

export const updateAttendance = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.updateAttendance, data,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching updateAttendance:", error);
    return [];
  }
}
export const getAttendanceCountData = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.attendanceReportByUserCountData, data,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching updateAttendance:", error);
    return [];
  }
}



export const getAttendanceReportByUser = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.getAttendanceReportUser, data,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error atttendance report data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}


export const getAttendanceAdjustment = async () => {
  const token = localStorage.getItem("authToken"); // Retrieve token from localStorage

  if (!token) {
    console.error("No auth token found in localStorage.");
    return []; // Return an empty array or handle as necessary
  }
  try {
    const response = await axiosInstance.get(API_URL.getAttendanceAdjustment,
      {
        headers: {
          'token': localStorage.getItem("authToken"),// Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getAttendanceAdjustment:", error);
    return [];
  }
}




export const hasCheckedIn = async (userId) => {
  try {
    const response = await axiosInstance.get(API_URL.isCheckedinToday(userId),
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error has checked in ? data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}

export const checkInNow = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.checkInNow, data,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error checkInNow data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
export const requestAdjustment = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.requestAttendanceAdjustment, data,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error requestAdjustment data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
export const approveAdjustment = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.approveTimeAdjustment, data,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error requestAdjustment data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
export const checkOutNow = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.checkOutNow, data,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error check out data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}

export const fetchAttendanceMethods = async () => {
  try {
    const response = await axiosInstance.get(API_URL.attendanceMethods, authHeaders());
    return response.data;
  } catch (error) {
    console.error("Error fetching attendance methods:", error);
    throw error;
  }
};

export const fetchAttendanceMethodById = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.attendanceMethodById(id), authHeaders());
    return response.data;
  } catch (error) {
    console.error("Error fetching attendance method:", error);
    throw error;
  }
};

export const createAttendanceMethod = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.attendanceMethods, data, authHeaders());
    return response.data;
  } catch (error) {
    console.error("Error creating attendance method:", error);
    throw error;
  }
};

export const updateAttendanceMethod = async (id, data) => {
  try {
    const response = await axiosInstance.put(API_URL.attendanceMethodById(id), data, authHeaders());
    return response.data;
  } catch (error) {
    console.error("Error updating attendance method:", error);
    throw error;
  }
};

export const deleteAttendanceMethod = async (id) => {
  try {
    const response = await axiosInstance.delete(API_URL.attendanceMethodById(id), authHeaders());
    return response.data;
  } catch (error) {
    console.error("Error deleting attendance method:", error);
    throw error;
  }
};
