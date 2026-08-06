import API_URL from '../../../api_url';
// src/api/apiController.js
import axiosInstance from '../../../axiosInstance.jsx'

const getMasterDataToken = () => {
  const storedUser = localStorage.getItem("loggedInUser") || localStorage.getItem("user");
  let appToken = "";
  try {
    appToken = storedUser ? JSON.parse(storedUser)?.app_token : "";
  } catch (error) {
    appToken = "";
  }
  return appToken || localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
}

// Fetch posts from API
export const getTaskByUsers = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.getUserTaskById(id),
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
    const response = await axiosInstance.get(API_URL.getUserWaitingTaskById(id),
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
    const response = await axiosInstance.get(API_URL.projectsFeaturesById(id),
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
    const response = await axiosInstance.get(API_URL.getProjectPhaseById(id),
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
    const response = await axiosInstance.post(API_URL.updateCompletionPercentage, data,
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
    const response = await axiosInstance.post(API_URL.addNotification, data,
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
    const response = await axiosInstance.post(API_URL.addTaskFollowup, data,
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
    const response = await axiosInstance.post(API_URL.addProjectPhase, data,
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
    const response = await axiosInstance.post(API_URL.taskImagesAdd, data,
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
    const response = await axiosInstance.post(API_URL.updateShowCompletionPercentage, data,
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
    const response = await axiosInstance.post(API_URL.updateTask, data,
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
    const response = await axiosInstance.post(API_URL.workReports, data,
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
    const response = await axiosInstance.get(API_URL.getAssignedTaskById(id),
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
    const response = await axiosInstance.get(API_URL.getTaskFollowupsByTaskIdById(id),
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
    const response = await axiosInstance.get(API_URL.deleteFollowupById(id),
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
    const response = await axiosInstance.get(API_URL.taskImagesById(id),
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
    const response = await axiosInstance.get(API_URL.getTaskActivitiesByTaskIdById(id),
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
    const response = await axiosInstance.get(API_URL.taskDetailsById(id),
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
    const response = await axiosInstance.get(API_URL.getTaskReportById(id),
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
    const response = await axiosInstance.get(API_URL.workReportsUserById(id),
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
    const response = await axiosInstance.post(API_URL.updateTaskWorkflowStatus, data,
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
    const response = await axiosInstance.get(API_URL.getAllTask,
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
    const response = await axiosInstance.get(API_URL.getAllTaskDepartmentById(id),
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
    const response = await axiosInstance.get(API_URL.getPriorities,
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
    const response = await axiosInstance.get(API_URL.workReportsByDate,
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
    const response = await axiosInstance.get(API_URL.getAllTaskByStatus,
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
    const response = await axiosInstance.get(API_URL.taskByProjectPhaseById(id),
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
    const response = await axiosInstance.get(API_URL.taskByProjectById(id),
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
    const response = await axiosInstance.get(API_URL.deleteTaskImageById(id),
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
    const response = await axiosInstance.get(API_URL.getPriorities,
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
    const response = await axiosInstance.get(API_URL.getTaskStatus,
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
    const response = await axiosInstance.get(API_URL.getTaskType,
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
    const response = await axiosInstance.get(API_URL.getProject,
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
    const response = await axiosInstance.get(API_URL.projectWorkshopAll,
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
    const response = await axiosInstance.get(API_URL.projectWorkshopGetByProjectById(id),
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
    const response = await axiosInstance.delete(API_URL.projectWorkshopRemoveById(id),
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
    const response = await axiosInstance.post(API_URL.projectWorkshopAddWorkShop, data,
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
    const response = await axiosInstance.get(API_URL.getProjectByDepartmentById(id),
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
    const response = await axiosInstance.get(API_URL.getTaskStatus,
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
    const response = await axiosInstance.get(API_URL.getTaskType,
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
    const response = await axiosInstance.post(API_URL.assignTask, data,
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
    const response = await axiosInstance.post(API_URL.addTask, data,
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
    const response = await axiosInstance.post(API_URL.addProject, data,
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
    const response = await axiosInstance.post(API_URL.addPriority, data,
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
    const response = await axiosInstance.post(API_URL.addTaskStatus, data,
      {
        headers: {
          'token': getMasterDataToken(),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching task add:", error);
    throw error;
  }
}
export const addTaskType = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.addTaskType, data,
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
export const updateTaskPriority = async (id, data) => {
  try {
    const response = await axiosInstance.put(API_URL.updatePriorityById(id), data, {
      headers: { 'token': getMasterDataToken() },
    });
    return response.data;
  } catch (error) {
    console.error("Error updateTaskPriority:", error);
    throw error;
  }
}

export const deleteTaskPriority = async (id) => {
  try {
    const response = await axiosInstance.delete(API_URL.deletePriorityById(id), {
      headers: { 'token': getMasterDataToken() },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleteTaskPriority:", error);
    throw error;
  }
}

export const updateTaskType = async (id, data) => {
  try {
    const response = await axiosInstance.put(API_URL.updateTaskTypeById(id), data, {
      headers: { 'token': getMasterDataToken() },
    });
    return response.data;
  } catch (error) {
    console.error("Error updateTaskType:", error);
    throw error;
  }
}

export const deleteTaskType = async (id) => {
  try {
    const response = await axiosInstance.delete(API_URL.deleteTaskTypeById(id), {
      headers: { 'token': getMasterDataToken() },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleteTaskType:", error);
    throw error;
  }
}

export const updateTaskStatusMaster = async (id, data) => {
  try {
    const response = await axiosInstance.put(API_URL.updateTaskStatusMaster(id), data, {
      headers: { 'token': getMasterDataToken() },
    });
    return response.data;
  } catch (error) {
    console.error("Error updateTaskStatusMaster:", error);
    throw error;
  }
}

export const deleteTaskStatus = async (id) => {
  try {
    const response = await axiosInstance.delete(API_URL.deleteTaskStatusById(id), {
      headers: { 'token': getMasterDataToken() },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleteTaskStatus:", error);
    throw error;
  }
}
