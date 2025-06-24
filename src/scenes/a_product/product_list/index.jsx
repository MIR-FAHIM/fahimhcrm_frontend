import { Box, useTheme, TextField, Button } from "@mui/material";
import { Header } from "../../../components";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import axios from "axios";
import { tokens } from "../../../theme";
import { base_url } from "../../../api/config";
import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom"; // For navigation to product details

const AllProductList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate(); // To navigate to product details page

  // State to store API response data
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);  // To handle loading state
  const [error, setError] = useState(null);      // To handle error state
  const [searchQuery, setSearchQuery] = useState(""); // Search query for product code, sku, or price
  const [categoryFilter, setCategoryFilter] = useState(""); // Filter for category id or name

  // API call to fetch all products
  useEffect(() => {
    axios
      .get(`${base_url}/api/getAllProducts`)
      .then((response) => {
        setProducts(response.data.data); // Set the product data from the response
        setLoading(false);  // Set loading to false after data is fetched
      })
      .catch((err) => {
        setError("Error fetching data");  // Handle errors if the request fails
        setLoading(false);  // Set loading to false even on error
      });
  }, []);

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "product_name", headerName: "Product Name", flex: 1 },
    { field: "product_code", headerName: "Product Code", flex: 1 },
    { field: "price", headerName: "Price", flex: 1 },
    { field: "suggested_price", headerName: "Suggested Price", flex: 1 },
    { field: "winning_rate", headerName: "Winning Rate %", flex: 1 },
    { field: "category_name", headerName: "Product Category", flex: 1,
        valueGetter: (params) => params.row.category ? params.row.category.product_cat_name : '', 
    },
    { field: "brand_name", headerName: "Brand Name", flex: 1,
        valueGetter: (params) => params.row.brand ? params.row.brand.brand_name : '', 
    },
    { field: "created_at", headerName: "Created At", flex: 1, valueFormatter: (params) => new Date(params.value).toLocaleString() },
    { field: "main_image_url", headerName: "Image", flex: 1, renderCell: (params) => <img src={params.value} alt="product" width="50" height="50" /> },
    
    // Action Column for opening the product details
    {
      field: "action", headerName: "Action", flex: 1, 
      renderCell: (params) => (
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate(`/product-details/${params.row.id}`)} // Navigate to product details
          sx={{
            backgroundColor: colors.blueAccent[700], 
            "&:hover": {
              backgroundColor: colors.blueAccent[800], // Blue hover effect
            },
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  // Filtered rows based on search and category filter
  const filteredRows = products.filter((product) => {
    const matchesCategory =
      categoryFilter === "" ||
      product.category.product_cat_name.toLowerCase().includes(categoryFilter.toLowerCase()) ||
      product.category.id.toString().includes(categoryFilter);

    const matchesSearch =
      product.product_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.price.toString().includes(searchQuery);

    return matchesCategory && matchesSearch;
  });

  // Handle loading and error states
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Box m="20px">
      <Header title="All Products" subtitle="List of All Products" />
      <Box mb="20px">
        {/* Category Filter */}
        <TextField
          label="Filter by Category (ID or Name)"
          variant="outlined"
          fullWidth
          onChange={(e) => setCategoryFilter(e.target.value)}
          value={categoryFilter}
          sx={{
            mb: 2,
            backgroundColor: colors.blueAccent[50], // Light blue background
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": {
                borderColor: colors.blueAccent[300], // Blue border on hover
              },
            },
            "& .MuiFormLabel-root": {
              color: colors.blueAccent[600], // Blue text hint
            },
          }}
        />
        {/* Search Field */}
        <TextField
          label="Search by Product Code, SKU, or Price"
          variant="outlined"
          fullWidth
          onChange={(e) => setSearchQuery(e.target.value)}
          value={searchQuery}
          sx={{
            backgroundColor: colors.blueAccent[50], // Light blue background
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": {
                borderColor: colors.blueAccent[300], // Blue border on hover
              },
            },
            "& .MuiFormLabel-root": {
              color: colors.blueAccent[600], // Blue text hint
            },
            "& .MuiInputBase-input": {
              color: colors.blueAccent[800], // Darker blue text
            },
          }}
        />
      </Box>
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
          rows={filteredRows}  // Set the filtered rows based on the search and category filter
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

export default AllProductList;
