import { Box, Button, Typography, useTheme } from "@mui/material";
import { Header } from "../../../../components";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../../../theme";
import { fetchAllWarehouse } from "../../../../api/controller/admin_controller/prospect_controller";

const WarehouseList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleViewDetails = (id) => {
    navigate(`/employee-profile/${id}`);
  };

  const handleAddWarehouse = () => {
     navigate("/add-warehouse");
  };

  useEffect(() => {
    fetchAllWarehouse()
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
    { field: "prospect_name", headerName: "Name", flex: 1 },
    { field: "address", headerName: "Address", flex: 1 },
    { field: "latitude", headerName: "Latitude", flex: 1 },
    { field: "longitude", headerName: "Longitude", flex: 1 },

  ];

  if (loading) return <Typography variant="h6" color="primary">Loading...</Typography>;
  if (error) return <Typography variant="h6" color="error">{error}</Typography>;

  return (
    <Box m={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Header title="Warehouses" subtitle="Manage and view warehouses" />
        <Button
          variant="contained"
          color="secondary"
          sx={{ padding: "10px 20px", borderRadius: "25px", fontSize: "14px", fontWeight: "bold" }}
          onClick={handleAddWarehouse}
        >
          + Add Warehouse
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
                pageSize: 30,
              },
            },
          }}
          checkboxSelection
        />
      </Box>
    </Box>
  );
};

export default WarehouseList;