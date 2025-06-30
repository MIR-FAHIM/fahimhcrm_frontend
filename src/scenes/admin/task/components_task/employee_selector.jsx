import {
  Box, TextField, Autocomplete, Typography, useTheme, CircularProgress,
  Grid, Card, CardContent, Avatar, Button, IconButton,
} from "@mui/material";
import { useState, useEffect } from "react";
import { tokens } from "../../../../theme";
import { fetchEmployees } from "../../../../api/controller/admin_controller/user_controller";
import { image_file_url } from "../../../../api/config/index";
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

const EmployeeSelector = ({ handleAssignData, handleUnassignData, handleAddNotification, taskID, assignedPersons = [] }) => {
  const theme = useTheme();
  const userID = localStorage.getItem("userId");
  const colors = tokens(theme.palette.mode);

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [errorEmployees, setErrorEmployees] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const getUnassignedEmployees = () => {
    const assignedIds = new Set(assignedPersons.map(p => p.assigned_person.id));
    return employees.filter(emp => !assignedIds.has(emp.id));
  };

  const handleFetchEmployee = async () => {
    setLoadingEmployees(true);
    setErrorEmployees(null);
    try {
      const response = await fetchEmployees();
      if (response && response.data) {
        setEmployees(response.data);
      } else {
        setErrorEmployees("No employee data found.");
        setEmployees([]);
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      setErrorEmployees("Failed to load employees. Please try again.");
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    handleFetchEmployee();
  }, []);

  const handleAssign = (employeeId) => {
    const data = {
      'task_id': taskID,
      'assigned_person': employeeId,
      'assigned_by': userID,
      'is_main': 1
    };
    handleAssignData(data);
    setSelectedEmployee(null);
  };

  const handleUnassign = (assignmentId) => {
    handleUnassignData(assignmentId);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" mb={3} color={colors.gray[100]} fontWeight="bold">
        Task Assignments
      </Typography>

      <Box sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: colors.primary[400],
        boxShadow: 2,
      }}>
        {/* Header with Autocomplete on the right */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap" // Allow wrapping on small screens
          mb={2}
          gap={2} // Add gap for spacing between title and autocomplete
        >
          <Typography variant="h6" color={colors.gray[100]} fontWeight="bold">
            Currently Assigned Employees
          </Typography>

          {/* Autocomplete for assigning new employees */}
          <Box sx={{
            width: { xs: '100%', sm: 'auto' }, // Full width on small, auto on larger
            minWidth: { xs: 'auto', sm: '250px', md: '300px' }, // Set a minimum width for the Autocomplete
            flexGrow: { xs: 1, sm: 0 }, // Allow it to grow on small screens
          }}>
            {loadingEmployees ? (
              <Box display="flex" alignItems="center" justifyContent="center" height="40px">
                <CircularProgress size={16} sx={{ color: colors.greenAccent[300] }} />
                <Typography variant="caption" color={colors.greenAccent[300]} sx={{ ml: 1 }}>Loading...</Typography>
              </Box>
            ) : errorEmployees ? (
              <Typography color="error" variant="caption">
                {errorEmployees}
                <Button onClick={handleFetchEmployee} sx={{ ml: 1 }} size="small" variant="outlined">Retry</Button>
              </Typography>
            ) : (
              <Autocomplete
                options={getUnassignedEmployees()}
                getOptionLabel={(option) => option.name || ""}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={selectedEmployee}
                onChange={(event, newValue) => {
                  setSelectedEmployee(newValue);
                  if (newValue) {
                    handleAssign(newValue.id);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Assign Employee" // More descriptive label
                    variant="outlined"
                    size="small" // Keep it small for compactness in this header context
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: colors.blueAccent[200] },
                        '&:hover fieldset': { borderColor: colors.blueAccent[400] },
                        '&.Mui-focused fieldset': { borderColor: colors.greenAccent[500] },
                        color: colors.gray[100],
                        borderRadius: '8px', // Match outer box
                      },
                      '& .MuiInputLabel-root': { color: colors.gray[100] },
                      '& .MuiInputBase-input': { color: colors.gray[100] },
                      '& .MuiSvgIcon-root': { color: colors.gray[100] },
                    }}
                  />
                )}
                noOptionsText="All employees assigned or none found."
              />
            )}
          </Box>
        </Box>

        {/* Assigned Employees Grid (below the combined header) */}
        {assignedPersons.length === 0 ? (
          <Typography variant="body2" color={colors.gray[300]}>
            No employees are currently assigned to this task.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {assignedPersons.map((assignment) => (
              <Grid item xs={12} sm={6} md={4} key={assignment.id}> {/* Adjusted to md={4} for more columns on desktop */}
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderRadius: 2,
                    boxShadow: 2,
                    backgroundColor: colors.primary[500],
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ pb: 1 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Avatar
                        src={`${image_file_url}/${assignment.assigned_person.photo}`}
                        sx={{
                          width: 50,
                          height: 50,
                          mr: 1.5,
                          border: `2px solid ${colors.blueAccent[300]}`,
                        }}
                      />
                      <Box flexGrow={1}>
                        <Typography variant="body1" fontWeight="bold" color={colors.gray[100]}>
                          {assignment.assigned_person.name}
                        </Typography>
                        <Typography variant="caption" color={colors.gray[300]}>
                          {assignment.assigned_person.role?.role_name || "No Role"}
                        </Typography>
                      </Box>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleUnassign(assignment.id)}
                        aria-label="unassign employee"
                        sx={{ p: 0.5 }}
                      >
                        <PersonRemoveIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Typography variant="caption" color={colors.gray[300]}>
                      Email: {assignment.assigned_person.email || "N/A"}
                    </Typography>
                  </CardContent>

                  <Box px={1.5} pb={1.5}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      sx={{
                        borderRadius: "16px",
                        textTransform: "none",
                        fontWeight: "bold",
                        py: 0.5,
                        color: colors.greenAccent[300],
                        borderColor: colors.greenAccent[300],
                        "&:hover": {
                          backgroundColor: colors.greenAccent[800],
                          borderColor: colors.greenAccent[400],
                        },
                      }}
                      startIcon={<NotificationsActiveIcon fontSize="small" />}
                      onClick={() => handleAddNotification(assignment.assigned_person.id)}
                    >
                      Remind
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default EmployeeSelector;