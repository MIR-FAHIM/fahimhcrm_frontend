import { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from "dayjs";
import {
  Box, Typography, CircularProgress, Button, Card, CardContent, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Grid, Tooltip, Stack, Divider, Slider, useTheme
} from "@mui/material";
import { tokens } from "../../../../theme";
import {
  getProjectsPhases,
  addPhase
} from "../../../../api/controller/admin_controller/task_controller/task_controller";
import {
  getProjectDetails,
  updateProjectPhase

} from "../../../../api/controller/admin_controller/project/project_controller";
// Icons
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';


const ProjectPhases = ({protId}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [phases, setPhases] = useState([]);
  const [projectDetails, setProjectDetails] = useState({});
  const [taskCount, setTaskCount] = useState(0);
  const [projectPercentage, setProjectPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [phaseId, setPhaseId] = useState(0);
  const [projectId, setProjectId] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [openSliderModal, setOpenSliderModal] = useState(false);
  const [sliderValue, setSliderValue] = useState(0); // initial value
  const [phaseName, setPhaseName] = useState(''); // initial value

  const handleOpenModalSlider = (id, sliderVal,phaseName) => {
    setPhaseName(phaseName);
    setSliderValue(sliderVal);
    setPhaseId(id);
    setOpenSliderModal(true);
  };
  const handleCloseModalSlider = () => setOpenSliderModal(false);
  const handleUpdatePhase = async () => {

    const data = {
      phase_completion_percentage: sliderValue,
    };
    await updateProjectPhase(phaseId, data);
    await fetchPhases();
    await getProDetails();
    handleCloseModalSlider();


  };
  const [formData, setFormData] = useState({
    project_id: protId,
    phase_name: '',
    phase_order_id: '',
    description: '',
    status: '0',
    priority: '',
    phase_completion_percentage: ''
  });

  useEffect(() => {
    fetchPhases();
    getProDetails();
  }, []);

  const fetchPhases = () => {
    setLoading(true);
    getProjectsPhases(protId)
      .then((res) => {
        setPhases(res.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching phases:", error);
        setLoading(false);
      });
  };
  const getProDetails = () => {
    setLoading(true);
    getProjectDetails(protId)
      .then((res) => {
        setProjectDetails(res.data || {});
        setTaskCount(res.task_count || 0);
        setProjectPercentage(res.project_percentage || 0);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching setProjectDetails:", error);
        setLoading(false);
      });
  };
  const handleAddTask = (phaseID) => {
    setPhaseId(phaseID);

    navigate("/add-task", {
      state: {
        'project_id': parseInt(protId),
        'project_phase_id': phaseID,
      },
    });

  };
  const handleAddPhase = () => {

    setModalOpen(true);
  };
  const handlePhaseTaskNavigate = (phaseID) => {
    navigate(`/project-phase-task/${phaseID}`);

  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormData({
      project_id: id,
      phase_name: '',
      phase_order_id: '',
      description: '',
      status: '0',
      priority: '',
      phase_completion_percentage: ''
    });
  };

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async () => {
    const payload = new FormData();
    for (const key in formData) {
      payload.append(key, formData[key]);
    }

    try {
      await addPhase(payload);
      handleCloseModal();
      fetchPhases();
    } catch (error) {
      console.error("Error adding phase:", error);
    }
  };

  return (
    <Box
      sx={{
        display: { xs: 'block', md: 'flex' },
        minHeight: '100vh',
        backgroundColor: colors.bg[100],
        px: { xs: 1, sm: 2 },
      }}
    >
     


      {/* Right Panel */}
      <Box sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight={700} color="primary.main">
            🛠️ Project Phases
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlaylistAddIcon />}
            onClick={handleAddPhase}
          >
            Add Phase
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={6}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {phases.map((phase, index) => (

              <Grid item xs={12} sm={6} md={4} lg={3} key={phase.id} >
                <Box key={phase.id} display="flex" alignItems="center" onClick={() => handleOpenModalSlider(phase.id, phase.phase_completion_percentage, phase.phase_name)}>
                  {/* Phase Card */}
                  <Box
                    sx={{
                      border: '1px solid #ddd',
                      borderRadius: 3,
                      p: 3,
                      backgroundColor: colors.bg[100],
                      width: '100%',
                      maxWidth: 300,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      boxShadow: 3,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      },
                    }}
                  >
                    {/* Circular Progress */}
                    <Box
                      sx={{
                        position: 'relative',
                        width: 150,
                        height: 150,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CircularProgress
                        variant="determinate"
                        value={100}
                        size={150}
                        thickness={5}
                        sx={{ position: 'absolute', color: '#eee' }}
                      />
                      <CircularProgress
                        variant="determinate"
                        value={parseInt(phase.phase_completion_percentage)}
                        size={150}
                        thickness={5}
                        sx={{ position: 'absolute', color: '#1976d2' }}
                      />

                      <Card
                        sx={{
                          width: 115,
                          height: 115,
                          borderRadius: '50%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          textAlign: 'center',
                          boxShadow: 3,
                          backgroundColor: colors.bg[100],
                          zIndex: 2,
                          px: 1,
                        }}
                      >
                        <CardContent sx={{ p: 0 }}>
                          <Tooltip title={phase.description || 'No description'}>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={700}>
                                {phase.phase_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {phase.phase_completion_percentage}% done
                              </Typography>
                            </Box>
                          </Tooltip>
                        </CardContent>
                      </Card>
                    </Box>

                    {/* Phase Meta Details */}
                    <Box sx={{ mt: 2, width: '100%' }}>
                      <Typography variant="body2" gutterBottom><strong>Start:  </strong>{dayjs(phase.start_date).format("MMM D, YYYY")}</Typography>
                      <Typography variant="body2" gutterBottom><strong>End:  </strong>{dayjs(phase.end_date).format("MMM D, YYYY")}</Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2"><strong>Total Tasks:</strong> {phase.total_tasks || 0}</Typography>
                      <Typography variant="body2"><strong>Completed:</strong> {phase.completed_tasks || 0}</Typography>
                      <Typography variant="body2"><strong>Pending:</strong> {phase.pending_tasks || 0}</Typography>
                    </Box>

                    {/* Buttons */}
                    <Stack direction={{ xs: 'column', sm: 'row' }}
                      spacing={1}
                      mt={2}
                      width="100%">
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleAddTask(phase.id)}
                      >
                        Add Task
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handlePhaseTaskNavigate(phase.id)}
                      >
                        View Task
                      </Button>
                    </Stack>
                  </Box>

                  {/* Connector Line */}
                  {index < phases.length - 1 && (
                    <Box
                      sx={{
                        width: 40,
                        height: 2,
                        backgroundColor: "#90caf9",
                        alignSelf: 'center',
                        mx: 1
                      }}
                    />
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>



        )}

        {/* Modal */}
        <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
          <DialogTitle>Add New Phase</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} mt={1}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phase Name"
                  value={formData.phase_name}
                  onChange={handleChange("phase_name")}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Phase Order ID"
                  type="number"
                  value={formData.phase_order_id}
                  onChange={handleChange("phase_order_id")}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Priority"
                  type="number"
                  value={formData.priority}
                  onChange={handleChange("priority")}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={formData.description}
                  onChange={handleChange("description")}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Completion (%)"
                  type="number"
                  value={formData.phase_completion_percentage}
                  onChange={handleChange("phase_completion_percentage")}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.start_date}
                  onChange={handleChange("start_date")}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.end_date}
                  onChange={handleChange("end_date")}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Status"
                  type="number"
                  value={formData.status}
                  onChange={handleChange("status")}
                  helperText="0 = Pending, 1 = Completed"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit}>Save</Button>
          </DialogActions>
        </Dialog>

        {/* Modal for update phase */}

        <Dialog
  open={openSliderModal}
  onClose={handleCloseModalSlider}
  fullWidth
  maxWidth="sm"
  PaperProps={{
    sx: {
      borderRadius: 4,
      p: 2,
      backgroundColor: '#fefefe',
      boxShadow: 8,
    },
  }}
>
  <DialogTitle sx={{ fontWeight: 600, fontSize: '1.5rem', pb: 1 }}>
    Update "{phaseName}" Phase
  </DialogTitle>

  <DialogContent sx={{ mt: 1 }}>
    <Typography variant="subtitle1" color="text.secondary" mb={3}>
      Your Current Completion For This Phase is {sliderValue}.
    </Typography>

    <Slider
      value={sliderValue}
      onChange={(e, newValue) => setSliderValue(newValue)}
      aria-labelledby="slider"
      valueLabelDisplay="on"
      min={0}
      max={100}
      sx={{
        color: '#1976d2',
        height: 6,
        '& .MuiSlider-thumb': {
          height: 24,
          width: 24,
          backgroundColor: '#fff',
          border: '2px solid currentColor',
        },
        '& .MuiSlider-track': {
          border: 'none',
        },
        '& .MuiSlider-rail': {
          opacity: 0.5,
          backgroundColor: '#bfbfbf',
        },
      }}
    />
  </DialogContent>

  <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
    <Button onClick={handleCloseModalSlider} color="primary" sx={{ fontWeight: 500 }}>
      Cancel
    </Button>
    <Button
      variant="contained"
      onClick={handleUpdatePhase}
      sx={{ fontWeight: 600, borderRadius: 2 }}
    >
      Save
    </Button>
  </DialogActions>
</Dialog>



      </Box>



    </Box>

  );
};

export default ProjectPhases
