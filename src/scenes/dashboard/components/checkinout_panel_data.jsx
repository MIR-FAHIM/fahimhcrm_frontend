// src/scenes/dashboard/components/check_in_out_panel.jsx
import React, { useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Link,
  useMediaQuery,
  useTheme,
  Chip,
} from "@mui/material";
import {
  AccessTimeOutlined,
  LogoutOutlined,
  LocationOnOutlined,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { format, differenceInMinutes } from "date-fns";

const IconTile = ({ color, children }) => {
  const theme = useTheme();
  const bg = alpha(color, theme.palette.mode === "dark" ? 0.18 : 0.12);
  const border = alpha(color, 0.25);
  return (
    <Box
      sx={{
        width: 34,
        height: 34,
        borderRadius: 1.25,
        bgcolor: bg,
        color,
        display: "grid",
        placeItems: "center",
        border: `1px solid ${border}`,
        flexShrink: 0,
      }}
      aria-hidden
    >
      {children}
    </Box>
  );
};

const Row = ({ iconColor, icon, label, value }) => {
  const theme = useTheme();
  return (
    <Stack direction="row" spacing={1.25} alignItems="center">
      <IconTile color={iconColor}>{icon}</IconTile>
      <Typography fontSize={14} color={theme.palette.text.secondary}>
        <strong>{label}:</strong>{" "}
        <Typography component="span" fontSize={14} color={theme.palette.text.primary}>
          {value}
        </Typography>
      </Typography>
    </Stack>
  );
};

function CheckInOutPanel({
  isCheckIn,
  todayAttendance,
  onAdjust,        // () => void
  onNavigateToMap // (lat, lon) => void
}) {
  const theme = useTheme();
  const xl = useMediaQuery("(min-width:1260px)");
  const md = useMediaQuery("(min-width:724px)");
  const gridCols = xl ? 12 : md ? 6 : 3;

  const borderSoft = theme.palette.divider || alpha(theme.palette.text.primary, 0.12);

  const workedMins = useMemo(() => {
    if (!todayAttendance?.check_in_time) return null;
    const start = new Date(todayAttendance.check_in_time);
    const end = todayAttendance?.check_out_time ? new Date(todayAttendance.check_out_time) : new Date();
    return Math.max(0, differenceInMinutes(end, start));
  }, [todayAttendance?.check_in_time, todayAttendance?.check_out_time]);

  const durationText = useMemo(() => {
    if (workedMins == null) return null;
    const h = Math.floor(workedMins / 60);
    const m = workedMins % 60;
    return `${h}h ${m}m`;
  }, [workedMins]);

  const { blueAccent, warning, error, text, background } = theme.palette;

  const CardSection = ({ children }) => (
    <Box
      sx={{
        p: 1,
      
        borderRadius: 2,
        border: `1px solid ${borderSoft}`,
        bgcolor: background.paper,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 1.25,
        transition: "box-shadow .2s",
        "&:hover": { boxShadow: 4 },
      }}
    >
      {children}
    </Box>
  );

  return (
    <Card
      sx={{
        bgcolor: background.paper,
        border: `1px solid ${borderSoft}`,
        borderRadius: 3,
        boxShadow: 2,
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            gridAutoRows: "140px",
            gap: 2,
          }}
        >
          {/* Check-in */}
          <Box sx={{ gridColumn: `span ${Math.min(6, gridCols)}` }}>
            <CardSection>
              {isCheckIn && todayAttendance ? (
                <>
                  <Row
                    iconColor={warning.main}
                    icon={<AccessTimeOutlined fontSize="small" />}
                    label="Checked in"
                    value={
                      todayAttendance?.check_in_time
                        ? format(new Date(todayAttendance.check_in_time), "EEE, hh:mm a")
                        : "—"
                    }
                  />

                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <IconTile color={blueAccent.main}>
                      <LocationOnOutlined fontSize="small" />
                    </IconTile>

                    {todayAttendance?.check_in_lat && todayAttendance?.check_in_lon ? (
                      <Link
                        component="button"
                        underline="hover"
                        onClick={() =>
                          onNavigateToMap?.(
                            todayAttendance.check_in_lat,
                            todayAttendance.check_in_lon
                          )
                        }
                        sx={{ color: text.primary, textAlign: "left" }}
                      >
                        <Typography fontSize={14} color="inherit">
                          {todayAttendance?.check_in_location || "Open on map"}
                        </Typography>
                      </Link>
                    ) : (
                      <Typography fontSize={14} color={text.secondary}>
                        No check-in location
                      </Typography>
                    )}
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    {durationText && (
                      <Chip
                        label={`On shift: ${durationText}`}
                        size="small"
                        sx={{
                          bgcolor: alpha(blueAccent.main, 0.15),
                          color: text.primary,
                          border: `1px solid ${alpha(blueAccent.main, 0.3)}`,
                          fontWeight: 600,
                        }}
                      />
                    )}
                    {todayAttendance?.is_late === 1 && (
                      <Chip
                        label="Late"
                        size="small"
                        sx={{
                          bgcolor: alpha(error.main, 0.18),
                          color: error.main,
                          fontWeight: 700,
                        }}
                      />
                    )}
                  </Stack>

                  <Button
                    variant="contained"
                    size="small"
                    onClick={onAdjust}
                    disabled={!onAdjust}
                    sx={{
                      mt: 0.5,
                      alignSelf: "flex-start",
                      textTransform: "none",
                      px: 1.25,
                      bgcolor: blueAccent.main,
                      "&:hover": { bgcolor: blueAccent.dark },
                    }}
                  >
                    Adjust Time
                  </Button>
                </>
              ) : (
                <Typography variant="body1" fontWeight={600} color={error.main} textAlign="center">
                  You have not checked in yet. Please check in now.
                </Typography>
              )}
            </CardSection>
          </Box>

          {/* Check-out */}
          <Box sx={{ gridColumn: `span ${Math.min(6, gridCols)}` }}>
            <CardSection>
              {isCheckIn && todayAttendance ? (
                todayAttendance?.check_out_time ? (
                  <>
                    <Row
                      iconColor={error.main}
                      icon={<LogoutOutlined fontSize="small" />}
                      label="Checked out"
                      value={format(new Date(todayAttendance.check_out_time), "EEE, hh:mm a")}
                    />

                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <IconTile color={blueAccent.main}>
                        <LocationOnOutlined fontSize="small" />
                      </IconTile>
                      {todayAttendance?.check_out_lat && todayAttendance?.check_out_lon ? (
                        <Link
                          component="button"
                          underline="hover"
                          onClick={() =>
                            onNavigateToMap?.(
                              todayAttendance.check_out_lat,
                              todayAttendance.check_out_lon
                            )
                          }
                          sx={{ color: text.primary, textAlign: "left" }}
                        >
                          <Typography fontSize={14} color="inherit">
                            {todayAttendance?.check_out_location || "Open on map"}
                          </Typography>
                        </Link>
                      ) : (
                        <Typography fontSize={14} color={text.secondary}>
                          No check-out location
                        </Typography>
                      )}
                    </Stack>

                    {todayAttendance?.is_early_leave === 1 && (
                      <Chip
                        label="Early leave"
                        size="small"
                        sx={{
                          width: "fit-content",
                          bgcolor: alpha(warning.main, 0.18),
                          color: warning.main,
                          fontWeight: 700,
                        }}
                      />
                    )}
                  </>
                ) : (
                  <Typography variant="body1" fontWeight={600} color={warning.main} textAlign="center">
                    Not checked out yet
                  </Typography>
                )
              ) : (
                <Typography variant="body1" fontWeight={600} color={error.main} textAlign="center">
                  You have not checked in yet. Please check in now.
                </Typography>
              )}
            </CardSection>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default CheckInOutPanel;
