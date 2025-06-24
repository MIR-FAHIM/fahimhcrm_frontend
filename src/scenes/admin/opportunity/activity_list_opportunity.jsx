import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import LogActivityList from "../prospect/prospect_log_activity/fetch_prospect_log_activity";
import { getAllLogActivityOfProspect } from "../../../api/controller/admin_controller/prospect_controller";
import { Box, Typography } from "@mui/material";

export default function OpportunityActivity() {
  const { id } = useParams();
  const [logActivityList, setLogActivityList] = useState([]);

  const fetchLogActivities = async () => {
    try {
      const logActivityRes = await getAllLogActivityOfProspect(id);
      if (logActivityRes.status === true) {
        setLogActivityList(logActivityRes.data);
      }
    } catch (error) {
      console.error("Error fetching log activities:", error);
    }
  };

  useEffect(() => {
    fetchLogActivities();
  }, [id]);

  return (
    <Box sx={{ p: 3, backgroundColor: "#eef2f7", minHeight: "100vh" }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "#1e293b" }}>
        Opportunity Log Activities
      </Typography>
      <LogActivityList id={id} logActivityListData={logActivityList} />
    </Box>
  );
}
