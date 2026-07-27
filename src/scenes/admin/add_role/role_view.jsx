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
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { Formik } from "formik";
import * as yup from "yup";

import { fetchRole, addRole } from "../../../api/controller/admin_controller/department_controller";

const initialValues = {
  role_name: "",
};

const validationSchema = yup.object().shape({
  role_name: yup.string().trim().required("Role name is required"),
});

const RoleView = () => {
  const theme = useTheme();
  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  const loadRoles = async () => {
    setLoading(true);
    try {
      const response = await fetchRole();
      setRoles(response?.data || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
      setSnack({ open: true, msg: "Failed to load roles.", sev: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const filteredRoles = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return roles;

    return roles.filter((role) =>
      [role.id, role.role_name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [query, roles]);

  const handleFormSubmit = async (values, actions) => {
    setSaving(true);
    try {
      await addRole({
        role_name: values.role_name.trim(),
        isActive: "1",
      });

      actions.resetForm({ values: initialValues });
      setSnack({ open: true, msg: "Role created successfully.", sev: "success" });
      await loadRoles();
    } catch (error) {
      console.error("Error adding role:", error);
      setSnack({ open: true, msg: "Failed to create role.", sev: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Avatar variant="rounded" sx={{ bgcolor: alpha(brand, 0.12), color: brand }}>
            <AdminPanelSettingsRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 900, lineHeight: 1 }}>
              Roles
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Create application roles for users and permission assignment.
            </Typography>
          </Box>
        </Stack>

        <Chip icon={<AdminPanelSettingsRoundedIcon />} label={`${roles.length} roles`} sx={{ fontWeight: 900, bgcolor: alpha(brand, 0.1), color: brand }} />
      </Stack>

      <Paper elevation={0} sx={{ p: 2, mb: 2.5, borderRadius: 2, bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }}>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleFormSubmit}>
          {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
            <Box component="form" onSubmit={handleSubmit}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "flex-start" }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Role Name"
                  placeholder="Example: Admin, Manager, Employee"
                  name="role_name"
                  value={values.role_name}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  error={Boolean(touched.role_name && errors.role_name)}
                  helperText={touched.role_name && errors.role_name}
                />
                <Button type="submit" variant="contained" startIcon={saving ? <CircularProgress size={16} /> : <AddRoundedIcon />} disabled={saving} sx={{ borderRadius: 2, fontWeight: 900, minWidth: 135 }}>
                  Add Role
                </Button>
              </Stack>
            </Box>
          )}
        </Formik>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 2, bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, overflow: "hidden" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 900 }}>
              Role List
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Clean role names only, ready for permission management.
            </Typography>
          </Box>
          <TextField
            size="small"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search role"
            sx={{ minWidth: { xs: "100%", md: 300 } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
          />
        </Stack>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(brand, 0.08) }}>
                <TableCell sx={{ fontWeight: 900, width: 90 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Role Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : filteredRoles.length ? (
                filteredRoles.map((role) => (
                  <TableRow key={role.id} hover>
                    <TableCell sx={{ color: theme.palette.text.secondary, fontWeight: 800 }}>#{role.id}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar variant="rounded" sx={{ width: 30, height: 30, bgcolor: alpha(brand, 0.1), color: brand }}>
                          <AdminPanelSettingsRoundedIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Typography sx={{ color: theme.palette.text.primary, fontWeight: 850 }}>
                          {role.role_name || "Untitled role"}
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ py: 5, color: theme.palette.text.secondary }}>
                    No roles found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Snackbar open={snack.open} autoHideDuration={2600} onClose={() => setSnack((state) => ({ ...state, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.sev} sx={{ width: "100%" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RoleView;