import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert, // Added for feedback messages
  Snackbar, // Added for feedback messages
} from "@mui/material";
import { getAllLeave, approveLeave, rejectLeave } from "../../../../api/controller/admin_controller/leave_manage/leave_manage";

const LeaveManageTable = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // 'success', 'error', 'info', 'warning'
  const userID = localStorage.getItem("userId");
  // Fetch all leave requests
  const fetchLeaveRequests = async () => {
    setLoading(true); // Indicate loading state for the initial fetch
    try {
      const response = await getAllLeave();
      setLeaveRequests(response.data);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      showSnackbar("Failed to fetch leave requests. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests(); // Initial fetch
  }, []);

  // Show a snackbar message
  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  // Handle approving a leave request
  const handleApprove = async (leaveId) => {
    // Optimistic UI update: Mark as approving immediately
    setLeaveRequests((prevRequests) =>
      prevRequests.map((leave) =>
        leave.id === leaveId ? { ...leave, approving: true } : leave
      )
    );

    const data = { approver_id: userID }; // Placeholder: Ideally, this should come from user session/context

    try {
      const response = await approveLeave(data, leaveId);
      if (response.status === "success") {
        // Update the specific leave request in the state
        setLeaveRequests((prevRequests) =>
          prevRequests.map((leave) =>
            leave.id === leaveId
              ? { ...leave, status: "Approved", is_approve: 1, approver: { name: "Admin User" }, approving: false } // Assuming 'Admin User' for approver name
              : leave
          )
        );
        showSnackbar("Leave request approved successfully!", "success");
      } else {
        // Revert optimistic update and show error
        setLeaveRequests((prevRequests) =>
          prevRequests.map((leave) =>
            leave.id === leaveId ? { ...leave, approving: false } : leave
          )
        );
        showSnackbar(`Failed to approve leave: ${response.message}`, "error");
      }
    } catch (error) {
      // Revert optimistic update and show error
      setLeaveRequests((prevRequests) =>
        prevRequests.map((leave) =>
          leave.id === leaveId ? { ...leave, approving: false } : leave
        )
      );
      console.error("Error approving leave:", error);
      showSnackbar("Error approving leave. Please try again.", "error");
    }
  };
  const handleReject = async (leaveId) => {
    // Optimistic UI update: Mark as approving immediately
    setLeaveRequests((prevRequests) =>
      prevRequests.map((leave) =>
        leave.id === leaveId ? { ...leave, approving: true } : leave
      )
    );

    const data = { approver_id: userID }; // Placeholder: Ideally, this should come from user session/context

    try {
      const response = await rejectLeave(data, leaveId);
      if (response.status === "success") {
        // Update the specific leave request in the state
        setLeaveRequests((prevRequests) =>
          prevRequests.map((leave) =>
            leave.id === leaveId
              ? { ...leave, status: "Rejected", is_approve: 2, approver: { name: "Admin User" }, approving: false } // Assuming 'Admin User' for approver name
              : leave
          )
        );
        showSnackbar("Leave Rejected!", "success");
      } else {
        // Revert optimistic update and show error
        setLeaveRequests((prevRequests) =>
          prevRequests.map((leave) =>
            leave.id === leaveId ? { ...leave, approving: false } : leave
          )
        );
        showSnackbar(`Failed to reject leave: ${response.message}`, "error");
      }
    } catch (error) {
      // Revert optimistic update and show error
      setLeaveRequests((prevRequests) =>
        prevRequests.map((leave) =>
          leave.id === leaveId ? { ...leave, approving: false } : leave
        )
      );
      console.error("Error approving leave:", error);
      showSnackbar("Error approving leave. Please try again.", "error");
    }
  };

  // Handle rejecting a leave request (Placeholder for now)
  

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
      p={3} // Added padding for better spacing on smaller screens
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 1200, width: "100%", borderRadius: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom textAlign="center" sx={{ mb: 3, fontWeight: 'bold', color: '#3f51b5' }}>
          Employee Leave Request Management
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
            <Typography variant="h6" sx={{ ml: 2 }}>Loading leave requests...</Typography>
          </Box>
        ) : leaveRequests.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <Typography variant="h6" color="textSecondary">No leave requests to display.</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: 5 }}>
            <Table aria-label="leave requests table">
              <TableHead sx={{ bgcolor: '#e0e0e0' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Leave Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Start Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>End Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Reason</TableCell> {/* Changed 'Details' to 'Reason' */}
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaveRequests.map((leave) => (
                  <TableRow key={leave.id} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}>
                    <TableCell>{leave.employee?.name || 'N/A'}</TableCell> {/* Added null check */}
                    <TableCell>{leave.leave_type?.leave_name || 'N/A'}</TableCell> {/* Added null check */}
                    <TableCell>{leave.start_date}</TableCell>
                    <TableCell>{leave.end_date}</TableCell>
                    <TableCell>{leave.duration} Days</TableCell> {/* Added 'Days' for clarity */}
                    <TableCell>
                      {leave.is_approve === 1 ? (
                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                          Approved {leave.approver?.name ? `(by ${leave.approver.name})` : ''}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="warning.dark">
                          Pending
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{leave.details}</TableCell>
                    <TableCell align="center">
                      {leave.is_approve == 0 ? (
                        <Box display="flex" gap={1} justifyContent="center">
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() => handleApprove(leave.id)}
                            disabled={leave.approving || loading} // Disable if currently approving or global loading
                            startIcon={leave.approving ? <CircularProgress size={20} color="inherit" /> : null}
                          >
                            {leave.approving ? "Approving..." : "Approve"}
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleReject(leave.id)}
                            disabled={loading || leave.approving}
                          >
                            Reject
                          </Button>
                        </Box>
                      ) : leave.is_approve == 2 ?(
                        <Button variant="contained"
  sx={{
    backgroundColor: 'red',
    '&:hover': {
      backgroundColor: 'darkred',
    },
  }}> {/* Example icon, if you have FontAwesome */}
                          Rejected
                        </Button>
                      ): (
                        <Button variant="contained" disabled color="success" startIcon={<i className="fas fa-check-circle"></i>}> {/* Example icon, if you have FontAwesome */}
                          Approved
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Snackbar for feedback */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LeaveManageTable;