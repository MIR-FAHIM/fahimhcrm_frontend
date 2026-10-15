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
  Link,
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
import AndroidRoundedIcon from "@mui/icons-material/AndroidRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import SystemUpdateAltRoundedIcon from "@mui/icons-material/SystemUpdateAltRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import {
  createAppVersion,
  deleteAppVersion,
  fetchAppVersions,
  fetchLatestAppVersion,
  updateAppVersion,
} from "../../../api/controller/admin_controller/app_version_controller";
import { getSafeApiMessage } from "./attendance_method_utils";

const todayInput = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  app_name: "BrainToDo",
  platform: "android",
  version_name: "",
  version_code: "",
  min_supported_version_code: "",
  apk_download_url: "",
  play_store_url: "",
  app_store_url: "",
  release_notes: "",
  force_update: false,
  is_active: true,
  published_date: todayInput(),
};

const isActiveValue = (value) => value === true || value === 1 || value === "1" || value === "true";

const resolveVersionList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.versions)) return response.versions;
  if (Array.isArray(response?.data?.versions)) return response.data.versions;
  if (Array.isArray(response?.app_versions)) return response.app_versions;
  return [];
};

const resolveLatestVersion = (response) => {
  if (!response) return null;
  if (response?.data && !Array.isArray(response.data)) return response.data;
  if (Array.isArray(response?.data)) return response.data[0] || null;
  return response.version || response.latest || null;
};

const numberOrNull = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const formatDateForInput = (value) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const formatDisplayDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const normalizeForm = (item = {}) => ({
  app_name: item.app_name || item.name || "BrainToDo",
  platform: item.platform || "android",
  version_name: item.version_name || "",
  version_code: item.version_code ?? "",
  min_supported_version_code:
    item.min_supported_version_code ?? item.minimum_supported_version_code ?? item.min_version_code ?? "",
  apk_download_url: item.apk_download_url || item.download_url || item.apk_url || item.drive_url || "",
  play_store_url: item.play_store_url || "",
  app_store_url: item.app_store_url || "",
  release_notes: item.release_notes || "",
  force_update: isActiveValue(item.force_update),
  is_active: isActiveValue(item.is_active),
  published_date: formatDateForInput(item.published_date || item.created_at),
});

const buildPayload = (form) => {
  const versionCode = numberOrNull(form.version_code);
  const minSupported = numberOrNull(form.min_supported_version_code);

  return {
    app_name: form.app_name.trim(),
    platform: form.platform,
    version_name: form.version_name.trim(),
    version_code: versionCode,
    min_supported_version_code: minSupported,
    minimum_supported_version_code: minSupported,
    apk_download_url: form.apk_download_url.trim() || null,
    download_url: form.apk_download_url.trim() || null,
    play_store_url: form.play_store_url.trim() || null,
    app_store_url: form.app_store_url.trim() || null,
    release_notes: form.release_notes.trim() || null,
    force_update: Boolean(form.force_update),
    is_active: Boolean(form.is_active),
    published_date: form.published_date || null,
  };
};

const validateForm = (form) => {
  if (!form.app_name.trim()) return "App name is required.";
  if (!form.platform) return "Platform is required.";
  if (!form.version_name.trim()) return "Version name is required.";
  if (numberOrNull(form.version_code) === null) return "Version code must be a number.";
  if (form.min_supported_version_code !== "" && numberOrNull(form.min_supported_version_code) === null) {
    return "Minimum supported version code must be a number.";
  }
  return null;
};

const PlatformIcon = ({ platform }) =>
  platform === "ios" ? <PhoneIphoneRoundedIcon fontSize="small" /> : <AndroidRoundedIcon fontSize="small" />;

const StatusChip = ({ active, label }) => {
  const theme = useTheme();
  return (
    <Chip
      size="small"
      label={label || (active ? "Active" : "Inactive")}
      icon={active ? <CheckCircleRoundedIcon /> : undefined}
      sx={{
        fontWeight: 850,
        bgcolor: active ? alpha(theme.palette.success.main, 0.14) : alpha(theme.palette.text.secondary, 0.08),
        color: active ? theme.palette.success.main : theme.palette.text.secondary,
        border: `1px solid ${active ? alpha(theme.palette.success.main, 0.28) : theme.palette.divider}`,
      }}
    />
  );
};

const ForceChip = ({ force }) => {
  const theme = useTheme();
  return (
    <Chip
      size="small"
      icon={force ? <WarningAmberRoundedIcon /> : undefined}
      label={force ? "Force update" : "Optional"}
      sx={{
        fontWeight: 850,
        bgcolor: force ? alpha(theme.palette.error.main, 0.12) : alpha(theme.palette.info.main, 0.1),
        color: force ? theme.palette.error.main : theme.palette.info.main,
        border: `1px solid ${force ? alpha(theme.palette.error.main, 0.25) : alpha(theme.palette.info.main, 0.2)}`,
      }}
    />
  );
};

const VersionForm = ({ values, onChange }) => (
  <Stack spacing={2}>
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <TextField fullWidth size="small" label="App name" value={values.app_name} onChange={(event) => onChange("app_name", event.target.value)} />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth size="small">
          <InputLabel>Platform</InputLabel>
          <Select label="Platform" value={values.platform} onChange={(event) => onChange("platform", event.target.value)}>
            <MenuItem value="android">Android</MenuItem>
            <MenuItem value="ios">iOS</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField fullWidth size="small" label="Version name" placeholder="1.0.5" value={values.version_name} onChange={(event) => onChange("version_name", event.target.value)} />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField fullWidth size="small" type="number" label="Version code" placeholder="15" value={values.version_code} onChange={(event) => onChange("version_code", event.target.value)} />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField fullWidth size="small" type="number" label="Minimum supported version code" value={values.min_supported_version_code} onChange={(event) => onChange("min_supported_version_code", event.target.value)} />
      </Grid>
      <Grid item xs={12}>
        <TextField fullWidth size="small" label="APK / Google Drive download URL" value={values.apk_download_url} onChange={(event) => onChange("apk_download_url", event.target.value)} />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField fullWidth size="small" label="Play Store URL" value={values.play_store_url} onChange={(event) => onChange("play_store_url", event.target.value)} />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField fullWidth size="small" label="App Store URL" value={values.app_store_url} onChange={(event) => onChange("app_store_url", event.target.value)} />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField fullWidth size="small" type="date" label="Published date" InputLabelProps={{ shrink: true }} value={values.published_date} onChange={(event) => onChange("published_date", event.target.value)} />
      </Grid>
      <Grid item xs={12} md={6}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ height: "100%" }}>
          <FormControlLabel control={<Switch checked={Boolean(values.force_update)} onChange={(event) => onChange("force_update", event.target.checked)} />} label="Force update" />
          <FormControlLabel control={<Switch checked={Boolean(values.is_active)} onChange={(event) => onChange("is_active", event.target.checked)} />} label="Active" />
        </Stack>
      </Grid>
      <Grid item xs={12}>
        <TextField fullWidth multiline minRows={4} label="Release notes" value={values.release_notes} onChange={(event) => onChange("release_notes", event.target.value)} />
      </Grid>
    </Grid>
  </Stack>
);

const AppUpdateManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;
  const brandDark = theme.palette.blueAccent?.dark ?? theme.palette.primary.dark;
  const brandContrast = theme.palette.blueAccent?.contrastText ?? theme.palette.primary.contrastText;

  const [versions, setVersions] = useState([]);
  const [latest, setLatest] = useState({ android: null, ios: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  const showSnack = (msg, sev = "success") => setSnack({ open: true, msg, sev });

  const sortedVersions = useMemo(
    () => [...versions].sort((a, b) => Number(b.version_code || 0) - Number(a.version_code || 0)),
    [versions]
  );

  const loadVersions = async () => {
    setLoading(true);
    try {
      const [allRes, androidLatestRes, iosLatestRes] = await Promise.allSettled([
        fetchAppVersions(),
        fetchLatestAppVersion("android"),
        fetchLatestAppVersion("ios"),
      ]);

      if (allRes.status === "fulfilled") {
        setVersions(resolveVersionList(allRes.value));
      } else {
        throw allRes.reason;
      }

      setLatest({
        android: androidLatestRes.status === "fulfilled" ? resolveLatestVersion(androidLatestRes.value) : null,
        ios: iosLatestRes.status === "fulfilled" ? resolveLatestVersion(iosLatestRes.value) : null,
      });
    } catch (error) {
      console.error("App version load error:", error);
      showSnack(getSafeApiMessage(error, "Failed to load app versions."), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVersions();
  }, []);

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const openCreate = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm(normalizeForm(item));
    setFormOpen(true);
  };

  const handleSave = async () => {
    const validation = validateForm(form);
    if (validation) {
      showSnack(validation, "warning");
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload(form);
      if (editingItem) {
        await updateAppVersion(editingItem.id, payload);
      } else {
        await createAppVersion(payload);
      }
      setFormOpen(false);
      setEditingItem(null);
      showSnack(editingItem ? "App version updated successfully." : "App version added successfully.");
      await loadVersions();
    } catch (error) {
      console.error("App version save error:", error);
      showSnack(getSafeApiMessage(error, "Failed to save app version."), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAppVersion(deleteTarget.id);
      setDeleteTarget(null);
      showSnack("App version deleted successfully.");
      await loadVersions();
    } catch (error) {
      console.error("App version delete error:", error);
      showSnack(getSafeApiMessage(error, "Failed to delete app version."), "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleQuickToggle = async (item, field, value) => {
    try {
      await updateAppVersion(item.id, buildPayload({ ...normalizeForm(item), [field]: value }));
      showSnack(field === "is_active" ? "Active status updated." : "Force update setting updated.");
      await loadVersions();
    } catch (error) {
      console.error("App version toggle error:", error);
      showSnack(getSafeApiMessage(error, "Failed to update app version."), "error");
    }
  };

  const linkButtons = (item) => {
    const links = [
      ["APK", item.apk_download_url || item.download_url || item.apk_url || item.drive_url],
      ["Play", item.play_store_url],
      ["App Store", item.app_store_url],
    ].filter(([, url]) => Boolean(url));

    if (!links.length) return <Typography variant="caption" color="text.secondary">No links</Typography>;

    return (
      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
        {links.map(([label, url]) => (
          <Button key={label} component={Link} href={url} target="_blank" rel="noopener noreferrer" size="small" variant="outlined" endIcon={<OpenInNewRoundedIcon />} sx={{ textTransform: "none", fontWeight: 800 }}>
            {label}
          </Button>
        ))}
      </Stack>
    );
  };

  const renderIdentity = (item) => (
    <Stack direction="row" spacing={1.25} alignItems="center">
      <Avatar variant="rounded" sx={{ bgcolor: alpha(brand, 0.12), color: brand, width: 38, height: 38 }}>
        <PlatformIcon platform={item.platform} />
      </Avatar>
      <Box>
        <Typography sx={{ color: theme.palette.text.primary, fontWeight: 850 }}>{item.app_name || "BrainToDo"}</Typography>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Chip size="small" icon={<PlatformIcon platform={item.platform} />} label={item.platform || "android"} sx={{ height: 22, textTransform: "capitalize", fontWeight: 800 }} />
          <Typography variant="caption" color="text.secondary">#{item.id}</Typography>
        </Stack>
      </Box>
    </Stack>
  );

  const actionButtons = (item) => (
    <Stack direction="row" spacing={0.75} justifyContent="flex-end">
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

  const latestCard = (platform) => {
    const item = latest[platform];
    return (
      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, height: "100%" }}>
        <Stack spacing={1.25}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar variant="rounded" sx={{ bgcolor: alpha(brand, 0.12), color: brand }}>
              <PlatformIcon platform={platform} />
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 850, color: theme.palette.text.primary, textTransform: "capitalize" }}>{platform} latest</Typography>
              <Typography variant="body2" color="text.secondary">Current published app version</Typography>
            </Box>
          </Stack>
          {item ? (
            <Stack spacing={1}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: theme.palette.text.primary }}>{item.version_name || "-"}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip size="small" label={`Code ${item.version_code ?? "-"}`} sx={{ fontWeight: 800 }} />
                <StatusChip active={isActiveValue(item.is_active)} />
                <ForceChip force={isActiveValue(item.force_update)} />
              </Stack>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">No latest version found.</Typography>
          )}
        </Stack>
      </Paper>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Avatar variant="rounded" sx={{ bgcolor: alpha(brand, 0.12), color: brand }}>
            <SystemUpdateAltRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 850, lineHeight: 1 }}>
              App Update Management
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Manage Android and iOS releases, download links, force updates, and active versions.
            </Typography>
          </Box>
        </Stack>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate} sx={{ textTransform: "none", fontWeight: 800, bgcolor: brand, color: brandContrast, "&:hover": { bgcolor: brandDark } }}>
          Add App Version
        </Button>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={12} md={6}>{latestCard("android")}</Grid>
        <Grid item xs={12} md={6}>{latestCard("ios")}</Grid>
      </Grid>

      <Paper elevation={0} sx={{ borderRadius: 2, bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, overflow: "hidden" }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 850 }}>App Versions</Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{versions.length} configured release{versions.length === 1 ? "" : "s"}</Typography>
          </Box>
        </Stack>

        {isMobile ? (
          <Stack spacing={1.5} sx={{ p: 2 }}>
            {loading ? (
              <Box sx={{ py: 5, textAlign: "center" }}><CircularProgress size={24} /></Box>
            ) : sortedVersions.length ? (
              sortedVersions.map((item) => (
                <Paper key={item.id} elevation={0} sx={{ p: 1.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.default }}>
                  <Stack spacing={1.25}>
                    <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="flex-start">
                      {renderIdentity(item)}
                      {actionButtons(item)}
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip size="small" label={`Version ${item.version_name || "-"}`} sx={{ fontWeight: 800 }} />
                      <Chip size="small" label={`Code ${item.version_code ?? "-"}`} sx={{ fontWeight: 800 }} />
                      <StatusChip active={isActiveValue(item.is_active)} />
                      <ForceChip force={isActiveValue(item.force_update)} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">Published: {formatDisplayDate(item.published_date)}</Typography>
                    {item.release_notes && <Typography variant="body2" color="text.secondary" sx={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.release_notes}</Typography>}
                    {linkButtons(item)}
                  </Stack>
                </Paper>
              ))
            ) : (
              <Typography sx={{ py: 5, textAlign: "center", color: theme.palette.text.secondary }}>No app versions found.</Typography>
            )}
          </Stack>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(brand, 0.08) }}>
                  <TableCell sx={{ fontWeight: 850 }}>App</TableCell>
                  <TableCell sx={{ fontWeight: 850 }}>Version</TableCell>
                  <TableCell sx={{ fontWeight: 850 }}>Minimum</TableCell>
                  <TableCell sx={{ fontWeight: 850 }}>Links</TableCell>
                  <TableCell sx={{ fontWeight: 850 }}>Published</TableCell>
                  <TableCell sx={{ fontWeight: 850 }}>Flags</TableCell>
                  <TableCell sx={{ fontWeight: 850, width: 150 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5 }}><CircularProgress size={24} /></TableCell></TableRow>
                ) : sortedVersions.length ? (
                  sortedVersions.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{renderIdentity(item)}</TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 850 }}>{item.version_name || "-"}</Typography>
                        <Typography variant="caption" color="text.secondary">Code {item.version_code ?? "-"}</Typography>
                      </TableCell>
                      <TableCell>{item.min_supported_version_code ?? item.minimum_supported_version_code ?? "-"}</TableCell>
                      <TableCell>{linkButtons(item)}</TableCell>
                      <TableCell>{formatDisplayDate(item.published_date)}</TableCell>
                      <TableCell>
                        <Stack spacing={0.75} alignItems="flex-start">
                          <FormControlLabel control={<Switch size="small" checked={isActiveValue(item.is_active)} onChange={(event) => handleQuickToggle(item, "is_active", event.target.checked)} />} label={<StatusChip active={isActiveValue(item.is_active)} />} sx={{ m: 0 }} />
                          <FormControlLabel control={<Switch size="small" checked={isActiveValue(item.force_update)} onChange={(event) => handleQuickToggle(item, "force_update", event.target.checked)} />} label={<ForceChip force={isActiveValue(item.force_update)} />} sx={{ m: 0 }} />
                        </Stack>
                      </TableCell>
                      <TableCell align="right">{actionButtons(item)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5, color: theme.palette.text.secondary }}>No app versions found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={formOpen} onClose={() => !saving && setFormOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingItem ? "Edit App Version" : "Add App Version"}</DialogTitle>
        <DialogContent dividers>
          <VersionForm values={form} onChange={updateForm} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <AddRoundedIcon />}>
            {editingItem ? "Save Changes" : "Add Version"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle>Delete App Version</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Delete <strong>{deleteTarget?.app_name || "this app"} {deleteTarget?.version_name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting} startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteRoundedIcon />}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((state) => ({ ...state, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.sev} sx={{ width: "100%" }} onClose={() => setSnack((state) => ({ ...state, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AppUpdateManagement;