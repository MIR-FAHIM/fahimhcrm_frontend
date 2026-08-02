import { useContext, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Chip,
  Collapse,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AddTaskOutlined,
  AdminPanelSettingsOutlined,
  CalculateOutlined,
  ClearRounded,
  ExpandLess,
  ExpandMore,
  FaceOutlined,
  Inventory2Rounded,
  KeyboardDoubleArrowLeftRounded,
  KeyboardDoubleArrowRightRounded,
  MenuOutlined,
  NewReleasesOutlined,
  PieChartOutlined,
  SearchOutlined,
  SettingsOutlined,
  SourceOutlined,
  ViewListOutlined,
} from "@mui/icons-material";

import { AppIcons } from "../../../service/app_icons";
import { tokens } from "../../../theme";
import { appname, base_url } from "../../../api/config";
import {
  getProfile,
  modulePermission,
} from "../../../api/controller/admin_controller/user_controller";
import { ToggledContext } from "../../../App";
import logo from "../../../assets/images/logo.png";

const SideBar = () => {
  const userID = localStorage.getItem("userId");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const location = useLocation();
  const { toggled, setToggled } = useContext(ToggledContext);

  const [collapsed, setCollapsed] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [isAdmin, setIsAdmin] = useState(0);

  const iconColor = theme.palette.blueAccent?.main || colors.blueAccent[500];
  const surfaceBg = theme.palette.background.paper;
  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;
  const divider = theme.palette.divider;
  const isDark = theme.palette.mode === "dark";

  const imageIcon = (src, size = 24, alt = "") => (
    <Box
      component="img"
      src={src}
      alt={alt}
      sx={{
        width: size,
        height: size,
        objectFit: "contain",
        display: "block",
      }}
    />
  );

  const muiIconSx = {
    color: iconColor,
    fontSize: 21,
  };

  const isActive = (path) => location.pathname === path;

  const handleNavigate = (path) => {
    navigate(path);
    setToggled(false);
  };

  const toggleCategory = (key) => {
    if (collapsed) {
      setCollapsed(false);
      setExpandedCategory(key);
      return;
    }
    setExpandedCategory((prev) => (prev === key ? null : key));
  };

  const dashboardItem = useMemo(
    () => ({
      title: "Dashboard",
      path: "/",
      icon: imageIcon(AppIcons.DashBoard, 26, "Dashboard"),
      show: permissions.dashboard,
    }),
    [permissions.dashboard]
  );

  const navGroups = useMemo(
    () => [
      {
        id: "hrms",
        label: "HRMS",
        show: permissions.hrms,
        icon: imageIcon(AppIcons.Employee, 26, "HRMS"),
        items: [
          {
            title: "Employee",
            path: "/employee-list-view",
            icon: imageIcon(AppIcons.Emp1, 20, "Employee"),
          },
          {
            title: "Department",
            path: "/department-wise-emp",
            icon: imageIcon(AppIcons.Department, 20, "Department"),
          },
          {
            title: "User Tracker",
            path: "/user-activity-track",
            icon: imageIcon(AppIcons.Tracker, 20, "User Tracker"),
          },
        ],
      },
      {
        id: "attendance",
        label: "Attendance",
        show: permissions.attendance,
        icon: imageIcon(AppIcons.Attendance, 26, "Attendance"),
        items: [
          {
            title: "Today Attendance",
            path: "/check-in-out",
            icon: imageIcon(AppIcons.CheckIn, 20, "Today Attendance"),
          },
          {
            title: "Attendance Report",
            path: "/employee-attendance-report",
            icon: imageIcon(AppIcons.AttendanceReport, 20, "Attendance Report"),
          },
          {
            title: "Request Leave",
            path: "/leave-manage-form",
            icon: imageIcon(AppIcons.Leave, 20, "Request Leave"),
          },
          {
            title: "My Leave Request",
            path: "/user-leave-request",
            icon: imageIcon(AppIcons.LeaveReq, 20, "My Leave Request"),
          },
          {
            title: "Leave Manager",
            path: "/admin-leave-manage",
            icon: imageIcon(AppIcons.LeaveManager, 20, "Leave Manager"),
          },
          {
            title: "Attendance Adjustment",
            path: "/attendance-adjustment",
            icon: imageIcon(AppIcons.Adjust, 20, "Attendance Adjustment"),
          },
        ],
      },
      {
        id: "notice",
        label: "Notices",
        show: permissions.attendance && (isAdmin === 1 || isAdmin === 2),
        icon: imageIcon(AppIcons.Notice, 26, "Notices"),
        items: [
          {
            title: "Add Notice",
            path: "/add-notices",
            icon: <SettingsOutlined sx={muiIconSx} />,
          },
        ],
      },
      {
        id: "task",
        label: "Task",
        show: permissions.task,
        icon: imageIcon(AppIcons.Task, 26, "Task"),
        items: [
          {
            title: "My Tasks",
            path: "/my-task-tab",
            icon: imageIcon(AppIcons.MyTask, 20, "My Tasks"),
          },
          {
            title: "All Tasks",
            path: "/all-task",
            icon: imageIcon(AppIcons.MyTask, 20, "All Tasks"),
          },
          {
            title: "Task Calendar",
            path: "/task-by-calendar",
            icon: imageIcon(AppIcons.MyTask, 20, "Task Calendar"),
          },
          {
            title: "My Work Report",
            path: "/daily-work-report",
            icon: imageIcon(AppIcons.MyTask, 20, "My Work Report"),
          },
          {
            title: "All Work Report",
            path: "/all-work-report",
            icon: imageIcon(AppIcons.MyTask, 20, "All Work Report"),
          },
        ],
      },
      {
        id: "project",
        label: "Project",
        show: permissions.task,
        icon: imageIcon(AppIcons.Project, 26, "Project"),
        items: [
          {
            title: "Add Project",
            path: "/add-project",
            icon: <AddTaskOutlined sx={muiIconSx} />,
          },
          {
            title: "Projects List",
            path: "/project-list",
            icon: <ViewListOutlined sx={muiIconSx} />,
          },
        ],
      },
      {
        id: "prospect",
        label: "Leads",
        show: permissions.prospect,
        icon: imageIcon(AppIcons.Lead, 26, "Leads"),
        items: [
          {
            title: "Sales Pipeline",
            path: "/prospect-list-by-stage",
            icon: <PieChartOutlined sx={muiIconSx} />,
          },
          {
            title: "Facebook Leads",
            path: "/facebook-leads",
            icon: <FaceOutlined sx={muiIconSx} />,
          },
          {
            title: "Opportunity",
            path: "/opportunity-by-stage",
            icon: <FaceOutlined sx={muiIconSx} />,
          },
          {
            title: "Contact Form Leads",
            path: "/contact-us",
            icon: <FaceOutlined sx={muiIconSx} />,
          },
          {
            title: "Effort Calculation",
            path: "/effort-calculation",
            icon: <CalculateOutlined sx={muiIconSx} />,
          },
          {
            title: "Prospect Report",
            path: "/prospect-report-monthwise",
            icon: <PieChartOutlined sx={muiIconSx} />,
          },
          {
            title: "Sourcewise Report",
            path: "/source-wise-prospect-report",
            icon: <SourceOutlined sx={muiIconSx} />,
          },
        ],
      },
      {
        id: "fieldforce",
        label: "Field Force",
        show: permissions.prospect,
        icon: imageIcon(AppIcons.Visit, 26, "Field Force"),
        items: [
          {
            title: "Visit Planner",
            path: "/visit-plan",
            icon: <SourceOutlined sx={muiIconSx} />,
          },
          {
            title: "Date Wise Visit",
            path: "/datewise-visit",
            icon: <SourceOutlined sx={muiIconSx} />,
          },
          {
            title: "My Visit",
            path: "/my-visit",
            icon: <SourceOutlined sx={muiIconSx} />,
          },
          {
            title: "Visit Map",
            path: "/visit-map",
            icon: <SourceOutlined sx={muiIconSx} />,
          },
        ],
      },
      {
        id: "products",
        label: "Products",
        show: permissions.setting || isAdmin === 1 || isAdmin === 2,
        icon: <Inventory2Rounded sx={{ ...muiIconSx, fontSize: 26 }} />,
        items: [
          {
            title: "Product Management",
            path: "/product-management",
            icon: <Inventory2Rounded sx={muiIconSx} />,
          },
        ],
      },
      {
        id: "system_updates",
        label: "System Updates",
        show: true,
        icon: <NewReleasesOutlined sx={{ ...muiIconSx, fontSize: 26 }} />,
        items: [
          {
            title: "New Updates",
            path: "/new-system-update",
            icon: <NewReleasesOutlined sx={muiIconSx} />,
          },
        ],
      },

      {
        id: "permissions",
        label: "Permissions",
        show: permissions.setting || isAdmin === 1 || isAdmin === 2,
        icon: <AdminPanelSettingsOutlined sx={{ ...muiIconSx, fontSize: 26 }} />,
        items: [
          {
            title: "Role Permission",
            path: "/role-feature-permission",
            icon: <AdminPanelSettingsOutlined sx={muiIconSx} />,
          },
          {
            title: "User Permission",
            path: "/user-feature-permission",
            icon: <AdminPanelSettingsOutlined sx={muiIconSx} />,
          },
          {
            title: "My Permissions",
            path: "/my-feature-permission",
            icon: <AdminPanelSettingsOutlined sx={muiIconSx} />,
          },
        ],
      },
      {
        id: "setting",
        label: "Settings",
        show: permissions.setting,
        icon: imageIcon(AppIcons.Setting, 26, "Settings"),
        items: [
          {
            title: "Add Department",
            path: "/department-view",
            icon: <AdminPanelSettingsOutlined sx={muiIconSx} />,
          },
          {
            title: "Add Designation",
            path: "/designation-view",
            icon: <AdminPanelSettingsOutlined sx={muiIconSx} />,
          },
          {
            title: "Add Role",
            path: "/role-view",
            icon: <AdminPanelSettingsOutlined sx={muiIconSx} />,
          },
          {
            title: "Add Task Priority",
            path: "/task-priority",
            icon: <AdminPanelSettingsOutlined sx={muiIconSx} />,
          },
          {
            title: "Add Task Status",
            path: "/task-status",
            icon: <AdminPanelSettingsOutlined sx={muiIconSx} />,
          },
          {
            title: "Add Task Type",
            path: "/task-type",
            icon: <AdminPanelSettingsOutlined sx={muiIconSx} />,
          },
        ],
      },
    ],
    [permissions, isAdmin, iconColor]
  );

  const normalizedSearch = search.trim().toLowerCase();

  const dashboardVisible =
    dashboardItem.show &&
    (!normalizedSearch ||
      dashboardItem.title.toLowerCase().includes(normalizedSearch));

  const visibleGroups = useMemo(
    () =>
      navGroups
        .filter((group) => group.show)
        .map((group) => {
          const groupMatches = group.label
            .toLowerCase()
            .includes(normalizedSearch);
          const items =
            normalizedSearch && !groupMatches
              ? group.items.filter((item) =>
                  item.title.toLowerCase().includes(normalizedSearch)
                )
              : group.items;

          return { ...group, items };
        })
        .filter((group) => group.items.length > 0),
    [navGroups, normalizedSearch]
  );

  const activeGroupId = useMemo(() => {
    const activeGroup = navGroups.find(
      (group) => group.show && group.items.some((item) => isActive(item.path))
    );
    return activeGroup?.id || null;
  }, [navGroups, location.pathname]);

  const visibleItemCount =
    (dashboardVisible ? 1 : 0) +
    visibleGroups.reduce((count, group) => count + group.items.length, 0);

  useEffect(() => {
    if (!normalizedSearch && activeGroupId) {
      setExpandedCategory(activeGroupId);
    }
  }, [activeGroupId, normalizedSearch]);

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
          setIsAdmin(Number(res.data.role_id || 0));
          setImageUrl(
            res.data.photo ? `${base_url}/storage/${res.data.photo}` : null
          );
        }
      } catch (e) {
        console.error("profile error", e);
      }
    })();
  }, [userID, navigate]);

  const menuButtonStyles = ({ active }) => ({
    color: active ? textPrimary : textSecondary,
    height: 42,
    margin: "2px 10px",
    borderRadius: 2,
    backgroundColor: active ? alpha(iconColor, isDark ? 0.2 : 0.14) : "transparent",
    boxShadow: active ? `inset 3px 0 0 ${iconColor}` : "none",
    transition: "background .18s ease, color .18s ease, transform .18s ease",
    "&:hover": {
      color: textPrimary,
      backgroundColor: alpha(iconColor, isDark ? 0.16 : 0.1),
      transform: "translateX(2px)",
    },
    ".ps-menu-icon": {
      minWidth: collapsed ? 0 : 34,
      marginRight: collapsed ? 0 : 8,
    },
    ".ps-menu-label": {
      fontSize: 14,
      fontWeight: 700,
    },
  });

  const renderNavItem = (item) => {
    const itemNode = (
      <MenuItem
        key={item.path}
        active={isActive(item.path)}
        icon={item.icon}
        onClick={() => handleNavigate(item.path)}
      >
        {!collapsed && (
          <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>
            {item.title}
          </Typography>
        )}
      </MenuItem>
    );

    return collapsed ? (
      <Tooltip key={item.path} title={item.title} placement="right">
        {itemNode}
      </Tooltip>
    ) : (
      itemNode
    );
  };

  const GroupHeader = ({ group }) => {
    const expanded = normalizedSearch || expandedCategory === group.id;
    const active = activeGroupId === group.id;

    const header = (
      <Box
        role="button"
        tabIndex={0}
        onClick={() => toggleCategory(group.id)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleCategory(group.id);
          }
        }}
        sx={{
          mx: 1.25,
          mt: 0.75,
          mb: 0.5,
          px: collapsed ? 1 : 1.25,
          py: 1,
          minHeight: 44,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          gap: 1,
          color: active ? textPrimary : textSecondary,
          cursor: "pointer",
          backgroundColor: active ? alpha(iconColor, isDark ? 0.14 : 0.08) : "transparent",
          outline: "none",
          transition: "background .18s ease, color .18s ease",
          "&:hover": {
            color: textPrimary,
            backgroundColor: alpha(iconColor, isDark ? 0.16 : 0.1),
          },
          "&:focus-visible": {
            boxShadow: `0 0 0 2px ${alpha(iconColor, 0.45)}`,
          },
        }}
      >
        <Box display="flex" alignItems="center" gap={1.25} minWidth={0}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              backgroundColor: alpha(iconColor, active ? 0.18 : 0.08),
              flexShrink: 0,
            }}
          >
            {group.icon}
          </Box>

          {!collapsed && (
            <Box minWidth={0}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 800 }}>
                {group.label}
              </Typography>
              {normalizedSearch && (
                <Typography variant="caption" color="text.secondary">
                  {group.items.length} match{group.items.length > 1 ? "es" : ""}
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {!collapsed && (
          <Box display="flex" alignItems="center" gap={0.75}>
            {!normalizedSearch && (
              <Chip
                size="small"
                label={group.items.length}
                sx={{
                  height: 20,
                  minWidth: 28,
                  fontSize: 11,
                  color: active ? textPrimary : textSecondary,
                  backgroundColor: alpha(iconColor, active ? 0.2 : 0.1),
                }}
              />
            )}
            {expanded ? (
              <ExpandLess sx={{ color: textSecondary, fontSize: 20 }} />
            ) : (
              <ExpandMore sx={{ color: textSecondary, fontSize: 20 }} />
            )}
          </Box>
        )}
      </Box>
    );

    return collapsed ? (
      <Tooltip title={group.label} placement="right">
        {header}
      </Tooltip>
    ) : (
      header
    );
  };

  return (
    <Sidebar
      width="292px"
      collapsedWidth="76px"
      backgroundColor={surfaceBg}
      rootStyles={{
        border: 0,
        height: "100%",
        boxShadow: `inset -1px 0 0 ${divider}`,
        "& .ps-sidebar-container": {
          background: surfaceBg,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
      collapsed={collapsed}
      toggled={toggled}
      onBackdropClick={() => setToggled(false)}
      breakPoint="md"
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minHeight: 0,
        }}
      >
        <Box sx={{ px: 1.5, pt: 1.5, pb: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "space-between",
              gap: 1,
              minHeight: 42,
            }}
          >
            {!collapsed && (
              <Box display="flex" alignItems="center" gap={1.25} minWidth={0}>
                <Box
                  component="img"
                  src={logo}
                  alt="logo"
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 2,
                    boxShadow: `0 8px 22px ${alpha(iconColor, 0.18)}`,
                  }}
                />
                <Box minWidth={0}>
                  <Typography
                    variant="h6"
                    noWrap
                    sx={{
                      color: textPrimary,
                      fontWeight: 900,
                      lineHeight: 1.1,
                    }}
                  >
                    {appname}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    CRM Workspace
                  </Typography>
                </Box>
              </Box>
            )}

            <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
              <IconButton
                size="small"
                onClick={() => setCollapsed((current) => !current)}
                sx={{
                  width: 34,
                  height: 34,
                  border: `1px solid ${divider}`,
                  bgcolor: alpha(iconColor, isDark ? 0.1 : 0.06),
                  color: textPrimary,
                  "&:hover": {
                    bgcolor: alpha(iconColor, isDark ? 0.18 : 0.12),
                  },
                }}
              >
                {collapsed ? (
                  <KeyboardDoubleArrowRightRounded fontSize="small" />
                ) : (
                  <KeyboardDoubleArrowLeftRounded fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Box>

          {!collapsed && (
            <TextField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search menu"
              size="small"
              fullWidth
              sx={{
                mt: 1.5,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: alpha(iconColor, isDark ? 0.08 : 0.05),
                  "& fieldset": { borderColor: divider },
                  "&:hover fieldset": { borderColor: alpha(iconColor, 0.5) },
                  "&.Mui-focused fieldset": { borderColor: iconColor },
                },
                "& .MuiInputBase-input": {
                  py: 1,
                  fontSize: 14,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined sx={{ color: textSecondary, fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearch("")}
                      sx={{ color: textSecondary }}
                    >
                      <ClearRounded fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          )}
        </Box>

        {user && (
          <Tooltip
            title={collapsed ? `${user.name} - ${user?.role?.role_name || "User"}` : ""}
            placement="right"
          >
            <Box
              onClick={() => handleNavigate(`/employee-profile/${userID}`)}
              sx={{
                mx: 1.5,
                mb: 1,
                p: collapsed ? 1 : 1.25,
                borderRadius: 2,
                border: `1px solid ${divider}`,
                cursor: "pointer",
                background: `linear-gradient(135deg, ${alpha(
                  iconColor,
                  isDark ? 0.16 : 0.1
                )}, ${alpha(theme.palette.success.main, isDark ? 0.1 : 0.08)})`,
                transition: "border-color .18s ease, transform .18s ease",
                "&:hover": {
                  borderColor: alpha(iconColor, 0.55),
                  transform: "translateY(-1px)",
                },
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent={collapsed ? "center" : "space-between"}
                gap={1}
              >
                <Box display="flex" alignItems="center" gap={1.25} minWidth={0}>
                  <Box position="relative" flexShrink={0}>
                    <Avatar
                      src={imageUrl || undefined}
                      sx={{
                        width: 36,
                        height: 36,
                        border: `2px solid ${alpha(iconColor, 0.35)}`,
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        right: 1,
                        bottom: 1,
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        bgcolor: theme.palette.success.main,
                        border: `2px solid ${surfaceBg}`,
                      }}
                    />
                  </Box>

                  {!collapsed && (
                    <Box minWidth={0}>
                      <Typography
                        variant="body2"
                        noWrap
                        title={user.name}
                        sx={{ fontWeight: 800, color: textPrimary }}
                      >
                        {user.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        title={user?.role?.role_name}
                      >
                        {user?.role?.role_name || "User"}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {!collapsed && (
                  <Chip
                    size="small"
                    label="Profile"
                    sx={{
                      height: 24,
                      fontWeight: 800,
                      color: textPrimary,
                      bgcolor: alpha(iconColor, isDark ? 0.18 : 0.12),
                    }}
                  />
                )}
              </Box>
            </Box>
          </Tooltip>
        )}

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            pb: 1,
            "&::-webkit-scrollbar": { width: 6 },
            "&::-webkit-scrollbar-thumb": {
              borderRadius: 10,
              backgroundColor: alpha(textSecondary, 0.28),
            },
            "&::-webkit-scrollbar-track": { background: "transparent" },
          }}
        >
          {!collapsed && normalizedSearch && (
            <Box
              sx={{
                mx: 1.5,
                mb: 1,
                px: 1,
                py: 0.75,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: textSecondary,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                Results
              </Typography>
              <Chip
                size="small"
                label={visibleItemCount}
                sx={{
                  height: 20,
                  minWidth: 28,
                  fontSize: 11,
                  bgcolor: alpha(iconColor, 0.12),
                  color: textPrimary,
                }}
              />
            </Box>
          )}

          <Menu
            menuItemStyles={{
              button: menuButtonStyles,
            }}
          >
            {dashboardVisible && renderNavItem(dashboardItem)}
          </Menu>

          {visibleGroups.map((group) => (
            <Box key={group.id}>
              <GroupHeader group={group} />
              <Collapse
                in={!collapsed && (normalizedSearch || expandedCategory === group.id)}
                timeout="auto"
                unmountOnExit
              >
                <Menu
                  menuItemStyles={{
                    button: (params) => ({
                      ...menuButtonStyles(params),
                      height: 38,
                      marginLeft: "18px",
                      marginRight: "10px",
                      ".ps-menu-icon": {
                        minWidth: 28,
                        marginRight: 8,
                      },
                      ".ps-menu-label": {
                        fontSize: 13,
                        fontWeight: 700,
                      },
                    }),
                  }}
                >
                  {group.items.map(renderNavItem)}
                </Menu>
              </Collapse>
            </Box>
          ))}

          {!visibleItemCount && !collapsed && (
            <Box
              sx={{
                mx: 1.5,
                mt: 2,
                p: 2,
                borderRadius: 2,
                textAlign: "center",
                border: `1px dashed ${divider}`,
                color: textSecondary,
              }}
            >
              <MenuOutlined sx={{ mb: 0.5, color: alpha(textSecondary, 0.8) }} />
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                No menu items found
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Sidebar>
  );
};

export default SideBar;
