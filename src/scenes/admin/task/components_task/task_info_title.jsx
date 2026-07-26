import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  CloseRounded,
  EditRounded,
  NotesRounded,
  SaveRounded,
  TaskAltRounded,
} from "@mui/icons-material";

const TaskTitleInfo = ({ task, handleTaskInfoUpdate }) => {
  const theme = useTheme();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.task_title || "");
  const [editedDetails, setEditedDetails] = useState(task.task_details || "");

  useEffect(() => {
    setEditedTitle(task.task_title || "");
    setEditedDetails(task.task_details || "");
    setIsEditingTitle(false);
    setIsEditingDetails(false);
  }, [task.id, task.task_title, task.task_details]);

  const handleSave = (field) => {
    if (field === "task_title") {
      handleTaskInfoUpdate(field, editedTitle.trim());
      setIsEditingTitle(false);
      return;
    }

    handleTaskInfoUpdate(field, editedDetails.trim());
    setIsEditingDetails(false);
  };

  const handleCancelTitle = () => {
    setEditedTitle(task.task_title || "");
    setIsEditingTitle(false);
  };

  const handleCancelDetails = () => {
    setEditedDetails(task.task_details || "");
    setIsEditingDetails(false);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.09)}, transparent 44%)`,
        }}
      />

      <Stack spacing={2.5} sx={{ position: "relative" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "flex-start" }}>
          <Box
            sx={{
              width: 58,
              height: 58,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <TaskAltRounded />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
              <Chip size="small" label={`Task #${task.id}`} sx={{ fontWeight: 800 }} />
              {task.is_waiting ? <Chip size="small" color="warning" label="Waiting" sx={{ fontWeight: 800 }} /> : null}
            </Stack>

            {isEditingTitle ? (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }}>
                <TextField
                  fullWidth
                  value={editedTitle}
                  onChange={(event) => setEditedTitle(event.target.value)}
                  autoFocus
                  label="Task title"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TaskAltRounded fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Tooltip title="Save title">
                    <IconButton color="primary" onClick={() => handleSave("task_title")}>
                      <SaveRounded />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Cancel">
                    <IconButton onClick={handleCancelTitle}>
                      <CloseRounded />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            ) : (
              <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between">
                <Typography
                  variant="h4"
                  sx={{
                    color: theme.palette.text.primary,
                    fontWeight: 900,
                    lineHeight: 1.12,
                    wordBreak: "break-word",
                  }}
                >
                  {task.task_title || "Untitled task"}
                </Typography>
                <Tooltip title="Edit title">
                  <IconButton onClick={() => setIsEditingTitle(true)} sx={{ flexShrink: 0 }}>
                    <EditRounded />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
          </Box>
        </Stack>

        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: theme.palette.background.default,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5} sx={{ mb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <NotesRounded fontSize="small" color="primary" />
              <Typography variant="subtitle2" sx={{ color: theme.palette.text.primary, fontWeight: 900 }}>
                Details
              </Typography>
            </Stack>
            {!isEditingDetails && (
              <Button size="small" startIcon={<EditRounded />} onClick={() => setIsEditingDetails(true)} sx={{ borderRadius: 2 }}>
                Edit
              </Button>
            )}
          </Stack>

          {isEditingDetails ? (
            <Stack spacing={1.5}>
              <TextField
                fullWidth
                multiline
                minRows={4}
                value={editedDetails}
                onChange={(event) => setEditedDetails(event.target.value)}
                autoFocus
                placeholder="Write task details, notes, acceptance criteria, or context"
              />
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button variant="outlined" onClick={handleCancelDetails} sx={{ borderRadius: 2 }}>
                  Cancel
                </Button>
                <Button variant="contained" startIcon={<SaveRounded />} onClick={() => handleSave("task_details")} sx={{ borderRadius: 2, fontWeight: 900 }}>
                  Save Details
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Typography
              variant="body1"
              sx={{
                color: task.task_details ? theme.palette.text.primary : theme.palette.text.secondary,
                whiteSpace: "pre-line",
                lineHeight: 1.7,
              }}
            >
              {task.task_details || "No details provided."}
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
};

export default TaskTitleInfo;