import { useEffect, useMemo, useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  ArrowForwardRounded,
  AssignmentTurnedInRounded,
  CalendarMonthRounded,
  EventRounded,
  FilterAltRounded,
  FlagRounded,
  ListAltRounded,
  RefreshRounded,
  SearchRounded,
  TodayRounded,
  WarningAmberRounded,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { getAssignedTaskByUsers } from "../../../api/controller/admin_controller/task_controller/task_controller";

const localizer = momentLocalizer(moment);
const DATE_KEY = "YYYY-MM-DD";

const getPriorityName = (task) =>
  task?.priority?.priority_name || task?.priority_name || task?.raw?.priority?.priority_name || "No Priority";

const getStatusName = (task) =>
  task?.status?.status_name || task?.status_name || task?.raw?.status?.status_name || "No Status";

const getTypeName = (task) =>
  task?.task_type?.type_name || task?.task_type_name || task?.raw?.task_type?.type_name || "No Type";

const getPriorityTone = (priorityName = "") => {
  const normalized = priorityName.toLowerCase();
  if (normalized.includes("urgent") || normalized.includes("high")) return "error";
  if (normalized.includes("medium")) return "warning";
  if (normalized.includes("low")) return "success";
  return "primary";
};

const getStatusTone = (statusName = "") => {
  const normalized = statusName.toLowerCase();
  if (normalized.includes("done") || normalized.includes("complete")) return "success";
  if (normalized.includes("progress") || normalized.includes("working")) return "info";
  if (normalized.includes("hold") || normalized.includes("wait")) return "warning";
  return "primary";
};

const colorForTone = (theme, tone = "primary") =>
  theme.palette[tone]?.main || theme.palette.primary.main;

const normalizeTask = (row, index) => {
  const raw = row?.task || row || {};
  const due = raw.due_date ? moment(raw.due_date) : null;
  const hasDueDate = Boolean(due?.isValid());
  const priorityName = getPriorityName(raw);
  const statusName = getStatusName(raw);
  const dueKey = hasDueDate ? due.format(DATE_KEY) : null;

  return {
    id: raw.id ?? row?.task_id ?? `task-${index}`,
    title: raw.task_title || raw.title || "Untitled task",
    description: raw.task_details || raw.description || "",
    priority: raw.priority,
    priorityName,
    priorityTone: getPriorityTone(priorityName),
    status: raw.status,
    statusName,
    statusTone: getStatusTone(statusName),
    taskTypeName: getTypeName(raw),
    projectName: raw.project?.project_name || raw.project_name || "No project",
    start: hasDueDate ? due.clone().startOf("day").toDate() : null,
    end: hasDueDate ? due.clone().endOf("day").toDate() : null,
    dueKey,
    dueLabel: hasDueDate ? due.format("MMM D, YYYY") : "No due date",
    isOverdue: hasDueDate && due.isBefore(moment(), "day"),
    isToday: hasDueDate && due.isSame(moment(), "day"),
    allDay: true,
    raw,
  };
};

const formatLabel = (value = "") =>
  String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const uniqueValues = (items) =>
  Array.from(new Set(items.filter(Boolean))).sort((a, b) => a.localeCompare(b));

const buildTasksByDate = (items) =>
  items.reduce((acc, task) => {
    if (!task.dueKey) return acc;
    acc[task.dueKey] = acc[task.dueKey] || [];
    acc[task.dueKey].push(task);
    return acc;
  }, {});

const sortTasksForAgenda = (items) =>
  [...items].sort((a, b) => {
    if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
    const priorityOrder = { error: 0, warning: 1, primary: 2, info: 3, success: 4 };
    const priorityDiff = (priorityOrder[a.priorityTone] ?? 5) - (priorityOrder[b.priorityTone] ?? 5);
    if (priorityDiff !== 0) return priorityDiff;
    return a.title.localeCompare(b.title);
  });

const StatTile = ({ icon, label, value, tone = "primary" }) => {
  const theme = useTheme();
  const color = colorForTone(theme, tone);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        flex: "1 1 150px",
        minWidth: { xs: 145, sm: 160 },
      }}
    >
      <Stack direction="row" spacing={1.5} justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
            {label}
          </Typography>
          <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
            {value}
          </Typography>
        </Box>
        <Avatar variant="rounded" sx={{ bgcolor: alpha(color, 0.12), color, width: 40, height: 40 }}>
          {icon}
        </Avatar>
      </Stack>
    </Paper>
  );
};

const SmartToolbar = ({ label, onNavigate, onView, view, views }) => {
  const theme = useTheme();
  const availableViews = Array.isArray(views) ? views : Object.keys(views || {});

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={1.5}
      alignItems={{ xs: "stretch", md: "center" }}
      justifyContent="space-between"
      sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}
    >
      <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: "space-between", md: "flex-start" }}>
        <Button variant="outlined" size="small" onClick={() => onNavigate("PREV")} sx={{ borderRadius: 2 }}>
          Prev
        </Button>
        <Button variant="contained" size="small" startIcon={<TodayRounded />} onClick={() => onNavigate("TODAY")} sx={{ borderRadius: 2, fontWeight: 700 }}>
          Today
        </Button>
        <Button variant="outlined" size="small" onClick={() => onNavigate("NEXT")} sx={{ borderRadius: 2 }}>
          Next
        </Button>
      </Stack>

      <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 700, textAlign: "center" }}>
        {label}
      </Typography>

      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap justifyContent={{ xs: "center", md: "flex-end" }}>
        {availableViews.map((viewName) => (
          <Chip
            key={viewName}
            clickable
            label={formatLabel(viewName)}
            color={view === viewName ? "primary" : "default"}
            variant={view === viewName ? "filled" : "outlined"}
            onClick={() => onView(viewName)}
            sx={{ fontWeight: 600 }}
          />
        ))}
      </Stack>
    </Stack>
  );
};

const MonthDateHeader = ({ date, label, tasksByDate }) => {
  const theme = useTheme();
  const count = tasksByDate[moment(date).format(DATE_KEY)]?.length || 0;

  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={0.5} sx={{ px: 0.5, minHeight: 24 }}>
      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: moment(date).isSame(moment(), "day") ? 700 : 600 }}>
        {label}
      </Typography>
      {count > 0 && (
        <Chip
          size="small"
          label={count}
          color={count > 1 ? "primary" : "default"}
          sx={{ height: 19, minWidth: 24, fontSize: 11, fontWeight: 700 }}
        />
      )}
    </Stack>
  );
};

const CalendarEvent = ({ event }) => {
  const theme = useTheme();
  const color = colorForTone(theme, event.isOverdue ? "error" : event.priorityTone);

  return (
    <Tooltip title={`${event.title} - ${event.priorityName} - ${event.statusName}`}>
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0, overflow: "hidden" }}>
        <Box sx={{ width: 7, height: 7, borderRadius: 999, bgcolor: color, flexShrink: 0 }} />
        <Typography variant="caption" noWrap sx={{ fontWeight: 700, color: theme.palette.text.primary, lineHeight: 1.2 }}>
          {event.title}
        </Typography>
      </Stack>
    </Tooltip>
  );
};

const TaskAgendaCard = ({ task, active, onSelect, onOpenDetails }) => {
  const theme = useTheme();
  const tone = task.isOverdue ? "error" : task.priorityTone;
  const color = colorForTone(theme, tone);

  return (
    <Paper
      elevation={0}
      onClick={onSelect}
      sx={{
        p: 1.5,
        borderRadius: 2,
        cursor: "pointer",
        bgcolor: active ? alpha(color, 0.1) : theme.palette.background.default,
        border: `1px solid ${active ? alpha(color, 0.45) : theme.palette.divider}`,
        transition: "border-color 160ms ease, background-color 160ms ease, transform 160ms ease",
        "&:hover": { borderColor: alpha(color, 0.55), transform: "translateY(-1px)" },
      }}
    >
      <Stack spacing={1.25}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
              {task.title}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: theme.palette.text.secondary, display: "block" }}>
              {task.projectName}
            </Typography>
          </Box>
          {task.isOverdue ? (
            <Tooltip title="Overdue">
              <WarningAmberRounded color="error" fontSize="small" />
            </Tooltip>
          ) : null}
        </Stack>

        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          <Chip size="small" label={task.priorityName} color={task.priorityTone} variant="outlined" sx={{ fontWeight: 600 }} />
          <Chip size="small" label={task.statusName} color={task.statusTone} sx={{ fontWeight: 600 }} />
          <Chip size="small" label={task.taskTypeName} variant="outlined" sx={{ fontWeight: 600 }} />
        </Stack>

        {task.description && (
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {task.description}
          </Typography>
        )}

        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
            Due {task.dueLabel}
          </Typography>
          <Button
            size="small"
            endIcon={<ArrowForwardRounded />}
            onClick={(event) => {
              event.stopPropagation();
              onOpenDetails(task.id);
            }}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Details
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

const TaskCalendar = () => {
  const userID = localStorage.getItem("userId");
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("lg"));
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState(Views.MONTH);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const fetchTasks = async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await getAssignedTaskByUsers(userID);
      if (response?.status === "success") {
        const formattedTasks = (response.data || []).map(normalizeTask);
        setTasks(formattedTasks);
      } else {
        setTasks([]);
        setError("Task calendar data could not be loaded.");
      }
    } catch (fetchError) {
      console.error("Error fetching tasks:", fetchError);
      setTasks([]);
      setError("Task calendar data could not be loaded.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [userID]);

  const statusOptions = useMemo(() => uniqueValues(tasks.map((task) => task.statusName)), [tasks]);
  const priorityOptions = useMemo(() => uniqueValues(tasks.map((task) => task.priorityName)), [tasks]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesStatus = statusFilter === "all" || task.statusName === statusFilter;
      const matchesPriority = priorityFilter === "all" || task.priorityName === priorityFilter;
      const matchesSearch = !query
        ? true
        : [task.title, task.description, task.projectName, task.statusName, task.priorityName, task.taskTypeName]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(query);

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [priorityFilter, search, statusFilter, tasks]);

  const calendarEvents = useMemo(() => filteredTasks.filter((task) => task.start && task.end), [filteredTasks]);
  const tasksByDate = useMemo(() => buildTasksByDate(calendarEvents), [calendarEvents]);
  const selectedDateKey = moment(selectedDate).format(DATE_KEY);
  const selectedDayTasks = useMemo(
    () => sortTasksForAgenda(tasksByDate[selectedDateKey] || []),
    [selectedDateKey, tasksByDate]
  );

  const todayKey = moment().format(DATE_KEY);
  const todayCount = tasksByDate[todayKey]?.length || 0;
  const overdueCount = filteredTasks.filter((task) => task.isOverdue).length;
  const unscheduledCount = filteredTasks.filter((task) => !task.dueKey).length;

  const busiestDay = useMemo(() => {
    const entries = Object.entries(tasksByDate).sort((a, b) => b[1].length - a[1].length);
    return entries[0] ? { key: entries[0][0], count: entries[0][1].length } : null;
  }, [tasksByDate]);

  const selectedTaskForPanel = selectedTask || selectedDayTasks[0] || null;

  const components = useMemo(
    () => ({
      toolbar: SmartToolbar,
      event: CalendarEvent,
      month: {
        dateHeader: (props) => <MonthDateHeader {...props} tasksByDate={tasksByDate} />,
      },
    }),
    [tasksByDate]
  );

  const eventStyleGetter = (event) => {
    const color = colorForTone(theme, event.isOverdue ? "error" : event.priorityTone);
    return {
      style: {
        backgroundColor: alpha(color, theme.palette.mode === "dark" ? 0.2 : 0.12),
        border: `1px solid ${alpha(color, 0.34)}`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 8,
        color: theme.palette.text.primary,
        padding: "1px 4px",
        boxShadow: "none",
      },
    };
  };

  const dayPropGetter = (date) => {
    const key = moment(date).format(DATE_KEY);
    const count = tasksByDate[key]?.length || 0;
    const isSelected = key === selectedDateKey;
    const isToday = key === todayKey;

    return {
      className: count > 1 ? "task-calendar-day-many" : count === 1 ? "task-calendar-day-one" : "",
      style: {
        backgroundColor: isSelected
          ? alpha(theme.palette.primary.main, 0.1)
          : count > 1
            ? alpha(theme.palette.warning.main, theme.palette.mode === "dark" ? 0.12 : 0.08)
            : isToday
              ? alpha(theme.palette.info.main, 0.08)
              : undefined,
        boxShadow: isSelected ? `inset 0 0 0 2px ${alpha(theme.palette.primary.main, 0.45)}` : undefined,
      },
    };
  };

  const handleSelectEvent = (event) => {
    setSelectedTask(event);
    setSelectedDate(event.start);
  };

  const handleSelectSlot = (slotInfo) => {
    const nextDate = slotInfo?.start || new Date();
    setSelectedDate(nextDate);
    setSelectedTask(null);
  };

  const handleOpenDetails = (taskId) => navigate(`/task-details/${taskId}`);

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
        <Skeleton variant="rounded" height={110} sx={{ mb: 2 }} />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 360px" }, gap: 2 }}>
          <Skeleton variant="rounded" height={640} />
          <Skeleton variant="rounded" height={640} />
        </Box>
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
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
            <Avatar variant="rounded" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12), color: theme.palette.primary.main }}>
              <CalendarMonthRounded />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 700, lineHeight: 1 }}>
                Task Calendar
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                See scheduled tasks by date, identify busy days, and open the full day agenda.
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Button
          variant="contained"
          startIcon={refreshing ? <CircularProgress size={16} color="inherit" /> : <RefreshRounded />}
          disabled={refreshing}
          onClick={() => fetchTasks({ silent: true })}
          sx={{ borderRadius: 2, fontWeight: 700, alignSelf: { xs: "stretch", lg: "center" } }}
        >
          Refresh
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" gap={2} flexWrap="wrap" sx={{ mb: 2.5 }}>
        <StatTile icon={<AssignmentTurnedInRounded />} label="Visible Tasks" value={filteredTasks.length} />
        <StatTile icon={<TodayRounded />} label="Today" value={todayCount} tone="info" />
        <StatTile icon={<WarningAmberRounded />} label="Overdue" value={overdueCount} tone="error" />
        <StatTile icon={<EventRounded />} label="No Due Date" value={unscheduledCount} tone="warning" />
        <StatTile icon={<ListAltRounded />} label="Busiest Day" value={busiestDay ? busiestDay.count : 0} tone="success" />
      </Stack>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2.5,
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack direction={{ xs: "column", lg: "row" }} spacing={1.5} alignItems={{ xs: "stretch", lg: "center" }}>
          <TextField
            size="small"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search task, project, type, priority"
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: { xs: "100%", lg: 190 } }}>
            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              displayEmpty
              startAdornment={<FilterAltRounded fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: { xs: "100%", lg: 190 } }}>
            <Select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              displayEmpty
              startAdornment={<FlagRounded fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />}
            >
              <MenuItem value="all">All Priorities</MenuItem>
              {priorityOptions.map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {priority}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 380px" },
          gap: 2.5,
          alignItems: "start",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
            minWidth: 0,
            "& .rbc-calendar": { color: theme.palette.text.primary },
            "& .rbc-month-view, & .rbc-time-view, & .rbc-agenda-view": {
              borderColor: theme.palette.divider,
              backgroundColor: theme.palette.background.paper,
            },
            "& .rbc-header": {
              borderColor: theme.palette.divider,
              color: theme.palette.text.secondary,
              fontWeight: 700,
              fontSize: 12,
              textTransform: "uppercase",
              padding: "8px 4px",
              backgroundColor: theme.palette.background.default,
            },
            "& .rbc-day-bg, & .rbc-month-row, & .rbc-date-cell, & .rbc-timeslot-group, & .rbc-time-slot, & .rbc-time-content, & .rbc-time-header-content": {
              borderColor: theme.palette.divider,
            },
            "& .rbc-off-range-bg": { backgroundColor: alpha(theme.palette.text.primary, 0.035) },
            "& .rbc-off-range": { color: theme.palette.text.disabled },
            "& .rbc-today": { backgroundColor: alpha(theme.palette.info.main, 0.08) },
            "& .rbc-show-more": {
              color: theme.palette.primary.main,
              fontWeight: 700,
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              borderRadius: 999,
              px: 0.75,
            },
            "& .rbc-event": { minHeight: 22 },
            "& .rbc-event-content": { minWidth: 0 },
            "& .rbc-agenda-table": { borderColor: theme.palette.divider },
            "& .rbc-agenda-table tbody > tr > td": { borderColor: theme.palette.divider, color: theme.palette.text.primary },
          }}
        >
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            allDayAccessor="allDay"
            date={calendarDate}
            view={calendarView}
            onNavigate={setCalendarDate}
            onView={setCalendarView}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            selectable
            popup
            components={components}
            eventPropGetter={eventStyleGetter}
            dayPropGetter={dayPropGetter}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            onShowMore={(_, date) => {
              setSelectedDate(date);
              setSelectedTask(null);
            }}
            tooltipAccessor={(event) => event.description || event.title}
            style={{ height: isSmall ? 620 : 720 }}
          />
        </Paper>

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
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
                  {moment(selectedDate).format("MMM D, YYYY")}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  Day agenda - {selectedDayTasks.length} task{selectedDayTasks.length === 1 ? "" : "s"}
                </Typography>
              </Box>
              <Chip
                icon={<EventRounded />}
                label={selectedDayTasks.length}
                color={selectedDayTasks.length > 1 ? "primary" : "default"}
                sx={{ fontWeight: 700 }}
              />
            </Stack>

            {selectedDayTasks.length ? (
              <Stack spacing={1.25}>
                {selectedDayTasks.map((task) => (
                  <TaskAgendaCard
                    key={task.id}
                    task={task}
                    active={selectedTaskForPanel?.id === task.id}
                    onSelect={() => setSelectedTask(task)}
                    onOpenDetails={handleOpenDetails}
                  />
                ))}
              </Stack>
            ) : (
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  textAlign: "center",
                  bgcolor: theme.palette.background.default,
                  border: `1px dashed ${theme.palette.divider}`,
                }}
              >
                <EventRounded color="disabled" />
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
                  No scheduled tasks on this day.
                </Typography>
              </Box>
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
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 700, mb: 1 }}>
              Selected Task
            </Typography>
            {selectedTaskForPanel ? (
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip size="small" label={selectedTaskForPanel.priorityName} color={selectedTaskForPanel.priorityTone} sx={{ fontWeight: 600 }} />
                  <Chip size="small" label={selectedTaskForPanel.statusName} color={selectedTaskForPanel.statusTone} variant="outlined" sx={{ fontWeight: 600 }} />
                </Stack>
                <Typography variant="subtitle1" sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
                  {selectedTaskForPanel.title}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, whiteSpace: "pre-line" }}>
                  {selectedTaskForPanel.description || "No description provided."}
                </Typography>
                <Divider />
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Typography variant="body2" color="text.secondary">Due</Typography>
                    <Typography variant="body2" fontWeight={600}>{selectedTaskForPanel.dueLabel}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Typography variant="body2" color="text.secondary">Type</Typography>
                    <Typography variant="body2" fontWeight={600}>{selectedTaskForPanel.taskTypeName}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Typography variant="body2" color="text.secondary">Project</Typography>
                    <Typography variant="body2" fontWeight={600} textAlign="right">{selectedTaskForPanel.projectName}</Typography>
                  </Stack>
                </Stack>
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardRounded />}
                  onClick={() => handleOpenDetails(selectedTaskForPanel.id)}
                  sx={{ borderRadius: 2, fontWeight: 700 }}
                >
                  View Task Details
                </Button>
              </Stack>
            ) : (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Select a task or a busy date from the calendar.
              </Alert>
            )}
          </Paper>

          {unscheduledCount > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 2,
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="subtitle1" sx={{ color: theme.palette.text.primary, fontWeight: 700, mb: 1 }}>
                Tasks Without Due Date
              </Typography>
              <Stack spacing={1}>
                {filteredTasks
                  .filter((task) => !task.dueKey)
                  .slice(0, 4)
                  .map((task) => (
                    <Button
                      key={task.id}
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenDetails(task.id)}
                      sx={{ justifyContent: "space-between", borderRadius: 2, textTransform: "none" }}
                      endIcon={<ArrowForwardRounded />}
                    >
                      {task.title}
                    </Button>
                  ))}
              </Stack>
            </Paper>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default TaskCalendar;
