import { useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Avatar,
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CallIcon from "@mui/icons-material/Call";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PlaceIcon from "@mui/icons-material/Place";
import AssignmentIcon from "@mui/icons-material/Assignment";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import MessageIcon from "@mui/icons-material/Message";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import HistoryRounded from "@mui/icons-material/HistoryRounded";

const LOG_TYPES = [
  { label: "All", value: "all" },
  { label: "Call", value: "call" },
  { label: "Email", value: "email" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Visit", value: "visit" },
  { label: "Task", value: "task" },
  { label: "General", value: "general" },
  { label: "Message", value: "message" },
  { label: "Meeting", value: "meeting" },
];

const getIcon = (type) => {
  switch (type) {
    case "call": return <CallIcon fontSize="small" />;
    case "email": return <EmailIcon fontSize="small" />;
    case "whatsapp": return <WhatsAppIcon fontSize="small" />;
    case "visit": return <PlaceIcon fontSize="small" />;
    case "task": return <AssignmentIcon fontSize="small" />;
    case "message": return <MessageIcon fontSize="small" />;
    case "meeting": return <MeetingRoomIcon fontSize="small" />;
    default: return <QuestionAnswerIcon fontSize="small" />;
  }
};

const getTypeColor = (theme, type) => {
  const map = {
    call: theme.palette.success.main,
    email: theme.palette.info.main,
    whatsapp: theme.palette.success.dark || theme.palette.success.main,
    visit: theme.palette.error.main,
    task: theme.palette.primary.main,
    general: theme.palette.text.secondary,
    message: theme.palette.info.dark || theme.palette.info.main,
    meeting: theme.palette.warning.main,
  };
  return map[type] || theme.palette.primary.main;
};

export default function LogActivityList({ logActivityListData = [] }) {
  const [filterType, setFilterType] = useState("all");
  const theme = useTheme();

  const counts = useMemo(
    () => logActivityListData.reduce((acc, log) => {
      acc[log.activity_type] = (acc[log.activity_type] || 0) + 1;
      return acc;
    }, {}),
    [logActivityListData]
  );

  const filteredLogs =
    filterType === "all"
      ? logActivityListData
      : logActivityListData.filter((log) => log.activity_type === filterType);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        bgcolor: theme.palette.background.paper,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} spacing={2} sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Avatar variant="rounded" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12), color: theme.palette.primary.main }}>
            <HistoryRounded />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: theme.palette.text.primary }}>
              Activity Timeline
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              {filteredLogs.length} visible of {logActivityListData.length} total interactions
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <Tabs
        value={filterType}
        onChange={(_, value) => setFilterType(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          "& .MuiTabs-indicator": { display: "none" },
          "& .MuiTab-root": { minHeight: 38, textTransform: "none", fontWeight: 900 },
        }}
      >
        {LOG_TYPES.map((type) => {
          const color = getTypeColor(theme, type.value);
          const active = filterType === type.value;
          const count = type.value === "all" ? logActivityListData.length : counts[type.value] || 0;
          return (
            <Tab
              key={type.value}
              label={`${type.label} (${count})`}
              value={type.value}
              sx={{
                borderRadius: 2,
                mx: 0.35,
                color: active ? color : theme.palette.text.secondary,
                bgcolor: active ? alpha(color, 0.12) : "transparent",
                border: `1px solid ${active ? alpha(color, 0.25) : "transparent"}`,
              }}
            />
          );
        })}
      </Tabs>

      {filteredLogs.length ? (
        <Stack spacing={0}>
          {filteredLogs.map((activity, index) => {
            const color = getTypeColor(theme, activity.activity_type);
            return (
              <Box key={activity.id || index} sx={{ display: "grid", gridTemplateColumns: "42px minmax(0, 1fr)", gap: 1.5 }}>
                <Stack alignItems="center" sx={{ pt: 0.5 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(color, 0.14), color }}>
                    {getIcon(activity.activity_type)}
                  </Avatar>
                  {index < filteredLogs.length - 1 && <Box sx={{ width: 2, flex: 1, minHeight: 30, bgcolor: theme.palette.divider, mt: 1 }} />}
                </Stack>

                <Box sx={{ pb: index < filteredLogs.length - 1 ? 2 : 0 }}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: theme.palette.background.default, border: `1px solid ${theme.palette.divider}` }}>
                    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={1}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: theme.palette.text.primary }}>
                          {activity.title || "Prospect activity"}
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5, whiteSpace: "pre-line" }}>
                          {activity.notes || "No notes recorded."}
                        </Typography>
                      </Box>
                      <Chip size="small" label={activity.activity_type || "general"} sx={{ textTransform: "capitalize", bgcolor: alpha(color, 0.12), color, fontWeight: 900 }} />
                    </Stack>
                    <Divider sx={{ my: 1.25 }} />
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      By {activity.created_by?.name || "Unknown"} on {activity.created_at ? dayjs(activity.created_at).format("MMM D, YYYY h:mm A") : "-"}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            );
          })}
        </Stack>
      ) : (
        <Box sx={{ p: 4, borderRadius: 2, textAlign: "center", bgcolor: theme.palette.background.default, border: `1px dashed ${theme.palette.divider}` }}>
          <HistoryRounded color="disabled" />
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
            No activities found for this filter.
          </Typography>
        </Box>
      )}
    </Paper>
  );
}