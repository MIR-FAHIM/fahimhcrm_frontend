// src/scenes/task/TaskDetails.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  AddRounded,
  ArrowBackRounded,
  AssignmentTurnedInRounded,
  CalendarMonthRounded,
  CheckCircleRounded,
  FlagRounded,
  FolderRounded,
  GroupsRounded,
  HistoryRounded,
  ImageRounded,
  MapRounded,
  PersonRounded,
  RefreshRounded,
  RouteRounded,
  TaskAltRounded,
  UpdateRounded,
} from "@mui/icons-material";
import dayjs from "dayjs";

import {
  addNotification,
  addTaskFollowup,
  assignUser,
  deleteTaskFollowup,
  getPriority,
  getStatus,
  getTaskActivity,
  getTaskDetails,
  getTaskFollowup,
  getTaskType,
  updateCompletionPercentage,
  updateShowCompletionPercentage,
  updateTask,
  updateTaskStatus,
} from "../../../api/controller/admin_controller/task_controller/task_controller";
import { image_file_url } from "../../../api/config/index";
import ActivityList from "./followup-activity/activity_list";
import EmployeeSelector from "./components_task/employee_selector";
import TaskCompletionSlider from "./components_task/percentage_completion";
import TaskDueDate from "./components_task/task_due_date";
import TaskFollowupInboxDrawer from "./components_task/follow_up_inbox_drawer";
import TaskImageGallery from "./components_task/task_image";
import TaskPriorityUpdateComponent from "./components_task/task_priority_update";
import TaskStatusChangeComponent from "./components_task/task_status_update_details";
import TaskTitleInfo from "./components_task/task_info_title";
import TaskTypeUpdateComponent from "./components_task/task_type_update";

const fallback = "-";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

const formatDate = (value) => {
  if (!value) return fallback;
  const date = dayjs(value);
  return date.isValid() ? date.format("MMM D, YYYY") : fallback;
};

const getTaskTypeName = (task) => task?.task_type?.type_name || fallback;
const getPriorityName = (task) => task?.priority?.priority_name || fallback;
const getStatusName = (task) => task?.status?.status_name || fallback;

const getDueInfo = (dueDate) => {
  if (!dueDate) return { label: "No due date", tone: "default", caption: "Not scheduled" };
  const due = dayjs(dueDate).startOf("day");
  if (!due.isValid()) return { label: "Invalid date", tone: "warning", caption: "Needs review" };

  const days = due.diff(dayjs().startOf("day"), "day");
  if (days < 0) return { label: "Overdue", tone: "error", caption: `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} late` };
  if (days === 0) return { label: "Due today", tone: "warning", caption: "Needs attention" };
  if (days <= 3) return { label: "Due soon", tone: "warning", caption: `${days} day${days === 1 ? "" : "s"} left` };
  return { label: "Scheduled", tone: "success", caption: `${days} days left` };
};

const toneColor = (theme, tone = "primary") => {
  if (tone === "default") return theme.palette.text.secondary;
  return theme.palette[tone]?.main || theme.palette.primary.main;
};

const MetaTile = ({ icon, label, value, caption, tone = "primary" }) => {
  const theme = useTheme();
  const color = toneColor(theme, tone);
  const displayValue = value === 0 ? 0 : value || fallback;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        minWidth: 0,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Avatar
          variant="rounded"
          sx={{
            width: 38,
            height: 38,
            bgcolor: alpha(color, 0.12),
            color,
          }}
        >
          {icon}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
            {label}
          </Typography>
          <Typography variant="body2" noWrap sx={{ color: theme.palette.text.primary, fontWeight: 900 }}>
            {displayValue}
          </Typography>
          {caption && (
            <Typography variant="caption" noWrap sx={{ color: theme.palette.text.secondary }}>
              {caption}
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
};

const Section = ({ icon, title, subtitle, action, children }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
          {icon && (
            <Avatar
              variant="rounded"
              sx={{
                width: 36,
                height: 36,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
              }}
            >
              {icon}
            </Avatar>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 900, lineHeight: 1.1 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
        {action}
      </Stack>
      {children}
    </Paper>
  );
};

const TaskDetailsSkeleton = () => (
  <Box sx={{ p: { xs: 2, md: 4 } }}>
    <Skeleton variant="rounded" height={108} sx={{ mb: 2 }} />
    <Grid container spacing={2}>
      <Grid item xs={12} lg={8}>
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={220} />
          <Skeleton variant="rounded" height={180} />
        </Stack>
      </Grid>
      <Grid item xs={12} lg={4}>
        <Skeleton variant="rounded" height={420} />
      </Grid>
    </Grid>
  </Box>
);

const TaskDetails = () => {
  const userID = localStorage.getItem("userId");
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [statuses, setStatuses] = useState([]);
  const [typeList, setTypeList] = useState([]);
  const [priorityList, setPriorityList] = useState([]);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [showCompletionPercentage, setShowCompletionPercentage] = useState(false);
  const [taskActivities, setTaskActivities] = useState([]);
  const [taskFollowUps, setTaskFollowUps] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const notify = (message, severity = "success") => setSnack({ open: true, message, severity });

  const refreshTask = useCallback(async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    setError(null);

    try {
      const [taskDetails, activities, followups] = await Promise.all([
        getTaskDetails(id),
        getTaskActivity(id),
        getTaskFollowup(id),
      ]);
      const nextTask = taskDetails?.data || null;

      setTask(nextTask);
      setCompletionPercentage(nextTask?.completion_percentage ?? 0);
      setTaskActivities(activities?.data ?? []);
      setTaskFollowUps(followups?.data ?? []);
      setShowCompletionPercentage(Number(nextTask?.show_completion_percentage ?? 0) !== 0);
    } catch (taskError) {
      console.error("task details:", taskError);
      setError("Task details could not be loaded.");
    } finally {
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [st, tt, pr] = await Promise.all([getStatus(), getTaskType(), getPriority()]);
        if (!mounted) return;
        setStatuses(st?.data ?? []);
        setTypeList(tt?.data ?? []);
        setPriorityList(pr?.data ?? []);
        await refreshTask();
      } catch (loadError) {
        console.error(loadError);
        if (mounted) setError("Task support data could not be loaded.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, refreshTask]);

  const dueInfo = useMemo(() => getDueInfo(task?.due_date), [task?.due_date]);
  const isVisit = getTaskTypeName(task) === "Visit";
  const visitRelation = task?.task_visit_relation;
  const visit = visitRelation?.visit;
  const creator = task?.creator;
  const creatorPhoto = creator?.photo ? `${image_file_url}/${creator.photo}` : "";
  const assignedCount = task?.assigned_persons?.length || 0;
  const progressValue = Number(completionPercentage || 0);

  const handleOpenMap = (lat, lng) => {
    if (lat != null && lng != null) navigate(`/google-map?lat=${lat}&lng=${lng}`);
  };

  const handleAddNotification = async (uid) => {
    try {
      const res = await addNotification({
        user_id: uid,
        title: "Task Reminder",
        subtitle: task?.task_title,
        type: "task",
        is_seen: 0,
        send_push: 1,
      });
      notify(res?.message || "Reminder sent.");
    } catch (notificationError) {
      console.error("addNotification:", notificationError);
      notify("Reminder could not be sent.", "error");
    }
  };

  const handleStatusChange = async (taskId, newStatusId) => {
    try {
      await updateTaskStatus({ task_id: taskId, status_id: newStatusId, user_id: userID });
      await refreshTask({ silent: true });
      notify("Task status updated.");
    } catch (statusError) {
      console.error("status:", statusError);
      notify("Task status could not be updated.", "error");
    }
  };

  const handleTaskType = async (taskId, typeId) => {
    try {
      await updateTask({ task_id: taskId, task_type_id: typeId });
      await refreshTask({ silent: true });
      notify("Task type updated.");
    } catch (typeError) {
      console.error("type:", typeError);
      notify("Task type could not be updated.", "error");
    }
  };

  const handleTaskPriority = async (taskId, priorityID) => {
    try {
      await updateTask({ task_id: taskId, priority_id: priorityID });
      await refreshTask({ silent: true });
      notify("Task priority updated.");
    } catch (priorityError) {
      console.error("priority:", priorityError);
      notify("Task priority could not be updated.", "error");
    }
  };

  const handleTaskInfoUpdate = async (field, value) => {
    try {
      await updateTask({ task_id: id, [field]: value });
      setTask((prevTask) => ({ ...prevTask, [field]: value }));
      notify("Task information updated.");
    } catch (infoError) {
      console.error("info:", infoError);
      notify("Task information could not be updated.", "error");
    }
  };

  const handleAssignUser = async (data) => {
    try {
      const res = await assignUser(data);
      await refreshTask({ silent: true });
      notify(res?.data?.message || res?.message || "Employee assigned.");
    } catch (assignError) {
      console.error("assign:", assignError);
      notify("Employee could not be assigned.", "error");
    }
  };

  const handleDeleteFollowup = async (followupId) => {
    try {
      const res = await deleteTaskFollowup(followupId);
      await refreshTask({ silent: true });
      notify(res?.message || "Follow-up deleted.");
    } catch (followupError) {
      console.error("delete follow-up:", followupError);
      notify("Follow-up could not be deleted.", "error");
    }
  };

  const onEditDueDate = async (dueData) => {
    if (!dueData) return;
    try {
      await updateTask({ task_id: id, due_date: dueData.format("YYYY-MM-DD") });
      await refreshTask({ silent: true });
      notify("Due date updated.");
    } catch (dueError) {
      console.error("due:", dueError);
      notify("Due date could not be updated.", "error");
    }
  };

  const handleCompletionChange = (_, value) => setCompletionPercentage(value);

  const handleSaveCompletion = async () => {
    try {
      const res = await updateCompletionPercentage({
        task_id: id,
        completion_percentage: completionPercentage,
        user_id: userID,
      });
      notify(res?.status === "success" ? "Progress updated." : "Progress update failed.", res?.status === "success" ? "success" : "error");
      await refreshTask({ silent: true });
    } catch (progressError) {
      console.error("completion:", progressError);
      notify("Progress could not be updated.", "error");
    }
  };

  const handleShowCompletionChange = async () => {
    const next = !showCompletionPercentage;
    setShowCompletionPercentage(next);
    try {
      await updateShowCompletionPercentage({
        task_id: id,
        show_completion_percentage: next ? 1 : 0,
        user_id: userID,
      });
      notify(next ? "Progress is visible." : "Progress is hidden.");
    } catch (visibilityError) {
      console.error("show completion:", visibilityError);
      setShowCompletionPercentage(!next);
      notify("Progress visibility could not be updated.", "error");
    }
  };

  const addFollowupFromDrawer = async (title, details) => {
    const res = await addTaskFollowup({
      task_id: id,
      followup_title: title,
      followup_details: details,
      status: "1",
      type: "followup",
      created_by: userID,
    });

    if (res?.status === "success") {
      await refreshTask({ silent: true });
      notify("Follow-up added.");
    } else {
      notify("Follow-up could not be added.", "error");
    }
  };

  if (loading) return <TaskDetailsSkeleton />;

  if (!task) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          Task details were not found.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", lg: "center" }}
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackRounded />}
            onClick={() => navigate(-1)}
            sx={{ borderRadius: 2, flexShrink: 0 }}
          >
            Back
          </Button>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Chip size="small" icon={<TaskAltRounded />} label={`Task #${task.id}`} sx={{ fontWeight: 800 }} />
              <Chip size="small" label={getStatusName(task)} color="primary" variant="outlined" sx={{ fontWeight: 800 }} />
              <Chip size="small" label={dueInfo.label} color={dueInfo.tone === "default" ? "default" : dueInfo.tone} sx={{ fontWeight: 800 }} />
            </Stack>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
              Task detail workspace with controls, people, follow-ups, media, and activity history
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="contained"
          startIcon={refreshing ? <CircularProgress size={16} color="inherit" /> : <RefreshRounded />}
          disabled={refreshing}
          onClick={() => refreshTask({ silent: true })}
          sx={{ borderRadius: 2, fontWeight: 900, alignSelf: { xs: "stretch", lg: "center" } }}
        >
          Refresh
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 380px" },
          gap: 2.5,
          alignItems: "start",
        }}
      >
        <Stack spacing={2.5} sx={{ minWidth: 0 }}>
          <TaskTitleInfo task={task} handleTaskInfoUpdate={handleTaskInfoUpdate} />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" },
              gap: 1.5,
            }}
          >
            <MetaTile icon={<FlagRounded />} label="Priority" value={getPriorityName(task)} tone="warning" />
            <MetaTile icon={<AssignmentTurnedInRounded />} label="Status" value={getStatusName(task)} tone="primary" />
            <MetaTile icon={<CalendarMonthRounded />} label="Due" value={formatDate(task.due_date)} caption={dueInfo.caption} tone={dueInfo.tone} />
            <MetaTile icon={<GroupsRounded />} label="Assignees" value={assignedCount} caption="People on this task" tone="info" />
          </Box>

          <Section icon={<UpdateRounded />} title="Task Controls" subtitle="Update priority, type, status, and due date without leaving this page">
            <Grid container spacing={1.5}>
              <TaskPriorityUpdateComponent
                task={task}
                taskPriorityList={priorityList}
                handleTaskPriorityUpdate={handleTaskPriority}
              />
              {isVisit ? (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.info.main, 0.08),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.22)}`,
                      minHeight: "100%",
                    }}
                  >
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
                      Task Type
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                      <RouteRounded fontSize="small" color="info" />
                      <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 900 }}>
                        Visit
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
              ) : (
                <TaskTypeUpdateComponent task={task} taskTypeList={typeList} handleTaskTypeUpdate={handleTaskType} />
              )}
              <TaskStatusChangeComponent task={task} statuses={statuses} handleStatusChange={handleStatusChange} />
              <TaskDueDate task={task} onEditDueDate={onEditDueDate} />
            </Grid>
          </Section>

          {isVisit ? (
            <Section
              icon={<RouteRounded />}
              title="Visit Details"
              subtitle="Planner, lead, zone, and captured route information"
              action={
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<MapRounded />}
                  disabled={visitRelation?.latitude == null || visitRelation?.longitude == null}
                  onClick={() => handleOpenMap(visitRelation?.latitude, visitRelation?.longitude)}
                  sx={{ borderRadius: 2, fontWeight: 800 }}
                >
                  Show Map
                </Button>
              }
            >
              <Grid container spacing={1.5}>
                <Grid item xs={12} md={6}>
                  <MetaTile icon={<RouteRounded />} label="Visit Type" value={visit?.visit_type || fallback} tone="info" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <MetaTile icon={<PersonRounded />} label="Planned By" value={visit?.planner?.name || fallback} tone="primary" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <MetaTile icon={<MapRounded />} label="Zone" value={visit?.zone?.zone_name || fallback} tone="success" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
                      Lead
                    </Typography>
                    {typeof visit?.lead === "object" && visit?.lead !== null ? (
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => navigate(`/prospect-detail/${visit.lead.id}`)}
                        sx={{ display: "block", p: 0, mt: 0.5, textAlign: "left", fontWeight: 900 }}
                      >
                        {visit.lead.prospect_name || fallback}
                      </Button>
                    ) : (
                      <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 900, mt: 0.5 }}>
                        {visit?.lead || fallback}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: theme.palette.background.default,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
                      Note
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.primary, whiteSpace: "pre-line", mt: 0.5 }}>
                      {visit?.note || "No visit note available."}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Section>
          ) : (
            <Section icon={<CheckCircleRounded />} title="Progress" subtitle="Control how much progress is visible on this task">
              <TaskCompletionSlider
                completionPercentage={completionPercentage}
                showCompletionPercentage={showCompletionPercentage}
                handleCompletionChange={handleCompletionChange}
                handleSaveCompletion={handleSaveCompletion}
                handleShowCompletionChange={handleShowCompletionChange}
              />
            </Section>
          )}

          <Section
            icon={<HistoryRounded />}
            title="Follow-ups"
            subtitle="Open the follow-up inbox to review, create, complete, or delete notes"
            action={
              <Button
                variant={taskFollowUps.length ? "contained" : "outlined"}
                startIcon={<AddRounded />}
                onClick={() => setDrawerOpen(true)}
                sx={{ borderRadius: 2, fontWeight: 900 }}
              >
                {taskFollowUps.length ? `Open Follow-ups (${taskFollowUps.length})` : "Add Follow-up"}
              </Button>
            }
          >
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.06),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
              }}
            >
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 800 }}>
                    {taskFollowUps.length ? "Follow-up conversation is active." : "No follow-ups have been created for this task."}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Use follow-ups for reminders, pending questions, and next actions.
                  </Typography>
                </Box>
                <Chip label={`${taskActivities.length} activities`} icon={<HistoryRounded />} variant="outlined" sx={{ fontWeight: 800 }} />
              </Stack>
            </Box>
          </Section>

          <TaskImageGallery taskId={id} />

          <Section icon={<HistoryRounded />} title="Activity Timeline" subtitle="Every task event and follow-up activity in one place">
            <ActivityList followUps={taskActivities} />
          </Section>
        </Stack>

        <Stack spacing={2.5} sx={{ position: { lg: "sticky" }, top: { lg: 24 }, minWidth: 0 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <Avatar src={creatorPhoto} sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}>
                {getInitials(creator?.name)}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" noWrap sx={{ color: theme.palette.text.primary, fontWeight: 900 }}>
                  {creator?.name || "Unknown creator"}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  Created by
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <EmployeeSelector
              taskID={task.id}
              assignedPersons={task.assigned_persons || []}
              handleAssignData={handleAssignUser}
              handleUnassignData={() => {}}
              handleAddNotification={handleAddNotification}
            />
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2 }}>
              <FolderRounded color="primary" />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 900 }}>
                  Project
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  Linked task context
                </Typography>
              </Box>
            </Stack>
            {task.project ? (
              <Box>
                <Typography variant="subtitle2" sx={{ color: theme.palette.text.primary, fontWeight: 900 }}>
                  {task.project.project_name || fallback}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.75, whiteSpace: "pre-line" }}>
                  {task.project.description || "No project description available."}
                </Typography>
              </Box>
            ) : (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                No project added for this task.
              </Alert>
            )}
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 900 }}>
                Snapshot
              </Typography>
              <Chip size="small" label={`${progressValue}%`} color="success" sx={{ fontWeight: 900 }} />
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, Math.max(0, progressValue))}
              sx={{ height: 8, borderRadius: 999, mb: 2 }}
            />
            <Stack spacing={1.25}>
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Typography variant="body2" color="text.secondary">Type</Typography>
                <Typography variant="body2" fontWeight={800}>{getTaskTypeName(task)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Typography variant="body2" color="text.secondary">Priority</Typography>
                <Typography variant="body2" fontWeight={800}>{getPriorityName(task)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Typography variant="body2" color="text.secondary">Due</Typography>
                <Typography variant="body2" fontWeight={800}>{formatDate(task.due_date)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Typography variant="body2" color="text.secondary">Media</Typography>
                <Typography variant="body2" fontWeight={800}><ImageRounded sx={{ fontSize: 16, verticalAlign: "middle", mr: 0.5 }} />Gallery</Typography>
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Box>

      <TaskFollowupInboxDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        followUps={taskFollowUps}
        taskID={id}
        onAddFollowUp={addFollowupFromDrawer}
        onToggleComplete={(fid, newStatus) =>
          setTaskFollowUps((prev) => prev.map((f) => (f.id === fid ? { ...f, status: newStatus } : f)))
        }
        onEditFollowUp={(followUp) => console.log("Edit follow-up", followUp)}
        onDeleteFollowUp={handleDeleteFollowup}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((current) => ({ ...current, open: false }))}
          sx={{ borderRadius: 2 }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TaskDetails;