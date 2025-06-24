import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';
import {
  getProjectTask,
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
  useTheme,
  Paper,
  Dialog
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { base_url } from "../../../api/config/index";
import { tokens } from "../../../theme";
import AddTaskFormProject from "./components/add_task_project";

const ProjectTask = ({ projectID }) => {
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
  }, []);

  const onAddTask = (statusID) => {
    setStatusID(statusID);
    setIsTaskDialogOpen(true);
  };

  const fetchTasks = async () => {
    try {
      const response = await getProjectTask(projectID);
      const grouped = response.data;

      // Transform the tasks to include necessary properties
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

      // Calculate total task count
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

      // Update local task list
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
    <Box sx={{ padding: 2 }}>
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
                backgroundColor: 'background.paper',
                border: '1px dashed #ccc'
              }}
            >
              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <Typography variant="h6" color="text.secondary">
                  No tasks added yet for this project
                </Typography>
                <Typography variant="body2" color="text.secondary">
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
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
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
                          backgroundColor: colors.bg[100],
                          borderRadius: 2,
                          padding: 2,
                          minWidth: 250,
                          flexShrink: 0
                        }}
                      >
                     <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">
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
            padding: '4px 8px'
          }}
        >
          Add Task
        </Button>
      </Box>
                        {tasks[status.status_name]?.map((task, index) => (
                          <Draggable key={task.task_id.toString()} draggableId={task.task_id.toString()} index={index}>
                            {(provided) => (
                            <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{
                              width: 280,  // Fixed width
                              height: 230, // Fixed height
                              mb: 2,
                              padding: 0,
                              borderRadius: 2,
                              boxShadow: 1,
                              transition: "transform 0.2s",
                              "&:hover": {
                                boxShadow: 3,
                                transform: "scale(1.02)"
                              },
                              display: "flex",
                              flexDirection: "column",
                              overflow: "hidden" // Prevent content overflow
                            }}
                          >
                            <CardContent sx={{
                              flexGrow: 1, // Allow content to grow and fill space
                              overflow: "hidden" // Prevent content overflow
                            }}>
                              {/* Task Title with Drag Handle */}
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
                                    p: 0.5
                                  }}
                                >
                                  <DragIndicatorIcon fontSize="small" />
                                </Box>
                              </Box>
                          
                              {/* Task Details with overflow handling */}
                              <Typography
                                variant="body2"
                                sx={{
                                  mt: 1,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: "vertical",
                                  flexGrow: 1 // Allow details to take remaining space
                                }}
                              >
                                {task.task_details}
                              </Typography>
                          
                              {/* Assigned Person */}
                              <Box sx={{
                                display: "flex",
                                alignItems: "center",
                                mt: 1,
                                minHeight: 32 // Fixed height for this section
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
                                    whiteSpace: "nowrap"
                                  }}
                                >
                                  {task.assigned_person.name}
                                </Typography>
                              </Box>
                            </CardContent>
                          
                            {/* View Details Button with fixed height */}
                            <Box sx={{ p: 1, mt: 'auto' }}> {/* mt: 'auto' pushes button to bottom */}
                              <Button
                                variant="outlined"
                                size="small"

                                fullWidth
                                onClick={() => navigate(`/task-details/${task.task_id}`)}
                                sx={{
                                  height: 20, // Fixed height
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
          >
            <AddTaskFormProject
             projectId ={parseInt(projectID)} statusID={statusID}
            />
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default ProjectTask;
