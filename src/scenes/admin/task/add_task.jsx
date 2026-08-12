import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Autocomplete,
  Chip,
  useTheme,
  Grid,
  Card,
  CardContent,
  Divider,
  Tooltip,
  InputAdornment,
  IconButton,
  Stack,
  Badge,
  Checkbox,
  FormControlLabel
} from "@mui/material";
import {
  FlagRounded,
  CategoryRounded,
  TimelineRounded,
  WorkspacesRounded,
  LayersRounded,
  EventRounded,
  PersonRounded,
  InfoOutlined,
  ClearRounded,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import {
  getPriority,
  getProjects,
  assignUser,
  addTask,
  getTaskStatusByDepartment,
  getTaskTypeByDepartment,
  getProjectsPhases,
} from "../../../api/controller/admin_controller/task_controller/task_controller";
import { fetchEmployees } from "../../../api/controller/admin_controller/user_controller";
import { fetchDepartment } from "../../../api/controller/admin_controller/department_controller";
import { useLocation } from "react-router-dom";
import { tokens } from "../../../theme";

const fieldSx = (colors) => ({
  "& .MuiInputBase-input": { color: colors.gray[100] },
  "& .MuiInputLabel-root": { color: colors.gray[400] },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: colors.gray[700] },
    "&:hover fieldset": { borderColor: colors.gray[400] },
    "&.Mui-focused fieldset": { borderColor: colors.blueAccent[500] },
  },
});

const Row = ({ icon, title, children }) => (
  <Stack direction="row" alignItems="center" spacing={1.25}>
    {icon}
    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
      {title}
    </Typography>
    <Box sx={{ flex: 1 }} />
    {children}
  </Stack>
);

export default function AddTaskForm() {
  const userID = localStorage.getItem("userId");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { control, handleSubmit, reset, setValue, watch, formState } = useForm({
    defaultValues: {
      task_title: "",
      task_details: "",
      department_id: null,
      priority_id: null,
      task_type_id: null,
      status_id: null,
      project_id: 0, // 0 = no project
      project_phase_id: null,
      user_id: "",
      due_date: "",
      is_waiting: 0,
    },
    mode: "onChange",
  });

  const [priorities, setPriorities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [phases, setPhases] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingDepartmentMeta, setLoadingDepartmentMeta] = useState(false);

  const location = useLocation();
  const passedData = location.state;

  // Load option lists
  useEffect(() => {
    (async () => {
      try {
        const [prioRes, deptRes, projRes, empRes] = await Promise.all([
          getPriority(),
          fetchDepartment(),
          getProjects(),
          fetchEmployees(),
        ]);

        setPriorities(prioRes.data || []);
        setDepartments(deptRes.data || []);
        setTaskTypes([]);
        setStatuses([]);
        setProjects(projRes.data || []);
        setEmployees(empRes.data || []);
        if (passedData?.is_waiting != null) {
          setValue("is_waiting", passedData.is_waiting);
        }
        // sensible defaults
        if (prioRes.data?.length) setValue("priority_id", prioRes.data[0].id);

        // preselect project & phase if passed
        if (passedData?.project_id != null) {
          setValue("project_id", passedData.project_id);
          if (passedData.project_id) {
            const phaseRes = await getProjectsPhases(passedData.project_id);
            setPhases(phaseRes.data || []);
            if (passedData.project_phase_id) {
              setValue("project_phase_id", passedData.project_phase_id);
            }
          }
        }
      } catch (e) {
        console.error(e);
        alert(e?.response?.data?.message || e?.message || "Failed to load task form data.");
      }
    })();
  }, [setValue, passedData]);

  // Watchers
  const w = {
    title: watch("task_title"),
    details: watch("task_details"),
    department: watch("department_id"),
    prio: watch("priority_id"),
    type: watch("task_type_id"),
    status: watch("status_id"),
    project: watch("project_id"),
    isWaiting: watch("is_waiting"),
    phase: watch("project_phase_id"),
    assignee: watch("user_id"),
    due: watch("due_date"),
  };

  const getResponseList = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  };

  const handleDepartmentChange = async (departmentId) => {
    setValue("department_id", departmentId || null, { shouldValidate: true, shouldDirty: true });
    setValue("task_type_id", null, { shouldValidate: true, shouldDirty: true });
    setValue("status_id", null, { shouldValidate: true, shouldDirty: true });
    setTaskTypes([]);
    setStatuses([]);

    if (!departmentId) return;

    setLoadingDepartmentMeta(true);
    try {
      const [typeRes, statusRes] = await Promise.all([
        getTaskTypeByDepartment(departmentId),
        getTaskStatusByDepartment(departmentId),
      ]);
      setTaskTypes(getResponseList(typeRes));
      setStatuses(getResponseList(statusRes));
    } catch (error) {
      console.error("Department task metadata fetch failed:", error);
      setTaskTypes([]);
      setStatuses([]);
      alert(error?.response?.data?.message || error?.message || "Failed to fetch department task type/status.");
    } finally {
      setLoadingDepartmentMeta(false);
    }
  };

  // Fetch phases on project change
  const handleProject = async (projectId) => {
    setValue("project_id", projectId);
    try {
      const res = await getProjectsPhases(projectId);
      setPhases(res.data || []);
      setValue("project_phase_id", null);
    } catch (e) {
      console.error("Error fetching phases:", e);
      setPhases([]);
      setValue("project_phase_id", null);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const { user_id, ...taskData } = data;

      // Clean payload
      taskData.created_by = userID;
      taskData.is_remind = 1;
      taskData.show_completion_percentage = 0;

      if (!taskData.department_id) {
        alert("Please select a department.");
        return;
      }
      if (!taskData.task_type_id) {
        alert("Please select a task type.");
        return;
      }
      if (!taskData.status_id) {
        alert("Please select a task status.");
        return;
      }

      if (taskData.project_id === 0) {
        delete taskData.project_id;
        delete taskData.project_phase_id;
      } else if (!taskData.project_phase_id) {
        delete taskData.project_phase_id;
      }

      const response = await addTask(taskData);
      if (response.status === "success") {
        const assignedPersonId = data.user_id || userID;
        await assignUser({
          task_id: response.data.id,
          assigned_person: assignedPersonId,
          assigned_by: userID,
          is_main: 1,
        });
        reset();
        setTaskTypes([]);
        setStatuses([]);
        // tiny toast replacement:
        alert("✅ Task created");
      } else {
        alert("Failed to create task: " + response.message);
      }
    } catch (error) {
      console.error(error);
      alert("Error creating task.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    reset();
    setTaskTypes([]);
    setStatuses([]);
  };

  // Pretty chip renderer
  const ChipOption = ({ selected, label, onClick }) => (
    <Chip
      label={label}
      onClick={onClick}
      clickable
      sx={{
        height: 32,
        borderRadius: 2,
        px: 1,
        bgcolor: selected ? colors.blueAccent[500] : colors.gray[900],
        color: selected ? colors.primary[900] : colors.gray[100],
        border: `1px solid ${selected ? colors.blueAccent[700] : colors.gray[700]}`,
        "&:hover": {
          bgcolor: selected ? colors.blueAccent[700] : colors.primary[400],
        },
      }}
    />
  );

  const titleCount = useMemo(() => (w.title ? w.title.length : 0), [w.title]);
  const detailsCount = useMemo(() => (w.details ? w.details.length : 0), [w.details]);

  return (
    <Grid
      container
      spacing={3}
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 3 } }}
    >
      {/* LEFT: Form */}
      <Grid item xs={12} md={7} lg={8}>
        <Card sx={{ bgcolor: theme.palette.background.paper, borderRadius: 3, boxShadow: 3 }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <Typography variant="h5" fontWeight={600} sx={{ color: colors.gray[100] }}>
                Create Task
              </Typography>
              <Tooltip title="A concise title & clear details get tasks done faster.">
                <InfoOutlined fontSize="small" sx={{ color: colors.gray[400] }} />
              </Tooltip>
            </Stack>

            {/* Title */}
            <Controller
              name="task_title"
              rules={{ required: "Title is required", maxLength: { value: 120, message: "Max 120 chars" } }}
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Task Title"
                  placeholder="e.g., Finalize onboarding checklist"
                  fullWidth
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message || `${titleCount}/120`}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FlagRounded sx={{ color: colors.blueAccent[500] }} />
                      </InputAdornment>
                    ),
                    endAdornment: field.value ? (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => field.onChange("")}
                          sx={{ color: colors.gray[400] }}
                        >
                          <ClearRounded fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  }}
                  sx={fieldSx(colors)}
                />
              )}
            />

            {/* Details */}
            <Box mt={2}>
              <Controller
                name="task_details"
                rules={{ required: "Details are required", maxLength: { value: 2000, message: "Max 2000 chars" } }}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Task Details"
                    placeholder="Describe the outcome, acceptance criteria, links, etc."
                    fullWidth
                    required
                    multiline
                    minRows={4}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message || `${detailsCount}/2000`}
                    sx={fieldSx(colors)}
                  />
                )}
              />
            </Box>

            <Divider sx={{ my: 3, borderColor: colors.gray[800] }} />

            {/* Department / Priority / Type / Status */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="department_id"
                  control={control}
                  rules={{ required: "Department is required" }}
                  render={({ field, fieldState }) => (
                    <Autocomplete
                      options={departments}
                      getOptionLabel={(option) => option?.department_name || ""}
                      isOptionEqualToValue={(option, value) => option?.id === value?.id}
                      value={departments.find((department) => department.id === field.value) || null}
                      onChange={(_, department) => handleDepartmentChange(department?.id || null)}
                      noOptionsText="No data found"
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Department"
                          required
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message || "Select department to load task type and status."}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <InputAdornment position="start">
                                  <WorkspacesRounded sx={{ color: colors.blueAccent[500] }} />
                                </InputAdornment>
                                {params.InputProps.startAdornment}
                              </>
                            ),
                          }}
                          sx={fieldSx(colors)}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Row icon={<FlagRounded sx={{ color: colors.orangeAccent[500] }} />} title="Priority" />
                <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                  {priorities.map((p) => (
                    <ChipOption
                      key={p.id}
                      label={p.priority_name}
                      selected={w.prio === p.id}
                      onClick={() => setValue("priority_id", p.id)}
                    />
                  ))}
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="task_type_id"
                  control={control}
                  rules={{ required: "Task type is required" }}
                  render={({ field, fieldState }) => (
                    <Autocomplete
                      options={taskTypes}
                      getOptionLabel={(option) => option?.type_name || ""}
                      isOptionEqualToValue={(option, value) => option?.id === value?.id}
                      value={taskTypes.find((type) => type.id === field.value) || null}
                      onChange={(_, type) => field.onChange(type?.id || null)}
                      disabled={!w.department || loadingDepartmentMeta}
                      loading={loadingDepartmentMeta}
                      noOptionsText={w.department ? "No data found" : "Select department first"}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Task Type"
                          required
                          error={!!fieldState.error}
                          helperText={
                            fieldState.error?.message ||
                            (!w.department
                              ? "Select department first."
                              : !loadingDepartmentMeta && taskTypes.length === 0
                                ? "No data found"
                                : "")
                          }
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <InputAdornment position="start">
                                  <CategoryRounded sx={{ color: colors.purpleAccent[500] }} />
                                </InputAdornment>
                                {params.InputProps.startAdornment}
                              </>
                            ),
                            endAdornment: (
                              <>
                                {loadingDepartmentMeta ? <CircularProgress color="inherit" size={18} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                          sx={fieldSx(colors)}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="status_id"
                  control={control}
                  rules={{ required: "Task status is required" }}
                  render={({ field, fieldState }) => (
                    <Autocomplete
                      options={statuses}
                      getOptionLabel={(option) => option?.status_name || ""}
                      isOptionEqualToValue={(option, value) => option?.id === value?.id}
                      value={statuses.find((status) => status.id === field.value) || null}
                      onChange={(_, status) => field.onChange(status?.id || null)}
                      disabled={!w.department || loadingDepartmentMeta}
                      loading={loadingDepartmentMeta}
                      noOptionsText={w.department ? "No data found" : "Select department first"}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Task Status"
                          required
                          error={!!fieldState.error}
                          helperText={
                            fieldState.error?.message ||
                            (!w.department
                              ? "Select department first."
                              : !loadingDepartmentMeta && statuses.length === 0
                                ? "No data found"
                                : "")
                          }
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <InputAdornment position="start">
                                  <TimelineRounded sx={{ color: colors.blueAccent[500] }} />
                                </InputAdornment>
                                {params.InputProps.startAdornment}
                              </>
                            ),
                            endAdornment: (
                              <>
                                {loadingDepartmentMeta ? <CircularProgress color="inherit" size={18} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                          sx={fieldSx(colors)}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3, borderColor: colors.gray[800] }} />

            {/* Project & Phase */}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Row icon={<WorkspacesRounded sx={{ color: colors.blueAccent[500] }} />} title="Project" />
                <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                  <ChipOption
                    label="No Project"
                    selected={w.project === 0}
                    onClick={() => handleProject(0)}
                  />
                  {projects.map((project) => (
                    <ChipOption
                      key={project.id}
                      label={project.project_name}
                      selected={w.project === project.id}
                      onClick={() => handleProject(project.id)}
                    />
                  ))}
                </Stack>
              </Grid>

              <Grid item xs={12} sx={{ opacity: w.project && w.project !== 0 ? 1 : 0.5 }}>
                <Row icon={<LayersRounded sx={{ color: colors.purpleAccent[500] }} />} title="Phase" />
                <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                  {(w.project && w.project !== 0 ? phases : []).map((phase) => (
                    <ChipOption
                      key={phase.id}
                      label={phase.phase_name}
                      selected={w.phase === phase.id}
                      onClick={() => setValue("project_phase_id", phase.id)}
                    />
                  ))}
                  {w.project && w.project !== 0 && phases.length === 0 && (
                    <Typography variant="body2" sx={{ color: colors.gray[400] }}>
                      No phases available for this project
                    </Typography>
                  )}
                </Stack>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3, borderColor: colors.gray[800] }} />

            {/* Assignee + Due Date */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={7}>
                <Controller
                  name="user_id"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={employees}
                      getOptionLabel={(o) => o?.name || ""}
                      isOptionEqualToValue={(o, v) => o?.id === v?.id}
                      onChange={(_, v) => field.onChange(v ? v.id : "")}
                      value={employees.find((e) => e.id === field.value) || null}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Assign To (Optional)"
                          placeholder="Search teammate…"
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <InputAdornment position="start">
                                  <PersonRounded sx={{ color: colors.blueAccent[500] }} />
                                </InputAdornment>
                                {params.InputProps.startAdornment}
                              </>
                            ),
                          }}
                          sx={fieldSx(colors)}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={5}>
                <Controller
                  name="due_date"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="date"
                      label="Due Date"
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EventRounded sx={{ color: colors.orangeAccent[500] }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldSx(colors)}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Submit */}
            <Box mt={3} display="flex" gap={1}>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting || !formState.isValid}
                sx={{
                  px: 3,
                  bgcolor: colors.blueAccent[500],
                  color: colors.primary[900],
                  "&:hover": { bgcolor: colors.blueAccent[700] },
                  "&:disabled": {
                    bgcolor: colors.gray[700],
                    color: colors.gray[400],
                  },
                }}
              >
                {submitting ? <CircularProgress size={22} sx={{ color: "inherit" }} /> : "Create Task"}
              </Button>
              <Button
                type="button"
                onClick={handleResetForm}
                variant="outlined"
                sx={{
                  borderColor: colors.gray[600],
                  color: colors.gray[200],
                  "&:hover": { borderColor: colors.gray[400], bgcolor: colors.primary[400] },
                }}
              >
                Reset
              </Button>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={watch("is_waiting") || false}  // using react-hook-form watch
                    onChange={(e) => setValue("is_waiting", e.target.checked ? 1 : 0)}
                    color="primary"
                  />
                }
                label="Mark as Waiting Task"
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* RIGHT: Live Summary */}
      <Grid item xs={12} md={5} lg={4}>
        <Card
          sx={{
            bgcolor: colors.primary[900],
            border: `1px solid ${colors.gray[800]}`,
            borderRadius: 3,
            position: "sticky",
            top: 16,
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="subtitle2" sx={{ color: colors.gray[400], mb: 1 }}>
              Preview
            </Typography>

            <Typography variant="h6" fontWeight={600} sx={{ color: colors.gray[100] }}>
              {w.title || "Untitled task"}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 1,
                color: colors.gray[300],
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {w.details || "Add details to make this actionable."}
            </Typography>

            <Divider sx={{ my: 2, borderColor: colors.gray[800] }} />

            <Stack spacing={1.25}>
              <Row icon={<WorkspacesRounded sx={{ color: colors.blueAccent[500] }} />} title="Department">
                <Typography variant="body2" sx={{ color: colors.gray[200] }}>
                  {departments.find((department) => department.id === w.department)?.department_name || "â€”"}
                </Typography>
              </Row>

              <Row icon={<FlagRounded sx={{ color: colors.orangeAccent[500] }} />} title="Priority">
                <Badge
                  color="primary"
                  variant="dot"
                  invisible={!w.prio}
                  anchorOrigin={{ vertical: "top", horizontal: "left" }}
                >
                  <Typography variant="body2" sx={{ color: colors.gray[200] }}>
                    {priorities.find((p) => p.id === w.prio)?.priority_name || "—"}
                  </Typography>
                </Badge>
              </Row>

              <Row icon={<CategoryRounded sx={{ color: colors.purpleAccent[500] }} />} title="Type">
                <Typography variant="body2" sx={{ color: colors.gray[200] }}>
                  {taskTypes.find((t) => t.id === w.type)?.type_name || "—"}
                </Typography>
              </Row>

              <Row icon={<TimelineRounded sx={{ color: colors.blueAccent[500] }} />} title="Status">
                <Typography variant="body2" sx={{ color: colors.gray[200] }}>
                  {statuses.find((s) => s.id === w.status)?.status_name || "—"}
                </Typography>
              </Row>

              <Row icon={<WorkspacesRounded sx={{ color: colors.blueAccent[500] }} />} title="Project">
                <Typography variant="body2" sx={{ color: colors.gray[200] }}>
                  {w.project === 0
                    ? "No project"
                    : projects.find((p) => p.id === w.project)?.project_name || "—"}
                </Typography>
              </Row>

              <Row icon={<LayersRounded sx={{ color: colors.purpleAccent[500] }} />} title="Phase">
                <Typography variant="body2" sx={{ color: colors.gray[200] }}>
                  {phases.find((ph) => ph.id === w.phase)?.phase_name || "—"}
                </Typography>
              </Row>

              <Row icon={<PersonRounded sx={{ color: colors.blueAccent[500] }} />} title="Assignee">
                <Typography variant="body2" sx={{ color: colors.gray[200] }}>
                  {employees.find((e) => e.id === w.assignee)?.name || "You"}
                </Typography>
              </Row>

              <Row icon={<EventRounded sx={{ color: colors.orangeAccent[500] }} />} title="Due date">
                <Typography variant="body2" sx={{ color: colors.gray[200] }}>
                  {w.due || "—"}
                </Typography>
              </Row>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
