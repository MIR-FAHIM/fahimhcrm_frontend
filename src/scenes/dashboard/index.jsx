import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
  useTheme,
  Alert,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  AddTaskOutlined,
  AutoGraphOutlined,
  CalendarTodayOutlined,
  CloseRounded,
  GpsFixedRounded,
  GroupsOutlined,
  LocationOnOutlined,
  MapOutlined,
  NotificationsActiveOutlined,
  RefreshRounded,
  TaskAltOutlined,
  TodayOutlined,
  TrendingUpOutlined,
  WorkOutlineOutlined,
} from "@mui/icons-material";

import { google_map_key } from "../../api/config/index";
import {
  dashBoardReport,
  attendanceDashboardReportController,
  modulePermission,
  getProfile,
} from "../../api/controller/admin_controller/user_controller";
import { fetchNotices } from "../../api/controller/admin_controller/report/report_controller";
import {
  checkInNow,
  hasCheckedIn,
  checkOutNow,
  updateAttendance,
  requestAdjustment,
} from "../../api/controller/admin_controller/attendance_controller";
import { getReportText } from "../../api/controller/admin_controller/report/report_controller";
import ProspectReportMonthWise from "../admin/prospect/prospect_report";
import ReasonModal from "./reason_modal";
import DashBetterRead from "./components/dash_better_read";
import DashboardFirstRow from "./components/first_row_of_count";
import DashboardAttendanceReport from "./components/attendance_dashboard_report";
import AnimatedButton from "./components/checkinout_button";
import NoticeBoard from "./components/notice_board";
import AdjustTimeModal from "./components/adjust_time_modal";
import CheckInOutPanel from "./components/checkinout_panel_data";

const getNumeric = (value) => Number(value || 0);

const currentTimestamp = () => new Date().toISOString();

const hasScheduleValue = (value) => value !== null && value !== undefined && value !== "";

const isBeforeConfiguredEndTime = (profile) => {
  if (!hasScheduleValue(profile?.end_hour) || !hasScheduleValue(profile?.end_min)) {
    return false;
  }

  const endHour = Number(profile.end_hour);
  const endMin = Number(profile.end_min);
  if (!Number.isFinite(endHour) || !Number.isFinite(endMin)) return false;

  const now = new Date();
  const endTime = new Date();
  endTime.setHours(endHour, endMin, 0, 0);

  return now < endTime;
};

const SectionHeader = ({ title, subtitle, action }) => (
  <Box
    display="flex"
    alignItems={{ xs: "flex-start", sm: "center" }}
    justifyContent="space-between"
    flexDirection={{ xs: "column", sm: "row" }}
    gap={1.5}
    mb={1.5}
  >
    <Box>
      <Typography variant="h6" fontWeight={700} lineHeight={1.1}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          {subtitle}
        </Typography>
      )}
    </Box>
    {action}
  </Box>
);

const SmartMetric = ({ icon, label, value, tone = "primary", helper }) => {
  const theme = useTheme();
  const color = theme.palette[tone]?.main || theme.palette.primary.main;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        borderColor: alpha(color, 0.28),
        boxShadow: "none",
        minHeight: 118,
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              color,
              bgcolor: alpha(color, theme.palette.mode === "dark" ? 0.16 : 0.1),
              border: `1px solid ${alpha(color, 0.24)}`,
            }}
          >
            {icon}
          </Box>
          <Box minWidth={0}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {label}
            </Typography>
            <Typography variant="h5" fontWeight={700} lineHeight={1.1}>
              {value}
            </Typography>
          </Box>
        </Stack>
        {helper && (
          <Typography variant="body2" color="text.secondary" mt={1.25}>
            {helper}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const QuickAction = ({ icon, label, onClick, disabled }) => (
  <Button
    variant="outlined"
    startIcon={icon}
    onClick={onClick}
    disabled={disabled}
    sx={{
      justifyContent: "flex-start",
      borderRadius: 2,
      px: 1.5,
      py: 1.1,
      minHeight: 44,
      fontWeight: 600,
    }}
  >
    {label}
  </Button>
);

function Dashboard() {
  const userID = localStorage.getItem("userId");
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [location, setLocation] = useState({ lat: null, lng: null });
  const [address, setAddress] = useState("");
  const [textReport, setTextReport] = useState({});
  const [permissions, setPermissions] = useState({});
  const [notices, setNotices] = useState([]);
  const [dashboardReport, setDashboardReport] = useState({});
  const [attendanceDashboardReport, setAttendanceDashboardReport] = useState({});
  const [showLateModal, setShowLateModal] = useState(false);
  const [showAdjust, setAdjust] = useState(false);
  const [reasonTitle, setReasonTitle] = useState("");
  const [reasonMode, setReasonMode] = useState(null);
  const [pendingCheckout, setPendingCheckout] = useState(null);
  const [error, setError] = useState(null);
  const [isCheckIn, setIsCheckedIn] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [attendanceID, setAttendanceID] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "info" });

  const todayLabel = format(new Date(), "EEEE, MMM dd");

  const totalAttendance = useMemo(() => {
    const present = getNumeric(attendanceDashboardReport.present);
    const absent = getNumeric(attendanceDashboardReport.absent_count);
    return present + absent;
  }, [attendanceDashboardReport.present, attendanceDashboardReport.absent_count]);

  const attendanceRate = useMemo(() => {
    if (!totalAttendance) return 0;
    return Math.round((getNumeric(attendanceDashboardReport.present) / totalAttendance) * 100);
  }, [attendanceDashboardReport.present, totalAttendance]);

  const activeWorkdayText = useMemo(() => {
    if (!isCheckIn) return "Not checked in";
    if (todayAttendance?.check_out_time) return "Day completed";
    return "Workday active";
  }, [isCheckIn, todayAttendance?.check_out_time]);

  const headlineInsight = useMemo(() => {
    if (!isCheckIn) return "Start your day with check-in.";
    if (!todayAttendance?.check_out_time) return "You are checked in and ready for today's work.";
    return "Your attendance is closed for today.";
  }, [isCheckIn, todayAttendance?.check_out_time]);

  const locationText = useMemo(() => {
    if (address) return address;
    if (error) return error;
    return "Locating your current workspace...";
  }, [address, error]);

  const loadLocation = async () => {
    if (!("geolocation" in navigator)) {
      setAddress("Address not found");
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });

        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${google_map_key}`
          );
          const data = await response.json();
          setAddress(
            data.status === "OK"
              ? data.results[0]?.formatted_address || "Address not found"
              : "Address not found"
          );
          setError(null);
        } catch {
          setError("Failed to fetch address");
        }
      },
      () => {
        setError(
          "Location permission denied. Enable location access in browser site settings and reload the site."
        );
      }
    );
  };

  const loadDashboard = async ({ silent = false } = {}) => {
    if (!silent) setPageLoading(true);
    setRefreshing(true);

    try {
      const [
        permissionsRes,
        attendanceReportRes,
        dashboardRes,
        noticesRes,
        checkedRes,
        profileRes,
      ] = await Promise.allSettled([
        modulePermission(),
        attendanceDashboardReportController(),
        dashBoardReport(),
        fetchNotices(),
        hasCheckedIn(userID),
        getProfile(userID),
      ]);

      if (permissionsRes.status === "fulfilled" && permissionsRes.value?.status === "success") {
        setPermissions(permissionsRes.value.permissions || {});
      }

      if (
        attendanceReportRes.status === "fulfilled" &&
        attendanceReportRes.value?.status === "success"
      ) {
        setAttendanceDashboardReport(attendanceReportRes.value.data || {});
      }

      if (dashboardRes.status === "fulfilled" && dashboardRes.value?.status === "success") {
        setDashboardReport(dashboardRes.value.data || {});
      }

      if (noticesRes.status === "fulfilled" && noticesRes.value?.status === "success") {
        setNotices(noticesRes.value.data || []);
      }

      if (checkedRes.status === "fulfilled" && checkedRes.value?.status === "success") {
        setIsCheckedIn(Boolean(checkedRes.value.checked_in));
        setTodayAttendance(checkedRes.value.attendance || {});
      }

      if (profileRes.status === "fulfilled" && profileRes.value?.status === "success") {
        setUserProfile(profileRes.value.data || null);
      }
    } catch (loadError) {
      console.error("Dashboard load failed:", loadError);
      setSnack({
        open: true,
        message: "Dashboard data could not be refreshed.",
        severity: "error",
      });
    } finally {
      setPageLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLocation();
    loadDashboard();
  }, []);

  const handleNavigation = (lat, long) => {
    if (!lat || !long) return;
    navigate(`/google-map?lat=${lat}&lng=${long}`);
  };

  const handleGetTextReport = async () => {
    try {
      const response = await getReportText();
      if (response.status === "success") {
        setTextReport(response.data || {});
      }
    } catch {
      setSnack({
        open: true,
        message: "Business overview could not be loaded.",
        severity: "error",
      });
    }
  };

  const handleUpdateAttendance = async (reason) => {
    try {
      const data = {
        attendance_id: attendanceID,
        ...(!isCheckIn
          ? { late_reason: reason }
          : { early_leave_reason: reason }),
      };

      await updateAttendance(data);
    } catch (updateError) {
      console.error("Attendance update failed:", updateError);
      setSnack({
        open: true,
        message: "Attendance reason could not be saved.",
        severity: "error",
      });
    }
  };

  const handleRequestAdjustment = async (data) => {
    try {
      const response = await requestAdjustment(data);
      if (response.status === "success") {
        setSnack({
          open: true,
          message: "Time adjustment request has been submitted.",
          severity: "success",
        });
      }
    } catch (requestError) {
      console.error("Adjustment request failed:", requestError);
      setSnack({
        open: true,
        message: "Time adjustment request failed.",
        severity: "error",
      });
    }
  };

  const handleCheckIn = async ({ useLocation = true } = {}) => {
    try {
      const response = await checkInNow({
        user_id: userID,
        check_in_time: currentTimestamp(),
        check_in_location: useLocation ? address || "No Address" : "No Address",
        check_in_lat: useLocation ? location.lat : "23.78055764",
        check_in_lon: useLocation ? location.lng : "90.42252348",
      });

      if (response.status === "success") {
        setAttendanceID(response.attendance.id);
        if (response.attendance.is_late === 1) {
          setReasonMode("late");
          setPendingCheckout(null);
          setReasonTitle("Add your late reason");
          setShowLateModal(true);
        } else {
          navigate("/check-in-out");
        }
      }
    } catch (checkInError) {
      console.error("Check-in failed", checkInError);
      setSnack({ open: true, message: "Check-in failed.", severity: "error" });
    }
  };

  const submitCheckOut = async ({ useLocation = true, earlyLeaveReason = null } = {}) => {
    const attendanceId = todayAttendance?.id || attendanceID;
    if (!attendanceId) {
      setSnack({
        open: true,
        message: "No active attendance record found for checkout.",
        severity: "error",
      });
      return;
    }

    try {
      const response = await checkOutNow({
        user_id: userID,
        check_out_time: currentTimestamp(),
        check_out_location: useLocation ? address || "No Address" : "No Address",
        check_out_lat: useLocation ? location.lat : "23.78055764",
        check_out_lon: useLocation ? location.lng : "90.42252348",
        attendance_id: attendanceId,
        early_leave_reason: earlyLeaveReason || null,
      });

      if (response.status === "success") {
        setAttendanceID(response.attendance?.id || attendanceId);
        navigate("/check-in-out");
      }
    } catch (checkOutError) {
      console.error("Check-out failed", checkOutError);
      setSnack({ open: true, message: "Check-out failed.", severity: "error" });
    }
  };

  const handleCheckOut = async ({ useLocation = true } = {}) => {
    if (isBeforeConfiguredEndTime(userProfile)) {
      setPendingCheckout({ useLocation });
      setReasonMode("early_leave");
      setReasonTitle("Add early leave reason");
      setShowLateModal(true);
      return;
    }

    await submitCheckOut({ useLocation, earlyLeaveReason: null });
  };

  const handleCheckInOut = async () => {
    const canUseLocation = permissions.task !== false;

    if (isCheckIn === false) {
      await handleCheckIn({ useLocation: canUseLocation });
    } else {
      await handleCheckOut({ useLocation: canUseLocation });
    }
  };

  const quickActions = [
    permissions.task && {
      label: "Add task",
      icon: <AddTaskOutlined />,
      onClick: () => navigate("/add-task"),
    },
    permissions.task && {
      label: "My tasks",
      icon: <TaskAltOutlined />,
      onClick: () => navigate("/my-task-tab"),
    },
    permissions.prospect && {
      label: "Sales pipeline",
      icon: <TrendingUpOutlined />,
      onClick: () => navigate("/prospect-list-by-stage"),
    },
    permissions.task && {
      label: "Projects",
      icon: <WorkOutlineOutlined />,
      onClick: () => navigate("/project-list"),
    },
    permissions.prospect && {
      label: "Visit planner",
      icon: <MapOutlined />,
      onClick: () => navigate("/visit-plan"),
    },
  ].filter(Boolean);

  const summaryMetrics = [
    {
      label: "Workday",
      value: activeWorkdayText,
      helper: isCheckIn ? "Attendance is tracking today." : "Check in to begin tracking.",
      icon: <TodayOutlined fontSize="small" />,
      tone: isCheckIn ? "success" : "warning",
    },
    {
      label: "Attendance rate",
      value: `${attendanceRate}%`,
      helper: `${getNumeric(attendanceDashboardReport.present)} present of ${totalAttendance || 0}`,
      icon: <CalendarTodayOutlined fontSize="small" />,
      tone: attendanceRate >= 80 ? "success" : "warning",
    },
    {
      label: "Pipeline",
      value: getNumeric(dashboardReport.prospects),
      helper: `${getNumeric(dashboardReport.clients)} clients converted`,
      icon: <AutoGraphOutlined fontSize="small" />,
      tone: "info",
    },
    {
      label: "Team tasks",
      value: getNumeric(dashboardReport.tasks),
      helper: `${getNumeric(dashboardReport.projects)} active projects`,
      icon: <GroupsOutlined fontSize="small" />,
      tone: "primary",
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1800, mx: "auto" }}>
      {(pageLoading || refreshing) && (
        <LinearProgress
          sx={{
            mb: 2,
            borderRadius: 999,
            height: 6,
            bgcolor: alpha(theme.palette.primary.main, 0.12),
          }}
        />
      )}

      <Box
        sx={{
          borderRadius: 3,
          p: { xs: 2, md: 3 },
          mb: 3,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            isDark ? 0.16 : 0.1
          )}, ${alpha(theme.palette.success.main, isDark ? 0.1 : 0.08)})`,
        }}
      >
        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", lg: "1.35fr .65fr" }}
          gap={3}
          alignItems="center"
        >
          <Box minWidth={0}>
            <Stack direction="row" spacing={1} flexWrap="wrap" mb={1.5}>
              <Chip
                size="small"
                label={todayLabel}
                icon={<CalendarTodayOutlined />}
                sx={{ fontWeight: 600, bgcolor: alpha(theme.palette.primary.main, 0.12) }}
              />
              <Chip
                size="small"
                label={activeWorkdayText}
                color={isCheckIn ? "success" : "warning"}
                variant={isCheckIn ? "filled" : "outlined"}
                sx={{ fontWeight: 600 }}
              />
              {notices.length > 0 && (
                <Chip
                  size="small"
                  label={`${notices.length} notice${notices.length > 1 ? "s" : ""}`}
                  icon={<NotificationsActiveOutlined />}
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Stack>

            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: 28, md: 38 },
                fontWeight: 700,
                lineHeight: 1,
                color: theme.palette.text.primary,
              }}
            >
              Good day, workspace is ready.
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mt: 1.25, maxWidth: 760 }}
            >
              {headlineInsight}
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.25}
              alignItems={{ xs: "stretch", sm: "center" }}
              mt={2.5}
            >
              <AnimatedButton isCheckIn={isCheckIn} finalFunction={handleCheckInOut} />
              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshRounded />}
                onClick={() => loadDashboard({ silent: true })}
                disabled={refreshing}
                sx={{ borderRadius: 2, px: 2 }}
              >
                Refresh
              </Button>
              {todayAttendance?.check_in_lat && todayAttendance?.check_in_lon && (
                <Button
                  variant="outlined"
                  startIcon={<MapOutlined />}
                  onClick={() =>
                    handleNavigation(
                      todayAttendance.check_in_lat,
                      todayAttendance.check_in_lon
                    )
                  }
                  sx={{ borderRadius: 2, px: 2 }}
                >
                  Open map
                </Button>
              )}
            </Stack>
          </Box>

          <Card
            variant="outlined"
            sx={{
              borderRadius: 2,
              bgcolor: alpha(theme.palette.background.paper, 0.72),
              backdropFilter: "blur(8px)",
              borderColor: alpha(theme.palette.primary.main, 0.24),
              boxShadow: "none",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    color: theme.palette.primary.main,
                  }}
                >
                  <GpsFixedRounded />
                </Box>
                <Box minWidth={0} flex={1}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Current location
                  </Typography>
                  <Typography variant="body2" fontWeight={700} noWrap title={locationText}>
                    {locationText}
                  </Typography>
                </Box>
                <Tooltip title="Refresh location">
                  <IconButton onClick={loadLocation} size="small">
                    <LocationOnOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" color="text.secondary">
                Location is used for attendance check-in and check-out tracking.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          xl: "repeat(4, minmax(0, 1fr))",
        }}
        gap={2}
        mb={3}
      >
        {summaryMetrics.map((metric) => (
          <SmartMetric key={metric.label} {...metric} />
        ))}
      </Box>

      {quickActions.length > 0 && (
        <Box mb={3}>
          <SectionHeader
            title="Quick actions"
            subtitle="Jump into the workflows that usually need attention first."
          />
          <Box
            display="grid"
            gridTemplateColumns={{
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(5, minmax(0, 1fr))",
            }}
            gap={1.5}
          >
            {quickActions.map((action) => (
              <QuickAction key={action.label} {...action} />
            ))}
          </Box>
        </Box>
      )}

      {permissions.task && (
        <Box mb={3}>
          <SectionHeader
            title="Business snapshot"
            subtitle="Live module counts from the CRM and HRMS workspace."
          />
          <DashboardFirstRow dashboardReport={dashboardReport} />
        </Box>
      )}

      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", lg: "minmax(0, 1.35fr) minmax(320px, .65fr)" }}
        gap={2.5}
        alignItems="stretch"
        mb={3}
      >
        <Box minWidth={0}>
          <SectionHeader
            title="Workday control"
            subtitle="Review today's check-in, check-out, location, and adjustment status."
            action={
              permissions.attendance && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate("/check-in-out")}
                  sx={{ borderRadius: 2 }}
                >
                  Attendance page
                </Button>
              )
            }
          />
          <CheckInOutPanel
            isCheckIn={isCheckIn}
            todayAttendance={todayAttendance}
            onAdjust={() => setAdjust(true)}
            onNavigateToMap={(lat, lon) => handleNavigation(lat, lon)}
          />
        </Box>

        <Box minWidth={0}>
          <SectionHeader
            title="Notice board"
            subtitle="Latest internal announcements and reminders."
          />
          <NoticeBoard notices={notices} />
        </Box>
      </Box>

      {permissions.dashboard && (
        <Box mb={3}>
          <DashboardAttendanceReport dashboardReport={attendanceDashboardReport} />
        </Box>
      )}

      {permissions.prospect && (
        <Box mb={3}>
          <DashBetterRead details={textReport} loadReport={handleGetTextReport} />
        </Box>
      )}

      {permissions.prospect && <ProspectReportMonthWise />}

      {showLateModal && (
        <ReasonModal
          title={reasonTitle}
          onSubmit={async (reason) => {
            if (reasonMode === "early_leave" && pendingCheckout) {
              await submitCheckOut({ ...pendingCheckout, earlyLeaveReason: reason });
            } else {
              await handleUpdateAttendance(reason);
              navigate("/check-in-out");
            }
          }}
          onClose={() => {
            setShowLateModal(false);
            setReasonMode(null);
            setPendingCheckout(null);
          }}
        />
      )}

      {showAdjust && (
        <AdjustTimeModal
          open={showAdjust}
          userId={userID}
          type="in"
          attendanceID={todayAttendance.id}
          onSubmit={handleRequestAdjustment}
          onClose={() => setAdjust(false)}
        />
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={2800}
        onClose={() => setSnack((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={() => setSnack((current) => ({ ...current, open: false }))}
            >
              <CloseRounded fontSize="small" />
            </IconButton>
          }
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Dashboard;
