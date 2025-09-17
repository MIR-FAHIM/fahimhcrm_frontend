// AllTaskByStatus.jsx
import React, { useState, useEffect } from "react";
import {
  getAssignedTaskByUsers,
  getStatus,
  updateTaskStatus,
} from "../../../../api/controller/admin_controller/task_controller/task_controller";
import {
  Box,
  CircularProgress,
  Typography,
  IconButton,
  Button,
  useTheme,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../../../theme";
import TaskCard from "../components_task/task_card";

const AllTaskByStatus = () => {
  const userID = localStorage.getItem("userId");
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [tasks, setTasks] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setLoading(true);
    await Promise.all([fetchStatuses(), fetchTasks()]);
    setLoading(false);
  };

  const fetchTasks = async () => {
    try {
      const response = await getAssignedTaskByUsers(userID);
      const allTasks = response.data.map((row) => ({
        ...row.task,
        assigned_person: row.assigned_person,
        assigned_by: row.assigned_by,
        task_id: row.task_id,
      }));
      setTasks(allTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await getStatus();
      setStatuses(response.data || []);
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    const taskId = parseInt(draggableId, 10);
    const newStatusId = parseInt(destination.droppableId, 10);

    try {
      await updateTaskStatus({
        task_id: taskId,
        status_id: newStatusId,
        user_id: userID,
      });

      setTasks((prev) =>
        prev.map((t) =>
          (t.task_id || t.id) === taskId ? { ...t, status: { ...t.status, id: newStatusId } } : t
        )
      );
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const groupedTasks = statuses.reduce((acc, s) => {
    acc[s.id] = tasks.filter((t) => t.status?.id === s.id);
    return acc;
  }, {});

  return (
    <Box sx={{ p: 2, bgcolor: theme.palette.background.default }}>
      {/* Header */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
          position: "sticky",
          top: 0,
          zIndex: 1,
          bgcolor: theme.palette.background.default,
        }}
      >
       
        <IconButton onClick={init} title="Refresh">
          <RefreshIcon />
        </IconButton>
        <Button
          variant="contained"
          onClick={() =>
            navigate("/add-task", { state: { project_id: 0, project_phase_id: 0 } })
          }
          sx={{
            backgroundColor: colors.gray[500],
            color: colors.primary[900],
            "&:hover": { backgroundColor: colors.gray[700] },
          }}
        >
          + Add Details Task
        </Button>
      </Box>

      {loading ? (
        <Box
          sx={{ height: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          {/* Columns */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              overflowX: "auto",
              pb: 1,
              "&::-webkit-scrollbar": { height: 8 },
            }}
          >
            {statuses.map((status) => {
              const list = groupedTasks[status.id] || [];
              return (
                <Droppable key={status.id} droppableId={String(status.id)}>
                  {(provided) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        minWidth: 320,
                        maxWidth: 360,
                        flexShrink: 0,
                      }}
                    >
                      {/* Column header */}
                      <Box
                        sx={{
                          backgroundColor: colors.primary[900],
                          borderRadius: 2,
                          p: 1.5,
                          mb: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 800, color: colors.gray[100] }}>
                          {status.status_name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            bgcolor: colors.gray[800],
                            color: colors.gray[200],
                            fontWeight: 600,
                          }}
                        >
                          {list.length}
                        </Typography>
                      </Box>

                      {/* Column body */}
                      <Box
                        sx={{
                          backgroundColor: theme.palette.background.paper,
                          borderRadius: 2,
                          p: 1.5,
                          boxShadow: theme.shadows[2],
                          minHeight: 120,
                        }}
                      >
                        {list.length === 0 ? (
                          <Typography
                            variant="body2"
                            sx={{ color: colors.gray[400], textAlign: "center", py: 2 }}
                          >
                            No tasks here
                          </Typography>
                        ) : null}

                        {list.map((task, index) => (
                          <Draggable
                            key={String(task.task_id || task.id)}
                            draggableId={String(task.task_id || task.id)}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <TaskCard task={task} provided={provided} snapshot={snapshot} />
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Box>
                    </Box>
                  )}
                </Droppable>
              );
            })}
          </Box>
        </DragDropContext>
      )}
    </Box>
  );
};

export default AllTaskByStatus;
