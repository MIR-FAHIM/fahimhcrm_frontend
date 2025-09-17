// MyTaskTable.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  Box,
  CircularProgress,
  Chip,
  Select,
  MenuItem,
  Button,
  Typography,
  FormControl,
  InputLabel,
  useTheme,
} from "@mui/material";

import {
  getWaitingTaskByUsers,
  getStatus,
  updateTask,
  updateTaskStatus,
} from "../../../../api/controller/admin_controller/task_controller/task_controller";
import { fetchEmployees } from "../../../../api/controller/admin_controller/user_controller"; // (optional) remove if not used
import { tokens } from "../../../../theme";
import { image_file_url } from "../../../../api/config/index";

// 🔁 Reuse the shared card component
// Adjust the import path to where you saved TaskCardView.jsx
import TaskCardWaitingView from "../components_task/task_card_waiting";

const MyWaitingTask = () => {
  const userID = localStorage.getItem("userId");
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);

  const [statuses, setStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
    fetchStatuses();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await getWaitingTaskByUsers(userID);

      // Flatten {Low:[...], High:[...], ...} payloads into a single array
      let flat = [];
      if (response?.data && typeof response.data === "object") {
        Object.keys(response.data).forEach((k) => {
          if (Array.isArray(response.data[k])) flat = flat.concat(response.data[k]);
        });
      }
      setTasks(flat);
      setFilteredTasks(flat);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await getStatus();
      if (response?.data) setStatuses(response.data);
    } catch (err) {
      console.error("Error fetching statuses:", err);
    }
  };

  const handleStatusClick = (statusName) => {
    setSelectedStatus(statusName);
    if (!statusName) return setFilteredTasks(tasks);
    setFilteredTasks(tasks.filter((t) => t.status?.status_name === statusName));
  };

  const handleStatusChange = async (taskId, newStatusId) => {
    try {
      const resp =  await updateTask({ task_id: taskId, is_waiting: newStatusId });
      if (resp.status === "success") {
      await fetchTasks();
      } else {
        console.error("Failed to update task status:", resp?.message);
      }
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  const goTaskDetails = (taskId) => navigate(`/task-details/${taskId}`);

  const handleNavigation = () =>
    navigate("/add-task", {
      state: { project_id: 0, project_phase_id: 0 , is_waiting: 1},
    });

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, bgcolor: theme.palette.background.default }}>
      {loading ? (
        <Box
          sx={{
            height: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <CircularProgress size={56} />
          <Typography sx={{ mt: 2 }} color="text.secondary">
            Loading tasks…
          </Typography>
        </Box>
      ) : (
        <>
          {/* Filter chips + Add button */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              overflowX: "auto",
              mb: 2,
              alignItems: "center",
              p: 1,
              pb: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
              "&::-webkit-scrollbar": { display: "none" },
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            <Chip
              label={`All (${tasks.length})`}
              onClick={() => handleStatusClick("")}
              color={selectedStatus === "" ? "primary" : "default"}
              variant={selectedStatus === "" ? "filled" : "outlined"}
              clickable
              sx={{ minWidth: 80 }}
            />
            {statuses.map((status) => {
              const count = tasks.filter(
                (t) => t.status?.status_name === status.status_name
              ).length;
              return (
                <Chip
                  key={status.id}
                  label={`${status.status_name} (${count})`}
                  onClick={() => handleStatusClick(status.status_name)}
                  color={selectedStatus === status.status_name ? "primary" : "default"}
                  variant={
                    selectedStatus === status.status_name ? "filled" : "outlined"
                  }
                  clickable
                  sx={{ minWidth: 80 }}
                />
              );
            })}
            <Button
              variant="contained"
              color="success"
              onClick={handleNavigation}
              sx={{ ml: "auto", whiteSpace: "nowrap" }}
            >
              + Add Waiting Task
            </Button>
          </Box>

          {/* Cards grid using the shared TaskCardView */}
          <Box
            sx={{
              display: "grid",
              gap: 3,
              // 4 per row on large screens, responsive down
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(5, 1fr)",
              },
            }}
          >
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TaskCardWaitingView
                  key={task.id}
                  task={task}
                  statuses={statuses}
                  imageBaseUrl={image_file_url}
                  onDetails={goTaskDetails}
                  onWaitingChange={handleStatusChange}
                />
              ))
            ) : (
              <Typography
                align="center"
                color="text.secondary"
                sx={{ gridColumn: "1 / -1", py: 5 }}
              >
                No tasks found for the selected filter.
              </Typography>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default MyWaitingTask;
