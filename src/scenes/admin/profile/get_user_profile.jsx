// Full EmpProfile Page with Error Handling and Code Cleanup

import React, { useState, useEffect, useMemo } from "react";
import {
  Alert, Avatar, Box, Chip, CircularProgress, Paper, Snackbar, Stack, Tab, Tabs, Typography, useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import HistoryIcon from "@mui/icons-material/History";
import BadgeIcon from "@mui/icons-material/Badge";
import ApartmentIcon from "@mui/icons-material/Apartment";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import { useParams, useNavigate } from "react-router-dom";

import {
  getProfile, uploadProfileImage, logOut, updateProfile,
  modulePermission, changePassController, getUserActivity,
  changeEmployeeRole, changeEmployeeDepartment, changeEmployeeDesignation,
  updateEmployeeInfo
} from "../../../api/controller/admin_controller/user_controller";

import { fetchAttendanceMethods, getAttendanceReportByUser } from "../../../api/controller/admin_controller/attendance_controller";
import { fetchDepartment, fetchDesignation, fetchRole } from "../../../api/controller/admin_controller/department_controller";
import { resolveAttendanceMethodList } from "../setting/attendance_method_utils";
import { image_file_url } from "../../../api/config/index";
import ProfileComponent from "./profile_components/profile_components";
import TaskComponents from "./profile_components/task_components";
import UserActivityList from "../user_activity_track/user_activity_track";
import AttendanceCountReport from "./profile_components/attendance_count_report";
import AttendanceReport from "./profile_components/attendance_emp_report";
import { useProfile } from '../../provider/profile_context';

const EmpProfile = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const userID = localStorage.getItem("userId");
  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;
  const brandDark = theme.palette.blueAccent?.dark ?? theme.palette.primary.dark;

  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [activeTab, setActiveTab] = useState("general");
  const [year, setYear] = useState(new Date().getFullYear()); // Default to current year
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Default to current month
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [permissions, setPermissions] = useState({});
  const { userProfileData, setUserProfileData } = useProfile();
  const isSuperAdmin = userProfileData?.role?.role_name === "Super Admin";

  const [roleOptions, setRoleOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [attendanceMethodOptions, setAttendanceMethodOptions] = useState([]);
  const [assignmentValues, setAssignmentValues] = useState({ role_id: "", department_id: "", designation_id: "", attendance_method_id: "" });
  const [assignmentSaving, setAssignmentSaving] = useState({ role: false, department: false, designation: false, attendanceMethod: false });
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  const getInitials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "BT";

  const tabItems = useMemo(() => {
    const tabs = [
      { value: "general", label: "Profile", icon: <PersonOutlineIcon fontSize="small" /> },
      { value: "attendance-month", label: "Monthly Attendance", icon: <CalendarMonthIcon fontSize="small" /> },
      { value: "attendance-summary", label: "Attendance Summary", icon: <AssessmentIcon fontSize="small" /> },
    ];

    if (permissions.task) {
      tabs.push({ value: "tasks", label: "Tasks", icon: <AssignmentTurnedInIcon fontSize="small" /> });
    }

    if (permissions.activity) {
      tabs.push({
        value: "activity",
        label: activityData.length ? `Activity (${activityData.length})` : "Activity",
        icon: <HistoryIcon fontSize="small" />,
      });
    }

    return tabs;
  }, [activityData.length, permissions.activity, permissions.task]);

  useEffect(() => {
    handleGetModulePermission();
    fetchProfile();
    handleUserActivity();
  }, [id]);

  useEffect(() => {
    if (!profileData) return;
    setAssignmentValues({
      role_id: String(profileData?.role_id || profileData?.role?.id || ""),
      department_id: String(profileData?.department_id || profileData?.department?.id || ""),
      designation_id: String(profileData?.designation_id || profileData?.designation?.id || ""),
      attendance_method_id: profileData?.attendance_method_id || profileData?.attendance_method?.id ? String(profileData?.attendance_method_id || profileData?.attendance_method?.id) : "",
    });
  }, [profileData]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    loadAssignmentOptions();
  }, [isSuperAdmin]);

  const showSnack = (msg, sev = "success") => setSnack({ open: true, msg, sev });

  const loadAssignmentOptions = async () => {
    setAssignmentLoading(true);
    try {
      const [roleRes, departmentRes, designationRes, attendanceMethodRes] = await Promise.all([
        fetchRole(),
        fetchDepartment(),
        fetchDesignation(),
        fetchAttendanceMethods(),
      ]);
      setRoleOptions(roleRes?.data || []);
      setDepartmentOptions(departmentRes?.data || []);
      setDesignationOptions(designationRes?.data || []);
      setAttendanceMethodOptions(resolveAttendanceMethodList(attendanceMethodRes));
    } catch (err) {
      console.error("Assignment options fetch error:", err);
      showSnack("Failed to load role, department, and designation options.", "error");
    } finally {
      setAssignmentLoading(false);
    }
  };

  const getErrorMessage = (error, fallback) =>
    error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;

  const refreshViewedProfile = async () => {
    const updatedProfile = await getProfile(id);
    setProfileData(updatedProfile.data || {});
    return updatedProfile.data || {};
  };

  const handleAssignmentValueChange = (field, value) => {
    if (!isSuperAdmin) return;
    setAssignmentValues((current) => ({ ...current, [field]: value }));
  };

  const handleAssignmentSave = async (type) => {
    if (!isSuperAdmin || !profileData?.id) {
      showSnack("Only Super Admin can update employee assignments.", "error");
      return;
    }

    const configs = {
      role: {
        field: "role_id",
        payloadKey: "role_id",
        label: "role",
        request: changeEmployeeRole,
        previous: String(profileData?.role_id || profileData?.role?.id || ""),
      },
      department: {
        field: "department_id",
        payloadKey: "department_id",
        label: "department",
        request: changeEmployeeDepartment,
        previous: String(profileData?.department_id || profileData?.department?.id || ""),
      },
      designation: {
        field: "designation_id",
        payloadKey: "designation_id",
        label: "designation",
        request: changeEmployeeDesignation,
        previous: String(profileData?.designation_id || profileData?.designation?.id || ""),
      },
    };

    const config = configs[type];
    const selectedValue = assignmentValues[config.field];
    if (!selectedValue) {
      showSnack(`Select a ${config.label} first.`, "warning");
      return;
    }

    setAssignmentSaving((current) => ({ ...current, [type]: true }));
    try {
      await config.request(profileData.id, { [config.payloadKey]: selectedValue });
      await refreshViewedProfile();
      showSnack(`Employee ${config.label} updated successfully.`);
    } catch (err) {
      console.error(`Failed to update ${config.label}:`, err);
      setAssignmentValues((current) => ({ ...current, [config.field]: config.previous }));
      showSnack(getErrorMessage(err, `Failed to update employee ${config.label}.`), "error");
    } finally {
      setAssignmentSaving((current) => ({ ...current, [type]: false }));
    }
  };

  const handleAttendanceMethodSave = async () => {
    if (!isSuperAdmin || !profileData?.id) {
      showSnack("Only Super Admin can update attendance method assignment.", "error");
      return;
    }

    const previous = profileData?.attendance_method_id || profileData?.attendance_method?.id ? String(profileData?.attendance_method_id || profileData?.attendance_method?.id) : "";
    const selectedValue = assignmentValues.attendance_method_id || null;

    setAssignmentSaving((current) => ({ ...current, attendanceMethod: true }));
    try {
      await updateEmployeeInfo({
        user_id: profileData.id,
        attendance_method_id: selectedValue ? Number(selectedValue) : null,
      });
      await refreshViewedProfile();
      showSnack("Employee attendance method updated successfully.");
    } catch (err) {
      console.error("Failed to update attendance method:", err);
      setAssignmentValues((current) => ({ ...current, attendance_method_id: previous }));
      showSnack(getErrorMessage(err, "Failed to update employee attendance method."), "error");
    } finally {
      setAssignmentSaving((current) => ({ ...current, attendanceMethod: false }));
    }
  };

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
        const updatedProfile = await getProfile(id);
        setProfileData(updatedProfile.data);
        const photoPath = updatedProfile?.data?.photo ?? "";
        setImageUrl(photoPath ? `${image_file_url}/${photoPath}` : "https://placehold.co/200x300/CCCCCC/FFFFFF?text=No+Image");
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
    if (newValue === "attendance-month" && profileData?.id) {
      fetchAttendance(profileData.id, month, year);
    }
  };

  const handleMonthChange = (e) => {
    const selectedMonth = parseInt(e.target.value);
    setMonth(selectedMonth);
    if (activeTab === "attendance-month") {
      fetchAttendance(profileData?.id, selectedMonth, year);
    }
  };

  const handleYearChange = (e) => {
    const selectedYear = parseInt(e.target.value);
    setYear(selectedYear);
    if (activeTab === "attendance-month") {
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
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: theme.palette.background.default, minHeight: "100vh", overflowX: "hidden" }}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="72vh">
          <Paper
            elevation={0}
            sx={{
              width: "min(720px, 100%)",
              p: 4,
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              textAlign: "center",
            }}
          >
            <CircularProgress size={44} sx={{ color: brand, mb: 2 }} />
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
              Loading employee profile
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Preparing profile, attendance, task, and activity sections.
            </Typography>
          </Paper>
        </Box>
      ) : (
        <Box sx={{ maxWidth: 1280, mx: "auto" }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 2.5 },
              mb: 2,
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              background:
                theme.palette.mode === "dark"
                  ? `linear-gradient(135deg, ${alpha(brand, 0.18)}, ${alpha(theme.palette.background.paper, 0.98)} 46%)`
                  : `linear-gradient(135deg, ${alpha(brand, 0.10)}, ${theme.palette.background.paper} 48%)`,
            }}
          >
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  src={imageUrl || undefined}
                  sx={{
                    width: 58,
                    height: 58,
                    bgcolor: alpha(brand, 0.16),
                    color: brand,
                    border: `1px solid ${alpha(brand, 0.28)}`,
                    fontWeight: 700,
                  }}
                >
                  {getInitials(profileData?.name)}
                </Avatar>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 700, lineHeight: 1.05 }}>
                      Employee Profile
                    </Typography>
                    <Chip size="small" label={`ID #${profileData?.id || id}`} sx={{ fontWeight: 600, bgcolor: alpha(brand, 0.12), color: brand }} />
                  </Stack>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
                    Manage {profileData?.name || "employee"} information, attendance, work, and activity from one place.
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip icon={<BadgeIcon />} label={profileData?.role?.role_name || "Role not set"} variant="outlined" />
                <Chip icon={<ApartmentIcon />} label={profileData?.department?.department_name || "Department not set"} variant="outlined" />
                <Chip icon={<WorkOutlineIcon />} label={profileData?.designation?.designation_name || "Designation not set"} variant="outlined" />
              </Stack>
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              mb: 2,
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden",
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                px: 1,
                minHeight: 64,
                ".MuiTabs-indicator": {
                  height: 3,
                  borderRadius: 999,
                  backgroundColor: brand,
                },
                ".MuiTabs-flexContainer": { gap: 0.5 },
                ".MuiTab-root": {
                  minHeight: 64,
                  textTransform: "none",
                  fontWeight: 650,
                  color: theme.palette.text.secondary,
                  borderRadius: 1.5,
                  px: { xs: 1.5, sm: 2 },
                  "&:hover": {
                    bgcolor: alpha(brand, 0.08),
                    color: theme.palette.text.primary,
                  },
                  "&.Mui-selected": {
                    color: brandDark,
                    bgcolor: alpha(brand, 0.10),
                  },
                },
              }}
            >
              {tabItems.map((item) => (
                <Tab key={item.value} value={item.value} icon={item.icon} iconPosition="start" label={item.label} />
              ))}
            </Tabs>
          </Paper>

          <Box sx={{ minWidth: 0 }}>
          {activeTab === "general" && profileData && (
            <ProfileComponent
              handleUpdateData={handleUpdateProfileData}
              changePass={handleChangePass}
              handleFileChange={(e) => setSelectedFile(e.target.files[0])}
              handleUpload={handleUpload}
              profileData={profileData}
              userID={userID}
              canManageProfile={Boolean(permissions.employee)}
              handleLogout={handleLogout}
              imageUrl={imageUrl}
              isSuperAdmin={isSuperAdmin}
              assignmentOptions={{ roles: roleOptions, departments: departmentOptions, designations: designationOptions }}
              attendanceMethodOptions={attendanceMethodOptions}
              assignmentValues={assignmentValues}
              assignmentLoading={assignmentLoading}
              assignmentSaving={assignmentSaving}
              onAssignmentChange={handleAssignmentValueChange}
              onAssignmentSave={handleAssignmentSave}
              onAttendanceMethodSave={handleAttendanceMethodSave}
            />
          )}

          {activeTab === "attendance-month" && (
            <Box mt={2}>
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
          {activeTab === "attendance-summary" && (
            <Box mt={2}>
              <AttendanceCountReport
              userId = {id}
             name = {profileData.name}
               
              />
            </Box>
          )}

          {activeTab === "tasks" && permissions.task && <TaskComponents user={id} refreshTrigger={activeTab}/>}
          {activeTab === "activity" && permissions.activity && <UserActivityList data={activityData} />}
          </Box>
        </Box>
      )}
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((state) => ({ ...state, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.sev} sx={{ width: "100%" }} onClose={() => setSnack((state) => ({ ...state, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmpProfile;
