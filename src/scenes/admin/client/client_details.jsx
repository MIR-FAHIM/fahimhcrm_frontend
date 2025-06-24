import React, { useState, useEffect } from "react";
import {
    Box, Typography, Button, Card, CardContent, TextField, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid, Tooltip, Stack, Slider, Tabs, Tab, Divider,CircularProgress, CircularProgress as MuiCircularProgress,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";


// APIs
import {
 
    getClientDetails
} from "../../../api/controller/admin_controller/client_controller";



// Components for each tab


const ClientDetails = () => {
  const navigate = useNavigate();
   
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [clientDetails, setClientDetails] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientDetails();
  }, []);

  const fetchClientDetails = async () => {
    setLoading(true);
    try {
      const res = await getClientDetails(id);
      setClientDetails(res.data || {});
     
    } catch (error) {
      console.error("Error fetching setClientDetails details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) return <MuiCircularProgress />;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* Left Side – Project Info */}
      <Box
            sx={{
              width: { xs: '100%', md: 320 },
              p: { xs: 2, md: 3 },
              borderRight: { xs: 'none', md: '1px solid #e0e0e0' },
              backgroundColor: '#fff',
              mb: { xs: 2, md: 0 },
            }}
          >
            <Typography variant="h5" fontWeight={700} mb={3}>
              📁 Client Details
            </Typography>
    
            <Typography variant="subtitle1" fontWeight={600}>Client Name</Typography>
            <Typography variant="body2" mb={2}>{clientDetails.prospect?.prospect_name} (ID: {clientDetails.prospect.id})</Typography>
            <Typography variant="subtitle1" fontWeight={600}>Address</Typography>
            <Typography variant="body2" mb={2}>{clientDetails.prospect?.address}</Typography>
            <Typography variant="subtitle1" fontWeight={600}>Website</Typography>
            <Typography variant="body2" mb={2}>{clientDetails.prospect?.website_link}</Typography>
            <Typography variant="subtitle1" fontWeight={600}>Note</Typography>
            <Typography variant="body2" mb={2}>{clientDetails.prospect?.note}</Typography>
            <Typography variant="subtitle1" fontWeight={600}>Industry</Typography>
            <Typography variant="body2" mb={2}>{clientDetails.prospect?.industry_type?.industry_type_name}</Typography>
            <Typography variant="subtitle1" fontWeight={600}>Information Source</Typography>
            <Typography variant="body2" mb={2}>{clientDetails.prospect?.information_source?.information_source_name}</Typography>
            <Typography variant="subtitle1" fontWeight={600}>Created At</Typography>
            <Typography variant="body2" mb={2}>{dayjs(clientDetails.prospect?.created_at).format("MMM D, YYYY · h:mm A")}</Typography>
        
    
        
    
    
    
    
    
    
            
    

          </Box>

      {/* Right Side – Tabs and Content */}
      <Box sx={{ flex: 1, p: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="Project Tabs">
          <Tab label="Tickets" />
          <Tab label="Tasks" />
          <Tab label="Communications" />
          <Tab label="Files" />
         
        </Tabs>

        <Divider sx={{ my: 2 }} />

        {/* Tab Content */}
        {activeTab === 0 && (
            <Box/>
          
        )}

        {activeTab === 1 && (
 <Box/>
        )}
        {activeTab === 2 && (
 <Box/>
        )}
        {activeTab === 3 && (
 <Box/>
        )}
      </Box>
    </Box>
  );
};

export default ClientDetails;
