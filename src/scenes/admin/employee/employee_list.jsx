import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  Stack,
  Paper,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { Visibility as VisibilityIcon, Add as AddIcon } from "@mui/icons-material";
import { fetchEmployees } from "../../../api/controller/admin_controller/user_controller";

const StatTile = ({ label, value }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        minWidth: 160,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={700} sx={{ color: theme.palette.text.primary }}>
        {value}
      </Typography>
    </Paper>
  );
};

const NameCell = ({ row }) => {
  const theme = useTheme();
  const initials = row.name
    ? row.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Avatar
        alt={row.name}
        src={row.photo || undefined}
        sx={{
          width: 32,
          height: 32,
          bgcolor: theme.palette.blueAccent.dark,
          fontSize: 14,
          color: theme.palette.blueAccent.contrastText,
        }}
      >
        {initials}
      </Avatar>
      <Box>
        <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
          {row.name}
        </Typography>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
          {row.email}
        </Typography>
      </Box>
    </Stack>
  );
};

const ActiveChip = ({ value }) => {
  const theme = useTheme();
  return (
    <Chip
      size="small"
      label={value ? "Active" : "Inactive"}
      sx={{
        bgcolor: value ? theme.palette.blueAccent.main : alpha(theme.palette.text.primary, 0.14),
        color: value ? theme.palette.blueAccent.contrastText : theme.palette.text.primary,
        fontWeight: 600,
        border: value ? `1px solid ${alpha(theme.palette.blueAccent.main, 0.35)}` : `1px solid ${theme.palette.divider}`,
      }}
    />
  );
};

const ActionCell = ({ id, onView }) => {
  const theme = useTheme();
  return (
    <Tooltip title="View details">
      <IconButton
        size="small"
        onClick={() => onView(id)}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: "transparent",
          "&:hover": { bgcolor: alpha(theme.palette.blueAccent.main, 0.12) },
        }}
      >
        <VisibilityIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

const EmployeesList = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleViewDetails = (id) => navigate(`/employee-profile/${id}`);
  const handleAddEmployee = () => navigate("/add-employee");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchEmployees();
        if (!mounted) return;
        if (res.status === "success") setEmployees(res.data || []);
        else setError("Failed to fetch employees");
      } catch {
        if (mounted) setError("Error fetching data");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const counts = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.isActive).length;
    const inactive = total - active;
    const departments = new Set(
      employees.map((e) => e.department?.department_name).filter(Boolean)
    ).size;
    return { total, active, inactive, departments };
  }, [employees]);

  const columns = [
    {
      field: "name",
      headerName: "Employee",
      flex: 1.4,
      renderCell: (params) => <NameCell row={params.row} />,
      sortable: true,
    },
    {
      field: "phone",
      headerName: "Phone",
      flex: 0.8,
      valueGetter: (p) => p.row.phone || "-",
    },
    {
      field: "designation",
      headerName: "Designation",
      flex: 0.9,
      valueGetter: (p) => p.row.designation?.designation_name || "-",
    },
    {
      field: "department",
      headerName: "Department",
      flex: 0.9,
      valueGetter: (p) => p.row.department?.department_name || "-",
    },
    {
      field: "role",
      headerName: "Role",
      flex: 0.8,
      valueGetter: (p) => p.row.role?.role_name || "-",
    },
    {
      field: "isActive",
      headerName: "Status",
      flex: 0.6,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => <ActiveChip value={params.value} />,
      sortable: true,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.6,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => <ActionCell id={params.row.id} onView={handleViewDetails} />,
    },
  ];

  if (loading)
    return (
      <Box m={4}>
        <Typography variant="h6" color="primary">
          Loading...
        </Typography>
      </Box>
    );

  if (error)
    return (
      <Box m={4}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );

  return (
    <Box m={4}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: theme.palette.text.primary, lineHeight: 1 }}>
            Employees
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Manage and explore your organization’s people directory
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddEmployee}
          sx={{
            px: 2.5,
            borderRadius: 2,
            bgcolor: theme.palette.blueAccent.main,
            color: theme.palette.blueAccent.contrastText,
            "&:hover": { bgcolor: theme.palette.blueAccent.dark },
          }}
        >
          Add Employee
        </Button>
      </Box>

      {/* Stat Row */}
      <Stack direction="row" gap={2} flexWrap="wrap" mb={2}>
        <StatTile label="Total" value={counts.total} />
        <StatTile label="Active" value={counts.active} />
        <StatTile label="Inactive" value={counts.inactive} />
        <StatTile label="Departments" value={counts.departments} />
      </Stack>

      {/* Grid */}
      <Box
        mt={2}
        height="70vh"
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: 2,
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`,
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: 0.4,
          },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: theme.palette.background.default },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: theme.palette.background.paper,
            borderTop: `1px solid ${theme.palette.divider}`,
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: alpha(theme.palette.blueAccent.main, 0.06),
          },
          "& .MuiCheckbox-root.Mui-checked": {
            color: `${theme.palette.blueAccent.main} !important`,
          },
        }}
      >
        <DataGrid
          rows={employees}
          columns={columns}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          checkboxSelection
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 400 },
              csvOptions: { fileName: "employees" },
              printOptions: { disableToolbarButton: true },
            },
          }}
          initialState={{
            pagination: { paginationModel: { pageSize: 12 } },
            filter: { filterModel: { items: [] } },
          }}
        />
      </Box>
    </Box>
  );
};

export default EmployeesList;
