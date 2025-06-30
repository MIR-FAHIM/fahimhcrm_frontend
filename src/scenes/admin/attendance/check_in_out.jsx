import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Link,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
  IconButton,
  Tooltip
} from "@mui/material";
import { getAttendanceByDate } from "../../../api/controller/admin_controller/attendance_controller";
import { base_url, image_file_url } from "../../../api/config/index";
import { modulePermission } from "../../../api/controller/admin_controller/user_controller";
import EnhancedLateReasonDialog from "./components/reason_dialog";
import { useNavigate } from "react-router-dom";
import { InfoOutlined, LocationOnOutlined } from "@mui/icons-material";

const Attendance = () => {
  const theme = useTheme();
    const [permissions, setPermissions] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lateDialogOpen, setLateDialogOpen] = useState(false);
  const [selectedLateReason, setSelectedLateReason] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
     handleGetModulePermission();
    fetchAttendance(date);
   
  }, [date]);

  const fetchAttendance = async (selectedDate) => {
    setLoading(true);
    try {
      const response = await getAttendanceByDate(selectedDate);
      setAttendances(response.data || []);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigationMap = (lat, long) => {
    if (lat && long) {
      navigate(`/google-map?lat=${lat}&lng=${long}`);
    }
  };

  const handleLateReasonOpen = (reason) => {
    setSelectedLateReason(reason || "No reason provided.");
    setLateDialogOpen(true);
  };

  const handleLateReasonClose = () => {
    setLateDialogOpen(false);
    setSelectedLateReason("");
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      return new Date(timeString).toLocaleTimeString();
    } catch (e) {
      return "Invalid Time";
    }
  };
  const handleGetModulePermission = async () => {
    try {

      const response = await modulePermission();
      if (response.status === 'success') {
        setPermissions(response.permissions); // Set the response data
      } else {

      }
    } catch (error) {

    } finally {

    }
  };
  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" mb={3} textAlign="center">
        Attendance Records
      </Typography>

      <Box display="flex" justifyContent="center" mb={3}>
        <TextField
          label="Select Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          sx={{
            width: "250px",
            bgcolor: theme.palette.background.paper,
            borderRadius: 1,
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: theme.palette.primary.main,
              },
              "&:hover fieldset": {
                borderColor: theme.palette.primary.dark,
              },
            }
          }}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : attendances.length === 0 ? (
        <Box textAlign="center" p={4}>
          <Typography variant="h6" color="textSecondary">
            No attendance records found for this date.
          </Typography>
          <Typography variant="body2" color="textSecondary" mt={1}>
            Please select a different date or check back later.
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.primary.main }}>
                {[
                  "Employee",
                  "Status",
                  "Check-in",
                  "Check-out",
                 ...(permissions.task !== false ? ["Check-in Location", "Check-out Location"] : []),
                  "Punctuality",
                  "Late Reason",
                  "WFH",
                  "Field",
                  "Duration",
                ].map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                      color: theme.palette.common.black,
                      fontSize: "0.9rem"
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {attendances.map(({ employee, attendance }, index) => (
                <TableRow
                  key={employee.id}
                  sx={{
                    bgcolor: index % 2 === 0
                      ? theme.palette.background.default
                      : theme.palette.background.paper,
                    "&:hover": {
                      bgcolor: theme.palette.action.hover
                    }
                  }}
                >
                  <TableCell align="center">
                    <Box display="flex" flexDirection="column" alignItems="center">
                    {/* //https://crmapi.jayga.io/storage/ */}
                      <Avatar
                        src={employee.photo ? `${image_file_url}/${employee.photo}` : ""}
                        sx={{
                          width: 40,
                          height: 40,
                          mb: 1,
                          bgcolor: theme.palette.primary.light
                        }}
                      >
                        {employee.name?.charAt(0) || "U"}
                      </Avatar>
                      <Typography variant="body2" fontWeight="bold">
                        {employee.name || `User ID: ${employee.id}`}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={attendance ? "Present" : "Absent"}
                      color={attendance ? "success" : "error"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {formatTime(attendance?.check_in_time)}
                  </TableCell>
                  <TableCell align="center">
                    {formatTime(attendance?.check_out_time)}
                  </TableCell>
             {permissions.task !== false && (
  <>
    <TableCell align="center">
      {attendance?.check_in_location ? (
        <Tooltip title="View on map">
          <span
            style={{ cursor: "pointer", color: "#1976d2", textDecoration: "underline" }}
            onClick={() =>
              handleNavigationMap(attendance?.check_in_lat, attendance?.check_in_lon)
            }
          >
            {attendance?.check_in_location}
          </span>
        </Tooltip>
      ) : (
        "N/A"
      )}
    </TableCell>

    <TableCell align="center">
      {attendance?.check_out_location ? (
        <Tooltip title="View on map">
          <span
            style={{ cursor: "pointer", color: "#1976d2", textDecoration: "underline" }}
            onClick={() =>
              handleNavigationMap(attendance?.check_out_lat, attendance?.check_out_lon)
            }
          >
            {attendance?.check_out_location}
          </span>
        </Tooltip>
      ) : (
        "N/A"
      )}
    </TableCell>
  </>
)}

                  <TableCell align="center">
                    {!attendance?.check_in_time ? (
                      "N/A"
                    ) : attendance?.is_late ? (
                      <Chip label="Late" size="small" color="warning" />
                    ) : (
                      <Chip label="On Time" size="small" color="success" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {attendance?.is_late ? (
                      <Tooltip title={attendance?.late_reason || "No reason provided"}>
                        <IconButton
                          size="small"
                          onClick={() => handleLateReasonOpen(attendance?.late_reason)}
                        >
                          <InfoOutlined fontSize="small" color="error" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {attendance?.is_work_from_home ? (
                      <Chip label="Yes" size="small" color="info" />
                    ) : (
                      <Chip label="No" size="small" color="default" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {attendance?.from_field ? (
                      <Chip label="Yes" size="small" color="info" />
                    ) : (
                      <Chip label="No" size="small" color="default" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {formatDuration(attendance?.total_duration)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Late Reason Dialog */}

      <EnhancedLateReasonDialog
        lateDialogOpen={lateDialogOpen}
        handleLateReasonClose={handleLateReasonClose}
        selectedLateReason={selectedLateReason}
        attendance={attendances}
      />
    </Box>
  );
};

export default Attendance;
