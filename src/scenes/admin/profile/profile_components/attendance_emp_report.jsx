import React from 'react';
import {
  Box, Typography, CircularProgress, Grid, Paper,
  FormControl, InputLabel, Select, MenuItem, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Link, Chip, TextField
} from '@mui/material';
import { useTheme } from '@mui/material/styles'; // Import useTheme hook

import { AccessAlarm, CheckCircle, Warning, PriorityHigh } from '@mui/icons-material';

// Helper function to format time
const formatTime = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Helper function to calculate total duration
const calculateDuration = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return null;
  const inTime = new Date(checkIn);
  const outTime = new Date(checkOut);
  if (isNaN(inTime.getTime()) || isNaN(outTime.getTime())) return null;

  const diffMs = outTime.getTime() - inTime.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours < 0 || diffMinutes < 0) return 'Invalid duration';

  return `${diffHours}h ${diffMinutes}m`;
};

// Helper function to render status with colors and icons
const renderStatus = (value) => {
  if (value === null || value === undefined || value === "") {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', fontSize: '0.875rem', fontWeight: 'medium' }}>
        <PriorityHigh sx={{ fontSize: '1rem', mr: 0.5, color: 'text.disabled' }} /> No data
      </Box>
    );
  }
  if (typeof value === 'boolean') {
    return value ? (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', bgcolor: 'success.light', color: 'success.dark', px: 1.5, py: 0.5, borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'semibold', minWidth: '60px', justifyContent: 'center' }}>
        <CheckCircle sx={{ fontSize: '0.875rem', mr: 0.5 }} /> Yes
      </Box>
    ) : (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', bgcolor: 'error.light', color: 'error.dark', px: 1.5, py: 0.5, borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'semibold', minWidth: '60px', justifyContent: 'center' }}>
        <Warning sx={{ fontSize: '0.875rem', mr: 0.5 }} /> No
      </Box>
    );
  }
  return <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 'medium' }}>{value}</Typography>;
};

const AttendanceReport = ({
  month,
  year,
  attendanceData,
  loading,
  handleMonthChange,
  handleYearChange,
  handleNavigationMap,
  name
}) => {
  const theme = useTheme(); // Use the theme hook to access palette
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <Box sx={{ p: 3, background: theme.palette.mode === 'dark' ? theme.palette.background.default : 'linear-gradient(to bottom right, #e3f2fd, #ede7f6)', minHeight: '100vh', fontFamily: 'Inter, sans-serif', width: '100%' }}>
      <Paper elevation={8} sx={{ width: '100%', mx: 'auto', bgcolor: 'background.paper', borderRadius: '16px', p: 4, border: `1px solid ${theme.palette.divider}` }}>
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 'extrabold',
            color: 'primary.main',
            mb: 4,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pb: 2,
            borderBottom: `2px solid ${theme.palette.divider}`,
          }}
        >
          <AccessAlarm sx={{ fontSize: '2.5rem', mr: 1, color: 'primary.light' }} />
          Attendance Report of {name}
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Select Year"
              type="number"
              value={year}
              onChange={handleYearChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                borderRadius: '12px',
                bgcolor: 'background.default',
                '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.mode === 'dark' ? 'grey.700' : 'primary.light' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.dark', borderWidth: '2px' },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" sx={{ borderRadius: '12px' }}>
              <InputLabel id="month-select-label">Month</InputLabel>
              <Select
                labelId="month-select-label"
                id="month-select"
                value={month}
                label="Month"
                onChange={handleMonthChange}
                sx={{
                  borderRadius: '12px',
                  bgcolor: 'background.default',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.mode === 'dark' ? 'grey.700' : 'primary.light' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.dark', borderWidth: '2px' },
                }}
              >
                {monthNames.map((monthName, index) => (
                  <MenuItem key={index} value={index + 1}>
                    {monthName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '200px', bgcolor: 'background.default', borderRadius: '12px', p: 3, boxShadow: 1 }}>
            <CircularProgress color="primary" size={60} />
            <Typography variant="h6" sx={{ mt: 2, color: 'text.primary', fontWeight: 'bold' }}>Loading attendance data...</Typography>
          </Box>
        ) : attendanceData.length === 0 ? (
          <Box sx={{ bgcolor: theme.palette.mode === 'dark' ? 'warning.dark' : 'warning.light', border: '1px solid', borderColor: 'warning.main', color: 'text.primary', p: 3, borderRadius: '12px', textAlign: 'center', boxShadow: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Warning sx={{ fontSize: '3rem', mb: 1, color: 'warning.main' }} />
            <Typography variant="h6" fontWeight="semibold">No attendance records found for the selected period.</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>Please select a different month or year to view attendance.</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={4} sx={{ mt: 3, borderRadius: '12px', overflowX: 'auto', border: `1px solid ${theme.palette.divider}` }}>
            <Table sx={{ minWidth: 800 }} aria-label="attendance table">
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.dark' }}>
                  {['Date', 'Weekday', 'Check-in Time', 'Check-out Time', 'Check-in Location', 'Check-out Location', 'Is Late', 'Is Early Leave', 'Work From Home', 'From Field', 'Total Duration'].map(h => (
                    <TableCell key={h} align="center" sx={{ fontWeight: 'bold',  color: '#000000', fontSize: '0.9rem', py: 2 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceData.map((day, index) => {
                  const isWeekend = day.weekend === true;

                  return (
                    <TableRow
                      key={day.date}
                      sx={{
                        backgroundColor: isWeekend ? (theme.palette.mode === 'dark' ? '#1a237e' : '#e3f2fd') : (index % 2 === 0 ? 'background.paper' : theme.palette.action.hover),
                        fontWeight: isWeekend ? 'bold' : 'normal',
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': { bgcolor: 'action.selected', cursor: 'pointer' },
                      }}
                    >
                      <TableCell align="center" sx={{ fontWeight: 'medium', color: 'text.primary', whiteSpace: 'nowrap' }}>
                        {day.date}
                      </TableCell>
                      <TableCell align="center">{renderStatus(day.weekday)}</TableCell>
                      <TableCell align="center">{renderStatus(formatTime(day.attendance?.check_in_time))}</TableCell>
                      <TableCell align="center">{renderStatus(formatTime(day.attendance?.check_out_time))}</TableCell>
                      <TableCell align="center">
                        {day.attendance?.check_in_location ? (
                          <Link
                            component="button"
                            variant="body2"
                            onClick={() => handleNavigationMap(day.attendance?.check_in_lat, day.attendance?.check_in_lon)}
                            sx={{ color: 'info.main', '&:hover': { textDecoration: 'underline' }, fontWeight: 'medium' }}
                          >
                            {day.attendance.check_in_location}
                          </Link>
                        ) : renderStatus(null)}
                      </TableCell>
                      <TableCell align="center">
                        {day.attendance?.check_out_location ? (
                          <Link
                            component="button"
                            variant="body2"
                            onClick={() => handleNavigationMap(day.attendance?.check_out_lat, day.attendance?.check_out_lon)}
                            sx={{ color: 'info.main', '&:hover': { textDecoration: 'underline' }, fontWeight: 'medium' }}
                          >
                            {day.attendance.check_out_location}
                          </Link>
                        ) : renderStatus(null)}
                      </TableCell>
                      <TableCell align="center">
                        {!day.attendance?.check_in_time ? (
                          renderStatus(null)
                        ) : day.attendance?.is_late ? (
                          <Chip label="Late" size="small" color="warning" sx={{ fontWeight: 'bold' }} />
                        ) : (
                          <Chip label="On Time" size="small" color="success" sx={{ fontWeight: 'bold' }} />
                        )}
                      </TableCell>
                      <TableCell align="center">{renderStatus(day.attendance?.is_early_leave)}</TableCell>
                      <TableCell align="center">{renderStatus(day.attendance?.is_work_from_home)}</TableCell>
                      <TableCell align="center">{renderStatus(day.attendance?.from_field)}</TableCell>
                      <TableCell align="center">{renderStatus(day.attendance ? calculateDuration(day.attendance.check_in_time, day.attendance.check_out_time) : null)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default AttendanceReport;