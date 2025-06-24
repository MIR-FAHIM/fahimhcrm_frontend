import React, { useState, useEffect } from "react";
import { getAssignedTaskByUsers, getStatus, updateTaskStatus } from "../../../../api/controller/admin_controller/task_controller/task_controller";
import { useNavigate } from "react-router-dom";
import {
    Box, CircularProgress, Chip, Select, MenuItem, Button, Card, CardContent, CardActions,
    Avatar, Typography
} from "@mui/material";
import { base_url, image_file_url } from "../../../../api/config/index";
import { AccessAlarm, CheckCircle, Warning, PriorityHigh } from '@mui/icons-material';

const TaskComponents = ({userID}) => {
  
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
        fetchStatuses();
    }, []);

    const handleNavigation = () => navigate("/add-task",{
        state: {
          'project_id': 0,
          'project_phase_id': 0,
        },
      });

    const fetchTasks = async () => {
        try {
            const response = await getAssignedTaskByUsers(userID);
            console.log("Fetched tasks:", response.data);  // Debugging the task response
            
            // Flatten the tasks by priority into a single array
            const allTasks = response.data.map(task => ({
                ...task.task,
                assigned_person: task.assigned_person, // Add assigned person data
                assigned_by: task.assigned_by, // Add assigned by data
                task_id: task.task_id, // Include task_id for reference
            }));
            setTasks(allTasks);
            setFilteredTasks(allTasks);  // Initialize filteredTasks with all tasks
        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStatuses = async () => {
        try {
            const response = await getStatus();
            console.log("Fetched statuses:", response.data);  // Debugging the status response
            setStatuses(response.data);
        } catch (error) {
            console.error("Error fetching statuses:", error);
        }
    };

    const handleStatusClick = (status) => {
        setSelectedStatus(status);
        setFilteredTasks(status === "" ? tasks : tasks.filter(task => task.status.status_name === status));
    };

    const handleStatusChange = async (taskId, newStatusId) => {
        try {
            await updateTaskStatus({ task_id: taskId, status_id: newStatusId });

            const updatedStatus = statuses.find((s) => s.id === newStatusId);

            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === taskId ? { ...task, status: updatedStatus } : task
                )
            );

            setFilteredTasks((prevFilteredTasks) =>
                prevFilteredTasks.map((task) =>
                    task.id === taskId ? { ...task, status: updatedStatus } : task
                )
            );
        } catch (error) {
            console.error("Error updating task status:", error);
        }
    };

    const renderPriorityIcon = (priorityName) => {
        switch(priorityName) {
            case 'Important':
                return <PriorityHigh color="error" />;
            case 'Low':
                return <AccessAlarm color="warning" />;
            default:
                return <Warning color="disabled" />;
        }
    };

    return (
        <Box sx={{ padding: 3 }}>
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {/* Status Filter */}
                    <Box sx={{ display: "flex", gap: 1, overflowX: "auto", mb: 2, alignItems: "center" }}>
                        <Button variant="contained" color="secondary" sx={{ borderRadius: "25px" }} onClick={handleNavigation}>
                            + Add Task
                        </Button>
                        <Chip label={`All (${tasks.length})`} onClick={() => handleStatusClick("")} color={selectedStatus === "" ? "primary" : "default"} clickable />
                        {statuses.map((status) => (
                            <Chip
                                key={status.id}
                                label={status.status_name}
                                onClick={() => handleStatusClick(status.status_name)}
                                color={selectedStatus === status.status_name ? "primary" : "default"}
                                clickable
                            />
                        ))}
                    </Box>

                    {/* Task Cards Grouped by Priority */}
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 2 }}>
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => (
                                <Card key={task.id} sx={{ padding: 2, borderRadius: 3, boxShadow: 3, backgroundColor: task.priority.priority_name === 'Important' ? '#ffe6e6' : '#f0f8ff' }}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ fontWeight: "bold", color:
                                             task.priority.priority_name === 'Important' ? 'red' : 'black' }}>
                                            {task.task_title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">{task.task_details}</Typography>
                                        <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                                            <Typography variant="caption" sx={{ fontWeight: "bold" }}>Priority:</Typography>
                                            <Chip label={task.priority.priority_name} sx={{ ml: 1, backgroundColor: task.priority.priority_name === 'Important' ? 'red' : 'yellow' }} />
                                            {renderPriorityIcon(task.priority.priority_name)}
                                        </Box>
                                        <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                                            <Avatar src={`${image_file_url}/${task.creator.photo}`} sx={{ width: 30, height: 30, mr: 1 }} />
                                            <Typography variant="caption">{task.creator.name}</Typography>
                                        </Box>
                                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                                            {/* Displaying assigned person's avatar */}
                                            <Avatar src={`${image_file_url}/${task.assigned_person.photo}`} sx={{ width: 30, height: 30 }} />
                                            <Typography variant="caption" sx={{ ml: 1 }}>
                                                Assigned to: {task.assigned_person.name}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                    <CardActions>
                                        <Select value={task.status.id} onChange={(e) => handleStatusChange(task.id, e.target.value)} sx={{ minWidth: 120 }}>
                                            {statuses.map((status) => (
                                                <MenuItem key={status.id} value={status.id}>{status.status_name}</MenuItem>
                                            ))}
                                        </Select>
                                    </CardActions>
                                </Card>
                            ))
                        ) : (
                            <Typography align="center" variant="body2">No tasks found</Typography>
                        )}
                    </Box>
                </>
            )}
        </Box>
    );
};

export default TaskComponents;
