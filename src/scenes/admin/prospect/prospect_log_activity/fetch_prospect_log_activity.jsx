import React, { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import {
  Box,
  Typography,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tabs,
  Tab,
  useTheme,
} from "@mui/material";
import CallIcon from "@mui/icons-material/Call";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PlaceIcon from "@mui/icons-material/Place";
import AssignmentIcon from "@mui/icons-material/Assignment";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import MessageIcon from "@mui/icons-material/Message";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import { tokens } from "../../../../theme";

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

export default function LogActivityList({ id, logActivityListData = [] }) {
  const [filterType, setFilterType] = useState("all");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {}, [id]);

  const getIcon = (type) => {
    switch (type) {
      case "call": return <CallIcon />;
      case "email": return <EmailIcon />;
      case "whatsapp": return <WhatsAppIcon />;
      case "visit": return <PlaceIcon />;
      case "task": return <AssignmentIcon />;
      case "general": return <QuestionAnswerIcon />;
      case "message": return <MessageIcon />;
      case "meeting": return <MeetingRoomIcon />;
      default: return <QuestionAnswerIcon />;
    }
  };

  // Dark/light friendly colors driven by your tokens
  const typeColors = useMemo(() => ({
    call:      { bg: colors.redAccent[700],     text: colors.redAccent[200] },
    email:     { bg: colors.purpleAccent[700],  text: colors.purpleAccent[200] },
    whatsapp:  { bg: colors.greenAccent[700],   text: colors.greenAccent[200] },
    visit:     { bg: colors.orangeAccent[700],  text: colors.orangeAccent[200] },
    task:      { bg: colors.blueAccent[700],    text: colors.blueAccent[200] },
    general:   { bg: colors.gray[800],          text: colors.gray[200] },
    message:   { bg: colors.gray[700],          text: colors.gray[100] },
    meeting:   { bg: colors.orangeAccent[600],  text: colors.orangeAccent[100] },
    _default:  { bg: colors.gray[800],          text: colors.gray[100] },
  }), [theme.palette.mode]); // re-compute when mode flips

  const getTypeBG = (t) => (typeColors[t]?.bg ?? typeColors._default.bg);
  const getTypeText = (t) => (typeColors[t]?.text ?? typeColors._default.text);

  const filteredLogs =
    filterType === "all"
      ? logActivityListData
      : logActivityListData.filter((log) => log.activity_type === filterType);

  return (
    <Box sx={{ p: 3, bgcolor: theme.palette.background.default, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 800, color: colors.gray[100] }}>
        Log Activities
      </Typography>

      {/* Tabs */}
      <Tabs
        value={filterType}
        onChange={(_, v) => setFilterType(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 3,
          minHeight: "unset",
          ".MuiTabs-indicator": { display: "none" },
          gap: 1,
        }}
      >
        {LOG_TYPES.map((type) => {
          const active = filterType === type.value;
          return (
            <Tab
              key={type.value}
              label={type.label}
              value={type.value}
              sx={{
                textTransform: "capitalize",
                fontWeight: 600,
                borderRadius: 2,
                px: 2.5,
                py: 1,
                minHeight: "unset",
                minWidth: 100,
                border: `1px solid ${colors.gray[700]}`,
                backgroundColor: active ? getTypeBG(type.value) : colors.gray[900],
                color: active ? getTypeText(type.value) : colors.gray[200],
                transition: "0.2s",
                "&:hover": {
                  backgroundColor: active ? getTypeBG(type.value) : colors.gray[800],
                },
              }}
            />
          );
        })}
      </Tabs>

      <List>
        {filteredLogs.map((activity) => (
          <ListItem
            key={activity.id}
            sx={{
              bgcolor: theme.palette.background.paper,
              borderRadius: 2,
              boxShadow: 1,
              mb: 2,
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: `1px solid ${colors.gray[700]}`,
            }}
          >
            <ListItemAvatar>
              <Avatar
                sx={{
                  bgcolor: getTypeBG(activity.activity_type),
                  color: getTypeText(activity.activity_type),
                }}
              >
                {getIcon(activity.activity_type)}
              </Avatar>
            </ListItemAvatar>

            <ListItemText
              primary={
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: colors.gray[100] }}>
                    {activity.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.gray[300] }}>
                    {activity.notes}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ mt: 0.5, display: "block", color: colors.gray[400] }}
                  >
                    By {activity.created_by?.name || "Unknown"} ·{" "}
                    {dayjs(activity.created_at).format("MMM D, YYYY · h:mm A")}
                  </Typography>
                </Box>
              }
              sx={{ flex: 1, ml: 2 }}
            />

            <Button
              variant="outlined"
              size="small"
              sx={{
                color: colors.blueAccent[300],
                borderColor: colors.blueAccent[500],
                "&:hover": {
                  bgcolor: colors.blueAccent[700],
                  color: colors.primary[900],
                },
              }}
            >
              View Details
            </Button>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
