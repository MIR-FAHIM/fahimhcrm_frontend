import React, { useState, useEffect } from "react";
import {
  getAssignedTaskByUsers,
  getStatus,
  updateTaskStatus
} from "../../../api/controller/admin_controller/task_controller/task_controller";
import {
  Box,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  useTheme
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { base_url , } from "../../../api/config/index";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const activityColors = {
  general: "#fef3c7",   // light yellow
  task: "#e0f2fe",      // light blue
  call: "#fee2e2",      // light red
  email: "#ede9fe",     // light purple
  whatsapp: "#dcfce7",  // light green
  visit: "#fce7f3",     // light pink
  message: "#e2e8f0",   // default gray
  meeting: "#fff7ed",   // light orange
};

const AllTaskByStatus = () => {
  const userID = localStorage.getItem("userId");
  const navigate = useNavigate();
  const theme = useTheme();

  const [tasks, setTasks] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
    fetchStatuses();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await getAssignedTaskByUsers(userID);
      const allTasks = response.data.map(task => ({
        ...task.task,
        assigned_person: task.assigned_person,
        assigned_by: task.assigned_by,
        task_id: task.task_id,
      }));
      setTasks(allTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await getStatus();
      setStatuses(response.data);
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination || source.droppableId === destination.droppableId) return;

    const taskId = parseInt(draggableId);
    const newStatusId = parseInt(destination.droppableId);

    try {
      await updateTaskStatus({ task_id: taskId, status_id: newStatusId, user_id: userID });

      // Update local task list
      setTasks(prev =>
        prev.map(task =>
          task.task_id === taskId
            ? { ...task, status: { ...task.status, id: newStatusId } }
            : task
        )
      );
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const groupTasksByStatus = () => {
    const grouped = {};
    statuses.forEach(status => {
      grouped[status.id] = tasks.filter(task => task.status?.id === status.id);
    });
    return grouped;
  };

  const groupedTasks = groupTasksByStatus();

  const getStatusColor = (statusName) => {
    switch (statusName.toLowerCase()) {
      case "need explanation":
        return activityColors.general;
      case "paused":
        return activityColors.task;
      case "new task":
        return activityColors.call;
      case "ongoing":
        return activityColors.email;
      case "completed":
        return activityColors.whatsapp;
      default:
        return activityColors.message;
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <CircularProgress />
        </Box>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 2 }}>
            {statuses.map((status) => (
              <Droppable key={status.id} droppableId={status.id.toString()}>
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      minWidth: 300,
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: getStatusColor(status.status_name),
                        borderRadius: 2,
                        padding: 2,
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {status.status_name}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        backgroundColor: "#ffffff",
                        borderRadius: 2,
                        padding: 2,
                        boxShadow: theme.shadows[2],
                        minHeight: '100px' // Ensure container has minimum height
                      }}
                    >
                      {groupedTasks[status.id]?.map((task, index) => (
                        <Draggable
                          key={task.task_id.toString()}
                          draggableId={task.task_id.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              sx={{
                                width: 280,
                                mb: 2,
                                padding: 2,
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 2,
                                boxShadow: theme.shadows[1],
                                transition: "transform 0.2s",
                                "&:hover": {
                                  boxShadow: theme.shadows[3],
                                  transform: "scale(1.02)"
                                },
                                display: "flex",
                                flexDirection: "column",
                                backgroundColor: snapshot.isDragging ? '#f0f0f0' : 'inherit',
                                ...provided.draggableProps.style
                              }}
                            >
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography
                                  fontWeight="bold"
                                  sx={{
                                    fontSize: ".8rem",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: "vertical"
                                  }}
                                >
                                  {task.task_title}
                                </Typography>
                                <Box
                                  {...provided.dragHandleProps}
                                  sx={{
                                    cursor: "grab",
                                    ml: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    p: 1
                                  }}
                                >
                                  <DragIndicatorIcon fontSize="small" />
                                </Box>
                              </Box>

                              <Typography
                                variant="body2"
                                sx={{
                                  mt: 1,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: "vertical"
                                }}
                              >
                                {task.task_details}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  mt: 1,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: "vertical"
                                }}
                              >
                             Due Date:   {dayjs(task.due_date).format("MMMM D, YYYY")}
                              </Typography>

                              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                                <Avatar
                                  src={`${base_url}/storage/${task.assigned_person.photo}`}
                                  sx={{ width: 24, height: 24, mr: 1 }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap"
                                  }}
                                >
                                  {task.assigned_person.name}
                                </Typography>
                              </Box>

                              <Box sx={{ p: 1 }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  onClick={() => navigate(`/task-details/${task.task_id}`)}
                                  sx={{
                                    height: 20,
                                    fontSize: "0.75rem",
                                    padding: "4px 8px"
                                  }}
                                >
                                  View Details
                                </Button>
                              </Box>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Box>
                  </Box>
                )}
              </Droppable>
            ))}
          </Box>
        </DragDropContext>
      )}
    </Box>
  );
};

export default AllTaskByStatus;
