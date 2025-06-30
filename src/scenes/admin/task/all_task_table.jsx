import React, { useState, useEffect } from "react";
import { getAllTask, getStatus, updateTaskStatus } from "../../../api/controller/admin_controller/task_controller/task_controller";
import { fetchEmployees } from "../../../api/controller/admin_controller/user_controller";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../../theme";
import {
  useTheme,  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, Typography, Button,
    Box, CircularProgress, Chip, Select, MenuItem, InputLabel, FormControl, Card, CardContent, LinearProgress
} from "@mui/material";
import { base_url, image_file_url } from "../../../api/config/index";

const statusColors = {
    "Ongoing": "#FFF3CD",
    "In Progress": "#D1ECF1",
    "Completed": "#D4EDDA",
    "Cancelled": "#F8D7DA",
};

const AllTaskTable = () => {
   
      const theme = useTheme();
        const userID = localStorage.getItem("userId");
      const colors = tokens(theme.palette.mode);
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        fetchTasks();
        fetchStatuses();
        fetchEmployeesList();
    }, []);
    const handleNavigationTaskDetail = (id) => navigate(`/task-details/${id}`);
    const fetchTasks = async () => {
        try {
            const response = await getAllTask();
            setTasks(response.data);
            setFilteredTasks(response.data);
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

    const fetchEmployeesList = async () => {
        try {
            const response = await fetchEmployees();
            setEmployees(response.data);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    const handleStatusClick = (status) => {
        setSelectedStatus(status);
        filterTasks(status, selectedEmployee);
    };
  const handleNavigation = () => navigate("/add-task", {
      state: {
        'project_id': 0,
        'project_phase_id': 0,
      },
    });
    const handleEmployeeChange = (event) => {
        const employeeId = event.target.value;
        setSelectedEmployee(employeeId);
        filterTasks(selectedStatus, employeeId);
    };

    const filterTasks = (status, employeeId) => {
        let filtered = tasks;

        if (status) {
            filtered = filtered.filter(task => task.status.status_name === status);
        }

        if (employeeId) {
            filtered = filtered.filter(task =>
                task.assigned_persons.some(person => person.assigned_person.id === employeeId)
            );
        }

        setFilteredTasks(filtered);
    };

    const handleStatusChange = async (taskId, newStatusId) => {
        try {
            await updateTaskStatus({ task_id: taskId, status_id: newStatusId ,user_id: userID });

            // Update task status in the UI in real-time
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === taskId ? { ...task, status: statuses.find(s => s.id === newStatusId) } : task
                )
            );
            setFilteredTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === taskId ? { ...task, status: statuses.find(s => s.id === newStatusId) } : task
                )
            );
        } catch (error) {
            console.error("Error updating task status:", error);
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
                    <Box sx={{ display: "flex", gap: 1, overflowX: "auto", mb: 3 }}>
                        <Chip
                            label="All Tasks"
                            onClick={() => handleStatusClick("")}
                            color={selectedStatus === "" ? "primary" : "default"}
                            clickable
                            sx={{
                                backgroundColor: "#e0e0e0",
                                '&:hover': {
                                    backgroundColor: "#b3b3b3"
                                }
                            }}
                        />
                        {statuses.map((status) => (
                            <Chip
                                key={status.id}
                                label={status.status_name}
                                onClick={() => handleStatusClick(status.status_name)}
                                color={selectedStatus === status.status_name ? "primary" : "default"}
                                clickable
                                sx={{
                                    backgroundColor: statusColors[status.status_name] || "#f5f5f5",
                                    '&:hover': {
                                        backgroundColor: "#b3b3b3"
                                    }
                                }}
                            />
                        ))}
                    </Box>

                    {/* Employee Filter */}
   <Box
  sx={{
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
    mb: 3,
    px: 2 // Optional horizontal padding
  }}
>
  <FormControl sx={{ minWidth: 200 }}>
    <InputLabel>Filter by Employee</InputLabel>
    <Select value={selectedEmployee} onChange={handleEmployeeChange}>
      <MenuItem value="">
        <em>All Employees</em>
      </MenuItem>
      {employees.map((employee) => (
        <MenuItem key={employee.id} value={employee.id}>
          {employee.name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>

  <Button
    variant="contained"
    color="secondary"
    sx={{ borderRadius: '25px', height: 'fit-content', px: 3 }}
    onClick={handleNavigation}
  >
    + Add Task
  </Button>
</Box>

                    {/* Task List */}
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 2 }}>
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => (
                                <Card
                                    key={task.id}
                                    sx={{
                                        borderRadius: 3,
                                        boxShadow: 3,
                                        backgroundColor: statusColors[task.status.status_name] || "#f5f5f5",
                                        transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
                                        '&:hover': {
                                            transform: "scale(1.03)",
                                            boxShadow: "0 8px 16px rgba(0,0,0,0.15)"
                                        }
                                    }}
                                >
                                    <CardContent>
                                        {task.show_completion_percentage === 1 && (
                                            <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", mb: 2 }}>
                                                <Box sx={{ width: "100%", height: 10 }}>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={task.completion_percentage}
                                                        sx={{ height: 10, borderRadius: 5, backgroundColor: "#e0e0e0" }}
                                                    />
                                                    <Typography variant="caption" sx={{ textAlign: "center", mt: 1, color: "#888" }}>
                                                        {task.completion_percentage}% completed
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        )}
                                        <Typography variant="h6" sx={{ fontWeight: "bold" }} gutterBottom>
                                          {task.id}-  {task.task_title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {task.task_details}
                                        </Typography>
                                        <Typography variant="caption" color="primary">
                                            {task.priority.priority_name} Priority
                                        </Typography>
                                            {task.project === null ? (
                                          <Typography variant="body2">No project added for this task</Typography>
                                        ) : (
                                          <>
                                            <Typography variant="subtitle2" color="text.secondary">
                                            Project: {task.project.project_name}
                                        </Typography>
                                          </>
                                        )}
                                       
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                                            <Avatar src={`${image_file_url}/${task.creator.photo}`} sx={{ width: 30, height: 30 }} />
                                            <Typography variant="body2">Created By: {task.creator.name} </Typography>
                                        </Box>
                                   <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
                  {/* Optional: Add a label for clarity if not already present above this section */}
                  {/* <Typography variant="caption" sx={{ color: theme.palette.text.secondary, width: '100%', mb: 0.5 }}>
                      Assigned to:
                  </Typography> */}
                  {task.assigned_persons.map((assignedPerson, index) => (
                      <Chip
                          key={assignedPerson.id || index} // Use assignedPerson.id for a stable key if available
                          avatar={
                              <Avatar
                                  src={`${image_file_url}/${assignedPerson.assigned_person.photo}`}
                                  alt={assignedPerson.assigned_person.name} // Always add alt text for accessibility
                              />
                          }
                          label={assignedPerson.assigned_person.name}
                          variant="outlined" // Gives it a distinct box/pill shape
                          size="small"
                          sx={{
                             // Example: a subtle border color from your theme
                              color: colors.greenAccent[100], // Text color inside the chip
                              backgroundColor: colors.greenAccent[700], // Background color of the chip
                              '& .MuiChip-avatar': {
                                  color: 'white', // Avatar icon/text color if image fails
                                  backgroundColor: colors.blueAccent[600], // Avatar background color
                              }
                          }}
                      />
                  ))}
              </Box>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '0px', // Add padding around the Box
                                            gap: '0px', // Add space between elements inside the Box
                                            backgroundColor: '#f5f5f5', // Optional: Add a light background color for better visibility
                                            borderRadius: '8px', // Optional: rounded corners for the box
                                        }}>
                                            <Button
                                                color="secondary"
                                                variant="contained"
                                                onClick={() => handleNavigationTaskDetail(task.id)}
                                                sx={{ padding: '8px 16px' }} // Adjust padding inside the button
                                            >
                                                Details
                                            </Button>
                                            <FormControl sx={{ minWidth: 200 }}>
                                                <Select
                                                    value={task.status.id}
                                                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                                    sx={{
                                                        padding: '0px 4px',
                                                        backgroundColor: 'white', // Ensure select box has white background for clarity
                                                        borderRadius: '4px', // Optional: rounded corners for the select box
                                                    }}
                                                >
                                                    {statuses.map((status) => (
                                                        <MenuItem key={status.id} value={status.id}>
                                                            {status.status_name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Box>

                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Typography align="center">No tasks found</Typography>
                        )}
                    </Box>
                </>
            )}
        </Box>
    );
};

export default AllTaskTable;
