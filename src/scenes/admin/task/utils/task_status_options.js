import {
  getStatus,
  getTaskStatusByDepartment,
} from "../../../../api/controller/admin_controller/task_controller/task_controller";

const statusCache = new Map();

export const asList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
};

export const getLoggedInUser = () => {
  const storedUser = localStorage.getItem("loggedInUser") || localStorage.getItem("user");
  try {
    return storedUser ? JSON.parse(storedUser) : {};
  } catch {
    return {};
  }
};

export const resolveTaskDepartmentId = (task = {}, user = getLoggedInUser()) =>
  task?.department_id ||
  task?.department?.id ||
  user?.department_id ||
  user?.department?.id ||
  "";

export const fetchTaskStatusesForDepartment = async ({ task, fallbackStatuses = [] } = {}) => {
  const departmentId = resolveTaskDepartmentId(task);

  if (departmentId) {
    const cacheKey = String(departmentId);
    if (statusCache.has(cacheKey)) return statusCache.get(cacheKey);

    try {
      const response = await getTaskStatusByDepartment(departmentId);
      const list = asList(response);
      statusCache.set(cacheKey, list);
      return list;
    } catch (error) {
      console.error("Department status fetch failed, falling back to old status list:", error);
    }
  }

  if (fallbackStatuses.length) return fallbackStatuses;

  try {
    return asList(await getStatus());
  } catch {
    return [];
  }
};
