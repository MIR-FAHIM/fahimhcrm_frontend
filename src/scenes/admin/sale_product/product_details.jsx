import { Box, Button, Typography, useTheme } from "@mui/material";
import { Header } from "../../../components";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useNavigate , useParams} from "react-router-dom";
import { tokens } from "../../../theme";
import { getProductWithVariants } from "../../../api/controller/admin_controller/product_controller";

const ProductDetailVariant = () => {
  const theme = useTheme();
  const {id} = useParams();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();


  const [variants, setVariant] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleViewDetails = (id) => {
    navigate(`/client-details/${id}`);
  };

  const handleAddProduct = () => {
    navigate("/product-entry");
  };

  useEffect(() => {
    getProductWithVariants(id)
      .then((response) => {
        if (response.status === "success") {
          setVariant(response.data);
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
    { field: "product_id", headerName: "Name", flex: 2 , valueGetter: (params) => params.row.product?.product_name || "", },
    { field: "type", headerName: "Type", flex: 2 ,},
    { field: "product_code", headerName: "Code", flex: 1 ,},
    { field: "quantity_required", headerName: "Quantity", flex: 2 , },
    { field: "stock_id", headerName: "Stock", flex: 2 , },
    { field: "price", headerName: "Price", flex: 2 , },
    { field: "unit", headerName: "Unit", flex: 2 , },
    { field: "entry_by", headerName: "Entried By", flex: 2 ,  valueGetter: (params) => params.row.entry_by?.name || "",},
   
    { field: "is_active", headerName: "Active", flex: 1, type: "boolean", headerAlign: "center", align: "center" },
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
          Start Sell
        </Button>
      ),
    },
  ];

  if (loading) return <Typography variant="h6" color="primary">Loading...</Typography>;
  if (error) return <Typography variant="h6" color="error">{error}</Typography>;

  return (
    <Box m={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Header title= {variants[0].product.product_name} subtitle="Manage and view variants" />
       <Button
    variant="contained"
    color="secondary"
    onClick={() => {
     handleAddProduct();
    }}
  >
    Add Product
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
          rows={variants}
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

export default ProductDetailVariant;