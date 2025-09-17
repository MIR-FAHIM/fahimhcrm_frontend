import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  Tab,
  Tabs,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  Snackbar,
  Alert,
  LinearProgress,
  InputAdornment,
  useTheme,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";

// ---- Real APIs ----
import {
  addVisit,
  getAllVisit,
} from "../../../api/controller/admin_controller/visit_controller";
import { fetchAllProspect } from "../../../api/controller/admin_controller/prospect_controller";
import { fetchEmployees } from "../../../api/controller/admin_controller/user_controller";
import { fetchZone } from "../../../api/controller/admin_controller/department_controller";

// ---- Utils ----
const fmtDateTime = (v) => {
  if (!v) return "—";
  try {
    const d = typeof v === "string" ? v.replace(" ", "T") : v;
    return new Date(d).toLocaleString();
  } catch {
    return v;
  }
};

export default function VisitPlanner() {
  const theme = useTheme();

  const [employees, setEmployees] = useState([]);
  const [leads, setLeads] = useState([]);
  const [zones, setZones] = useState([]);
  const [visits, setVisits] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] = useState("lead"); // 'lead' | 'zone'
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    employee_id: "",
    scheduled_at: "",
    purpose: "",
    note: "",
    lead_id: "",
    zone_id: "",
  });

  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  const userID =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  // Initial load
  useEffect(() => {
    (async () => {
      try {
        const [empsRes, prospectsRes, visitsRes, zonesRes] = await Promise.all([
          fetchEmployees(),
          fetchAllProspect(),
          getAllVisit(),
          fetchZone(),
        ]);

        const emps = empsRes?.data ?? empsRes ?? [];
        const prospects = prospectsRes?.data ?? prospectsRes ?? [];
        const visitsArr = visitsRes?.data ?? visitsRes ?? [];
        const zonesArr = zonesRes?.data ?? zonesRes ?? [];

        setEmployees(emps);
        setLeads(prospects);
        setZones(zonesArr);
        setVisits(visitsArr);
      } catch (e) {
        console.error(e);
        setSnack({ open: true, msg: "Failed to load data.", sev: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSelect = (type, id) => {
    if (type === "lead") {
      const sel = leads.find((l) => l.id === id);
      setForm((f) => ({
        ...f,
        lead_id: id,
        zone_id: sel?.zone_id || "",
      }));
      setActiveTab("lead");
    } else {
      setForm((f) => ({ ...f, lead_id: "", zone_id: id }));
      setActiveTab("zone");
    }
  };

  const onChange = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  // Filters — use the correct fields
  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((l) =>
      String(l.prospect_name ?? l.name ?? "").toLowerCase().includes(q)
    );
  }, [leads, search]);

  const filteredZones = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return zones;
    return zones.filter((z) =>
      String(z.zone_name ?? z.name ?? "").toLowerCase().includes(q)
    );
  }, [zones, search]);

  const validate = () => {
    if (!form.employee_id) return "Please select an employee.";
    if (!form.scheduled_at) return "Please pick a date & time.";
    if (!form.purpose.trim()) return "Please enter a purpose.";
    if (!form.lead_id && !form.zone_id)
      return "Select either a Lead or a Zone from the right panel.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      setSnack({ open: true, msg: error, sev: "error" });
      return;
    }
    setSaving(true);
    try {
      // Format: "YYYY-MM-DDTHH:mm" -> "YYYY-MM-DD HH:mm:00"
      const formattedScheduledAt = form.scheduled_at
        ? form.scheduled_at.replace("T", " ") + ":00"
        : "";

      const payload = {
        ...form,
        scheduled_at: formattedScheduledAt,
        planner_id: userID || 1,
        task_status_id: 1, // Scheduled
        task_type_id: 1, // Visit
        department_id: 1, // Sales
        priority_id: 1,
      };

      const createRes = await addVisit(payload);
      if (createRes?.status === "success" || createRes?.success) {
        setSnack({ open: true, msg: "Visit plan created.", sev: "success" });
      } else if (createRes?.errors) {
        const apiErrors = Object.values(createRes.errors).flat().join(" ");
        setSnack({ open: true, msg: apiErrors, sev: "error" });
      } else {
        setSnack({ open: true, msg: "Failed to create visit plan.", sev: "error" });
      }

      // Refresh visits
      const refreshed = await getAllVisit();
      setVisits(refreshed?.data ?? refreshed ?? []);

      // Reset form
      setForm({
        employee_id: "",
        scheduled_at: "",
        purpose: "",
        note: "",
        lead_id: "",
        zone_id: "",
      });
    } catch (e) {
      console.error(e);
      setSnack({ open: true, msg: "Failed to create visit plan.", sev: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }} color="text.secondary">
          Loading planner data…
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Grid container spacing={3}>
        {/* LEFT: Add form + Table */}
        <Grid item xs={12} md={7} lg={8}>
          {/* Add Visit */}
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardHeader
              title={
                <Typography variant="h6" fontWeight={800}>
                  Add a Visit Plan
                </Typography>
              }
              subheader="Pick either a lead or a zone from the right panel, then fill the basics."
            />
            <CardContent>
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Employee"
                      select
                      fullWidth
                      size="small"
                      value={form.employee_id}
                      onChange={onChange("employee_id")}
                      SelectProps={{ native: true }}
                      required
                    >
                      <option value="">Select employee</option>
                      {employees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Scheduled Date & Time"
                      type="datetime-local"
                      fullWidth
                      size="small"
                      value={form.scheduled_at}
                      onChange={onChange("scheduled_at")}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={7}>
                    <TextField
                      label="Purpose"
                      fullWidth
                      size="small"
                      value={form.purpose}
                      onChange={onChange("purpose")}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={5}>
                    <TextField
                      label="Note (optional)"
                      fullWidth
                      size="small"
                      value={form.note}
                      onChange={onChange("note")}
                    />
                  </Grid>
                </Grid>

                {/* Current selection */}
                <Box
                  sx={{
                    mt: 2,
                    p: 1.5,
                    bgcolor: theme.palette.background.default,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    flexWrap="wrap"
                  >
                    <Typography variant="body2" color="text.secondary">
                      Selected:
                    </Typography>
                    {form.lead_id ? (
                      <Chip
                        label={`Lead: ${
                          leads.find((l) => l.id === Number(form.lead_id))
                            ?.prospect_name ??
                          leads.find((l) => l.id === Number(form.lead_id))
                            ?.name ??
                          form.lead_id
                        }`}
                        color="primary"
                        variant="outlined"
                      />
                    ) : (
                      <Chip label="Lead: —" size="small" />
                    )}
                    {form.zone_id ? (
                      <Chip
                        label={`Zone: ${
                          zones.find((z) => z.id === Number(form.zone_id))
                            ?.zone_name ?? `Zone ${form.zone_id}`
                        }`}
                        color="success"
                        variant="outlined"
                      />
                    ) : (
                      <Chip label="Zone: —" size="small" />
                    )}
                  </Stack>
                </Box>
              </Box>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: "flex-end" }}>
              <Button
                onClick={handleSubmit}
                variant="contained"
                startIcon={<AddIcon />}
                disabled={saving}
              >
                {saving ? "Saving…" : "Create Visit"}
              </Button>
            </CardActions>
          </Card>

          {/* Visits List */}
          <Card variant="outlined" sx={{ borderRadius: 3, mt: 3 }}>
            <CardHeader
              title={
                <Typography variant="h6" fontWeight={800}>
                  Planned Visits
                </Typography>
              }
            />
            <CardContent sx={{ pt: 0 }}>
              {visits?.length ? (
                <Box sx={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={th}>Employee</th>
                        <th style={th}>Lead</th>
                        <th style={th}>Zone</th>
                        <th style={th}>Scheduled At</th>
                        <th style={th}>Purpose</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visits.map((v) => (
                        <tr key={v.id}>
                          <td style={td}>{v.employee?.name || "—"}</td>
                          <td style={td}>
                            {v.lead?.prospect_name
                              ? v.lead.prospect_name
                              : "—"}
                          </td>
                          <td style={td}>{v.zone?.zone_name || "—"}</td>
                          <td style={td}>{fmtDateTime(v.scheduled_at)}</td>
                          <td style={td}>{v.purpose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              ) : (
                <Typography color="text.secondary" sx={{ py: 2 }}>
                  No visits planned yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT: Selector Panel */}
        <Grid item xs={12} md={5} lg={4}>
          <Card variant="outlined" sx={{ borderRadius: 3, position: "sticky", top: 16 }}>
            <CardHeader
              title={<Typography variant="h6" fontWeight={800}>Select a Destination</Typography>}
              subheader="Choose either a lead or a zone for this visit."
            />
            <CardContent>
              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                textColor="primary"
                indicatorColor="primary"
                sx={{ mb: 2 }}
              >
                <Tab value="lead" label="Leads" />
                <Tab value="zone" label="Zones" />
              </Tabs>

              <TextField
                fullWidth
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${activeTab === "lead" ? "leads" : "zones"}…`}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 1.5 }}
              />

              <Divider sx={{ mb: 1.5 }} />

              {activeTab === "lead" ? (
                <List dense sx={{ maxHeight: 420, overflowY: "auto" }}>
                  {filteredLeads.map((l) => (
                    <ListItemButton
                      key={l.id}
                      onClick={() => handleSelect("lead", l.id)}
                      selected={String(form.lead_id) === String(l.id)}
                      sx={{ borderRadius: 1 }}
                    >
                      <ListItemText
                        primary={l.prospect_name ?? l.name}
                        secondary={
                          l.zone_id
                            ? zones.find((z) => z.id === l.zone_id)?.zone_name ?? `Zone ${l.zone_id}`
                            : null
                        }
                      />
                    </ListItemButton>
                  ))}
                  {!filteredLeads.length && (
                    <Typography color="text.secondary" sx={{ px: 1, py: 2 }}>
                      No leads found.
                    </Typography>
                  )}
                </List>
              ) : (
                <List dense sx={{ maxHeight: 420, overflowY: "auto" }}>
                  {filteredZones.map((z) => (
                    <ListItemButton
                      key={z.id}
                      onClick={() => handleSelect("zone", z.id)}
                      selected={String(form.zone_id) === String(z.id)}
                      sx={{ borderRadius: 1 }}
                    >
                      <ListItemText primary={z.zone_name ?? z.name} />
                    </ListItemButton>
                  ))}
                  {!filteredZones.length && (
                    <Typography color="text.secondary" sx={{ px: 1, py: 2 }}>
                      No zones found.
                    </Typography>
                  )}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snack.open}
        autoHideDuration={2600}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.sev} sx={{ width: "100%" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// Minimal table styles
const th = {
  textAlign: "left",
  padding: "10px 12px",
  borderBottom: "1px solid rgba(0,0,0,0.12)",
  fontWeight: 700,
  whiteSpace: "nowrap",
};
const td = {
  textAlign: "left",
  padding: "10px 12px",
  borderBottom: "1px solid rgba(0,0,0,0.06)",
  verticalAlign: "top",
};
