// src/scenes/task/components_task/task_components.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  CircularProgress,
  Chip,
  Select,
  MenuItem,
  Button,
  Typography,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  getAssignedTaskByUsers,
  getStatus,
  updateTaskStatus,
} from "../../../../api/controller/admin_controller/task_controller/task_controller";
import { image_file_url } from "../../../../api/config/index";

// ✅ Reuse the shared card
import TaskCardView from "../../task/components_task/task_card_view";

const TaskComponents = ({ user, refreshTrigger }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
    fetchStatuses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, refreshTrigger]);

  const handleNavigation = () =>
    navigate("/add-task", {
      state: { project_id: 0, project_phase_id: 0 },
    });

  const fetchTasks = async () => {
    try {
      const res = await getAssignedTaskByUsers(user);
      const all = (res?.data || []).map((t) => ({
        // flatten & normalize id so TaskCardView works everywhere
        ...t.task,
        id: t.task_id, // ← normalize
        task_id: t.task_id,
        assigned_person: t.assigned_person,
        assigned_by: t.assigned_by,
      }));

      setTasks(all);
      setFilteredTasks(
        selectedStatus ? all.filter((x) => x.status?.status_name === selectedStatus) : all
      );
    } catch (e) {
      console.error("Error fetching tasks:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatuses = async () => {
    try {
      const res = await getStatus();
      setStatuses(res?.data || []);
    } catch (e) {
      console.error("Error fetching statuses:", e);
    }
  };

  const handleStatusClick = (statusName) => {
    setSelectedStatus(statusName);
    setFilteredTasks(
      statusName ? tasks.filter((t) => t.status?.status_name === statusName) : tasks
    );
  };

  const handleStatusChange = async (taskId, newStatusId) => {
    try {
      const res = await updateTaskStatus({ task_id: taskId, status_id: newStatusId });
      if (res?.status === "success") {
        // Refresh to keep everything in sync
        await fetchTasks();
      }
    } catch (e) {
      console.error("Error updating task status:", e);
    }
  };

  const goTaskDetails = (taskId) => navigate(`/task-details/${taskId}`);

  return (
    <Box sx={{ p: 3, bgcolor: theme.palette.background.default }}>
      {loading ? (
        <Box sx={{ display: "grid", placeItems: "center", height: "70vh" }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Filter row */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              overflowX: "auto",
              mb: 2,
              alignItems: "center",
            }}
          >
            <Button variant="contained" color="secondary" sx={{ borderRadius: "24px" }} onClick={handleNavigation}>
              + Add Task
            </Button>

            <Chip
              label={`All (${tasks.length})`}
              onClick={() => handleStatusClick("")}
              color={selectedStatus === "" ? "primary" : "default"}
              clickable
            />
            {statuses.map((s) => (
              <Chip
                key={s.id}
                label={s.status_name}
                onClick={() => handleStatusClick(s.status_name)}
                color={selectedStatus === s.status_name ? "primary" : "default"}
                clickable
              />
            ))}
          </Box>

          {/* Cards grid — 4 per row on xl, scales down responsively */}
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
                xl: "repeat(4, 1fr)", // ← 4 per row
              },
            }}
          >
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TaskCardView
                  key={task.id}
                  task={task}
                  statuses={statuses}
                  imageBaseUrl={image_file_url}
                  onDetails={goTaskDetails}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ gridColumn: "1 / -1", textAlign: "center", py: 6 }}
              >
                No tasks found
              </Typography>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default TaskComponents;
