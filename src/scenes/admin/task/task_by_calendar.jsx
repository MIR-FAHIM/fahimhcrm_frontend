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

const localizer = momentLocalizer(moment);

const TaskCalendar = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const userID = localStorage.getItem("userId");
  const theme = useTheme();
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
            priority: task.task.priority, // Include priority
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
        backgroundColor: theme.palette.primary.main,
        color: "#fff",
        borderRadius: "5px",
        padding: "4px",
        border: `1px solid ${theme.palette.primary.dark}`,
      },
    };
  };

  const getPriorityColor = (priorityName) => {
    switch ((priorityName || "").toLowerCase()) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: "90vh", p: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        📅 My Task Calendar
      </Typography>

      <Calendar
        localizer={localizer}
        events={tasks}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "75vh", borderRadius: 8, boxShadow: theme.shadows[2] }}
        views={["month", "week"]}
        defaultView="month"
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleSelectEvent}
        tooltipAccessor={(event) => event.description || "No description"}
      />

      {/* Task Details Dialog */}
      {selectedTask && (
        <Dialog open={true} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>📝 Task Details</DialogTitle>
          <DialogContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {selectedTask.title}
            </Typography>

            <Typography variant="body1" gutterBottom>
              <strong>Description:</strong>{" "}
              {selectedTask.description || "No description provided."}
            </Typography>

            <Typography variant="body1" gutterBottom>
              <strong>Priority:</strong>{" "}
              <Chip
                label={selectedTask.priority?.priority_name || "No Data"}
                color={getPriorityColor(selectedTask.priority?.priority_name)}
                variant="outlined"
                size="small"
              />
            </Typography>

            <Typography variant="body2" color="text.secondary" mt={2}>
              <strong>Created:</strong>{" "}
              {moment(selectedTask.start).format("MMMM D, YYYY")}
            </Typography>

            <Box mt={3} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                onClick={() => navigate(`/task-details/${selectedTask.id}`)}
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
