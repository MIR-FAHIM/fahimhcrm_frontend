import axiosInstance from "../../axiosInstance";
import API_URL from "../../api_url";

const headers = () => {
  let token = "";
  try {
    const stored = localStorage.getItem("loggedInUser") || localStorage.getItem("user");
    token = stored ? JSON.parse(stored)?.app_token : "";
  } catch { /* Use the existing auth token fallback. */ }
  return { token: token || localStorage.getItem("authToken") || sessionStorage.getItem("authToken"), Accept: "application/json" };
};

const result = (response) => {
  if (response.data?.status !== "success") {
    const error = new Error(response.data?.message || "The request could not be completed.");
    error.response = response;
    throw error;
  }
  return response.data;
};

export const getAdminProspectTeams = async (params, signal) => result(await axiosInstance.get(
  API_URL.prospectTeamAdminProspects, { params, signal, headers: headers() }
));
export const getProspectTeamEmployees = async (signal) => result(await axiosInstance.get(
  API_URL.getAllEmployee, { signal, headers: headers() }
));
export const getProspectTeamStages = async (signal) => result(await axiosInstance.get(
  API_URL.getProspectStages, { signal, headers: headers() }
));
export const addAdminProspectTeamMembers = async (payload) => result(await axiosInstance.post(
  API_URL.prospectTeamAdminAdd, payload, { headers: headers() }
));
export const removeAdminProspectTeamMember = async (payload) => result(await axiosInstance.post(
  API_URL.prospectTeamAdminRemove, payload, { headers: headers() }
));
export const bulkAddAdminProspectTeams = async (payload) => result(await axiosInstance.post(
  API_URL.prospectTeamAdminBulkAdd, payload, { headers: headers() }
));