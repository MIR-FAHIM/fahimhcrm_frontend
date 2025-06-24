import { Box, useTheme } from "@mui/material";

import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import axios from "axios";
import { tokens } from "../../../theme";
import { useNavigate } from 'react-router-dom';
import {base_url} from '../../../api/config';

const ProductCategoryList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  // State to store API response data
  const [mainCategories, setMainCategories] = useState([]);
  const [loading, setLoading] = useState(true);  // To handle loading state
  const [error, setError] = useState(null);      // To handle error state

  // API call to fetch product categories
  useEffect(() => {
    axios
      .get(`${base_url}/api/getProductCategories`)
      .then((response) => {
        setMainCategories(response.data.data); // Set the product categories data from the response
        setLoading(false);  // Set loading to false after data is fetched
      })
      .catch((err) => {
        setError("Error fetching data");  // Handle errors if the request fails
        setLoading(false);  // Set loading to false even on error
      });
  }, []);

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "main_cat_name", headerName: "Main Category Name", flex: 1 },
    { field: "product_cat_name", headerName: "Product Category Name", flex: 1 },
    { field: "image_url", headerName: "Image", flex: 1, renderCell: (params) => <img src={`${base_url}/${params.value}`} alt="product" width="50" height="50" /> },
    { field: "description", headerName: "Description", flex: 2 },
  ];

  // Map the product categories to include image_url and description
  const rows = mainCategories.map((category) => ({
    id: category.id,
    main_cat_name: category.main_category.main_cat_name,
    product_cat_name: category.product_cat_name,
    image_url: category.image_url, // Adding image_url field
    description: category.description, // Adding description field
  }));

  // Handle loading and error states
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Box m="20px">
      <div className="flex justify-between items-center mb-6">
        <div>

          <p className="text-sm text-gray-500">PRODUCT CATEGORY LIST</p>
        </div>
        <button className="bg-blue-500 text-white py-2 px-4 rounded-md"
          onClick={() => navigate("/add-product-category")}>
          Add Product Category
        </button>
      </div>
      <Box
        mt="40px"
        height="75vh"
        maxWidth="100%"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            border: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[100],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[100],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-iconSeparator": {
            color: colors.primary[100],
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.gray[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={rows}  // Set the rows to the mapped data with image and description
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          checkboxSelection
        />
      </Box>
    </Box>
  );
};

export default ProductCategoryList;
