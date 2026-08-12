import { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, CircularProgress, Autocomplete, Chip, Grid } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useTheme } from "@mui/material/styles"; // Import useTheme hook
import {
  getPriority,
  getProjects,
  assignUser,
  addTask,
  getTaskStatusByDepartment,
  getTaskTypeByDepartment,
  getProjectsPhases,
} from "../../../../api/controller/admin_controller/task_controller/task_controller";
import { fetchEmployees } from "../../../../api/controller/admin_controller/user_controller";
import { fetchDepartment } from "../../../../api/controller/admin_controller/department_controller";

const AddTaskFormClient = ({projectId, statusID, title, details}) => {
  const theme = useTheme(); // Use the theme hook to access palette
  const userID = localStorage.getItem("userId");
  const { control, handleSubmit, reset, setValue, watch } = useForm();
  const [priorities, setPriorities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDepartmentMeta, setLoadingDepartmentMeta] = useState(false);

  const selectedDepartmentId = watch("department_id");

  const getResponseList = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  };

  useEffect(() => {
    setValue("project_id", projectId);
    setValue("task_title", title);
    setValue("task_details", details);
   
    
    getPriority().then((res) => {
      setPriorities(res.data || []);
      if (res.data?.length) setValue("priority_id", res.data[0].id);
    }).catch(console.error);

    fetchDepartment().then((res) => setDepartments(res.data || [])).catch((error) => {
      console.error(error);
      alert(error?.response?.data?.message || error?.message || "Failed to load departments.");
    });
    getProjects().then((res) => {
      setProjects(res.data || []);
     
    }).catch(console.error);
    fetchEmployees().then((res) => setEmployees(res.data || [])).catch(console.error);

    
  }, [setValue, projectId, statusID]); // Added dependencies to useEffect

  const handleDepartmentChange = async (departmentId) => {
    setValue("department_id", departmentId || null);
    setValue("task_type_id", null);
    setValue("status_id", null);
    setTaskTypes([]);
    setStatuses([]);

    if (!departmentId) return;

    setLoadingDepartmentMeta(true);
    try {
      const [typeRes, statusRes] = await Promise.all([
        getTaskTypeByDepartment(departmentId),
        getTaskStatusByDepartment(departmentId),
      ]);
      const nextTypes = getResponseList(typeRes);
      const nextStatuses = getResponseList(statusRes);
      setTaskTypes(nextTypes);
      setStatuses(nextStatuses);

      if (nextStatuses.some((status) => Number(status.id) === Number(statusID))) {
        setValue("status_id", statusID);
      }
    } catch (error) {
      console.error("Department task metadata fetch failed:", error);
      setTaskTypes([]);
      setStatuses([]);
      alert(error?.response?.data?.message || error?.message || "Failed to fetch department task type/status.");
    } finally {
      setLoadingDepartmentMeta(false);
    }
  };

  const handleProject = (projectId) => {
    setValue("project_id", projectId);
    getProjectsPhases(projectId)
      .then((res) => {
        setPhases(res.data || []);
        setValue("project_phase_id", 1);
      })
      .catch((error) => console.error("Error fetching phases:", error));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { user_id, ...taskData } = data;
      if (taskData.project_id === 0) {
        delete taskData.project_id;
      }
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
      const response = await addTask(taskData);
      if (response.status === "success") {
        alert("Task created successfully!");
        if (data.user_id) {
          const res = await assignUser({ task_id: response.data.id, assigned_person: data.user_id, assigned_by: userID, is_main: 1 });
          if (res.status === "success") alert("User assigned successfully!");
        } else {
          await assignUser({ task_id: response.data.id, assigned_person: userID, assigned_by: userID, is_main: 1 });
        }
        reset();
        setTaskTypes([]);
        setStatuses([]);
      } else {
        alert("Failed to create task: " + response.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error creating task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        backgroundColor: theme.palette.background.paper, // Use theme for background color
        padding: 3,
        borderRadius: "8px",
        boxShadow: theme.shadows[3], // Use theme for box shadow
        width: "100%",
        maxWidth: "1200px",
        margin: "auto",
      }}
    >
      <Typography variant="h5" fontWeight={600} mb={3} color="text.primary">
        Add New Task
      </Typography>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={6}>
          <Controller name="task_title" control={control} defaultValue="" render={({ field }) => (
            <TextField {...field} label="Task Title" fullWidth required variant="outlined" color="primary" />
          )} />

          <Box mt={2}>
            <Controller name="task_details" control={control} defaultValue="" render={({ field }) => (
              <TextField {...field} label="Task Details" fullWidth required multiline rows={4} variant="outlined" color="primary" />
            )} />
          </Box>

          <Box mt={2}>
            <Controller
              name="user_id"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Autocomplete
                  options={employees}
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => <TextField {...params} label="Assign To (Optional)" fullWidth variant="outlined" color="primary" />}
                  onChange={(event, newValue) => field.onChange(newValue ? newValue.id : "")}
                />
              )}
            />
          </Box>

          <Box mt={2}>
            <Controller name="due_date" control={control} defaultValue="" render={({ field }) => (
              <TextField {...field} label="Due Date" type="date" InputLabelProps={{ shrink: true }} fullWidth variant="outlined" color="primary" />
            )} />
          </Box>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" mb={1} color="text.secondary">Priority</Typography>
          <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
            {priorities.map((priority) => (
              <Chip
                key={priority.id}
                size="small"
                label={priority.priority_name}
                color={watch("priority_id") === priority.id ? "primary" : "default"}
                onClick={() => setValue("priority_id", priority.id)}
              />
            ))}
          </Box>

          <Box mb={2}>
            <Controller
              name="department_id"
              control={control}
              defaultValue={null}
              render={({ field }) => (
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
                      fullWidth
                      required
                      helperText="Select department to load task type and status."
                      variant="outlined"
                      color="primary"
                    />
                  )}
                />
              )}
            />
          </Box>

          <Box mb={2}>
            <Controller
              name="task_type_id"
              control={control}
              defaultValue={null}
              render={({ field }) => (
                <Autocomplete
                  options={taskTypes}
                  getOptionLabel={(option) => option?.type_name || ""}
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  value={taskTypes.find((type) => type.id === field.value) || null}
                  onChange={(_, type) => field.onChange(type?.id || null)}
                  disabled={!selectedDepartmentId || loadingDepartmentMeta}
                  loading={loadingDepartmentMeta}
                  noOptionsText={selectedDepartmentId ? "No data found" : "Select department first"}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Task Type"
                      fullWidth
                      required
                      helperText={
                        !selectedDepartmentId
                          ? "Select department first."
                          : !loadingDepartmentMeta && taskTypes.length === 0
                            ? "No data found"
                            : ""
                      }
                      variant="outlined"
                      color="primary"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingDepartmentMeta ? <CircularProgress color="inherit" size={18} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              )}
            />
          </Box>

          <Box mb={2}>
            <Controller
              name="status_id"
              control={control}
              defaultValue={null}
              render={({ field }) => (
                <Autocomplete
                  options={statuses}
                  getOptionLabel={(option) => option?.status_name || ""}
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  value={statuses.find((status) => status.id === field.value) || null}
                  onChange={(_, status) => field.onChange(status?.id || null)}
                  disabled={!selectedDepartmentId || loadingDepartmentMeta}
                  loading={loadingDepartmentMeta}
                  noOptionsText={selectedDepartmentId ? "No data found" : "Select department first"}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Status"
                      fullWidth
                      required
                      helperText={
                        !selectedDepartmentId
                          ? "Select department first."
                          : !loadingDepartmentMeta && statuses.length === 0
                            ? "No data found"
                            : ""
                      }
                      variant="outlined"
                      color="primary"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingDepartmentMeta ? <CircularProgress color="inherit" size={18} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              )}
            />
          </Box>

          <Typography variant="subtitle2" mb={1} color="text.secondary">Project</Typography>
          <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
            {projects.map((project) => (
              <Chip
                key={project.id}
                size="small"
                label={project.project_name}
                color={watch("project_id") === project.id ? "primary" : "default"}
                onClick={() => handleProject(project.id)}
              />
            ))}
          </Box>

          <Typography variant="subtitle2" mb={1} color="text.secondary">Project Phase</Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {phases.map((phase) => (
              <Chip
                key={phase.id}
                size="small"
                label={phase.phase_name}
                color={watch("project_phase_id") === phase.id ? "primary" : "default"}
                onClick={() => setValue("project_phase_id", phase.id)}
              />
            ))}
          </Box>
        </Grid>
      </Grid>

      {/* Submit Button Centered Below */}
      <Box mt={4} textAlign="center">
        <Button type="submit" variant="contained" color="primary" disabled={loading} fullWidth>
          {loading ? <CircularProgress size={24} /> : "Create Task"}
        </Button>
      </Box>
    </Box>
  );
};

export default AddTaskFormClient;
