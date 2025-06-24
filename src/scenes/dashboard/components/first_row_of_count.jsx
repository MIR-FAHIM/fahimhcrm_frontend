
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
import { tokens } from "../../../theme";


// Replace with your API key

function DashboardFirstRow({dashboardReport}) {
  
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
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


  return (
    <Box m="20px">
    





    <Box
  gridColumn="span 12"
  display="flex"
  flexDirection="row"
  justifyContent="space-around"
  alignItems="center"
  p={2}
  borderRadius="8px"
  boxShadow={1}
  sx={{
    backgroundColor: colors.primary[400],
    flexWrap: 'wrap', // Allow wrapping for smaller screens
  }}
>
  <Box
  onClick={() => navigate('/prospect-list')}
    sx={{
      backgroundColor: activityColors.general,
      p: 2,
      borderRadius: '8px',
      textAlign: 'center',
      width: '150px', // Fixed width for consistency
      height: '120px', // Fixed height for consistency
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <BusinessCenter sx={{ fontSize: 40, }} />
    <Typography fontWeight="bold" >Prospects: {dashboardReport.prospects}</Typography>
  </Box>

  <Box
  onClick={() => navigate('/client-list')}
    sx={{
      backgroundColor: activityColors.task,
      p: 2,
      borderRadius: '8px',
      textAlign: 'center',
      width: '150px',
      height: '120px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <People sx={{ fontSize: 40,  }} />
    <Typography fontWeight="bold" >Clients: 0</Typography>
  </Box>

  <Box
   onClick={() => navigate('/project-list')}
    sx={{
      backgroundColor: activityColors.call,
      p: 2,
      borderRadius: '8px',
      textAlign: 'center',
      width: '150px',
      height: '120px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Work sx={{ fontSize: 40,  }} />
    <Typography fontWeight="bold" >Projects: {dashboardReport.projects}</Typography>
  </Box>

  <Box
    
    sx={{
      backgroundColor: activityColors.email,
      p: 2,
      borderRadius: '8px',
      textAlign: 'center',
      width: '150px',
      height: '120px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Construction sx={{ fontSize: 40,  }} />
    <Typography fontWeight="bold" >Project Phase: {dashboardReport.projectPhase}</Typography>
  </Box>

  <Box
  onClick={() => navigate('/my-task-tab')}
    sx={{
      backgroundColor: activityColors.whatsapp,
      p: 2,
      borderRadius: '8px',
      textAlign: 'center',
      width: '150px',
      height: '120px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Task sx={{ fontSize: 40,  }} />
    <Typography fontWeight="bold" >Tasks: {dashboardReport.tasks}</Typography>
  </Box>

  <Box
   onClick={() => navigate('/employee-list-view')}
    sx={{
      backgroundColor: activityColors.visit,
      p: 2,
      borderRadius: '8px',
      textAlign: 'center',
      width: '150px',
      height: '120px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Badge sx={{ fontSize: 40, }} />
    <Typography fontWeight="bold" >Employee: {dashboardReport.employee}</Typography>
  </Box>
</Box>



    </Box>
    
  );
}

export default DashboardFirstRow;
