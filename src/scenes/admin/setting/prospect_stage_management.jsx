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
  FormControlLabel,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
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
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  AddRounded,
  EditRounded,
  FlagRounded,
  FormatListNumberedRounded,
  RefreshRounded,
  SaveRounded,
} from "@mui/icons-material";

import {
  addProspectStage,
  getProspectAllStatus,
  updateProspectStage,
  updateProspectStageOrder,
} from "../../../api/controller/admin_controller/prospect_controller";

const defaultForm = {
  stage_name: "",
  color_code: "#3A86FF",
  is_active: true,
  order_serial: "",
};

const asList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
};

const asActive = (value) => value === true || value === 1 || value === "1";

const normalizeStage = (stage) => ({
  ...stage,
  is_active: asActive(stage?.is_active ?? stage?.isActive ?? stage?.active),
  order_serial: Number(stage?.order_serial || 0),
});

const sortStages = (items = []) =>
  [...items].sort((a, b) => {
    const aOrder = Number(a.order_serial || 0);
    const bOrder = Number(b.order_serial || 0);
    if (aOrder !== bOrder) return aOrder - bOrder;
    return Number(a.id || 0) - Number(b.id || 0);
  });

const isProtectedStage = (stageName = "") => String(stageName).trim().toLowerCase() === "already client";

const isHexColor = (value = "") => /^#([0-9A-F]{3}){1,2}$/i.test(String(value));

const getErrorMessage = (error, fallback) => error?.message || fallback;

const ProspectStageManagement = () => {
  const theme = useTheme();
  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;
  const brandContrast = theme.palette.blueAccent?.contrastText ?? theme.palette.getContrastText(brand);

  const [stages, setStages] = useState([]);
  const [orderDraft, setOrderDraft] = useState({});
  const [form, setForm] = useState(defaultForm);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  const orderedStages = useMemo(() => sortStages(stages), [stages]);
  const activeCount = stages.filter((stage) => asActive(stage.is_active)).length;

  const showSnack = (msg, sev = "success") => setSnack({ open: true, msg, sev });

  const loadStages = async () => {
    setLoading(true);
    try {
      const response = await getProspectAllStatus();
      const list = sortStages(asList(response).map(normalizeStage));
      setStages(list);
      setOrderDraft(Object.fromEntries(list.map((stage, index) => [stage.id, stage.order_serial || index + 1])));
    } catch (error) {
      console.error("Error loading prospect stages:", error);
      showSnack(getErrorMessage(error, "Failed to load prospect stages."), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStages();
  }, []);

  const handleFormChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleEditFormChange = (field, value) => {
    setEditForm((current) => ({ ...current, [field]: value }));
  };

  const validateStageForm = (data, isEdit = false) => {
    if (!data.stage_name.trim()) return "Stage name is required.";
    if (data.color_code && !isHexColor(data.color_code)) return "Color code must be a valid hex color, for example #3A86FF.";
    if (isEdit && !data.order_serial) return "Order serial is required.";
    return "";
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const validationMessage = validateStageForm(form);
    if (validationMessage) {
      showSnack(validationMessage, "warning");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        stage_name: form.stage_name.trim(),
        is_active: Boolean(form.is_active),
        color_code: form.color_code || null,
        order_serial: form.order_serial ? Number(form.order_serial) : null,
      };
      const response = await addProspectStage(payload);
      if (response?.status && String(response.status).toLowerCase() !== "success") {
        throw new Error(response?.message || "Failed to add prospect stage.");
      }
      setForm(defaultForm);
      await loadStages();
      showSnack("Prospect stage added.");
    } catch (error) {
      showSnack(getErrorMessage(error, "Failed to add prospect stage."), "error");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (stage) => {
    setEditTarget(stage);
    setEditForm({
      stage_name: stage.stage_name || "",
      color_code: stage.color_code || "",
      is_active: asActive(stage.is_active),
      order_serial: stage.order_serial || "",
    });
  };

  const handleUpdate = async () => {
    if (!editTarget) return;
    const validationMessage = validateStageForm(editForm, true);
    if (validationMessage) {
      showSnack(validationMessage, "warning");
      return;
    }

    setUpdating(true);
    try {
      const payload = {
        stage_name: isProtectedStage(editTarget.stage_name) ? editTarget.stage_name : editForm.stage_name.trim(),
        is_active: Boolean(editForm.is_active),
        color_code: editForm.color_code || null,
        order_serial: Number(editForm.order_serial),
      };
      const response = await updateProspectStage(editTarget.id, payload);
      if (response?.status && String(response.status).toLowerCase() !== "success") {
        throw new Error(response?.message || "Failed to update prospect stage.");
      }
      setEditTarget(null);
      await loadStages();
      showSnack("Prospect stage updated.");
    } catch (error) {
      showSnack(getErrorMessage(error, "Failed to update prospect stage."), "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveOrder = async () => {
    const payload = orderedStages.map((stage, index) => ({
      id: stage.id,
      order_serial: Number(orderDraft[stage.id] || index + 1),
    }));

    if (payload.some((item) => !item.order_serial || item.order_serial < 1)) {
      showSnack("Every stage must have a valid order serial.", "warning");
      return;
    }

    setSavingOrder(true);
    try {
      const response = await updateProspectStageOrder(payload);
      if (response?.status && String(response.status).toLowerCase() !== "success") {
        throw new Error(response?.message || "Failed to save stage order.");
      }
      await loadStages();
      showSnack("Prospect stage order updated.");
    } catch (error) {
      showSnack(getErrorMessage(error, "Failed to save stage order."), "error");
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2.5 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Avatar variant="rounded" sx={{ bgcolor: alpha(brand, 0.14), color: brand }}>
            <FlagRounded />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 800 }}>
              Prospect Stages
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Manage CRM pipeline stages, colors, active state, and display order.
            </Typography>
          </Box>
        </Stack>
        <Button
          variant="outlined"
          startIcon={loading ? <CircularProgress size={16} /> : <RefreshRounded />}
          disabled={loading}
          onClick={loadStages}
          sx={{ alignSelf: { xs: "stretch", lg: "center" }, fontWeight: 700 }}
        >
          Refresh
        </Button>
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2.5 }}>
        <Chip label={`${stages.length} total stages`} color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
        <Chip label={`${activeCount} active`} color="success" variant="outlined" sx={{ fontWeight: 700 }} />
        <Chip label={`${stages.length - activeCount} inactive`} variant="outlined" sx={{ fontWeight: 700 }} />
      </Stack>

      <Paper
        component="form"
        onSubmit={handleCreate}
        elevation={0}
        sx={{
          p: 2,
          mb: 2.5,
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
          <Avatar variant="rounded" sx={{ bgcolor: alpha(theme.palette.success.main, 0.12), color: theme.palette.success.main }}>
            <AddRounded />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 800 }}>
              Add Prospect Stage
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Create a pipeline stage with color, active state, and optional order serial.
            </Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: "column", lg: "row" }} spacing={1.5} alignItems={{ xs: "stretch", lg: "center" }}>
          <TextField
            size="small"
            label="Stage Name"
            value={form.stage_name}
            onChange={(event) => handleFormChange("stage_name", event.target.value)}
            sx={{ flex: 1.3 }}
          />
          <TextField
            size="small"
            label="Color Code"
            value={form.color_code}
            onChange={(event) => handleFormChange("color_code", event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box sx={{ width: 18, height: 18, borderRadius: "50%", bgcolor: isHexColor(form.color_code) ? form.color_code : theme.palette.divider, border: `1px solid ${theme.palette.divider}` }} />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 0.8 }}
          />
          <TextField
            size="small"
            type="number"
            label="Order Serial"
            value={form.order_serial}
            onChange={(event) => handleFormChange("order_serial", event.target.value)}
            inputProps={{ min: 1 }}
            sx={{ flex: 0.65 }}
          />
          <FormControlLabel
            control={<Switch checked={form.is_active} onChange={(event) => handleFormChange("is_active", event.target.checked)} />}
            label={form.is_active ? "Active" : "Inactive"}
            sx={{ whiteSpace: "nowrap" }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <AddRounded />}
            sx={{ fontWeight: 800, bgcolor: brand, color: brandContrast, "&:hover": { bgcolor: theme.palette.blueAccent?.dark ?? theme.palette.primary.dark } }}
          >
            Add Stage
          </Button>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 2, overflow: "hidden", bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }}>
        {loading && <LinearProgress />}
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5} sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 800 }}>
              Stage List
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Stages are sorted by order serial. Edit serials here, then save order in bulk.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={savingOrder ? <CircularProgress size={16} color="inherit" /> : <FormatListNumberedRounded />}
            disabled={loading || savingOrder || !stages.length}
            onClick={handleSaveOrder}
            sx={{ fontWeight: 800 }}
          >
            Save Order
          </Button>
        </Stack>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Stage</TableCell>
                <TableCell>Color</TableCell>
                <TableCell>State</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && orderedStages.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: theme.palette.text.secondary }}>
                    No prospect stages found.
                  </TableCell>
                </TableRow>
              )}
              {orderedStages.map((stage, index) => {
                const color = isHexColor(stage.color_code) ? stage.color_code : brand;
                const protectedName = isProtectedStage(stage.stage_name);
                return (
                  <TableRow key={stage.id} hover>
                    <TableCell sx={{ width: 140 }}>
                      <TextField
                        size="small"
                        type="number"
                        value={orderDraft[stage.id] ?? stage.order_serial ?? index + 1}
                        onChange={(event) => setOrderDraft((current) => ({ ...current, [stage.id]: event.target.value }))}
                        inputProps={{ min: 1 }}
                        sx={{ width: 96 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Avatar variant="rounded" sx={{ bgcolor: alpha(color, 0.14), color }}>
                          <FlagRounded fontSize="small" />
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                            <Typography sx={{ color: theme.palette.text.primary, fontWeight: 800 }}>
                              {stage.stage_name}
                            </Typography>
                            {protectedName && <Chip size="small" color="warning" variant="outlined" label="Protected name" />}
                          </Stack>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            ID #{stage.id}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: color, border: `1px solid ${theme.palette.divider}` }} />
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {stage.color_code || "No color"}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={asActive(stage.is_active) ? "success" : "default"}
                        label={asActive(stage.is_active) ? "Active" : "Inactive"}
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit stage">
                        <IconButton size="small" onClick={() => openEdit(stage)}>
                          <EditRounded fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={Boolean(editTarget)} onClose={() => !updating && setEditTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Edit Prospect Stage</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {editTarget && isProtectedStage(editTarget.stage_name) && (
              <Alert severity="warning">
                The stage name "Already Client" is locked because clicking this stage converts a prospect to a client.
              </Alert>
            )}
            <TextField
              size="small"
              label="Stage Name"
              value={editForm.stage_name}
              disabled={editTarget && isProtectedStage(editTarget.stage_name)}
              onChange={(event) => handleEditFormChange("stage_name", event.target.value)}
            />
            <TextField
              size="small"
              label="Color Code"
              value={editForm.color_code}
              onChange={(event) => handleEditFormChange("color_code", event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box sx={{ width: 18, height: 18, borderRadius: "50%", bgcolor: isHexColor(editForm.color_code) ? editForm.color_code : theme.palette.divider, border: `1px solid ${theme.palette.divider}` }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              size="small"
              type="number"
              label="Order Serial"
              value={editForm.order_serial}
              onChange={(event) => handleEditFormChange("order_serial", event.target.value)}
              inputProps={{ min: 1 }}
            />
            <FormControlLabel
              control={<Switch checked={editForm.is_active} onChange={(event) => handleEditFormChange("is_active", event.target.checked)} />}
              label={editForm.is_active ? "Active" : "Inactive"}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTarget(null)} disabled={updating}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={updating ? <CircularProgress size={16} color="inherit" /> : <SaveRounded />}
            disabled={updating}
            onClick={handleUpdate}
            sx={{ fontWeight: 800 }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((state) => ({ ...state, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snack.sev} variant="filled" onClose={() => setSnack((state) => ({ ...state, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProspectStageManagement;
