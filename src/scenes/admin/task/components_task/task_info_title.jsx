import React, { useState } from "react";
import {
  Grid,
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Divider,
  Tooltip,
  Fade
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { styled } from "@mui/material/styles";

const TaskTitleInfo = ({ task, handleTaskInfoUpdate }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.task_title);
  const [editedDetails, setEditedDetails] = useState(task.task_details);

  // Styled container card
  const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: theme.shadows[2],
    backgroundColor: theme.palette.background.paper,
    transition: "all 0.25s ease",
    "&:hover": { boxShadow: theme.shadows[5] }
  }));

  // Styled ID Circle
  const IdCircle = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
    borderRadius: "50%",
    fontWeight: 700,
    fontSize: "0.9rem",
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    flexShrink: 0
  }));

  // Reusable save handler
  const handleSave = (field) => {
    if (field === "task_title") {
      handleTaskInfoUpdate(field, editedTitle);
      setIsEditingTitle(false);
    } else if (field === "task_details") {
      handleTaskInfoUpdate(field, editedDetails);
      setIsEditingDetails(false);
    }
  };

  return (
    <Grid item xs={12}>
      <StyledPaper>
        {/* Header Row with ID + Title */}
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <IdCircle>{task.id}</IdCircle>
          <Box flexGrow={1}>
            {isEditingTitle ? (
              <Box display="flex" alignItems="center" gap={1}>
                <TextField
                  fullWidth
                  variant="standard"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  autoFocus
                  InputProps={{
                    style: { fontSize: "1.5rem", fontWeight: 600 }
                  }}
                />
                <Tooltip title="Save Title">
                  <IconButton
                    onClick={() => handleSave("task_title")}
                    size="small"
                    sx={{
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": { bgcolor: "primary.dark" }
                    }}
                  >
                    <SaveIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ) : (
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "text.primary" }}
                >
                  {task.task_title}
                </Typography>
                <Tooltip title="Edit Title">
                  <IconButton
                    onClick={() => setIsEditingTitle(true)}
                    size="small"
                    sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Details Section */}
        <Box>
          <Typography variant="subtitle2" color="text.secondary" mb={1}>
            Details
          </Typography>

          {isEditingDetails ? (
            <Fade in>
              <Box display="flex" alignItems="center" gap={1}>
                <TextField
                  fullWidth
                  variant="standard"
                  value={editedDetails}
                  onChange={(e) => setEditedDetails(e.target.value)}
                  autoFocus
                  InputProps={{
                    style: { fontSize: "1.5rem", fontWeight: 600 }
                  }}
                />
                <Tooltip title="Save Title">
                  <IconButton
                    onClick={() => handleSave("task_details")}
                    size="small"
                    sx={{
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": { bgcolor: "primary.dark" }
                    }}
                  >
                    <SaveIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Fade>
          ) : (
            <Box>
              <Typography
                variant="body1"
                sx={{
                  color: task.task_details ? "text.primary" : "text.disabled",
                  whiteSpace: "pre-line",
                  lineHeight: 1.6
                }}
              >
                {task.task_details || "No details provided."}
              </Typography>
              <Box display="flex" justifyContent="flex-end" mt={1}>
                <Tooltip title="Edit Details">
                  <IconButton
                    onClick={() => setIsEditingDetails(true)}
                    size="small"
                    sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          )}
        </Box>
      </StyledPaper>
    </Grid>
  );
};

export default TaskTitleInfo;
