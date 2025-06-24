import { useState, useEffect } from "react";
import {
  Grid, Card, CardContent, Typography, Box, CircularProgress,
  Button, CardActions, Avatar,useTheme
} from "@mui/material";
import { getProjects } from "../../../api/controller/admin_controller/task_controller/task_controller";
import { useNavigate } from "react-router-dom";

// Icons
import ListAltIcon from '@mui/icons-material/ListAlt';
import ChecklistIcon from '@mui/icons-material/Checklist';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { tokens } from "../../../theme";
const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  useEffect(() => {
    getProjects()
      .then((res) => {
        setProjects(res.data || []);
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
    <Box sx={{ p: 4, backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={700} color="primary.main">📋 Project Overview</Typography>
        <Box>
          <Button variant="contained" sx={{ mr: 1 }}>Add New</Button>
          <Button variant="outlined">Refresh</Button>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center"><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
        {projects.length > 0 ? (
          projects.map((project, index) => {
            const totalPhases = project.phaseCount;
            const totalTasks = project.taskCount;
            const completion = project.projectPercentage;
      
            // Determine completion status color
            const getCompletionColor = () => {
              if (completion > 80) return 'success';
              if (completion > 50) return 'warning';
              return 'error';
            };
      
            return (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    backgroundColor: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    },
                    border: '1px solid #e0e0e0',
                    overflow: 'hidden'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Project Header */}
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar
                        sx={{
                          bgcolor: colors.blueAccent[100],
                          width: 48,
                          height: 48,
                          mr: 2,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      >
                        <AccountTreeIcon sx={{ fontSize: 24, color: 'white' }} />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h6"
                          fontWeight={600}
                          sx={{
                            color: 'black',
                            mb: 0.5,
                            fontSize: '1.1rem'
                          }}
                        >
                          {project.project_name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ color: '#666' }}
                        >
                          {project.description || "No description available"}
                        </Typography>
                      </Box>
                    </Box>
      
                    {/* Project Metrics */}
                    <Box
                      sx={{
                        backgroundColor: 'white',
                        borderRadius: 2,
                        p: 2,
                        mb: 2,
                        border: '1px solid #eee'
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <ListAltIcon
                              fontSize="small"
                              sx={{
                                color: '#2196F3',
                                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                borderRadius: '50%',
                                p: 0.5
                              }}
                            />
                            <Box>
                              <Typography variant="caption" sx={{ color: '#666' }}>
                                PHASES
                              </Typography>
                              <Typography variant="body2" fontWeight={600} sx={{ color: 'black' }}>
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
                                color: '#4CAF50',
                                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                borderRadius: '50%',
                                p: 0.5
                              }}
                            />
                            <Box>
                              <Typography variant="caption" sx={{ color: '#666' }}>
                                TASKS
                              </Typography>
                              <Typography variant="body2" fontWeight={600} sx={{ color: 'black' }}>
                                {totalTasks}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
      
                    {/* Completion Progress */}
                    <Box
                      sx={{
                        backgroundColor: 'white',
                        borderRadius: 2,
                        p: 2,
                        border: '1px solid #eee'
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
                              color: getCompletionColor() === 'success' ? '#4CAF50' :
                                     getCompletionColor() === 'warning' ? '#FFC107' : '#F44336',
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
                              color: 'black'
                            }}
                          >
                            {completion}%
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={600} sx={{ color: '#666' }}>
                            Completion
                          </Typography>
                          <Typography variant="h6" fontWeight={700} sx={{ color: 'black' }}>
                            {completion}%
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
      
                  {/* Action Button */}
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
                        backgroundColor: colors.blueAccent[100],
                        color: 'white',
                        '&:hover': {
                          backgroundColor: '#1976D2',
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
              backgroundColor: 'white',
              borderRadius: 2,
              p: 3,
              display: 'inline-block',
              border: '1px dashed #ccc'
            }}>
              <Typography variant="h6" sx={{ color: '#666' }} gutterBottom>
                No Projects Found
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }} gutterBottom>
                Create a new project to get started
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  borderColor: '#2196F3',
                  color: colors.blueAccent[100],
                  '&:hover': {
                    borderColor: '#1976D2',
                    backgroundColor: 'rgba(33, 150, 243, 0.04)'
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
