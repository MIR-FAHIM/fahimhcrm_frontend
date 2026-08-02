import axiosInstance from '../../axiosInstance.jsx'
import API_URL from '../../api_url';

// Fetch posts from API
export const getOrder = async () => {
  try {
    const response = await axiosInstance.get(API_URL.productOrdersGetOrder,
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
export const getCartsByOrder = async (orderId) => {
  try {
    const response = await axiosInstance.get(API_URL.cartOrderByOrderId(orderId),
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getCartsByOrder:", error);
    return [];
  }
}

export const getCategory = async () => {
  try {
    const response = await axiosInstance.get(API_URL.getActiveCategories,
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
    const response = await axiosInstance.get(API_URL.stockList,
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
    const response = await axiosInstance.post(API_URL.productAdd, data,
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
