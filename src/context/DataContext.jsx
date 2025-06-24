// src/context/DataContext.js
import React, { createContext, useState, useEffect } from "react";
import { fetchBrands, fetchCategory } from "../api/controller/api_controller";

// Create the context
export const DataContext = createContext();

// Create a provider component
export const DataProvider = ({ children }) => {
  const [categories, setCategory] = useState([]);
  const [brandss, setBrand] = useState([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const categoriesData = await fetchCategory();
      const brandsData = await fetchBrands();
     
      setCategory(categoriesData);
      setBrand(brandsData);
     
      setLoading(false);
    };

    fetchData();
  }, []); // Empty dependency array ensures it runs only once when the component is mounted.

  return (
    <DataContext.Provider value={{ categories, brandss, loading }}>
      {children}
    </DataContext.Provider>
  );
};
