import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import CallIcon from "@mui/icons-material/Call";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PlaceIcon from "@mui/icons-material/Place";
import AssignmentIcon from "@mui/icons-material/Assignment";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import MessageIcon from "@mui/icons-material/Message";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";

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

export default function LogActivityList({ id, logActivityListData }) {
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {}, [id]);

  const getIcon = (type) => {
    switch (type) {
      case "call":
        return <CallIcon />;
      case "email":
        return <EmailIcon />;
      case "whatsapp":
        return <WhatsAppIcon />;
      case "visit":
        return <PlaceIcon />;
      case "task":
        return <AssignmentIcon />;
      case "general":
        return <QuestionAnswerIcon />;
      case "message":
        return <MessageIcon />;
      case "meeting":
        return <MeetingRoomIcon />;
      default:
        return <QuestionAnswerIcon />;
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case "call":
        return "#f3e5f5"; // Light Purple
      case "email":
        return "#ede7f6"; // Light Purple
      case "whatsapp":
        return "#e6fffa"; // Light Green
      case "visit":
        return "#fff3e0"; // Light Orange
      case "task":
        return "#e0f2fe"; // light blue
        
      case "general":
        return "#fef3c7"; // Light Yellow
      case "message":
        return "#e2e8f0"; // Light Gray
      case "meeting":
        return "#fff7ed"; // Light Orange
      default:
        return "#f3f4f6"; // Light Gray
    }
  };

  const filteredLogs =
    filterType === "all"
      ? logActivityListData
      : logActivityListData.filter((log) => log.activity_type === filterType);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Log Activities
      </Typography>

      {/* Tabs */}
      <Tabs
        value={filterType}
        onChange={(e, newValue) => setFilterType(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 3,
          minHeight: "unset",
          ".MuiTabs-indicator": { display: "none" },
          gap: 1,
        }}
      >
        {LOG_TYPES.map((type) => (
          <Tab
            key={type.value}
            label={type.label}
            value={type.value}
            sx={{
              textTransform: "capitalize",
              fontWeight: 500,
              borderRadius: 2,
              px: 2.5,
              py: 1,
              minHeight: "unset",
              minWidth: 100,
              border: "1px solid #cbd5e1",
              backgroundColor: filterType === type.value ? getIconColor(type.value) : "#f1f5f9",
              color: filterType === type.value ? "#0f172a" : "#1e293b",
              transition: "0.2s",
              "&:hover": {
                backgroundColor: filterType === type.value ? getIconColor(type.value) : "#e2e8f0",
              },
            }}
          />
        ))}
      </Tabs>

      <List>
        {filteredLogs.map((activity) => (
          <ListItem
            key={activity.id}
            sx={{
              backgroundColor: "#fff",
              borderRadius: 2,
              boxShadow: 1,
              mb: 2,
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <ListItemAvatar>
              <Avatar
                sx={{
                  bgcolor: getIconColor(activity.activity_type),
                  color: "#0f172a",
                }}
              >
                {getIcon(activity.activity_type)}
              </Avatar>
            </ListItemAvatar>

            <ListItemText
              primary={
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {activity.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activity.notes}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ mt: 0.5, display: "block", color: "#64748b" }}
                  >
                    By {activity.created_by?.name || "Unknown"} ·{" "}
                    {dayjs(activity.created_at).format("MMM D, YYYY · h:mm A")}
                  </Typography>
                </Box>
              }
              sx={{ flex: 1, ml: 2 }}
            />

            <Button variant="outlined" size="small">
              View Details
            </Button>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
