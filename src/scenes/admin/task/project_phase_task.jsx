import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import {
  getAssignedTaskByUsers,
  getPhaseTask,
  getStatus,
  updateTaskStatus
} from "../../../api/controller/admin_controller/task_controller/task_controller";
import {
  Box, CircularProgress, Typography, Card, CardContent, Avatar, Button
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { base_url, image_file_url } from "../../../api/config/index";
import { useNavigate } from "react-router-dom";

const ProjectPhaseTask = () => {
  const userID = localStorage.getItem("userId");
  const navigate = useNavigate();
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [phaseDetail, setPhaseDetail] = useState({});
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
    fetchStatuses();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await getPhaseTask(id);
      setPhaseDetail(response.details);
      const grouped = response.data; // response shape: { Ongoing: [task1, task2], Done: [...] }
      const allTasks = [];
  
      for (const statusName in grouped) {
        if (Array.isArray(grouped[statusName])) {
          grouped[statusName].forEach(task => {
            allTasks.push({
              ...task,
              task_id: task.id, // set this so it works with Draggable
              assigned_person: task.assigned_persons?.[0]?.assigned_person || {}, // safest fallback
            });
          });
        }
      }
  
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
            ? { ...task, status: statuses.find(s => s.id === newStatusId) }
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
      grouped[status.id] = tasks.filter(task => task.status.id === status.id);
    });
    return grouped;
  };

  const groupedTasks = groupTasksByStatus();

  return (
    <Box sx={{ padding: 2 }}>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <CircularProgress />
        </Box>
      ) : (
         
        <DragDropContext onDragEnd={onDragEnd}>
         <Box sx={{ mb: 3 }}>
  <Typography variant="h4" fontWeight="bold">
    {phaseDetail.project?.project_name || "Project Name"}
  </Typography>
  <Typography variant="h6" color="text.secondary">
    Phase: {phaseDetail.phase_name || "Phase Name"}
  </Typography>
  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
    {phaseDetail.phase_description || "No phase description available."}
  </Typography>
</Box>
          <Box sx={{ display: "flex", gap: 2, overflowX: "auto" }}>
            {statuses.map((status) => (
              <Droppable key={status.id} droppableId={status.id.toString()}>
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      backgroundColor: "#f4f5f7",
                      borderRadius: 2,
                      padding: 2,
                      minWidth: 250,
                      flexShrink: 0
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 2 }}>{status.status_name}</Typography>
                    {groupedTasks[status.id]?.map((task, index) => (
                      <Draggable key={task.task_id.toString()} draggableId={task.task_id.toString()} index={index}>
                        {(provided) => (
                         <Card
                         ref={provided.innerRef}
                         {...provided.draggableProps}
                         sx={{ mb: 2, padding: 2 }}
                       >
                         <CardContent>
                           <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                             <Typography fontWeight="bold">{task.task_title}</Typography>
                             {/* Drag Handle Icon */}
                             <Box {...provided.dragHandleProps} sx={{ cursor: "grab", ml: 1 }}>
                               <DragIndicatorIcon fontSize="small" />
                             </Box>
                           </Box>
                       
                           <Typography variant="body2">{task.task_details}</Typography>
                       
                           <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                             <Avatar
                               src={`${image_file_url}/${task.assigned_person.photo}`}
                               sx={{ width: 24, height: 24, mr: 1 }}
                             />
                             <Typography variant="caption">
                               {task.assigned_person.name}
                             </Typography>
                           </Box>
                         </CardContent>
                       
                         <Button
                           variant="outlined"
                           size="small"
                           fullWidth
                           onClick={() => navigate(`/task-details/${task.task_id}`)}
                         >
                           View Details
                         </Button>
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
    </Box>
  );
};

export default ProjectPhaseTask;
