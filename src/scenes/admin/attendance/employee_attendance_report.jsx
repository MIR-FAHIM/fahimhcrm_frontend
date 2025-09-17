import { useState, useEffect, useMemo } from "react";
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
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Skeleton,
  Divider,
  useTheme,
  Stack,
  Button,
} from "@mui/material";
import { LocationOnOutlined, FilterAltRounded, RestartAltRounded } from "@mui/icons-material";
import dayjs from "dayjs";

import { fetchEmployees, modulePermission } from "../../../api/controller/admin_controller/user_controller";
import { getAttendanceReportByUser } from "../../../api/controller/admin_controller/attendance_controller";
import { image_file_url } from "../../../api/config/index";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../../theme";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const EmployeeAttendanceReport = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [permissions, setPermissions] = useState({});
  const [employees, setEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const [attendances, setAttendances] = useState([]);
  const [attLoading, setAttLoading] = useState(false);

  // quick filters
  const [onlyLate, setOnlyLate] = useState(false);
  const [onlyWFH, setOnlyWFH] = useState(false);
  const [onlyField, setOnlyField] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const p = await modulePermission();
        if (p?.status === "success") setPermissions(p.permissions || {});
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setEmpLoading(true);
      try {
        const res = await fetchEmployees();
        setEmployees(res?.data || []);
      } catch (e) {
        setEmployees([]);
      } finally {
        setEmpLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedEmployee) return;
    fetchAttendance(selectedEmployee.id, year, month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployee, year, month]);

  const fetchAttendance = async (employeeId, yr, mo) => {
    setAttLoading(true);
    try {
      const res = await getAttendanceReportByUser({ user_id: employeeId, year: yr, month: mo });
      setAttendances(res?.dates || []);
    } catch (e) {
      setAttendances([]);
    } finally {
      setAttLoading(false);
    }
  };

  const convertSecondsToHM = (seconds) => {
    if (!seconds) return "0h 0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const filteredEmployees = useMemo(() => {
    if (!search.trim()) return employees;
    const q = search.toLowerCase();
    return employees.filter((e) => (e.name || "").toLowerCase().includes(q));
  }, [employees, search]);

  const filteredAttendances = useMemo(() => {
    let rows = attendances;
    if (onlyLate) rows = rows.filter(r => r.attendance?.is_late);
    if (onlyWFH) rows = rows.filter(r => r.attendance?.is_work_from_home);
    if (onlyField) rows = rows.filter(r => r.attendance?.from_field);
    return rows;
  }, [attendances, onlyLate, onlyWFH, onlyField]);

  const summary = useMemo(() => {
    let present = 0, late = 0, wfh = 0, field = 0, totalSec = 0;
    attendances.forEach((r) => {
      if (r.attendance) {
        present += 1;
        if (r.attendance.is_late) late += 1;
        if (r.attendance.is_work_from_home) wfh += 1;
        if (r.attendance.from_field) field += 1;
        totalSec += r.attendance.total_duration || 0;
      }
    });
    return { present, late, wfh, field, total: convertSecondsToHM(totalSec) };
  }, [attendances]);

  const renderStatusYesNo = (v) => (
    <Chip
      label={v ? "Yes" : "No"}
      size="small"
      sx={{
        borderRadius: "6px",
        bgcolor: v ? colors.blueAccent[500] : colors.gray[700],
        color: colors.primary[900],
      }}
    />
  );

  const handleMap = (lat, lon) => {
    if (lat && lon) navigate(`/google-map?lat=${lat}&lng=${lon}`);
  };

  const resetFilters = () => {
    setOnlyLate(false);
    setOnlyWFH(false);
    setOnlyField(false);
  };

  return (
    <Box
      display="flex"
      gap={3}
      p={3}
      sx={{ backgroundColor: theme.palette.background.default, minHeight: "calc(100vh - 64px)" }}
    >
      {/* LEFT: People rail */}
      <Box
        sx={{
          width: 340,
          flexShrink: 0,
          bgcolor: theme.palette.background.paper,
          borderRadius: 2,
          p: 2,
          border: `1px solid ${colors.gray[800]}`,
          display: "flex",
          flexDirection: "column",
          maxHeight: "80vh",
        }}
      >
        <Typography variant="h6" fontWeight={800} sx={{ mb: 1, color: colors.gray[100] }}>
          Employees
        </Typography>
        <TextField
          size="small"
          placeholder="Search employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            mb: 2,
            "& input": { color: colors.gray[100] },
            "& fieldset": { borderColor: colors.gray[700] },
            "&:hover fieldset": { borderColor: colors.gray[400] },
            "&.Mui-focused fieldset": { borderColor: colors.blueAccent[500] },
          }}
        />

        <Box sx={{ overflowY: "auto" }}>
          {empLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Stack key={i} direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <Skeleton variant="circular" width={36} height={36} />
                <Skeleton variant="text" width="70%" />
              </Stack>
            ))
          ) : filteredEmployees.length === 0 ? (
            <Typography variant="body2" sx={{ color: colors.gray[400], mt: 1 }}>
              No employees match “{search}”.
            </Typography>
          ) : (
            <List dense disablePadding>
              {filteredEmployees.map((e) => {
                const selected = selectedEmployee?.id === e.id;
                return (
                  <ListItemButton
                    key={e.id}
                    selected={selected}
                    onClick={() => setSelectedEmployee(e)}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      px: 1.25,
                      "&.Mui-selected": {
                        bgcolor: colors.gray[900],
                        "&:hover": { bgcolor: colors.primary[700] },
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={e.photo ? `${image_file_url}/${e.photo}` : ""}
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: colors.blueAccent[500],
                        }}
                      >
                        {(e.name || "U")?.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography sx={{ color: colors.gray[100], fontWeight: 600, lineHeight: 1.1 }}>
                          {e.name || `User #${e.id}`}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                          {e.designation?.designation_name || e.department?.department_name || "—"}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </Box>
      </Box>

      {/* RIGHT: Report */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {selectedEmployee ? (
          <>
            {/* Header row: title + controls */}
            <Box
              sx={{
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 260 }}>
                <Avatar
                  src={selectedEmployee.photo ? `${image_file_url}/${selectedEmployee.photo}` : ""}
                  sx={{ width: 42, height: 42, bgcolor: colors.blueAccent[500] }}
                >
                  {(selectedEmployee.name || "U")?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={800} sx={{ color: colors.gray[100], lineHeight: 1.15 }}>
                    {selectedEmployee.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                    Attendance for {monthNames[month - 1]}, {year}
                  </Typography>
                </Box>
              </Stack>

              <FormControl size="small" sx={{ width: 140 }}>
                <TextField
                  label="Year"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& input": { color: colors.gray[100] },
                    "& fieldset": { borderColor: colors.gray[700] },
                    "&:hover fieldset": { borderColor: colors.gray[400] },
                    "&.Mui-focused fieldset": { borderColor: colors.blueAccent[500] },
                  }}
                />
              </FormControl>

              <FormControl size="small" sx={{ width: 200 }}>
                <InputLabel sx={{ color: colors.gray[400] }}>Month</InputLabel>
                <Select
                  label="Month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  sx={{
                    color: colors.gray[100],
                    "& fieldset": { borderColor: colors.gray[700] },
                    "&:hover fieldset": { borderColor: colors.gray[400] },
                    "&.Mui-focused fieldset": { borderColor: colors.blueAccent[500] },
                  }}
                >
                  {monthNames.map((m, i) => (
                    <MenuItem key={m} value={i + 1}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Tooltip title="Reset filters">
                <IconButton onClick={resetFilters} sx={{ border: `1px solid ${colors.gray[700]}` }}>
                  <RestartAltRounded />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Summary chips */}
            <Paper
              elevation={0}
              sx={{
                mb: 2,
                p: 2,
                borderRadius: 2,
                border: `1px solid ${colors.gray[800]}`,
                bgcolor: theme.palette.background.paper,
              }}
            >
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  label={`Present: ${summary.present}`}
                  sx={{ bgcolor: colors.blueAccent[600], color: colors.primary[900] }}
                />
                <Chip
                  label={`Late: ${summary.late}`}
                  sx={{ bgcolor: colors.redAccent[500], color: colors.primary[900] }}
                />
                <Chip
                  label={`WFH: ${summary.wfh}`}
                  sx={{ bgcolor: colors.purpleAccent[600], color: colors.primary[900] }}
                />
                <Chip
                  label={`Field: ${summary.field}`}
                  sx={{ bgcolor: colors.orangeAccent[600], color: colors.primary[900] }}
                />
                <Chip
                  label={`Total: ${summary.total}`}
                  sx={{ bgcolor: colors.blueAccent[500], color: colors.primary[900] }}
                />
                <Box sx={{ flex: 1 }} />
                <Chip
                  icon={<FilterAltRounded />}
                  clickable
                  onClick={() => setOnlyLate((v) => !v)}
                  label={onlyLate ? "Late: On" : "Late: Off"}
                  variant={onlyLate ? "filled" : "outlined"}
                  sx={{
                    borderColor: colors.redAccent[500],
                    bgcolor: onlyLate ? colors.redAccent[500] : "transparent",
                    color: onlyLate ? colors.primary[900] : colors.gray[200],
                  }}
                />
                <Chip
                  clickable
                  onClick={() => setOnlyWFH((v) => !v)}
                  label={onlyWFH ? "WFH: On" : "WFH: Off"}
                  variant={onlyWFH ? "filled" : "outlined"}
                  sx={{
                    borderColor: colors.purpleAccent[600],
                    bgcolor: onlyWFH ? colors.purpleAccent[600] : "transparent",
                    color: onlyWFH ? colors.primary[900] : colors.gray[200],
                  }}
                />
                <Chip
                  clickable
                  onClick={() => setOnlyField((v) => !v)}
                  label={onlyField ? "Field: On" : "Field: Off"}
                  variant={onlyField ? "filled" : "outlined"}
                  sx={{
                    borderColor: colors.orangeAccent[600],
                    bgcolor: onlyField ? colors.orangeAccent[600] : "transparent",
                    color: onlyField ? colors.primary[900] : colors.gray[200],
                  }}
                />
              </Stack>
            </Paper>

            {/* Table / content */}
            {attLoading ? (
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 1 }}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={44} />
                ))}
              </Box>
            ) : filteredAttendances.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 2,
                  textAlign: "center",
                  border: `1px solid ${colors.gray[800]}`,
                  bgcolor: theme.palette.background.paper,
                }}
              >
                <Typography variant="h6" sx={{ color: colors.gray[400] }}>
                  No records match the current filters.
                </Typography>
                <Typography variant="body2" sx={{ color: colors.gray[500] }}>
                  Adjust filters or pick a different month/year.
                </Typography>
              </Paper>
            ) : (
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: `1px solid ${colors.gray[800]}`,
                  overflow: "hidden",
                }}
              >
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: colors.primary[600] }}>
                      {[
                        "Date",
                        "Weekday",
                        "Check-in",
                        "Check-out",
                        ...(permissions.task !== false ? ["In Loc.", "Out Loc."] : []),
                        "Punctuality",
                        "Early Leave",
                        "WFH",
                        "Field",
                        "Total",
                      ].map((h) => (
                        <TableCell key={h} align="center" sx={{ color: colors.gray[100], fontWeight: 700 }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAttendances.map((row, idx) => {
                      const a = row.attendance;
                      const weekend = row.weekday === "Saturday" || row.weekday === "Sunday";
                      return (
                        <TableRow
                          key={idx}
                          hover
                          sx={{
                            backgroundColor: weekend ? colors.primary[800] : "transparent",
                            transition: "transform .15s ease",
                            "&:hover": { transform: "scale(1.005)" },
                          }}
                        >
                          <TableCell align="center" sx={{ color: colors.gray[100], fontWeight: weekend ? 700 : 500 }}>
                            {row.date}
                          </TableCell>
                          <TableCell align="center" sx={{ color: colors.gray[100], fontWeight: weekend ? 700 : 500 }}>
                            {row.weekday}
                          </TableCell>
                          <TableCell align="center" sx={{ color: colors.gray[100] }}>
                            {a ? dayjs(a.check_in_time).format("hh:mm A") : "N/A"}
                          </TableCell>
                          <TableCell align="center" sx={{ color: colors.gray[100] }}>
                            {a?.check_out_time ? dayjs(a.check_out_time).format("hh:mm A") : "N/A"}
                          </TableCell>

                          {permissions.task !== false && (
                            <>
                              <TableCell align="center">
                                {a?.check_in_location ? (
                                  <Tooltip title="View on map">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleMap(a.check_in_lat, a.check_in_lon)}
                                    >
                                      <LocationOnOutlined sx={{ color: colors.blueAccent[500] }} fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                ) : (
                                  <Typography variant="caption" color="text.secondary">
                                    N/A
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell align="center">
                                {a?.check_out_location ? (
                                  <Tooltip title="View on map">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleMap(a.check_out_lat, a.check_out_lon)}
                                    >
                                      <LocationOnOutlined sx={{ color: colors.blueAccent[500] }} fontSize="small" />
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

                          <TableCell align="center">
                            {!a?.check_in_time ? (
                              <Typography variant="caption" color="text.secondary">
                                N/A
                              </Typography>
                            ) : a?.is_late ? (
                              <Chip
                                label="Late"
                                size="small"
                                sx={{ bgcolor: colors.redAccent[500], color: colors.primary[900], borderRadius: "6px" }}
                              />
                            ) : (
                              <Chip
                                label="On time"
                                size="small"
                                sx={{ bgcolor: colors.blueAccent[600], color: colors.primary[900], borderRadius: "6px" }}
                              />
                            )}
                          </TableCell>

                          <TableCell align="center">{renderStatusYesNo(a?.is_early_leave)}</TableCell>
                          <TableCell align="center">{renderStatusYesNo(a?.is_work_from_home)}</TableCell>
                          <TableCell align="center">{renderStatusYesNo(a?.from_field)}</TableCell>
                          <TableCell align="center" sx={{ color: colors.gray[100] }}>
                            {a ? convertSecondsToHM(a.total_duration) : "0h 0m"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 2,
              border: `1px solid ${colors.gray[800]}`,
              bgcolor: theme.palette.background.paper,
              display: "grid",
              placeItems: "center",
              minHeight: "60vh",
            }}
          >
            <Typography variant="h6" sx={{ color: colors.gray[400], textAlign: "center" }}>
              Select an employee from the left to view their attendance report.
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default EmployeeAttendanceReport;
