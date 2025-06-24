import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  useTheme,
} from "@mui/material";
import { Header } from "../../../components";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { tokens } from "../../../theme";
import {
  getFeaturePermissionByUser,
  updateFeaturePermission,
} from "../../../api/controller/admin_controller/feature_permission_controller";
import { useParams } from "react-router-dom";

const UserFeaturePermission = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
   const userID = localStorage.getItem("userId");

  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await getFeaturePermissionByUser(userID);
      if (res.status === "success") {
        // Assign unique row id
        const featureRows = res.data.map((item, index) => ({
          id: item.feature_id,
          ...item,
        }));
        setFeatures(featureRows);
      } else {
        setError("Failed to fetch feature permissions");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = async (feature_id, currentState) => {
    const payload = {
      user_id: parseInt(userID),
      feature_id: feature_id,
      has_permission: !currentState,
    };

    const res = await updateFeaturePermission(payload);
    if (res.status === "success") {
      setFeatures((prev) =>
        prev.map((f) =>
          f.feature_id === feature_id
            ? { ...f, has_permission: !currentState }
            : f
        )
      );
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const columns = [
    {
      field: "feature_name",
      headerName: "Feature Name",
      flex: 1,
    },
    {
      field: "details",
      headerName: "Details",
      flex: 2,
    },
    {
      field: "is_active",
      headerName: "Active",
      type: "boolean",
      flex: 0.5,
    },
    {
      field: "has_permission",
      headerName: "Permission",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <FormControlLabel
          control={
       <Switch
  checked={!!params.row.has_permission}
  onChange={() => handleTogglePermission(
    params.row.feature_id,
    params.row.has_permission
  )}
/>
          }
          label={params.row.has_permission ? "Allowed" : "Blocked"}
        />
      ),
    },
  ];

  if (loading) return <Typography m={4}>Loading...</Typography>;
  if (error) return <Typography color="error" m={4}>{error}</Typography>;

  return (
    <Box m={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Header title="USER FEATURE PERMISSION" subtitle="Manage user feature access" />
      </Box>
      <Box
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
          rows={features}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default UserFeaturePermission;
