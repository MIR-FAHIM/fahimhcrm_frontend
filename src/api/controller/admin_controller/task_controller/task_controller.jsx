// src/api/apiController.js
import axiosInstance from '../../../axiosInstance.jsx'

// Fetch posts from API
export const getTaskByUsers = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/get-user-task/${id}`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    return [];
  }
}
export const getWaitingTaskByUsers = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/get-user-waiting-task/${id}`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    return [];
  }
}
export const getFeatureByProject = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/projects/features/${id}`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getFeatureByProject:", error);
    return [];
  }
}
export const getProjectsPhases = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/get-project-phase/${id}`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getProjectsPhases:", error);
    return [];
  }
}
export const updateCompletionPercentage = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/update-completion-percentage`, data,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    return [];
  }
}
export const addNotification = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/add-notification`, data,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching addNotification:", error);
    return [];
  }
}
export const addTaskFollowup = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/add-task-followup`, data,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    return [];
  }
}
export const addPhase = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/add-project-phase`, data,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching addPhase:", error);
    return [];
  }
}
export const addTaskImages = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/task/images/add`, data,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching addPhase:", error);
    return [];
  }
}
export const updateShowCompletionPercentage = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/update-show-completion-percentage`, data,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    return [];
  }
}
export const updateTask = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/update-task`, data,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    return [];
  }
}
export const addWorkReport = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/work-reports`, data,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error add work report:", error);
    return [];
  }
}
export const getAssignedTaskByUsers = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/get-assigned-task/${id}`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    return [];
  }
}
export const getTaskFollowup = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/get-task-followupsByTaskId/${id}`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    return [];
  }
}
export const deleteTaskFollowup = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/delete-followup/${id}`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error delete followup:", error);
    return [];
  }
}
export const getTaskImages = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/task/images/${id}`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getTaskImages tasks:", error);
    return [];
  }
}
export const getTaskActivity = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/get-task-activitiesByTaskId/${id}`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    return [];
  }
}
export const getTaskDetails = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/task-details/${id}`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching detail tasks:", error);
    return [];
  }
}
export const getTaskReportByUser = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/get-task-report/${id}`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user tasks report:", error);
    return [];
  }
}
export const getWorkReportByUser = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/work-reports/user/${id}`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user tasks report:", error);
    return [];
  }
}
export const updateTaskStatus = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/update-task-status`, data,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response; // Return the response from the API
  } catch (error) {
    console.error("Error add Department data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}

export const getAllTask = async () => {
  try {
    const response = await axiosInstance.get(`/api/get-all-task`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all tasks:", error);
    return [];
  }
}
export const getAllTaskByDepartment = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/get-all-task-department/${id}`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all tasks:", error);
    return [];
  }
}
export const fetchTaskPriorities = async () => {
  try {
    const response = await axiosInstance.get(`/api/get-priorites`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all tasks:", error);
    return [];
  }
}
export const getAllWorkReport = async () => {
  try {
    const response = await axiosInstance.get(`/api/work-reports/by-date`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all tasks:", error);
    return [];
  }
}
export const getAllTaskByStatus = async () => {
  try {
    const response = await axiosInstance.get(`/api/get-all-task-by-status`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all tasks:", error);
    return [];
  }
}
export const getPhaseTask = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/task-by-project-phase/${id}`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all tasks:", error);
    return [];
  }
}
export const getProjectTask = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/task-by-project/${id}`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all tasks:", error);
    return [];
  }
}
export const deleteTaskImage = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/delete-task-image/${id}`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all tasks:", error);
    return [];
  }
}
export const getPriority = async () => {
  try {
    const response = await axiosInstance.get(`/api/get-priorites`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all priority:", error);
    return [];
  }
}
export const getStatus = async () => {
  try {
    const response = await axiosInstance.get(`/api/get-task-status`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching task status:", error);
    return [];
  }
}
export const getTaskType = async () => {
  try {
    const response = await axiosInstance.get(`/api/get-task-type`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching task status:", error);
    return [];
  }
}
export const getProjects = async () => {
  try {
    const response = await axiosInstance.get(`/api/get-project`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching task status:", error);
    return [];
  }
}
export const getAllWorkShop = async () => {
  try {
    const response = await axiosInstance.get(`/api/project-workshop/all`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching work shop:", error);
    return [];
  }
}
export const getAllWorkShopProject = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/project-workshop/get-by-project/${id}`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching work shop:", error);
    return [];
  }
}
export const deleteWorkShop = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/project-workshop/remove/${id}`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error delete work shop:", error);
    return [];
  }
}

export const addWorkShop = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/project-workshop/add-work-shop`, data, 
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching add workshop:", error);
    return [];
  }
}


export const getProjectsByDepartment = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/get-project-by-department/${id}`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching task status:", error);
    return [];
  }
}
export const fetchTaskStatus = async () => {
  try {
    const response = await axiosInstance.get(`/api/get-task-status`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching task status:", error);
    return [];
  }
}
export const fetchTaskType = async () => {
  try {
    const response = await axiosInstance.get(`/api/get-task-type`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching task status:", error);
    return [];
  }
}
export const assignUser = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/assign-task`, data,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching task assign to:", error);
    return [];
  }
}
export const addTask = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/add-task`, data,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching task add:", error);
    return [];
  }
}
export const addProject = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/add-project`, data,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching task add:", error);
    return [];
  }
}
export const addTaskPriority = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/add-priority`, data,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching task add:", error);
    return [];
  }
}
export const addTaskStatus = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/add-task-status`, data,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching task add:", error);
    return [];
  }
}
export const addTaskType = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/add-task-type`, data,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching task add:", error);
    return [];
  }
}