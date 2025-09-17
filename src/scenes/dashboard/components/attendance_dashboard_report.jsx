
import { Box, Typography, useMediaQuery, useTheme, Card, CardContent, Stack } from "@mui/material";
import {
  AccessTimeOutlined, Warning, HomeWork, LocationOn, CheckBoxRounded
} from "@mui/icons-material";
import { tokens } from "../../../theme";
import { format } from "date-fns";

const Tile = ({ icon, label, value, color }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Card
      sx={{
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${colors.gray[800]}`,
        borderRadius: 3,
        boxShadow: 2,
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 36, height: 36, borderRadius: 2,
                bgcolor: color.bg, color: color.fg,
                display: "grid", placeItems: "center",
              }}
            >
              {icon}
            </Box>
            <Typography variant="body2" sx={{ color: colors.gray[400], fontWeight: 600 }}>
              {label}
            </Typography>
          </Stack>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>{value ?? 0}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

function DashboardAttendanceReport({ dashboardReport }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isWide = useMediaQuery("(min-width:900px)");
  const today = format(new Date(), "dd MMM, yyyy");

  const items = [
    {
      label: "Present",
      value: dashboardReport.present,
      icon: <CheckBoxRounded fontSize="small" />,
      color: { bg: colors.blueAccent[600], fg: colors.primary[900] },
    },
    {
      label: "Absent",
      value: dashboardReport.absent_count,
      icon: <Warning fontSize="small" />,
      color: { bg: colors.redAccent[600], fg: colors.primary[900] },
    },
    {
      label: "Late",
      value: dashboardReport.late_count,
      icon: <AccessTimeOutlined fontSize="small" />,
      color: { bg: colors.orangeAccent[600], fg: colors.primary[900] },
    },
    {
      label: "WFH",
      value: dashboardReport.work_from_home_count,
      icon: <HomeWork fontSize="small" />,
      color: { bg: colors.purpleAccent[600], fg: colors.primary[900] },
    },
    {
      label: "Field",
      value: dashboardReport.field_count ?? 0,
      icon: <LocationOn fontSize="small" />,
      color: { bg: colors.blueAccent[700], fg: colors.primary[900] },
    },
  ];

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
        Today’s Attendance • {today}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: isWide ? "repeat(5, 1fr)" : "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 8,
        }}
      >
        {items.map((it, i) => (
          <Tile key={i} {...it} />
        ))}
      </Box>
    </Box>
  );
}

export default DashboardAttendanceReport;
