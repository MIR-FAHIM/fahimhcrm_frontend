import axiosInstance from '../../axiosInstance.jsx'
import API_URL from '../../api_url';

const getProductAuthToken = () => {
  const storedUser = localStorage.getItem("loggedInUser") || localStorage.getItem("user");

  try {
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    return parsedUser?.app_token || localStorage.getItem("authToken");
  } catch {
    return localStorage.getItem("authToken");
  }
};

const productAuthHeaders = (isMultipart = false) => ({
  token: getProductAuthToken(),
  ...(isMultipart ? { "Content-Type": "multipart/form-data" } : {}),
});

// Fetch posts from API
export const getProduct = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.productActive,
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getProduct:", error);
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
export const getBrand = async () => {
  try {
    const response = await axiosInstance.get(API_URL.getBrands,
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getBrand:", error);
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
export const getProductWithVariants = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.productVariantAllById(id),
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getProductWithVariants:", error);
    return [];
  }
}

export const getAllVarients = async () => {
  try {
    const response = await axiosInstance.get(API_URL.productVariantGetAllVarients,
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching product-variant/get-all-varients:", error);
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

export const addProductManagement = async (data) => {
  const isMultipart = data instanceof FormData;
  const response = await axiosInstance.post(API_URL.productAdd, data, {
    headers: productAuthHeaders(isMultipart),
  });
  return response.data;
}

export const updateProductManagement = async (id, data) => {
  const isMultipart = data instanceof FormData;
  const response = await axiosInstance.put(API_URL.productUpdateById(id), data, {
    headers: productAuthHeaders(isMultipart),
  });
  return response.data;
}

export const deleteProductManagement = async (id) => {
  const response = await axiosInstance.delete(API_URL.productDeleteById(id), {
    headers: productAuthHeaders(),
  });
  return response.data;
}
export const createMultipleCart = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.cartMultiple, data,
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
export const addOrder = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.productOrdersAddOrder, data,
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching product-orders/add-order:", error);
    return [];
  }
}
export const addVariant = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.productVariantAdd, data,
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
