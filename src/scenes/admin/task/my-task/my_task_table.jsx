// TaskTable.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Toolbar,
  Typography,
  Button,
  Stack,
  TextField,
  InputAdornment,
  useTheme,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useNavigate } from "react-router-dom";
import {
  getAssignedTaskByUsers,
} from "../../../../api/controller/admin_controller/task_controller/task_controller";

export default function TaskTable() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [data, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "error" });
  const title = "Tasks";

  const userID =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const handleNavigation = () =>
    navigate("/add-task", {
      state: { project_id: 0, project_phase_id: 0 },
    });
  const goTaskDetails = (taskId) => navigate(`/task-details/${taskId}`);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!userID) {
        setSnack({ open: true, msg: "No user ID found.", sev: "error" });
        return;
      }
      setLoading(true);
      try {
        const response = await getAssignedTaskByUsers(userID);
        const arr = Array.isArray(response?.data) ? response.data : [];
        setTasks(arr);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setSnack({ open: true, msg: "Failed to load tasks.", sev: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [userID]);

  const normalizeDate = (val) => {
    if (!val) return null;
    const isoish = typeof val === "string" ? val.replace(" ", "T") : val;
    const d = new Date(isoish);
    return isNaN(d.getTime()) ? null : d;
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = (data || []).map((item) => {
      const base = item.task || item;
      return {
        id: base?.id ?? item?.id,
        title: base?.task_title ?? "",
        details: base?.task_details ?? "",
        assignedTo: item?.assigned_person?.name ?? "",
        project: base?.project?.project_name ?? "",
        projectColor: base?.project?.color_code ?? "",
        priority: base?.priority?.priority_name ?? "",
        priorityColor: base?.priority?.color_code ?? "",
        status: base?.status?.status_name ?? "",
        completion: Number(base?.completion_percentage ?? 0),
        showCompletion: Number(base?.show_completion_percentage ?? 0) === 1,
        dueDate: normalizeDate(base?.due_date),
        creator: base?.creator?.name ?? "",
      };
    });

    if (!q) return list;

    return list.filter((r) =>
      [
        r.id,
        r.title,
        r.details,
        r.assignedTo,
        r.project,
        r.priority,
        r.status,
        r.creator,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [data, query]);

  const fmtDate = (d) => (d ? d.toLocaleString() : "—");

  const exportCSV = () => {
    const header = [
      "ID",
      "Title",
      "Assigned To",
      "Project",
      "Priority",
      "Status",
      "Completion",
      "Due Date",
      "Creator",
    ];
    const body = rows.map((r) => [
      r.id,
      r.title,
      r.assignedTo,
      r.project,
      r.priority,
      r.status,
      `${r.completion}%`,
      r.dueDate ? r.dueDate.toISOString() : "",
      r.creator,
    ]);

    const csv =
      [header, ...body]
        .map((row) =>
          row
            .map((cell) => {
              const s = String(cell ?? "");
              const escaped = s.replace(/"/g, '""');
              return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
            })
            .join(",")
        )
        .join("\n") + "\n";

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_").toLowerCase()}_tasks.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportXLSX = async () => {
    try {
      const XLSX = await import("xlsx");
      const sheetData = [
        [
          "ID",
          "Title",
          "Assigned To",
          "Project",
          "Priority",
          "Status",
          "Completion",
          "Due Date",
          "Creator",
        ],
        ...rows.map((r) => [
          r.id,
          r.title,
          r.assignedTo,
          r.project,
          r.priority,
          r.status,
          `${r.completion}%`,
          r.dueDate ? r.dueDate.toISOString() : "",
          r.creator,
        ]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Tasks");
      XLSX.writeFile(wb, `${title.replace(/\s+/g, "_").toLowerCase()}_tasks.xlsx`);
    } catch (err) {
      console.error(err);
      alert("Excel export needs the 'xlsx' package.\nRun: npm i xlsx\nOr use CSV export.");
    }
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Toolbar
          sx={{
            px: 2,
            py: 1.5,
            gap: 1,
            flexWrap: "wrap",
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Button

            onClick={handleNavigation}
            variant="outlined"
            sx={{ ml: "auto", whiteSpace: "nowrap" }}
          >
            + Add New Task
          </Button>

          <TextField
            size="small"
            placeholder="Search tasks…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={exportCSV}>
              Export CSV
            </Button>
            <Button variant="contained" onClick={exportXLSX}>
              Export Excel
            </Button>
          </Stack>
        </Toolbar>

        <TableContainer sx={{ maxHeight: 560 }}>
          <Table
            stickyHeader
            size="small"
            aria-label="tasks table"
            sx={{ tableLayout: "fixed", minWidth: 1100 }}
          >
            <TableHead>
              <TableRow>
                <TableCell width={72}>ID</TableCell>
                <TableCell sx={{ width: "32%" }}>Title</TableCell>
                <TableCell sx={{ width: "14%" }}>Assigned To</TableCell>
                <TableCell sx={{ width: "14%" }}>Project</TableCell>
                <TableCell sx={{ width: "10%" }}>Priority</TableCell>
                <TableCell sx={{ width: "12%" }}>Status</TableCell>
                <TableCell width={150}>Completion</TableCell>
                <TableCell width={180}>Due Date</TableCell>
                <TableCell sx={{ width: "12%" }}>Creator</TableCell>
                <TableCell width={56} align="center">View</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={10} sx={{ p: 0 }}>
                    <LinearProgress />
                  </TableCell>
                </TableRow>
              )}

              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    No tasks found.
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                rows.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>{r.id}</TableCell>

                    <TableCell sx={{ maxWidth: 480, overflow: "hidden" }}>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          pr: 1,
                          minWidth: 0,
                        }}
                        title={r.title}
                      >
                        {r.title}
                      </Typography>

                      {r.details ? (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            pr: 1,
                            minWidth: 0,
                          }}
                          title={r.details}
                        >
                          {r.details}
                        </Typography>
                      ) : null}
                    </TableCell>

                    <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.assignedTo || "—"}
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                        {r.projectColor ? (
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              bgcolor: r.projectColor,
                              border: "1px solid rgba(0,0,0,.1)",
                              flex: "0 0 auto",
                            }}
                          />
                        ) : null}
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={r.project}
                        >
                          {r.project || "—"}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={r.priority || "—"}
                        sx={{
                          bgcolor: r.priorityColor || "action.disabledBackground",
                          color: r.priorityColor
                            ? theme.palette.getContrastText(r.priorityColor)
                            : "text.secondary",
                          fontWeight: 700,
                          maxWidth: "100%",
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.status || "—"}
                    </TableCell>

                    <TableCell>
                      {r.showCompletion ? (
                        <Stack spacing={0.5}>
                          <LinearProgress
                            variant="determinate"
                            value={r.completion}
                            sx={{ height: 8, borderRadius: 5 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {r.completion}%
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.disabled">
                          Hidden
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>{fmtDate(r.dueDate)}</TableCell>

                    <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.creator || "—"}
                    </TableCell>

                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => goTaskDetails(r.id)}
                        aria-label="View details"
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.sev} sx={{ width: "100%" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
