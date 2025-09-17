import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';
import {
  getProjectTask,
  getStatus,
  updateTaskStatus
} from "../../../../api/controller/admin_controller/task_controller/task_controller";
import {
  Box,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  useTheme,
  Paper,
  Dialog
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { base_url } from "../../../../api/config/index";
import { tokens } from "../../../../theme";
import AddTaskFormProject from "./add_task_for_client";

const ClientTask = ({ clntID }) => {
  const userID = localStorage.getItem("userId");
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [tasks, setTasks] = useState({});
  const [taskLength, setTaskLength] = useState(0);
  const [statusID, setStatusID] = useState(0);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchTasks();
    fetchStatuses();
  }, [clntID]); 

  const onAddTask = (statusID) => {
    setStatusID(statusID);
    setIsTaskDialogOpen(true);
  };

  const fetchTasks = async () => {
    try {
      const response = await getProjectTask(clntID);
      const grouped = response.data;
      const transformedTasks = {};
      for (const statusName in grouped) {
        if (Array.isArray(grouped[statusName])) {
          transformedTasks[statusName] = grouped[statusName].map(task => ({
            ...task,
            task_id: task.id,
            assigned_person: task.assigned_persons?.[0]?.assigned_person || {},
          }));
        }
      }
      const totalTasks = Object.values(transformedTasks).reduce(
        (sum, tasks) => sum + tasks.length, 0
      );
      setTaskLength(totalTasks);
      setTasks(transformedTasks);
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
    const newStatusName = destination.droppableId;
    const newStatusId = statuses.find(status => status.status_name === newStatusName).id;

    try {
      await updateTaskStatus({ task_id: taskId, status_id: newStatusId, user_id: userID });

      setTasks(prev => {
        const newTasks = { ...prev };
        const taskToMove = newTasks[source.droppableId].find(task => task.task_id === taskId);
        newTasks[source.droppableId] = newTasks[source.droppableId].filter(task => task.task_id !== taskId);
        newTasks[newStatusName] = newTasks[newStatusName]
          ? [...newTasks[newStatusName], taskToMove]
          : [taskToMove];
        return newTasks;
      });
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  return (
    <Box sx={{ padding: 2, backgroundColor: theme.palette.background.default }}>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {taskLength === 0 ? (
            <Paper
              elevation={1}
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
                border: `1px dashed ${theme.palette.divider}`
              }}
            >
              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
                  No tasks added yet for this project
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Get started by adding your first task
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={onAddTask}
                  sx={{
                    mt: 1,
                    borderRadius: 2,
                    padding: '8px 24px',
                    backgroundColor: theme.palette.success.main,
                    color: theme.palette.success.contrastText,
                    boxShadow: theme.shadows[1],
                    "&:hover": {
                      backgroundColor: theme.palette.success.dark,
                    }
                  }}
                >
                  Add Task
                </Button>
              </Box>
            </Paper>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Box sx={{ display: "flex", gap: 2, overflowX: "auto" }}>
                {statuses.map((status) => (
                  <Droppable key={status.id} droppableId={status.status_name}>
                    {(provided) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{
                          backgroundColor: theme.palette.background.paper,
                          borderRadius: 2,
                          padding: 2,
                          minWidth: 250,
                          flexShrink: 0
                        }}
                      >
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                          <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
                            {status.status_name}
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => onAddTask(status.id)}
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              fontSize: '0.8rem',
                              padding: '4px 8px',
                              color: theme.palette.primary.main,
                              borderColor: theme.palette.primary.main,
                              "&:hover": {
                                backgroundColor: theme.palette.primary.dark,
                                color: theme.palette.primary.contrastText,
                              }
                            }}
                          >
                            Add Task
                          </Button>
                        </Box>
                        {tasks[status.status_name]?.map((task, index) => (
                          <Draggable key={task.task_id.toString()} draggableId={task.task_id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                sx={{
                                  width: 280,
                                  mb: 2,
                                  padding: 0,
                                  borderRadius: 2,
                                  boxShadow: snapshot.isDragging ? theme.shadows[6] : theme.shadows[1],
                                  transition: "transform 0.2s",
                                  backgroundColor: theme.palette.background.paper, // Use theme color
                                  "&:hover": {
                                    boxShadow: theme.shadows[3],
                                    transform: "scale(1.02)"
                                  },
                                  display: "flex",
                                  flexDirection: "column",
                                  overflow: "hidden"
                                }}
                              >
                                {/* PRIORITY COLOR BAR */}
                                <Box
                                  sx={{
                                    height: '5px',
                                    backgroundColor: task.priority.color_code,
                                    borderRadius: '8px 8px 0 0',
                                  }}
                                />

                                <CardContent sx={{
                                  flexGrow: 1,
                                  overflow: "hidden"
                                }}>
                                  <Box sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 1
                                  }}>
                                    <Typography
                                      fontWeight="bold"
                                      sx={{
                                        fontSize: "0.9rem",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        color: theme.palette.text.primary
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
                                        p: 0.5,
                                        color: theme.palette.text.disabled
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
                                      WebkitBoxOrient: "vertical",
                                      flexGrow: 1,
                                      color: theme.palette.text.secondary
                                    }}
                                  >
                                    {task.task_details}
                                  </Typography>
                                  <Box sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mt: 1,
                                    minHeight: 32
                                  }}>
                                    <Avatar
                                      src={`${base_url}/storage/${task.assigned_person.photo}`}
                                      sx={{
                                        width: 24,
                                        height: 24,
                                        mr: 1
                                      }}
                                    />
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        color: theme.palette.text.primary
                                      }}
                                    >
                                      {task.assigned_person.name}
                                    </Typography>
                                  </Box>
                                </CardContent>
                                <Box sx={{ p: 1, mt: 'auto' }}>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    onClick={() => navigate(`/task-details/${task.task_id}`)}
                                    sx={{
                                      height: 20,
                                      fontSize: "0.75rem",
                                      padding: "4px 8px",
                                      color: theme.palette.info.main,
                                      borderColor: theme.palette.info.main,
                                      "&:hover": {
                                        backgroundColor: theme.palette.info.dark,
                                        color: theme.palette.info.contrastText,
                                      }
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
                    )}
                  </Droppable>
                ))}
              </Box>
            </DragDropContext>
          )}

          <Dialog
            open={isTaskDialogOpen}
            onClose={() => setIsTaskDialogOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary
              }
            }}
          >
            <AddTaskFormProject
              projectId={parseInt(clntID)}
              statusID={statusID}
              title={'this is'}
              onClose={() => setIsTaskDialogOpen(false)}
            />
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default ClientTask;