import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { Formik } from "formik";
import * as yup from "yup";

import {
  addTaskStatus,
  fetchTaskStatus,
} from "../../../api/controller/admin_controller/task_controller/task_controller";
import { fetchDepartment } from "../../../api/controller/admin_controller/department_controller";

const initialValues = {
  status_name: "",
  department_id: "",
};

const validationSchema = yup.object().shape({
  status_name: yup.string().trim().required("Task status name is required"),
  department_id: yup.string().required("Department selection is required"),
});

const getDepartmentName = (status) =>
  status?.department?.department_name ||
  status?.department_name ||
  status?.department?.name ||
  (status?.department_id ? `Department #${status.department_id}` : "No department");

const AddTaskStatus = () => {
  const theme = useTheme();
  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;

  const [statuses, setStatuses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  const loadData = async () => {
    setLoading(true);
    try {
      const [statusRes, departmentRes] = await Promise.all([fetchTaskStatus(), fetchDepartment()]);
      setStatuses(statusRes?.data || []);
      setDepartments(departmentRes?.data || []);
    } catch (error) {
      console.error("Error fetching task status data:", error);
      setSnack({ open: true, msg: "Failed to load task statuses.", sev: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredStatuses = useMemo(() => {
    const search = query.trim().toLowerCase();
    return statuses.filter((status) => {
      const departmentMatch = departmentFilter === "all" || String(status.department_id || status.department?.id || "") === String(departmentFilter);
      const haystack = [status.status_name, getDepartmentName(status), status.department_id].filter(Boolean).join(" ").toLowerCase();
      return departmentMatch && (!search || haystack.includes(search));
    });
  }, [departmentFilter, query, statuses]);

  const handleFormSubmit = async (values, actions) => {
    setSaving(true);
    try {
      await addTaskStatus({
        status_name: values.status_name.trim(),
        department_id: values.department_id,
        isActive: "1",
      });
      actions.resetForm({ values: initialValues });
      setSnack({ open: true, msg: "Task status created successfully.", sev: "success" });
      await loadData();
    } catch (error) {
      console.error("Error adding task status:", error);
      setSnack({ open: true, msg: "Failed to create task status.", sev: "error" });
    } finally {
      setSaving(false);
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
              Create simple task workflow labels and connect them with departments.
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip icon={<FactCheckRoundedIcon />} label={`${statuses.length} task statuses`} sx={{ fontWeight: 900, bgcolor: alpha(brand, 0.1), color: brand }} />
          <Chip icon={<ApartmentRoundedIcon />} label={`${departments.length} departments`} variant="outlined" sx={{ fontWeight: 900 }} />
        </Stack>
      </Stack>

      <Paper elevation={0} sx={{ p: 2, mb: 2.5, borderRadius: 2, bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }}>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleFormSubmit}>
          {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
            <Box component="form" onSubmit={handleSubmit}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "flex-start" }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Task Status Name"
                  placeholder="Example: Todo, In Progress, Done"
                  name="status_name"
                  value={values.status_name}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  error={Boolean(touched.status_name && errors.status_name)}
                  helperText={touched.status_name && errors.status_name}
                />
                <FormControl size="small" fullWidth error={Boolean(touched.department_id && errors.department_id)}>
                  <InputLabel>Department</InputLabel>
                  <Select label="Department" name="department_id" value={values.department_id} onBlur={handleBlur} onChange={handleChange}>
                    {departments.map((department) => (
                      <MenuItem key={department.id} value={String(department.id)}>
                        {department.department_name}
                      </MenuItem>
                    ))}
                  </Select>
                  {touched.department_id && errors.department_id && (
                    <Typography variant="caption" sx={{ color: theme.palette.error.main, mt: 0.4, ml: 1.5 }}>
                      {errors.department_id}
                    </Typography>
                  )}
                </FormControl>
                <Button type="submit" variant="contained" startIcon={saving ? <CircularProgress size={16} /> : <AddRoundedIcon />} disabled={saving} sx={{ borderRadius: 2, fontWeight: 900, minWidth: 165 }}>
                  Add Status
                </Button>
              </Stack>
            </Box>
          )}
        </Formik>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 2, bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, overflow: "hidden" }}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={1.5} alignItems={{ xs: "stretch", lg: "center" }} justifyContent="space-between" sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 900 }}>
              Task Status List
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Status name and assigned department only.
            </Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              size="small"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search status or department"
              sx={{ minWidth: { xs: "100%", sm: 260 } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
            />
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
          </Stack>
        </Stack>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(brand, 0.08) }}>
                <TableCell sx={{ fontWeight: 900, width: 90 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Task Status Name</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Department</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : filteredStatuses.length ? (
                filteredStatuses.map((status) => (
                  <TableRow key={status.id} hover>
                    <TableCell sx={{ color: theme.palette.text.secondary, fontWeight: 800 }}>#{status.id}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar variant="rounded" sx={{ width: 30, height: 30, bgcolor: alpha(brand, 0.1), color: brand }}>
                          <FactCheckRoundedIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Typography sx={{ color: theme.palette.text.primary, fontWeight: 850 }}>
                          {status.status_name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip icon={<ApartmentRoundedIcon />} label={getDepartmentName(status)} size="small" variant="outlined" sx={{ fontWeight: 850 }} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 5, color: theme.palette.text.secondary }}>
                    No task statuses found.
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

export default AddTaskStatus;