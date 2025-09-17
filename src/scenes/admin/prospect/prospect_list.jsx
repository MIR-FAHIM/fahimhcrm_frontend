// src/scenes/prospect/ProspectListPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  Tooltip,
  Chip,
  Link,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import dayjs from "dayjs";
import {
  Call,
  Message,
  LocationOn,
  Email,
  AssignmentTurnedIn,
} from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import opportunity from "../../../assets/images/opportunity.png";
import {
  fetchAllProspect,
  getAllProspectStageOverview,
} from "../../../api/controller/admin_controller/prospect_controller";

const ProspectListPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const brand = theme.palette.blueAccent?.main ?? theme.palette.info.main;
  const brandHover = theme.palette.blueAccent?.dark ?? brand;
  const brandContrast =
    theme.palette.blueAccent?.contrastText ??
    theme.palette.getContrastText(brand);

  const [prospects, setProspects] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const goProspectListStage = () => navigate("/prospect-list-by-stage");
  const handleAddProspect = () => navigate("/add-prospect");
  const handleViewProspectDetails = (id) => navigate(`/prospect-detail/${id}`);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, sRes] = await Promise.all([
          fetchAllProspect(),
          getAllProspectStageOverview(),
        ]);
        if (pRes?.status === "success") setProspects(pRes.data || []);
        else setError("Failed to fetch prospects");

        if (sRes?.status === "success") setStages(sRes.data || []);
        else setError((e) => e || "Failed to fetch stages");
      } catch {
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleStageFilter = (stageId) =>
    setSelectedStageId((prev) => (prev === stageId ? null : stageId));

  const filteredProspects = useMemo(() => {
    const base = selectedStageId
      ? prospects.filter((p) => p.stage_id === selectedStageId)
      : prospects;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (p) =>
        (p.prospect_name || "").toLowerCase().includes(q) ||
        (p.address || "").toLowerCase().includes(q) ||
        (p.website_link || "").toLowerCase().includes(q)
    );
  }, [prospects, selectedStageId, searchQuery]);

  // semantic colors for activity icons/chips
  const activityColor = {
    call: theme.palette.error.main,
    whatsapp: theme.palette.info.main,
    message: theme.palette.info.main,
    visit: theme.palette.primary.main,
    email: theme.palette.warning.main,
    task: theme.palette.success.main,
  };

  const columns = [
    {
      field: "id",
      headerName: "ID",
      flex: 0.4,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 1.25 }}>
          <Typography fontWeight={800} color="text.primary">
            {params.value}
          </Typography>
          {params.row.is_opportunity === 1 && (
            <Tooltip title="Qualified opportunity">
              <Box component="img" src={opportunity} alt="Opportunity" sx={{ height: 20, mt: 0.25 }} />
            </Tooltip>
          )}
        </Box>
      ),
    },
    {
      field: "prospectInfo",
      headerName: "Prospect",
      flex: 2,
      sortable: false,
      renderCell: (params) => {
        const url = params.row.website_link;
        const safeUrl = url && (url.startsWith("http") ? url : `https://${url}`);
        return (
          <Box sx={{ py: 1.25 }}>
            <Typography fontWeight={800} color="text.primary" noWrap>
              {params.row.prospect_name}
            </Typography>
            {params.row.address && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {params.row.address}
              </Typography>
            )}
            {safeUrl && (
              <Link
                href={safeUrl}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                variant="body2"
                sx={{ color: brand, display: "inline-block", maxWidth: 340, wordBreak: "break-all" }}
              >
                {url}
              </Link>
            )}
          </Box>
        );
      },
    },
    {
      field: "stage_name",
      headerName: "Stage",
      flex: 1.2,
      valueGetter: (params) => params.row.stage?.stage_name || "N/A",
      renderCell: (params) => {
        const bg = params.row.stage?.color_code || alpha(brand, 0.18);
        const fg = theme.palette.getContrastText(bg);
        return (
          <Chip
            label={params.value}
            size="small"
            sx={{
              bgcolor: bg,
              color: fg,
              fontWeight: 700,
            }}
          />
        );
      },
    },
    {
      field: "industry_source_zone",
      headerName: "Industry / Source / Zone / Product",
      flex: 2,
      sortable: false,
      renderCell: (params) => {
        const industry = params.row.industry_type?.industry_type_name || "N/A";
        const source = params.row.information_source?.information_source_name || "N/A";
        const zone = params.row.zone?.zone_name || "N/A";
        const product = params.row.interested_for?.product_name || "N/A";
        return (
          <Box display="grid" gap={0.25} sx={{ py: 1.25 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Industry:</strong> {industry}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Source:</strong> {source}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Zone:</strong> {zone}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Interested On:</strong> {product}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "concernPersons",
      headerName: "Contacts",
      flex: 1.8,
      sortable: false,
      renderCell: (params) => {
        const persons = params.row.concern_persons || [];
        const first = persons[0];
        const tooltip = (
          <Box>
            {persons.map((p, i) => (
              <Typography key={i} fontSize="0.95rem" py={0.25}>
                {p.person_name} ({p.mobile})
              </Typography>
            ))}
          </Box>
        );
        return (
          <Tooltip title={tooltip} placement="top-start" arrow enterDelay={300}>
            <Box sx={{ py: 1.25 }}>
              {first ? (
                <Typography fontWeight={700} sx={{ cursor: "pointer" }} color="text.primary" noWrap>
                  {first.person_name} ({first.mobile})
                  {persons.length > 1 && (
                    <Typography component="span" variant="caption" color="text.secondary" ml={1}>
                      +{persons.length - 1} more
                    </Typography>
                  )}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">No contact</Typography>
              )}
            </Box>
          </Tooltip>
        );
      },
    },
    {
      field: "followup_activity",
      headerName: "Activity",
      flex: 1.8,
      sortable: false,
      renderCell: (params) => {
        const { call = 0, whatsapp = 0, visit = 0, email = 0, task = 0 } =
          params.row.activity_summary || {};
        const items = [
          { icon: <Call sx={{ color: activityColor.call }} fontSize="small" />, label: call, tip: "Calls" },
          { icon: <Message sx={{ color: activityColor.whatsapp }} fontSize="small" />, label: whatsapp, tip: "Messages" },
          { icon: <LocationOn sx={{ color: activityColor.visit }} fontSize="small" />, label: visit, tip: "Visits" },
          { icon: <Email sx={{ color: activityColor.email }} fontSize="small" />, label: email, tip: "Emails" },
          { icon: <AssignmentTurnedIn sx={{ color: activityColor.task }} fontSize="small" />, label: task, tip: "Tasks" },
        ];
        return (
          <Box display="flex" gap={1} sx={{ py: 1.25, flexWrap: "wrap" }}>
            {items.map((it, i) => (
              <Tooltip key={i} title={`${it.tip}: ${it.label}`}>
                <Chip
                  icon={it.icon}
                  label={it.label}
                  size="small"
                  sx={{
                    bgcolor: alpha(
                      // pick the icon color safely
                      (it.icon.props.sx && it.icon.props.sx.color) || theme.palette.text.secondary,
                      0.12
                    ),
                    "& .MuiChip-icon": {
                      // icon already colored
                    },
                    fontWeight: 700,
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        );
      },
    },
    {
      field: "activity_date",
      headerName: "Dates",
      flex: 1.4,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ py: 1.25 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Last:</strong>{" "}
            {params.row.last_activity ? dayjs(params.row.last_activity).format("MMM D, YYYY") : "N/A"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Next:</strong>{" "}
            {params.row.next_activity ? dayjs(params.row.next_activity).format("MMM D, YYYY") : "N/A"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "view_details",
      headerName: "Actions",
      flex: 0.9,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="contained"
          onClick={() => handleViewProspectDetails(params.row.id)}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 800,
            px: 1.75,
            bgcolor: brand,
            color: brandContrast,
            "&:hover": { bgcolor: brandHover },
          }}
        >
          View
        </Button>
      ),
    },
  ];

  if (loading)
    return (
      <Typography variant="h6" color="primary" sx={{ px: 3, py: 2 }}>
        Loading…
      </Typography>
    );
  if (error)
    return (
      <Typography variant="h6" color="error" sx={{ px: 3, py: 2 }}>
        {error}
      </Typography>
    );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      {/* Header actions */}
      <Box display="flex" alignItems="center" flexWrap="wrap" gap={1.5} mb={3}>
        <Typography variant="h5" fontWeight={800} color="text.primary">
          Leads
        </Typography>

        <TextField
          size="small"
          placeholder="Search all prospects"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            width: 280,
            ml: 1,
            "& .MuiOutlinedInput-root": { bgcolor: theme.palette.background.paper },
          }}
        />

        <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            onClick={handleAddProspect}
            sx={{ bgcolor: brand, color: brandContrast, "&:hover": { bgcolor: brandHover } }}
          >
            Add Prospect
          </Button>
          <Button
            variant="outlined"
            onClick={() => window.location.reload()}
            sx={{
              borderColor: brand,
              color: brand,
              "&:hover": { bgcolor: alpha(brand, 0.12), borderColor: brand },
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            onClick={goProspectListStage}
            sx={{ bgcolor: brand, color: brandContrast, "&:hover": { bgcolor: brandHover } }}
          >
            Stage View
          </Button>
        </Box>
      </Box>

      {/* Stage filter strip */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <Box display="flex" gap={1} overflow="auto">
          {stages.map((s) => {
            const isSelected = selectedStageId === s.id;
            const chipBg = s.color_code || alpha(brand, 0.16);
            const chipFg = theme.palette.getContrastText(chipBg);
            return (
              <Chip
                key={s.id}
                label={`${s.stage_name} • ${s.prospects_count}`}
                onClick={() => handleStageFilter(s.id)}
                clickable
                sx={{
                  bgcolor: isSelected ? alpha(brand, 0.2) : chipBg,
                  color: isSelected ? brand : chipFg,
                  fontWeight: 700,
                  borderRadius: 2,
                  border: `1px solid ${isSelected ? brand : alpha(chipFg, 0.25)}`,
                }}
              />
            );
          })}
        </Box>
      </Paper>

      {/* DataGrid */}
      <Box
        sx={{
          height: "75vh",
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: theme.shadows[2],
          "& .MuiDataGrid-root": {
            border: "none",
            bgcolor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
          "& .MuiDataGrid-columnHeaders": {
            bgcolor: alpha(brand, 0.10),
            color: theme.palette.text.primary,
            borderBottom: `1px solid ${theme.palette.divider}`,
            fontWeight: 800,
          },
          "& .MuiDataGrid-cell": {
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
          "& .MuiDataGrid-footerContainer": {
            bgcolor: alpha(brand, 0.10),
            borderTop: `1px solid ${theme.palette.divider}`,
          },
          "& .MuiDataGrid-toolbarContainer": {
            p: 1,
            "& .MuiButton-text": { color: theme.palette.text.primary },
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor:
              theme.palette.action?.hover || alpha(theme.palette.text.primary, 0.04),
          },
          "& .MuiDataGrid-row.Mui-selected": {
            backgroundColor:
              theme.palette.action?.selected || alpha(brand, 0.12),
          },
        }}
      >
        <DataGrid
          rows={filteredProspects}
          columns={columns}
          getRowId={(row) => row.id}
          checkboxSelection
          disableRowSelectionOnClick
          components={{ Toolbar: GridToolbar }}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
        />
      </Box>
    </Box>
  );
};

export default ProspectListPage;
