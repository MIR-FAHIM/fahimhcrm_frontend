import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import {
  CircularProgress, Autocomplete,
  Paper, Grid, Typography, Divider, Chip, Avatar, Box, Slider, Button, Checkbox, FormControlLabel,
  Tabs, Tab, TextField, Card, CardContent, Stack
} from '@mui/material';
import {

  getTaskDetails, updateCompletionPercentage,
  updateShowCompletionPercentage, getTaskActivity,
  getTaskFollowup, addTaskFollowup,
  getStatus, updateTaskStatus, updateTask, getPriority, getProjects, assignUser, getTaskType, addNotification
} from '../../../api/controller/admin_controller/task_controller/task_controller';
import ActivityList from './followup-activity/activity_list';
import FollowUpList from './followup-activity/followup_list';
import { base_url, image_file_url } from "../../../api/config/index";
import TaskDueDate from "./components_task/task_due_date";
import EmployeeSelector from "./components_task/employee_selector";
import TaskStatusChangeComponent from "./components_task/task_status_update_details";
import TaskTypeUpdateComponent from "./components_task/task_type_update";
import TaskPriorityUpdateComponent from "./components_task/task_priority_update";
import TaskTitleInfo from "./components_task/task_info_title";

// Main component for Task Details
const TaskDetails = () => {
  // State declarations
  const userID = localStorage.getItem("userId");
  const [employees, setEmployees] = useState([]);
  const { id } = useParams();
  const [statuses, setStatuses] = useState([]);
  const [typeList, setTypeList] = useState([]);
  const [priorityList, setPriorityList] = useState([]);
  const [task, setTask] = useState(null);
  const [assignID, setAssignID] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [showCompletionPercentage, setShowCompletionPercentage] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [taskActivities, setTaskActivities] = useState([]);
  const [taskFollowUps, setTaskFollowUps] = useState([]);
  const [followUpTitle, setFollowUpTitle] = useState('');
  const [followUpDetails, setFollowUpDetails] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    fetchStatuses();

    fetchTaskType();
    fetchTaskPriority();
    const fetchData = async () => {
      const [taskDetails, activities, followups] = await Promise.all([
        getTaskDetails(id),
        getTaskActivity(id),
        getTaskFollowup(id)
      ]);
      setTask(taskDetails.data);
      setCompletionPercentage(taskDetails.data.completion_percentage);
      setShowCompletionPercentage(taskDetails.data.show_completion_percentage);
      setTaskActivities(activities.data);
      setTaskFollowUps(followups.data);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  // Fetch statuses
  const fetchStatuses = async () => {
    try {
      const response = await getStatus();
      console.log("Fetched statuses:", response.data);
      setStatuses(response.data);
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };



  const handleAddNotification = async (id) => {

    const data = {
      'user_id': 3,
      'title': 'Task Reminder',
      'subtitle': task.task_title,
      'type': 'general',
      'is_seen': 0,
      'send_push': 0,
    };
    try {
      const response = await addNotification(data);
      alert(response.message);

    } catch (error) {
      console.error("Error handleAddNotification:", error);
    }
  };

  // Fetch task types
  const fetchTaskType = async () => {
    try {
      const response = await getTaskType();
      console.log("Fetched getTaskType:", response.data);
      setTypeList(response.data);
    } catch (error) {
      console.error("Error fetching getTaskType:", error);
    }
  };
  const fetchTaskPriority = async () => {
    try {
      const response = await getPriority();
      console.log("Fetched getPriority:", response.data);
      setPriorityList(response.data);
    } catch (error) {
      console.error("Error fetching getPriority:", error);
    }
  };

  // Handle status change
  const handleStatusChange = async (taskId, newStatusId) => {
    try {
      await updateTaskStatus({ task_id: taskId, status_id: newStatusId, user_id: userID });
      const taskDetailsRes = await getTaskDetails(id);
      setTask(taskDetailsRes.data);
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  // Handle task type change
  const handleTaskType = async (taskId, typeId) => {
    try {
      await updateTask({ task_id: taskId, task_type_id: typeId });
      const taskDetailsRes = await getTaskDetails(id);
      setTask(taskDetailsRes.data);
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };
  const handleTaskInfoUpdate = async (field, value) => {
    try {
      await updateTask({ task_id: id, [field]: value });
      const taskDetailsRes = await getTaskDetails(id);
      setTask(taskDetailsRes.data);
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };
  const handleAssignUser = async (data) => {

    // { task_id: response.data.id, assigned_person: data.user_id, assigned_by: userID, is_main: 1 }
    try {
      const res = await assignUser(data);
      const taskDetails = await getTaskDetails(id);
      setTask(taskDetails.data);
      alert(res.message);


    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };
  const handleTaskPriority = async (taskId, priorityID) => {
    try {
      await updateTask({ task_id: taskId, priority_id: priorityID });
      const taskDetailsRes = await getTaskDetails(id);
      setTask(taskDetailsRes.data);
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  // Handle completion percentage change
  const handleCompletionChange = (event, newValue) => setCompletionPercentage(newValue);

  // Handle due date edit
  const onEditDueDate = async (dueData) => {
    await updateTask({
      'task_id': id,
      'due_date': dueData.format("YYYY-MM-DD"),
    });
    const taskDetailsRes = await getTaskDetails(id);
    setTask(taskDetailsRes.data);
  };

  // Save completion percentage
  const handleSaveCompletion = async () => {
    const response = await updateCompletionPercentage({ task_id: id, completion_percentage: completionPercentage, user_id: userID });
    alert(response.status === 'success' ? 'Completion Percentage Updated Successfully!' : 'Error updating Completion Percentage.');
  };

  // Toggle show completion percentage
  const handleShowCompletionChange = async (event) => {
    const newShow = event.target.checked;
    setShowCompletionPercentage(newShow);
    const response = await updateShowCompletionPercentage({ task_id: id, show_completion_percentage: newShow ? 0 : 1, user_id: userID});
    alert(response.status === 'success' ? 'Show Completion Percentage Updated Successfully!' : 'Error updating Show Completion Percentage.');
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => setTabValue(newValue);

  // Add follow-up
  const handleAddFollowUp = async (e) => {
    e.preventDefault();
    if (!followUpTitle || !followUpDetails) return alert('Please fill in all fields');
    const response = await addTaskFollowup({
      task_id: id,
      followup_title: followUpTitle,
      followup_details: followUpDetails,
      status: '1',
      type: 'followup',
      created_by: 1,
    });
    if (response.status === 'success') {
      alert('Follow-up added successfully!');
      setFollowUpTitle('');
      setFollowUpDetails('');
    } else {
      alert('Failed to add follow-up!');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Paper sx={{ padding: 4, borderRadius: 4, boxShadow: 3 }}>
      <TaskTitleInfo task={task} handleTaskInfoUpdate={handleTaskInfoUpdate} />
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card variant="outlined">
            <CardContent>
              <Grid container spacing={2}>
                <TaskPriorityUpdateComponent task={task} taskPriorityList={priorityList} handleTaskTypeUpdate={handleTaskPriority} />
                <TaskTypeUpdateComponent task={task} taskTypeList={typeList} handleTaskTypeUpdate={handleTaskType} />
                <TaskStatusChangeComponent task={task} statuses={statuses} handleStatusChange={handleStatusChange} />

                <TaskDueDate task={task} onEditDueDate={onEditDueDate} />

              </Grid>
            </CardContent>
            <Grid container spacing={3}>
              {task.assigned_persons.map((employee) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={employee.id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      borderRadius: 3,
                      boxShadow: 3,
                      backgroundColor: "#fdfdfd",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar
                          src={`${image_file_url}/${employee.assigned_person.photo}`}
                          sx={{
                            width: 60,
                            height: 60,
                            mr: 2,
                            border: "2px solid #1976d2",
                          }}
                        />
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {employee.assigned_person.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {employee.assigned_person.role?.role_name || "No Role"}
                          </Typography>
                        </Box>
                      </Box>

                      {/* You can add more employee stats/info here if desired */}
                      <Box mt={2}>
                        <Typography variant="body2" color="text.secondary">
                          Email: {employee.assigned_person.email || "N/A"}
                        </Typography>
                      </Box>
                    </CardContent>

                    <Box px={2} pb={2}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="primary"
                        startIcon={<NotificationsActiveIcon />}
                        sx={{
                          borderRadius: "20px",
                          textTransform: "none",
                          fontWeight: "bold",
                          py: 1,
                          backgroundColor: "#fff",
                          "&:hover": {
                            backgroundColor: "#f0f4ff",
                          },
                        }}
                        onClick={() => handleAddNotification(employee.id)}
                      >
                        Remind
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>Add Follow-up</Typography>
              <form onSubmit={handleAddFollowUp}>
                <TextField
                  label="Follow-up Title"
                  variant="outlined"
                  fullWidth
                  value={followUpTitle}
                  onChange={(e) => setFollowUpTitle(e.target.value)}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Follow-up Details"
                  variant="outlined"
                  fullWidth
                  value={followUpDetails}
                  onChange={(e) => setFollowUpDetails(e.target.value)}
                  required
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                />
                <Button variant="contained" color="primary" fullWidth type="submit">Add Follow-up</Button>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <EmployeeSelector handleAssignData={handleAssignUser} taskID={task.id} />
      <Divider sx={{ my: 4 }} />


      {task.project === null ? (
        <Typography variant="body2">No project added for this task</Typography>
      ) : (
        <>
          <Typography variant="h6">Project</Typography>
          <Typography variant="body1">{task.project.project_name}</Typography>
          <Typography variant="body2" gutterBottom>{task.project.description}</Typography>
        </>
      )}

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" gutterBottom>Created By</Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar src={`${image_file_url}/${task.creator.photo}`} alt={task.creator.name} />
        <Typography>{task.creator.name}</Typography>
      </Stack>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" gutterBottom>Completion Percentage</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Slider
          value={completionPercentage}
          onChange={handleCompletionChange}
          aria-labelledby="completion-percentage-slider"
          valueLabelDisplay="auto"
          min={0}
          max={100}
          sx={{ width: '80%', mr: 2 }}
        />
        <Button variant="contained" onClick={handleSaveCompletion}>Save</Button>
      </Box>

      <FormControlLabel
        control={<Checkbox checked={showCompletionPercentage} onChange={handleShowCompletionChange} />}
        label="Show Completion Percentage"
      />

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ my: 4 }} variant="fullWidth">
        <Tab label="Task Follow-ups" />
        <Tab label="Task Activities" />

      </Tabs>

      {tabValue === 0 ? (
        <FollowUpList followUps={taskFollowUps} />
      ) : (
        <ActivityList followUps={taskActivities} />

      )}
    </Paper>
  );
};

export default TaskDetails;