// src/scenes/lead/ContactUsLead.jsx
import { Box, Button, Typography, useTheme, Paper, useMediaQuery, Checkbox } from "@mui/material";
import { Header } from "../../../components";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getContactUsLeads,
} from "../../../api/controller/admin_controller/user_controller";
import {
  convertToPrsspect,
  convertContactRowStatusMultiple,
} from "../../../api/controller/admin_controller/prospect_controller";

const ContactUsLead = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const brand = theme.palette.blueAccent?.main ?? theme.palette.info.main;
  const brandHover = theme.palette.blueAccent?.dark ?? brand;
  const brandContrast =
    theme.palette.blueAccent?.contrastText ??
    theme.palette.getContrastText(brand);

  const bg = theme.palette.background.default;
  const paper = theme.palette.background.paper;
  const divider = theme.palette.divider;
  const textPri = theme.palette.text.primary;
  const textSec = theme.palette.text.secondary;

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    getContactList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getContactList = async () => {
    try {
      const response = await getContactUsLeads();
      if (response.status === "success") {
        setLeads(response.data || []);
      } else {
        setError("Failed to fetch contact us leads");
      }
    } catch {
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionModelChange = (newSelectionModel) => {
    // DataGrid gives an array of selected row IDs
    setSelectedRows(newSelectionModel);
  };

  const toggleRowSelection = (rowId) => {
    setSelectedRows((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]
    );
  };

  const handleConvertToProspect = async () => {
    const selectedLeads = leads.filter((lead) => selectedRows.includes(lead.id));

    const payload = selectedLeads.map((lead) => ({
      prospect_name: lead.person_name,
      is_individual: true,
      industry_type_id: 2,
      interested_for_id: 1,
      information_source_id: 3,
      stage_id: 1,
      priority_id: 2,
      status: 1,
      is_active: 1,
      website_link: "https://example.com",
      facebook_page: "https://facebook.com/ridoyfahim",
      linkedin: "https://linkedin.com/in/fahimridoy",
      zone_id: 5,
      latitude: 23.810331,
      longitude: 90.412521,
      address: "Dhaka, Bangladesh",
      note: "Prospect Added from Facebook lead form",
    }));

    try {
      await convertToPrsspect(payload);
      await convertContactRowStatusMultiple({ ids: selectedRows });
      await getContactList();
    } catch (e) {
      console.error("Conversion failed", e);
    }
  };

  const columns = useMemo(
    () => [
      {
        field: "id",
        headerName: "ID",
        flex: 0.5,
        headerAlign: "center",
        align: "center",
      },
      { field: "person_name", headerName: "Name", flex: 1 },
      { field: "email", headerName: "Email", flex: 1 },
      { field: "mobile", headerName: "Mobile", flex: 1 },
      { field: "type", headerName: "Type", flex: 1.5 },
      { field: "query", headerName: "Query", flex: 2 },
    ],
    []
  );

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
    <Box sx={{ m: { xs: 2, md: 4 } }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        flexDirection={{ xs: "column", sm: "row" }}
        gap={2}
        mb={2}
      >
        <Header
          title="Contact Form LEADS"
          subtitle="Manage and view Contact Form leads"
        />

        <Button
          variant="contained"
          onClick={handleConvertToProspect}
          disabled={selectedRows.length === 0}
          sx={{
            bgcolor: brand,
            color: brandContrast,
            width: { xs: "100%", sm: "auto" },
            "&:hover": { bgcolor: brandHover },
          }}
        >
          Convert Selected to Prospect
        </Button>
      </Box>

      {isMobile ? (
        <Box display="flex" flexDirection="column" gap={2} mt={2}>
          {leads.length > 0 ? (
            leads.map((lead) => (
              <Paper
                key={lead.id}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: paper,
                  border: `1px solid ${divider}`,
                  boxShadow: theme.shadows[1],
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1.5}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} color={textPri}>
                      {lead.person_name || "Unknown"}
                    </Typography>
                    <Typography variant="caption" color={textSec}>
                      ID: {lead.id}
                    </Typography>
                  </Box>
                  <Checkbox
                    checked={selectedRows.includes(lead.id)}
                    onChange={() => toggleRowSelection(lead.id)}
                    sx={{ color: `${theme.palette.success.main} !important` }}
                  />
                </Box>

                <Box sx={{ mt: 1, borderTop: `1px solid ${divider}` }} />

                <Box mt={1.5} display="grid" gridTemplateColumns="1fr 1fr" gap={1.5}>
                  <Box>
                    <Typography variant="caption" color={textSec}>
                      Email
                    </Typography>
                    <Typography variant="body2" color={textPri}>
                      {lead.email || "—"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color={textSec}>
                      Mobile
                    </Typography>
                    <Typography variant="body2" color={textPri}>
                      {lead.mobile || "—"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color={textSec}>
                      Type
                    </Typography>
                    <Typography variant="body2" color={textPri}>
                      {lead.type || "—"}
                    </Typography>
                  </Box>
                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <Typography variant="caption" color={textSec}>
                      Query
                    </Typography>
                    <Typography variant="body2" color={textPri}>
                      {lead.query || "—"}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: paper,
                border: `1px solid ${divider}`,
                textAlign: "center",
              }}
            >
              <Typography sx={{ color: textSec }}>No leads found.</Typography>
            </Paper>
          )}
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{
            mt: 3,
            height: "75vh",
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: paper,
            border: `1px solid ${divider}`,
            boxShadow: theme.shadows[2],
            // DataGrid theming mapped to your palette
            "& .MuiDataGrid-root": { border: "none", color: textPri },
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: theme.palette.mode === "dark"
                ? theme.palette.gray?.[800] ?? paper
                : theme.palette.gray?.[800] ?? paper,
              color: textPri,
              borderBottom: `1px solid ${divider}`,
              fontWeight: 600,
            },
            "& .MuiDataGrid-columnHeaderTitle": { fontSize: 14 },
            "& .MuiDataGrid-cell": {
              borderBottom: `1px solid ${divider}`,
            },
            "& .MuiDataGrid-virtualScroller": {
              bgcolor: paper,
            },
            "& .MuiDataGrid-footerContainer": {
              bgcolor: theme.palette.mode === "dark"
                ? theme.palette.gray?.[800] ?? paper
                : theme.palette.gray?.[800] ?? paper,
              borderTop: `1px solid ${divider}`,
              color: textSec,
            },
            "& .MuiCheckbox-root": {
              // success token -> matches your greenAccent via palette.success
              color: `${theme.palette.success.main} !important`,
            },
            "& .MuiDataGrid-toolbarContainer": {
              p: 1,
              "& .MuiButton-text": { color: textPri },
            },
            "& .MuiTablePagination-displayedRows, & .MuiTablePagination-selectLabel":
              { color: textSec },
            "& .MuiDataGrid-row:hover": {
              backgroundColor:
                theme.palette.action?.hover ||
                "rgba(0,0,0,0.04)",
            },
            "& .MuiDataGrid-row.Mui-selected": {
              backgroundColor:
                theme.palette.action?.selected ||
                "rgba(0,0,0,0.08)",
            },
          }}
        >
          <DataGrid
            rows={leads}
            columns={columns}
            checkboxSelection
            disableRowSelectionOnClick
            onRowSelectionModelChange={handleSelectionModelChange}
            // FYI: In MUI X v6+, use `slots={{ toolbar: GridToolbar }}`; in v5, `components` is correct.
            components={{ Toolbar: GridToolbar }}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
              columns: { columnVisibilityModel: { id: true } },
            }}
          />
        </Paper>
      )}
    </Box>
  );
};

export default ContactUsLead;
