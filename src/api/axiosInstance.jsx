import axios from 'axios';

import { base_url } from "../api/config";
// Create an Axios instance with a base URL
const axiosInstance = axios.create({
  baseURL: `${base_url}`,  // Replace with your API base URL
  timeout: 10000, // Optional: Set a timeout for requests
});

export default axiosInstance;
