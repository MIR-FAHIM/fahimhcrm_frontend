// components_task/task_card.jsx
import React from "react";
import {
  Card,
  Box,
  Typography,
  Avatar,
  Button,
  LinearProgress,
  Chip,
  useTheme,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { tokens } from "../../../../theme";
import { base_url, image_file_url } from "../../../../api/config/index";

const lineClamp = (lines = 2) => ({
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "-webkit-box",
  WebkitLineClamp: lines,
  WebkitBoxOrient: "vertical",
});

const TaskCard = ({ task, provided, snapshot }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const priorityColor = task?.priority?.color_code || colors.gray[400];
  const isOverdue =
    task?.due_date && dayjs(task.due_date).isBefore(dayjs(), "day");

  const assignedPhoto =
    task?.assigned_person?.photo ||
    task?.assigned_persons?.[0]?.photo ||
    task?.creator?.photo;

  const assignedName =
    task?.assigned_person?.name ||
    task?.assigned_persons?.[0]?.name ||
    task?.creator?.name ||
    "—";

  const onDetails = () => navigate(`/task-details/${task.task_id || task.id}`);

  return (
    <Card
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      sx={{
        width: 280,
        mb: 2,
        p: 1.5,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        boxShadow: snapshot?.isDragging ? theme.shadows[6] : theme.shadows[1],
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        backgroundColor: snapshot?.isDragging
          ? colors.primary[700]
          : theme.palette.background.default,
        ...(provided?.draggableProps?.style || {}),
      }}
    >
      {/* Top row: priority + title + handle */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", gap: 1, flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              mt: 0.3,
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: priorityColor,
              flexShrink: 0,
            }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              fontWeight={700}
              fontSize=".82rem"
              sx={{ color: colors.gray[100], ...lineClamp(2) }}
              title={task?.task_title}
            >
              {task?.priority?.priority_name
                ? `${task.priority.priority_name} • ${task.task_title}`
                : task?.task_title}
            </Typography>
          </Box>
        </Box>

        {provided && (
          <Box
            {...provided.dragHandleProps}
            sx={{ ml: 0.5, mt: 0.2, color: colors.gray[400], cursor: "grab" }}
            title="Drag"
          >
            <DragIndicatorIcon fontSize="small" />
          </Box>
        )}
      </Box>

      {/* Details */}
      {task?.task_details ? (
        <Typography
          variant="body2"
          sx={{ mt: 0.75, color: colors.gray[200], ...lineClamp(3) }}
          title={task.task_details}
        >
          {task.task_details}
        </Typography>
      ) : null}

      {/* Progress (optional) */}
      {Number(task?.show_completion_percentage) === 1 ? (
        <Box sx={{ mt: 1.25 }}>
          <LinearProgress
            variant="determinate"
            value={Number(task?.completion_percentage) || 0}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: colors.gray[800],
              "& .MuiLinearProgress-bar": { borderRadius: 3 },
            }}
          />
          <Typography
            variant="caption"
            sx={{ display: "block", textAlign: "right", color: colors.gray[400], mt: 0.25 }}
          >
            {(task?.completion_percentage || 0) + "%"}
          </Typography>
        </Box>
      ) : null}

      {/* Due date pill */}
      {task?.due_date ? (
        <Chip
          size="small"
          icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
          label={
            (isOverdue ? "Overdue: " : "Due: ") +
            dayjs(task.due_date).format("MMM D, YYYY")
          }
          sx={{
            mt: 1,
            height: 24,
            "& .MuiChip-label": { px: 1 },
            bgcolor: isOverdue ? colors.redAccent[700] : colors.gray[900],
            color: isOverdue ? colors.redAccent[600] : colors.gray[200],
          }}
        />
      ) : null}

      {/* Assignee / Creator */}
      <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
        <Avatar
          src={`${image_file_url || base_url + "/storage"}/${assignedPhoto || ""}`}
          sx={{
            width: 24,
            height: 24,
            mr: 1,
            bgcolor: colors.blueAccent[500],
            fontSize: 12,
          }}
        >
          {assignedName?.[0]?.toUpperCase() || "?"}
        </Avatar>
        <Typography
          variant="caption"
          sx={{ color: colors.gray[300], ...lineClamp(1) }}
          title={assignedName}
        >
          {assignedName}
        </Typography>
      </Box>

      {/* Details button */}
      <Box sx={{ mt: 1 }}>
        <Button
          variant="outlined"
          size="small"
          fullWidth
          onClick={onDetails}
          sx={{
            height: 26,
            fontSize: "0.72rem",
            color: colors.gray[100],
            borderColor: colors.gray[700],
            textTransform: "none",
            "&:hover": { borderColor: colors.blueAccent[500] },
          }}
        >
          View Details
        </Button>
      </Box>
    </Card>
  );
};

export default TaskCard;
