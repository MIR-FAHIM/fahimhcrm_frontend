import axiosInstance from '../../axiosInstance.jsx'
import API_URL from '../../api_url';

// Fetch posts from API


export const getOpportunityByStage = async () => {
  try {
    const response = await axiosInstance.get(API_URL.getOpportunitiesByStage,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching get-opportunities-by-stage:", error);
    return [];
  }
}
export const getQuotationByProspect = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.quotationsProspectById(id),
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching quotations:", error);
    return [];
  }
}
export const getOpportunityDetail = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.detailsOpportunityById(id),
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching details-opportunity:", error);
    return [];
  }
}
export const addOpportunity = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.addOpportunity,data,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching addOpportunity:", error);
    return [];
  }
}
export const createQuotation = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.addQuotation,data,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching add-quotation:", error);
    return [];
  }
}
