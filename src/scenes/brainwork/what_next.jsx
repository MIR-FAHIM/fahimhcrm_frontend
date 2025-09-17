import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Stack,
  Typography,
  Chip,
  LinearProgress,
  Button,
  TextField,
  Divider,
  Snackbar,
  Alert,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import AppleIcon from "@mui/icons-material/Apple";
import IosShareIcon from "@mui/icons-material/IosShare";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { tokens } from "../../theme";
/* ---------------- ROADMAP DATA ---------------- */
const ROADMAP = [
  {
    id: "whatsapp-leads",
    icon: <WhatsAppIcon />,
    title: "WhatsApp lead generation",
    blurb:
      "Capture leads directly from WhatsApp chats—auto-create prospects, log messages, and trigger follow-ups.",
    status: "In development",
    eta: "Q4 2025",
    progress: 68,
    bucket: "in_dev",
    tags: ["CRM", "Automation", "Integrations"],
  },
  {
    id: "linkedin-leads",
    icon: <LinkedInIcon />,
    title: "LinkedIn lead generation",
    blurb:
      "Enrich profiles from LinkedIn, save conversations, and push qualified prospects to your pipeline.",
    status: "Planned",
    eta: "Q1 2026",
    progress: 15,
    bucket: "planned",
    tags: ["CRM", "Prospecting"],
  },
  {
    id: "google-meet",
    icon: <VideoCallIcon />,
    title: "Google Meet API integration",
    blurb:
      "Create meetings from tasks/projects, auto-sync attendees, notes, and recordings to the right place.",
    status: "In discovery",
    eta: "Researching",
    progress: 10,
    bucket: "exploring",
    tags: ["Projects", "Meetings"],
  },
  {
    id: "ios-app",
    icon: <AppleIcon />,
    title: "iOS app",
    blurb:
      "Fast, offline-friendly iOS app with location check-ins, task widgets, and push notifications.",
    status: "Planned",
    eta: "Early 2026",
    progress: 5,
    bucket: "planned",
    tags: ["Mobile", "Attendance", "Tasks"],
  },
  {
    id: "social-share-tasks",
    icon: <IosShareIcon />,
    title: "Direct task share to social",
    blurb:
      "Share public task links to social channels for recruiting, community help, or open collaboration.",
    status: "In design",
    eta: "Q4 2025",
    progress: 35,
    bucket: "in_dev",
    tags: ["Tasks", "Collaboration"],
  },
];

/* ---------------- HELPER ---------------- */
function StatusChip({ text, color }) {
  return (
    <Chip
      size="small"
      label={text}
      sx={{
        bgcolor: alpha(color, 0.12),
        color,
        fontWeight: 700,
        borderRadius: 1.5,
      }}
    />
  );
}

/* ---------------- CARD ---------------- */
function RoadmapCard({ item, onVote, voted, votes, onNotify }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const brand = colors.blueAccent[100] ?? colors.blueAccent[100];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: "background.paper",
      }}
    >
      <Stack spacing={1}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 36,
              height: 36,
              display: "grid",
              placeItems: "center",
              bgcolor: alpha(brand, 0.12),
              color: brand,
              borderRadius: 2,
            }}
          >
            {item.icon}
          </Box>
          <Typography variant="subtitle1" fontWeight={800}>
            {item.title}
          </Typography>
          <Box flex={1} />
          <StatusChip
            text={item.status}
            color={
              item.status.toLowerCase().includes("dev")
                ? colors.blueAccent[100]
                : item.status.toLowerCase().includes("planned")
                ? theme.palette.text.secondary
                : theme.palette.warning.main
            }
          />
        </Stack>

        {/* Body */}
        <Typography variant="body2" color="text.secondary">
          {item.blurb}
        </Typography>

        {/* Tags */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {item.tags.map((t) => (
            <Chip
              key={t}
              size="small"
              label={t}
              sx={{
                bgcolor: alpha(theme.palette.text.secondary, 0.12),
                color: theme.palette.text.secondary,
                borderRadius: 1.5,
              }}
            />
          ))}
        </Stack>

        {/* Progress */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="caption" color="text.secondary">
            ETA: {item.eta}
          </Typography>
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={item.progress}
              sx={{
                height: 8,
                borderRadius: 999,
                "& .MuiLinearProgress-bar": { bgcolor: brand },
              }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ width: 40, textAlign: "right" }}>
            {item.progress}%
          </Typography>
        </Stack>

        {/* Actions */}
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant={voted ? "contained" : "outlined"}
            onClick={onVote}
            startIcon={voted ? <ThumbUpAltIcon /> : <ThumbUpOutlinedIcon />}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            {voted ? "Voted" : "Vote"} • {votes}
          </Button>
          <Button
            size="small"
            variant="text"
            startIcon={<NotificationsActiveIcon />}
            onClick={onNotify}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Notify me
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

/* ---------------- PAGE ---------------- */
export default function NextFeatures() {
  const theme = useTheme();
  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;

  const [votes, setVotes] = useState({});
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  const vote = (id) => {
    setVotes((prev) => {
      const voted = !!prev[id];
      const count = (prev[`${id}-count`] ?? 0) + (voted ? -1 : 1);
      return { ...prev, [id]: !voted, [`${id}-count`]: Math.max(0, count) };
    });
  };

  const votesCount = (id) => votes[`${id}-count`] ?? 0;

  const notify = () =>
    setSnack({
      open: true,
      msg: "We’ll notify you when this goes live (demo only).",
      sev: "success",
    });

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Container sx={{ py: 6 }}>
        <Typography variant="h5" fontWeight={800} mb={2}>
          What’s next for BrainToDo
        </Typography>
        <Stack spacing={2}>
          {ROADMAP.map((item) => (
            <RoadmapCard
              key={item.id}
              item={item}
              votes={votesCount(item.id)}
              voted={!!votes[item.id]}
              onVote={() => vote(item.id)}
              onNotify={notify}
            />
          ))}
        </Stack>
      </Container>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.sev}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
