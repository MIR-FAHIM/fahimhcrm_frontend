import React, { useState, useEffect } from "react";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Typography,
  Grid,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addLeave, getLeaveType, getUserLeaveDaysRemain } from "../../../../api/controller/admin_controller/leave_manage/leave_manage";
import { useNavigate } from "react-router-dom";


const LeaveManagement = () => {
  const [leaveType, setLeaveType] = useState("");
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveData, setLeaveData] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [leaveReason, setLeaveReason] = useState("");
  const [file, setFile] = useState(null);
  const [halfDay, setHalfDay] = useState(false);
  const [duration, setDuration] = useState(1);
  const navigate = useNavigate();
  const userID = localStorage.getItem("userId");
  // Replace with the actual employee ID from session or context

  useEffect(() => {
    // Fetch leave types and leave days remaining on component mount
    getLeaveType().then((response) => {
      setLeaveTypes(response.data);
    });

    getUserLeaveDaysRemain(userID).then((response) => {
      setLeaveData(response.data);
    });
  }, [userID]);

  useEffect(() => {
    if (halfDay) {
      setDuration(0.5);
    } else {
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setDuration(diffDays);
    }
  }, [startDate, endDate, halfDay]);

  const handleSubmit = async () => {
    const leaveData = {
      employee_id: userID,
      leave_type_id: leaveType,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      duration,
      details: leaveReason,
      isHalf: halfDay,
      howManyVacationDay: duration, // assuming how many vacation days = duration
    };

    // Send the leave data to API for processing
    addLeave(leaveData).then((response) => {
      if (response.message === 'Leave request created successfully!') {
        navigate(`/user-leave-request`);
      }
      // Add any further success handling like redirecting or showing a message
    }).catch((error) => {
      console.error("Error applying leave:", error);
    });
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
      <Paper elevation={3} sx={{ p: 4, maxWidth: 700, width: "100%" }}>
        <Typography variant="h6" gutterBottom textAlign="center">
          Leave Application
        </Typography>


        <FormControl fullWidth margin="normal">
          <InputLabel>Leave Type *</InputLabel>
          <Select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            label="Leave Type"
          >
            <MenuItem value="">Select...</MenuItem>
            {leaveTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>{type.leave_name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Grid container spacing={2} mt={1}>
          <Grid item xs={6}>
            <Typography variant="body2" gutterBottom>Start Date</Typography>
            <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} className="date-picker" />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" gutterBottom>End Date</Typography>
            <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} className="date-picker" />
          </Grid>
        </Grid>

        <Typography variant="body1" mt={2} gutterBottom>
          <strong>Leave Duration:</strong> {duration} {duration > 1 ? "days" : "day"}
        </Typography>

        <TextField
          label="Leave Reason"
          multiline
          rows={3}
          fullWidth
          variant="outlined"
          margin="normal"
          value={leaveReason}
          onChange={(e) => setLeaveReason(e.target.value)}
        />

        <Button variant="contained" component="label" fullWidth sx={{ mb: 2 }}>
          Upload Attachment
          <input type="file" hidden onChange={(e) => setFile(e.target.files[0])} />
        </Button>

        <FormControlLabel
          control={<Checkbox checked={halfDay} onChange={() => setHalfDay(!halfDay)} />}
          label="Half Day Leave"
        />

        <Button variant="contained" color="success" fullWidth sx={{ mt: 2 }} onClick={handleSubmit}>
          Apply
        </Button>

        <Typography variant="h6" mt={4} gutterBottom>
          Leave Balance
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Leave Type</TableCell>
                <TableCell>Total Leave</TableCell>
                <TableCell>Taken Leave</TableCell>
                <TableCell>Remaining Leave</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveData.map((leave) => (
                <TableRow key={leave.leave_type}>
                  <TableCell>{leave.leave_type}</TableCell>
                  <TableCell>{leave.total_leave}</TableCell>
                  <TableCell>{leave.taken_leave}</TableCell>
                  <TableCell>{leave.remaining_leave}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default LeaveManagement;
