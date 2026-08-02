import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { fetchDepartment } from "../../../api/controller/admin_controller/department_controller";
import {
  addTaskStatus,
  deleteTaskStatus,
  fetchTaskStatus,
  updateTaskStatusMaster,
} from "../../../api/controller/admin_controller/task_controller/task_controller";

const asList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
};

const asActive = (value) => value === true || value === 1 || value === "1";

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (data?.errors) return Object.values(data.errors).flat().join(" ");
  return data?.message || data?.error || error?.message || fallback;
};

const getDepartmentId = (status) => status?.department_id || status?.department?.id || "";

const getDepartmentName = (status) =>
  status?.department?.department_name ||
  status?.department_name ||
  status?.department?.name ||
  (getDepartmentId(status) ? `Department #${getDepartmentId(status)}` : "No department");

const AddTaskStatus = () => {
  const theme = useTheme();
  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;

  const [statuses, setStatuses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [activeDepartment, setActiveDepartment] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  const [form, setForm] = useState({
    status_name: "",
    department_ids: [],
    isActive: true,
  });
  const [editForm, setEditForm] = useState({
    status_name: "",
    isActive: true,
  });
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  const showSnack = (msg, sev = "success") => setSnack({ open: true, msg, sev });

  const loadData = async () => {
    setLoading(true);
    try {
      const [statusResponse, departmentResponse] = await Promise.all([
        fetchTaskStatus(),
        fetchDepartment(),
      ]);
      setStatuses(asList(statusResponse));
      setDepartments(asList(departmentResponse));
    } catch (error) {
      console.error("Error loading task statuses:", error);
      showSnack("Failed to load task statuses.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const departmentById = useMemo(() => {
    const map = new Map();
    departments.forEach((department) => map.set(String(department.id), department));
    return map;
  }, [departments]);

  const departmentTabs = useMemo(() => {
    const usedIds = new Set(statuses.map((status) => String(getDepartmentId(status))).filter(Boolean));
    return departments.filter((department) => usedIds.has(String(department.id)));
  }, [departments, statuses]);

  const filteredStatuses = useMemo(() => {
    const search = query.trim().toLowerCase();
    return statuses.filter((status) => {
      const departmentId = String(getDepartmentId(status));
      const matchesDepartment = activeDepartment === "all" || departmentId === String(activeDepartment);
      const haystack = [status.id, status.status_name, getDepartmentName(status)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesDepartment && (!search || haystack.includes(search));
    });
  }, [activeDepartment, query, statuses]);

  const tabCount = (departmentId) => {
    if (departmentId === "all") return statuses.length;
    return statuses.filter((status) => String(getDepartmentId(status)) === String(departmentId)).length;
  };

  const selectedDepartmentNames = form.department_ids
    .map((id) => departmentById.get(String(id))?.department_name)
    .filter(Boolean);

  const handleCreate = async (event) => {
    event.preventDefault();
    const statusName = form.status_name.trim();

    if (!statusName) {
      showSnack("Task status name is required.", "warning");
      return;
    }

    if (!form.department_ids.length) {
      showSnack("Select at least one department.", "warning");
      return;
    }

    setSaving(true);
    try {
      const responses = await Promise.all(
        form.department_ids.map((departmentId) =>
          addTaskStatus({
            status_name: statusName,
            department_id: departmentId,
            isActive: form.isActive ? "1" : "0",
          })
        )
      );

      const failed = responses.find((response) => response?.status && response.status !== "success");
      if (failed) throw new Error(failed.message || "Failed to create one or more task statuses.");

      setForm({ status_name: "", department_ids: [], isActive: true });
      showSnack(`Task status added to ${form.department_ids.length} department${form.department_ids.length > 1 ? "s" : ""}.`);
      await loadData();
    } catch (error) {
      console.error("Error creating task status:", error);
      showSnack(getErrorMessage(error, "Failed to create task status."), "error");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (status) => {
    setEditingStatus(status);
    setEditForm({
      status_name: status?.status_name || "",
      isActive: asActive(status?.isActive ?? status?.is_active ?? status?.active ?? true),
    });
  };

  const handleUpdate = async () => {
    if (!editForm.status_name.trim()) {
      showSnack("Task status name is required.", "warning");
      return;
    }

    setUpdating(true);
    try {
      await updateTaskStatusMaster(editingStatus.id, {
        status_name: editForm.status_name.trim(),
        department_id: getDepartmentId(editingStatus),
        isActive: editForm.isActive ? "1" : "0",
      });
      setEditingStatus(null);
      showSnack("Task status updated successfully.");
      await loadData();
    } catch (error) {
      console.error("Error updating task status:", error);
      showSnack(getErrorMessage(error, "Failed to update task status."), "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteTaskStatus(deleteTarget.id);
      setStatuses((current) => current.filter((status) => status.id !== deleteTarget.id));
      setDeleteTarget(null);
      showSnack("Task status deleted successfully.");
    } catch (error) {
      console.error("Error deleting task status:", error);
      showSnack(getErrorMessage(error, "Failed to delete task status."), "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Avatar variant="rounded" sx={{ bgcolor: alpha(brand, 0.12), color: brand }}>
            <FactCheckRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 900, lineHeight: 1 }}>
              Task Statuses
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Add one workflow status to multiple departments and browse them by department.
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip icon={<FactCheckRoundedIcon />} label={`${statuses.length} task statuses`} sx={{ fontWeight: 900, bgcolor: alpha(brand, 0.1), color: brand }} />
          <Chip icon={<ApartmentRoundedIcon />} label={`${departments.length} departments`} variant="outlined" sx={{ fontWeight: 900 }} />
        </Stack>
      </Stack>

      <Paper elevation={0} sx={{ p: 2, mb: 2.5, borderRadius: 2, bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }}>
        <Box component="form" onSubmit={handleCreate}>
          <Stack direction={{ xs: "column", lg: "row" }} spacing={1.5} alignItems={{ xs: "stretch", lg: "flex-start" }}>
            <TextField
              fullWidth
              size="small"
              label="Task Status Name"
              placeholder="Example: Todo, In Progress, Done"
              value={form.status_name}
              onChange={(event) => setForm((current) => ({ ...current, status_name: event.target.value }))}
              sx={{ flex: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: { xs: "100%", lg: 360 } }}>
              <InputLabel>Departments</InputLabel>
              <Select
                multiple
                label="Departments"
                value={form.department_ids}
                onChange={(event) => {
                  const value = event.target.value;
                  setForm((current) => ({
                    ...current,
                    department_ids: typeof value === "string" ? value.split(",") : value,
                  }));
                }}
                renderValue={() => selectedDepartmentNames.join(", ")}
              >
                {departments.map((department) => (
                  <MenuItem key={department.id} value={String(department.id)}>
                    <Checkbox checked={form.department_ids.includes(String(department.id))} />
                    <ListItemText primary={department.department_name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={<Switch checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} />}
              label="Active"
              sx={{ minHeight: 40, m: 0 }}
            />
            <Button type="submit" variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <AddRoundedIcon />} disabled={saving} sx={{ borderRadius: 2, fontWeight: 900, minWidth: 170 }}>
              Add Status
            </Button>
          </Stack>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 2, bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, overflow: "hidden" }}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={1.5} alignItems={{ xs: "stretch", lg: "center" }} justifyContent="space-between" sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 900 }}>
              Status List
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Department tabs replace the old department filter dropdown.
            </Typography>
          </Box>
          <TextField
            size="small"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search task status"
            sx={{ minWidth: { xs: "100%", sm: 280 } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
          />
        </Stack>

        <Tabs
          value={activeDepartment}
          onChange={(_, value) => setActiveDepartment(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2, borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          <Tab value="all" label={`All (${tabCount("all")})`} />
          {departmentTabs.map((department) => (
            <Tab key={department.id} value={String(department.id)} label={`${department.department_name} (${tabCount(department.id)})`} />
          ))}
        </Tabs>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(brand, 0.08) }}>
                <TableCell sx={{ fontWeight: 900, width: 90 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Task Status Name</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 900, width: 130 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : filteredStatuses.length ? (
                filteredStatuses.map((status) => (
                  <TableRow key={status.id} hover>
                    <TableCell sx={{ color: theme.palette.text.secondary, fontWeight: 800 }}>#{status.id}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar variant="rounded" sx={{ width: 30, height: 30, bgcolor: alpha(brand, 0.12), color: brand }}>
                          <FactCheckRoundedIcon fontSize="small" />
                        </Avatar>
                        <Typography sx={{ color: theme.palette.text.primary, fontWeight: 850 }}>
                          {status.status_name || "Untitled task status"}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip icon={<ApartmentRoundedIcon />} label={getDepartmentName(status)} size="small" variant="outlined" sx={{ fontWeight: 850 }} />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.75} justifyContent="flex-end">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(status)} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <span>
                            <IconButton size="small" color="error" disabled={deleting} onClick={() => setDeleteTarget(status)} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                              <DeleteRoundedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 5, color: theme.palette.text.secondary }}>
                    No task statuses found for this department.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={Boolean(editingStatus)} onClose={() => !updating && setEditingStatus(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Task Status</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="Task Status Name"
              value={editForm.status_name}
              onChange={(event) => setEditForm((current) => ({ ...current, status_name: event.target.value }))}
            />
            <Chip icon={<ApartmentRoundedIcon />} label={getDepartmentName(editingStatus)} variant="outlined" sx={{ width: "fit-content", fontWeight: 850 }} />
            <FormControlLabel
              control={<Switch checked={editForm.isActive} onChange={(event) => setEditForm((current) => ({ ...current, isActive: event.target.checked }))} />}
              label="Active"
              sx={{ width: "fit-content" }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingStatus(null)} disabled={updating}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate} disabled={updating} startIcon={updating ? <CircularProgress size={16} /> : <EditRoundedIcon />}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle>Delete Task Status</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Are you sure you want to delete <strong>{deleteTarget?.status_name}</strong> from <strong>{getDepartmentName(deleteTarget)}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting} startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteRoundedIcon />}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((state) => ({ ...state, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.sev} sx={{ width: "100%" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddTaskStatus;
