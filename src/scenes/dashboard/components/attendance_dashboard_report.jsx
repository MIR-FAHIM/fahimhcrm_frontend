import { Link, useNavigate } from "react-router-dom";
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
  LocationOnOutlined,
  LogoutOutlined,
  AccessTimeOutlined,
  DownloadOutlined,
  Email,
  PersonAdd,
  PointOfSale,
  Traffic,
  Warning,
  BusinessCenter,
  People,
  Work,
  Construction,
  Task,
  Badge,
  HomeWork, // Icon for Work From Home
  LocationOn,
  CheckBoxRounded, // Icon for Field
} from "@mui/icons-material";
import { tokens } from "../../../theme";

function DashboardAttendanceReport({ dashboardReport }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)"); // For responsive layout

  const navigate = useNavigate();

  const activityColors = {
    absent: "#fee2e2", // light red for absent
    late: "#fef3c7", // light yellow for late
    workingHours: "#dcfce7", // light green for working hours
    wfh: "#e0f2fe", // light blue for work from home
    field: "#ede9fe", // light purple for field
  };

  const attendanceData = [
    {
      label: "Present",
      value: dashboardReport.present,
      icon: <CheckBoxRounded sx={{ fontSize: 40 }} />,
      color: activityColors.workingHours,
    },
    {
      label: "Absent",
      value: dashboardReport.absent_count,
      icon: <Warning sx={{ fontSize: 40 }} />,
      color: activityColors.absent,
    },
    {
      label: "Late",
      value: dashboardReport.late_count,
      icon: <AccessTimeOutlined sx={{ fontSize: 40 }} />,
      color: activityColors.late,
    },
    
    {
      label: "WFH",
      value: dashboardReport.work_from_home_count,
      icon: <HomeWork sx={{ fontSize: 40 }} />,
      color: activityColors.wfh,
    },
    {
      label: "Field",
      value: dashboardReport.work_from_home_count, // Assuming a field_count exists in dashboardReport
      icon: <LocationOn sx={{ fontSize: 40 }} />,
      color: activityColors.field,
    },
  ];

  return (
    <Box m="20px">
      <Box
        display="grid"
        gridTemplateColumns={isNonMobile ? "repeat(5, 1fr)" : "repeat(auto-fit, minmax(150px, 1fr))"}
        gap="20px"
        p={2}
        borderRadius="8px"
        boxShadow={3} // Increased shadow for better visual depth
        sx={{
          backgroundColor: colors.primary[400],
        }}
      >
        {attendanceData.map((data, index) => (
          <Box
            key={index}
            sx={{
              backgroundColor: data.color,
              p: 2,
              borderRadius: '8px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minWidth: '150px', // Ensure a minimum width for each card
              height: '140px', // Slightly increased height for better spacing
              boxShadow: 1, // Individual card shadow
              transition: 'transform 0.2s ease-in-out', // Add a subtle hover effect
              '&:hover': {
                transform: 'scale(1.03)',
              },
            }}
          >
            {data.icon}
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ mt: 1, color: colors.grey }} // Adjusted text color for readability
            >
              {data.label}: {data.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default DashboardAttendanceReport;