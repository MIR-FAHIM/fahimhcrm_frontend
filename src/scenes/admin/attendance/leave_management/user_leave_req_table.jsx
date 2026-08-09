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
  CircularProgress,
  Alert,
} from "@mui/material";
import { getUserLeaveRequests, getUserLeaveDaysRemain } from "../../../../api/controller/admin_controller/leave_manage/leave_manage";

const resolveList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
};

const isEmptyFailedResponse = (response) =>
  response?.status === "failed" && !Array.isArray(response?.data);

const UserLeaveRequestsPage = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [error, setError] = useState(null);

  const userID = localStorage.getItem("userId");

  useEffect(() => {
    const fetchData = async () => {
      setLoadingRequests(true);
      try {
        const requestsResponse = await getUserLeaveRequests(userID);
        const requests = resolveList(requestsResponse);
        setLeaveRequests(requests);

        if (requestsResponse?.status === "success" || isEmptyFailedResponse(requestsResponse)) {
          setError(null);
        } else {
          setError(requestsResponse?.message || "Failed to fetch leave requests.");
        }
      } catch (err) {
        console.error("Error fetching leave requests:", err);
        setLeaveRequests([]);
        setError("An error occurred while fetching leave requests.");
      } finally {
        setLoadingRequests(false);
      }

      setLoadingBalance(true);
      try {
        const balanceResponse = await getUserLeaveDaysRemain(userID);
        const balance = resolveList(balanceResponse);
        setLeaveBalance(balance);

        if (balanceResponse?.status !== "success" && !isEmptyFailedResponse(balanceResponse)) {
          setError((prev) => prev || balanceResponse?.message || "Failed to fetch leave balance.");
        }
      } catch (err) {
        console.error("Error fetching leave balance:", err);
        setLeaveBalance([]);
        setError((prev) => prev || "An error occurred while fetching leave balance.");
      } finally {
        setLoadingBalance(false);
      }
    };

    if (userID) {
      fetchData();
    } else {
      setError("User ID not found. Please log in.");
      setLoadingRequests(false);
      setLoadingBalance(false);
    }
  }, [userID]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#eef2f6"
      p={3}
    >
      <Paper elevation={6} sx={{ p: 4, maxWidth: 1000, width: "100%", borderRadius: 2, mb: 4, bgcolor: "#ffffff" }}>
        <Typography variant="h5" component="h1" gutterBottom textAlign="center" sx={{ mb: 3, fontWeight: 600, color: "#1a237e" }}>
          My Leave Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 5 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2, color: "#3f51b5", borderBottom: "2px solid #e0e0e0", pb: 1 }}>
            Leave Balance Overview
          </Typography>
          {loadingBalance ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
              <CircularProgress size={30} />
              <Typography variant="subtitle1" sx={{ ml: 2, color: "text.secondary" }}>Loading leave balance...</Typography>
            </Box>
          ) : Array.isArray(leaveBalance) && leaveBalance.length > 0 ? (
            <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 1 }}>
              <Table size="small" aria-label="leave balance table">
                <TableHead sx={{ bgcolor: "#e8eaf6" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: "#1a237e" }}>Leave Type</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: "#1a237e" }}>Total</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: "#1a237e" }}>Taken</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: "#1a237e" }}>Remaining</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(Array.isArray(leaveBalance) ? leaveBalance : []).map((leave) => (
                    <TableRow key={leave.leave_type} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      <TableCell>{leave.leave_type}</TableCell>
                      <TableCell align="right">{leave.total_leave}</TableCell>
                      <TableCell align="right">{leave.taken_leave}</TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: leave.remaining_leave > 0 ? "success.main" : "error.main",
                          }}
                        >
                          {leave.remaining_leave}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
              <Typography variant="subtitle1" color="text.secondary">No leave balance data available.</Typography>
            </Box>
          )}
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 2, color: "#3f51b5", borderBottom: "2px solid #e0e0e0", pb: 1 }}>
            My Leave Request History
          </Typography>

          {loadingRequests ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress size={40} />
              <Typography variant="h6" sx={{ ml: 2, color: "text.secondary" }}>Loading your leave requests...</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 1 }}>
              <Table aria-label="user leave requests table">
                <TableHead sx={{ bgcolor: "#e8eaf6" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: "#1a237e" }}>Leave Type</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#1a237e" }}>Start Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#1a237e" }}>End Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#1a237e" }}>Duration</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#1a237e" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#1a237e" }}>Reason</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(leaveRequests) && leaveRequests.length > 0 ? (
                    leaveRequests.map((leave) => (
                      <TableRow key={leave.id} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fdfdff" } }}>
                        <TableCell>{leave.leave_type?.leave_name || "N/A"}</TableCell>
                        <TableCell>{leave.start_date}</TableCell>
                        <TableCell>{leave.end_date}</TableCell>
                        <TableCell>{leave.duration} Days</TableCell>
                        <TableCell>
                          {leave.is_approve === 1 ? (
                            <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                              Approved
                            </Typography>
                          ) : leave.is_approve === 2 ? (
                            <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
                              Rejected
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="warning.dark" sx={{ fontWeight: 600 }}>
                              Pending
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{leave.details}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3, color: "text.secondary" }}>
                        <Typography variant="body1">
                          You haven't requested any leave yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default UserLeaveRequestsPage;