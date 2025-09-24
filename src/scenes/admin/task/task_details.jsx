// src/scenes/task/TaskDetails.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import MapIcon from "@mui/icons-material/Map";
import {
  CircularProgress, Paper, Grid, Typography, Divider, Avatar, Box,
  Tabs, Tab, Card, CardContent, Stack, Button, CardActions, IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  getTaskDetails, updateCompletionPercentage, updateShowCompletionPercentage,
  getTaskActivity, getTaskFollowup, addTaskFollowup, deleteTaskFollowup,
  getStatus, updateTaskStatus, updateTask, getPriority, assignUser, getTaskType, addNotification
} from "../../../api/controller/admin_controller/task_controller/task_controller";
import ActivityList from "./followup-activity/activity_list";
import { image_file_url } from "../../../api/config/index";
import TaskDueDate from "./components_task/task_due_date";
import EmployeeSelector from "./components_task/employee_selector";
import TaskStatusChangeComponent from "./components_task/task_status_update_details";
import TaskTypeUpdateComponent from "./components_task/task_type_update";
import TaskPriorityUpdateComponent from "./components_task/task_priority_update";
import TaskTitleInfo from "./components_task/task_info_title";
import TaskImageGallery from "./components_task/task_image";
import TaskCompletionSlider from "./components_task/percentage_completion";
import TaskFollowupInboxDrawer from "./components_task/follow_up_inbox_drawer";

const TaskDetails = () => {
  const userID = localStorage.getItem("userId");
  const { id } = useParams();
  const navigate = useNavigate();
  const [statuses, setStatuses] = useState([]);
  const [typeList, setTypeList] = useState([]);
  const [priorityList, setPriorityList] = useState([]);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVisit, setIsVisit] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [showCompletionPercentage, setShowCompletionPercentage] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [taskActivities, setTaskActivities] = useState([]);
  const [taskFollowUps, setTaskFollowUps] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleOpenMap = (lat, lng) => {
    if (lat != null && lng != null) {
      navigate(`/google-map?lat=${lat}&lng=${lng}`);
    }
  };
  const refreshTask = useCallback(async () => {
    const [taskDetails, activities, followups] = await Promise.all([
      getTaskDetails(id),
      getTaskActivity(id),
      getTaskFollowup(id),
    ]);
    setTask(taskDetails.data);
    setCompletionPercentage(taskDetails.data?.completion_percentage ?? 0);
    setTaskActivities(activities.data ?? []);
    setTaskFollowUps(followups.data ?? []);
    setIsVisit(taskDetails.data?.task_type.type_name === 'Visit');
    setShowCompletionPercentage(taskDetails.data?.show_completion_percentage !== 0);
  }, [id]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [st, tt, pr] = await Promise.all([getStatus(), getTaskType(), getPriority()]);
        setStatuses(st.data ?? []);
        setTypeList(tt.data ?? []);
        setPriorityList(pr.data ?? []);
        await refreshTask();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, refreshTask]);

  // Notifications
  const handleAddNotification = async (uid) => {
    try {
      const res = await addNotification({
        user_id: uid,
        title: "Task Reminder",
        subtitle: task.task_title,
        type: "task",
        is_seen: 0,
        send_push: 1,
      });
      alert(res.message);
    } catch (e) {
      console.error("addNotification:", e);
    }
  };

  // Updates
  const handleStatusChange = async (taskId, newStatusId) => {
    try {
      await updateTaskStatus({ task_id: taskId, status_id: newStatusId, user_id: userID });
      await refreshTask();
    } catch (e) {
      console.error("status:", e);
    }
  };
  const handleTaskType = async (taskId, typeId) => {
    try {
      await updateTask({ task_id: taskId, task_type_id: typeId });
      await refreshTask();
    } catch (e) {
      console.error("type:", e);
    }
  };
  const handleTaskPriority = async (taskId, priorityID) => {
    try {
      await updateTask({ task_id: taskId, priority_id: priorityID });
      await refreshTask();
    } catch (e) {
      console.error("priority:", e);
    }
  };
  const handleTaskInfoUpdate = async (field, value) => {
    try {
      await updateTask({ task_id: id, [field]: value });
      setTask((prevTask) => ({
        ...prevTask,
        [field]: value,
      }));
    } catch (e) {
      console.error("info:", e);
    }
  };
  const handleAssignUser = async (data) => {
    try {
      const res = await assignUser(data);
      await refreshTask();
      alert(res.message);
    } catch (e) {
      console.error("assign:", e);
    }
  };
  const handleDeleteFollowup = async (id) => {
    try {
      const res = await deleteTaskFollowup(id);
      await refreshTask();
      alert(res.message);
    } catch (e) {
      console.error("assign:", e);
    }
  };
  const onEditDueDate = async (dueData) => {
    try {
      await updateTask({ task_id: id, due_date: dueData.format("YYYY-MM-DD") });
      await refreshTask();
    } catch (e) {
      console.error("due:", e);
    }
  };

  // Completion
  const handleCompletionChange = (_, v) => setCompletionPercentage(v);
  const handleSaveCompletion = async () => {
    const res = await updateCompletionPercentage({
      task_id: id,
      completion_percentage: completionPercentage,
      user_id: userID,
    });
    alert(res.status === "success" ? "Progress updated!" : "Update failed.");
  };
  const handleShowCompletionChange = async () => {
    const next = !showCompletionPercentage;
    setShowCompletionPercentage(next);
    await updateShowCompletionPercentage({
      task_id: id,
      show_completion_percentage: next ? 1 : 0,
      user_id: userID,
    });
  };

  // Follow-ups add
  const addFollowupFromDrawer = async (title, details) => {
    const res = await addTaskFollowup({
      task_id: id,
      followup_title: title,
      followup_details: details,
      status: "1",
      type: "followup",
      created_by: userID,
    });
    if (res.status === "success") {
      await refreshTask();
    }
  };

  if (loading) return <CircularProgress />;
  if (!task) return null;

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <TaskTitleInfo task={task} handleTaskInfoUpdate={handleTaskInfoUpdate} />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* LEFT: Controls */}
        <Grid item xs={12} md={8}>
          <Card variant="outlined">
            <CardContent>
              <Grid container spacing={2}>
                <TaskPriorityUpdateComponent
                  task={task}
                  taskPriorityList={priorityList}
                  handleTaskPriorityUpdate={handleTaskPriority}
                />
                {isVisit && (
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <Box
                      sx={{
                        p: 2,
                        // Use theme's background paper color, which adapts to dark mode

                        borderRadius: 2,
                        boxShadow: 1,
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold" color="text.primary">
                        Task Type
                      </Typography>
                      <Typography variant="h8" fontWeight="bold" color="text.primary">
                        Visit
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {!isVisit && (
                  <TaskTypeUpdateComponent
                    task={task}
                    taskTypeList={typeList}
                    handleTaskTypeUpdate={handleTaskType}
                  />
                )}
                <TaskStatusChangeComponent
                  task={task}
                  statuses={statuses}
                  handleStatusChange={handleStatusChange}
                />
                <TaskDueDate task={task} onEditDueDate={onEditDueDate} />
              </Grid>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>Follow-ups</Typography>
              {/* Conditional rendering applied directly here */}
              {taskFollowUps.length > 0 ? (
                <Button variant="contained" fullWidth onClick={() => setDrawerOpen(true)}>
                  You Have ({taskFollowUps.length}) Task Follow-ups - Check and Manage
                </Button>
              ) : (
                <Button variant="outlined" fullWidth onClick={() => setDrawerOpen(true)} startIcon={<AddIcon />}>
                  Add New Task Follow-up
                </Button>
              )}
            </CardContent>
          </Card>
          <Box mt={2}>
            <TaskImageGallery taskId={id} />
          </Box>
        </Grid>

        {/* RIGHT: Progress + Assign + Followups launcher */}

       
        <Grid item xs={12} md={4}>
           {isVisit &&(
<Card variant="outlined" sx={{ mb: 2 }}>
  <CardContent>
    <Typography variant="h6" component="div">
      Visit Details
    </Typography>
    <Typography color="text.secondary">
      Note: {task.task_visit_relation.visit.note}
    </Typography>
    <Typography color="text.secondary">
      Visit Type: {task.task_visit_relation.visit.visit_type}
    </Typography>
    <Typography color="text.secondary">
      Lead: {
        typeof task.task_visit_relation.visit.lead === "object" && task.task_visit_relation.visit.lead !== null ? (
          <Button
            variant="text"
            color="primary"
            size="small"
            sx={{ textTransform: "none", p: 0, minWidth: 0 }}
            onClick={() => navigate(`/prospect-detail/${task.task_visit_relation.visit.lead.id}`)}
          >
            {task.task_visit_relation.visit.lead.prospect_name}
          </Button>
        ) : (
          task.task_visit_relation.visit.lead
        )
      }
    </Typography>
    <Typography color="text.secondary">
      Visit Zone: {task.task_visit_relation.visit.zone.zone_name}
    </Typography>
    <Typography color="text.secondary">
      Planned By: {task.task_visit_relation.visit.planner.name}
    </Typography>
  </CardContent>
  {isVisit && (
    <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
      <Button
        variant="contained"
        size="small"
        startIcon={<MapIcon />}
        onClick={() => handleOpenMap(task.task_visit_relation.latitude, task.task_visit_relation.longitude)}
      >
        Show Map
      </Button>
    </CardActions>
  )}
</Card>
          )}

           {!isVisit &&(
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <TaskCompletionSlider
                completionPercentage={completionPercentage}
                showCompletionPercentage={showCompletionPercentage}
                handleCompletionChange={handleCompletionChange}
                handleSaveCompletion={handleSaveCompletion}
                handleShowCompletionChange={handleShowCompletionChange}
              />
            </CardContent>
          </Card>
          )}

          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <EmployeeSelector
                taskID={task.id}
                assignedPersons={task.assigned_persons}
                handleAssignData={handleAssignUser}
                handleUnassignData={() => { }}
                handleAddNotification={handleAddNotification}
              />
            </CardContent>
          </Card>


        </Grid>
      </Grid>

      {/* Project / Creator */}
      <Divider sx={{ my: 3 }} />
      {task.project ? (
        <>
          <Typography variant="h6">Project</Typography>
          <Typography variant="body1">{task.project.project_name}</Typography>
          <Typography variant="body2" gutterBottom>{task.project.description}</Typography>
        </>
      ) : (
        <Typography variant="body2">No project added for this task</Typography>
      )}

      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" gutterBottom>Created By</Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar src={`${image_file_url}/${task.creator.photo}`} alt={task.creator.name} />
        <Typography>{task.creator.name}</Typography>
      </Stack>

      {/* Activities */}
      <Divider sx={{ my: 3 }} />
      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="fullWidth">
        <Tab label="Task Activities" />
      </Tabs>
      <ActivityList followUps={taskActivities} />

      {/* Right-side Inbox Drawer */}
      <TaskFollowupInboxDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        followUps={taskFollowUps}
        taskID={id}
        onAddFollowUp={addFollowupFromDrawer}
        onToggleComplete={(fid, newStatus) =>
          setTaskFollowUps((prev) => prev.map((f) => (f.id === fid ? { ...f, status: newStatus } : f)))
        }
        onEditFollowUp={(f) => console.log("Edit follow-up", f)}
        onDeleteFollowUp={(fid) =>
          handleDeleteFollowup(fid)
        }
      />
    </Paper>
  );
};

export default TaskDetails;
