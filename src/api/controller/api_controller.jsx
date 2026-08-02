import API_URL from '../api_url';
// src/api/apiController.js
import axiosInstance from '../axiosInstance.jsx'

// Fetch posts from API
export const fetchCategory = async () => {
  try {
    const response = await axiosInstance.get(API_URL.getProductCategories);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching category:", error);
    return [];
  }
   
};
export const fetchWarehouse = async () => {
  try {
    const response = await axiosInstance.get(API_URL.getWarehouses);
    return response.data.warehouses;
  } catch (error) {
    console.error("Error fetching category:", error);
    return [];
  }
   
};
export const fetchBrands = async () => {
  try {
    const response = await axiosInstance.get(API_URL.getBrands2);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching brand:", error);
    return [];
  }
   
};
export const productDetail = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.getProductDetailsById(id));
    return response.data.product;
  } catch (error) {
    console.error("Error fetching product detail:", error);
    return [];
  }
   
};
export const getProductsImages = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.getProductImagesByProductIdById(id));
    return response;
  } catch (error) {
    console.error("Error fetching product images:", error);
    return [];
  }
   
};
export const deleteProductById = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.deleteProductById(id));
    return response;
  } catch (error) {
    console.error("Error delete product:", error);
    return [];
  }
   
};
export const deleteImageById = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.deleteProdductImageById(id));
    return response;
  } catch (error) {
    console.error("Error delete Image:", error);
    return [];
  }
   
};
export const deleteVideoById = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.deleteVideoLinkById(id));
    return response;
  } catch (error) {
    console.error("Error delete Video:", error);
    return [];
  }
   
};

export const postProduct = async (productData) => {
  try {
    const response = await axiosInstance.post(API_URL.createProduct, productData);
    return response; // Return the response from the API
  } catch (error) {
    console.error("Error posting product data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
export const updateProductInfo = async (productData, id) => {
  try {
    const response = await axiosInstance.post(API_URL.updateProductById(id), productData);
    return response; // Return the response from the API
  } catch (error) {
    console.error("Error updating product data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
