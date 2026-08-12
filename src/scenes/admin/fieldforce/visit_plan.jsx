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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  Paper,
  useMediaQuery,
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
import { fetchDepartment, fetchZone } from "../../../api/controller/admin_controller/department_controller";
import {
  getPriority,
  getStatus,
  getTaskType,
} from "../../../api/controller/admin_controller/task_controller/task_controller";

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

const listFromResponse = (response) => {
  const data = response?.data ?? response ?? [];
  return Array.isArray(data) ? data : [];
};

const findByName = (items, keys, preferredNames = []) => {
  const activeItems = items.filter((item) => Number(item?.is_active ?? item?.isActive ?? 1) !== 0);
  const searchableItems = activeItems.length ? activeItems : items;

  for (const name of preferredNames) {
    const normalizedName = String(name).toLowerCase();
    const found = searchableItems.find((item) =>
      keys.some((key) => String(item?.[key] || "").toLowerCase().includes(normalizedName))
    );
    if (found) return found;
  }

  return searchableItems[0] || null;
};

const toNullableNumber = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export default function VisitPlanner() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [employees, setEmployees] = useState([]);
  const [leads, setLeads] = useState([]);
  const [zones, setZones] = useState([]);
  const [visits, setVisits] = useState([]);
  const [taskSetup, setTaskSetup] = useState({
    statuses: [],
    types: [],
    priorities: [],
    departments: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] = useState("lead"); // 'lead' | 'zone'
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    employee_id: "",
    scheduled_at: "",
    visit_type: "Planned",
    target_type: "lead",
    purpose: "",
    note: "",
    lead_id: "",
    zone_id: "",
    department_id: "",
    task_status_id: "",
    priority_id: "",
    task_type_id: "",
  });

  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  const userID =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  // Initial load
  useEffect(() => {
    (async () => {
      try {
        const [empsRes, prospectsRes, visitsRes, zonesRes, statusesRes, typesRes, prioritiesRes, departmentsRes] = await Promise.all([
          fetchEmployees(),
          fetchAllProspect(),
          getAllVisit(),
          fetchZone(),
          getStatus(),
          getTaskType(),
          getPriority(),
          fetchDepartment(),
        ]);

        const emps = listFromResponse(empsRes);
        const prospects = listFromResponse(prospectsRes);
        const visitsArr = listFromResponse(visitsRes);
        const zonesArr = listFromResponse(zonesRes);

        setEmployees(emps);
        setLeads(prospects);
        setZones(zonesArr);
        setVisits(visitsArr);
        const setup = {
          statuses: listFromResponse(statusesRes),
          types: listFromResponse(typesRes),
          priorities: listFromResponse(prioritiesRes),
          departments: listFromResponse(departmentsRes),
        };

        setTaskSetup(setup);
        setForm((current) => ({
          ...current,
          task_status_id: current.task_status_id || findByName(setup.statuses, ["status_name", "name"], ["scheduled", "planned", "pending", "to do", "open"])?.id || "",
          task_type_id: current.task_type_id || findByName(setup.types, ["type_name", "name"], ["visit"])?.id || "",
          department_id: current.department_id || findByName(setup.departments, ["department_name", "name"], ["sales", "field", "marketing"])?.id || "",
          priority_id: current.priority_id || findByName(setup.priorities, ["priority_name", "name"], ["important", "normal", "medium", "low"])?.id || "",
        }));
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
      const sel = leads.find((l) => String(l.id) === String(id));
      setForm((f) => ({
        ...f,
        target_type: "lead",
        lead_id: id,
        zone_id: sel?.zone_id || "",
      }));
      setActiveTab("lead");
    } else {
      setForm((f) => ({ ...f, target_type: "zone", lead_id: "", zone_id: id }));
      setActiveTab("zone");
    }
  };

  const onChange = (k) => (e) => {
    const value = e.target.value;
    setForm((f) => {
      if (k === "target_type") {
        setActiveTab(value === "zone" ? "zone" : "lead");
        return { ...f, target_type: value, lead_id: "", zone_id: "" };
      }
      return { ...f, [k]: value };
    });
  };

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
    if (!form.visit_type) return "Please select a visit type.";
    if (!form.purpose.trim()) return "Please enter a purpose.";
    if (form.target_type === "lead" && !form.lead_id) return "Please select a lead.";
    if (form.target_type === "zone" && !form.zone_id) return "Please select a zone.";
    if (!form.lead_id && !form.zone_id) return "Select either a lead or a zone.";
    if (form.lead_id && !leads.some((lead) => String(lead.id) === String(form.lead_id))) return "Selected lead was not found. Please select it again.";
    if (form.zone_id && !zones.some((zone) => String(zone.id) === String(form.zone_id))) return "Selected zone was not found. Please select the lead again.";
    if (!form.department_id) return "Please select a department.";
    if (!form.task_status_id) return "Please select a task status.";
    if (!form.priority_id) return "Please select a priority.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      setSnack({ open: true, msg: error, sev: "error" });
      return;
    }

    const taskStatus = taskSetup.statuses.find((item) => String(item.id) === String(form.task_status_id));
    const taskType = taskSetup.types.find((item) => String(item.id) === String(form.task_type_id));
    const department = taskSetup.departments.find((item) => String(item.id) === String(form.department_id));
    const priority = taskSetup.priorities.find((item) => String(item.id) === String(form.priority_id));

    if (!taskStatus?.id || !department?.id || !priority?.id) {
      setSnack({
        open: true,
        msg: "Task setup data is missing. Please select a valid task status, department, and priority.",
        sev: "error",
      });
      return;
    }

    setSaving(true);
    try {
      // Format: "YYYY-MM-DDTHH:mm" -> "YYYY-MM-DD HH:mm:00"
      const formattedScheduledAt = form.scheduled_at
        ? form.scheduled_at.replace("T", " ") + ":00"
        : "";

      const payload = {
        employee_id: toNullableNumber(form.employee_id),
        lead_id: toNullableNumber(form.lead_id),
        zone_id: toNullableNumber(form.zone_id),
        visit_type: form.visit_type,
        purpose: form.purpose.trim(),
        note: form.note?.trim() || null,
        scheduled_at: formattedScheduledAt,
        planner_id: toNullableNumber(userID) || toNullableNumber(form.employee_id),
        task_status_id: Number(taskStatus.id),
        task_type_id: taskType?.id ? Number(taskType.id) : null,
        department_id: Number(department.id),
        priority_id: Number(priority.id),
      };

      const createRes = await addVisit(payload);
      if (createRes?.status === "success" || createRes?.success) {
        setSnack({ open: true, msg: "Visit plan created.", sev: "success" });

        // Refresh visits
        const refreshed = await getAllVisit();
        setVisits(listFromResponse(refreshed));

        // Reset form
        setForm({
          employee_id: "",
          scheduled_at: "",
          visit_type: "Planned",
          target_type: "lead",
          purpose: "",
          note: "",
          lead_id: "",
          zone_id: "",
          department_id: form.department_id,
          task_status_id: form.task_status_id,
          priority_id: form.priority_id,
          task_type_id: form.task_type_id,
        });
      } else if (createRes?.errors) {
        const apiErrors = Object.values(createRes.errors).flat().join(" ");
        setSnack({ open: true, msg: apiErrors, sev: "error" });
      } else {
        setSnack({ open: true, msg: createRes?.message || "Failed to create visit plan.", sev: "error" });
      }
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
                <Typography variant="h6" fontWeight={600}>
                  Add a Visit Plan
                </Typography>
              }
              subheader="Pick a lead or zone from the right panel, then fill the visit and task setup."
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

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Visit Type"
                      select
                      fullWidth
                      size="small"
                      value={form.visit_type}
                      onChange={onChange("visit_type")}
                      SelectProps={{ native: true }}
                      required
                    >
                      <option value="Planned">Planned</option>
                      <option value="Spontaneous">Spontaneous</option>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Visit Target"
                      select
                      fullWidth
                      size="small"
                      value={form.target_type}
                      onChange={onChange("target_type")}
                      SelectProps={{ native: true }}
                      required
                    >
                      <option value="lead">Lead-wise</option>
                      <option value="zone">Zone-wise</option>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Department"
                      select
                      fullWidth
                      size="small"
                      value={form.department_id}
                      onChange={onChange("department_id")}
                      SelectProps={{ native: true }}
                      required
                    >
                      <option value="">Select department</option>
                      {taskSetup.departments.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.department_name || item.name}
                        </option>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Task Status"
                      select
                      fullWidth
                      size="small"
                      value={form.task_status_id}
                      onChange={onChange("task_status_id")}
                      SelectProps={{ native: true }}
                      required
                    >
                      <option value="">Select status</option>
                      {taskSetup.statuses.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.status_name || item.name}
                        </option>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Priority"
                      select
                      fullWidth
                      size="small"
                      value={form.priority_id}
                      onChange={onChange("priority_id")}
                      SelectProps={{ native: true }}
                      required
                    >
                      <option value="">Select priority</option>
                      {taskSetup.priorities.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.priority_name || item.name}
                        </option>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={5}>
                    <TextField
                      label="Task Type (optional)"
                      select
                      fullWidth
                      size="small"
                      value={form.task_type_id}
                      onChange={onChange("task_type_id")}
                      SelectProps={{ native: true }}
                    >
                      <option value="">No linked task type</option>
                      {taskSetup.types.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.type_name || item.name}
                        </option>
                      ))}
                    </TextField>
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

                  <Grid item xs={12} md={7}>
                    <TextField
                      label="Note / Instructions (optional)"
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
            <CardActions
              sx={{
                px: 2,
                pb: 2,
                pt: 0,
                justifyContent: "flex-end",
                flexWrap: "wrap",
              }}
            >
              <Button
                onClick={handleSubmit}
                variant="contained"
                startIcon={<AddIcon />}
                disabled={saving}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                {saving ? "Saving…" : "Create Visit"}
              </Button>
            </CardActions>
          </Card>

          {/* Visits List */}
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              mt: 3,
              bgcolor: theme.palette.background.paper,
              borderColor: theme.palette.divider,
              overflow: "hidden",
            }}
          >
            <CardHeader
              title={
                <Typography variant="h6" fontWeight={600}>
                  Planned Visits
                </Typography>
              }
              subheader={`${visits?.length || 0} scheduled visit${visits?.length === 1 ? "" : "s"}`}
              sx={{
                borderBottom: visits?.length ? `1px solid ${theme.palette.divider}` : "none",
                "& .MuiCardHeader-subheader": { color: theme.palette.text.secondary },
              }}
            />
            <CardContent sx={{ pt: visits?.length ? 2 : 0 }}>
              {visits?.length ? (
                isMobile ? (
                  <Box display="flex" flexDirection="column" gap={2} mt={1}>
                    {visits.map((v) => (
                      <Paper
                        key={v.id}
                        variant="outlined"
                        sx={{ p: 2, borderRadius: 2 }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700}>
                              {v.lead?.prospect_name || "Visit"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {v.id}
                            </Typography>
                          </Box>
                          <Chip
                            size="small"
                            label={v.priority?.priority_name || "—"}
                            variant="outlined"
                          />
                        </Box>

                        <Divider sx={{ my: 1.5 }} />

                        <Grid container spacing={1.5}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Employee
                            </Typography>
                            <Typography variant="body2">
                              {v.employee?.name || "—"}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Zone
                            </Typography>
                            <Typography variant="body2">
                              {v.zone?.zone_name || "—"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">
                              Scheduled At
                            </Typography>
                            <Typography variant="body2">
                              {fmtDateTime(v.scheduled_at)}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">
                              Purpose
                            </Typography>
                            <Typography variant="body2">
                              {v.purpose || "—"}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                  </Box>
                ) : (
                  <>
                    <TableContainer
                      component={Paper}
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        borderColor: theme.palette.divider,
                        bgcolor: theme.palette.background.paper,
                        maxHeight: 520,
                      }}
                    >
                      <Table stickyHeader size="small" aria-label="planned visits table" sx={{ minWidth: 920 }}>
                        <TableHead>
                          <TableRow>
                            {["ID", "Employee", "Lead", "Zone", "Priority", "Scheduled At", "Purpose"].map((label) => (
                              <TableCell
                                key={label}
                                sx={{
                                  bgcolor: theme.palette.mode === "dark" ? theme.palette.background.default : theme.palette.grey[50],
                                  color: theme.palette.text.secondary,
                                  borderBottom: `1px solid ${theme.palette.divider}`,
                                  fontWeight: 800,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {label}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {visits.map((v) => (
                            <TableRow
                              key={v.id}
                              hover
                              sx={{
                                "&:last-child td": { borderBottom: 0 },
                                "&:hover": { bgcolor: theme.palette.action.hover },
                              }}
                            >
                              <TableCell sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
                                #{v.id}
                              </TableCell>
                              <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 650 }}>
                                {v.employee?.name || "-"}
                              </TableCell>
                              <TableCell sx={{ color: theme.palette.text.primary, maxWidth: 220 }}>
                                <Typography variant="body2" noWrap title={v.lead?.prospect_name || ""} fontWeight={650}>
                                  {v.lead?.prospect_name || "-"}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ color: theme.palette.text.secondary }}>
                                {v.zone?.zone_name || "-"}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={v.priority?.priority_name || "-"}
                                  sx={{
                                    fontWeight: 800,
                                    bgcolor: v.priority?.color_code || theme.palette.action.selected,
                                    color: v.priority?.color_code
                                      ? theme.palette.getContrastText(v.priority.color_code)
                                      : theme.palette.text.secondary,
                                    maxWidth: 140,
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ color: theme.palette.text.secondary, whiteSpace: "nowrap" }}>
                                {fmtDateTime(v.scheduled_at)}
                              </TableCell>
                              <TableCell sx={{ color: theme.palette.text.primary, maxWidth: 280 }}>
                                <Typography variant="body2" title={v.purpose || ""} sx={{ whiteSpace: "normal" }}>
                                  {v.purpose || "-"}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Box sx={{ display: "none", overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                      }}
                    >
                      <thead>
                        <tr>
                          <th style={th}>ID</th>
                          <th style={th}>Employee</th>
                          <th style={th}>Lead</th>
                          <th style={th}>Zone</th>
                          <th style={th}>Priority</th>
                          <th style={th}>Scheduled At</th>
                          <th style={th}>Purpose</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visits.map((v) => (
                          <tr key={v.id}>
                             <td style={td}>{v.id}</td>
                            <td style={td}>{v.employee?.name || "—"}</td>
                            <td style={td}>
                              {v.lead?.prospect_name
                                ? v.lead.prospect_name
                                : "—"}
                            </td>
                            <td style={td}>{v.zone?.zone_name || "—"}</td>
                            <td style={td}>{v.priority?.priority_name || "—"}</td>
                            <td style={td}>{fmtDateTime(v.scheduled_at)}</td>
                            <td style={td}>{v.purpose}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </Box>
                  </>
                )
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
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              position: { xs: "static", md: "sticky" },
              top: { md: 16 },
            }}
          >
            <CardHeader
              title={<Typography variant="h6" fontWeight={600}>Select a Destination</Typography>}
              subheader="Choose a lead or zone for this visit plan."
            />
            <CardContent>
              <Tabs
                value={activeTab}
                onChange={(_, v) => {
                  setActiveTab(v);
                  setForm((current) => ({ ...current, target_type: v, lead_id: "", zone_id: "" }));
                }}
                textColor="primary"
                indicatorColor="primary"
                variant={isMobile ? "scrollable" : "standard"}
                scrollButtons={isMobile ? "auto" : false}
                allowScrollButtonsMobile
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
