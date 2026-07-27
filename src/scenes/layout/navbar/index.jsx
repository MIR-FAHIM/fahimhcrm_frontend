import { useNavigate } from "react-router-dom";
import {
  Alert,
  Badge,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputBase,
  Snackbar,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { tokens, ColorModeContext } from "../../../theme";
import { useContext, useState, useEffect, useRef } from "react";
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
import { modulePermission, updateUserModePreference } from "../../../api/controller/admin_controller/user_controller";

const Navbar = () => {
  const userID = localStorage.getItem("userId");
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const theme = useTheme();
  const inputRef = useRef(null);
  const colorMode = useContext(ColorModeContext);
  const { toggled, setToggled } = useContext(ToggledContext);
  const isMdDevices = useMediaQuery("(max-width:768px)");
  const isXsDevices = useMediaQuery("(max-width:466px)");
  const colors = tokens(theme.palette.mode);

  const [openNotificationModal, setOpenNotificationModal] = useState(false);
  const [modeSaving, setModeSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "error" });
  const [permissions, setPermissions] = useState({});

  const handleGetModulePermission = async () => {
    try {
      const response = await modulePermission();
      if (response.status === "success") {
        setPermissions(response.permissions);
      }
    } catch (error) {
      console.error("Failed to load module permission:", error);
    }
  };

  useEffect(() => {
    handleGetModulePermission();
  }, [userID]);

  const handleNavigate = () => {
    navigate(`employee-profile/${userID}`);
  };

  const handleNavigateTask = (id) => {
    navigate(`task-details/${id}`);
    setSearchQuery("");
  };

  const navigateToMessageBox = () => {
    navigate("conversation-room-list");
  };

  const handleNotificationClick = () => {
    navigate("notification-page");
  };

  const handleContactUsClick = () => {
    navigate("contact-us-form");
  };

  const handleCloseNotificationModal = () => {
    setOpenNotificationModal(false);
  };

  const handleViewDetails = (notificationId) => {
    console.log(`Viewing details for notification with ID: ${notificationId}`);
  };

  const handleModeToggle = async () => {
    const previousMode = colorMode.mode || theme.palette.mode;
    const nextMode = previousMode === "dark" ? "light" : "dark";

    colorMode.setColorMode(nextMode);

    if (!userID) return;

    setModeSaving(true);
    try {
      const response = await updateUserModePreference({
        user_id: Number(userID),
        is_dark_mode: nextMode === "dark",
      });

      if (response?.status && response.status !== "success") {
        throw new Error(response?.message || "Failed to update mode preference");
      }
    } catch (error) {
      colorMode.setColorMode(previousMode);
      setSnack({
        open: true,
        msg: error?.response?.data?.message || error?.message || "Failed to update theme preference.",
        sev: "error",
      });
    } finally {
      setModeSaving(false);
    }
  };

  const isDarkMode = theme.palette.mode === "dark";
  const toggleTitle = isDarkMode ? "Switch to light mode" : "Switch to dark mode";

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton sx={{ display: `${isMdDevices ? "flex" : "none"}` }} onClick={() => setToggled(!toggled)}>
            <MenuOutlined />
          </IconButton>
          <Box display="flex" alignItems="center" bgcolor={colors.gray[900]} borderRadius="3px" sx={{ display: `${isXsDevices ? "none" : "flex"}` }}>
            <InputBase
              placeholder="Find Task By ID"
              sx={{ ml: 2, flex: 1 }}
              ref={inputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <IconButton type="button" sx={{ p: 1 }} onClick={() => { handleNavigateTask(searchQuery); }}>
              <SearchOutlined />
            </IconButton>
          </Box>
        </Box>

        <Box display="flex" alignItems="center">
          {permissions.prospect && (
            <Button
              size="small"
              sx={{ textTransform: "none" }}
              onClick={() => handleContactUsClick()}
            >
              Contact with Developer
            </Button>
          )}

          {permissions.task && (
            <IconButton onClick={navigateToMessageBox}>
              <Badge badgeContent={1} color="error">
                <ChatBubbleOutlineIcon />
              </Badge>
            </IconButton>
          )}

          <Tooltip title={toggleTitle}>
            <span>
              <IconButton onClick={handleModeToggle} disabled={modeSaving || colorMode.preferenceLoading}>
                {modeSaving || colorMode.preferenceLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : isDarkMode ? (
                  <LightModeOutlined />
                ) : (
                  <DarkModeOutlined />
                )}
              </IconButton>
            </span>
          </Tooltip>

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

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((state) => ({ ...state, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snack.sev} sx={{ width: "100%" }} onClose={() => setSnack((state) => ({ ...state, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Navbar;
