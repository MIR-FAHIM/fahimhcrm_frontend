import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  List,
  ListItem,
  ListItemText,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  Card,
  Chip,
  CardContent,
  Avatar,
} from "@mui/material";
import { fetchEmployees } from "../../../api/controller/admin_controller/user_controller";
import { getAttendanceReportByUser } from "../../../api/controller/admin_controller/attendance_controller";
import { blue, green, purple } from "@mui/material/colors";
import { base_url , image_file_url} from "../../../api/config/index";
import dayjs from "dayjs";
const EmployeeAttendanceReport = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear()); // Default to current year
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Default to current month

  // Fetch the employee list when the component mounts
  useEffect(() => {
    fetchEmployeesList();
  }, []);

  const fetchEmployeesList = async () => {
    setLoading(true);
    try {
      const response = await fetchEmployees();
      setEmployees(response.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance data based on selected employee, year, and month
  const fetchAttendance = async (employeeId, year, month) => {
    setLoading(true);
    try {
      const response = await getAttendanceReportByUser({
        user_id: employeeId,
        year,
        month,
      });
      setAttendances(response.dates || []); // Use the dates array from the API response
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };

  const convertSecondsToHM = (seconds) => {
    if (seconds == null || seconds === 0) {
      return "0h 0m"; // Handle case when there is no total duration
    }
    const hours = Math.floor(seconds / 3600); // Get the hours
    const minutes = Math.floor((seconds % 3600) / 60); // Get the minutes
    return `${hours}h ${minutes}m`;
  };

  const renderStatus = (status) => {
    return status ? "✔️" : "❌"; // Returns a check mark if true, cross if false
  };

  const handleEmployeeSelection = (employee) => {
    setSelectedEmployee(employee);
    fetchAttendance(employee.id, year, month); // Fetch attendance for selected employee
  };

  // Month names for the dropdown
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <Box display="flex" justifyContent="center" gap={3} p={3}>
      {/* Employee List Section (Left side) */}
      <Box sx={{ width: "30%", height: "80vh", overflowY: "auto", borderRight: "1px solid #ddd", padding: 2 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Employees
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : employees.length === 0 ? (
          <Typography variant="h6" color="textSecondary">
            No employees found.
          </Typography>
        ) : (
          <List>
            {employees.map((employee) => (
              <ListItem
                key={employee.id}
                button
                onClick={() => handleEmployeeSelection(employee)}
                sx={{
                  backgroundColor: purple[50],
                  borderRadius: 2,
                  marginBottom: 1,
                  "&:hover": {
                    backgroundColor: purple[200],
                  },
                }}
              >
                <Avatar
                  src={`${image_file_url}/${employee.photo}`}
                  sx={{ bgcolor: blue[500], marginRight: 2 }}
                >
                  {employee.name[0]}
                </Avatar>
                <ListItemText primary={employee.name || `User ID: ${employee.id}`} />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Attendance Report Section (Right side) */}
      <Box sx={{ width: "70%", height: "80vh", overflowY: "auto", padding: 2 }}>
        {selectedEmployee ? (
          <>
            <Typography variant="h4" fontWeight="bold">
              {selectedEmployee.name}'s Attendance Records
            </Typography>

            {/* Month and Year Selection */}
            <Box display="flex" justifyContent="space-between" gap={3} mt={2}>
              <TextField
                label="Select Year"
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                sx={{ width: "30%" }}
                InputLabelProps={{ shrink: true }}
              />
              <FormControl sx={{ width: "30%" }}>
                <InputLabel>Month</InputLabel>
                <Select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  label="Month"
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: 2,
                    boxShadow: 1,
                    "& .MuiSelect-icon": { color: green[800] },
                  }}
                >
                  {monthNames.map((monthName, index) => (
                    <MenuItem key={index} value={index + 1}>
                      {monthName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Attendance Table */}
            {loading ? (
              <CircularProgress />
            ) : attendances.length === 0 ? (
              <Typography variant="h6" color="textSecondary" mt={3}>
                No attendance records found for the selected month and year.
              </Typography>
            ) : (
              <TableContainer component={Paper} sx={{ marginTop: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center"><strong>Date</strong></TableCell>
                    <TableCell align="center"><strong>Weekday</strong></TableCell>
                    <TableCell align="center"><strong>Check-in Time</strong></TableCell>
                    <TableCell align="center"><strong>Check-out Time</strong></TableCell>
                    <TableCell align="center"><strong>Check-in Location</strong></TableCell>
                    <TableCell align="center"><strong>Check-out Location</strong></TableCell>
                    <TableCell align="center"><strong>Is Late</strong></TableCell>
                    <TableCell align="center"><strong>Is Early Leave</strong></TableCell>
                    <TableCell align="center"><strong>Work From Home</strong></TableCell>
                    <TableCell align="center"><strong>From Field</strong></TableCell>
                    <TableCell align="center"><strong>Total Duration</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendances.map((attendance, index) => {
                    // Check if it's a weekend day
                    const isWeekend = attendance.weekend === true;
            
                    return (
                      <TableRow
                        key={index}
                        sx={{
                          backgroundColor: isWeekend ? '#f0f8ff' : 'transparent', // Light blue for weekend
                          fontWeight: isWeekend ? 'bold' : 'normal', // Bold text for weekends
                        }}
                      >
                        <TableCell align="center">{attendance.date}</TableCell>
                        <TableCell align="center">{attendance.weekday}</TableCell>
                        <TableCell align="center">
                          {attendance.attendance ? new Date(attendance.attendance.check_in_time).toLocaleTimeString() : "N/A"}
                        </TableCell>
                        <TableCell align="center">
                           {attendance.attendance?.check_out_time ? new Date(attendance.attendance.check_out_time).toLocaleTimeString() : "N/A"}
                          {/* {dayjs(attendance.attendance?.check_out_time).format("hh:mm A")} */}
                        </TableCell>
                        <TableCell align="center">{attendance.attendance ? attendance.attendance.check_in_location : "N/A"}</TableCell>
                        <TableCell align="center">{attendance.attendance ? attendance.attendance.check_out_location : "N/A"}</TableCell>
       <TableCell align="center">
  {!attendance.attendance?.check_in_time ? (
    "N/A"
  ) : attendance.attendance?.is_late ? (
    <Chip label="Late" size="small" color="warning" />
  ) : (
    <Chip label="On Time" size="small" color="success" />
  )}
</TableCell>
                        <TableCell align="center">{renderStatus(attendance.attendance ? attendance.attendance.is_early_leave : false)}</TableCell>
                        <TableCell align="center">{renderStatus(attendance.attendance ? attendance.attendance.is_work_from_home : false)}</TableCell>
                        <TableCell align="center">{renderStatus(attendance.attendance ? attendance.attendance.from_field : false)}</TableCell>
                        <TableCell align="center">{attendance.attendance ? convertSecondsToHM(attendance.attendance.total_duration) : "0h 0m"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            )}
          </>
        ) : (
          <Typography variant="h6" color="textSecondary">
            Select an employee to view their attendance report.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default EmployeeAttendanceReport;
