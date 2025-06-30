import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { google_map_key } from "../../api/config/index";
import { Link, useNavigate } from "react-router-dom";
import { dashBoardReport, attendanceDashboardReportController } from "../../api/controller/admin_controller/user_controller";
import { fetchNotices } from "../../api/controller/admin_controller/report/report_controller";
import { requestAdjustment } from "../../api/controller/admin_controller/attendance_controller";
import ProspectReportMonthWise from "../admin/prospect/prospect_report";
import ReasonModal from './reason_modal';
import DashBetterRead from './components/dash_better_read';
import DashboardFirstRow from './components/first_row_of_count';
import DashboardAttendanceReport from './components/attendance_dashboard_report';
import AnimatedButton from './components/checkinout_button';
import NoticeBoard from './components/notice_board';
import AdjustTimeModal from './components/adjust_time_modal';

import {
  Box,
  Button,
  IconButton,
  Typography,
  useMediaQuery,
  Stack,
  Snackbar,
  useTheme,
} from "@mui/material";
import {
  Header,
  StatBox,
  LineChart,
  ProgressCircle,
  BarChart,
  GeographyChart,
} from "../../components";
import {
  LocationOnOutlined, LogoutOutlined,
  AccessTimeOutlined,
  DownloadOutlined,
  Email,
  PersonAdd,
  PointOfSale,
  Traffic,
  Warning,
  BusinessCenter, // New icon for Prospects
  People, // New icon for Clients
  Work, // New icon for Projects
  Construction, // New icon for Project Phase
  Task, // New icon for Tasks
  Badge // New icon for Employee
} from "@mui/icons-material";
import { tokens } from "../../theme";
import { checkInNow, hasCheckedIn, checkOutNow, updateAttendance } from "../../api/controller/admin_controller/attendance_controller";
import { mockTransactions } from "../../data/mockData";
import { getTaskReportByUser } from "../../api/controller/admin_controller/task_controller/task_controller";
import { getReportText, fetchClients } from "../../api/controller/admin_controller/report/report_controller";
import { modulePermission } from "../../api/controller/admin_controller/user_controller";

// Replace with your API key

function Dashboard() {
  const userID = localStorage.getItem("userId");
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [address, setAddress] = useState("");
  const [taskReport, setTaskReport] = useState({});
  const [textReport, setTextReport] = useState({});
  const [permissions, setPermissions] = useState({});
  const [notices, setNotices] = useState([]);
  const [dashboardReport, setDashboardReport] = useState({});
  const [attendanceDashboardReport, setAttendanceDashboardReport] = useState({});
  const [showLateModal, setShowLateModal] = useState(false);
  const [showAdjust, setAdjust] = useState(false);
  const [reasonTitle, setReasonTitle] = useState('');
  const [testText, setTestText] = useState('');
  const [error, setError] = useState(null);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isXlDevices = useMediaQuery("(min-width: 1260px)");
  const isMdDevices = useMediaQuery("(min-width: 724px)");
  const isXsDevices = useMediaQuery("(max-width: 436px)");
  const [buttonClicks, setButtonClicks] = useState([]);
  const [isCheckIn, setIsCheckedIn] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState({});
  const [attendanceID, setAttendanceID] = useState(0);
  const [pressing, setPressing] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const activityColors = {
    general: "#fef3c7",   // light yellow
    task: "#e0f2fe",      // light blue
    call: "#fee2e2",      // light red
    email: "#ede9fe",     // light purple
    whatsapp: "#dcfce7",  // light green
    visit: "#fce7f3",     // light pink
    message: "#e2e8f0",   // default gray
    meeting: "#fff7ed",   // light orange
  };


  const handleCheckInOut = async () => {
if(permissions.task == false){

  setTestText("i am here");
  if (isCheckIn === false) {
      await handleCheckInWithoutLocation();

    } else {
      await handleCheckOutWithOutLocation();

    }
}else{
  setTestText("i am not here");
  if (isCheckIn === false) {
      await handleCheckIn();

    } else {
      await handleCheckOut();

    }
}
  
  }
  const handlePressStart = () => {
    setPressing(true);
    timerRef.current = setTimeout(async () => {

      if (isCheckIn === false) {
        await handleCheckIn();
        setPressing(false);
      } else {
        await handleCheckOut();
        setPressing(false);
      }

    }, 4000); // 4 seconds
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
    } catch (error) {
      console.error("Attendance update failed:", error);
      // Optionally show error feedback to user here
    }
  };
  const handleCheckIn = async () => {
    if (!location) {
      handleLatLon();
    }
    try {
      const response = await checkInNow({
        user_id: userID,
        check_in_time: "2025-03-11T05:47:10.000000Z",
        check_in_location: address,
        check_in_lat: location.lat,
        check_in_lon: location.lng,

      });
      if (response.status === 'success') {
        setAttendanceID(response.attendance.id);
        if (response.attendance.is_late === 1) {
          setReasonTitle("Add Your Late Reason.")
          setShowLateModal(true); // Show modal if late
        } else {
          navigate('/check-in-out');
        }

      } else {
        { errorMessage && <Snackbar open={errorMessage} message={errorMessage} /> }
      }
    } catch (e) {
      console.error("Check-in failed", e);
    }
  };
  const handleCheckInWithoutLocation = async () => {
    
    try {
      const response = await checkInNow({
        user_id: userID,
        check_in_time: "2025-03-11T05:47:10.000000Z",
        check_in_location: "No Address",
        check_in_lat: "23.78055764",
        check_in_lon: "90.42252348",

      });
      if (response.status === 'success') {
        setAttendanceID(response.attendance.id);
        if (response.attendance.is_late === 1) {
          setReasonTitle("Add Your Late Reason.")
          setShowLateModal(true); // Show modal if late
        } else {
          navigate('/check-in-out');
        }

      } else {
        { errorMessage && <Snackbar open={errorMessage} message={errorMessage} /> }
      }
    } catch (e) {
      console.error("Check-in failed", e);
    }
  };
  const handleRequestAdjustment = async (data) => {

    try {
      const response = await requestAdjustment(data);
      if (response.status === 'success') {
        alert('Request for time adjustmented stored');

      } else {
        { errorMessage && <Snackbar open={errorMessage} message={errorMessage} /> }
      }
    } catch (e) {
      console.error("Check-in failed", e);
    }
  };


  const handleLatLon = async () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });

          try {
            // Fetch address using Google Maps Geocoding API
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${google_map_key}`
            );
            const data = await response.json();

            if (data.status === "OK") {
              setAddress(data.results[0]?.formatted_address || "Address not found");
            } else {
              setAddress("Address not found");
            }
          } catch (err) {
            setError("Failed to fetch address");
          }
        },
        (error) => {
          setError(error.message);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  useEffect(() => {

    handleGetModulePermission();
    getAttendanceDashboardReport();
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });

          try {
            // Fetch address using Google Maps Geocoding API
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${google_map_key}`
            );
            const data = await response.json();

            if (data.status === "OK") {
              setAddress(data.results[0]?.formatted_address || "Address not found");
            } else {
              setAddress("Address not found");
            }
          } catch (err) {
            setError("Failed to fetch address");
          }
        },
        (error) => {
          setError('Location permission denied. Please enable location access in your browser settings, search for site settings then locations and remove the site name from not allowed and reload the site again.');
        }
      );
    } else {
      setAddress("Address not found");
      setError("Geolocation is not supported by your browser.");
    }

    // Fetch button click counts when the component mounts
    const taskReportUser = async () => {
      try {

        const response = await getTaskReportByUser(1);
        if (response.status === 'success') {
          setTaskReport(response.data); // Set the response data
        } else {

        }
      } catch (error) {

      } finally {

      }
    };



    const getDashboardReport = async () => {
      try {

        const response = await dashBoardReport();
        if (response.status === 'success') {
          setDashboardReport(response.data); // Set the response data
          const prospectData = [
            { label: 'Active Prospect', count: 10, color: activityColors.active },
            { label: 'Ongoing Prospect', count: 3, color: activityColors.ongoing },
            { label: 'Potential Prospect', count: 12, color: activityColors.potential },
          ];
        } else {

        }
      } catch (error) {

      } finally {

      }
    };


    const handleIsCheckedIN = async () => {
      try {
        const response = await hasCheckedIn(userID);
        if (response.status === 'success') {
          setIsCheckedIn(response.checked_in); // Set the response data
          setTodayAttendance(response.attendance);
        } else {

        }
      } catch (error) {

      } finally {

      }
    };
    taskReportUser();
    handleFectchNotices();
    getDashboardReport();
    handleIsCheckedIN();


  }, []);

  const handleNavigation = (lat, long) => {
    navigate(`/google-map?lat=${lat}&lng=${long}`);
  };
  const getAttendanceDashboardReport = async () => {
    try {

      const response = await attendanceDashboardReportController();
      if (response.status === 'success') {
        setAttendanceDashboardReport(response.data);
      } else {

      }
    } catch (error) {

    } finally {

    }
  };
  const handleGetTextReport = async () => {
    try {

      const response = await getReportText();
      if (response.status === 'success') {
        setTextReport(response.data); // Set the response data
      } else {

      }
    } catch (error) {

    } finally {

    }
  };
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
  const handleFectchNotices = async () => {
    try {

      const response = await fetchNotices();
      if (response.status === 'success') {
        setNotices(response.data); // Set the response data
      } else {

      }
    } catch (error) {

    } finally {

    }
  };
  // modal handle
  const handleLateSubmit = (reason) => {
    console.log("Late Reason Submitted:", reason);
    setLateReason(reason);
    // Optionally send to backend here
    navigate('/check-in-out');
  };

  const closeLateModal = () => {
    setShowLateModal(false);
  };

  const handleCheckOut = async () => {
    try {
      const response = await checkOutNow({
        user_id: userID,
        check_out_time: "2025-03-11T05:47:10.000000Z",
        check_out_location: address,
        check_out_lat: location.lat,
        check_out_lon: location.lng,
        attendance_id: todayAttendance.id,
      });
      if (response.status === 'success') {
        setAttendanceID(response.attendance.id);
        if (response.attendance.is_early_leave === 0) {

          setReasonTitle("Add Early Leave Reason.")
          setShowLateModal(true); // Show modal if late
        } else {
          navigate('/check-in-out');
        }

      }
    } catch (e) {
      console.error("Check-in failed", e);
    }
  };
  const handleCheckOutWithOutLocation = async () => {
    try {
      const response = await checkOutNow({
        user_id: userID,
        check_out_time: "2025-03-11T05:47:10.000000Z",
        check_out_location: "No Address",
        check_out_lat: "23.78055764",
        check_out_lon: "90.42252348",
        attendance_id: todayAttendance.id,
      });
      if (response.status === 'success') {
        setAttendanceID(response.attendance.id);
        if (response.attendance.is_early_leave === 0) {

          setReasonTitle("Add Early Leave Reason.")
          setShowLateModal(true); // Show modal if late
        } else {
          navigate('/check-in-out');
        }

      }
    } catch (e) {
      console.error("Check-in failed", e);
    }
  };


  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>

        <Header
          title={<Typography variant="h5">{testText}</Typography>}
          subtitle={
            <>
              <Typography variant="subtitle2" color="text.secondary">
                {isCheckIn
                  ? "Don’t forget to check out before leaving."
                  : "Please long press to check in to get started."}
              </Typography>



              {permissions.task && (
                <>
                  {address ? (
                    <Link
                      component="button"
                      onClick={(event) => {
                        event.preventDefault();
                        handleNavigation(todayAttendance?.check_in_lat, todayAttendance?.check_in_lon);
                      }}
                      underline="hover"
                      sx={{ mt: 1, display: 'inline-block' }}
                    >
                      <Typography variant="body2" color="primary">
                        {address}
                      </Typography>
                    </Link>
                  ) : (
                    <Typography variant="body2" color="red">
                      {error}
                    </Typography>
                  )}
                </>
              )}
            </>
          }

        />
        <AnimatedButton isCheckIn={isCheckIn}
          finalFunction={handleCheckInOut} />


      </Box>

      {showLateModal && (
        <ReasonModal
          title={reasonTitle}
          onSubmit={(reason) => {
            console.log("Late Reason:", reason);

            handleUpdateAttendance(reason);
            // maybe send API call here
            setShowLateModal(false);
            navigate('/check-in-out');
          }}
          onClose={() => setShowLateModal(false)}
        />
      )}


      {/* adjust time modal */}
      {showAdjust && (
        <AdjustTimeModal
          userId={userID}
          type={'in'}
          attendanceID={todayAttendance.id}
          onSubmit={(data) => {
            console.log("Late Reason:", data);

            handleRequestAdjustment(data);
            // maybe send API call here
            setAdjust(false);

          }}
          onClose={() => setAdjust(false)}
        />
      )}
      {/* New Full-Width Card */}
      {permissions.task && (
        <DashboardFirstRow dashboardReport={dashboardReport} />
      )}




      <Box sx={{ height: '20px' }}></Box>
      {/* 56   $2y$10$AmW5c5BsubqFpXDcPE7qFuJIozh365Ge1K1FAhLrg5BkAH0XIz.9e
72   $2y$10$xLmQGf4MEZHl22RFUbB8M.01XmxLC0VAMzlEzHP.l0k.q36MjsLk2 */}
      <Box
        display="grid"
        gridTemplateColumns={
          isXlDevices ? "repeat(12, 1fr)" :
            isMdDevices ? "repeat(6, 1fr)" :
              "repeat(3, 1fr)"
        }
        gap="20px"
      >
        {/* Left Box: Your existing full box */}
        <Box
          gridColumn="span 7"
          sx={{
            background: "#f9f9fb",
            p: 3,
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            minHeight: "200px",
          }}
        >
          <Box
            display="grid"
            gridTemplateColumns={
              isXlDevices
                ? "repeat(12, 1fr)"
                : isMdDevices
                  ? "repeat(6, 1fr)"
                  : "repeat(3, 1fr)"
            }
            gridAutoRows="140px"
            gap="20px"
            columnGap="20px"
            rowGap="40px"
          >
            <Box
              gridColumn="span 6"
              sx={{
                background: "#f9f9fb",
                p: 3,
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                transition: "0.3s ease-in-out",
                minHeight: "140px",
                "&:hover": {
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.12)",
                },
              }}
            >
              {isCheckIn && todayAttendance ? (
                <Stack spacing={2}>
                  {/* Check-in Time */}
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <AccessTimeOutlined sx={{ color: "#4caf50" }} />
                    <Typography fontSize="15px" fontWeight={600}>
                      Checked in:
                      <Typography component="span" sx={{ fontWeight: 500, ml: 1 }}>
                        {format(new Date(todayAttendance?.check_in_time), "EEEE, hh:mm a")}
                      </Typography>
                    </Typography>
                  </Stack>

                  {/* Check-in Location */}
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <LocationOnOutlined sx={{ color: "#42a5f5" }} />
                    <Link
                      component="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigation(todayAttendance?.check_in_lat, todayAttendance?.check_in_lon);
                      }}
                      underline="hover"
                    >
                      <Typography fontSize="14px" color="text.primary" sx={{ fontWeight: 500 }}>
                        {todayAttendance?.check_in_location}
                      </Typography>
                    </Link>

                  </Stack>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      bgcolor: "secondary.blue",
                      color: "#fff",
                      fontWeight: 400,
                      width: "40%",
                      px: 1,
                      py: 0.3,
                      borderRadius: "6px",
                      boxShadow: "none",
                      textTransform: "none",
                      fontSize: "13px",
                      "&:hover": {
                        bgcolor: "primary.dark",
                      },
                    }}
                    onClick={() => setAdjust(true)}
                  >
                    Adjust Time
                  </Button>
                </Stack>
              ) : (
                <Typography
                  variant="body1"
                  fontWeight="600"
                  color="error.main"
                  textAlign="center"
                >
                  You have not checked in yet. Please check in now.
                </Typography>
              )}
            </Box>

            <Box
              gridColumn="span 6"
              sx={{
                background: "#fdfefe",
                p: 3,
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                transition: "0.3s ease-in-out",
                minHeight: "140px",
                "&:hover": {
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.12)",
                },
              }}
            >
              {isCheckIn && todayAttendance ? (
                <Stack spacing={2}>
                  {todayAttendance?.check_out_time ? (
                    <>
                      {/* Check-out Time */}
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <LogoutOutlined sx={{ color: "#ef5350" }} />
                        <Typography fontSize="15px" fontWeight={600}>
                          Checked out:
                          <Typography component="span" sx={{ fontWeight: 500, ml: 1 }}>
                            {format(new Date(todayAttendance?.check_out_time), "EEEE, hh:mm a")}
                          </Typography>
                        </Typography>
                      </Stack>

                      {/* Check-out Location */}
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <LocationOnOutlined sx={{ color: "#42a5f5" }} />
                        <Link
                          component="button"
                          onClick={(event) => {
                            event.preventDefault();
                            handleNavigation(
                              todayAttendance?.check_out_lat,
                              todayAttendance?.check_out_lon
                            );
                          }}
                          underline="hover"
                        >
                          <Typography fontSize="14px" color="text.primary" sx={{ fontWeight: 500 }}>
                            {todayAttendance?.check_out_location}
                          </Typography>
                        </Link>
                      </Stack>
                    </>
                  ) : (
                    <Typography
                      variant="body1"
                      fontWeight={600}
                      color="warning.main"
                      textAlign="center"
                    >
                      Not checked out yet
                    </Typography>
                  )}
                </Stack>
              ) : (
                <Typography variant="body1" fontWeight={600} color="error.main" textAlign="center">
                  You have not checked in yet. Please check in now.
                </Typography>
              )}
            </Box>




          </Box>
        </Box>

        {/* Right Box: Notice Board */}
        <NoticeBoard notices={notices} />
      </Box>
      {permissions.dashboard && (
        <DashboardAttendanceReport dashboardReport={attendanceDashboardReport} />
      )}
      {permissions.task && (
        <DashBetterRead details={textReport} loadReport={handleGetTextReport} />
      )}


      <Box sx={{ height: '20px' }}></Box>

      {permissions.task && (
        <ProspectReportMonthWise />
      )}


    </Box>

  );
}

export default Dashboard;
