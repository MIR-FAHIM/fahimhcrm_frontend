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
  IconButton,
  InputAdornment,
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
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

const asActive = (value) => value === true || value === 1 || value === "1";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.response?.data?.errors ||
  error?.message ||
  fallback;

const resolveList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const MasterDataPage = ({
  title,
  subtitle,
  entityLabel,
  countLabel,
  listTitle,
  listSubtitle,
  nameField,
  nameLabel,
  namePlaceholder,
  Icon,
  fetchItems,
  addItem,
  updateItem,
  deleteItem,
  includeColor = false,
  includeDepartment = false,
  fetchDepartments,
  getDepartmentName,
  defaultColor = "#3A86FF",
}) => {
  const theme = useTheme();
  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;

  const emptyForm = useMemo(
    () => ({
      [nameField]: "",
      color_code: defaultColor,
      department_id: "",
      isActive: true,
    }),
    [defaultColor, nameField]
  );

  const [items, setItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [query, setQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  const showSnack = (msg, sev = "success") => setSnack({ open: true, msg, sev });

  const loadData = async () => {
    setLoading(true);
    try {
      const requests = [fetchItems()];
      if (includeDepartment && fetchDepartments) requests.push(fetchDepartments());
      const [itemRes, departmentRes] = await Promise.all(requests);
      setItems(resolveList(itemRes));
      if (includeDepartment) setDepartments(resolveList(departmentRes));
    } catch (error) {
      console.error(`Error loading ${entityLabel}:`, error);
      showSnack(`Failed to load ${entityLabel.toLowerCase()} list.`, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setForm(emptyForm);
    setEditForm(emptyForm);
  }, [emptyForm]);

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    const search = query.trim().toLowerCase();
    return items.filter((item) => {
      const departmentId = item.department_id || item.department?.id || "";
      const departmentMatch = !includeDepartment || departmentFilter === "all" || String(departmentId) === String(departmentFilter);
      const haystack = [item.id, item[nameField], item.color_code, getDepartmentName?.(item), departmentId]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return departmentMatch && (!search || haystack.includes(search));
    });
  }, [departmentFilter, getDepartmentName, includeDepartment, items, nameField, query]);

  const updateFormValue = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const updateEditValue = (field, value) => setEditForm((current) => ({ ...current, [field]: value }));

  const buildPayload = (values) => ({
    [nameField]: String(values[nameField] || "").trim(),
    ...(includeColor ? { color_code: values.color_code || defaultColor } : {}),
    ...(includeDepartment ? { department_id: values.department_id } : {}),
    isActive: values.isActive ? "1" : "0",
  });

  const validatePayload = (values) => {
    if (!String(values[nameField] || "").trim()) return `${nameLabel} is required.`;
    if (includeDepartment && !values.department_id) return "Department selection is required.";
    return "";
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const validationMessage = validatePayload(form);
    if (validationMessage) {
      showSnack(validationMessage, "warning");
      return;
    }

    setSaving(true);
    try {
      await addItem(buildPayload(form));
      setForm(emptyForm);
      showSnack(`${entityLabel} created successfully.`);
      await loadData();
    } catch (error) {
      console.error(`Error creating ${entityLabel}:`, error);
      showSnack(getErrorMessage(error, `Failed to create ${entityLabel.toLowerCase()}.`), "error");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setEditForm({
      [nameField]: item[nameField] || "",
      color_code: item.color_code || defaultColor,
      department_id: item.department_id || item.department?.id || "",
      isActive: asActive(item.isActive ?? item.is_active ?? item.active ?? true),
    });
  };

  const handleUpdate = async () => {
    const validationMessage = validatePayload(editForm);
    if (validationMessage) {
      showSnack(validationMessage, "warning");
      return;
    }

    setUpdating(true);
    try {
      await updateItem(editingItem.id, buildPayload(editForm));
      setEditingItem(null);
      showSnack(`${entityLabel} updated successfully.`);
      await loadData();
    } catch (error) {
      console.error(`Error updating ${entityLabel}:`, error);
      showSnack(getErrorMessage(error, `Failed to update ${entityLabel.toLowerCase()}.`), "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteItem(deleteTarget.id);
      setItems((current) => current.filter((item) => item.id !== deleteTarget.id));
      showSnack(`${entityLabel} deleted successfully.`);
      setDeleteTarget(null);
    } catch (error) {
      console.error(`Error deleting ${entityLabel}:`, error);
      showSnack(getErrorMessage(error, `Failed to delete ${entityLabel.toLowerCase()}.`), "error");
    } finally {
      setDeleting(false);
    }
  };

  const renderFields = (values, setter) => (
    <Stack spacing={2}>
      <TextField
        fullWidth
        size="small"
        label={nameLabel}
        placeholder={namePlaceholder}
        value={values[nameField] || ""}
        onChange={(event) => setter(nameField, event.target.value)}
      />
      {includeColor && (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems={{ xs: "stretch", sm: "center" }}>
          <TextField
            fullWidth
            size="small"
            label="Color Code"
            value={values.color_code || defaultColor}
            onChange={(event) => setter("color_code", event.target.value)}
          />
          <Box component="input" type="color" value={values.color_code || defaultColor} onChange={(event) => setter("color_code", event.target.value)} sx={{ width: { xs: "100%", sm: 54 }, height: 40, border: `1px solid ${theme.palette.divider}`, borderRadius: 1, p: 0.5, bgcolor: theme.palette.background.paper }} />
        </Stack>
      )}
      {includeDepartment && (
        <FormControl size="small" fullWidth>
          <InputLabel>Department</InputLabel>
          <Select label="Department" value={values.department_id || ""} onChange={(event) => setter("department_id", event.target.value)}>
            {departments.map((department) => (
              <MenuItem key={department.id} value={String(department.id)}>
                {department.department_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      <FormControlLabel
        control={<Switch checked={Boolean(values.isActive)} onChange={(event) => setter("isActive", event.target.checked)} />}
        label="Active"
        sx={{ width: "fit-content" }}
      />
    </Stack>
  );

  const iconNode = Icon ? <Icon /> : <AddRoundedIcon />;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Avatar variant="rounded" sx={{ bgcolor: alpha(brand, 0.12), color: brand }}>
            {iconNode}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 900, lineHeight: 1 }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {subtitle}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip icon={iconNode} label={`${items.length} ${countLabel}`} sx={{ fontWeight: 900, bgcolor: alpha(brand, 0.1), color: brand }} />
          {includeDepartment && <Chip icon={<ApartmentRoundedIcon />} label={`${departments.length} departments`} variant="outlined" sx={{ fontWeight: 900 }} />}
        </Stack>
      </Stack>

      <Paper elevation={0} sx={{ p: 2, mb: 2.5, borderRadius: 2, bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }}>
        <Box component="form" onSubmit={handleCreate}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "flex-start" }}>
            <Box sx={{ flex: 1 }}>{renderFields(form, updateFormValue)}</Box>
            <Button type="submit" variant="contained" startIcon={saving ? <CircularProgress size={16} /> : <AddRoundedIcon />} disabled={saving} sx={{ borderRadius: 2, fontWeight: 900, minWidth: 150 }}>
              Add {entityLabel}
            </Button>
          </Stack>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 2, bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, overflow: "hidden" }}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={1.5} alignItems={{ xs: "stretch", lg: "center" }} justifyContent="space-between" sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 900 }}>
              {listTitle}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {listSubtitle}
            </Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              size="small"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${entityLabel.toLowerCase()}`}
              sx={{ minWidth: { xs: "100%", sm: 260 } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
            />
            {includeDepartment && (
              <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 220 } }}>
                <InputLabel>Department</InputLabel>
                <Select label="Department" value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
                  <MenuItem value="all">All departments</MenuItem>
                  {departments.map((department) => (
                    <MenuItem key={department.id} value={String(department.id)}>
                      {department.department_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        </Stack>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(brand, 0.08) }}>
                <TableCell sx={{ fontWeight: 900, width: 90 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>{nameLabel}</TableCell>
                {includeColor && <TableCell sx={{ fontWeight: 900 }}>Color</TableCell>}
                {includeDepartment && <TableCell sx={{ fontWeight: 900 }}>Department</TableCell>}
                <TableCell sx={{ fontWeight: 900, width: 130 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={includeDepartment || includeColor ? 4 : 3} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : filteredItems.length ? (
                filteredItems.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ color: theme.palette.text.secondary, fontWeight: 800 }}>#{item.id}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar variant="rounded" sx={{ width: 30, height: 30, bgcolor: alpha(item.color_code || brand, 0.12), color: item.color_code || brand }}>
                          {iconNode}
                        </Avatar>
                        <Typography sx={{ color: theme.palette.text.primary, fontWeight: 850 }}>
                          {item[nameField] || `Untitled ${entityLabel.toLowerCase()}`}
                        </Typography>
                      </Stack>
                    </TableCell>
                    {includeColor && (
                      <TableCell>
                        <Chip size="small" label={item.color_code || defaultColor} sx={{ fontWeight: 850, color: item.color_code || defaultColor, borderColor: alpha(item.color_code || defaultColor, 0.4) }} variant="outlined" />
                      </TableCell>
                    )}
                    {includeDepartment && (
                      <TableCell>
                        <Chip icon={<ApartmentRoundedIcon />} label={getDepartmentName?.(item) || "No department"} size="small" variant="outlined" sx={{ fontWeight: 850 }} />
                      </TableCell>
                    )}
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.75} justifyContent="flex-end">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(item)} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <span>
                            <IconButton size="small" color="error" disabled={deleting} onClick={() => setDeleteTarget(item)} sx={{ border: `1px solid ${theme.palette.divider}` }}>
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
                  <TableCell colSpan={includeDepartment || includeColor ? 4 : 3} align="center" sx={{ py: 5, color: theme.palette.text.secondary }}>
                    No {countLabel} found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={Boolean(editingItem)} onClose={() => !updating && setEditingItem(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit {entityLabel}</DialogTitle>
        <DialogContent dividers>{renderFields(editForm, updateEditValue)}</DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingItem(null)} disabled={updating}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate} disabled={updating} startIcon={updating ? <CircularProgress size={16} /> : <EditRoundedIcon />}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle>Delete {entityLabel}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Are you sure you want to delete <strong>{deleteTarget?.[nameField]}</strong>? This action cannot be undone.
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

export default MasterDataPage;