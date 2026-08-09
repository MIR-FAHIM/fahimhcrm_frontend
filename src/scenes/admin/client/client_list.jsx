import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import {
  BusinessCenterRounded,
  OpenInNewRounded,
  SearchRounded,
  SourceRounded,
  TrendingUpRounded,
  VerifiedRounded,
} from "@mui/icons-material";
import { fetchClients } from "../../../api/controller/admin_controller/client_controller";

const isActiveValue = (value) => value === true || value === 1 || value === "1";

const getProspect = (client) => client?.prospect || {};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "CL";

const StatCard = ({ icon, label, value, tone = "primary" }) => {
  const theme = useTheme();
  const color = theme.palette[tone]?.main || theme.palette.primary.main;
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.75,
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        minHeight: 96,
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Avatar
          variant="rounded"
          sx={{
            width: 40,
            height: 40,
            bgcolor: alpha(color, 0.12),
            color,
          }}
        >
          {icon}
        </Avatar>
        <Box minWidth={0}>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
            {label}
          </Typography>
          <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 700, lineHeight: 1.05 }}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

const ClientList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;
  const brandDark = theme.palette.blueAccent?.dark ?? theme.palette.primary.dark;
  const brandContrast = theme.palette.blueAccent?.contrastText ?? theme.palette.primary.contrastText;

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  const handleViewDetails = (id) => {
    navigate(`/client-details/${id}`);
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetchClients()
      .then((response) => {
        if (!mounted) return;
        if (response?.status === "success") {
          setClients(Array.isArray(response.data) ? response.data : []);
        } else {
          setError(response?.message || "Failed to fetch clients.");
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || "Error fetching clients.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredClients = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return clients;

    return clients.filter((client) => {
      const prospect = getProspect(client);
      return [
        client.id,
        prospect.prospect_name,
        prospect.address,
        prospect.industry_type?.industry_type_name,
        prospect.information_source?.information_source_name,
        prospect.website_link,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [clients, query]);

  const stats = useMemo(() => {
    const active = clients.filter((client) => isActiveValue(client.isActive ?? client.is_active)).length;
    const industries = new Set(
      clients.map((client) => getProspect(client).industry_type?.industry_type_name).filter(Boolean)
    ).size;
    const sources = new Set(
      clients.map((client) => getProspect(client).information_source?.information_source_name).filter(Boolean)
    ).size;

    return { active, industries, sources };
  }, [clients]);

  const columns = useMemo(
    () => [
      {
        field: "id",
        headerName: "ID",
        width: 90,
        headerAlign: "center",
        align: "center",
        renderCell: (params) => (
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
            #{params.row.id}
          </Typography>
        ),
      },
      {
        field: "prospect_name",
        headerName: "Client",
        flex: 1.8,
        minWidth: 240,
        valueGetter: (params) => getProspect(params.row).prospect_name || "",
        renderCell: (params) => {
          const prospect = getProspect(params.row);
          const name = prospect.prospect_name || "Unnamed Client";
          return (
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: alpha(brand, 0.14),
                  color: brand,
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {getInitials(name)}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography noWrap sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
                  {name}
                </Typography>
                <Typography noWrap variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  {prospect.address || prospect.website_link || "No address added"}
                </Typography>
              </Box>
            </Stack>
          );
        },
      },
      {
        field: "industry_type",
        headerName: "Industry",
        flex: 1.1,
        minWidth: 170,
        valueGetter: (params) => getProspect(params.row).industry_type?.industry_type_name || "",
        renderCell: (params) => (
          <Chip
            size="small"
            icon={<BusinessCenterRounded />}
            label={getProspect(params.row).industry_type?.industry_type_name || "Not set"}
            variant="outlined"
            sx={{ fontWeight: 650, maxWidth: "100%" }}
          />
        ),
      },
      {
        field: "information_source_name",
        headerName: "Source",
        flex: 1.1,
        minWidth: 170,
        valueGetter: (params) => getProspect(params.row).information_source?.information_source_name || "",
        renderCell: (params) => (
          <Chip
            size="small"
            icon={<SourceRounded />}
            label={getProspect(params.row).information_source?.information_source_name || "Not set"}
            sx={{
              fontWeight: 650,
              bgcolor: alpha(theme.palette.success.main, 0.10),
              color: theme.palette.success.main,
              maxWidth: "100%",
            }}
          />
        ),
      },
      {
        field: "isActive",
        headerName: "Status",
        width: 130,
        headerAlign: "center",
        align: "center",
        valueGetter: (params) => isActiveValue(params.row.isActive ?? params.row.is_active),
        renderCell: (params) => {
          const active = isActiveValue(params.row.isActive ?? params.row.is_active);
          return (
            <Chip
              size="small"
              label={active ? "Active" : "Inactive"}
              color={active ? "success" : "default"}
              variant={active ? "filled" : "outlined"}
              sx={{ fontWeight: 700 }}
            />
          );
        },
      },
      {
        field: "view_details",
        headerName: "Actions",
        width: 150,
        sortable: false,
        filterable: false,
        align: "right",
        headerAlign: "right",
        renderCell: (params) => (
          <Button
            variant="contained"
            size="small"
            endIcon={<OpenInNewRounded />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              bgcolor: brand,
              color: brandContrast,
              "&:hover": { bgcolor: brandDark },
            }}
            onClick={() => handleViewDetails(params.row.id)}
          >
            Details
          </Button>
        ),
      },
    ],
    [brand, brandContrast, brandDark, theme]
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Avatar variant="rounded" sx={{ bgcolor: alpha(brand, 0.12), color: brand }}>
            <VerifiedRounded />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 700, lineHeight: 1 }}>
              Clients
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Review converted prospects, industries, sources, and client details.
            </Typography>
          </Box>
        </Stack>

        <TextField
          size="small"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search clients"
          sx={{
            minWidth: { xs: "100%", md: 320 },
            "& .MuiOutlinedInput-root": { bgcolor: theme.palette.background.paper },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <StatCard icon={<VerifiedRounded />} label="Total Clients" value={clients.length} />
        <StatCard icon={<TrendingUpRounded />} label="Active Clients" value={stats.active} tone="success" />
        <StatCard icon={<BusinessCenterRounded />} label="Industries" value={stats.industries} tone="info" />
        <StatCard icon={<SourceRounded />} label="Sources" value={stats.sources} tone="warning" />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          height: "72vh",
          minHeight: 520,
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <DataGrid
          rows={filteredClients}
          columns={columns}
          loading={loading}
          slots={{ toolbar: GridToolbar }}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          sx={{
            border: "none",
            color: theme.palette.text.primary,
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: alpha(brand, theme.palette.mode === "dark" ? 0.18 : 0.08),
              color: theme.palette.text.primary,
              borderBottom: `1px solid ${theme.palette.divider}`,
            },
            "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700 },
            "& .MuiDataGrid-cell": {
              borderBottom: `1px solid ${theme.palette.divider}`,
              outline: "none !important",
            },
            "& .MuiDataGrid-row": {
              bgcolor: theme.palette.background.paper,
              "&:hover": { bgcolor: alpha(brand, theme.palette.mode === "dark" ? 0.16 : 0.06) },
            },
            "& .MuiDataGrid-row.Mui-selected": {
              bgcolor: `${alpha(brand, theme.palette.mode === "dark" ? 0.22 : 0.10)} !important`,
            },
            "& .MuiDataGrid-virtualScroller": {
              bgcolor: theme.palette.background.paper,
            },
            "& .MuiDataGrid-footerContainer": {
              bgcolor: theme.palette.background.paper,
              borderTop: `1px solid ${theme.palette.divider}`,
            },
            "& .MuiDataGrid-toolbarContainer": {
              p: 1.25,
              borderBottom: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.paper,
            },
            "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
              color: `${brand} !important`,
              fontWeight: 650,
            },
            "& .MuiTablePagination-root, & .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
              color: theme.palette.text.secondary,
            },
            "& .MuiDataGrid-overlay": {
              bgcolor: alpha(theme.palette.background.paper, 0.92),
            },
          }}
          localeText={{
            noRowsLabel: loading ? "Loading clients..." : "No clients found",
            toolbarQuickFilterPlaceholder: "Search table",
          }}
        />
      </Paper>
    </Box>
  );
};

export default ClientList;
