import { Box, Button, useTheme } from "@mui/material";
import { Header } from "../../components";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import axios from "axios";
import { tokens } from "../../theme";
import { useNavigate } from "react-router-dom";
import { base_url } from "../../api/config";
const Contacts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();  // Initialize navigate

  // State to store API response data
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // To handle loading state
  const [error, setError] = useState(null);     // To handle error state

  const handleViewDetails = (id) => {
    // Handle the logic to display the order details page or show a modal
    navigate(`/user-details/${id}`); // Navigate to order details page with the order ID
    console.log("View details for order ID:", id);
  };

  // API call to fetch users
  useEffect(() => {
    axios
      .get(`${base_url}/api/getAllUsers`)
      .then((response) => {
        console.log(response.data.data); // Log the response data
        setUsers(response.data.data); // Set the users data from the response
        setLoading(false); // Set loading to false after data is fetched
      })
      .catch((err) => {
        setError("Error fetching data"); // Handle errors if the request fails
        setLoading(false); // Set loading to false even on error
      });
  }, []);

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "phone", headerName: "Phone Number", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "user_type", headerName: "User Type", flex: 1 },
    { field: "is_verified", headerName: "Verified", flex: 1, type: "boolean" },
    { field: "balance", headerName: "Balance", flex: 1 },
    {
      field: "view_details",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => {
        return (
          <Button
            variant="outlined"
            color="primary"
            onClick={() => handleViewDetails(params.row.id)} // Pass order ID for the clicked row
          >
            View Details
          </Button>
        );
      },
    },
  ];

  // Handle loading and error states
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Box m="20px">
      <Header title="CONTACTS" subtitle="List of Users from API" />
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
          rows={users} // Set the rows to the fetched users data
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

export default Contacts;
