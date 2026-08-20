import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PowerSettingsNewRoundedIcon from "@mui/icons-material/PowerSettingsNewRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import {
  buildAttendanceMethodPayload,
  getAttendanceMethodLabel,
  getSafeApiMessage,
  isActiveValue,
  METHOD_DESCRIPTIONS,
  METHOD_ICONS,
  METHOD_OPTIONS,
  resolveAttendanceMethodList,
  summarizeAttendanceMethod,
  validateAttendanceMethodForm,
} from "./attendance_method_utils";
import {
  createAttendanceMethod,
  deleteAttendanceMethod,
  fetchAttendanceMethods,
  updateAttendanceMethod,
} from "../../../api/controller/admin_controller/attendance_controller";

const emptyForm = {
  method: "ip_address",
  ip_addresses: [""],
  latitude: "",
  longitude: "",
  radius_meters: "",
  is_active: false,
};

const normalizeMethodForm = (item = {}) => ({
  method: item.method || "ip_address",
  ip_addresses: Array.isArray(item.ip_addresses) && item.ip_addresses.length ? item.ip_addresses : [""],
  latitude: item.latitude ?? "",
  longitude: item.longitude ?? "",
  radius_meters: item.radius_meters ?? "",
  is_active: isActiveValue(item.is_active),
});

const normalizeActiveDisplay = (items) => {
  const firstActiveIndex = items.findIndex((item) => isActiveValue(item.is_active));
  if (firstActiveIndex < 0) return items;
  return items.map((item, index) => ({
    ...item,
    is_active: index === firstActiveIndex,
  }));
};

const MethodIcon = ({ method, size = 22 }) => {
  const Icon = METHOD_ICONS[method] || METHOD_ICONS.location_based;
  return <Icon sx={{ fontSize: size }} />;
};

const StatusBadge = ({ active }) => {
  const theme = useTheme();
  return (
    <Chip
      size="small"
      icon={active ? <VerifiedRoundedIcon /> : undefined}
      label={active ? "Active" : "Inactive"}
      sx={{
        fontWeight: 800,
        bgcolor: active ? alpha(theme.palette.success.main, 0.14) : alpha(theme.palette.text.secondary, 0.08),
        color: active ? theme.palette.success.main : theme.palette.text.secondary,
        border: `1px solid ${active ? alpha(theme.palette.success.main, 0.28) : theme.palette.divider}`,
      }}
    />
  );
};

const AttendanceMethodForm = ({ values, onChange }) => {
  const theme = useTheme();

  const updateIp = (index, value) => {
    const next = [...values.ip_addresses];
    next[index] = value;
    onChange("ip_addresses", next);
  };

  const removeIp = (index) => {
    const next = values.ip_addresses.filter((_, itemIndex) => itemIndex !== index);
    onChange("ip_addresses", next.length ? next : [""]);
  };

  return (
    <Stack spacing={2}>
      <FormControl fullWidth size="small">
        <InputLabel>Method</InputLabel>
        <Select label="Method" value={values.method} onChange={(event) => onChange("method", event.target.value)}>
          {METHOD_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Alert severity="info" sx={{ py: 0.75 }}>
        {METHOD_DESCRIPTIONS[values.method]}
      </Alert>

      {values.method === "ip_address" && (
        <Stack spacing={1.25}>
          <Typography variant="subtitle2" fontWeight={800}>
            Allowed IP Addresses
          </Typography>
          {values.ip_addresses.map((ip, index) => (
            <Stack key={index} direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField
                fullWidth
                size="small"
                label={`IP address ${index + 1}`}
                value={ip}
                onChange={(event) => updateIp(index, event.target.value)}
                placeholder="103.106.236.235"
              />
              <Button color="error" variant="outlined" onClick={() => removeIp(index)} disabled={values.ip_addresses.length === 1} sx={{ textTransform: "none" }}>
                Remove
              </Button>
            </Stack>
          ))}
          <Button
            startIcon={<AddRoundedIcon />}
            variant="outlined"
            onClick={() => onChange("ip_addresses", [...values.ip_addresses, ""])}
            sx={{ width: "fit-content", textTransform: "none", fontWeight: 700 }}
          >
            Add IP
          </Button>
        </Stack>
      )}

      {values.method === "geo_fenced" && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth size="small" type="number" label="Latitude" value={values.latitude} onChange={(event) => onChange("latitude", event.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth size="small" type="number" label="Longitude" value={values.longitude} onChange={(event) => onChange("longitude", event.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth size="small" type="number" label="Radius meters" value={values.radius_meters} onChange={(event) => onChange("radius_meters", event.target.value)} />
          </Grid>
        </Grid>
      )}

      <FormControlLabel
        control={<Switch checked={Boolean(values.is_active)} onChange={(event) => onChange("is_active", event.target.checked)} />}
        label="Active method"
        sx={{
          width: "fit-content",
          px: 1,
          borderRadius: 1.5,
          bgcolor: alpha(theme.palette.text.primary, 0.035),
        }}
      />
    </Stack>
  );
};

const AttendanceMethodManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;
  const brandDark = theme.palette.blueAccent?.dark ?? theme.palette.primary.dark;
  const brandContrast = theme.palette.blueAccent?.contrastText ?? theme.palette.primary.contrastText;

  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activating, setActivating] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activateTarget, setActivateTarget] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  const showSnack = (msg, sev = "success") => setSnack({ open: true, msg, sev });

  const activeMethod = useMemo(() => methods.find((item) => isActiveValue(item.is_active)), [methods]);

  const loadMethods = async () => {
    setLoading(true);
    try {
      const response = await fetchAttendanceMethods();
      setMethods(normalizeActiveDisplay(resolveAttendanceMethodList(response)));
    } catch (error) {
      console.error("Attendance method load error:", error);
      showSnack("Failed to load attendance methods.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMethods();
  }, []);

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const openCreate = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm(normalizeMethodForm(item));
    setFormOpen(true);
  };

  const handleSave = async () => {
    const validation = validateAttendanceMethodForm(form);
    if (validation) {
      showSnack(validation, "warning");
      return;
    }

    setSaving(true);
    try {
      const payload = buildAttendanceMethodPayload(form);
      if (editingItem) {
        await updateAttendanceMethod(editingItem.id, payload);
      } else {
        await createAttendanceMethod(payload);
      }
      setFormOpen(false);
      setEditingItem(null);
      showSnack(editingItem ? "Attendance method updated successfully." : "Attendance method created successfully.");
      await loadMethods();
    } catch (error) {
      console.error("Attendance method save error:", error);
      showSnack(getSafeApiMessage(error, "Failed to save attendance method."), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAttendanceMethod(deleteTarget.id);
      setMethods((current) => current.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      showSnack("Attendance method deleted successfully.");
    } catch (error) {
      console.error("Attendance method delete error:", error);
      showSnack(getSafeApiMessage(error, "Failed to delete attendance method."), "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleActivate = async () => {
    if (!activateTarget) return;
    setActivating(true);
    try {
      await updateAttendanceMethod(activateTarget.id, {
        ...buildAttendanceMethodPayload(normalizeMethodForm(activateTarget)),
        is_active: true,
      });
      setActivateTarget(null);
      showSnack(`${getAttendanceMethodLabel(activateTarget.method)} activated successfully.`);
      await loadMethods();
    } catch (error) {
      console.error("Attendance method activate error:", error);
      showSnack(getSafeApiMessage(error, "Failed to activate attendance method."), "error");
    } finally {
      setActivating(false);
    }
  };

  const renderMethodIdentity = (item) => (
    <Stack direction="row" spacing={1.25} alignItems="center">
      <Avatar
        variant="rounded"
        sx={{
          bgcolor: alpha(brand, 0.12),
          color: brand,
          width: 38,
          height: 38,
        }}
      >
        <MethodIcon method={item.method} />
      </Avatar>
      <Box>
        <Typography sx={{ color: theme.palette.text.primary, fontWeight: 850 }}>
          {getAttendanceMethodLabel(item.method)}
        </Typography>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
          #{item.id}
        </Typography>
      </Box>
    </Stack>
  );

  const actionButtons = (item) => {
    const active = isActiveValue(item.is_active);
    return (
      <Stack direction="row" spacing={0.75} justifyContent="flex-end">
        {!active && (
          <Tooltip title="Activate">
            <IconButton size="small" onClick={() => setActivateTarget(item)} sx={{ border: `1px solid ${theme.palette.divider}` }}>
              <PowerSettingsNewRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Edit">
          <IconButton size="small" onClick={() => openEdit(item)} sx={{ border: `1px solid ${theme.palette.divider}` }}>
            <EditRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" color="error" onClick={() => setDeleteTarget(item)} sx={{ border: `1px solid ${theme.palette.divider}` }}>
            <DeleteRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Avatar variant="rounded" sx={{ bgcolor: alpha(brand, 0.12), color: brand }}>
            <MethodIcon method={activeMethod?.method || "location_based"} />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 850, lineHeight: 1 }}>
              Attendance Method Management
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Manage IP, location, and geofence attendance rules for your team.
            </Typography>
          </Box>
        </Stack>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={openCreate}
          sx={{ textTransform: "none", fontWeight: 800, bgcolor: brand, color: brandContrast, "&:hover": { bgcolor: brandDark } }}
        >
          Add Method
        </Button>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.75, md: 2 },
          mb: 2.5,
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack spacing={1.5}>
          <Box>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 850 }}>
              Attendance Method Rules
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
              Each employee can have an assigned attendance method from their profile.
            </Typography>
          </Box>

          <Alert severity="info" sx={{ py: 0.75 }}>
            <Typography variant="body2" sx={{ fontWeight: 800, mb: 0.5 }}>
              Priority rule
            </Typography>
            <Typography variant="body2">1. If an employee has an assigned attendance method, that method will be used.</Typography>
            <Typography variant="body2">2. If the employee has no assigned method, the active global attendance method will be used.</Typography>
            <Typography variant="body2">3. If no employee method and no active global method exists, attendance will work with no restriction.</Typography>
          </Alert>

          <Grid container spacing={1.5}>
            {[
              {
                method: "ip_address",
                title: "IP Address",
                lines: [
                  "Employee can check in/out only from allowed office IP addresses.",
                  "Configure one or more allowed IPs.",
                  "Location and GPS are optional.",
                ],
              },
              {
                method: "location_based",
                title: "Location Based",
                lines: [
                  "Employee must send location, latitude, and longitude.",
                  "No IP restriction.",
                  "Useful for field employees.",
                ],
              },
              {
                method: "geo_fenced",
                title: "Geo Fenced",
                lines: [
                  "Employee must be inside the configured radius.",
                  "Requires latitude, longitude, and radius in meters.",
                  "Backend calculates distance and blocks check-in/out outside the allowed area.",
                ],
              },
              {
                method: "location_based",
                title: "No Method",
                lines: [
                  "This is not a selectable method.",
                  "It happens only when no user method and no active global method are configured.",
                  "Attendance will not check IP, GPS, or geo fence.",
                ],
              },
            ].map((item) => (
              <Grid key={item.title} item xs={12} md={6}>
                <Box
                  sx={{
                    height: "100%",
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.text.primary, 0.035),
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Avatar variant="rounded" sx={{ width: 32, height: 32, bgcolor: alpha(brand, 0.12), color: brand }}>
                      <MethodIcon method={item.method} size={18} />
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ color: theme.palette.text.primary, fontWeight: 850 }}>
                      {item.title}
                    </Typography>
                  </Stack>
                  <Stack spacing={0.5}>
                    {item.lines.map((line) => (
                      <Typography key={line} variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.55 }}>
                        - {line}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Alert severity="warning" sx={{ py: 0.75 }}>
            <Typography variant="body2">
              <strong>Important:</strong> Only one global method should be active at a time. User-specific attendance method has higher priority than global active method.
            </Typography>
          </Alert>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, mb: 2.5, borderRadius: 2, bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.25} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
          <Box>
            <Typography variant="subtitle1" sx={{ color: theme.palette.text.primary, fontWeight: 850 }}>
              Active Method
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {activeMethod ? summarizeAttendanceMethod(activeMethod) : "No active attendance method configured."}
            </Typography>
          </Box>
          {activeMethod ? (
            <Chip icon={<VerifiedRoundedIcon />} label={getAttendanceMethodLabel(activeMethod.method)} sx={{ bgcolor: alpha(theme.palette.success.main, 0.14), color: theme.palette.success.main, fontWeight: 850 }} />
          ) : (
            <Chip label="No active method" variant="outlined" sx={{ fontWeight: 850 }} />
          )}
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 2, bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, overflow: "hidden" }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 850 }}>
              Attendance Methods
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {methods.length} configured method{methods.length === 1 ? "" : "s"}
            </Typography>
          </Box>
        </Stack>

        {isMobile ? (
          <Stack spacing={1.5} sx={{ p: 2 }}>
            {loading ? (
              <Box sx={{ py: 5, textAlign: "center" }}>
                <CircularProgress size={24} />
              </Box>
            ) : methods.length ? (
              methods.map((item) => (
                <Paper key={item.id} elevation={0} sx={{ p: 1.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.default }}>
                  <Stack spacing={1.25}>
                    <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="flex-start">
                      {renderMethodIdentity(item)}
                      <StatusBadge active={isActiveValue(item.is_active)} />
                    </Stack>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {summarizeAttendanceMethod(item)}
                    </Typography>
                    {actionButtons(item)}
                  </Stack>
                </Paper>
              ))
            ) : (
              <Typography sx={{ py: 5, textAlign: "center", color: theme.palette.text.secondary }}>
                No attendance methods found.
              </Typography>
            )}
          </Stack>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(brand, 0.08) }}>
                  <TableCell sx={{ fontWeight: 850 }}>Method</TableCell>
                  <TableCell sx={{ fontWeight: 850 }}>Configuration</TableCell>
                  <TableCell sx={{ fontWeight: 850 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 850, width: 150 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : methods.length ? (
                  methods.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{renderMethodIdentity(item)}</TableCell>
                      <TableCell sx={{ color: theme.palette.text.secondary, fontWeight: 650 }}>{summarizeAttendanceMethod(item)}</TableCell>
                      <TableCell>
                        <StatusBadge active={isActiveValue(item.is_active)} />
                      </TableCell>
                      <TableCell align="right">{actionButtons(item)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 5, color: theme.palette.text.secondary }}>
                      No attendance methods found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={formOpen} onClose={() => !saving && setFormOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingItem ? "Edit Attendance Method" : "Create Attendance Method"}</DialogTitle>
        <DialogContent dividers>
          <AttendanceMethodForm values={form} onChange={updateForm} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <AddRoundedIcon />}>
            {editingItem ? "Save Changes" : "Create Method"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle>Delete Attendance Method</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Are you sure you want to delete <strong>{getAttendanceMethodLabel(deleteTarget?.method)}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting} startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteRoundedIcon />}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(activateTarget)} onClose={() => !activating && setActivateTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle>Activate Attendance Method</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Activate <strong>{getAttendanceMethodLabel(activateTarget?.method)}</strong>? This will make it the current attendance method. Only one method should be active at a time.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActivateTarget(null)} disabled={activating}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleActivate} disabled={activating} startIcon={activating ? <CircularProgress size={16} color="inherit" /> : <PowerSettingsNewRoundedIcon />}>
            Activate
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3200} onClose={() => setSnack((state) => ({ ...state, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.sev} sx={{ width: "100%" }} onClose={() => setSnack((state) => ({ ...state, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AttendanceMethodManagement;
