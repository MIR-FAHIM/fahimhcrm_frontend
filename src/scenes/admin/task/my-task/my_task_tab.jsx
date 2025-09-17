import React, { useState } from "react";
import MyTaskTable from "./get_my_tasks";
import AllTaskByStatus from "./task_by_status";
import TaskTable from "./my_task_table";
import MyWaitingTask from "./my_waiting_task";
import QuickAddTask from "../components_task/quick_add_task";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../../../theme";
import {
  Box,
  Tabs,
  Tab,
  Button,
  Typography,
  Divider,
  Paper,
  useTheme
} from "@mui/material";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      style={{ height: "100%" }}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2, height: "100%", overflowY: "auto" }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const MyTaskTabs = () => {
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const handleNavigation = () =>
    navigate("/add-task", {
      state: {
        project_id: 0,
        project_phase_id: 0,
      },
    });
  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box
      sx={{
        width: "100%", // Adjusted to 100%
        minHeight: "100vh", // Use minHeight for better content handling
        bgcolor: colors.gray[900],
        display: "flex", // Use flexbox for centering
        justifyContent: "center", // Center horizontally
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",

          maxWidth: 1500, // Set a max-width for the page
          height: "100%",
          minHeight: "100vh", // Use minHeight to fill the page
          display: "flex",
          flexDirection: "column",
          boxShadow: "none",
        }}
      >
        <Box
          sx={{
            bgcolor: colors.gray[900],
            borderBottom: 0,
            borderColor: colors.gray[900],
            px: 3,
            pt: 2,
            // The tabs and quick add component also need to be centered
          }}
        >
          <Box sx={{ p: 2, mx: "auto" }}>
            <QuickAddTask
              placeholder="Quick add a new task for yourself..."
              onCreated={(task) => console.log("Created:", task)}
            />
          </Box>
          <Tabs value={tabValue} onChange={handleChange}>
            <Tab label="Task By Status View" />
            <Tab label="Task By Card View" />
            <Tab label="Task Table View" />
            <Tab label="Waiting Task" />
          </Tabs>
        </Box>

        <Divider />

        {/* Main content area with scroll */}
        <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
          <TabPanel value={tabValue} index={0}>
            <AllTaskByStatus />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <MyTaskTable />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <TaskTable />
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
            <MyWaitingTask />
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  );
};

export default MyTaskTabs;