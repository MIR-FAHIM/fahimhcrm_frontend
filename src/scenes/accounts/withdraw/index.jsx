import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme, Button } from "@mui/material";
import { Header } from "../../../components";
import { DataGrid } from "@mui/x-data-grid";
import { fetchAllWithdraw, markPaidWithdraw } from "../../../api/controller/withdraw_controller";
import { tokens } from "../../../theme";
import { useSnackbar } from "notistack"; // Optional for showing success/error messages

const Withdraws = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { enqueueSnackbar } = useSnackbar(); // For showing notifications
  const [withdraws, setWithdraws] = useState([]); // Store the withdrawals data
  const [loading, setLoading] = useState(true);

  // Fetch all withdrawals from the API
  const getWithdrawals = async () => {
    try {
      const data = await fetchAllWithdraw();
      setWithdraws(data.data); // Set the fetched withdrawals data
      setLoading(false); // Stop loading once the data is fetched
    } catch (error) {
      enqueueSnackbar("Failed to fetch withdrawal data", { variant: "error" });
      setLoading(false); // Stop loading on error
    }
  };

  // Mark withdrawal as paid
  const handleMarkPaid = async (id) => {
    try {
      await markPaidWithdraw(id); // Call API to mark as paid
      enqueueSnackbar("Withdrawal marked as paid", { variant: "success" });
      getWithdrawals(); // Re-fetch withdrawals after the update
    } catch (error) {
      enqueueSnackbar("Failed to mark withdrawal as paid", { variant: "error" });
    }
  };

  // Columns for DataGrid
  const columns = [
    { field: "id", headerName: "ID" },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "phone",
      headerName: "Phone Number",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "withdraw_amount",
      headerName: "Withdraw Amount",
      flex: 1,
      renderCell: (params) => (
        <Typography color={colors.black}>
          ${params.row.withdraw_amount}
        </Typography>
      ),
    },
    {
      field: "payment_method",
      headerName: "Payment Method",
      flex: 1,
    },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
    },
    {
      field: "isPaid",
      headerName: "Paid",
      flex: 1,
      renderCell: (params) => (
        <Button
          onClick={() => handleMarkPaid(params.row.id)}
          variant="contained"
          color={params.row.isPaid ? "success" : "warning"}
          disabled={params.row.isPaid}
        >
          {params.row.isPaid ? "Paid" : "Mark as Paid"}
        </Button>
      ),
    },
  ];

  // Fetch the withdrawal data on component mount
  useEffect(() => {
    getWithdrawals();
  }, []);

  return (
    <Box m="20px">
      <Header title="WITHDRAWALS" subtitle="List of Withdrawal Requests" />
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
        }}
      >
        <DataGrid
          rows={withdraws}
          columns={columns}
          loading={loading}
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

export default Withdraws;
