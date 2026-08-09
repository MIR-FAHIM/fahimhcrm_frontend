import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  FormControl,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import {
  getProjectTask,
  getStatus,
  updateTaskStatus,
} from "../../../../api/controller/admin_controller/task_controller/task_controller";
import { base_url } from "../../../../api/config/index";
import AddTaskFormProject from "./add_task_for_client";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const normalizeTasks = (grouped = {}) => {
  const rows = [];
  Object.entries(grouped || {}).forEach(([statusName, statusTasks]) => {
    if (!Array.isArray(statusTasks)) return;
    statusTasks.forEach((task) => {
      rows.push({
        ...task,
        task_id: task.id,
        status_name: task.status?.status_name || statusName,
        status_id: task.status?.id || task.status_id || "",
        assigned_person: task.assigned_persons?.[0]?.assigned_person || {},
      });
    });
  });
  return rows;
};

const MetricCard = ({ icon, label, value, color }) => {
  const theme = useTheme();
  const mainColor = color || theme.palette.primary.main;
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack direction="row" spacing={1.1} alignItems="center">
        <Avatar variant="rounded" sx={{ width: 36, height: 36, bgcolor: alpha(mainColor, 0.12), color: mainColor }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 650 }}>
            {label}
          </Typography>
          <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 700, lineHeight: 1 }}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

const ClientTask = ({ clntID }) => {
  const userID = localStorage.getItem("userId");
  const navigate = useNavigate();
  const theme = useTheme();
  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;
  const brandDark = theme.palette.blueAccent?.dark ?? theme.palette.primary.dark;
  const brandContrast = theme.palette.blueAccent?.contrastText ?? theme.palette.primary.contrastText;

  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [statusID, setStatusID] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchTasks();
    fetchStatuses();
  }, [clntID]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await getProjectTask(clntID);
      setRows(normalizeTasks(response?.data || {}));
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await getStatus();
      setStatuses(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  const onAddTask = (nextStatusID = statuses?.[0]?.id || 1) => {
    setStatusID(nextStatusID);
    setIsTaskDialogOpen(true);
  };

  const handleCloseTaskDialog = () => {
    setIsTaskDialogOpen(false);
    fetchTasks();
  };

  const handleStatusChange = async (taskId, newStatusId) => {
    const nextStatus = statuses.find((status) => String(status.id) === String(newStatusId));
    setUpdatingTaskId(taskId);
    try {
      const response = await updateTaskStatus({
        task_id: taskId,
        status_id: newStatusId,
        user_id: userID,
      });

      if (response?.status && response.status !== "success") {
        throw new Error(response.message || "Failed to update task status.");
      }

      setRows((current) =>
        current.map((task) =>
          task.task_id === taskId
            ? {
                ...task,
                status_id: newStatusId,
                status_name: nextStatus?.status_name || task.status_name,
                status: nextStatus ? { ...(task.status || {}), ...nextStatus } : task.status,
              }
            : task
        )
      );
    } catch (error) {
      console.error("Error updating task status:", error);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const filteredRows = useMemo(() => {
    const search = query.trim().toLowerCase();
    return rows.filter((task) => {
      const matchesStatus = statusFilter === "all" || String(task.status_id) === String(statusFilter);
      const haystack = [
        task.task_title,
        task.task_details,
        task.status_name,
        task.priority?.priority_name,
        task.assigned_person?.name,
        task.task_type?.type_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesStatus && (!search || haystack.includes(search));
    });
  }, [query, rows, statusFilter]);

  const stats = useMemo(() => {
    const assigned = rows.filter((task) => task.assigned_person?.id || task.assigned_person?.name).length;
    const withDueDate = rows.filter((task) => task.due_date).length;
    return { assigned, withDueDate };
  }, [rows]);

  const columns = useMemo(
    () => [
      {
        field: "task_title",
        headerName: "Task",
        flex: 1.8,
        minWidth: 260,
        renderCell: ({ row }) => (
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
              {row.task_title || "Untitled task"}
            </Typography>
            <Typography
              noWrap
              variant="caption"
              sx={{ color: theme.palette.text.secondary, display: "block" }}
            >
              {row.task_details || "No task details"}
            </Typography>
          </Box>
        ),
      },
      {
        field: "priority",
        headerName: "Priority",
        minWidth: 140,
        flex: 0.8,
        valueGetter: (params) => params.row.priority?.priority_name || "",
        renderCell: ({ row }) => {
          const color = row.priority?.color_code || theme.palette.warning.main;
          return (
            <Chip
              size="small"
              label={row.priority?.priority_name || "Priority"}
              sx={{ bgcolor: alpha(color, 0.16), color, fontWeight: 700, maxWidth: "100%" }}
            />
          );
        },
      },
      {
        field: "status_id",
        headerName: "Status",
        minWidth: 190,
        flex: 1,
        renderCell: ({ row }) => (
          <FormControl size="small" fullWidth>
            <Select
              value={row.status_id || ""}
              disabled={updatingTaskId === row.task_id}
              onChange={(event) => handleStatusChange(row.task_id, event.target.value)}
              sx={{
                height: 34,
                bgcolor: theme.palette.background.paper,
                "& .MuiSelect-select": { fontWeight: 650 },
              }}
            >
              {statuses.map((status) => (
                <MenuItem key={status.id} value={status.id}>
                  {status.status_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ),
      },
      {
        field: "assigned_person",
        headerName: "Assigned To",
        flex: 1,
        minWidth: 180,
        valueGetter: (params) => params.row.assigned_person?.name || "",
        renderCell: ({ row }) => {
          const person = row.assigned_person || {};
          return (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
              <Avatar
                src={person.photo ? `${base_url}/storage/${person.photo}` : undefined}
                sx={{ width: 30, height: 30, bgcolor: alpha(brand, 0.14), color: brand, fontSize: 12, fontWeight: 700 }}
              >
                {getInitials(person.name)}
              </Avatar>
              <Typography noWrap variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 650 }}>
                {person.name || "Unassigned"}
              </Typography>
            </Stack>
          );
        },
      },
      {
        field: "due_date",
        headerName: "Due Date",
        width: 140,
        valueFormatter: ({ value }) => formatDate(value),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 135,
        sortable: false,
        filterable: false,
        align: "right",
        headerAlign: "right",
        renderCell: ({ row }) => (
          <Button
            size="small"
            variant="outlined"
            endIcon={<OpenInNewRoundedIcon />}
            onClick={() => navigate(`/task-details/${row.task_id}`)}
            sx={{ fontWeight: 700, borderColor: brand, color: brand, "&:hover": { borderColor: brandDark, bgcolor: alpha(brand, 0.08) } }}
          >
            Details
          </Button>
        ),
      },
    ],
    [brand, brandDark, navigate, statuses, theme, updatingTaskId]
  );

  return (
    <Box sx={{ bgcolor: theme.palette.background.default }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
            Client Tasks
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Track assigned client work in a sortable table view.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => onAddTask()}
          sx={{ bgcolor: brand, color: brandContrast, fontWeight: 700, "&:hover": { bgcolor: brandDark } }}
        >
          Add Task
        </Button>
      </Stack>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 1.5, mb: 2 }}>
        <MetricCard icon={<AssignmentTurnedInRoundedIcon />} label="Total Tasks" value={rows.length} color={brand} />
        <MetricCard icon={<PersonRoundedIcon />} label="Assigned" value={stats.assigned} color={theme.palette.success.main} />
        <MetricCard icon={<EventRoundedIcon />} label="With Due Date" value={stats.withDueDate} color={theme.palette.warning.main} />
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mb: 2,
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
          <TextField
            size="small"
            fullWidth
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tasks, assignee, status, priority"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 220 } }}>
            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              displayEmpty
              startAdornment={<TuneRoundedIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />}
            >
              <MenuItem value="all">All statuses</MenuItem>
              {statuses.map((status) => (
                <MenuItem key={status.id} value={String(status.id)}>
                  {status.status_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          height: 560,
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <DataGrid
          rows={filteredRows}
          columns={columns}
          getRowId={(row) => row.task_id}
          loading={loading}
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          sx={{
            border: "none",
            color: theme.palette.text.primary,
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: alpha(brand, theme.palette.mode === "dark" ? 0.18 : 0.08),
              color: theme.palette.text.primary,
              borderBottom: `1px solid ${theme.palette.divider}`,
            },
            "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700 },
            "& .MuiDataGrid-cell": {
              borderBottom: `1px solid ${theme.palette.divider}`,
              outline: "none !important",
            },
            "& .MuiDataGrid-row": {
              bgcolor: theme.palette.background.paper,
              "&:hover": { bgcolor: alpha(brand, theme.palette.mode === "dark" ? 0.16 : 0.06) },
            },
            "& .MuiDataGrid-virtualScroller, & .MuiDataGrid-footerContainer, & .MuiDataGrid-toolbarContainer": {
              bgcolor: theme.palette.background.paper,
            },
            "& .MuiDataGrid-footerContainer, & .MuiDataGrid-toolbarContainer": {
              borderTop: `1px solid ${theme.palette.divider}`,
            },
            "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
              color: `${brand} !important`,
              fontWeight: 650,
            },
            "& .MuiDataGrid-overlay": { bgcolor: alpha(theme.palette.background.paper, 0.92) },
          }}
          localeText={{
            noRowsLabel: loading ? "Loading tasks..." : "No client tasks found",
          }}
        />
      </Paper>

      <Dialog
        open={isTaskDialogOpen}
        onClose={handleCloseTaskDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        }}
      >
        <AddTaskFormProject
          projectId={parseInt(clntID, 10)}
          statusID={statusID}
          title="Client task"
          onClose={handleCloseTaskDialog}
        />
      </Dialog>
    </Box>
  );
};

export default ClientTask;
