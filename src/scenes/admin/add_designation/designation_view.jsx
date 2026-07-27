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
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { Formik } from "formik";
import * as yup from "yup";

import { fetchDesignation, addDesignation } from "../../../api/controller/admin_controller/department_controller";

const initialValues = {
  designation_name: "",
};

const validationSchema = yup.object().shape({
  designation_name: yup.string().trim().required("Designation name is required"),
});

const DesignationView = () => {
  const theme = useTheme();
  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;

  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  const loadDesignations = async () => {
    setLoading(true);
    try {
      const response = await fetchDesignation();
      setDesignations(response?.data || []);
    } catch (error) {
      console.error("Error fetching designations:", error);
      setSnack({ open: true, msg: "Failed to load designations.", sev: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDesignations();
  }, []);

  const filteredDesignations = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return designations;

    return designations.filter((designation) =>
      [designation.id, designation.designation_name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [designations, query]);

  const handleFormSubmit = async (values, actions) => {
    setSaving(true);
    try {
      await addDesignation({
        designation_name: values.designation_name.trim(),
        isActive: "1",
      });

      actions.resetForm({ values: initialValues });
      setSnack({ open: true, msg: "Designation created successfully.", sev: "success" });
      await loadDesignations();
    } catch (error) {
      console.error("Error adding designation:", error);
      setSnack({ open: true, msg: "Failed to create designation.", sev: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Avatar variant="rounded" sx={{ bgcolor: alpha(brand, 0.12), color: brand }}>
            <BadgeRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 900, lineHeight: 1 }}>
              Designations
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Create and manage employee job titles in one simple list.
            </Typography>
          </Box>
        </Stack>

        <Chip icon={<BadgeRoundedIcon />} label={`${designations.length} designations`} sx={{ fontWeight: 900, bgcolor: alpha(brand, 0.1), color: brand }} />
      </Stack>

      <Paper elevation={0} sx={{ p: 2, mb: 2.5, borderRadius: 2, bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }}>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleFormSubmit}>
          {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
            <Box component="form" onSubmit={handleSubmit}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "flex-start" }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Designation Name"
                  placeholder="Example: Software Engineer, Sales Manager"
                  name="designation_name"
                  value={values.designation_name}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  error={Boolean(touched.designation_name && errors.designation_name)}
                  helperText={touched.designation_name && errors.designation_name}
                />
                <Button type="submit" variant="contained" startIcon={saving ? <CircularProgress size={16} /> : <AddRoundedIcon />} disabled={saving} sx={{ borderRadius: 2, fontWeight: 900, minWidth: 170 }}>
                  Add Designation
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
              Designation List
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Job title names only, without status clutter.
            </Typography>
          </Box>
          <TextField
            size="small"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search designation"
            sx={{ minWidth: { xs: "100%", md: 300 } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
          />
        </Stack>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(brand, 0.08) }}>
                <TableCell sx={{ fontWeight: 900, width: 90 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Designation Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : filteredDesignations.length ? (
                filteredDesignations.map((designation) => (
                  <TableRow key={designation.id} hover>
                    <TableCell sx={{ color: theme.palette.text.secondary, fontWeight: 800 }}>#{designation.id}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar variant="rounded" sx={{ width: 30, height: 30, bgcolor: alpha(brand, 0.1), color: brand }}>
                          <BadgeRoundedIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Typography sx={{ color: theme.palette.text.primary, fontWeight: 850 }}>
                          {designation.designation_name || "Untitled designation"}
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ py: 5, color: theme.palette.text.secondary }}>
                    No designations found.
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

export default DesignationView;