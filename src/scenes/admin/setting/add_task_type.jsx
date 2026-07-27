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
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { Formik } from "formik";
import * as yup from "yup";

import {
  addTaskType,
  fetchTaskType,
} from "../../../api/controller/admin_controller/task_controller/task_controller";
import { fetchDepartment } from "../../../api/controller/admin_controller/department_controller";

const initialValues = {
  type_name: "",
  department_id: "",
};

const validationSchema = yup.object().shape({
  type_name: yup.string().trim().required("Task type name is required"),
  department_id: yup.string().required("Department selection is required"),
});

const getDepartmentName = (type) =>
  type?.department?.department_name ||
  type?.department_name ||
  type?.department?.name ||
  (type?.department_id ? `Department #${type.department_id}` : "No department");

const AddTaskType = () => {
  const theme = useTheme();
  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;

  const [taskTypes, setTaskTypes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  const loadData = async () => {
    setLoading(true);
    try {
      const [typeRes, departmentRes] = await Promise.all([fetchTaskType(), fetchDepartment()]);
      setTaskTypes(typeRes?.data || []);
      setDepartments(departmentRes?.data || []);
    } catch (error) {
      console.error("Error fetching task type data:", error);
      setSnack({ open: true, msg: "Failed to load task types.", sev: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTaskTypes = useMemo(() => {
    const search = query.trim().toLowerCase();
    return taskTypes.filter((type) => {
      const departmentMatch = departmentFilter === "all" || String(type.department_id || type.department?.id || "") === String(departmentFilter);
      const haystack = [type.type_name, getDepartmentName(type), type.department_id].filter(Boolean).join(" ").toLowerCase();
      return departmentMatch && (!search || haystack.includes(search));
    });
  }, [departmentFilter, query, taskTypes]);

  const handleFormSubmit = async (values, actions) => {
    setSaving(true);
    try {
      await addTaskType({
        type_name: values.type_name.trim(),
        department_id: values.department_id,
        isActive: "1",
      });
      actions.resetForm({ values: initialValues });
      setSnack({ open: true, msg: "Task type created successfully.", sev: "success" });
      await loadData();
    } catch (error) {
      console.error("Error adding task type:", error);
      setSnack({ open: true, msg: "Failed to create task type.", sev: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Avatar variant="rounded" sx={{ bgcolor: alpha(brand, 0.12), color: brand }}>
            <CategoryRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 900, lineHeight: 1 }}>
              Task Types
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Create simple task categories and connect them with departments.
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip icon={<CategoryRoundedIcon />} label={`${taskTypes.length} task types`} sx={{ fontWeight: 900, bgcolor: alpha(brand, 0.1), color: brand }} />
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
                  label="Task Type Name"
                  placeholder="Example: Development, Support, Follow-up"
                  name="type_name"
                  value={values.type_name}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  error={Boolean(touched.type_name && errors.type_name)}
                  helperText={touched.type_name && errors.type_name}
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
                <Button type="submit" variant="contained" startIcon={saving ? <CircularProgress size={16} /> : <AddRoundedIcon />} disabled={saving} sx={{ borderRadius: 2, fontWeight: 900, minWidth: 155 }}>
                  Add Type
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
              Task Type List
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Type name and assigned department only.
            </Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              size="small"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search type or department"
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
                <TableCell sx={{ fontWeight: 900 }}>Task Type Name</TableCell>
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
              ) : filteredTaskTypes.length ? (
                filteredTaskTypes.map((type) => (
                  <TableRow key={type.id} hover>
                    <TableCell sx={{ color: theme.palette.text.secondary, fontWeight: 800 }}>#{type.id}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar variant="rounded" sx={{ width: 30, height: 30, bgcolor: alpha(brand, 0.1), color: brand }}>
                          <CategoryRoundedIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Typography sx={{ color: theme.palette.text.primary, fontWeight: 850 }}>
                          {type.type_name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip icon={<ApartmentRoundedIcon />} label={getDepartmentName(type)} size="small" variant="outlined" sx={{ fontWeight: 850 }} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 5, color: theme.palette.text.secondary }}>
                    No task types found.
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

export default AddTaskType;