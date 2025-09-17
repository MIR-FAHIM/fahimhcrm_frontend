import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useParams to get orderId from URL
import {
  Box,
  Button,
  Typography,
  useTheme,
  Paper,
  Grid,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../../../theme";
import { getCartsByOrder } from "../../../../api/controller/admin_controller/order_controller"; // Assuming this is your API call

const OrderDetails = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { id } = useParams(); // Get orderId from the URL (e.g., /orders/6)
const navigate = useNavigate();
  const [orderItems, setOrderItems] = useState([]);
  const [orderData, setOrderData] = useState(null); // To store consolidated order details
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

useEffect(() => {
    // Define fetchOrderDetails INSIDE useEffect
    const fetchOrderDetails = async () => {
      if (!id) { // Added this check again, good practice if component renders without ID
        setError("No order ID provided in the URL.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
       
       
        const response = await getCartsByOrder(id);
console.log("Calling getCartsByOrder with ID +++++++++:", id); // Added for debugging
        console.log("API Response:", response); // Added for debugging

        if (response.status === "success") {
             
          setOrderItems(response.data);
          setOrderData(response.data[0].order);
          
        } else {
          setOrderItems([]);
          setOrderData(null);
          setError(response.message || "Failed to fetch order details. No data found for this order.");
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Error fetching data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails(); // Call the function defined inside useEffect
  }, [id]); // Dependency array: run when 'id' changes, ensuring fetchOrderDetails has the latest 'id'
  // DataGrid Columns for order items
  const columns = [
    {
      field: "product_name",
      headerName: "Product Name",
      flex: 2,
      valueGetter: (params) => params.row.product?.product_name || "N/A",
    },
    {
      field: "product_code",
      headerName: "Product Code",
      flex: 1,
      valueGetter: (params) => params.row.varient?.product_code || "N/A", // Assuming product_code exists
    },
    {
      field: "quantity",
      headerName: "Quantity",
      type: "number",
      headerAlign: "left",
      align: "left",
      flex: 0.5,
    },
    {
      field: "product_amount",
      headerName: "Unit Price (৳)",
      type: "number",
      headerAlign: "left",
      align: "left",
      flex: 0.7,
      valueFormatter: (params) => parseFloat(params.value).toFixed(2),
    },
    {
      field: "discount",
      headerName: "Item Discount (৳)",
      type: "number",
      headerAlign: "left",
      align: "left",
      flex: 0.7,
      valueFormatter: (params) => parseFloat(params.value).toFixed(2),
    },
    {
      field: "total_amount",
      headerName: "Sub Total (৳)",
      type: "number",
      headerAlign: "left",
      align: "left",
      flex: 0.8,
      valueFormatter: (params) => parseFloat(params.value).toFixed(2),
    },
    {
      field: "remark",
      headerName: "Remark",
      flex: 1.5,
    },
  ];

  // Calculate totals from orderItems (in case orderData.amount is not the sum of items)
  const calculateItemsSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + parseFloat(item.total_amount), 0);
  };

  const calculateItemsDiscount = () => {
    return orderItems.reduce((sum, item) => sum + parseFloat(item.discount), 0);
  };

  // Placeholder for invoice generation logic
  const handleGenerateInvoice = () => {
    // In a real application, you would:
    // 1. Call a backend API to generate a PDF/HTML invoice
    // 2. Or use a client-side library like jsPDF, html2canvas to create one.
    alert("Generating invoice... (This is a placeholder)");
    console.log("Order Data for Invoice:", orderData, orderItems);
    // Example: Trigger download
    // handleDownloadInvoice();
  };

  const handleDownloadInvoice = () => {
    // In a real application, you might:
    // 1. Get a direct download link from the backend after generation
    // 2. Or render a printable view and then use window.print() or a specific PDF library.
    alert("Downloading invoice... (This is a placeholder)");
    // window.open('your-invoice-download-url', '_blank');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
        <CircularProgress />
        <Typography ml={2}>Loading Order Details...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box m="20px">
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate("/orders")}>
          Back to Orders List
        </Button>
      </Box>
    );
  }

  if (!orderData || orderItems.length === 0) {
    return (
      <Box m="20px">
        <Alert severity="info">No order details found for ID: {id}.</Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate("/orders")}>
          Back to Orders List
        </Button>
      </Box>
    );
  }

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
       
        <Typography variant="h4" color={colors.gray[100]} fontWeight="bold">
          Order Details (Order ID: {orderData.id})
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="secondary"
            sx={{ mr: 1 }}
            onClick={handleGenerateInvoice}
          >
            Generate Invoice
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDownloadInvoice}
          >
            Download Invoice
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        {/* Order Summary Card */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: "8px",
              backgroundColor: colors.primary[400],
            }}
          >
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Order Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List dense>
              <ListItem disablePadding>
                <ListItemText
                  primary={<Typography variant="body1" fontWeight="bold">Customer:</Typography>}
                  secondary={<Typography variant="body1">{orderData.customer_id === 1 ? 'Walk-in Customer' : `Customer ID: ${orderData.customer_id}`}</Typography>}
                />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText
                  primary={<Typography variant="body1" fontWeight="bold">Address:</Typography>}
                  secondary={<Typography variant="body1">{orderData.address}</Typography>}
                />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText
                  primary={<Typography variant="body1" fontWeight="bold">Phone:</Typography>}
                  secondary={<Typography variant="body1">{orderData.phone}</Typography>}
                />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText
                  primary={<Typography variant="body1" fontWeight="bold">Order Date:</Typography>}
                  secondary={<Typography variant="body1">{new Date(orderData.created_at).toLocaleString()}</Typography>}
                />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText
                  primary={<Typography variant="body1" fontWeight="bold">Status:</Typography>}
                  secondary={<Typography variant="body1">{orderData.status === "1" ? "Placed" : orderData.status}</Typography>}
                />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText
                  primary={<Typography variant="body1" fontWeight="bold">Payment Status:</Typography>}
                  secondary={<Typography variant="body1">{orderData.isPaid ? "Paid" : "Unpaid"}</Typography>}
                />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText
                  primary={<Typography variant="body1" fontWeight="bold">Payment Method:</Typography>}
                  secondary={<Typography variant="body1">{orderData.is_cod ? "Cash on Delivery" : "Online Payment"}</Typography>}
                />
              </ListItem>
              {orderData.note && (
                <ListItem disablePadding>
                  <ListItemText
                    primary={<Typography variant="body1" fontWeight="bold">Note:</Typography>}
                    secondary={<Typography variant="body1">{orderData.note}</Typography>}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Totals Card */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: "8px",
              backgroundColor: colors.primary[400],
            }}
          >
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Billing Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List dense>
              <ListItem disablePadding sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <ListItemText primary="Items Subtotal:" />
                <Typography variant="body1">৳{calculateItemsSubtotal().toFixed(2)}</Typography>
              </ListItem>
              <ListItem disablePadding sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <ListItemText primary="Order Discount:" />
                <Typography variant="body1">৳{parseFloat(orderData.discount_amount || 0).toFixed(2)}</Typography>
              </ListItem>
              <ListItem disablePadding sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <ListItemText primary="Shipping:" />
                <Typography variant="body1">৳0.00</Typography> {/* Assuming 0 for now */}
              </ListItem>
              <ListItem disablePadding sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <ListItemText primary="Tax:" />
                <Typography variant="body1">৳0.00</Typography> {/* Assuming 0 for now */}
              </ListItem>
              <Divider sx={{ my: 1 }} />
              <ListItem disablePadding sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <ListItemText primary={<Typography variant="h6" fontWeight="bold">Grand Total:</Typography>} />
                <Typography variant="h6" fontWeight="bold">৳{parseFloat(orderData.amount).toFixed(2)}</Typography>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* User Information Card (if applicable, or you can remove) */}
        {orderItems[0]?.user && (
            <Grid item xs={12} md={4}>
                <Paper
                    elevation={3}
                    sx={{
                        p: 3,
                        borderRadius: "8px",
                        backgroundColor: colors.primary[400],
                    }}
                >
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                        Processed By
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <List dense>
                        <ListItem disablePadding>
                            <ListItemText
                                primary={<Typography variant="body1" fontWeight="bold">Name:</Typography>}
                                secondary={<Typography variant="body1">{orderItems[0].user.name}</Typography>}
                            />
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemText
                                primary={<Typography variant="body1" fontWeight="bold">Email:</Typography>}
                                secondary={<Typography variant="body1">{orderItems[0].user.email}</Typography>}
                            />
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemText
                                primary={<Typography variant="body1" fontWeight="bold">Phone:</Typography>}
                                secondary={<Typography variant="body1">{orderItems[0].user.phone}</Typography>}
                            />
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemText
                                primary={<Typography variant="body1" fontWeight="bold">Role:</Typography>}
                                secondary={<Typography variant="body1">{orderItems[0].user.role_id === 1 ? 'Admin' : 'Staff'}</Typography>} 
                            />
                        </ListItem>
                    </List>
                </Paper>
            </Grid>
        )}
      </Grid>

      {/* Order Items DataGrid */}
      <Box
        m="20px 0 0 0"
        height="50vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.gray[900],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.gray[100]} !important`,
          },
          borderRadius: "8px",
          overflow: "hidden", // Ensure border radius applies
        }}
      >
        <Typography variant="h6" fontWeight="bold" p={2} backgroundColor={colors.primary[500]} borderRadius="8px 8px 0 0">
          Order Items
        </Typography>
        <DataGrid
          rows={orderItems}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          getRowId={(row) => row.id} // Important for DataGrid
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
        />
      </Box>
    </Box>
  );
};

export default OrderDetails;