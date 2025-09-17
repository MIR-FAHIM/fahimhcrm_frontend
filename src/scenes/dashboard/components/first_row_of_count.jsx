// src/scenes/dashboard/components/first_row_of_count.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  useTheme,
  Card,
  CardContent,
  Stack,
  IconButton,
  Tooltip,
  Skeleton,
} from "@mui/material";
import {
  BusinessCenter,
  People,
  Work,
  Construction,
  Task,
  Badge,
  ArrowForwardIosRounded,
} from "@mui/icons-material";
import { tokens } from "../../../theme";
import { modulePermission } from "../../../api/controller/admin_controller/user_controller";

const KPICard = ({ icon, label, value, onClick, color }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: "pointer",
        minWidth: 200,
        flex: "1 1 200px",
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${colors.gray[800]}`,
        borderRadius: 3,
        boxShadow: 2,
        transition: "transform .15s ease, box-shadow .15s ease",
        "&:hover": { transform: "translateY(-3px)", boxShadow: 6 },
      }}
    >
      <CardContent sx={{ p: 2.25 }}>
        <Stack direction="row" alignItems="center" spacing={1.25} mb={1.25}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: color.bg,
              color: color.fg,
              display: "grid",
              placeItems: "center",
            }}
          >
            {icon}
          </Box>
          <Typography variant="body2" sx={{ color: colors.gray[400], fontWeight: 600 }}>
            {label}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Tooltip title="Open">
            <IconButton size="small" sx={{ color: colors.gray[500] }}>
              <ArrowForwardIosRounded fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Stack>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          {value ?? 0}
        </Typography>
      </CardContent>
    </Card>
  );
};

function DashboardFirstRow({ dashboardReport }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [perms, setPerms] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch permissions once
  useEffect(() => {
    (async () => {
      try {
        const res = await modulePermission();
        if (res?.status === "success") setPerms(res.permissions || {});
      } catch (e) {
        console.error("Failed to load permissions", e);
        setPerms({});
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Define all possible cards
  const allCards = useMemo(
    () => [
      {
        key: "prospect",
        label: "Prospects",
        value: dashboardReport?.prospects,
        icon: <BusinessCenter fontSize="small" />,
        color: { bg: colors.blueAccent[700], fg: colors.primary[900] },
        onClick: () => navigate("/prospect-list"),
      },
      {
        key: "client",
        label: "Clients",
        value: dashboardReport?.clients ?? 0,
        icon: <People fontSize="small" />,
        color: { bg: colors.purpleAccent[700], fg: colors.primary[900] },
        onClick: () => navigate("/client-list"),
      },
      {
        key: "project",
        label: "Projects",
        value: dashboardReport?.projects,
        icon: <Work fontSize="small" />,
        color: { bg: colors.orangeAccent[700], fg: colors.primary[900] },
        onClick: () => navigate("/project-list"),
      },
      {
        key: "projectPhase",
        // gated by "project" permission as part of project module
        label: "Project Phases",
        value: dashboardReport?.projectPhase,
        icon: <Construction fontSize="small" />,
        color: { bg: colors.blueAccent[600], fg: colors.primary[900] },
        onClick: () => {}, // add route if/when needed
        requireKey: "project",
      },
      {
        key: "task",
        label: "Tasks",
        value: dashboardReport?.tasks,
        icon: <Task fontSize="small" />,
        color: { bg: colors.redAccent[600], fg: colors.primary[900] },
        onClick: () => navigate("/my-task-tab"),
      },
      {
        key: "hrms",
        // show Employees under HRMS permission
        label: "Employees",
        value: dashboardReport?.employee,
        icon: <Badge fontSize="small" />,
        color: { bg: colors.purpleAccent[600], fg: colors.primary[900] },
        onClick: () => navigate("/employee-list-view"),
      },
    ],
    [
      dashboardReport?.prospects,
      dashboardReport?.clients,
      dashboardReport?.projects,
      dashboardReport?.projectPhase,
      dashboardReport?.tasks,
      dashboardReport?.employee,
      colors,
      navigate,
    ]
  );

  // Filter by permission flags
  const visibleCards = useMemo(() => {
    if (!perms) return [];
    // map card.key -> permission key in your response
    const keyToPerm = {
      prospect: "prospect",
      client: "client",
      project: "project",
      projectPhase: "project", // depends on project permission
      task: "task",
      hrms: "hrms",
    };

    return allCards.filter((c) => {
      const permKey = c.requireKey || c.key;
      const mapped = keyToPerm[permKey];
      if (!mapped) return true; // if not mapped, show by default
      return Boolean(perms[mapped]);
    });
  }, [allCards, perms]);

  return (
    <Box sx={{ mt: 2 }}>
      {loading ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 2,
          }}
        >
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="rounded" height={112} sx={{ borderRadius: 3 }} />
          ))}
        </Box>
      ) : visibleCards.length === 0 ? (
        <Card
          sx={{
            borderRadius: 3,
            border: `1px dashed ${colors.gray[700]}`,
            bgcolor: theme.palette.background.paper,
          }}
        >
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              No modules available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You don’t have access to any dashboard modules. Contact an administrator if this seems wrong.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)", // fixed 6 columns (adjust if you prefer auto-fit)
            gap: 2,
            "@media (max-width: 1600px)": {
              gridTemplateColumns: "repeat(4, 1fr)",
            },
            "@media (max-width: 1200px)": {
              gridTemplateColumns: "repeat(3, 1fr)",
            },
            "@media (max-width: 900px)": {
              gridTemplateColumns: "repeat(2, 1fr)",
            },
            "@media (max-width: 600px)": {
              gridTemplateColumns: "repeat(1, 1fr)",
            },
          }}
        >
          {visibleCards.map((c) => (
            <KPICard key={c.label} {...c} />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default DashboardFirstRow;
