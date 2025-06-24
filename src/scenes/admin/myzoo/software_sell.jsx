import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,

    Paper,
    Tabs,
    Tab,

} from "@mui/material";

const SoftwareSell = () => {
    const [activeTab, setActiveTab] = useState(0); // Tab control (Software Details, Commitment, Payment, Procedure)
 
 
    // Fetch employee profile when the component is mounted
    useEffect(() => {
        // Simulate fetching profile data
        

       
    }, []);

    

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        
    };

    return (
        <Box p={3}>
            <Paper sx={{ padding: 2 }}>
                {/* Tabs Section */}
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="Software Offer">
                    <Tab label="Software Details" />
                    <Tab label="Commitment" />
                    <Tab label="Payment" />
                    <Tab label="Procedure" />
                </Tabs>

                {/* Content Section */}
                {activeTab === 0 && (
                    <Box>
                        <Typography variant="h6">Software Details</Typography>
                        {/* Add your content for Software Details here */}
                    </Box>
                )}

                {/* Commitment Tab */}
                {activeTab === 1 && (
                    <Box>
                        <Typography variant="h6">Commitment</Typography>
                        {/* Add your content for Commitment here */}
                    </Box>
                )}

                {/* Payment Tab */}
                {activeTab === 2 && (
                    <Box>
                        <Typography variant="h6">Payment</Typography>
                        {/* Add your content for Payment here */}
                    </Box>
                )}

                {/* Procedure Tab */}
                {activeTab === 3 && (
                    <Box>
                        <Typography variant="h6">Procedure</Typography>
                        {/* Add your content for Procedure here */}
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default SoftwareSell;
