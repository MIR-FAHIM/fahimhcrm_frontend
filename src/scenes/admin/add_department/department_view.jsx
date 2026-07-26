import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  AccountTreeRounded,
  AddRounded,
  ApartmentRounded,
  AssignmentTurnedInRounded,
  BlockRounded,
  CheckCircleRounded,
  RefreshRounded,
  SearchRounded,
} from "@mui/icons-material";
import { Formik } from "formik";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";

import {
  addDepartment,
  fetchDepartment,
} from "../../../api/controller/admin_controller/department_controller";

const initialValues = {
  department_name: "",
  isActive: true,
};

const checkoutSchema = yup.object().shape({
  department_name: yup
    .string()
    .trim()
    .min(2, "Department name must be at least 2 characters")
    .required("Department Name is required"),
  isActive: yup.boolean().required("Active status is required"),
});

const resolveDepartmentList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.departments)) return response.departments;
  return [];
};

const asActive = (value) => value === true || value === 1 || value === "1";

const normalizeDepartment = (department, index) => ({
  ...department,
  id: department.id ?? `department-${index}`,
  department_name: department.department_name || department.name || "Untitled Department",
  isActive: asActive(department.isActive ?? department.is_active ?? department.active),
});

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const StatusChip = ({ active }) => {
  const theme = useTheme();
  const color = active ? theme.palette.success.main : theme.palette.text.secondary;

  return (
    <Chip
      size="small"
      icon={active ? <CheckCircleRounded /> : <BlockRounded />}
      label={active ? "Active" : "Inactive"}
      sx={{
        fontWeight: 800,
        bgcolor: alpha(color, active ? 0.14 : 0.1),
        color,
        border: `1px solid ${alpha(color, active ? 0.28 : 0.18)}`,
        "& .MuiChip-icon": { color },
      }}
    />
  );
};

const StatTile = ({ icon, label, value, tone = "primary" }) => {
  const theme = useTheme();
  const color = theme.palette[tone]?.main || theme.palette.primary.main;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        minWidth: { xs: 145, sm: 170 },
        flex: "1 1 160px",
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
        <Box>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
            {label}
          </Typography>
          <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 900 }}>
            {value}
          </Typography>
        </Box>
        <Avatar
          variant="rounded"
          sx={{
            width: 42,
            height: 42,
            bgcolor: alpha(color, 0.12),
            color,
          }}
        >
          {icon}
        </Avatar>
      </Stack>
    </Paper>
  );
};

const DepartmentNameCell = ({ row }) => {
  const theme = useTheme();
  const initials = row.department_name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
      <Avatar
        variant="rounded"
        sx={{
          width: 36,
          height: 36,
          bgcolor: alpha(theme.palette.primary.main, 0.14),
          color: theme.palette.primary.main,
          fontWeight: 900,
          fontSize: 13,
        }}
      >
        {initials || <ApartmentRounded fontSize="small" />}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 800 }} noWrap>
          {row.department_name}
        </Typography>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
          ID {row.id}
        </Typography>
      </Box>
    </Stack>
  );
};

const EmptyState = () => (
  <Stack alignItems="center" justifyContent="center" sx={{ height: "100%", p: 3 }} spacing={1}>
    <ApartmentRounded color="disabled" />
    <Typography variant="body2" color="text.secondary">
      No departments found
    </Typography>
  </Stack>
);

const DepartmentView = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const loadDepartments = async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await fetchDepartment();
      const list = resolveDepartmentList(response).map(normalizeDepartment);
      setDepartments(list);
    } catch (departmentError) {
      console.error("Error fetching departments:", departmentError);
      setError("Department list could not be loaded.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const summary = useMemo(() => {
    const active = departments.filter((department) => department.isActive).length;
    return {
      total: departments.length,
      active,
      inactive: departments.length - active,
    };
  }, [departments]);

  const filteredDepartments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return departments.filter((department) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && department.isActive) ||
        (statusFilter === "inactive" && !department.isActive);
      const matchesSearch = !normalizedSearch
        ? true
        : [department.department_name, department.id, department.created_at]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [departments, search, statusFilter]);

  const handleFormSubmit = async (values, actions) => {
    try {
      await addDepartment({
        department_name: values.department_name.trim(),
        isActive: values.isActive ? "1" : "0",
      });

      actions.resetForm({ values: initialValues });
      setSnack({ open: true, message: "Department created successfully.", severity: "success" });
      await loadDepartments({ silent: true });
    } catch (departmentError) {
      console.error("Error adding department:", departmentError);
      setSnack({ open: true, message: "Department could not be created.", severity: "error" });
    } finally {
      actions.setSubmitting(false);
    }
  };

  const goToDepartmentProjects = (id) => navigate(`/project-by-department/${id}`);
  const goToDepartmentTasks = (id) => navigate(`/task-department/${id}`);

  const columns = useMemo(
    () => [
      {
        field: "department_name",
        headerName: "Department",
        flex: 1.4,
        minWidth: 220,
        renderCell: (params) => <DepartmentNameCell row={params.row} />,
      },
      {
        field: "isActive",
        headerName: "Status",
        flex: 0.6,
        minWidth: 130,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => <StatusChip active={params.value} />,
      },
      {
        field: "created_at",
        headerName: "Created",
        flex: 0.7,
        minWidth: 130,
        valueGetter: (params) => formatDate(params.row.created_at),
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 0.7,
        minWidth: 140,
        sortable: false,
        filterable: false,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <Stack direction="row" spacing={1} justifyContent="center">
            <Tooltip title="Department projects">
              <IconButton
                size="small"
                onClick={() => goToDepartmentProjects(params.row.id)}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.1) },
                }}
              >
                <AccountTreeRounded fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Department tasks">
              <IconButton
                size="small"
                onClick={() => goToDepartmentTasks(params.row.id)}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  "&:hover": { bgcolor: alpha(theme.palette.success.main, 0.1) },
                }}
              >
                <AssignmentTurnedInRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [theme.palette.divider, theme.palette.primary.main, theme.palette.success.main]
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 900, lineHeight: 1 }}>
            Departments
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
            Organization structure and active department records
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshRounded />}
          onClick={() => loadDepartments({ silent: true })}
          disabled={loading || refreshing}
          sx={{ borderRadius: 2, alignSelf: { xs: "stretch", md: "center" } }}
        >
          Refresh
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" gap={2} flexWrap="wrap" sx={{ mb: 3 }}>
        <StatTile icon={<ApartmentRounded />} label="Total" value={summary.total} />
        <StatTile icon={<CheckCircleRounded />} label="Active" value={summary.active} tone="success" />
        <StatTile icon={<BlockRounded />} label="Inactive" value={summary.inactive} tone="warning" />
        <StatTile icon={<SearchRounded />} label="Showing" value={filteredDepartments.length} tone="info" />
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "360px minmax(0, 1fr)" },
          gap: 2.5,
          alignItems: "start",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
            <Avatar
              variant="rounded"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
              }}
            >
              <AddRounded />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 900 }}>
                Add Department
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Create a department record
              </Typography>
            </Box>
          </Stack>

          <Formik initialValues={initialValues} validationSchema={checkoutSchema} onSubmit={handleFormSubmit}>
            {({
              values,
              errors,
              touched,
              handleBlur,
              handleChange,
              handleSubmit,
              isSubmitting,
              resetForm,
            }) => (
              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    type="text"
                    label="Department Name"
                    placeholder="Sales, HR, Operations"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.department_name}
                    name="department_name"
                    error={Boolean(touched.department_name && errors.department_name)}
                    helperText={touched.department_name && errors.department_name}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ApartmentRounded fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Box
                    sx={{
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.text.primary, 0.04),
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Switch checked={values.isActive} onChange={handleChange} name="isActive" color="primary" />
                      }
                      label={
                        <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
                          Active Status
                        </Typography>
                      }
                    />
                  </Box>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="flex-end">
                    <Button variant="outlined" onClick={() => resetForm()} disabled={isSubmitting} sx={{ borderRadius: 2 }}>
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <AddRounded />}
                      disabled={isSubmitting}
                      sx={{ borderRadius: 2, fontWeight: 900 }}
                    >
                      Create Department
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            )}
          </Formik>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: 2.5 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", md: "center" }}
              spacing={2}
            >
              <Box>
                <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 900 }}>
                  Department Directory
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  {filteredDepartments.length} of {departments.length} departments
                </Typography>
              </Box>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems={{ xs: "stretch", sm: "center" }}>
                <TextField
                  size="small"
                  placeholder="Search departments"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  sx={{ minWidth: { xs: "100%", sm: 260 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRounded fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {[
                    ["all", "All"],
                    ["active", "Active"],
                    ["inactive", "Inactive"],
                  ].map(([value, label]) => (
                    <Chip
                      key={value}
                      label={label}
                      clickable
                      color={statusFilter === value ? "primary" : "default"}
                      variant={statusFilter === value ? "filled" : "outlined"}
                      onClick={() => setStatusFilter(value)}
                      sx={{ fontWeight: 800 }}
                    />
                  ))}
                </Stack>
              </Stack>
            </Stack>
          </Box>

          <Divider />

          {loading ? (
            <Stack spacing={1.5} sx={{ p: 2.5 }}>
              {[0, 1, 2, 3].map((item) => (
                <Skeleton key={item} variant="rounded" height={58} />
              ))}
            </Stack>
          ) : isMobile ? (
            <Stack spacing={1.5} sx={{ p: 2 }}>
              {filteredDepartments.length ? (
                filteredDepartments.map((department) => (
                  <Box
                    key={department.id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: theme.palette.background.default,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1.5}>
                      <DepartmentNameCell row={department} />
                      <StatusChip active={department.isActive} />
                    </Stack>
                    <Divider sx={{ my: 1.5 }} />
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Created {formatDate(department.created_at)}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Department projects">
                          <IconButton size="small" onClick={() => goToDepartmentProjects(department.id)}>
                            <AccountTreeRounded fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Department tasks">
                          <IconButton size="small" onClick={() => goToDepartmentTasks(department.id)}>
                            <AssignmentTurnedInRounded fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Box>
                ))
              ) : (
                <EmptyState />
              )}
            </Stack>
          ) : (
            <Box
              sx={{
                height: 540,
                "& .MuiDataGrid-root": { border: "none" },
                "& .MuiDataGrid-columnHeaders": {
                  bgcolor: theme.palette.background.default,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                },
                "& .MuiDataGrid-cell": { borderBottom: `1px solid ${theme.palette.divider}` },
                "& .MuiDataGrid-row:hover": { bgcolor: alpha(theme.palette.primary.main, 0.05) },
                "& .MuiDataGrid-footerContainer": {
                  bgcolor: theme.palette.background.default,
                  borderTop: `1px solid ${theme.palette.divider}`,
                },
                "& .MuiDataGrid-toolbarContainer": {
                  px: 2,
                  py: 1.25,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                },
              }}
            >
              <DataGrid
                rows={filteredDepartments}
                columns={columns}
                disableRowSelectionOnClick
                pageSizeOptions={[10, 25, 50]}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                slots={{ toolbar: GridToolbar, noRowsOverlay: EmptyState }}
              />
            </Box>
          )}
        </Paper>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((current) => ({ ...current, open: false }))}
          sx={{ borderRadius: 2 }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DepartmentView;
