import { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, CircularProgress, Autocomplete, Chip, Grid } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useTheme } from "@mui/material/styles"; // Import useTheme hook
import { getStatus, getPriority, getProjects, assignUser, addTask, getTaskType, getProjectsPhases } from "../../../../api/controller/admin_controller/task_controller/task_controller";
import { fetchEmployees } from "../../../../api/controller/admin_controller/user_controller";

const AddTaskFormClient = ({projectId, statusID, title, details}) => {
  const theme = useTheme(); // Use the theme hook to access palette
  const userID = localStorage.getItem("userId");
  const { control, handleSubmit, reset, setValue, watch } = useForm();
  const [priorities, setPriorities] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setValue("project_id", projectId);
    setValue("task_type_id", 1);
    setValue("task_title", title);
    setValue("task_details", details);
   
    
    getPriority().then((res) => {
      setPriorities(res.data || []);
      if (res.data?.length) setValue("priority_id", res.data[0].id);
    }).catch(console.error);

    getTaskType().then((res) => setTaskTypes(res.data || [])).catch(console.error);
    getStatus().then((res) => {
      setStatuses(res.data || []);
      if (res.data?.length)  setValue("status_id", statusID ?? 1);
    }).catch(console.error);
    getProjects().then((res) => {
      setProjects(res.data || []);
     
    }).catch(console.error);
    fetchEmployees().then((res) => setEmployees(res.data || [])).catch(console.error);

    
  }, [setValue, projectId, statusID]); // Added dependencies to useEffect

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
      taskData.department_id = 1;
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
      <Typography variant="h5" fontWeight="bold" mb={3} color="text.primary">
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

          <Typography variant="subtitle2" mb={1} color="text.secondary">Task Type</Typography>
          <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
            {taskTypes.map((type) => (
              <Chip
                key={type.id}
                size="small"
                label={type.type_name}
                color={watch("task_type_id") === type.id ? "primary" : "default"}
                onClick={() => setValue("task_type_id", type.id)}
              />
            ))}
          </Box>

          <Typography variant="subtitle2" mb={1} color="text.secondary">Status</Typography>
          <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
            {statuses.map((status) => (
              <Chip
                key={status.id}
                size="small"
                label={status.status_name}
                color={watch("status_id") === status.id ? "primary" : "default"}
                onClick={() => setValue("status_id", status.id)}
              />
            ))}
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