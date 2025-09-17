import React, { useState } from "react";
import OrganizationForm from "./organization_prospect_form";
import IndividualForm from "./individual_propsect_form";
import {
  Box,
  Tabs,
  Tab,
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
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const AddProspectTabs = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Paper elevation={3} sx={{ width: "100%", maxWidth: 800, mx: "auto", mt: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2, pt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Add New Lead
        </Typography>
        <Tabs value={tabValue} onChange={handleChange}>
          <Tab label="Individual" />
          <Tab label="Organization" />
        </Tabs>
      </Box>

      <Divider />

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {/* ⬇️ You can insert the Individual form here */}
        <IndividualForm/>
       
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        {/* ⬇️ You can insert the Organization form here */}
        <OrganizationForm />
      </TabPanel>
    </Paper>
  );
};

export default AddProspectTabs;
