// src/scenes/project/components/ProjectPhases.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Tooltip,
  Stack,
  Divider,
  Slider,
  useTheme,
  Paper,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import {
  getProjectsPhases,
  addPhase,
} from "../../../../api/controller/admin_controller/task_controller/task_controller";
import {
  getProjectDetails,
  updateProjectPhase,
} from "../../../../api/controller/admin_controller/project/project_controller";

/** Small reusable circular progress ring */
const ProgressRing = ({ size = 150, value = 0, trackColor, barColor }) => (
  <Box sx={{ position: "relative", width: size, height: size, display: "grid", placeItems: "center" }}>
    <CircularProgress
      variant="determinate"
      value={100}
      size={size}
      thickness={5}
      sx={{ position: "absolute", color: trackColor }}
    />
    <CircularProgress
      variant="determinate"
      value={Math.max(0, Math.min(100, Number(value) || 0))}
      size={size}
      thickness={5}
      sx={{ position: "absolute", color: barColor }}
    />
  </Box>
);

const ProjectPhases = ({ protId }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [phases, setPhases] = useState([]);
  const [projectDetails, setProjectDetails] = useState({});
  const [loading, setLoading] = useState(true);

  // slider modal
  const [phaseId, setPhaseId] = useState(0);
  const [phaseName, setPhaseName] = useState("");
  const [openSliderModal, setOpenSliderModal] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);

  // create phase modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    project_id: protId,
    phase_name: "",
    phase_order_id: "",
    description: "",
    status: "0",
    priority: "",
    phase_completion_percentage: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [protId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, dRes] = await Promise.all([
        getProjectsPhases(protId),
        getProjectDetails(protId),
      ]);
      setPhases(pRes?.data || []);
      setProjectDetails(dRes?.data || {});
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  // modal: update phase %
  const handleOpenModalSlider = (id, pct, name) => {
    setPhaseId(id);
    setSliderValue(Number(pct) || 0);
    setPhaseName(name || "");
    setOpenSliderModal(true);
  };
  const handleCloseModalSlider = () => setOpenSliderModal(false);

  const handleUpdatePhase = async () => {
    try {
      await updateProjectPhase(phaseId, { phase_completion_percentage: sliderValue });
      await fetchAll();
    } catch (e) {
      console.error("Update phase error:", e);
    } finally {
      handleCloseModalSlider();
    }
  };

  // create phase
  const handleAddPhase = () => setModalOpen(true);
  const handleCloseModal = () => {
    setModalOpen(false);
    setFormData({
      project_id: protId,
      phase_name: "",
      phase_order_id: "",
      description: "",
      status: "0",
      priority: "",
      phase_completion_percentage: "",
      start_date: "",
      end_date: "",
    });
  };
  const handleChange = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    const payload = new FormData();
    Object.entries(formData).forEach(([k, v]) => payload.append(k, v ?? ""));
    try {
      await addPhase(payload);
      handleCloseModal();
      fetchAll();
    } catch (e) {
      console.error("Add phase error:", e);
    }
  };

  // actions
  const handleAddTask = (phaseID) =>
    navigate("/add-task", {
      state: { project_id: parseInt(protId, 10), project_phase_id: phaseID },
    });
  const handlePhaseTaskNavigate = (phaseID) => navigate(`/project-phase-task/${phaseID}`);

  // theme helpers
  const bgPaper = theme.palette.background.paper;
  const bgDefault = theme.palette.background.default;
  const divider = theme.palette.divider;
  const textPri = theme.palette.text.primary;
  const textSec = theme.palette.text.secondary;
  const brand = theme.palette.blueAccent.main;
  const brandHover = theme.palette.blueAccent.dark;
  const brandTrack = alpha(brand, 0.12);

  return (
    <Box
      sx={{
        display: { xs: "block", md: "flex" },
        minHeight: "100vh",
        backgroundColor: bgDefault,
        px: { xs: 1, sm: 2 },
      }}
    >
      <Box sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight={800} color={textPri} lineHeight={1.2}>
              Project Phases
            </Typography>
            {projectDetails?.project_name && (
              <Typography variant="body2" color={textSec}>
                {projectDetails.project_name}
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            startIcon={<PlaylistAddIcon />}
            onClick={handleAddPhase}
            sx={{
              bgcolor: brand,
              color: theme.palette.blueAccent.contrastText,
              "&:hover": { bgcolor: brandHover },
              borderRadius: 2,
            }}
          >
            Add Phase
          </Button>
        </Box>

        {/* Content */}
        {loading ? (
          <Box display="flex" justifyContent="center" mt={6}>
            <CircularProgress />
          </Box>
        ) : phases.length === 0 ? (
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 2,
              p: 4,
              bgcolor: bgPaper,
              border: `1px solid ${divider}`,
              textAlign: "center",
            }}
          >
            <Typography variant="h6" color={textPri} fontWeight={700} gutterBottom>
              No phases yet
            </Typography>
            <Typography variant="body2" color={textSec} gutterBottom>
              Create your first project phase to start organizing work.
            </Typography>
            <Button
              onClick={handleAddPhase}
              variant="contained"
              sx={{ mt: 2, bgcolor: brand, "&:hover": { bgcolor: brandHover } }}
            >
              Create Phase
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {phases.map((phase, index) => {
              const pct = Number(phase.phase_completion_percentage) || 0;
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={phase.id}>
                  <Box display="flex" alignItems="center" width="100%">
                    <Paper
                      role="button"
                      aria-label={`Open ${phase.phase_name} phase progress`}
                      onClick={() => handleOpenModalSlider(phase.id, pct, phase.phase_name)}
                      elevation={0}
                      sx={{
                        border: `1px solid ${divider}`,
                        borderRadius: 3,
                        p: 2.5,
                        bgcolor: bgPaper,
                        width: "100%",
                        maxWidth: 320,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        transition: "transform .18s ease, box-shadow .18s ease",
                        cursor: "pointer",
                        "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
                      }}
                    >
                      <Box sx={{ position: "relative", mb: 1 }}>
                        <ProgressRing
                          value={pct}
                          trackColor={brandTrack}
                          barColor={brand}
                          size={150}
                        />
                        <Card
                          elevation={1}
                          sx={{
                            width: 116,
                            height: 116,
                            borderRadius: "50%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                            bgcolor: bgPaper,
                            position: "absolute",
                            inset: "50% auto auto 50%",
                            transform: "translate(-50%, -50%)",
                            border: `1px solid ${divider}`,
                          }}
                        >
                          <CardContent sx={{ p: 0 }}>
                            <Tooltip title={phase.description || "No description"}>
                              <Box>
                                <Typography
                                  variant="subtitle2"
                                  fontWeight={800}
                                  color={textPri}
                                  sx={{ px: 1 }}
                                >
                                  {phase.phase_name}
                                </Typography>
                                <Typography variant="caption" color={textSec}>
                                  {pct}% done
                                </Typography>
                              </Box>
                            </Tooltip>
                          </CardContent>
                        </Card>
                      </Box>

                      <Box sx={{ mt: 2, width: "100%" }}>
                        <Typography variant="body2" color={textSec}>
                          <strong>Start:</strong>{" "}
                          {phase.start_date ? dayjs(phase.start_date).format("MMM D, YYYY") : "—"}
                        </Typography>
                        <Typography variant="body2" color={textSec}>
                          <strong>End:</strong>{" "}
                          {phase.end_date ? dayjs(phase.end_date).format("MMM D, YYYY") : "—"}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body2" color={textSec}>
                          <strong>Total Tasks:</strong> {phase.total_task_count ?? 0}
                        </Typography>
                        <Typography variant="body2" color={textSec}>
                          <strong>Completed:</strong> {phase.completed_task_count ?? 0}
                        </Typography>
                        <Typography variant="body2" color={textSec}>
                          <strong>Pending:</strong>{" "}
                          {(phase.total_task_count ?? 0) - (phase.completed_task_count ?? 0)}
                        </Typography>
                      </Box>

                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                        mt={2}
                        width="100%"
                      >
                        <Button
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddTask(phase.id);
                          }}
                          size="small"
                          sx={{
                            borderRadius: 2,
                            color: brand,
                            borderColor: alpha(brand, 0.5),
                            "&:hover": {
                              backgroundColor: alpha(brand, 0.12),
                              borderColor: brand,
                            },
                          }}
                        >
                          Add Task
                        </Button>
                        <Button
                          variant="contained"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePhaseTaskNavigate(phase.id);
                          }}
                          size="small"
                          sx={{
                            borderRadius: 2,
                            bgcolor: brand,
                            color: theme.palette.blueAccent.contrastText,
                            "&:hover": { bgcolor: brandHover },
                          }}
                        >
                          View Tasks
                        </Button>
                      </Stack>
                    </Paper>

                    {/* connector line to the next card on larger screens */}
                    {index < phases.length - 1 && (
                      <Box
                        sx={{
                          display: { xs: "none", md: "block" },
                          width: 48,
                          height: 2,
                          backgroundColor: alpha(brand, 0.5),
                          alignSelf: "center",
                          mx: 1,
                          borderRadius: 1,
                        }}
                      />
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Create Phase Dialog */}
        <Dialog
          open={modalOpen}
          onClose={handleCloseModal}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              bgcolor: bgPaper,
              borderRadius: 3,
              border: `1px solid ${divider}`,
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 800, color: textPri }}>Add New Phase</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} mt={0.5}>
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
                  inputProps={{ min: 0, max: 100 }}
                  value={formData.phase_completion_percentage}
                  onChange={handleChange("phase_completion_percentage")}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.start_date || ""}
                  onChange={handleChange("start_date")}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.end_date || ""}
                  onChange={handleChange("end_date")}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Status (0 Pending / 1 Completed)"
                  type="number"
                  value={formData.status}
                  onChange={handleChange("status")}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{ bgcolor: brand, "&:hover": { bgcolor: brandHover } }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Update Progress Dialog */}
        <Dialog
          open={openSliderModal}
          onClose={handleCloseModalSlider}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 1,
              bgcolor: bgPaper,
              border: `1px solid ${divider}`,
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 800, color: textPri }}>
            Update “{phaseName}”
          </DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Typography variant="body2" color={textSec} sx={{ mb: 2 }}>
              Current completion: <strong>{sliderValue}%</strong>
            </Typography>
            <Slider
              value={sliderValue}
              onChange={(_, v) => setSliderValue(v)}
              valueLabelDisplay="on"
              min={0}
              max={100}
              sx={{
                color: brand,
                height: 6,
                "& .MuiSlider-thumb": {
                  height: 22,
                  width: 22,
                  bgcolor: bgPaper,
                  border: `2px solid ${brand}`,
                },
                "& .MuiSlider-rail": { opacity: 0.4 },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 2.5, pb: 2 }}>
            <Button onClick={handleCloseModalSlider}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleUpdatePhase}
              sx={{ bgcolor: brand, "&:hover": { bgcolor: brandHover } }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default ProjectPhases;
