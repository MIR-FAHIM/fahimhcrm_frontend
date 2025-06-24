import React, { useState, useEffect } from "react";
import OpportunityDetailsPage from "./opportunity_details";

import OpportunityActivity from "./activity_list_opportunity";
import QuotationByProspect from "../quotation/get_quotation_by_prospect";
import {

  getOpportunityDetail,
} from "../../../api/controller/admin_controller/opportunity_controller";
import { useNavigate, useParams } from "react-router-dom";
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

const OpportunityTabs = () => {
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  const {id} = useParams();
  const [prospectID, setProspectID] = useState(0);

  const getOpportunityDetailsFunc = async () => {
    try {
      const detailsOpporRes = await getOpportunityDetail(id);

      if (detailsOpporRes.status === "success") {
        const opportunityData = detailsOpporRes.data;
        const prospectIdd = opportunityData.prospect_id;


        setProspectID(prospectIdd); // still update state if needed


      }
    } catch (error) {
      console.error("Error in getOpportunityDetails:", error);
    }
  };
  useEffect(() => {
    getOpportunityDetailsFunc();
  });


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
            <Tab label="Details" />
            <Tab label="Activity" />
            <Tab label="Quotation" />
            <Tab label="Highligts" />
            <Tab label="Attachments" />
          </Tabs>
        </Box>

        <Divider />

        {/* Main content area with scroll */}
        <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
          <TabPanel value={tabValue} index={0}>
            <OpportunityDetailsPage />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>

            <OpportunityActivity id={prospectID}/>
          </TabPanel>
          <TabPanel value={tabValue} index={2}>

            <QuotationByProspect prosID={prospectID} />
          </TabPanel>
          <TabPanel value={tabValue} index={3}>

            <OpportunityActivity id={prospectID} />
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  );
};

export default OpportunityTabs;
