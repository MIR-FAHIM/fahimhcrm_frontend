import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Snackbar, Alert, Grid, Typography, Paper, Tabs, Tab, AppBar } from "@mui/material";
import { getProfile } from '../../api/controller/user_controller'; 
import { getAddBalanceDataByUser } from '../../api/controller/add_balance_data_controller'; 
import { fetchAllWithdrawById } from '../../api/controller/withdraw_controller'; 
import { useParams } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";

const UserDetail = () => {
  const { id } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [balanceAddHistory, setBalanceAddHistory] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const fetchUserDetails = async () => {
    try {
      const response = await getProfile(id); 
      if (response && response.data) {
        setUserDetails(response.data);
      } else {
        setError('No user data found.');
      }

      const balanceResponse = await getAddBalanceDataByUser(id);
      const withdrawResponse = await fetchAllWithdrawById(id);
      
      if (balanceResponse && balanceResponse.data && balanceResponse.data.data.length > 0) {
        setBalanceAddHistory(balanceResponse.data.data);
      } else {
        setBalanceAddHistory([]);
      }
      
      if (withdrawResponse && withdrawResponse.length > 0) {
        setWithdrawHistory(withdrawResponse);
      } else {
        setWithdrawHistory([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Error fetching user details');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!userDetails) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Alert severity="info">No user details available.</Alert>
      </Box>
    );
  }

  const { name, address, phone, email, balance } = userDetails;

  const balanceColumns = [
    { field: "order_id", headerName: "Order ID", flex: 1 },
    { field: "added_amount", headerName: "Added Amount", flex: 1 },
    { field: "previous_balance", headerName: "Previous Balance", flex: 1 },
    { field: "updated_balance", headerName: "Updated Balance", flex: 1 },
    { field: "created_at", headerName: "Date", flex: 1 },
  ];

  const withdrawColumns = [
    { field: "id", headerName: "Order ID", flex: 1 },
    { field: "withdraw_amount", headerName: "Withdraw Amount", flex: 1 },
    { field: "previous_amount", headerName: "Previous Balance", flex: 1 },
    { field: "isPaid", headerName: "Paid Status", flex: 1, type: 'boolean' },
    { field: "created_at", headerName: "Date", flex: 1 },
  ];

  return (
    <Box sx={{ padding: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Grid container spacing={4}>
        {/* User Details and Balance Dashboard */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ padding: 3, display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
            <Typography variant="h4" gutterBottom>User Details</Typography>
            <Typography variant="h6">Name: {name}</Typography>
            <Typography variant="h6">Address: {address}</Typography>
            <Typography variant="h6">Phone: {phone}</Typography>
            <Typography variant="h6">Email: {email}</Typography>
            <Typography variant="h6">Balance: ${balance}</Typography>
          </Paper>
        </Grid>

        {/* Tabs for History */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ padding: 3, boxShadow: 3 }}>
            <AppBar position="static" sx={{ bgcolor: '#f5f5f5', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                aria-label="user history tabs" 
                textColor="primary"
                indicatorColor="primary"
                sx={{
                  '& .MuiTab-root': {
                    fontWeight: 'bold',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#e0e0e0',
                    },
                  },
                  '& .Mui-selected': {
                    backgroundColor: '#b3e5fc',
                  },
                }}
              >
                <Tab label="Balance Add History" />
                <Tab label="Withdraw History" />
              </Tabs>
            </AppBar>

            {/* Tab Content */}
            {activeTab === 0 && (
              <>
                <Typography variant="h5" gutterBottom>Balance Add History</Typography>
                {balanceAddHistory && balanceAddHistory.length > 0 ? (
                  <DataGrid
                    rows={balanceAddHistory}
                    columns={balanceColumns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    checkboxSelection
                    sx={{
                      backgroundColor: 'white',
                      boxShadow: 2,
                      borderRadius: '8px',
                    }}
                  />
                ) : (
                  <Typography variant="h6" color="textSecondary">
                    No balance add history available.
                  </Typography>
                )}
              </>
            )}

            {activeTab === 1 && (
              <>
                <Typography variant="h5" gutterBottom>Withdraw History</Typography>
                {withdrawHistory && withdrawHistory.length > 0 ? (
                  <DataGrid
                    rows={withdrawHistory}
                    columns={withdrawColumns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    checkboxSelection
                    sx={{
                      backgroundColor: 'white',
                      boxShadow: 2,
                      borderRadius: '8px',
                    }}
                  />
                ) : (
                  <Typography variant="h6" color="textSecondary">
                    No withdraw history available.
                  </Typography>
                )}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar for Notifications */}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserDetail;
