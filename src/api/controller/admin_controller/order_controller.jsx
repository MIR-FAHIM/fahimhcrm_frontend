import axiosInstance from '../../axiosInstance.jsx'

// Fetch posts from API
export const getOrder = async () => {
  try {
    const response = await axiosInstance.get(`/api/product-orders/get-order`,
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching get order:", error);
    return [];
  }
}

export const getCategory = async () => {
  try {
    const response = await axiosInstance.get(`/api/get-active-categories`,
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getCategory:", error);
    return [];
  }
}
export const getStock = async () => {
  try {
    const response = await axiosInstance.get(`/api/stock/list`,
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getStock:", error);
    return [];
  }
}

export const addProduct = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/product/add`, data,
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching addProduct:", error);
    return [];
  }
}