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
  Tooltip,
  Chip,
  IconButton,
  Button,
  useTheme,
} from "@mui/material";
import {
  InfoOutlined,
  LocationOnOutlined,
} from "@mui/icons-material";
import { getAttendanceByDate } from "../../../api/controller/admin_controller/attendance_controller";
import { modulePermission } from "../../../api/controller/admin_controller/user_controller";
import { image_file_url } from "../../../api/config/index";
import EnhancedLateReasonDialog from "./components/reason_dialog";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../../theme";

const Attendance = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
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
      const res = await getAttendanceByDate(selectedDate);
      setAttendances(res.data || []);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGetModulePermission = async () => {
    try {
      const res = await modulePermission();
      if (res?.status === "success") setPermissions(res.permissions);
    } catch (err) {
      console.error("Error fetching module permissions:", err);
    }
  };

  const handleNavigationMap = (lat, lon) => {
    if (lat && lon) navigate(`/google-map?lat=${lat}&lng=${lon}`);
  };

  const handleLateReasonOpen = (reason) => {
    setSelectedLateReason(reason || "No reason provided");
    setLateDialogOpen(true);
  };

  const handleLateReasonClose = () => {
    setLateDialogOpen(false);
    setSelectedLateReason("");
  };

  const formatTime = (timeString) =>
    timeString ? new Date(timeString).toLocaleTimeString() : "N/A";

  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <Box p={4} sx={{ backgroundColor: theme.palette.background.default }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        mb={3}
        textAlign="center"
        sx={{ color: colors.gray[100] }}
      >
        Attendance Records
      </Typography>

      {/* Date selector */}
      <Box display="flex" justifyContent="center" mb={3}>
        <TextField
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          label="Select Date"
          InputLabelProps={{ shrink: true }}
          sx={{
            width: 260,
            bgcolor: theme.palette.background.paper,
            borderRadius: 1,
            "& input": { color: colors.gray[100] },
            "& label": { color: colors.gray[400] },
            "& fieldset": { borderColor: colors.gray[700] },
            "&:hover fieldset": { borderColor: colors.gray[400] },
            "&.Mui-focused fieldset": { borderColor: colors.blueAccent[500] },
          }}
        />
      </Box>

      {/* Loading / Empty */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : attendances.length === 0 ? (
        <Paper
          elevation={2}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No attendance records found.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try selecting another date or check later.
          </Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          elevation={3}
          sx={{ borderRadius: 2, overflow: "hidden" }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: colors.primary[600] }}>
                {[
                  "Employee",
                  "Status",
                  "Check-in",
                  "Check-out",
                  ...(permissions.task !== false
                    ? ["Check-in Location", "Check-out Location"]
                    : []),
                  "Punctuality",
                  "Late Reason",
                  "WFH",
                  "Field",
                  "Duration",
                ].map((h) => (
                  <TableCell
                    key={h}
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      color: colors.gray[100],
                      fontSize: ".9rem",
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {attendances.map(({ employee, attendance }, i) => (
                <TableRow
                  key={employee.id}
                  hover
                  sx={{
                    transition: "all .2s",
                    "&:hover": { transform: "scale(1.01)" },
                  }}
                >
                  {/* Employee cell */}
                  <TableCell align="center">
                    <Tooltip title={employee.name}>
                      <Avatar
                        src={
                          employee.photo
                            ? `${image_file_url}/${employee.photo}`
                            : ""
                        }
                        sx={{
                          width: 42,
                          height: 42,
                          mx: "auto",
                          mb: 1,
                          bgcolor: colors.blueAccent[500],
                        }}
                      >
                        {employee.name?.charAt(0) || "U"}
                      </Avatar>
                    </Tooltip>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{ color: colors.gray[100] }}
                    >
                      {employee.name}
                    </Typography>
                  </TableCell>

                  {/* Status */}
                  <TableCell align="center">
                    <Chip
                      label={attendance ? "Present" : "Absent"}
                      size="small"
                      sx={{
                        borderRadius: "6px",
                        bgcolor: attendance
                          ? colors.blueAccent[500]
                          : colors.redAccent[500],
                        color: colors.gray[900],
                      }}
                    />
                  </TableCell>

                  {/* Times */}
                  <TableCell align="center" sx={{ color: colors.gray[100] }}>
                    {formatTime(attendance?.check_in_time)}
                  </TableCell>
                  <TableCell align="center" sx={{ color: colors.gray[100] }}>
                    {formatTime(attendance?.check_out_time)}
                  </TableCell>

                  {/* Locations */}
                  {permissions.task !== false && (
                    <>
                      <TableCell align="center">
                        {attendance?.check_in_location ? (
                          <Tooltip title="View on map">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleNavigationMap(
                                  attendance?.check_in_lat,
                                  attendance?.check_in_lon
                                )
                              }
                            >
                              <LocationOnOutlined
                                fontSize="small"
                                sx={{ color: colors.blueAccent[500] }}
                              />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {attendance?.check_out_location ? (
                          <Tooltip title="View on map">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleNavigationMap(
                                  attendance?.check_out_lat,
                                  attendance?.check_out_lon
                                )
                              }
                            >
                              <LocationOnOutlined
                                fontSize="small"
                                sx={{ color: colors.blueAccent[500] }}
                              />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                    </>
                  )}

                  {/* Punctuality */}
                  <TableCell align="center">
                    {!attendance?.check_in_time ? (
                      <Typography variant="caption" color="text.secondary">
                        N/A
                      </Typography>
                    ) : attendance?.is_late ? (
                      <Chip
                        label="Late"
                        size="small"
                        sx={{
                          bgcolor: colors.redAccent[500],
                          color: colors.primary[900],
                          borderRadius: "6px",
                        }}
                      />
                    ) : (
                      <Chip
                        label="On Time"
                        size="small"
                        sx={{
                          bgcolor: colors.blueAccent[500],
                          color: colors.primary[900],
                          borderRadius: "6px",
                        }}
                      />
                    )}
                  </TableCell>

                  {/* Late Reason */}
                  <TableCell align="center">
                    {attendance?.is_late ? (
                      <Tooltip title="View Reason">
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleLateReasonOpen(attendance?.late_reason)
                          }
                        >
                          <InfoOutlined
                            fontSize="small"
                            sx={{ color: colors.redAccent[500] }}
                          />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>

                  {/* WFH */}
                  <TableCell align="center">
                    <Chip
                      label={attendance?.is_work_from_home ? "Yes" : "No"}
                      size="small"
                      sx={{
                        bgcolor: attendance?.is_work_from_home
                          ? colors.blueAccent[500]
                          : colors.gray[700],
                        color: colors.primary[900],
                        borderRadius: "6px",
                      }}
                    />
                  </TableCell>

                  {/* Field */}
                  <TableCell align="center">
                    <Chip
                      label={attendance?.from_field ? "Yes" : "No"}
                      size="small"
                      sx={{
                        bgcolor: attendance?.from_field
                          ? colors.blueAccent[500]
                          : colors.gray[700],
                        color: colors.primary[900],
                        borderRadius: "6px",
                      }}
                    />
                  </TableCell>

                  {/* Duration */}
                  <TableCell align="center" sx={{ color: colors.gray[100] }}>
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
      />
    </Box>
  );
};

export default Attendance;
