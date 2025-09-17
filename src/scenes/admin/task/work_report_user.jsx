import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  useTheme,
  Collapse,
  IconButton
} from '@mui/material';
import dayjs from 'dayjs';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {  getAllWorkReport } from "../../../api/controller/admin_controller/task_controller/task_controller";


const WorkReportList = () => {
  const theme = useTheme();
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDate, setExpandedDate] = useState(null);

  // Helper function to fetch the reports from the API
  const fetchReports = async () => {
    try {
      const res = await getAllWorkReport();
      if (res.status === 'success') {
        setReports(res.reports);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Helper function to render a report as a bulleted list
  const renderReportText = (reportText) => {
    // Split the single string by newlines to get individual tasks
    const tasks = reportText.split('\n');
    return (
      <List dense sx={{ pl: 2, listStyleType: 'disc' }}>
        {tasks.map((task, index) => (
          <ListItem key={index} sx={{ display: 'list-item', py: 0 }}>
            <ListItemText primary={task} sx={{ color: theme.palette.text.secondary }} />
          </ListItem>
        ))}
      </List>
    );
  };

  // Toggles the expansion state for a given date
  const handleToggleExpand = (date) => {
    setExpandedDate(expandedDate === date ? null : date);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!reports || Object.keys(reports).length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No work reports found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom color="text.primary">
        Work Reports
      </Typography>
      <Divider sx={{ mb: 4 }} />

      {/* Map through the dates (keys of the reports object) */}
      {Object.entries(reports).map(([date, reportsOnDate]) => (
        <Paper key={date} sx={{ p: 3, mb: 4, borderRadius: '8px' }}>
          {/* Collapsible header for each date */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              pr: 2,
            }}
            onClick={() => handleToggleExpand(date)}
          >
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              {dayjs(date).format('MMMM D, YYYY')}
            </Typography>
            <IconButton
              sx={{
                transform: expandedDate === date ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s',
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>
          
          {/* The content that collapses and expands */}
          <Collapse in={expandedDate === date} timeout="auto" unmountOnExit>
            {reportsOnDate.map((report) => (
              <Box key={report.id} sx={{ mt: 2, mb: 3 }}>
                <Divider sx={{ my: 2 }} />
                {/* Display the user's name */}
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, color: theme.palette.info.main }}>
                  Report from: {report.user.name}
                </Typography>
                
                {/* Render the report text as a bulleted list */}
                {renderReportText(report.report_text)}
              </Box>
            ))}
          </Collapse>
        </Paper>
      ))}
    </Box>
  );
};

export default WorkReportList;