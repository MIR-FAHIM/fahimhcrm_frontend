// Full EmpProfile Page with Error Handling and Code Cleanup

import React, { useState, useEffect } from "react";
import {
  Box, Typography, CircularProgress, Paper, Tabs, Tab,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

import {
  getProfile, uploadProfileImage, logOut, updateProfile,
  modulePermission, changePassController, getUserActivity
} from "../../../api/controller/admin_controller/user_controller";

import { getAttendanceReportByUser } from "../../../api/controller/admin_controller/attendance_controller";
import { image_file_url } from "../../../api/config/index";
import ProfileComponent from "./profile_components/profile_components";
import TaskComponents from "./profile_components/task_components";
import UserActivityList from "../user_activity_track/user_activity_track";
import AttendanceCountReport from "./profile_components/attendance_count_report";
import AttendanceReport from "./profile_components/attendance_emp_report";
import { useProfile } from '../../provider/profile_context';

const EmpProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const userID = localStorage.getItem("userId");

  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [year, setYear] = useState(new Date().getFullYear()); // Default to current year
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Default to current month
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [permissions, setPermissions] = useState({});
  const { userProfileData, setUserProfileData } = useProfile();

  useEffect(() => {
    handleGetModulePermission();
    fetchProfile();
    handleUserActivity();
  }, [id]);

  const handleGetModulePermission = async () => {
    try {
      const response = await modulePermission();
      if (response.status === 'success') {
        setPermissions(response.permissions);
      }
    } catch (err) {
      console.error("Permission fetch error:", err);
    }
  };

  const fetchProfile = async () => {
    console.log('user profile id', id);
    setLoading(true);
    try {
      const response = await getProfile(id);
      setProfileData(response.data || {});
      const photoPath = response?.data?.photo ?? "";
      setImageUrl(photoPath ? `${image_file_url}/${photoPath}` : "https://placehold.co/200x300/CCCCCC/FFFFFF?text=No+Image");
    } catch (err) {
      setError("Failed to fetch profile data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserActivity = async () => {
    try {
      const response = await getUserActivity(id);
      if (response.status === "success") {
        setActivityData(response.data.data);
      } else {
        setError("Failed to fetch user activity");
      }
    } catch (err) {
      setError("Error fetching user activity");
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await logOut(userID);
      if (res?.status === 'success') {
        setUserProfileData(null);
        navigate('/login');
      } else {
        alert("Logout failed");
      }
    } catch (err) {
      alert("Logout error");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select an image!");
    try {
      const response = await uploadProfileImage({ user_id: userID, photo: selectedFile });
      if (response) {
        alert("Image uploaded successfully!");
        const updatedProfile = await getProfile(userID);
        setProfileData(updatedProfile.data);
        setImageUrl(`${image_file_url}/${updatedProfile.data.photo}`);
      } else {
        alert("Image upload failed!");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Something went wrong while uploading.");
    }
  };

  const handleUpdateProfileData = async (data) => {
    try {
      const response = await updateProfile(data);
      if (response) {
        alert("Profile updated successfully!");
        const updatedProfile = await getProfile(userID);
        setProfileData(updatedProfile.data);
      } else {
        alert("Update failed!");
      }
    } catch (err) {
      alert("Update error");
    }
  };

  const handleChangePass = async (data) => {
    try {
      const response = await changePassController(data);
      if (response.status === "success") {
        alert(response.message);
      } else {
        alert(response.message || "Password update failed.");
      }
    } catch (err) {
      alert("Password change error");
    }
  };

  const fetchAttendance = async (userIdToFetch, selectedMonth, selectedYear) => {
    if (!userIdToFetch) {
      console.warn("User ID is not available to fetch attendance.");
      setAttendanceData([]);
      return;
    }
    setAttendanceLoading(true);
    try {
      const response = await getAttendanceReportByUser({ user_id: userIdToFetch, month: selectedMonth, year: selectedYear });
      setAttendanceData(response.dates || []);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setAttendanceData([]);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 1 && profileData?.id) {
      fetchAttendance(profileData.id, month, year);
    }
  };

  const handleMonthChange = (e) => {
    const selectedMonth = parseInt(e.target.value);
    setMonth(selectedMonth);
    if (activeTab === 1) {
      fetchAttendance(profileData?.id, selectedMonth, year);
    }
  };

  const handleYearChange = (e) => {
    const selectedYear = parseInt(e.target.value);
    setYear(selectedYear);
    if (activeTab === 1) {
      fetchAttendance(profileData?.id, month, selectedYear);
    }
  };

  const handleNavigationMap = (lat, lng) => {
    if (lat && lng) {
      navigate(`/google-map?lat=${lat}&lng=${lng}`);
    } else {
      alert('Location data not available.');
    }
  };

  return (
    <Box p={3}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
          <CircularProgress size={60} />
          <Typography variant="h6" ml={2}>Loading profile data...</Typography>
        </Box>
      ) : (
        <Paper sx={{ padding: 3, borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>

          {error && (
            <Typography color="error" mb={2} variant="h6" textAlign="center">{error}</Typography>
          )}

          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            centered
            sx={{
              mb: 3,
              '.MuiTabs-indicator': { backgroundColor: '#1976d2' },
              '.MuiTab-root': {
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '1rem',
                color: '#607d8b',
                '&.Mui-selected': {
                  color: '#1976d2',
                },
              },
            }}
          >
            <Tab label="General Information" />
            <Tab label="Attendance(Month)" />
            <Tab label="Attendance Report" />
            {permissions.task && <Tab label="Tasks" />}
            {permissions.activity && <Tab label="Activity" />}
          </Tabs>

          {activeTab === 0 && profileData && (
            <ProfileComponent
              handleUpdateData={handleUpdateProfileData}
              changePass={handleChangePass}
              handleFileChange={(e) => setSelectedFile(e.target.files[0])}
              handleUpload={handleUpload}
              profileData={profileData}
              userID={userID}
              handleLogout={handleLogout}
              imageUrl={imageUrl}
            />
          )}

          {activeTab === 1 && (
            <Box mt={3}> {/* This Box wrapper resolves the error */}
              <AttendanceReport
              name = {profileData.name}
                month={month}
                year={year}
                attendanceData={attendanceData}
                loading={attendanceLoading}
                handleMonthChange={handleMonthChange}
                handleYearChange={handleYearChange}
                handleNavigationMap={handleNavigationMap}
              />
            </Box>
          )}
          {activeTab === 2 && (
            <Box mt={3}> {/* This Box wrapper resolves the error */}
              <AttendanceCountReport
              userId = {id}
             name = {profileData.name}
               
              />
            </Box>
          )}

          {activeTab === 3 && permissions.task && <TaskComponents user={id} refreshTrigger={activeTab}/>}
          {activeTab === 4 && permissions.activity && <UserActivityList data={activityData} />}
        </Paper>
      )}
    </Box>
  );
};

export default EmpProfile;
