import { Avatar, Box, IconButton, Typography, useTheme, Collapse } from "@mui/material";
import { useContext, useState, useEffect } from "react";
import { tokens } from "../../../theme";
import { getProfile, modulePermission } from "../../../api/controller/admin_controller/user_controller";
import { base_url } from "../../../api/config/index";
import { Menu, MenuItem, Sidebar } from "react-pro-sidebar";
import { useNavigate } from "react-router-dom";
import { appname } from '../../../../src/api/config';
import {
  BarChartOutlined,
  CalendarTodayOutlined,
  ContactsOutlined,
  DashboardOutlined,
  HelpOutlineOutlined,
  MapOutlined,
  MenuOutlined,
  PeopleAltOutlined,
  PersonOutlined,
  ReceiptOutlined,
  TimelineOutlined,
  WavesOutlined,
  SettingsOutlined,
  AssignmentOutlined,
  WorkOutlineOutlined,
  ListAltOutlined,
  EventNoteOutlined,
  AddTaskOutlined,
  EngineeringOutlined,
  AccountCircleOutlined,
  SupervisorAccountOutlined,
  AssignmentIndOutlined,
  PieChartOutlined,
  SourceOutlined,
  FaceOutlined,
  CalculateOutlined,
  ViewListOutlined,
  AdminPanelSettingsOutlined,
  TaskAltOutlined,
  FolderSharedOutlined,

} from "@mui/icons-material";
import logo from "../../../assets/images/logo.png";
import Item from "./Item";
import { ToggledContext } from "../../../App";

const SideBar = () => {
  const userID = localStorage.getItem("userId");
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState({});
  const [expandedCategory, setExpandedCategory] = useState(null);
  const { toggled, setToggled } = useContext(ToggledContext);
  const theme = useTheme();
  const navigate = useNavigate();
  const colors = tokens(theme.palette.mode);
  const [imageUrl, setImageUrl] = useState(null);
  const iconStyle = {
    color: colors.blueAccent[500],
    transition: ".3s ease",
    ":hover": {
      color: colors.blueAccent[700],
      transform: "scale(1.2)",
    },
  };
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
  useEffect(() => {
    handleGetModulePermission();
    async function fetchUserProfile() {
      try {
        const response = await getProfile(userID, navigate);
        if (response.status === "success") {
          setUser(response.data);
          setImageUrl(`${base_url}/storage/${response.data.photo}`);
        }
      } catch (error) {
        console.error("Error fetching user profile", error);
      }
    }
    fetchUserProfile();
  }, []);

  const toggleCategory = (category) => {
    setExpandedCategory((prev) => (prev === category ? null : category));
  };

  return (
    <Sidebar
      backgroundColor={colors.primary[400]}
      rootStyles={{ border: 0, height: "100%" }}
      collapsed={collapsed}
      onBackdropClick={() => setToggled(false)}
      toggled={toggled}
      breakPoint="md"
    >
      <Menu
        menuItemStyles={{
          button: { ":hover": { background: "transparent" } },
        }}
      >
        <MenuItem
          rootStyles={{
            margin: "10px 0 20px 0",
            color: colors.gray[100],
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {!collapsed && (
              <Box display="flex" alignItems="center" gap="12px" sx={{ transition: ".3s ease" }}>
                <img style={{ width: "30px", height: "30px", borderRadius: "8px" }} src={logo} alt="Logo" />
                <Typography variant="h6" fontWeight="bold" textTransform="capitalize" color={colors.blueAccent[500]}>
                  {appname}
                </Typography>
              </Box>
            )}
            <IconButton onClick={() => setCollapsed(!collapsed)}>
              <MenuOutlined />
            </IconButton>
          </Box>
        </MenuItem>
      </Menu>

      <Box mb={5} pl={collapsed ? undefined : "5%"}>

        {permissions.dashboard && (
          <Typography
            variant="h6"
            color={colors.gray[300]}
            sx={{
              m: "15px 0 5px 20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              ":hover": {
                color: colors.blueAccent[700],
              },
            }}
            onClick={() => navigate("/")}
          >
            <DashboardOutlined sx={iconStyle} />
            {!collapsed ? "Dashboard" : ""}
          </Typography>
        )}


        {/* Category - HRMS */}
        {permissions.hrms && (<Typography
          variant="h6"
          color={colors.gray[300]}
          sx={{
            m: "15px 0 5px 20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            ":hover": {
              color: colors.blueAccent[700],
            },
          }}
          onClick={() => toggleCategory("hrms")}
        >
          <PeopleAltOutlined sx={iconStyle} />
          {!collapsed ? "HRMS" : ""}
        </Typography>)}

        <Collapse in={expandedCategory === "hrms"}>
          <Menu
            menuItemStyles={{
              button: {
                ":hover": {
                  color: "#868dfb",
                  background: "transparent",
                  transition: ".4s ease",
                },
              },
            }}
          >
            <Item title="Employee" path="/employee-list-view" colors={colors} icon={<ContactsOutlined sx={iconStyle} />} />
            <Item title="Department" path="/department-wise-emp" colors={colors} icon={<PersonOutlined sx={iconStyle} />} />
          </Menu>
        </Collapse>

        {/* Category - Attendance */}
        {permissions.attendance && (
          <Typography
            variant="h6"
            color={colors.gray[300]}
            sx={{
              m: "15px 0 5px 20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              ":hover": {
                color: colors.blueAccent[700],
              },
            }}
            onClick={() => toggleCategory("attendance")}
          >
            <CalendarTodayOutlined sx={iconStyle} />
            {!collapsed ? "Attendance" : ""}
          </Typography>
        )}

        <Collapse in={expandedCategory === "attendance"}>
          <Menu
            menuItemStyles={{
              button: {
                ":hover": {
                  color: "#868dfb",
                  background: "transparent",
                  transition: ".4s ease",
                },
              },
            }}
          >
            <Item title="Today Attendance" path="/check-in-out" colors={colors} icon={<EventNoteOutlined sx={iconStyle} />} />
            <Item title="Attendance Report" path="/employee-attendance-report" colors={colors} icon={<ListAltOutlined sx={iconStyle} />} />
            <Item title="Request Leave" path="/leave-manage-form" colors={colors} icon={<AddTaskOutlined sx={iconStyle} />} />
            <Item title="My Leave Request" path="/user-leave-request" colors={colors} icon={<EngineeringOutlined sx={iconStyle} />} />
            <Item title="Leave Manager" path="/admin-leave-manage" colors={colors} icon={<AccountCircleOutlined sx={iconStyle} />} />
            <Item title="Attendance Adjustment" path="/attendance-adjustment" colors={colors} icon={<AccountCircleOutlined sx={iconStyle} />} />
          </Menu>
        </Collapse>

        {/* Category - Task */}
        {permissions.task && (
          <Typography
            variant="h6"
            color={colors.gray[300]}
            sx={{
              m: "15px 0 5px 20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              ":hover": {
                color: colors.blueAccent[700],
              },
            }}
            onClick={() => toggleCategory("task")}
          >
            <AssignmentOutlined sx={iconStyle} />
            {!collapsed ? "Task" : ""}
          </Typography>
        )}

        <Collapse in={expandedCategory === "task"}>
          <Menu
            menuItemStyles={{
              button: {
                ":hover": {
                  color: "#868dfb",
                  background: "transparent",
                  transition: ".4s ease",
                },
              },
            }}
          >
            <Item title="My Tasks" path="/my-task-tab" colors={colors} icon={<TaskAltOutlined sx={iconStyle} />} />
            <Item title="All Tasks" path="/all-task" colors={colors} icon={<FolderSharedOutlined sx={iconStyle} />} />
            <Item title="Task Calendar" path="/task-by-calendar" colors={colors} icon={<FolderSharedOutlined sx={iconStyle} />} />
          </Menu>
        </Collapse>
        {permissions.task && (
          <Typography
            variant="h6"
            color={colors.gray[300]}
            sx={{
              m: "15px 0 5px 20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              ":hover": {
                color: colors.blueAccent[700],
              },
            }}
            onClick={() => toggleCategory("project")}
          >
            <WorkOutlineOutlined sx={iconStyle} />
            {!collapsed ? "Project" : ""}
          </Typography>
        )}
        {/* Category - Project */}

        <Collapse in={expandedCategory === "project"}>
          <Menu
            menuItemStyles={{
              button: {
                ":hover": {
                  color: "#868dfb",
                  background: "transparent",
                  transition: ".4s ease",
                },
              },
            }}
          >
            <Item title="Add Project" path="/add-project" colors={colors} icon={<AddTaskOutlined sx={iconStyle} />} />
            <Item title="Projects List" path="/project-list" colors={colors} icon={<ViewListOutlined sx={iconStyle} />} />
          </Menu>
        </Collapse>
        {permissions.prospect && (
          <Typography
            variant="h6"
            color={colors.gray[300]}
            sx={{
              m: "15px 0 5px 20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              ":hover": {
                color: colors.blueAccent[700],
              },
            }}
            onClick={() => toggleCategory("prospect")}
          >
            <SupervisorAccountOutlined sx={iconStyle} />
            {!collapsed ? "Leads" : ""}
          </Typography>
        )}
        {/* Category - Leads */}

        <Collapse in={expandedCategory === "prospect"}>
          <Menu
            menuItemStyles={{
              button: {
                ":hover": {
                  color: "#868dfb",
                  background: "transparent",
                  transition: ".4s ease",
                },
              },
            }}
          >
            <Item title="Sales Pipeline" path="/prospect-list-by-stage" colors={colors} icon={<PieChartOutlined sx={iconStyle} />} />
            <Item title="Facebook Leads" path="/facebook-leads" colors={colors} icon={<FaceOutlined sx={iconStyle} />} />
            <Item title="Opportunity" path="/opportunity-by-stage" colors={colors} icon={<FaceOutlined sx={iconStyle} />} />
            <Item title="Contact Form Leads" path="/contact-us" colors={colors} icon={<FaceOutlined sx={iconStyle} />} />
            <Item title="Effort Calculation" path="/effort-calculation" colors={colors} icon={<CalculateOutlined sx={iconStyle} />} />
            <Item title="Prospect Report" path="/prospect-report-monthwise" colors={colors} icon={<BarChartOutlined sx={iconStyle} />} />
            <Item title="Sourcewise Report" path="/source-wise-prospect-report" colors={colors} icon={<SourceOutlined sx={iconStyle} />} />
            <Item title="Warehouses" path="/map-markers" colors={colors} icon={<SourceOutlined sx={iconStyle} />} />
          </Menu>
        </Collapse>
        {permissions.prospect && (
          <Typography
            variant="h6"
            color={colors.gray[300]}
            sx={{
              m: "15px 0 5px 20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              ":hover": {
                color: colors.blueAccent[700],
              },
            }}
            onClick={() => toggleCategory("warehouse")}
          >
            <SupervisorAccountOutlined sx={iconStyle} />
            {!collapsed ? "Warehouses" : ""}
          </Typography>
        )}
        {/* Category - Leads */}

        <Collapse in={expandedCategory === "warehouse"}>
          <Menu
            menuItemStyles={{
              button: {
                ":hover": {
                  color: "#868dfb",
                  background: "transparent",
                  transition: ".4s ease",
                },
              },
            }}
          >
           
            <Item title="Warehouses Map" path="/map-markers" colors={colors} icon={<SourceOutlined sx={iconStyle} />} />
            <Item title="Warehouses List" path="/warehouse-list" colors={colors} icon={<SourceOutlined sx={iconStyle} />} />
          </Menu>
        </Collapse>
        {/* Category - Clients */}
        {permissions.client && (
          <Typography
            variant="h6"
            color={colors.gray[300]}
            sx={{
              m: "15px 0 5px 20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              ":hover": {
                color: colors.blueAccent[700],
              },
            }}
            onClick={() => toggleCategory("client")}
          >
            <AssignmentIndOutlined sx={iconStyle} />
            {!collapsed ? "Clients" : ""}
          </Typography>
        )}

        <Collapse in={expandedCategory === "client"}>
          <Menu
            menuItemStyles={{
              button: {
                ":hover": {
                  color: "#868dfb",
                  background: "transparent",
                  transition: ".4s ease",
                },
              },
            }}
          >
            <Item title="Clients" path="/client-list" colors={colors} icon={<ContactsOutlined sx={iconStyle} />} />
            {/* <Item title="Sale" path="/software-sale" colors={colors} icon={<ContactsOutlined sx={iconStyle} />} /> */}
          </Menu>
        </Collapse>
        {/* Sale - Product */}
 
        {permissions.sale && (
          <Typography
            variant="h6"
            color={colors.gray[300]}
            sx={{
              
              m: "15px 0 5px 20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              ":hover": {
                color: colors.blueAccent[700],
              },
            }}
            onClick={() => toggleCategory("setting")}
          >
            <SettingsOutlined sx={iconStyle} />
            {!collapsed ? "Sale" : ""}
          </Typography>
        )}
  
        <Collapse in={expandedCategory === "sale"}>
          <Menu
            menuItemStyles={{
              button: {
                ":hover": {
                  color: "#868dfb",
                  background: "transparent",
                  transition: ".4s ease",
                },
              },
            }}
          >
            <Item title="Stock List" path="/all-stock" colors={colors} icon={<ContactsOutlined sx={iconStyle} />} />
            <Item title="Product List" path="/product-list" colors={colors} icon={<ContactsOutlined sx={iconStyle} />} />
            <Item title="POS Manager" path="/pos-page" colors={colors} icon={<ContactsOutlined sx={iconStyle} />} />
            <Item title="All Order" path="/all-order" colors={colors} icon={<ContactsOutlined sx={iconStyle} />} />
            {/* <Item title="Sale" path="/software-sale" colors={colors} icon={<ContactsOutlined sx={iconStyle} />} /> */}
          </Menu>
        </Collapse>
        {permissions.setting && (
          <Typography
            variant="h6"
            color={colors.gray[300]}
            sx={{
              m: "15px 0 5px 20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              ":hover": {
                color: colors.blueAccent[700],
              },
            }}
            onClick={() => toggleCategory("setting")}
          >
            <SettingsOutlined sx={iconStyle} />
            {!collapsed ? "Setting" : ""}
          </Typography>
        )}
        {/* Category - Setting */}

        <Collapse in={expandedCategory === "setting"}>
          <Menu
            menuItemStyles={{
              button: {
                ":hover": {
                  color: "#868dfb",
                  background: "transparent",
                  transition: ".4s ease",
                },
              },
            }}
          >
            <Item title="Add Department" path="/department-view" colors={colors} icon={<AdminPanelSettingsOutlined sx={iconStyle} />} />
            <Item title="Add Designation" path="/designation-view" colors={colors} icon={<AdminPanelSettingsOutlined sx={iconStyle} />} />
            <Item title="Add Role" path="/role-view" colors={colors} icon={<AdminPanelSettingsOutlined sx={iconStyle} />} />
            <Item title="Add Task Priority" path="/task-priority" colors={colors} icon={<AdminPanelSettingsOutlined sx={iconStyle} />} />
            <Item title="Add Task Status" path="/task-status" colors={colors} icon={<AdminPanelSettingsOutlined sx={iconStyle} />} />
            <Item title="Add Task Type" path="/task-type" colors={colors} icon={<AdminPanelSettingsOutlined sx={iconStyle} />} />
            <Item title="Product Entry" path="/product-entry" colors={colors} icon={<AdminPanelSettingsOutlined sx={iconStyle} />} />
       
        
            <Item title="Feature Permission" path="/user-feature-permission" colors={colors} icon={<AdminPanelSettingsOutlined sx={iconStyle} />} />
          </Menu>
        </Collapse>
      </Box>
    </Sidebar>
  );
};

export default SideBar;
