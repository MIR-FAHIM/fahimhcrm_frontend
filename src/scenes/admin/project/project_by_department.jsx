import { useState, useEffect } from "react";
import {
  Grid, Card, CardContent, Typography, Box, CircularProgress,
  Button, CardActions, Avatar, useTheme
} from "@mui/material";
import { getProjectsByDepartment } from "../../../api/controller/admin_controller/task_controller/task_controller";
import { useNavigate, useParams } from "react-router-dom";

// Icons
import ListAltIcon from '@mui/icons-material/ListAlt';
import ChecklistIcon from '@mui/icons-material/Checklist';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AddIcon from '@mui/icons-material/Add';
import { tokens } from "../../../theme";

const ProjectListByDepartment = () => {
  const [projects, setProjects] = useState([]);
  const [departmentName, setDepartmentName] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
    const { id } = useParams();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    getProjectsByDepartment(id)
      .then((res) => {
        setProjects(res.data || []);
        setDepartmentName(res.department || '');
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
        setLoading(false);
      });
  }, []);

  const handleProjectDetail = (projectId) => {
    navigate(`/project-detail-tab/${projectId}`);
  };

  return (
    <Box sx={{ p: 4, backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h5" fontWeight={700} sx={{ color: colors.gray[100] }}>📋 {departmentName} Department Project Overview</Typography>
        <Box>
          <Button
            variant="contained"
            sx={{
              mr: 1,
              backgroundColor: colors.greenAccent[500],
              color: colors.gray[500],
              "&:hover": {
                backgroundColor: colors.greenAccent[700],
              }
            }}
          >
            Add New
          </Button>
          <Button
            variant="outlined"
            sx={{
              color: colors.blueAccent[500],
              borderColor: colors.blueAccent[500],
              "&:hover": {
                backgroundColor: colors.blueAccent[700],
                color: colors.gray[500],
                borderColor: colors.blueAccent[700],
              }
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center"><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {projects.length > 0 ? (
            projects.map((project) => {
              const totalPhases = project.phaseCount;
              const totalTasks = project.taskCount;
              const completion = project.projectPercentage;

              const getCompletionColor = () => {
                if (completion > 80) return colors.greenAccent[500];
                if (completion > 50) return colors.blueAccent[500];
                return colors.redAccent[500];
              };

              return (
                <Grid item xs={12} sm={6} md={4} key={project.id}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      backgroundColor: theme.palette.background.paper,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      },
                      border: `1px solid ${theme.palette.divider}`,
                      overflow: 'hidden'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar
                          sx={{
                            bgcolor: colors.blueAccent[500],
                            width: 48,
                            height: 48,
                            mr: 2,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          }}
                        >
                          <AccountTreeIcon sx={{ fontSize: 24, color: colors.primary[900] }} />
                        </Avatar>
                        <Box>
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{
                              color: colors.gray[100],
                              mb: 0.5,
                              fontSize: '1.1rem'
                            }}
                          >
                            {project.project_name}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: colors.gray[400] }}
                          >
                            {project.description || "No description available"}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="body2" sx={{ color: colors.gray[400] }}>
                              Department:
                            </Typography>
                            <Box
                              sx={{
                                backgroundColor: theme.palette.info.main,
                                color: theme.palette.info.contrastText,
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                fontSize: '0.875rem',
                                display: 'inline-block',
                              }}
                            >
                              {project.department.department_name || "No description available"}
                            </Box>
                          </Box>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          backgroundColor: colors.gray[900],
                          borderRadius: 2,
                          p: 2,
                          mb: 2,
                          border: `1px solid ${theme.palette.divider}`
                        }}
                      >
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <ListAltIcon
                                fontSize="small"
                                sx={{
                                  color: colors.blueAccent[500],
                                  backgroundColor: colors.blueAccent[700],
                                  borderRadius: '50%',
                                  p: 0.5
                                }}
                              />
                              <Box>
                                <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                                  PHASES
                                </Typography>
                                <Typography variant="body2" fontWeight={600} sx={{ color: colors.gray[100] }}>
                                  {totalPhases}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <ChecklistIcon
                                fontSize="small"
                                sx={{
                                  color: colors.greenAccent[500],
                                  backgroundColor: colors.greenAccent[700],
                                  borderRadius: '50%',
                                  p: 0.5
                                }}
                              />
                              <Box>
                                <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                                  TASKS
                                </Typography>
                                <Typography variant="body2" fontWeight={600} sx={{ color: colors.gray[100] }}>
                                  {totalTasks}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>

                      <Box
                        sx={{
                          backgroundColor: colors.gray[900],
                          borderRadius: 2,
                          p: 2,
                          border: `1px solid ${theme.palette.divider}`
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box sx={{ position: 'relative', width: 50, height: 50 }}>
                            <CircularProgress
                              variant="determinate"
                              value={completion}
                              size={50}
                              thickness={4}
                              sx={{
                                color: getCompletionColor(),
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                zIndex: 1
                              }}
                            />
                            <CircularProgress
                              variant="determinate"
                              value={100}
                              size={50}
                              thickness={4}
                              sx={{
                                color: colors.primary[700],
                                position: 'absolute',
                                top: 0,
                                left: 0
                              }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                fontWeight: 'bold',
                                color: colors.gray[100],
                                zIndex: 2
                              }}
                            >
                              {completion}%
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight={600} sx={{ color: colors.gray[400] }}>
                              Completion
                            </Typography>
                            <Typography variant="h6" fontWeight={700} sx={{ color: colors.gray[100] }}>
                              {completion}%
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
                          fontWeight: 600,
                          py: 1.5,
                          borderRadius: 2,
                          backgroundColor: colors.blueAccent[500],
                          color: colors.primary[900],
                          '&:hover': {
                            backgroundColor: colors.blueAccent[700],
                          },
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
            <Box sx={{ textAlign: 'center', width: '100%', p: 4 }}>
              <Box sx={{
                backgroundColor: theme.palette.background.paper,
                borderRadius: 2,
                p: 3,
                display: 'inline-block',
                border: `1px dashed ${colors.gray[600]}`
              }}>
                <Typography variant="h6" sx={{ color: colors.gray[400] }} gutterBottom>
                  No Projects Found
                </Typography>
                <Typography variant="body2" sx={{ color: colors.gray[400] }} gutterBottom>
                  Create a new project to get started
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    borderColor: colors.blueAccent[500],
                    color: colors.blueAccent[500],
                    '&:hover': {
                      borderColor: colors.blueAccent[700],
                      backgroundColor: colors.blueAccent[700],
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

export default ProjectListByDepartment;