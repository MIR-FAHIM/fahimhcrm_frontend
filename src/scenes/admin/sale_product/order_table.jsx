import { Box, Button, Typography, useTheme } from "@mui/material";
import { Header } from "../../../components";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../../theme";
import { getOrder } from "../../../api/controller/admin_controller/order_controller";

const OrderList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleViewDetails = (id) => {
    navigate(`/employee-profile/${id}`);
  };

  const handleAddEmployee = () => {
    navigate("/pos-page");
  };

  useEffect(() => {
    getOrder()
      .then((response) => {
        if (response.status === "success") {
          setEmployees(response.data);
        } else {
          setError("Failed to fetch employees");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error fetching data");
        setLoading(false);
      });
  }, []);

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5, headerAlign: "center", align: "center" },
    { field: "customer_id", headerName: "Name", flex: 1 },
    { field: "phone", headerName: "Phone", flex: 1 },
    { field: "amount", headerName: "Amount", flex: 1 },
    // { field: "designation", headerName: "Designation", flex: 1, valueGetter: (params) => params.row.designation?.designation_name || "-" },

    { field: "status", headerName: "Status", flex: 1, valueGetter: (params) => params.row.role?.role_name || "-" },
    { field: "isPaid", headerName: "Paid", flex: 0.5, type: "boolean", headerAlign: "center", align: "center" },
    {
      field: "view_details",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          sx={{ borderRadius: "20px", textTransform: "none", fontSize: "14px", fontWeight: "bold" }}
          onClick={() => handleViewDetails(params.row.id)}
        >
          View Details
        </Button>
      ),
    },
  ];

  if (loading) return <Typography variant="h6" color="primary">Loading...</Typography>;
  if (error) return <Typography variant="h6" color="error">{error}</Typography>;

  return (
    <Box m={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Header title="EMPLOYEES" subtitle="Manage and view employees" />
        <Button
          variant="contained"
          color="secondary"
          sx={{ padding: "10px 20px", borderRadius: "25px", fontSize: "14px", fontWeight: "bold" }}
          onClick={handleAddEmployee}
        >
          + POS Manager
        </Button>
      </Box>
      <Box
        mt={3}
        height="75vh"
        sx={{
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow: 2,
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "1px solid rgba(224, 224, 224, 1)" },
          "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.gray[10], fontSize: "16px", fontWeight: "bold" },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
          "& .MuiDataGrid-footerContainer": { backgroundColor: colors.gray[10], borderTop: "1px solid rgba(224, 224, 224, 1)" },
          "& .MuiCheckbox-root": { color: `${colors.greenAccent[200]} !important` },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": { color: `${colors.gray[100]} !important` },
        }}
      >
        <DataGrid
          rows={employees}
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

export default OrderList;