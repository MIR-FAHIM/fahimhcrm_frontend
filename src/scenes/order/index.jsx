import { Box, useTheme, Button } from "@mui/material";
import { Header } from "../../components";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import { fetchAllOrders } from "../../api/controller/order_controller/order_controller";

const AllOrders = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  // State to store API response data
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);  // To handle loading state
  const [error, setError] = useState(null);      // To handle error state

  // API call to fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetchAllOrders();
        console.log("all data are", response);

        if (response && response.data) {
          setOrders(response.data);  // Set orders data from response
          setLoading(false); // Set loading to false after fetching data
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Error fetching orders');
        setLoading(false); // Handle error and stop loading
      }
    };

    fetchOrders();  // Fetch orders when component mounts
  }, []);

  // Function to handle view details button click
  const handleViewDetails = (orderId) => {
    // Handle the logic to display the order details page or show a modal

    navigate(`/order-details/${orderId}`);
    console.log("View details for order ID:", orderId);
    // You could redirect to another page or open a modal for order details
  };

  const columns = [
    { field: "id", headerName: "Order ID", flex: 0.2 },
    { field: "customer_name", headerName: "Customer Name", flex: 0.5 },
    { field: "customer_phone", headerName: "Phone Number", flex: 0.5 },
   
    { field: "isDhaka", headerName: "Is Dhaka", flex: 0.5, type: "boolean" },
    { field: "total_cart", headerName: "Total Cart", flex: 0.5, type:"integer" },
    { field: "payment_recievable_from_cus", headerName: "Payment Recievable", flex: 0.7 },
    { 
      field: "order_status", 
      headerName: "Order Status", 
      flex: 0.5, 
      valueFormatter: ({ value }) => {
        // Adjust the formatter to return the correct status from the statusLabels array
        const statusLabels = [
          "Order Placed", "Order Validity Check", "Order Approved", "Packaging",
          "Package Complete", "Shipping Started", "Delivered", "Balance Added"
        ];
    
        // Return the corresponding status label based on the order status
        return statusLabels[value] || "Unknown Status"; // Fallback to "Unknown Status" if no match
      }
    },
    
    { field: "isDelivered", headerName: "Delivered", flex: 0.3, type: "boolean" },
   
    { field: "created_at", headerName: "Created At", flex: 1, valueFormatter: (params) => new Date(params.value).toLocaleString() },
    
    // Adding the View Details button column
    {
      field: "view_details",
      headerName: "Actions",
      flex: 0.5,
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
      <Header title="ALL ORDERS" subtitle="List of All Orders" />
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
          rows={orders}  // Set the rows to the fetched orders data
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 40,
              },
            },
          }}
          checkboxSelection
        />
      </Box>
    </Box>
  );
};

export default AllOrders;
