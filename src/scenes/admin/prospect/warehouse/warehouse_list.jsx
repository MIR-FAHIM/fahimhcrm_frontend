// src/scenes/warehouse/WarehouseList.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  Tooltip,
  Chip,
  IconButton,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import RoomIcon from "@mui/icons-material/Room";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { Header } from "../../../../components";
import { fetchAllWarehouse } from "../../../../api/controller/admin_controller/prospect_controller";

const NoRows = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 1,
        bgcolor: "transparent",
        p: 2,
      }}
    >
      <RoomIcon sx={{ fontSize: 40, color: theme.palette.text.secondary }} />
      <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 800 }}>
        No Warehouses Found
      </Typography>
      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
        Add a warehouse to get started, or adjust your filters.
      </Typography>
    </Box>
  );
};

const WarehouseList = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Brand accents from theme
  const brand = theme.palette.blueAccent.main;
  const brandHover = theme.palette.blueAccent.dark || brand;
  const brandContrast = theme.palette.blueAccent.contrastText || theme.palette.getContrastText(brand);

  const textPri = theme.palette.text.primary;
  const textSec = theme.palette.text.secondary;
  const paper = theme.palette.background.paper;
  const divider = theme.palette.divider;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleAddWarehouse = () => navigate("/add-warehouse");
  const handleViewDetails = (id) => navigate(`/warehouse-details/${id}`);
  const handleOpenMap = (lat, lng) => {
    if (lat && lng) navigate(`/google-map?lat=${lat}&lng=${lng}`);
  };

  const reload = async () => {
    setLoading(true);
    try {
      const res = await fetchAllWarehouse();
      setRows(res?.status === "success" ? res.data ?? [] : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const columns = useMemo(
    () => [
      {
        field: "id",
        headerName: "ID",
        flex: 0.5,
        headerAlign: "center",
        align: "center",
        minWidth: 80,
      },
      {
        field: "prospect_name",
        headerName: "Name",
        flex: 1.1,
        minWidth: 160,
        renderCell: (params) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
            <RoomIcon sx={{ fontSize: 18, color: brand }} />
            <Tooltip title={params.value || "—"} arrow enterDelay={400}>
              <Typography
                variant="body2"
                sx={{
                  color: textPri,
                  fontWeight: 700,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {params.value || "—"}
              </Typography>
            </Tooltip>
          </Box>
        ),
      },
      {
        field: "address",
        headerName: "Address",
        flex: 1.6,
        minWidth: 240,
        renderCell: (params) => {
          const value = params.value || "—";
          return (
            <Tooltip title={value} arrow enterDelay={400}>
              <Typography
                variant="body2"
                sx={{
                  color: textSec,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  width: "100%",
                }}
              >
                {value}
              </Typography>
            </Tooltip>
          );
        },
      },
      {
        field: "latitude",
        headerName: "Lat",
        flex: 0.7,
        minWidth: 120,
        renderCell: (params) => {
          const lat = params.row.latitude;
          return lat ? (
            <Chip
              size="small"
              label={Number(lat).toFixed(5)}
              sx={{
                bgcolor: alpha(brand, 0.1),
                color: brand,
                fontWeight: 700,
                border: `1px solid ${alpha(brand, 0.3)}`,
              }}
            />
          ) : (
            <Typography variant="body2" sx={{ color: textSec }}>—</Typography>
          );
        },
      },
      {
        field: "longitude",
        headerName: "Lng",
        flex: 0.7,
        minWidth: 120,
        renderCell: (params) => {
          const lng = params.row.longitude;
          return lng ? (
            <Chip
              size="small"
              label={Number(lng).toFixed(5)}
              sx={{
                bgcolor: alpha(brand, 0.1),
                color: brand,
                fontWeight: 700,
                border: `1px solid ${alpha(brand, 0.3)}`,
              }}
            />
          ) : (
            <Typography variant="body2" sx={{ color: textSec }}>—</Typography>
          );
        },
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 1,
        minWidth: 200,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const { id, latitude, longitude } = params.row;
          const hasCoords = !!latitude && !!longitude;
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tooltip title="Open details" arrow>
                <Button
                  size="small"
                  variant="contained"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(id);
                  }}
                  startIcon={<OpenInNewIcon />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 800,
                    borderRadius: 2,
                    bgcolor: brand,
                    color: brandContrast,
                    "&:hover": { bgcolor: brandHover },
                  }}
                >
                  Details
                </Button>
              </Tooltip>
              <Tooltip title={hasCoords ? "View on map" : "No coordinates"} arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenMap(latitude, longitude);
                    }}
                    disabled={!hasCoords}
                    sx={{
                      borderRadius: 2,
                      bgcolor: hasCoords ? alpha(brand, 0.1) : "transparent",
                      border: `1px solid ${hasCoords ? alpha(brand, 0.3) : divider}`,
                      "&:hover": { bgcolor: hasCoords ? alpha(brand, 0.2) : "transparent" },
                    }}
                  >
                    <MyLocationIcon
                      sx={{
                        fontSize: 18,
                        color: hasCoords ? brand : textSec,
                      }}
                    />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          );
        },
      },
    ],
    [brand, brandContrast, brandHover, divider, textPri, textSec]
  );

  const onRowClick = useCallback((params) => handleViewDetails(params.id), []);

  return (
    <Box sx={{ p: 4, bgcolor: theme.palette.background.default }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Header title="Warehouses" subtitle="Manage and view warehouse locations" />
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={reload}
            sx={{
              textTransform: "none",
              fontWeight: 800,
              borderRadius: 2,
              borderColor: brand,
              color: brand,
              "&:hover": { bgcolor: alpha(brand, 0.1), borderColor: brand },
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddLocationAltIcon />}
            onClick={handleAddWarehouse}
            sx={{
              textTransform: "none",
              fontWeight: 800,
              borderRadius: 2,
              bgcolor: brand,
              color: brandContrast,
              "&:hover": { bgcolor: brandHover },
            }}
          >
            Add Warehouse
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          height: "75vh",
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: 2,
          "& .MuiDataGrid-root": {
            border: "none",
            bgcolor: paper,
          },
          "& .MuiDataGrid-cell": {
            borderBottom: `1px solid ${divider}`,
            color: textPri,
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: alpha(brand, 0.12),
            color: textPri,
            fontSize: 14,
            fontWeight: 800,
            borderBottom: `1px solid ${divider}`,
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: alpha(brand, 0.06),
            borderTop: `1px solid ${divider}`,
          },
          "& .MuiDataGrid-toolbarContainer": {
            p: 1,
            gap: 1,
            "& .MuiButton-text": {
              color: textPri,
              textTransform: "none",
              fontWeight: 600,
            },
          },
          "& .MuiInputBase-root": {
            bgcolor: theme.palette.background.default,
            color: textPri,
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: theme.palette.action.hover,
          },
        }}
      >
        <DataGrid
          getRowId={(row) => row.id}
          rows={rows}
          columns={columns}
          loading={loading}
          components={{
            Toolbar: GridToolbar,
            NoRowsOverlay: NoRows,
            NoResultsOverlay: NoRows,
          }}
          componentsProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 300 },
              csvOptions: { fileName: "warehouses" },
              printOptions: { disableToolbarButton: true },
            },
          }}
          disableRowSelectionOnClick
          onRowClick={onRowClick}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
            columns: {
              columnVisibilityModel: {
                latitude: true,
                longitude: true,
                address: true,
              },
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default WarehouseList;
