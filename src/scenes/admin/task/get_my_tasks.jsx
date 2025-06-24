import React, { useState, useEffect } from "react";
import { getTaskByUsers, getStatus, updateTaskStatus } from "../../../api/controller/admin_controller/task_controller/task_controller";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../../theme";
import {
    Box, CircularProgress, Chip, Select, MenuItem, Button, Card, CardContent, CardActions,
    Avatar, Typography, LinearProgress, useTheme
} from "@mui/material";
import { base_url, image_file_url } from "../../../api/config/index";
import { AccessAlarm, CheckCircle, Warning, PriorityHigh } from '@mui/icons-material'; // CheckCircle is not used
import dayjs from "dayjs";

const MyTaskTable = () => {
    const userID = localStorage.getItem("userId");
    const navigate = useNavigate();
    const theme = useTheme();
    const [tasks, setTasks] = useState([]); // All tasks, unfiltered
    const [filteredTasks, setFilteredTasks] = useState([]); // Tasks shown based on filter
    const [statuses, setStatuses] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
        fetchStatuses();
    }, []);

    const handleNavigation = () => navigate("/add-task", {
        state: {
          'project_id': 0,
          'project_phase_id': 0,
        },
      });
    const handleNavigationTaskDetail = (id) => navigate(`/task-details/${id}`);

    const fetchTasks = async () => {
        try {
            const response = await getTaskByUsers(userID);
            console.log("Fetched tasks raw response:", response); // Log the full response for debugging
            console.log("Fetched tasks data:", response.data);  // Debugging the task response data

            // Assuming response.data is an object like { "Low": [...], "High": [...] }
            // We need to flatten this into a single array of tasks
            let allTasksFlattened = [];
            if (response.data && typeof response.data === 'object') {
                Object.keys(response.data).forEach(priorityKey => {
                    if (Array.isArray(response.data[priorityKey])) {
                        allTasksFlattened = allTasksFlattened.concat(response.data[priorityKey]);
                    }
                });
            }

            // Now, process each task. Important: handle assigned_persons which is an array
            const processedTasks = allTasksFlattened.map(taskItem => {
                // The taskItem itself is the task object from your JSON "data.Low[0]"
                return {
                    ...taskItem, // Contains all original task properties like id, task_title, priority, status, creator, assigned_persons (which is an array)
                    // If your API's `getAssignedTaskByUsers` wraps the task in another object
                    // like { task: {...}, assigned_person: {...}, assigned_by: {...} },
                    // then this mapping would be different.
                    // Based on your JSON, taskItem IS the full task.
                    // For assigned_person/assigned_by, we'll try to find the first one
                    // or adapt if the API structure is different for these.

                    // If 'assigned_person' and 'assigned_by' are top-level properties of
                    // the item returned by getAssignedTaskByUsers (not nested in 'task' property)
                    // and 'task' itself is nested:
                    // assigned_person: taskItem.assigned_person, // If this is directly on taskItem
                    // assigned_by: taskItem.assigned_by,         // If this is directly on taskItem
                    // task_id: taskItem.task_id,                // If this is directly on taskItem
                };
            });

            setTasks(processedTasks);
            setFilteredTasks(processedTasks);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            // Optionally, show a user-friendly error message
        } finally {
            setLoading(false);
        }
    };

    const fetchStatuses = async () => {
        try {
            const response = await getStatus();
            console.log("Fetched statuses:", response.data);
            if (response.data) {
                setStatuses(response.data);
            }
        } catch (error) {
            console.error("Error fetching statuses:", error);
        }
    };

    const handleStatusClick = (statusName) => {
        setSelectedStatus(statusName);
        if (statusName === "") {
            setFilteredTasks(tasks); // Show all tasks
        } else {
            setFilteredTasks(tasks.filter(task => task.status?.status_name === statusName));
        }
    };

const handleStatusChange = async (taskId, newStatusId) => {
    try {
        // Send the task update request to the backend API with task_id, status_id, and user_id
        const response = await updateTaskStatus({
            task_id: taskId,
            status_id: newStatusId,
            user_id: userID,
        });

        // Check if the response is successful
        if (response.status === "success") {
            // Find the updated status from the 'statuses' list based on the newStatusId
            const updatedStatus = statuses.find((s) => s.id === newStatusId);

            // Update tasks and filteredTasks state to reflect the status change
            const updateTaskState = (prevTasksArray) =>
                prevTasksArray.map((task) =>
                    task.id === taskId
                        ? { ...task, status: updatedStatus }  // Update only the task with the new status
                        : task
                );

            // Update both tasks and filteredTasks state
            setTasks(updateTaskState);
            setFilteredTasks(updateTaskState);

            // Log the success
            console.log(`Task ${taskId} status updated to ${updatedStatus?.status_name}`);
        } else {
            console.error("Failed to update task status:", response.message);
            // Optionally show a toast or alert for failure
        }
    } catch (error) {
        // Catch and log any error during the status update process
        console.error("Error updating task status:", error);
        // Optionally show a toast or alert for error
    }
};


    const renderPriorityIcon = (priorityName) => {
        switch (priorityName?.toLowerCase()) { // Use .toLowerCase() for consistency
            case 'important':
                return <PriorityHigh color="error" fontSize="small" sx={{ ml: 0.5 }} />;
            case 'low':
                return <AccessAlarm color="success" fontSize="small" sx={{ ml: 0.5 }} />; // Changed to success for low priority, warning might imply a problem
            case 'medium': // Assuming there might be a medium priority
                return <Warning color="warning" fontSize="small" sx={{ ml: 0.5 }} />;
            default:
                return null; // Or a default icon if needed
        }
    };

    return (
        <Box sx={{ padding: { xs: 1, md: 3 } }}> {/* Responsive padding */}
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", flexDirection: "column" }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ mt: 2 }}>Loading tasks...</Typography>
                </Box>
            ) : (
                <>
                    {/* Status Filter Chips */}
                    <Box sx={{
                        display: "flex",
                        gap: 1,
                        overflowX: "auto",
                        mb: 2,
                        alignItems: "center",
                        padding: 1, // Add padding for better touch/click area
                        pb: 2, // Extra padding at bottom
                        borderBottom: '1px solid #e0e0e0', // Separator
                        '&::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar for aesthetics
                        msOverflowStyle: 'none', // IE and Edge
                        scrollbarWidth: 'none', // Firefox
                    }}>
                        <Chip
                            label={`All (${tasks.length})`}
                            onClick={() => handleStatusClick("")}
                            color={selectedStatus === "" ? "primary" : "default"}
                            variant={selectedStatus === "" ? "filled" : "outlined"}
                            clickable
                            sx={{ minWidth: '80px' }}
                        />
                        {statuses.map((status) => (
                            <Chip
                                key={status.id}
                                label={`${status.status_name} (${tasks.filter(t => t.status?.status_name === status.status_name).length})`} // Show count
                                onClick={() => handleStatusClick(status.status_name)}
                                color={selectedStatus === status.status_name ? "primary" : "default"}
                                variant={selectedStatus === status.status_name ? "filled" : "outlined"}
                                clickable
                                sx={{ minWidth: '80px' }}
                            />
                        ))}
                         <Button variant="contained" color="success" onClick={handleNavigation} sx={{ ml: 'auto', whiteSpace: 'nowrap' }}>
                            + Add New Task
                        </Button>
                    </Box>

                    {/* Task Cards Grouped by Priority */}
                    <Box sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                        gap: 3,
                        padding: { xs: 0, md: 2 } // Responsive padding
                    }}>
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => (
                                <Card
                                    key={task.id}
                                    sx={{
                                        padding: 2, // Adjusted padding
                                        borderRadius: 3, // Slightly smaller radius
                                        boxShadow: 3, // Default shadow
                                        background: theme.palette.background.paper, // Use theme background
                                        border: `1px solid ${task.priority?.priority_name === 'Important' ? '#ff9800' : '#e0e0e0'}`, // Border based on priority
                                        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease",
                                        '&:hover': {
                                            transform: "translateY(-5px)", // Lift effect
                                            boxShadow: "0 6px 12px rgba(0,0,0,0.1)", // More prominent shadow on hover
                                        }
                                    }}
                                >
                                    <CardContent sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", p: 2, '&:last-child': { pb: 2 } }}>
                                        {/* Completion Percentage */}
                                        {task.show_completion_percentage === 1 && (
                                            <Box sx={{ mb: 2 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={task.completion_percentage}
                                                    sx={{
                                                        height: 8, // Thinner progress bar
                                                        borderRadius: 4,
                                                        backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#e0e0e0',
                                                        '& .MuiLinearProgress-bar': {
                                                            backgroundColor: theme.palette.primary.main, // Use primary theme color
                                                        }
                                                    }}
                                                />
                                                <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center", mt: 0.5, display: "block" }}>
                                                    {task.completion_percentage}% completed
                                                </Typography>
                                            </Box>
                                        )}

                                        {/* Task Title and Details */}
                                        <Typography variant="h6" sx={{ fontWeight: "bold", color: theme.palette.text.primary, mb: 1 }}>
                                            {task.task_title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {task.task_details}
                                        </Typography>

                                        {/* Priority */}
                                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                            <Typography variant="caption" sx={{ fontWeight: "bold", color: theme.palette.text.secondary }}>
                                                Priority:
                                            </Typography>
                                            <Chip
                                                label={task.priority?.priority_name || "N/A"}
                                                size="small"
                                                sx={{
                                                    ml: 1,
                                                    backgroundColor:
                                                        task.priority?.priority_name?.toLowerCase() === 'important' ? '#ffe0b2' : // Light orange for Important
                                                        task.priority?.priority_name?.toLowerCase() === 'low' ? '#c8e6c9' : // Light green for Low
                                                        task.priority?.priority_name?.toLowerCase() === 'medium' ? '#fff9c4' : // Light yellow for Medium
                                                        '#e0e0e0', // Default light gray
                                                    color: theme.palette.text.primary,
                                                    fontWeight: 'bold',
                                                }}
                                            />
                                            {renderPriorityIcon(task.priority?.priority_name)}
                                        </Box>

                                        {/* Due Date */}
                                        {task.due_date && (
                                            <Box sx={{ display: "flex", alignItems: "center", mt: 1, color: theme.palette.text.secondary }}>
                                                <AccessAlarm fontSize="small" sx={{ mr: 0.5 }} />
                                                <Typography variant="caption">
                                                    Due: {dayjs(task.due_date).format("MMM DD, YYYY")}
                                                </Typography>
                                            </Box>
                                        )}

                                        {/* Creator */}
                                        {task.creator && (
                                            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                                                <Avatar src={`${image_file_url}/${task.creator.photo}`} sx={{ width: 24, height: 24, mr: 1 }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    Created by: {task.creator.name}
                                                </Typography>
                                            </Box>
                                        )}

                                        {/* Assigned Persons */}
                                        {/* IMPORTANT: Assuming task.assigned_persons is an array */}
                                        {task.assigned_persons && task.assigned_persons.length > 0 && (
                                            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                                                <Typography variant="caption" sx={{ mr: 1, color: theme.palette.text.secondary }}>
                                                    Assigned to:
                                                </Typography>
                                                {task.assigned_persons.slice(0, 3).map((person, index) => ( // Show up to 3 avatars
                                                    <Avatar
                                                        key={person.id || index}
                                                        src={`${image_file_url}/${person.photo}`}
                                                        alt={person.name}
                                                        sx={{ width: 24, height: 24, mr: -0.5, border: `1px solid ${theme.palette.background.paper}` }}
                                                    />
                                                ))}
                                                {task.assigned_persons.length > 3 && (
                                                    <Typography variant="caption" sx={{ ml: 1, color: theme.palette.text.secondary }}>
                                                        +{task.assigned_persons.length - 3} more
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}
                                    </CardContent>

                                    <CardActions sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, pt: 0 }}>
                                        <Button
                                            color="secondary"
                                            variant="contained"
                                            size="small"
                                            onClick={() => handleNavigationTaskDetail(task.id)}
                                            sx={{ textTransform: 'none' }}
                                        >
                                            Details
                                        </Button>

                                        <Select
                                            value={task.status?.id || ''} // Handle potentially null status
                                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                            sx={{ minWidth: 120, height: 36, fontSize: '0.875rem' }} // Smaller select
                                            displayEmpty
                                        >
                                            {!task.status?.id && (
                                                <MenuItem value="" disabled>
                                                    Select Status
                                                </MenuItem>
                                            )}
                                            {statuses.map((status) => (
                                                <MenuItem key={status.id} value={status.id}>
                                                    {status.status_name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </CardActions>
                                </Card>
                            ))
                        ) : (
                            !loading && ( // Only show "No tasks" message if not loading
                                <Typography align="center" variant="h6" color="text.secondary" sx={{ gridColumn: '1 / -1', py: 5 }}>
                                    No tasks found for the selected filter.
                                </Typography>
                            )
                        )}
                    </Box>
                </>
            )}
        </Box>
    );
};

export default MyTaskTable;