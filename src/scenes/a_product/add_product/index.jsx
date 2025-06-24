import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Paper } from '@mui/material';
import GeneralProductInfo from '../add_product/general_information'; // Import GeneralProductInfo
import AddProductImages from '../add_product/product_image_add'; // Import GeneralProductInfo
import AddProductVideo from '../add_product/video_link_add'; // Import GeneralProductInfo
import AddProductStrategy from '../add_product/strategy_add'; // Import GeneralProductInfo

// Tab content for each section






// Main Tab Bar Component
const AddProductManagement = () => {
  const [value, setValue] = useState(0); // State to track active tab

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  // Render the content based on the active tab
  const renderTabContent = (index) => {
    switch (index) {
      case 0:
        return <GeneralProductInfo />;
      case 1:
        return <AddProductImages />;
      case 2:
        return <AddProductVideo />;
      case 3:
        return <AddProductStrategy />;
      default:
        return <GeneralProductInfo />; // Ensure it falls back to GeneralProductInfo
    }
  };

  return (
    <Box sx={{ width: '100%',  }}>
      <Paper square>
        <Tabs
          value={value}
          onChange={handleTabChange}
          aria-label="Tab Bar Example"
          variant="fullWidth"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: 'blue', // Blue indicator for selected tab
            },
          }}
        >
             <Tab
            label="General Information"
            sx={{
              color: value === 0 ? 'blue' : 'inherit', // Blue text for selected tab
              '&.Mui-selected': {
                color: 'blue', // Ensure text color is blue for selected tab
              },
            }}
          />
          <Tab
            label="Image"
            sx={{
              color: value === 1 ? 'blue' : 'inherit', // Blue text for selected tab
              '&.Mui-selected': {
                color: 'blue', // Ensure text color is blue for selected tab
              },
            }}
          />
          <Tab
            label="Video"
            sx={{
              color: value === 2 ? 'blue' : 'inherit', // Blue text for selected tab
              '&.Mui-selected': {
                color: 'blue', // Ensure text color is blue for selected tab
              },
            }}
          />
          <Tab
            label="Strategy"
            sx={{
              color: value === 3 ? 'blue' : 'inherit', // Blue text for selected tab
              '&.Mui-selected': {
                color: 'blue', // Ensure text color is blue for selected tab
              },
            }}
          />
        </Tabs>
      </Paper>

      <Box sx={{ padding: 2 }}>
        {renderTabContent(value)} {/* Render the content of the active tab */}
      </Box>
    </Box>
  );
};

export default AddProductManagement;
