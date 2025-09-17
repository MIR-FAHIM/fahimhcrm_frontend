// src/scenes/notification/NotificationPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import TaskIcon from "@mui/icons-material/Assignment";
import AlertIcon from "@mui/icons-material/NotificationsActive";
import MessageIcon from "@mui/icons-material/Message";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import RefreshIcon from "@mui/icons-material/Refresh";
import RoomIcon from "@mui/icons-material/Room";
import { useNavigate } from "react-router-dom";
import { getNotificationUser /*, markRead, markAllRead */ } from "../../../api/controller/admin_controller/notification_controller";
import pusher from "../../provider/pusher";

/* --- Theme-aware helpers --- */

const useTypeMeta = () => {
  const theme = useTheme();
  return useCallback(
    (type) => {
      const { blueAccent, redAccent, success, primary, grey } = {
        blueAccent: theme.palette.blueAccent ?? theme.palette.info,
        redAccent: theme.palette.redAccent ?? theme.palette.error,
        success: theme.palette.success,
        primary: theme.palette.primary,
        grey: theme.palette.grey ?? {},
      };

      switch (type) {
        case "task":
          return {
            icon: <TaskIcon />,
            color: success.main,
            text: theme.palette.getContrastText(success.main),
            pillBg: alpha(success.main, 0.14),
          };
        case "alert":
          return {
            icon: <AlertIcon />,
            color: redAccent.main,
            text: theme.palette.getContrastText(redAccent.main),
            pillBg: alpha(redAccent.main, 0.14),
          };
        case "message":
          return {
            icon: <MessageIcon />,
            color: blueAccent.main,
            text: theme.palette.getContrastText(blueAccent.main),
            pillBg: alpha(blueAccent.main, 0.14),
          };
        default:
          return {
            icon: <TaskIcon />,
            color: primary.main,
            text: theme.palette.getContrastText(primary.main),
            pillBg: alpha(primary.main, 0.14),
          };
      }
    },
    [theme]
  );
};

const formatDayLabel = (dateStr) => {
  const d = new Date(dateStr);
  const today = new Date();
  const y = new Date();
  y.setDate(today.getDate() - 1);

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(d, today)) return "Today";
  if (isSameDay(d, y)) return "Yesterday";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

const groupByDay = (items) => {
  const groups = {};
  items.forEach((n) => {
    const key = formatDayLabel(n.created_at);
    groups[key] = groups[key] ? [...groups[key], n] : [n];
  });
  const order = Object.keys(groups).sort((a, b) => {
    const parse = (label) => {
      if (label === "Today") return 3e13;
      if (label === "Yesterday") return 3e13 - 1;
      return new Date(label).getTime();
    };
    return parse(b) - parse(a);
  });
  return order.map((k) => ({ label: k, items: groups[k] }));
};

/* --- Rows / UI pieces --- */

const NotificationRow = ({ n, metaForType, onView, onMarkRead }) => {
  const theme = useTheme();
  const meta = metaForType(n.type);
  const unseen = !n.is_seen;

  return (
    <Paper
      elevation={0}
      role="article"
      aria-live="polite"
      sx={{
        p: 2,
        mb: 1.25,
        borderRadius: 2,
        bgcolor: "background.paper",
        border: `1px solid ${theme.palette.divider}`,
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        position: "relative",
        overflow: "hidden",
        outline: "none",
        transition: "box-shadow .2s, transform .2s, background-color .2s",
        ...(unseen && {
          backgroundImage: `linear-gradient(0deg, ${alpha(meta.color, 0.08)}, ${alpha(meta.color, 0.08)})`,
        }),
        "&:hover": { boxShadow: 6, transform: "translateY(-1px)" },
        "&:focus-visible": {
          boxShadow: `0 0 0 3px ${alpha(meta.color, 0.35)}`,
          transform: "translateY(-1px)",
        },
        "&:before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: meta.color,
          opacity: 0.95,
        },
      }}
      tabIndex={0}
    >
      <Badge color="error" variant={unseen ? "dot" : "standard"} overlap="circular">
        <Avatar
          sx={{
            bgcolor: alpha(meta.color, 0.12),
            color: meta.color,
            width: 40,
            height: 40,
            border: `1px solid ${alpha(meta.color, 0.4)}`,
          }}
        >
          {meta.icon}
        </Avatar>
      </Badge>

      <Box flex={1} minWidth={0}>
        <Stack direction="row" alignItems="baseline" justifyContent="space-between" spacing={1}>
          <Typography variant="subtitle1" fontWeight={800} noWrap color="text.primary">
            {n.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
            {new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Typography>
        </Stack>

        {n.subtitle && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.25,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {n.subtitle}
          </Typography>
        )}

        <Stack direction="row" spacing={1} mt={1}>
          {n.related_id && (
            <Button
              size="small"
              variant="contained"
              onClick={() => onView(n.related_id, n.type)}
              sx={{
                textTransform: "none",
                fontWeight: 800,
                bgcolor: meta.color,
                color: meta.text,
                borderRadius: 1.5,
                px: 1.5,
                "&:hover": { bgcolor: meta.color },
              }}
            >
              View details
            </Button>
          )}
          {!n.is_seen && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => onMarkRead(n.id)}
              sx={{
                textTransform: "none",
                borderRadius: 1.5,
                px: 1.5,
                borderColor: alpha(meta.color, 0.5),
                color: meta.color,
                "&:hover": { bgcolor: alpha(meta.color, 0.08), borderColor: meta.color },
              }}
            >
              Mark as read
            </Button>
          )}
        </Stack>
      </Box>
    </Paper>
  );
};

const LiveStream = ({ messages }) => {
  const theme = useTheme();
  if (!messages.length) return null;
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        bgcolor: "background.paper",
        border: `1px dashed ${theme.palette.divider}`,
      }}
    >
      <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
        Live updates
      </Typography>
      <Stack spacing={0.75}>
        {messages.slice(-6).map((msg, i) => (
          <Typography key={`${msg}-${i}`} variant="body2">
            • {msg}
          </Typography>
        ))}
      </Stack>
    </Paper>
  );
};

const FilterBar = ({ filter, setFilter, onRefresh, unreadCount }) => {
  const theme = useTheme();
  const chips = [
    { key: "all", label: `All` },
    { key: "unread", label: `Unread${unreadCount ? ` (${unreadCount})` : ""}` },
    { key: "task", label: "Tasks" },
    { key: "alert", label: "Alerts" },
    { key: "message", label: "Messages" },
  ];
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ overflowX: "auto", pb: 1, "&::-webkit-scrollbar": { display: "none" } }}
    >
      {chips.map((c) => (
        <Chip
          key={c.key}
          clickable
          label={c.label}
          color={filter === c.key ? "primary" : "default"}
          onClick={() => setFilter(c.key)}
          sx={{
            borderRadius: "999px",
            fontWeight: 700,
            bgcolor: filter === c.key ? alpha(theme.palette.primary.main, 0.18) : "transparent",
          }}
        />
      ))}
      <Box flex={1} />
      <IconButton
        onClick={onRefresh}
        size="small"
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: "background.paper",
          "&:hover": { bgcolor: theme.palette.action.hover },
        }}
        aria-label="Refresh notifications"
      >
        <RefreshIcon />
      </IconButton>
    </Stack>
  );
};

/* --- Page --- */

const NotificationPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const userID = localStorage.getItem("userId");

  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [marking, setMarking] = useState(false);

  const metaForType = useTypeMeta();

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_seen).length,
    [notifications]
  );

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotificationUser(userID);
      if (response.status === "success") {
        setNotifications(response.notifications || []);
      } else {
        setNotifications([]);
      }
    } catch (e) {
      console.error("Fetch notifications failed:", e);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const channel = pusher.subscribe("my-channel");
    channel.bind("my-event", (data) => {
      setMessages((prev) => [...prev, data.message]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [userID]);

  const handleViewDetails = (id, type) => {
    if (type === "task" && id) navigate(`/task-details/${id}`);
  };

  const handleMarkAsRead = async (id) => {
    try {
      // await markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_seen: true } : n)));
    } catch (e) {
      console.error("Mark read failed:", e);
    }
  };

  const handleMarkAll = async () => {
    try {
      setMarking(true);
      // await markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_seen: true })));
    } catch (e) {
      console.error("Mark all read failed:", e);
    } finally {
      setMarking(false);
    }
  };

  const filtered = useMemo(() => {
    switch (filter) {
      case "unread":
        return notifications.filter((n) => !n.is_seen);
      case "task":
      case "alert":
      case "message":
        return notifications.filter((n) => n.type === filter);
      default:
        return notifications;
    }
  }, [notifications, filter]);

  const grouped = useMemo(() => groupByDay(filtered), [filtered]);

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: 4,
        mb: 6,
        py: 2,
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {unreadCount} unread • {notifications.length} total
          </Typography>
        </Box>
        <Button
          size="small"
          variant={unreadCount ? "contained" : "outlined"}
          startIcon={<DoneAllIcon />}
          disabled={!unreadCount || marking}
          onClick={handleMarkAll}
          sx={{
            textTransform: "none",
            fontWeight: 800,
            borderRadius: 2,
          }}
        >
          Mark all read
        </Button>
      </Stack>

      {/* Live Stream */}
      <LiveStream messages={messages} />

      {/* Filters */}
      <FilterBar
        filter={filter}
        setFilter={setFilter}
        unreadCount={unreadCount}
        onRefresh={fetchNotifications}
      />

      <Divider sx={{ my: 2 }} />

      {/* Content */}
      {loading ? (
        <Stack spacing={1.25}>
          {[...Array(5)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={80}
              sx={{
                borderRadius: 2,
                bgcolor: alpha(theme.palette.text.primary, 0.06),
              }}
            />
          ))}
        </Stack>
      ) : notifications.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 2,
            border: `1px dashed ${theme.palette.divider}`,
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            You’re all caught up
          </Typography>
          <Typography variant="body2" color="text.secondary">
            New notifications will appear here.
          </Typography>
          <Button
            onClick={fetchNotifications}
            startIcon={<RefreshIcon />}
            sx={{ mt: 2, textTransform: "none", fontWeight: 700 }}
          >
            Refresh
          </Button>
        </Paper>
      ) : filtered.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 2,
            border: `1px dashed ${theme.palette.divider}`,
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No notifications for this filter.
          </Typography>
        </Paper>
      ) : (
        grouped.map((group) => (
          <Box key={group.label} sx={{ mb: 3 }}>
            <Typography
              variant="overline"
              sx={{
                color: theme.palette.text.secondary,
                letterSpacing: 1,
                display: "block",
                mb: 1,
                fontWeight: 700,
              }}
            >
              {group.label}
            </Typography>
            {group.items.map((n) => (
              <NotificationRow
                key={n.id}
                n={n}
                metaForType={metaForType}
                onView={handleViewDetails}
                onMarkRead={handleMarkAsRead}
              />
            ))}
          </Box>
        ))
      )}
    </Container>
  );
};

export default NotificationPage;
