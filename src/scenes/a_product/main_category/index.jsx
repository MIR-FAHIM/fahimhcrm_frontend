import { Box, useTheme } from "@mui/material";
import { Header } from "../../../components";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import axios from "axios";
import { tokens } from "../../../theme";
import { useNavigate } from 'react-router-dom';
import { base_url } from "../../../api/config";

const MainCategoryList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  // State to store API response data
  const [mainCategories, setMainCategories] = useState([]);
  const [loading, setLoading] = useState(true);  // To handle loading state
  const [error, setError] = useState(null);      // To handle error state

  // API call to fetch main categories
  useEffect(() => {
    axios
      .get(`${base_url}/api/getMainCategories`)
      .then((response) => {
        setMainCategories(response.data.data); // Set the main categories data from the response
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
    { field: "productCategoryCount", headerName: "Number of Product Categories", flex: 1 },
  ];

  // Map the main categories to add the count of product categories
  const rows = mainCategories.map((category) => ({
    id: category.id,
    main_cat_name: category.main_cat_name,
    productCategoryCount: category.product_categories.length, // Count product categories
  }));

  // Handle loading and error states
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Box m="20px">
     <div className="flex justify-between items-center mb-6">
    <div>
     
      <p className="text-sm text-gray-500">MAIN CATEGORY LIST</p>
    </div>
    <button className="bg-blue-500 text-white py-2 px-4 rounded-md" 
      onClick={() => navigate("/add-main-category")}>
      Add Main Category
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
          rows={rows}  // Set the rows to the mapped data with category counts
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

export default MainCategoryList;
