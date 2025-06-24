import { Box, Button, Typography, useTheme } from "@mui/material";
import { Header } from "../../../components";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../../theme";
import { getQuotationByProspect } from "../../../api/controller/admin_controller/opportunity_controller";

const QuotationByProspect = ({ prosID }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleViewDetails = (id) => {
    navigate(`/quotation-detail/${id}`);
  };

  const handleAddQuotation = () => {
    navigate(`/create-quotation/${prosID}`);
  };

  useEffect(() => {
    getQuotationByProspect(prosID)
      .then((response) => {
        if (response.status === "success") {
          setQuotations(response.data);
        } else {
          setError("Failed to fetch quotations");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error fetching data");
        setLoading(false);
      });
  }, [prosID]);

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5, headerAlign: "center", align: "center" },
    { field: "prospect_id", headerName: "Prospect ID", flex: .5 },
    { field: "reference_no", headerName: "Reference No", flex: .5 },
    { field: "total_amount", headerName: "Total Amount", flex: .5 },
    {
      field: "pricingDetails",
      headerName: "Pricing Details",
      flex: .5,
      renderCell: (params) => (
        <Box>
          <Typography>Quantity: {params.row.quantity}</Typography>
          <Typography>Unit Price: {params.row.unit_price}</Typography>
          <Typography>Tax: {params.row.tax}</Typography>
          <Typography>Discount: {params.row.discount}</Typography>
        </Box>
      ),
    },
    { field: "status", headerName: "Status", flex: .5 },
   
    {
      field: "view_details",
      headerName: "Actions",
      flex: .5,
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
        <Header title="Quotation" subtitle="Manage quotations" />
        <Button
          variant="contained"
          color="secondary"
          sx={{ padding: "10px 20px", borderRadius: "25px", fontSize: "14px", fontWeight: "bold" }}
          onClick={handleAddQuotation}
        >
          Add Quoation +
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
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid rgba(224, 224, 224, 1)",
            minHeight: "100px", // Increase cell height
            display: "flex",
            alignItems: "center",
          },
          "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.gray[10], fontSize: "16px", fontWeight: "bold" },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
          "& .MuiDataGrid-footerContainer": { backgroundColor: colors.gray[10], borderTop: "1px solid rgba(224, 224, 224, 1)" },
          "& .MuiCheckbox-root": { color: `${colors.greenAccent[200]} !important` },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": { color: `${colors.gray[100]} !important` },
        }}
      >
        <DataGrid
          rows={quotations}
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
          getRowHeight={() => 120}
        />
      </Box>
    </Box>
  );
};

export default QuotationByProspect;
