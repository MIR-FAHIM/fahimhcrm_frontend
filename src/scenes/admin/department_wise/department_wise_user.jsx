import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Grid,
  Avatar,
  ButtonBase,
  Divider,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  Tooltip,
  TextField,
  useTheme,
  Skeleton,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import GroupIcon from "@mui/icons-material/Group";
import SearchIcon from "@mui/icons-material/Search";
import { fetchDepartmentWiseEmp } from "../../../api/controller/admin_controller/department_controller";
import { tokens } from "../../../theme";
import { useNavigate } from "react-router-dom";

// percentage helper
const pct = (n, d) => (d > 0 ? Math.round((n / d) * 100) : 0);

// status color palette (matches API keys)
const statusPalette = (colors) => ({
  Completed: { bg: colors.blueAccent[700], text: colors.gray[100] },
  Ongoing: { bg: colors.blueAccent[700], text: colors.blueAccent[200] },
  "Need Explanation": { bg: colors.orangeAccent[700], text: colors.orangeAccent[200] },
  Paused: { bg: colors.gray[800], text: colors.gray[200] },
  "New Task": { bg: colors.purpleAccent[700], text: colors.purpleAccent[200] },
});

const StatusBar = ({ counts = {}, colors }) => {
  const pal = statusPalette(colors);
  const order = ["Completed", "Ongoing", "Need Explanation", "Paused", "New Task"];
  const total = order.reduce((s, k) => s + (counts[k] || 0), 0);
  return (
    <Box sx={{ display: "flex", height: 8, borderRadius: 999, overflow: "hidden", bgcolor: colors.gray[800] }}>
      {order.map((k) => (
        <Box key={k} sx={{ width: `${pct(counts[k] || 0, total)}%`, bgcolor: pal[k].bg }} />
      ))}
    </Box>
  );
};

const insightText = (dept) => {
  const c = dept?.task_status_counts || {};
  const done = c["Completed"] || 0;
  const ongoing = c["Ongoing"] || 0;
  const needExp = c["Need Explanation"] || 0;
  const paused = c["Paused"] || 0;
  const fresh = c["New Task"] || 0;
  const total = done + ongoing + needExp + paused + fresh;
  if (total === 0) return "No recorded tasks yet. Encourage the team to log work for visibility.";
  const donePct = pct(done, total);
  if (donePct >= 60 && paused <= fresh) return "Throughput is strong—consider pulling next-sprint goals or tackling tech debt.";
  if (needExp > Math.max(ongoing, paused)) return "Many items need clarification—schedule a grooming session to unblock execution.";
  if (paused > ongoing && paused > fresh) return "Too many paused tasks—review blockers and reassign or descoped stalled work.";
  if (fresh > ongoing && donePct < 40) return "New work is outpacing progress—limit WIP and prioritize highest impact tasks.";
  return "Steady flow—focus standups on converting ongoing tasks to completed.";
};

const metricChip = (icon, label, value, color) => (
  <Chip
    icon={icon}
    label={`${label}: ${value}`}
    sx={{ bgcolor: color.bg, color: color.text, "& .MuiChip-icon": { color: color.text }, fontWeight: 600 }}
    size="small"
  />
);

const DepartmentWiseEmp = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => { fetchDepartmentWiseEmpData(); }, []);

  const fetchDepartmentWiseEmpData = async () => {
    setLoading(true);
    try {
      const response = await fetchDepartmentWiseEmp();
      setDepartments(response.data || []);
    } catch (error) {
      console.error("Error fetching department data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter((d) => {
      const inDept = d.department_name?.toLowerCase().includes(q);
      const inUsers = (d.users || []).some((u) =>
        [u.name, u.email, u.phone].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
      );
      return inDept || inUsers;
    });
  }, [departments, query]);

  const countsFrom = (dept) => {
    const c = dept?.task_status_counts || {};
    return {
      employees: dept?.employee_count ?? (dept?.users?.length || 0),
      projects: dept?.projects_count ?? 0,
      tasks: dept?.task_count ?? 0,
      // explicit API keys
      Completed: c["Completed"] || 0,
      Ongoing: c["Ongoing"] || 0,
      NeedExplanation: c["Need Explanation"] || 0,
      Paused: c["Paused"] || 0,
      NewTask: c["New Task"] || 0,
      raw: c,
    };
  };

  const onEmp = (id) => navigate(`/employee-profile/${id}`);
  const onDeptProjects = (departmentID) => navigate(`/project-by-department/${departmentID}`);
  const onDeptTasks = (departmentID) => navigate(`/task-department/${departmentID}`);

  return (
    <Box p={3} sx={{ bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      {/* Header Bar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: colors.gray[100] }}>Departments & Teams</Typography>
        <Box sx={{ ml: { xs: 0, md: "auto" }, display: "flex", gap: 1, alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Search department or people"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: colors.gray[400] }} /> }}
            sx={{ minWidth: 280, "& .MuiOutlinedInput-root": { bgcolor: theme.palette.background.paper, color: colors.gray[100] }, "& fieldset": { borderColor: colors.gray[700] } }}
          />
          <Tooltip title="Refresh">
            <IconButton onClick={fetchDepartmentWiseEmpData} sx={{ color: colors.blueAccent[300] }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Loading State */}
      {loading && (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Paper sx={{ p: 3, bgcolor: theme.palette.background.paper, borderRadius: 2 }}>
                <Skeleton variant="text" height={28} sx={{ bgcolor: colors.gray[800] }} />
                <Skeleton variant="rectangular" height={12} sx={{ my: 2, bgcolor: colors.gray[800] }} />
                <Skeleton variant="rectangular" height={180} sx={{ bgcolor: colors.gray[800] }} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <Paper sx={{ p: 4, textAlign: "center", bgcolor: theme.palette.background.paper, borderRadius: 2 }}>
          <InfoOutlinedIcon sx={{ fontSize: 36, color: colors.gray[400] }} />
          <Typography sx={{ color: colors.gray[300], mt: 1 }}>No departments match your search.</Typography>
        </Paper>
      )}

      {!loading && filtered.length > 0 && (
        <Grid container spacing={3}>
          {filtered.map((department) => {
            const m = countsFrom(department);
            const pal = statusPalette(colors);
            return (
              <Grid item key={department.id} xs={12} sm={6} md={4} lg={4}>
                <Paper
                  sx={{
                    p: 2.5,
                    bgcolor: theme.palette.background.paper,
                    borderRadius: 2,
                    boxShadow: 3,
                    border: `1px solid ${colors.gray[700]}`,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": { transform: "translateY(-2px)", boxShadow: 6 },
                  }}
                >
                  {/* Title & Metrics */}
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: colors.greenAccent[400], mr: 1 }}>
                      {department.department_name}
                    </Typography>
                    <Tooltip title="Department insights" placement="right">
                      <InfoOutlinedIcon sx={{ color: colors.gray[400] }} />
                    </Tooltip>
                  </Box>

                  {/* Metric chips */}
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
                    {metricChip(<GroupIcon fontSize="small" />, "Employees", m.employees, { bg: colors.gray[800], text: colors.gray[100] })}
                    {metricChip(<WorkspacesIcon fontSize="small" />, "Projects", m.projects, { bg: colors.blueAccent[700], text: colors.blueAccent[200] })}
                    {metricChip(<PendingActionsIcon fontSize="small" />, "Tasks", m.tasks, { bg: colors.purpleAccent[700], text: colors.purpleAccent[200] })}
                    {metricChip(<AssignmentTurnedInIcon fontSize="small" />, "Completed", m.Completed, { bg: pal.Completed.bg, text: pal.Completed.text })}
                    {metricChip(<PendingActionsIcon fontSize="small" />, "Ongoing", m.Ongoing, { bg: pal.Ongoing.bg, text: pal.Ongoing.text })}
                  </Box>

                  {/* Progress Bar (all statuses) */}
                  <StatusBar counts={m.raw} colors={colors} />

                  {/* Tips / Insight */}
                  <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 2, bgcolor: colors.gray[900], border: `1px dashed ${colors.gray[700]}` }}>
                    <Typography variant="body2" sx={{ color: colors.gray[300], display: "flex", alignItems: "center", gap: 1 }}>
                      <TrendingUpIcon fontSize="small" sx={{ color: colors.orangeAccent[500] }} />
                      {insightText(department)}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2, borderColor: colors.gray[700] }} />

                  {/* Quick Actions */}
                  <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
                    <Button
                      onClick={() => onDeptProjects(department.id)}
                      variant="outlined"
                      size="small"
                      sx={{ color: colors.blueAccent[300], borderColor: colors.blueAccent[500], "&:hover": { bgcolor: colors.blueAccent[700], color: colors.primary[900] } }}
                    >
                      View Projects
                    </Button>
                    <Button
                      onClick={() => onDeptTasks(department.id)}
                      variant="contained"
                      size="small"
                      sx={{ bgcolor: colors.greenAccent[500], color: colors.gray[900], "&:hover": { bgcolor: colors.greenAccent[700] } }}
                      endIcon={<ArrowForwardIcon />}
                    >
                      Tasks
                    </Button>
                  </Box>

                  {/* Task Overview grid with explicit keys and color badges */}
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: colors.gray[300], mb: 0.5 }}>Task Overview</Typography>
                    <Grid container spacing={1.2}>
                      {[
                        { key: "Completed", value: m.Completed },
                        { key: "Ongoing", value: m.Ongoing },
                        { key: "Need Explanation", value: m.NeedExplanation },
                        { key: "Paused", value: m.Paused },
                        { key: "New Task", value: m.NewTask },
                      ].map((item) => (
                        <Grid item xs={6} key={item.key}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1, borderRadius: 1, bgcolor: colors.gray[900], border: `1px solid ${colors.gray[800]}` }}>
                            <Typography variant="body2" sx={{ color: colors.gray[300] }}>{item.key}</Typography>
                            <Chip size="small" label={item.value} sx={{ bgcolor: statusPalette(colors)[item.key].bg, color: statusPalette(colors)[item.key].text, fontWeight: 700 }} />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 2, borderColor: colors.gray[700] }} />

                  {/* Employee List */}
                  {department.users && department.users.length > 0 ? (
                    <List sx={{ maxHeight: 260, overflowY: "auto", pr: 1 }}>
                      {department.users.map((employee) => (
                        <ButtonBase key={employee.id} onClick={() => onEmp(employee.id)} sx={{ width: "100%", textAlign: "left", borderRadius: 1 }}>
                          <ListItem sx={{ px: 1, py: 1, borderRadius: 1, "&:hover": { bgcolor: colors.gray[900] } }}>
                            <Avatar sx={{ bgcolor: colors.blueAccent[500], mr: 1.5 }} src={employee.photo ? `${employee.photo}` : ""}>
                              {employee.name?.[0]}
                            </Avatar>
                            <ListItemText
                              primary={<Typography sx={{ color: colors.gray[100], fontWeight: 600 }}>{employee.name}</Typography>}
                              secondary={
                                <>
                                  <Typography variant="body2" sx={{ color: colors.gray[400] }}>Email: {employee.email}</Typography>
                                  <Typography variant="body2" sx={{ color: colors.gray[400] }}>Phone: {employee.phone}</Typography>
                                </>
                              }
                            />
                          </ListItem>
                        </ButtonBase>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" sx={{ color: colors.gray[400] }} align="center">
                      No employees in this department
                    </Typography>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default DepartmentWiseEmp;
