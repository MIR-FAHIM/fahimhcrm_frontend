// src/scenes/global/sidebar/SideBar.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Collapse,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
  ListItemIcon,
} from "@mui/material";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { AppIcons } from "../../../service/app_icons";
import {
  ExpandMore,
  ExpandLess,
  MenuOutlined,
  DashboardOutlined,
  PeopleAltOutlined,
  CalendarTodayOutlined,
  AssignmentOutlined,
  WorkOutlineOutlined,
  SupervisorAccountOutlined,
  SettingsOutlined,
  TaskAltOutlined,
  FolderSharedOutlined,
  ViewListOutlined,
  AddTaskOutlined,
  EventNoteOutlined,
  ListAltOutlined,
  EngineeringOutlined,
  AccountCircleOutlined,
  PieChartOutlined,
  SourceOutlined,
  FaceOutlined,
  CalculateOutlined,
  AdminPanelSettingsOutlined,
} from "@mui/icons-material";

import { tokens } from "../../../theme";
import { base_url } from "../../../api/config";
import { appname } from "../../../api/config";
import { getProfile, modulePermission } from "../../../api/controller/admin_controller/user_controller";
import { ToggledContext } from "../../../App";
import logo from "../../../assets/images/logo.png";
import Item from "./Item";

const SideBar = () => {

  const userID = localStorage.getItem("userId");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const location = useLocation();
  const { toggled, setToggled } = useContext(ToggledContext);

  const [collapsed, setCollapsed] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [user, setUser] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [isAdmin, setIsAdmin] = useState(0);

  const iconColor = theme.palette.blueAccent?.main || colors.blueAccent[500];
  const iconStyle = {
    height: 30,
    width: 30,
    color: iconColor,
    transition: "transform .2s ease, color .2s ease",
    ":hover": { color: theme.palette.text.primary, transform: "scale(1.1)" },
  };
  const iconStyleSub = {
    height: 20,
    width: 20,
    color: iconColor,
    transition: "transform .2s ease, color .2s ease",
    ":hover": { color: theme.palette.text.primary, transform: "scale(1.1)" },
  };
  const iconStyleMain = {
    height: 35,
    width: 35,
    color: iconColor,
    transition: "transform .2s ease, color .2s ease",
    ":hover": { color: theme.palette.text.primary, transform: "scale(1.1)" },
  };

  const surfaceBg = theme.palette.background.paper;
  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;
  const divider = theme.palette.divider;
  const highlight = theme.palette.blueAccent?.light || colors.blueAccent[600];

  const isActive = (path) => location.pathname === path;

  const activeStyles = {
    color: textPrimary,
    background: theme.palette.action.selectedOpacity
      ? `rgba(58,134,255, ${theme.palette.action.selectedOpacity})`
      : "rgba(58,134,255,0.12)",
    borderLeft: `3px solid ${iconColor}`,
  };

  const toggleCategory = (key) =>
    setExpandedCategory((prev) => (prev === key ? null : key));

  useEffect(() => {
    (async () => {
      try {
        const p = await modulePermission();
        if (p?.status === "success") setPermissions(p.permissions || {});
      } catch {}
    })();
    (async () => {
      try {
        const res = await getProfile(userID, navigate);
        if (res?.status === "success") {
          setUser(res.data);
          setIsAdmin(res.data.role_id);
          setImageUrl(res.data.photo ? `${base_url}/storage/${res.data.photo}` : null);
        }
      } catch (e) {
        console.error("profile error", e);
      }
    })();
  }, [userID, navigate]);

  // Small helper to render a group header (collapsible section)
  const GroupHeader = ({ id, icon, label, show = true }) => {
    if (!show) return null;
    const expanded = expandedCategory === id;

    const header = (
      <Typography
        variant="subtitle2"
        sx={{
          m: "12px 16px 6px",
          px: 1,
          py: 0.75,
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: textSecondary,
          cursor: "pointer",
          "&:hover": { color: textPrimary, backgroundColor: theme.palette.action.hover },
        }}
        onClick={() => toggleCategory(id)}
      >
        {icon}
        {!collapsed && (
          <Box display="flex" alignItems="center" justifyContent="space-between" flex={1}>
            <span style={{ fontWeight: 700 }}>{label}</span>
            {expanded ? <ExpandLess sx={{ color: textSecondary }} /> : <ExpandMore sx={{ color: textSecondary }} />}
          </Box>
        )}
      </Typography>
    );

    return collapsed ? (
      <Tooltip title={label} placement="right">{header}</Tooltip>
    ) : (
      header
    );
  };

  return (
    <Sidebar
      backgroundColor={surfaceBg}
      rootStyles={{
        border: 0,
        height: "100%",
        boxShadow: `inset -1px 0 0 ${divider}`,
      }}
      collapsed={collapsed}
      toggled={toggled}
      onBackdropClick={() => setToggled(false)}
      breakPoint="md"
    >
      {/* Brand / Collapse */}
      <Menu
        menuItemStyles={{
          button: {
            "&:hover": { background: "transparent" },
            padding: "8px 12px",
          },
        }}
      >
        <MenuItem
          rootStyles={{ margin: "10px 0 10px", color: textPrimary }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "space-between",
              px: 1,
            }}
          >
            {!collapsed && (
              <Box display="flex" alignItems="center" gap={1.25}>
                <img
                  src={logo}
                  alt="logo"
                  style={{ width: 28, height: 28, borderRadius: 8 }}
                />
                <Typography
                  variant="h6"
                  fontWeight={800}
                  sx={{
                    color: iconColor,
                    letterSpacing: 0.2,
                  }}
                >
                  {appname}
                </Typography>
              </Box>
            )}
            <IconButton
              size="small"
              onClick={() => setCollapsed((c) => !c)}
              sx={{
                ml: collapsed ? 0 : 1,
                border: `1px solid ${divider}`,
                bgcolor: theme.palette.background.default,
              }}
            >
              <MenuOutlined />
            </IconButton>
          </Box>
        </MenuItem>
      </Menu>

      {/* User snippet */}
      {user && (
        <Box
          sx={{
            mx: 1.5,
            mb: 1.5,
            p: collapsed ? 1 : 1.5,
            borderRadius: 2,
            border: `1px solid ${divider}`,
            background: theme.palette.mode === "dark"
              ? "linear-gradient(135deg, rgba(58,134,255,0.08), rgba(46,196,182,0.06))"
              : "linear-gradient(135deg, rgba(58,134,255,0.08), rgba(46,196,182,0.06))",
          }}
        >
          <Box display="flex" alignItems="center" gap={1.25}>
            <Avatar src={imageUrl || undefined} sx={{ width: 36, height: 36 }} />
            {!collapsed && (
              <Box minWidth={0}>
                <Typography
                  variant="body2"
                  noWrap
                  title={user.name}
                  sx={{ fontWeight: 700 }}
                >
                  {user.name}
                </Typography>
                <Typography variant="caption" color={textSecondary} noWrap title={user?.role?.role_name}>
                  {user?.role?.role_name || "User"}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* NAV */}
      <Box mb={4}>
        {/* Dashboard */}
       {permissions.dashboard && (
        <Menu
          menuItemStyles={{
            button: ({ active }) => ({
              color: active ? textPrimary : textSecondary,
              background: 'transparent',
              '&:hover': { color: textPrimary, background: theme.palette.action.hover },
              ...(active ? activeStyles : {}),
              padding: '8px 16px',
            }),
          }}
        >
          <MenuItem
            active={isActive('/')}
            onClick={() => navigate('/')}
            // Pass your custom icon image directly to the icon prop.
            icon={<img src={AppIcons.DashBoard} alt="Dashboard Icon" style={iconStyle} />}
          >
            {!collapsed && <Typography>Dashboard</Typography>}
          </MenuItem>
        </Menu>
      )}

        {/* HRMS */}
        <GroupHeader id="hrms" label="HRMS" icon={<img src={AppIcons.Employee} style={iconStyle} />} show={permissions.hrms} />
        <Collapse in={expandedCategory === "hrms"} unmountOnExit>
          <Menu
            menuItemStyles={{
              button: ({ active }) => ({
                color: active ? textPrimary : textSecondary,
                "&:hover": { background: theme.palette.action.hover, color: textPrimary },
                ...(active ? activeStyles : {}),
                padding: "8px 16px",
              }),
            }}
          >
            <Item title="Employee" path="/employee-list-view" colors={{}} icon={<img src={AppIcons.Emp1} style={iconStyleSub} />} />
            <Item title="Department" path="/department-wise-emp" colors={{}} icon={<img src={AppIcons.Department} style={iconStyleSub} />} />
            <Item title="User Tracker" path="/user-activity-track" colors={{}} icon={<img src={AppIcons.Tracker} style={iconStyleSub} />} />
          </Menu>
        </Collapse>

        {/* Attendance */}
        <GroupHeader id="attendance" label="Attendance" icon={<img src={AppIcons.Attendance} style={iconStyle} />} show={permissions.attendance} />
        <Collapse in={expandedCategory === "attendance"} unmountOnExit>
          <Menu menuItemStyles={{ button: ({ active }) => ({
              color: active ? textPrimary : textSecondary,
              "&:hover": { background: theme.palette.action.hover, color: textPrimary },
              ...(active ? activeStyles : {}),
              padding: "8px 16px",
            }),
          }}>
            <Item title="Today Attendance" path="/check-in-out" icon={<img src={AppIcons.CheckIn} style={iconStyleSub} />} />
            <Item title="Attendance Report" path="/employee-attendance-report" icon={<img src={AppIcons.AttendanceReport} style={iconStyleSub} />} />
            <Item title="Request Leave" path="/leave-manage-form" icon={<img src={AppIcons.Leave} style={iconStyleSub} />} />
            <Item title="My Leave Request" path="/user-leave-request" icon={<img src={AppIcons.LeaveReq} style={iconStyleSub} />} />
            <Item title="Leave Manager" path="/admin-leave-manage" icon={<img src={AppIcons.LeaveManager} style={iconStyleSub} />} />
            <Item title="Attendance Adjustment" path="/attendance-adjustment" icon={<img src={AppIcons.Adjust} style={iconStyleSub} />} />
          </Menu>
        </Collapse>

        {/* Notices (admin) */}
        {(permissions.attendance && (isAdmin === 1 || isAdmin === 2)) && (
          <>
            <GroupHeader id="notice" label="Add Notices" icon={<img src={AppIcons.Notice} style={iconStyle} />} show />
            <Collapse in={expandedCategory === "notice"} unmountOnExit>
              <Menu menuItemStyles={{ button: ({ active }) => ({
                  color: active ? textPrimary : textSecondary,
                  "&:hover": { background: theme.palette.action.hover, color: textPrimary },
                  ...(active ? activeStyles : {}),
                  padding: "8px 16px",
                }),
              }}>
                <Item title="Add Notice" path="/add-notices" icon={<SettingsOutlined sx={iconStyle} />} />
              </Menu>
            </Collapse>
          </>
        )}

        {/* Task */}
        <GroupHeader id="task" label="Task" icon={<img src={AppIcons.Task} style={iconStyle} />} show={permissions.task} />
        <Collapse in={expandedCategory === "task"} unmountOnExit>
          <Menu menuItemStyles={{ button: ({ active }) => ({
              color: active ? textPrimary : textSecondary,
              "&:hover": { background: theme.palette.action.hover, color: textPrimary },
              ...(active ? activeStyles : {}),
              padding: "8px 16px",
            }),
          }}>
            <Item title="My Tasks" path="/my-task-tab" icon={<img src={AppIcons.MyTask} style={iconStyleSub} />} />
            <Item title="All Tasks" path="/all-task" icon={<img src={AppIcons.MyTask} style={iconStyleSub} />} />
            <Item title="Task Calendar" path="/task-by-calendar" icon={<img src={AppIcons.MyTask} style={iconStyleSub} />} />
            <Item title="My Work Report" path="/daily-work-report" icon={<img src={AppIcons.MyTask} style={iconStyleSub} />} />
            <Item title="All Work Report" path="/all-work-report" icon={<img src={AppIcons.MyTask} style={iconStyleSub} />} />
          </Menu>
        </Collapse>

        {/* Projects */}
        <GroupHeader id="project" label="Project" icon={<img src={AppIcons.Project} style={iconStyle} />} show={permissions.task} />
        <Collapse in={expandedCategory === "project"} unmountOnExit>
          <Menu menuItemStyles={{ button: ({ active }) => ({
              color: active ? textPrimary : textSecondary,
              "&:hover": { background: theme.palette.action.hover, color: textPrimary },
              ...(active ? activeStyles : {}),
              padding: "8px 16px",
            }),
          }}>
            <Item title="Add Project" path="/add-project" icon={<AddTaskOutlined sx={iconStyleSub} />} />
            <Item title="Projects List" path="/project-list" icon={<ViewListOutlined sx={iconStyleSub} />} />
          </Menu>
        </Collapse>

        {/* Leads / Prospects */}
        <GroupHeader id="prospect" label="Leads" icon={<img src={AppIcons.Lead} style={iconStyle} />} show={permissions.prospect} />
        <Collapse in={expandedCategory === "prospect"} unmountOnExit>
          <Menu menuItemStyles={{ button: ({ active }) => ({
              color: active ? textPrimary : textSecondary,
              "&:hover": { background: theme.palette.action.hover, color: textPrimary },
              ...(active ? activeStyles : {}),
              padding: "8px 16px",
            }),
          }}>
            <Item title="Sales Pipeline" path="/prospect-list-by-stage" icon={<PieChartOutlined sx={iconStyleSub} />} />
            <Item title="Facebook Leads" path="/facebook-leads" icon={<FaceOutlined sx={iconStyleSub} />} />
            <Item title="Opportunity" path="/opportunity-by-stage" icon={<FaceOutlined sx={iconStyleSub} />} />
            <Item title="Contact Form Leads" path="/contact-us" icon={<FaceOutlined sx={iconStyleSub} />} />
            <Item title="Effort Calculation" path="/effort-calculation" icon={<CalculateOutlined sx={iconStyleSub} />} />
            <Item title="Prospect Report" path="/prospect-report-monthwise" icon={<PieChartOutlined sx={iconStyleSub} />} />
            <Item title="Sourcewise Report" path="/source-wise-prospect-report" icon={<SourceOutlined sx={iconStyleSub} />} />
          </Menu>
        </Collapse>

        {/* visit */}
        <GroupHeader id="fieldforce" label="Fied Force" icon={<img src={AppIcons.Visit} style={iconStyle} />} show={permissions.prospect} />
        <Collapse in={expandedCategory === "fieldforce"} unmountOnExit>
          <Menu menuItemStyles={{ button: ({ active }) => ({
              color: active ? textPrimary : textSecondary,
              "&:hover": { background: theme.palette.action.hover, color: textPrimary },
              ...(active ? activeStyles : {}),
              padding: "8px 16px",
            }),
          }}>
            <Item title="Visit Planner" path="/visit-plan" icon={<SourceOutlined sx={iconStyleSub} />} />
            <Item title="My Visit" path="/my-visit" icon={<SourceOutlined sx={iconStyleSub} />} />
            <Item title="Visit Map" path="/visit-map" icon={<SourceOutlined sx={iconStyleSub} />} />
          </Menu>
        </Collapse>
        <GroupHeader id="warehouse" label="Warehouses" icon={<img src={AppIcons.Warehouse} style={iconStyle} />} show={permissions.prospect} />
        <Collapse in={expandedCategory === "warehouse"} unmountOnExit>
          <Menu menuItemStyles={{ button: ({ active }) => ({
              color: active ? textPrimary : textSecondary,
              "&:hover": { background: theme.palette.action.hover, color: textPrimary },
              ...(active ? activeStyles : {}),
              padding: "8px 16px",
            }),
          }}>
            <Item title="Warehouses Map" path="/map-markers" icon={<SourceOutlined sx={iconStyleSub} />} />
            <Item title="Warehouses List" path="/warehouse-list" icon={<SourceOutlined sx={iconStyleSub} />} />
          </Menu>
        </Collapse>

        {/* Settings */}
        <GroupHeader id="setting" label="Settings" icon={<img src={AppIcons.Setting} style={iconStyle} />} show={permissions.setting} />
        <Collapse in={expandedCategory === "setting"} unmountOnExit>
          <Menu menuItemStyles={{ button: ({ active }) => ({
              color: active ? textPrimary : textSecondary,
              "&:hover": { background: theme.palette.action.hover, color: textPrimary },
              ...(active ? activeStyles : {}),
              padding: "8px 16px",
            }),
          }}>
            <Item title="Add Department" path="/department-view" icon={<AdminPanelSettingsOutlined sx={iconStyleSub} />} />
            <Item title="Add Designation" path="/designation-view" icon={<AdminPanelSettingsOutlined sx={iconStyleSub} />} />
            <Item title="Add Role" path="/role-view" icon={<AdminPanelSettingsOutlined sx={iconStyleSub} />} />
            <Item title="Add Task Priority" path="/task-priority" icon={<AdminPanelSettingsOutlined sx={iconStyleSub} />} />
            <Item title="Add Task Status" path="/task-status" icon={<AdminPanelSettingsOutlined sx={iconStyleSub} />} />
            <Item title="Add Task Type" path="/task-type" icon={<AdminPanelSettingsOutlined sx={iconStyleSub} />} />
            <Item title="Feature Permission" path="/user-feature-permission" icon={<AdminPanelSettingsOutlined sx={iconStyleSub} />} />
          </Menu>
        </Collapse>
      </Box>
    </Sidebar>
  );
};

export default SideBar;
