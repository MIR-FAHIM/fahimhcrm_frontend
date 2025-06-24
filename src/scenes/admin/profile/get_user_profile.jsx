import React, { useState, useEffect } from "react";
import {
    Box, Typography, CircularProgress, Grid, Paper, Tabs, Tab, FormControl, InputLabel, Select, MenuItem,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Link,

} from "@mui/material";
import { useParams } from "react-router-dom";
import { getProfile, uploadProfileImage, logOut, updateProfile, modulePermission, changePassController } from "../../../api/controller/admin_controller/user_controller";
import { getAttendanceReportByUser } from "../../../api/controller/admin_controller/attendance_controller";
import { base_url, image_file_url } from "../../../api/config/index";
import ProfileComponent from "./profile_components/profile_components";
import { useNavigate } from "react-router-dom";
import TaskComponents from "./profile_components/task_components";
import { updateProductInfo } from "../../../api/controller/api_controller";






const EmpProfile = () => {

    const navigate = useNavigate();
    const userID = localStorage.getItem("userId");
    const { id } = useParams(); // Get the user ID from the URL
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);
    const [attendanceData, setAttendanceData] = useState([]);
    const [taskData, setTaskData] = useState([]); // Fetch tasks here
    const [activityData, setActivityData] = useState([]); // Fetch activities here
    const [activeTab, setActiveTab] = useState(0);
   // Tab control (General Information, Attendance, Tasks, Activity)
    const [month, setMonth] = useState(new Date().getMonth() + 1); // Default to current month
    const [year, setYear] = useState(new Date().getFullYear()); // Default to current year
    const [selectedFile, setSelectedFile] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
const [permissions, setPermissions] = useState({});
  const handleGetModulePermission = async () => {
    try {

      const response = await modulePermission();
      if (response.status === 'success') {
        setPermissions(response.permissions); // Set the response data
      } else {

      }
    } catch (error) {

    } finally {

    }
  };
    // Fetch employee profile when the component is mounted
    useEffect(() => {
        handleGetModulePermission();
        fetchProfile();
    }, []);
    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };
    const handleLogout = async () => {
        try {
            const res = await logOut(userID);

            if (res?.status === 'success') {  // Optional chaining to avoid errors
                navigate('/login');
            } else {
                console.error('Logout failed:', res);
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };
    const handleNavigationMap = (lat, long) => {
        navigate(`/google-map?lat=${lat}&lng=${long}`);
    };
    // Handle image upload
    const handleUpload = async () => {
        if (!selectedFile) return alert("Please select an image!");

        const response = await uploadProfileImage({
            "user_id": userID,
            "photo": selectedFile
        });

        if (response) {
            alert("Image uploaded successfully!");
            // Fetch updated profile data
            const updatedProfile = await getProfile(userID);
            setProfileData(updatedProfile.data);
            setImageUrl(`${image_file_url}/${updatedProfile.data.photo}`);
        } else {
            alert("Image upload failed!");
        }
    };
    const handleUpdateProfileData = async (data) => {
       
        const response = await updateProfile(data);

        if (response) {
            alert("Profile Updated successfully!");
            // Fetch updated profile data
            const updatedProfile = await getProfile(userID);
            setProfileData(updatedProfile.data);
           
        } else {
            alert("Update failed!");
        }
    };
   
    // Fetch profile data
    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await getProfile(id);
            console.log("Profile data received:", response.data);
            setProfileData(response.data || {});
            setImageUrl(`${image_file_url}/${response.data.photo}`);
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch attendance data based on selected month and year
    const fetchAttendance = async (userId, month, year) => {
        try {
            const response = await getAttendanceReportByUser({
                user_id: userId,
                month: month,
                year: year,

            });
            setAttendanceData(response.dates || []);
        } catch (error) {
            console.error("Error fetching attendance:", error);
        }
    };

    // Handle tab change to switch between sections
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        if (newValue === 1) {
            fetchAttendance(profileData?.id, month, year); // Fetch attendance when Attendance tab is selected
        }
        // Fetch tasks and activities if needed
    };

    // Handle month change in the attendance tab
    const handleMonthChange = (event) => {
        const selectedMonth = event.target.value;
        setMonth(selectedMonth);
        if (activeTab === 1) {
            fetchAttendance(profileData?.id, selectedMonth, year); // Re-fetch attendance when month changes
        }
    };

    // Handle year change in the attendance tab
    const handleYearChange = (event) => {
        const selectedYear = event.target.value;
        setYear(selectedYear);
        if (activeTab === 1) {
            fetchAttendance(profileData?.id, month, selectedYear); // Re-fetch attendance when year changes
        }
    };
const handleChangePass = async (data) => {
    try {
        const response = await changePassController(data);
        
        // Log the full response to check its structure
        console.log("Password Change Response:", response);
        
        // Check if the response is successful
        if (response.status === "success") {
            alert(response.message);
            
            // Fetch updated profile data
            const updatedProfile = await getProfile(userID);
            setProfileData(updatedProfile.data);
        } else if (response.status === "error") {
            alert(response.message); // This will show the error message from the backend
        } else {
            alert("Failed!"); // In case there is no expected status
        }
    } catch (error) {
        // Log any errors if the request fails
        console.error("Error changing password:", error);
        alert("An error occurred while changing the password.");
    }
};

    // Helper function to convert seconds to Hours:Minutes format
    const convertSecondsToHM = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    // Render the status in the attendance table
    const renderStatus = (value) => {
        return value ? "Yes" : "No";
    };

    return (
        <Box p={3}>
            {loading ? (
                <CircularProgress />
            ) : (
                <Paper sx={{ padding: 2 }}>
                    {/* Tabs Section */}
                    <Tabs value={activeTab} onChange={handleTabChange} aria-label="Employee Profile Tabs">
                        <Tab label="General Information" />
                        <Tab label="Attendance" />
                         {permissions.task &&(<Tab label="Tasks" />)}
                         {permissions.task &&(<Tab label="Activity" />)}
                        
                    </Tabs>

                    {/* Content Section */}
                    {activeTab === 0 && profileData && (
                        <ProfileComponent
                        handleUpdateData = {handleUpdateProfileData}
                        changePass = {handleChangePass}

                            imageUrl={imageUrl}
                            handleFileChange={handleFileChange}
                            handleUpload={handleUpload}
                            profileData={profileData}
                            userID={userID}
                            id={id}
                            handleLogout={handleLogout}
                        />
                    )}

                    {/* Attendance Tab */}
                    {activeTab === 1 && (
                        <Box mt={3}>
                            <Typography variant="h5" fontWeight="bold" mb={2}>
                                Attendance
                            </Typography>

                            {/* Month and Year Selection */}
                            <Grid container spacing={3} mb={3}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Month</InputLabel>
                                        <Select value={month} onChange={handleMonthChange}>
                                            {[...Array(12)].map((_, index) => (
                                                <MenuItem key={index} value={index + 1}>
                                                    {new Date(0, index).toLocaleString('default', { month: 'long' })}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Year</InputLabel>
                                        <Select value={year} onChange={handleYearChange}>
                                            {[2023, 2024, 2025, 2026].map((yearOption) => (
                                                <MenuItem key={yearOption} value={yearOption}>
                                                    {yearOption}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>

                            {attendanceData.length === 0 ? (
                                <Typography>No attendance records found.</Typography>
                            )
                                :
                                (
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
                                                    <TableCell align="center"><strong>On Time</strong></TableCell>
                                                    <TableCell align="center"><strong>Is Late</strong></TableCell>
                                                    <TableCell align="center"><strong>Work From Home?</strong></TableCell>
                                                    <TableCell align="center"><strong>From Field?</strong></TableCell>
                                                    <TableCell align="center"><strong>Total Duration</strong></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {attendanceData.map((day) => (
                                                    <TableRow key={day.date}>
                                                        <TableCell align="center">{day.date}</TableCell>
                                                        <TableCell align="center">{day.weekday}</TableCell>

                                                        <TableCell align="center">
                                                            {day.attendance?.check_in_time
                                                                ? new Date(day.attendance.check_in_time).toLocaleTimeString()
                                                                : "N/A"}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {day.attendance?.check_out_time
                                                                ? new Date(day.attendance.check_out_time).toLocaleTimeString()
                                                                : "N/A"}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Link
                                                                component="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleNavigationMap(day.attendance?.check_in_lat, day.attendance?.check_in_lon);
                                                                }}
                                                            >
                                                                {day.attendance?.check_in_location || "N/A"}
                                                            </Link>
                                                        </TableCell>

                                                        <TableCell align="center">
                                                            <Link
                                                                component="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleNavigationMap(day.attendance?.check_out_lat, day.attendance?.check_out_lon);
                                                                }}
                                                            >
                                                                {day.attendance?.check_out_location || "N/A"}
                                                            </Link>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {day.attendance ? renderStatus(!day.attendance.is_late) : "N/A"}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {day.attendance ? renderStatus(day.attendance.is_late) : "N/A"}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {day.attendance ? renderStatus(day.attendance.is_work_from_home) : "N/A"}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {day.attendance ? renderStatus(day.attendance.from_field) : "N/A"}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            "N/A"
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>

                                )}
                        </Box>
                    )}

                    {/* Tasks Tab */}
                    {activeTab === 2 && (
                        <Box mt={3}>
                          <TaskComponents
                          
                            userID={id}
                          
                        />  
                           
                            
                        </Box>
                    )}

                    {/* Activity Tab */}
                    {activeTab === 3 && (
                        <Box mt={3}>
                            <Typography variant="h5" fontWeight="bold" mb={2}>
                                Activity
                            </Typography>
                            {/* You can display activities here */}
                            <Typography>No recent activities available.</Typography>
                        </Box>
                    )}
                </Paper>
            )}
        </Box>
    );
};

export default EmpProfile;
