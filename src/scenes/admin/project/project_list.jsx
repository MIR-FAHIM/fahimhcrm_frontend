import { useState, useEffect, useMemo } from "react";
import {
  Grid, Card, CardContent, Typography, Box, CircularProgress,
  Button, Avatar, IconButton, Chip, Tooltip, TextField, MenuItem,
  useTheme, Skeleton
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ChecklistIcon from "@mui/icons-material/Checklist";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";
import { getProjects } from "../../../api/controller/admin_controller/task_controller/task_controller";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../../theme";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [sortKey, setSortKey] = useState("updated"); // updated | completion | name

  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await getProjects();
      setProjects(res?.data || []);
    } catch (e) {
      console.error("Error fetching projects:", e);
    } finally {
      setLoading(false);
    }
  };

  const uniqueDepartments = useMemo(() => {
    const set = new Set(
      (projects || [])
        .map(p => p?.department?.department_name)
        .filter(Boolean)
    );
    return ["all", ...Array.from(set)];
  }, [projects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = projects || [];
    if (deptFilter !== "all") {
      list = list.filter(p => (p.department?.department_name || "").toLowerCase() === deptFilter.toLowerCase());
    }
    if (q) {
      list = list.filter(p =>
        [p.project_name, p.description, p?.department?.department_name]
          .filter(Boolean)
          .some(v => String(v).toLowerCase().includes(q))
      );
    }
    // sorting
    const byUpdated = (a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0);
    const byCompletion = (a, b) => (b.projectPercentage || 0) - (a.projectPercentage || 0);
    const byName = (a, b) => String(a.project_name || "").localeCompare(String(b.project_name || ""));
    const cmp = sortKey === "completion" ? byCompletion : sortKey === "name" ? byName : byUpdated;
    return [...list].sort(cmp);
  }, [projects, query, deptFilter, sortKey]);

  const handleProjectDetail = (projectId) => navigate(`/project-detail-tab/${projectId}`);
  const handleAddProject = () => navigate(`/add-project`);

  const completionColor = (pct) => {
    if (pct >= 80) return colors.greenAccent[500];
    if (pct >= 50) return colors.blueAccent[500];
    return colors.redAccent[500];
  };

  return (
    <Box sx={{ p: 4, bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
      {/* Toolbar */}
      <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap" mb={3}>
        <Typography variant="h4" fontWeight={800} sx={{ color: colors.gray[100], mr: 1 }}>
          📋 Project Overview
        </Typography>

        <TextField
          size="small"
          placeholder="Search projects, descriptions, departments"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: colors.gray[400] }} /> }}
          sx={{
            minWidth: 300,
            "& .MuiOutlinedInput-root": { bgcolor: theme.palette.background.paper, color: colors.gray[100] },
            "& fieldset": { borderColor: colors.gray[700] }
          }}
        />

        <TextField
          select
          size="small"
          label="Department"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          sx={{
            minWidth: 200,
            "& .MuiOutlinedInput-root": { bgcolor: theme.palette.background.paper, color: colors.gray[100] },
            "& fieldset": { borderColor: colors.gray[700] }
          }}
        >
          {uniqueDepartments.map(v => (
            <MenuItem key={v} value={v}>{v === "all" ? "All Departments" : v}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Sort by"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          sx={{
            minWidth: 160,
            "& .MuiOutlinedInput-root": { bgcolor: theme.palette.background.paper, color: colors.gray[100] },
            "& fieldset": { borderColor: colors.gray[700] }
          }}
        >
          <MenuItem value="updated"><SortIcon fontSize="small" sx={{ mr: 1 }} />Recently Updated</MenuItem>
          <MenuItem value="completion"><SortIcon fontSize="small" sx={{ mr: 1 }} />Completion</MenuItem>
          <MenuItem value="name"><SortIcon fontSize="small" sx={{ mr: 1 }} />Name</MenuItem>
        </TextField>

        <Box sx={{ ml: { xs: 0, md: "auto" }, display: "flex", gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchProjects} sx={{ color: colors.blueAccent[300], border: `1px solid ${colors.blueAccent[500]}` }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
           onClick={() => handleAddProject()}  
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              bgcolor: colors.blueAccent[500],
              color: colors.gray[900],
              "&:hover": { bgcolor: colors.greenAccent[700] }
            }}
          >
            Add New
          </Button>
        </Box>
      </Box>

      {/* Content */}
      {loading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card sx={{ p: 2, bgcolor: theme.palette.background.paper, borderRadius: 2, border: `1px solid ${colors.gray[700]}` }}>
                <Skeleton variant="text" height={28} sx={{ bgcolor: colors.gray[800] }} />
                <Skeleton variant="rectangular" height={40} sx={{ my: 2, bgcolor: colors.gray[800] }} />
                <Skeleton variant="rectangular" height={120} sx={{ bgcolor: colors.gray[800] }} />
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {filtered.length > 0 ? (
            filtered.map((project) => {
              const totalPhases = project?.phaseCount ?? 0;
              const totalTasks = project?.taskCount ?? 0;
              const completion = Math.max(0, Math.min(100, Number(project?.projectPercentage ?? 0)));
              const depName = project?.department?.department_name || "Unassigned";
              const updated = project?.updated_at || project?.created_at;

              return (
                <Grid item xs={12} sm={6} md={4} key={project.id}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      bgcolor: theme.palette.background.paper,
                      boxShadow: 3,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: 6 },
                      border: `1px solid ${colors.gray[700]}`,
                      overflow: 'hidden'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar
                          sx={{
                            bgcolor: project?.color_code || colors.blueAccent[500],
                            width: 48,
                            height: 48,
                            mr: 2,
                            boxShadow: theme.shadows[2]
                          }}
                        >
                          <AccountTreeIcon sx={{ fontSize: 24, color: colors.primary[900] }} />
                        </Avatar>
                        <Box minWidth={0}>
                          <Typography
                            variant="h6"
                            sx={{ color: colors.gray[100], fontWeight: 800, mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            title={project.project_name}
                          >
                            {project.project_name}
                          </Typography>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: "wrap" }}>
                            <Chip
                              size="small"
                              label={depName}
                              sx={{ bgcolor: colors.blueAccent[400], color: colors.gray[900], fontWeight: 700 }}
                            />
                            {updated && (
                              <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                                • Updated {new Date(updated).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>

                          {project.description && (
                            <Typography
                              variant="body2"
                              sx={{ color: colors.gray[400], mt: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                            >
                              {project.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Metrics row */}
                      <Box
                        sx={{
                          bgcolor: colors.gray[900],
                          borderRadius: 2,
                          p: 1.5,
                          mb: 2,
                          border: `1px solid ${colors.gray[800]}`
                        }}
                      >
                        <Box display="flex" gap={2} flexWrap="wrap">
                          <Box display="flex" alignItems="center" gap={1}>
                            <ListAltIcon
                              fontSize="small"
                              sx={{
                                color: colors.gray[900],
                                bgcolor: project?.color_code || colors.blueAccent[700],
                                borderRadius: '50%',
                                p: 0.5
                              }}
                            />
                            <Box>
                              <Typography variant="caption" sx={{ color: colors.gray[400] }}>PHASES</Typography>
                              <Typography variant="body2" sx={{ color: colors.gray[100], fontWeight: 700 }}>{totalPhases}</Typography>
                            </Box>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <ChecklistIcon
                              fontSize="small"
                              sx={{
                                color: colors.greenAccent[300],
                                bgcolor: colors.greenAccent[700],
                                borderRadius: '50%',
                                p: 0.5
                              }}
                            />
                            <Box>
                              <Typography variant="caption" sx={{ color: colors.gray[400] }}>TASKS</Typography>
                              <Typography variant="body2" sx={{ color: colors.gray[100], fontWeight: 700 }}>{totalTasks}</Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>

                      {/* Completion radial */}
                      <Box
                        sx={{
                          bgcolor: colors.gray[900],
                          borderRadius: 2,
                          p: 1.5,
                          border: `1px solid ${colors.gray[800]}`
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box sx={{ position: 'relative', width: 56, height: 56 }}>
                            <CircularProgress
                              variant="determinate"
                              value={100}
                              size={56}
                              thickness={4}
                              sx={{ color: colors.primary[700], position: 'absolute', top: 0, left: 0 }}
                            />
                            <CircularProgress
                              variant="determinate"
                              value={completion}
                              size={56}
                              thickness={4}
                              sx={{ color: completionColor(completion), position: 'absolute', top: 0, left: 0 }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                fontWeight: 800,
                                color: colors.gray[100]
                              }}
                            >
                              {completion}%
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ color: colors.gray[300] }}>Completion</Typography>
                            <Typography variant="h6" sx={{ color:  colors.gray[100], fontWeight: 400 }}>
                              {completion}% {completion >= 80 ? "· On track" : completion >= 50 ? "· Keep momentum" : "· Needs attention"}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>

                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => handleProjectDetail(project.id)}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          py: 1.25,
                          borderRadius: 2,
                          bgcolor:colors.blueAccent[500],
                          color: colors.primary[900],
                          '&:hover': { bgcolor: colors.blueAccent[700] },
                        }}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              );
            })
          ) : (
            <Box sx={{ textAlign: 'center', width: '100%', p: 6 }}>
              <Box sx={{
                bgcolor: theme.palette.background.paper,
                borderRadius: 2,
                p: 4,
                display: 'inline-block',
                border: `1px dashed ${colors.gray[700]}`
              }}>
                <Typography variant="h6" sx={{ color: colors.gray[300], fontWeight: 700 }} gutterBottom>
                  No Projects Found
                </Typography>
                <Typography variant="body2" sx={{ color: colors.gray[400] }} gutterBottom>
                  Create a project to get started.
                </Typography>
                <Button
                onClick={() => handleAddProject()}  
                  variant="outlined"
                  startIcon={<AddIcon />}
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    borderColor: colors.blueAccent[500],
                    color: colors.blueAccent[300],
                    '&:hover': {
                      borderColor: colors.blueAccent[700],
                      bgcolor: colors.blueAccent[700],
                      color: colors.primary[900],
                    }
                  }}
                >
                  Add Project
                </Button>
              </Box>
            </Box>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default ProjectList;
