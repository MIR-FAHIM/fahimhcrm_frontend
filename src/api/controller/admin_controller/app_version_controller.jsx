import API_URL from "../../api_url";
import axiosInstance from "../../axiosInstance.jsx";

const authHeaders = () => ({
  headers: {
    token: localStorage.getItem("authToken"),
  },
});

export const fetchAppVersions = async () => {
  try {
    const response = await axiosInstance.get(API_URL.appVersionAll, authHeaders());
    return response.data;
  } catch (error) {
    console.error("Error fetching app versions:", error);
    throw error;
  }
};

export const fetchLatestAppVersion = async (platform) => {
  try {
    const response = await axiosInstance.get(API_URL.appVersionLatest(platform), authHeaders());
    return response.data;
  } catch (error) {
    console.error("Error fetching latest app version:", error);
    throw error;
  }
};

export const createAppVersion = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.appVersionAdd, data, authHeaders());
    return response.data;
  } catch (error) {
    console.error("Error creating app version:", error);
    throw error;
  }
};

export const updateAppVersion = async (id, data) => {
  try {
    const response = await axiosInstance.post(API_URL.appVersionUpdate(id), data, authHeaders());
    return response.data;
  } catch (error) {
    console.error("Error updating app version:", error);
    throw error;
  }
};

export const deleteAppVersion = async (id) => {
  try {
    const response = await axiosInstance.post(API_URL.appVersionDelete(id), {}, authHeaders());
    return response.data;
  } catch (error) {
    console.error("Error deleting app version:", error);
    throw error;
  }
};