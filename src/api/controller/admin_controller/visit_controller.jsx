import axiosInstance from '../../axiosInstance.jsx'
import API_URL from '../../api_url';

const authHeaders = () => ({
  token: localStorage.getItem("authToken"),
});

const parseApiError = (error, fallback) => {
  console.error(fallback, error);
  return error?.response?.data || { status: "error", message: fallback };
};

export const getAllVisit = async () => {
  try {
    const response = await axiosInstance.get(API_URL.visitAll,
        {
            headers: authHeaders(),}
    );
    return response.data;
  } catch (error) {
    return parseApiError(error, "Failed to fetch visits.");
  }
}
export const getVisitByDateEmp = async (date, emp = "") => {
  try {
    const response = await axiosInstance.get(API_URL.visitDateEmp(date, emp),
        {
            headers: authHeaders(),}
    );
    return response.data;
  } catch (error) {
    return parseApiError(error, "Failed to fetch visits by date.");
  }
}
export const getDateWiseVisit = async () => {
  try {
    const response = await axiosInstance.get(API_URL.visitAllDatewise,
        {
            headers: authHeaders(),}
    );
    return response.data;
  } catch (error) {
    return parseApiError(error, "Failed to fetch date-wise visits.");
  }
}
export const getEmpVisit = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.visitEmployeeById(id),
        {
            headers: authHeaders(),}
    );
    return response.data;
  } catch (error) {
    return parseApiError(error, "Failed to fetch employee visits.");
  }
}

export const getEmpVisitSchedule = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.visitEmployeeScheduleById(id),
      {
        headers: authHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    return parseApiError(error, "Failed to fetch employee visit schedule.");
  }
}

export const addVisit = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.visitAdd, data,
        {
            headers: authHeaders(),}
    );
    return response.data;
  } catch (error) {
    return parseApiError(error, "Failed to create visit plan.");
  }
}

export const startVisit = async (id, data) => {
  try {
    const response = await axiosInstance.patch(API_URL.visitStartById(id), data, {
      headers: authHeaders(),
    });
    return response.data;
  } catch (error) {
    return parseApiError(error, "Failed to start visit.");
  }
}

export const completeVisit = async (id, data) => {
  try {
    const response = await axiosInstance.patch(API_URL.visitCompleteById(id), data, {
      headers: authHeaders(),
    });
    return response.data;
  } catch (error) {
    return parseApiError(error, "Failed to complete visit.");
  }
}

export const updateVisit = async (id, data) => {
  try {
    const response = await axiosInstance.patch(API_URL.visitUpdateById(id), data, {
      headers: authHeaders(),
    });
    return response.data;
  } catch (error) {
    return parseApiError(error, "Failed to update visit.");
  }
}

export const deleteVisit = async (id) => {
  try {
    const response = await axiosInstance.delete(API_URL.visitDeleteById(id), {
      headers: authHeaders(),
    });
    return response.data;
  } catch (error) {
    return parseApiError(error, "Failed to delete visit.");
  }
}
