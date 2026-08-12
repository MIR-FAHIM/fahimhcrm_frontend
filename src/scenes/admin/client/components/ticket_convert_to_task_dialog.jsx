import { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { getPriority, getProjects, getProjectsPhases, getTaskStatusByDepartment, getTaskTypeByDepartment } from "../../../../api/controller/admin_controller/task_controller/task_controller";
import { convertTicketToTask } from "../../../../api/controller/admin_controller/client_controller";
import { fetchDepartment } from "../../../../api/controller/admin_controller/department_controller";
import { fetchEmployees } from "../../../../api/controller/admin_controller/user_controller";

const getResponseList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const TicketConvertToTaskDialog = ({ open, ticket, onClose, onConverted }) => {
  const theme = useTheme();
  const userID = localStorage.getItem("userId");

  const [form, setForm] = useState({
    task_title: "",
    task_details: "",
    department_id: null,
    task_type_id: null,
    status_id: null,
    priority_id: null,
    assigned_person: null,
    due_date: "",
    start_date: "",
    project_id: null,
    project_phase_id: null,
  });
  const [departments, setDepartments] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [phases, setPhases] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [loadingDepartmentMeta, setLoadingDepartmentMeta] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setForm({
      task_title: ticket?.subject || ticket?.ticket_code || "",
      task_details: ticket?.description || ticket?.category || "",
      department_id: null,
      task_type_id: null,
      status_id: null,
      priority_id: null,
      assigned_person: null,
      due_date: "",
      start_date: "",
      project_id: null,
      project_phase_id: null,
    });
    setTaskTypes([]);
    setStatuses([]);
    setPhases([]);

    let mounted = true;
    setLoadingMeta(true);
    Promise.all([fetchDepartment(), getPriority(), fetchEmployees(), getProjects()])
      .then(([departmentRes, priorityRes, employeeRes, projectRes]) => {
        if (!mounted) return;
        const nextPriorities = getResponseList(priorityRes);
        setDepartments(getResponseList(departmentRes));
        setPriorities(nextPriorities);
        setEmployees(getResponseList(employeeRes));
        setProjects(getResponseList(projectRes));
        if (nextPriorities.length) {
          setForm((current) => ({ ...current, priority_id: nextPriorities[0].id }));
        }
      })
      .catch((error) => {
        console.error("Ticket convert metadata error:", error);
        alert(error?.response?.data?.message || error?.message || "Failed to load task conversion data.");
      })
      .finally(() => {
        if (mounted) setLoadingMeta(false);
      });

    return () => {
      mounted = false;
    };
  }, [open, ticket]);

  const selectedDepartment = departments.find((item) => Number(item.id) === Number(form.department_id)) || null;
  const selectedType = taskTypes.find((item) => Number(item.id) === Number(form.task_type_id)) || null;
  const selectedStatus = statuses.find((item) => Number(item.id) === Number(form.status_id)) || null;
  const selectedPriority = priorities.find((item) => Number(item.id) === Number(form.priority_id)) || null;
  const selectedEmployee = employees.find((item) => Number(item.id) === Number(form.assigned_person)) || null;
  const selectedProject = projects.find((item) => Number(item.id) === Number(form.project_id)) || null;
  const selectedPhase = phases.find((item) => Number(item.id) === Number(form.project_phase_id)) || null;

  const handleField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleDepartmentChange = async (departmentId) => {
    setForm((current) => ({
      ...current,
      department_id: departmentId,
      task_type_id: null,
      status_id: null,
    }));
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
      console.error("Department task metadata error:", error);
      alert(error?.response?.data?.message || error?.message || "Failed to fetch department task type/status.");
    } finally {
      setLoadingDepartmentMeta(false);
    }
  };

  const handleProjectChange = async (projectId) => {
    setForm((current) => ({ ...current, project_id: projectId, project_phase_id: null }));
    setPhases([]);
    if (!projectId) return;

    try {
      const phaseRes = await getProjectsPhases(projectId);
      setPhases(getResponseList(phaseRes));
    } catch (error) {
      console.error("Project phase fetch error:", error);
      alert(error?.response?.data?.message || error?.message || "Failed to fetch project phases.");
    }
  };

  const handleSubmit = async () => {
    if (!ticket?.id || ticket?.converted_task_id) return;
    if (!form.task_title?.trim()) return alert("Task title is required.");
    if (!form.task_details?.trim()) return alert("Task details are required.");
    if (!form.department_id) return alert("Please select a department.");
    if (!form.task_type_id) return alert("Please select a task type.");
    if (!form.status_id) return alert("Please select a task status.");
    if (!form.priority_id) return alert("Please select a priority.");

    const payload = {
      priority_id: form.priority_id,
      task_type_id: form.task_type_id,
      status_id: form.status_id,
      department_id: form.department_id,
      created_by: Number(userID),
      assigned_person: form.assigned_person || null,
      due_date: form.due_date || null,
      start_date: form.start_date || null,
      project_id: form.project_id || null,
      project_phase_id: form.project_phase_id || null,
      task_title: form.task_title.trim(),
      task_details: form.task_details.trim(),
    };

    setSubmitting(true);
    try {
      const response = await convertTicketToTask(ticket.id, payload);
      if (response?.status === "success" || response?.status === true) {
        onConverted?.(response);
      } else {
        alert(response?.message || "Failed to convert ticket to task.");
      }
    } catch (error) {
      alert(error?.response?.data?.message || error?.message || "Failed to convert ticket to task.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="md" PaperProps={{ sx: { bgcolor: theme.palette.background.paper } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>
        Convert Ticket to Task
        <Typography variant="body2" color="text.secondary">
          {ticket?.ticket_code || `Ticket #${ticket?.id || ""}`}
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ borderColor: theme.palette.divider }}>
        {loadingMeta ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Loading task options...
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth required label="Task Title" value={form.task_title} onChange={(event) => handleField("task_title", event.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth required multiline minRows={4} label="Task Details" value={form.task_details} onChange={(event) => handleField("task_details", event.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={departments}
                value={selectedDepartment}
                getOptionLabel={(option) => option?.department_name || ""}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                onChange={(_, value) => handleDepartmentChange(value?.id || null)}
                noOptionsText="No data found"
                renderInput={(params) => <TextField {...params} required label="Department" />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={priorities}
                value={selectedPriority}
                getOptionLabel={(option) => option?.priority_name || ""}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                onChange={(_, value) => handleField("priority_id", value?.id || null)}
                noOptionsText="No data found"
                renderInput={(params) => <TextField {...params} required label="Priority" />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={taskTypes}
                value={selectedType}
                disabled={!form.department_id || loadingDepartmentMeta}
                loading={loadingDepartmentMeta}
                getOptionLabel={(option) => option?.type_name || ""}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                onChange={(_, value) => handleField("task_type_id", value?.id || null)}
                noOptionsText={form.department_id ? "No data found" : "Select department first"}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Task Type"
                    helperText={!form.department_id ? "Select department first." : !loadingDepartmentMeta && !taskTypes.length ? "No data found" : ""}
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
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={statuses}
                value={selectedStatus}
                disabled={!form.department_id || loadingDepartmentMeta}
                loading={loadingDepartmentMeta}
                getOptionLabel={(option) => option?.status_name || ""}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                onChange={(_, value) => handleField("status_id", value?.id || null)}
                noOptionsText={form.department_id ? "No data found" : "Select department first"}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Task Status"
                    helperText={!form.department_id ? "Select department first." : !loadingDepartmentMeta && !statuses.length ? "No data found" : ""}
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
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={employees}
                value={selectedEmployee}
                getOptionLabel={(option) => option?.name || ""}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                onChange={(_, value) => handleField("assigned_person", value?.id || null)}
                noOptionsText="No data found"
                renderInput={(params) => <TextField {...params} label="Assigned Person (Optional)" />}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="date" label="Start Date" InputLabelProps={{ shrink: true }} value={form.start_date} onChange={(event) => handleField("start_date", event.target.value)} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="date" label="Due Date" InputLabelProps={{ shrink: true }} value={form.due_date} onChange={(event) => handleField("due_date", event.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={projects}
                value={selectedProject}
                getOptionLabel={(option) => option?.project_name || ""}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                onChange={(_, value) => handleProjectChange(value?.id || null)}
                noOptionsText="No data found"
                renderInput={(params) => <TextField {...params} label="Project (Optional)" />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={phases}
                value={selectedPhase}
                disabled={!form.project_id}
                getOptionLabel={(option) => option?.phase_name || ""}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                onChange={(_, value) => handleField("project_phase_id", value?.id || null)}
                noOptionsText={form.project_id ? "No data found" : "Select project first"}
                renderInput={(params) => <TextField {...params} label="Project Phase (Optional)" />}
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting || loadingMeta || ticket?.converted_task_id} startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}>
          Convert to Task
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketConvertToTaskDialog;
