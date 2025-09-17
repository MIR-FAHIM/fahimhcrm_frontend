import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  Typography,
  Button,
  useTheme,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { addWorkReport, getWorkReportByUser } from "../../../api/controller/admin_controller/task_controller/task_controller";

const DailyWorkReport = () => {
  const theme = useTheme();
  const [reportEntries, setReportEntries] = useState([]);
  const [previousReports, setPreviousReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs()); // Defaults to today

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await getWorkReportByUser(1); // Assuming user ID 1
        if (res.status === 'success') {
          setPreviousReports(res.reports);
        }
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && inputText.trim() !== '') {
      const trimmedText = inputText.trim();
      let status = 'none';

      if (trimmedText.toLowerCase().includes('com')) {
        status = 'completed';
      } else if (trimmedText.toLowerCase().includes('on')) {
        status = 'ongoing';
      }

      const newEntry = {
        id: Date.now(),
        text: trimmedText.replace(/com|on/gi, '').trim(),
        status,
      };

      setReportEntries([...reportEntries, newEntry]);
      setInputText('');
    }
  };

  const handleSaveReport = async () => {
    if (reportEntries.length === 0) {
      alert("Please enter at least one task before submitting.");
      return;
    }

    const formattedReport = reportEntries.map(entry => {
      let statusText = '';
      if (entry.status === 'completed') {
        statusText = ' (Completed)';
      } else if (entry.status === 'ongoing') {
        statusText = ' (Ongoing)';
      }
      return `- ${entry.text}${statusText}`;
    }).join('\n');

    const reportData = {
      user_id: 1, // You should get this from your user's context or state
      report_text: formattedReport,
      report_date: selectedDate.format('YYYY-MM-DD'),
      type: 'daily',
      is_active: true,
    };

    try {
      const res = await addWorkReport(reportData);
      if (res.status === 'success') {
        alert("Report submitted successfully!");
        setReportEntries([]);
        setSelectedDate(dayjs());
        // Refresh the previous reports list
        const updatedRes = await getWorkReportByUser(1);
        if (updatedRes.status === 'success') {
          setPreviousReports(updatedRes.reports);
        }
      } else {
        alert("Submission failed. Please try again.");
      }
    } catch (error) {
      console.error("Failed to submit report:", error);
      alert("An error occurred. Check the console for details.");
    }
  };

  return (
    <Box sx={{ p: 4, backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom color="text.primary">
        Daily Work Report
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Report Date"
          value={selectedDate}
          onChange={(newValue) => setSelectedDate(newValue)}
          renderInput={(params) => <TextField {...params} />}
          sx={{ mb: 2, width: '100%' }}
        />
      </LocalizationProvider>

      <TextField
        fullWidth
        variant="outlined"
        label="Enter your task and press Enter"
        placeholder="e.g., Finished project documentation com"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ mb: 2 }}
      />

      <List>
        {reportEntries.map((entry) => (
          <ListItem
            key={entry.id}
            sx={{
              backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
              borderRadius: '8px',
              my: 1,
              borderLeft: `5px solid ${entry.status === 'completed' ? theme.palette.success.main : entry.status === 'ongoing' ? theme.palette.warning.main : theme.palette.info.main}`,
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1" color="text.primary">
                    {entry.text}
                  </Typography>
                  {entry.status === 'completed' && (
                    <Typography variant="body2" sx={{ ml: 1, color: theme.palette.success.main, fontWeight: 'bold' }}>
                      (Completed)
                    </Typography>
                  )}
                  {entry.status === 'ongoing' && (
                    <Typography variant="body2" sx={{ ml: 1, color: theme.palette.warning.main, fontWeight: 'bold' }}>
                      (Ongoing)
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>

      {reportEntries.length > 0 && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveReport}
          sx={{ mt: 2 }}
        >
          Submit Report
        </Button>
      )}

      ---

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary">
          Previous Reports
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          previousReports && Object.entries(previousReports).map(([date, reports]) => (
            <Box key={date} sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight="bold" color="text.secondary">
                {dayjs(date).format('MMMM D, YYYY')}
              </Typography>
              <List sx={{ ml: 2 }}>
                {reports.map((report) => (
                  <Box key={report.id} sx={{ mb: 2 }}>
                    {report.report_text.split('\n').map((line, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={
                            <Typography variant="body1" color="text.primary">
                              {line}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </Box>
                ))}
              </List>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default DailyWorkReport;