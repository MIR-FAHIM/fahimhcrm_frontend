import React, { useState } from "react";
import MyTaskTable from "./get_my_tasks";
import AllTaskByStatus from "./task_by_status";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Tabs,
  Tab,
  Button,
  Typography,
  Divider,
  Paper,
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
  const handleNavigation = () => navigate("/add-task", {
      state: {
        'project_id': 0,
        'project_phase_id': 0,
      },
    });
  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        bgcolor: "#f9f9f9",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          boxShadow: "none",
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3, pt: 2 }}>
        <Button variant="contained" color="secondary" sx={{ borderRadius: "25px" }} onClick={handleNavigation}>
                            + Add Task
                        </Button>
          <Tabs value={tabValue} onChange={handleChange}>
            <Tab label="Task By Status View" />
            <Tab label="Task By Card View" />
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
        </Box>
      </Paper>
    </Box>
  );
};

export default MyTaskTabs;
