import { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, CircularProgress, Autocomplete, Chip } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { getStatus, getPriority, getProjects, assignUser, addTask, getTaskType } from "../../../api/controller/admin_controller/task_controller/task_controller";
import { fetchEmployees } from "../../../api/controller/admin_controller/user_controller";
import { useLocation } from "react-router-dom";
import {
  getProjectsPhases,
} from "../../../api/controller/admin_controller/task_controller/task_controller";

const AddTaskForm = () => {
  const userID = localStorage.getItem("userId");
  const { control, handleSubmit, reset, setValue, watch } = useForm();
  const [priorities, setPriorities] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const passedData = location.state;
  const [phases, setPhases] = useState([]);

  useEffect(() => {
    getPriority().then((res) => {
      setPriorities(res.data || []);
      if (res.data?.length) setValue("priority_id", res.data[0].id);
    }).catch(console.error);

    getTaskType().then((res) => setTaskTypes(res.data || [])).catch(console.error);
    getStatus().then((res) => {
      setStatuses(res.data || []);
      if (res.data?.length) setValue("status_id", res.data[0].id);
    }).catch(console.error);
    getProjects().then((res) => {
      setProjects(res.data || []);
     
      
       
        setValue("project_id", passedData.project_id ?? 0);
       
      
    }
    ).catch(console.error);
    fetchEmployees().then((res) => setEmployees(res.data || [])).catch(console.error);

    getProjectsPhases(passedData.project_id ?? 0)
    .then((res) => {
      setPhases(res.data || []);
      setValue("project_phase_id", passedData.project_phase_id);
    })
    .catch((error) => {
      console.error("Error fetching phases:", error);
    
    });
  
  }, [setValue]);
const handleProject = (projectId) => {
  setValue("project_id", projectId);
  getProjectsPhases(projectId)
    .then((res) => {
      setPhases(res.data || []);
      setValue("project_phase_id", passedData.project_phase_id);
    })
    .catch((error) => {
      console.error("Error fetching phases:", error);
    
    });
}
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { user_id, ...taskData } = data;
      if(taskData.project_id === 0){
        delete taskData.project_id;
      }
      taskData.created_by = userID;
      taskData.is_remind = 1;
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
          const res = await assignUser({ task_id: response.data.id, assigned_person: userID, assigned_by: userID, is_main: 1 });
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
      sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 500, margin: "auto", backgroundColor: "#fff", padding: 3, borderRadius: "8px", boxShadow: 3 }}
    >
      <Typography variant="h5" fontWeight="bold">Add New Task</Typography>

      <Controller name="task_title" control={control} defaultValue="" render={({ field }) => <TextField {...field} label="Task Title" fullWidth required />} />
      <Controller name="task_details" control={control} defaultValue="" render={({ field }) => <TextField {...field} label="Task Details" fullWidth required multiline />} />

      {/* Priority Chip Selection */}
      <Typography variant="subtitle1">Priority</Typography>
      <Box display="flex" gap={1} flexWrap="wrap">
        {priorities.map((priority) => (
          <Chip
            key={priority.id}
            label={priority.priority_name}
            color={watch("priority_id") === priority.id ? "primary" : "default"}
            onClick={() => setValue("priority_id", priority.id)}
          />
        ))}
      </Box>

      {/* Task Type Chip Selection */}
      <Typography variant="subtitle1">Task Type</Typography>
      <Box display="flex" gap={1} flexWrap="wrap">
        {taskTypes.map((type) => (
          <Chip
            key={type.id}
            label={type.type_name}
            color={watch("task_type_id") === type.id ? "primary" : "default"}
            onClick={() => setValue("task_type_id", type.id)}
          />
        ))}
      </Box>

      {/* Status Chip Selection */}
      <Typography variant="subtitle1">Status</Typography>
      <Box display="flex" gap={1} flexWrap="wrap">
        {statuses.map((status) => (
          <Chip
            key={status.id}
            label={status.status_name}
            color={watch("status_id") === status.id ? "primary" : "default"}
            onClick={() => setValue("status_id", status.id)}
          />
        ))}
      </Box>

      {/* Project Chip Selection */}
      <Typography variant="subtitle1">Project</Typography>
      <Box display="flex" gap={1} flexWrap="wrap">
        {projects.map((project) => (
          <Chip
            key={project.id}
            label={project.project_name}
            color={watch("project_id") === project.id ? "primary" : "default"}
            onClick={() => handleProject(project.id)}
          />
        ))}
      </Box>
      <Typography variant="subtitle1">Project Phase</Typography>

      <Box display="flex" gap={1} flexWrap="wrap">
        {phases.map((phase) => (
          <Chip
            key={phase.id}
            label={phase.phase_name}
            color={watch("project_phase_id") === phase.id ? "primary" : "default"}
            onClick={() => setValue("project_phase_id", phase.id)}
          />
        ))}
      </Box>

      {/* Employee Search Dropdown (Optional) */}
      <Controller
        name="user_id"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <Autocomplete
            options={employees}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => <TextField {...params} label="Assign To (Optional)" fullWidth />}
            onChange={(event, newValue) => field.onChange(newValue ? newValue.id : "")} // Ensure it's optional
          />
        )}
      />

      <Controller name="due_date" control={control} defaultValue="" render={({ field }) => <TextField {...field} label="Due Date" type="date" fullWidth />} />

      <Button type="submit" variant="contained" color="primary" disabled={loading}>
        {loading ? <CircularProgress size={24} /> : "Create Task"}
      </Button>
    </Box>
  );
};

export default AddTaskForm;
