// Full EmpProfile Page with Error Handling and Code Cleanup

import React, { useState, useEffect, useMemo, useRef, useContext } from "react";
import {
  Alert, Avatar, Box, Button, Chip, CircularProgress, Paper, Snackbar, Stack, Tab, Tabs, Typography, useTheme,
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
  getProfile, uploadProfileImage, logOut,
  modulePermission, changePassController, getUserActivity,
  updateEmployeeInfo
} from "../../../api/controller/admin_controller/user_controller";

import { fetchAttendanceMethods, getAttendanceReportByUser } from "../../../api/controller/admin_controller/attendance_controller";
import { fetchDepartment, fetchDesignation, fetchRole } from "../../../api/controller/admin_controller/department_controller";
import { resolveAttendanceMethodList } from "../setting/attendance_method_utils";
import ProfileComponent from "./profile_components/profile_components";
import TaskComponents from "./profile_components/task_components";
import UserActivityList from "../user_activity_track/user_activity_track";
import AttendanceCountReport from "./profile_components/attendance_count_report";
import AttendanceReport from "./profile_components/attendance_emp_report";
import { useProfile } from '../../provider/profile_context';
import { ColorModeContext } from "../../../theme";
import {
  ATTENDANCE_FIELDS, EMPLOYMENT_FIELDS, PERSONAL_FIELDS, PREFERENCE_FIELDS,
  assertProfileSuccess, profileErrorMessage, resolveProfilePhoto,
} from "./profile_edit_utils";

const EmpProfile = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const viewedId = useRef(id);
  viewedId.current = id;
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
  const { setColorMode } = useContext(ColorModeContext);
  const isSuperAdmin = userProfileData?.role?.role_name === "Super Admin";
  const canManageProfile = isSuperAdmin || (
    Number(userProfileData?.role_id ?? userProfileData?.role?.id) === 2 && Boolean(permissions.employee)
  );
  const canEditProfile = canManageProfile || String(userID) === String(profileData?.id);

  const [roleOptions, setRoleOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [attendanceMethodOptions, setAttendanceMethodOptions] = useState([]);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");
  const [uploading, setUploading] = useState(false);
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
    if (canManageProfile) loadAssignmentOptions();
  }, [canManageProfile]);

  const showSnack = (msg, sev = "success") => setSnack({ open: true, msg, sev });

  const loadAssignmentOptions = async () => {
    setAssignmentLoading(true);
    setAssignmentError("");
    const requests = [
      [fetchRole, setRoleOptions, "roles"],
      [fetchDepartment, setDepartmentOptions, "departments"],
      [fetchDesignation, setDesignationOptions, "designations"],
      [fetchAttendanceMethods, setAttendanceMethodOptions, "attendance methods"],
    ];
    const results = await Promise.allSettled(requests.map(([request]) => request()));
    const failures = [];
    results.forEach((result, index) => {
      const [, setOptions, label] = requests[index];
      const response = result.status === "fulfilled" ? result.value : null;
      const list = resolveAttendanceMethodList(response);
      if (!response || (response.status && response.status !== "success") ||
          (!Array.isArray(response?.data) && !Array.isArray(response?.data?.data))) {
        failures.push(profileErrorMessage(result.reason ?? response, `Failed to load ${label}.`));
      } else {
        setOptions(list);
      }
    });
    if (failures.length) setAssignmentError(failures.join(" "));
    setAssignmentLoading(false);
  };

  const applyViewedProfile = (profile) => {
    setProfileData(profile);
    setImageUrl(resolveProfilePhoto(profile.photo));
    if (String(profile.id) === String(userID)) setUserProfileData(profile);
  };

  const refreshViewedProfile = async () => {
    const response = await getProfile(id, navigate);
    if (String(viewedId.current) !== String(id)) return null;
    assertProfileSuccess(response, "Failed to load employee profile.");
    if (!response.data?.id) throw new Error("Employee profile was not found.");
    applyViewedProfile(response.data);
    return response.data;
  };

  const refreshAfterSave = async () => {
    window.dispatchEvent(new Event("employee-profile-updated"));
    try {
      await refreshViewedProfile();
    } catch (err) {
      showSnack(profileErrorMessage(err, err.message || "Saved, but profile refresh failed. Please reload."), "warning");
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
    setLoading(true);
    setError(null);
    setProfileData(null);
    setSelectedFile(null);
    setActiveTab("general");
    setActivityData([]);
    try {
      await refreshViewedProfile();
    } catch (err) {
      if (String(viewedId.current) === String(id)) setError(profileErrorMessage(err, err.message || "Failed to fetch profile data."));
    } finally {
      if (String(viewedId.current) === String(id)) setLoading(false);
    }
  };
  const handleUserActivity = async () => {
    try {
      const response = await getUserActivity(id);
      if (String(viewedId.current) !== String(id)) return;
      if (response.status === "success") {
        const activity = response.data?.data ?? response.data;
        setActivityData(Array.isArray(activity) ? activity : []);
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
    if (!canEditProfile || !profileData?.id || uploading) return;
    if (!selectedFile) {
      showSnack("Please select a photo first.", "warning");
      return;
    }
    if (!selectedFile.type.startsWith("image/")) {
      showSnack("Please select an image file.", "error");
      return;
    }
    setUploading(true);
    try {
      const response = await uploadProfileImage({ user_id: Number(profileData.id), photo: selectedFile });
      assertProfileSuccess(response, "Failed to upload profile photo.");
      setSelectedFile(null);
      showSnack(response.message || "Photo uploaded successfully.");
      await refreshAfterSave();
    } catch (err) {
      showSnack(profileErrorMessage(err, err.message || "Failed to upload profile photo."), "error");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfileData = async (data) => {
    if (!canEditProfile || !profileData?.id) throw new Error("You cannot edit this employee.");
    const allowedFields = [
      ...PERSONAL_FIELDS, ...PREFERENCE_FIELDS,
      ...(canManageProfile ? [...ATTENDANCE_FIELDS, "isActive"] : []),
      ...(isSuperAdmin ? EMPLOYMENT_FIELDS : []),
    ];
    const payload = { user_id: Number(profileData.id) };
    for (const field of allowedFields) {
      if (Object.hasOwn(data, field) && data[field] !== undefined && data[field] !== "undefined") {
        payload[field] = data[field];
      }
    }
    if (Object.keys(payload).length === 1) throw new Error("No editable changes to save.");
    try {
      const response = await updateEmployeeInfo(payload);
      assertProfileSuccess(response, "Failed to update employee information.");
      if (String(profileData.id) === String(userID) && typeof payload.is_dark_mode === "boolean") {
        setColorMode(payload.is_dark_mode ? "dark" : "light");
      }
      if (String(viewedId.current) === String(id)) {
        setProfileData((current) => ({ ...current, ...payload, id: current.id }));
      }
      showSnack(response.message || "Employee information saved.");
      await refreshAfterSave();
    } catch (err) {
      err.message = profileErrorMessage(err, err.message || "Failed to update employee information.");
      showSnack(err.message, "error");
      throw err;
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
      ) : !profileData ? (
        <Alert severity="error" action={<Button color="inherit" onClick={fetchProfile}>Retry</Button>}>
          {error || "Employee profile was not found."}
        </Alert>
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
              canManageProfile={canManageProfile}
              handleLogout={handleLogout}
              imageUrl={imageUrl}
              isSuperAdmin={isSuperAdmin}
              assignmentOptions={{ roles: roleOptions, departments: departmentOptions, designations: designationOptions }}
              attendanceMethodOptions={attendanceMethodOptions}
              assignmentLoading={assignmentLoading}
              assignmentError={assignmentError}
              onRetryOptions={loadAssignmentOptions}
              uploading={uploading}
              selectedFile={selectedFile}
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
