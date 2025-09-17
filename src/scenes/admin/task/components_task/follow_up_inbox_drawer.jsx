// src/scenes/task/components_task/TaskFollowupInboxDrawer.jsx
import React, { useMemo, useState } from "react";
import {
  Box,
  Drawer,
  Stack,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Avatar,
  Chip,
  Button,
  Tooltip,
  useTheme,
} from "@mui/material";
import SearchRounded from "@mui/icons-material/SearchRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import SendRounded from "@mui/icons-material/SendRounded";
import { tokens } from "../../../../theme";
import dayjs from "dayjs";
import { image_file_url } from "../../../../api/config";

const EmptyState = ({ colors }) => (
  <Box sx={{ p: 4, textAlign: "center" }}>
    <Typography variant="h6" sx={{ color: colors.gray[300], mb: 1 }}>
      No follow-ups yet
    </Typography>
    <Typography variant="body2" sx={{ color: colors.gray[500] }}>
      Create your first follow-up using the composer below.
    </Typography>
  </Box>
);

export default function TaskFollowupInboxDrawer({
  open,
  onClose,
  followUps = [],
  taskID,
  onAddFollowUp,        // (title, details) => Promise
  onToggleComplete,     // (followupId, newStatus) => void
  onEditFollowUp,       // (followup) => void
  onDeleteFollowUp,     // (followupId) => void
}) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // local UI state (search & selection & compose)
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState(followUps?.[0]?.id ?? null);
  const [newTitle, setNewTitle] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const selected = useMemo(
    () => followUps.find((f) => f.id === selectedId) || null,
    [followUps, selectedId]
  );

  const filtered = useMemo(() => {
    const s = (q || "").toLowerCase();
    if (!s) return followUps;
    return followUps.filter(
      (f) =>
        (f.followup_title || "").toLowerCase().includes(s) ||
        (f.followup_details || "").toLowerCase().includes(s) ||
        (f.created_by_name || "").toLowerCase().includes(s)
    );
  }, [q, followUps]);

  const handleAdd = async () => {
    if (!newTitle.trim() || !newDetails.trim()) return;
    await onAddFollowUp?.(newTitle.trim(), newDetails.trim());
    setNewTitle("");
    setNewDetails("");
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 640, md: 920 },
          bgcolor: theme.palette.background.default,
          borderLeft: `1px solid ${colors.gray[800]}`,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${colors.gray[800]}`,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Task Follow-ups
        </Typography>
        <Box sx={{ flex: 1 }} />
        <IconButton onClick={onClose}>
          <CloseRounded />
        </IconButton>
      </Box>

      {/* Content grid: left list / right detail */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "320px 1fr" },
          minHeight: 0,
          flex: 1,
        }}
      >
        {/* Left rail: search + list */}
        <Box
          sx={{
            borderRight: { md: `1px solid ${colors.gray[800]}` },
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search follow-ups"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& input": { color: colors.gray[100] },
                "& fieldset": { borderColor: colors.gray[700] },
                "&:hover fieldset": { borderColor: colors.gray[400] },
                "&.Mui-focused fieldset": { borderColor: colors.blueAccent[500] },
              }}
            />
          </Box>

          <Divider />

          <Box sx={{ overflowY: "auto", flex: 1 }}>
            <List dense disablePadding>
              {filtered.length === 0 ? (
                <EmptyState colors={colors} />
              ) : (
                filtered.map((f) => {
                  const active = f.id === selectedId;
                  return (
                    <ListItemButton
                      key={f.id}
                      selected={active}
                      onClick={() => setSelectedId(f.id)}
                      sx={{
                        py: 1.25,
                        px: 1.5,
                        borderBottom: `1px solid ${colors.gray[900]}`,
                        "&.Mui-selected": {
                          bgcolor: colors.gray[900],
                          "&:hover": { bgcolor: colors.gray[700] },
                        },
                      }}
                    >
                      <Avatar
                        src={f.created_by_avatar_url ? f.created_by_avatar_url : ""}
                        sx={{
                          width: 34,
                          height: 34,
                          mr: 1.25,
                          bgcolor: colors.blueAccent[500],
                        }}
                      >
                        {(f.created_by_name || "U")?.charAt(0)}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography
                              noWrap
                              sx={{ fontWeight: 700, color: colors.gray[100] }}
                            >
                              {f.followup_title}
                            </Typography>
                            <Chip
                              size="small"
                              label={f.status === "1" ? "Active" : "Done"}
                              sx={{
                                height: 18,
                                bgcolor:
                                  f.status === "1"
                                    ? colors.gray[700]
                                    : colors.gray[600],
                                color: colors.gray[100],
                                borderRadius: "6px",
                              }}
                            />
                          </Stack>
                        }
                        secondary={
                          <Typography
                            noWrap
                            variant="caption"
                            sx={{ color: colors.gray[400] }}
                          >
                            {f.created_by_name || "N/A"} •{" "}
                            {dayjs(f.created_at).format("MMM D, YYYY h:mm A")}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  );
                })
              )}
            </List>
          </Box>
        </Box>

        {/* Right: detail pane */}
        <Box
          sx={{
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <Box sx={{ p: 2 }}>
            {selected ? (
              <>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    src={selected.created_by_avatar_url ? selected.created_by_avatar_url : ""}
                    sx={{ width: 40, height: 40, bgcolor: colors.blueAccent[500] }}
                  >
                    {(selected.created_by_name || "U")?.charAt(0)}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {selected.followup_title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                      by {selected.created_by_name || "N/A"} •{" "}
                      {dayjs(selected.created_at).format("MMM D, YYYY h:mm A")}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }} />
                  <Tooltip
                    title={selected.status === "1" ? "Mark as done" : "Mark active"}
                  >
                    <IconButton
                      onClick={() =>
                        onToggleComplete?.(
                          selected.id,
                          selected.status === "1" ? "0" : "1"
                        )
                      }
                    >
                      <CheckCircleRounded />
                    </IconButton>
                  </Tooltip>
                  {onEditFollowUp && (
                    <Tooltip title="Edit">
                      <IconButton onClick={() => onEditFollowUp(selected)}>
                        <EditRounded />
                      </IconButton>
                    </Tooltip>
                  )}
                  {onDeleteFollowUp && (
                    <Tooltip title="Delete">
                      <IconButton onClick={() => onDeleteFollowUp(selected.id)}>
                        <DeleteRounded />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>

                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    border: `1px solid ${colors.gray[800]}`,
                    borderRadius: 2,
                    bgcolor: theme.palette.background.paper,
                    whiteSpace: "pre-wrap",
                    color: colors.gray[100],
                  }}
                >
                  {selected.followup_details}
                </Box>
              </>
            ) : (
              <EmptyState colors={colors} />
            )}
          </Box>

          <Divider />

          {/* Composer */}
          <Box sx={{ p: 2, borderTop: `1px solid ${colors.gray[800]}` }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Add a follow-up
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField
                size="small"
                fullWidth
                placeholder="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                sx={{
                  "& input": { color: colors.gray[100] },
                  "& fieldset": { borderColor: colors.gray[700] },
                  "&:hover fieldset": { borderColor: colors.gray[400] },
                  "&.Mui-focused fieldset": { borderColor: colors.blueAccent[500] },
                }}
              />
              <TextField
                size="small"
                fullWidth
                placeholder="Details"
                value={newDetails}
                onChange={(e) => setNewDetails(e.target.value)}
                multiline
                maxRows={4}
                sx={{
                  "& .MuiInputBase-input": { color: colors.gray[100] },
                  "& fieldset": { borderColor: colors.gray[700] },
                  "&:hover fieldset": { borderColor: colors.gray[400] },
                  "&.Mui-focused fieldset": { borderColor: colors.blueAccent[500] },
                }}
              />
              <Button
                variant="contained"
                startIcon={<SendRounded />}
                onClick={handleAdd}
                sx={{
                  whiteSpace: "nowrap",
                  alignSelf: { xs: "stretch", sm: "center" },
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
