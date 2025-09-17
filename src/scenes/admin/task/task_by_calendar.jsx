import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  CircularProgress,
  Button,
  useTheme,
  Chip,
} from "@mui/material";
import { getAssignedTaskByUsers } from "../../../api/controller/admin_controller/task_controller/task_controller";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../../theme";

const localizer = momentLocalizer(moment);

const TaskCalendar = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const userID = localStorage.getItem("userId");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await getAssignedTaskByUsers(userID);
        if (response.status === "success") {
          const formattedTasks = response.data.map((task) => ({
            id: task.task.id,
            title: task.task.task_title,
            description: task.task.task_details,
            priority: task.task.priority,
            start: new Date(task.task.due_date),
            end: new Date(task.task.due_date),
          }));
          setTasks(formattedTasks);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [userID]);

  const handleSelectEvent = (event) => {
    setSelectedTask(event);
  };

  const handleClose = () => {
    setSelectedTask(null);
  };

  const eventStyleGetter = () => {
    return {
      style: {
        backgroundColor: colors.blueAccent[500],
        color: colors.primary[900],
        borderRadius: "5px",
        padding: "4px",
        border: `1px solid ${colors.blueAccent[700]}`,
        fontWeight: 'bold'
      },
    };
  };

  const getPriorityChip = (priorityName) => {
    const priority = (priorityName || "").toLowerCase();
    let chipColor;
    let textColor;

    switch (priority) {
      case "high":
        chipColor = colors.redAccent[500];
        textColor = colors.primary[900];
        break;
      case "medium":
        chipColor = colors.blueAccent[500];
        textColor = colors.primary[900];
        break;
      case "low":
        chipColor = colors.greenAccent[500];
        textColor = colors.primary[900];
        break;
      default:
        chipColor = colors.gray[700];
        textColor = colors.gray[100];
        break;
    }
    return (
      <Chip
        label={priorityName || "No Data"}
        size="small"
        sx={{
          backgroundColor: chipColor,
          color: textColor,
          fontWeight: "bold",
        }}
      />
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: "90vh", p: 4, backgroundColor: theme.palette.background.default }}>
      <Typography variant="h4" fontWeight="bold" mb={3} sx={{ color: colors.gray[100] }}>
        📅 My Task Calendar
      </Typography>

      <Calendar
        localizer={localizer}
        events={tasks}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "75vh", borderRadius: 8, boxShadow: theme.shadows[2], backgroundColor: theme.palette.background.paper }}
        views={["month", "week"]}
        defaultView="month"
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleSelectEvent}
        tooltipAccessor={(event) => event.description || "No description"}
      />

      {selectedTask && (
        <Dialog open={true} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ backgroundColor: theme.palette.background.paper, color: colors.gray[100] }}>
            📝 Task Details
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: theme.palette.background.paper }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: colors.gray[100] }}>
              {selectedTask.title}
            </Typography>

            <Typography variant="body1" gutterBottom sx={{ color: colors.gray[200] }}>
              <strong>Description:</strong>{" "}
              {selectedTask.description || "No description provided."}
            </Typography>

            <Typography variant="body1" gutterBottom sx={{ color: colors.gray[200] }}>
              <strong>Priority:</strong>{" "}
              {getPriorityChip(selectedTask.priority?.priority_name)}
            </Typography>

            <Typography variant="body2" mt={2} sx={{ color: colors.gray[400] }}>
              <strong>Created:</strong>{" "}
              {moment(selectedTask.start).format("MMMM D, YYYY")}
            </Typography>

            <Box mt={3} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                onClick={() => {
                  navigate(`/task-details/${selectedTask.id}`);
                  handleClose();
                }}
                sx={{
                  backgroundColor: colors.greenAccent[500],
                  color: colors.primary[900],
                  "&:hover": {
                    backgroundColor: colors.greenAccent[700],
                  },
                }}
              >
                View Details
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};

export default TaskCalendar;