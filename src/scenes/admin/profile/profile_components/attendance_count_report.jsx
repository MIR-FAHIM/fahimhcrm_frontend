import { Box, Grid, Typography, CircularProgress, Alert, Paper, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { getAttendanceCountData } from "../../../../api/controller/admin_controller/attendance_controller";
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

// The userId prop is now used to identify the user for the report
const AttendanceCountReport = ({ userId, name }) => {
  // State for the selected date range
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  
  // State for the fetched report data
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to handle fetching data
  const fetchAttendance = async () => {
    // Validate that both dates are selected
    if (!selectedStartDate || !selectedEndDate) {
      setError("Please select both a start and end date.");
      return;
    }

    setLoading(true);
    setError(null);

    // Format dates to YYYY-MM-DD
    const startDateFormatted = dayjs(selectedStartDate).format('YYYY-MM-DD');
    const endDateFormatted = dayjs(selectedEndDate).format('YYYY-MM-DD');

    try {
      // API call using the selected dates and provided userId
      const response = await getAttendanceCountData({
        user_id: userId,
        start_date: startDateFormatted,
        end_date: endDateFormatted,
      });

      if (response.status === 'success') {
        setData(response);
      } else {
        setError(response.message || 'Failed to fetch attendance data.');
        setData(null); // Clear previous data on error
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setError('An error occurred while fetching attendance data.');
      setData(null); // Clear previous data on error
    } finally {
      setLoading(false);
    }
  };

  // Define attendance metrics here, after data is loaded and no error
  const attendanceMetrics = data ? [
    { label: "Working Days", value: data.summary.working_days, icon: <EventAvailableIcon color="primary" sx={{ fontSize: 40 }} /> },
    { label: "Absent Days", value: data.summary.absent_days, icon: <PersonOffIcon color="error" sx={{ fontSize: 40 }} /> },
    { label: "Late Days", value: data.summary.late_days, icon: <AccessAlarmIcon color="warning" sx={{ fontSize: 40 }} /> },
    { label: "On-Time Days", value: data.summary.on_time_days, icon: <CheckCircleOutlineIcon color="success" sx={{ fontSize: 40 }} /> },
    { label: "Work From Home Days", value: data.summary.work_from_home_days, icon: <HomeWorkIcon color="info" sx={{ fontSize: 40 }} /> },
  ] : [];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4, color: '#333' }}>
        Attendance Summary Report of {name}
      </Typography>

      {/* Date Selection View */}
      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: 4, borderRadius: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4}>
              <DatePicker
                label="Start Date"
                value={selectedStartDate}
                onChange={(newValue) => setSelectedStartDate(newValue)}
                format="YYYY-MM-DD"
                disableFuture // Disables future dates
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <DatePicker
                label="End Date"
                value={selectedEndDate}
                onChange={(newValue) => setSelectedEndDate(newValue)}
                format="YYYY-MM-DD"
                disableFuture // Disables future dates
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                color="primary"
                onClick={fetchAttendance}
                disabled={loading || !selectedStartDate || !selectedEndDate}
                fullWidth
                sx={{ height: '56px' }} // Match the height of the date pickers
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Report'}
              </Button>
            </Grid>
          </Grid>
        </LocalizationProvider>
      </Paper>

      {/* Conditional Rendering of the Report */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>Generating report...</Typography>
        </Box>
      ) : error ? (
        <Box padding={4}>
          <Alert severity="error">{error}</Alert>
        </Box>
      ) : data ? (
        <>
          <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: 4, borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="textSecondary">
                  <Box component="span" sx={{ fontWeight: 'bold' }}>User ID:</Box> {data.user_id}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="textSecondary" align="right">
                  <Box component="span" sx={{ fontWeight: 'bold' }}>Date Range:</Box> {data.date_range.start} to {data.date_range.end}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Grid container spacing={3}>
            {attendanceMetrics.map((metric) => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={metric.label}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 150,
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    },
                    borderRadius: 2,
                    backgroundColor: '#ffffff',
                  }}
                >
                  {metric.icon}
                  <Typography variant="h6" component="div" sx={{ mt: 1, textAlign: 'center', color: '#555' }}>
                    {metric.label}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1, color: '#333' }}>
                    {metric.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            Select a date range and click 'Generate Report' to view attendance data.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AttendanceCountReport;