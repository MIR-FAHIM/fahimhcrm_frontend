import axiosInstance from '../../axiosInstance.jsx'

// Fetch posts from API


export const getOpportunityByStage = async () => {
  try {
    const response = await axiosInstance.get(`/api/get-opportunities-by-stage`,
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
    const response = await axiosInstance.get(`/api/quotations/prospect/${id}`,
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
    const response = await axiosInstance.get(`/api/details-opportunity/${id}`,
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
    const response = await axiosInstance.post(`/api/add-opportunity`,data,
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
    const response = await axiosInstance.post(`/api/add-quotation`,data,
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