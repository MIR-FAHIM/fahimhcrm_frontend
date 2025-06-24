import { useNavigate } from "react-router-dom";
import {
  Box,
  IconButton,
  InputBase,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Badge,
  Button,
  Typography,
} from "@mui/material";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { tokens, ColorModeContext } from "../../../theme";
import { useContext, useState, useEffect } from "react";
import {
  DarkModeOutlined,
  LightModeOutlined,
  MenuOutlined,
  NotificationsOutlined,
  PersonOutlined,
  SearchOutlined,
  SettingsOutlined,
} from "@mui/icons-material";
import { ToggledContext } from "../../../App";
import { modulePermission } from "../../../api/controller/admin_controller/user_controller";

const Navbar = () => {
  const userID = localStorage.getItem("userId");
    const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const { toggled, setToggled } = useContext(ToggledContext);
  const isMdDevices = useMediaQuery("(max-width:768px)");
  const isXsDevices = useMediaQuery("(max-width:466px)");
  const colors = tokens(theme.palette.mode);
  
  const [openNotificationModal, setOpenNotificationModal] = useState(false);


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
  // Fetch notifications when the component mounts
  useEffect(() => {
    handleGetModulePermission();
    // Fetch notifications for the current user


  }, [userID]);

  const handleNavigate = () => {
    navigate(`employee-profile/${userID}`);
  };
  const navigateToMessageBox = () => {
    navigate(`conversation-room-list`);
  };

  // Handle notification modal open/close
  const handleNotificationClick = () => {
    navigate(`notification-page`);
    
    // setOpenNotificationModal(true);
  };

  const handleCloseNotificationModal = () => {
    setOpenNotificationModal(false);
  };

  // View details button click handler (this is just a placeholder for now)
  const handleViewDetails = (notificationId) => {
    console.log(`Viewing details for notification with ID: ${notificationId}`);
    // Add any logic here to navigate or show more information
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
      <Box display="flex" alignItems="center" gap={2}>
        <IconButton sx={{ display: `${isMdDevices ? "flex" : "none"}` }} onClick={() => setToggled(!toggled)}>
          <MenuOutlined />
        </IconButton>
        <Box display="flex" alignItems="center" bgcolor={colors.primary[400]} borderRadius="3px" sx={{ display: `${isXsDevices ? "none" : "flex"}` }}>
          <InputBase placeholder="Search" sx={{ ml: 2, flex: 1 }} />
          <IconButton type="button" sx={{ p: 1 }}>
            <SearchOutlined />
          </IconButton>
        </Box>
      </Box>

      <Box>

         {permissions.task && (
           <IconButton onClick={navigateToMessageBox}>
          <Badge badgeContent={1} color="error">
            <ChatBubbleOutlineIcon />
          </Badge>
        </IconButton>
         )}
       
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}
        </IconButton>
         {permissions.task && (
           <IconButton onClick={handleNotificationClick}>
             <Badge badgeContent={1} color="error">
          <NotificationsOutlined />
          </Badge>
          
        </IconButton>
         )}
       
        <IconButton>
          <SettingsOutlined />
        </IconButton>
        <IconButton onClick={handleNavigate}>
          <PersonOutlined />
        </IconButton>
      </Box>


    </Box>
  );
};

export default Navbar;
