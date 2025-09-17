import React, { useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  Button,
  Tooltip,
  IconButton,
  useTheme,
  useMediaQuery,
  Switch,
  FormControlLabel,
} from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import GroupIcon from "@mui/icons-material/Group";
import FlagIcon from "@mui/icons-material/Flag";
import { tokens } from "../../../../theme";

/**
 * Props:
 * - task: object (expects task.is_waiting as 0/1 or boolean)
 * - imageBaseUrl: string
 * - onDetails: (taskId) => void
 * - onWaitingChange: (taskId, isWaitingBoolean) => void   <-- NEW
 */
const TaskCardWaitingView = ({
  task,
  imageBaseUrl,
  onDetails,
  onWaitingChange,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isMdDown = useMediaQuery(theme.breakpoints.down("md"));

  const completionColor = useMemo(() => {
    const v = Number(task?.completion_percentage || 0);
    if (v >= 80) return colors.greenAccent[500];
    if (v >= 50) return colors.blueAccent[500];
    return colors.redAccent[500];
  }, [task?.completion_percentage, colors]);

  const priorityChip = (
    <Chip
      size="small"
      label={task?.priority?.priority_name ?? "Priority"}
      icon={<FlagIcon sx={{ fontSize: 16 }} />}
      sx={{
        ml: 1,
        mt: { xs: 0.5, sm: 0 },
        color: theme.palette.getContrastText(
          task?.priority?.color_code || colors.orangeAccent[500]
        ),
        backgroundColor: task?.priority?.color_code || colors.orangeAccent[500],
        "& .MuiChip-icon": { color: "inherit" },
      }}
    />
  );

  const isWaitingBool =
    typeof task?.is_waiting === "boolean"
      ? task.is_waiting
      : Number(task?.is_waiting) === 1;

  const handleWaitingToggle = (_e, checked) => {
    onWaitingChange?.(task.id, checked);
  };

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        bgcolor: "background.paper",
        border: `1px solid ${theme.palette.divider}`,
        transition: "transform .2s ease, box-shadow .2s ease",
        "&:hover": { transform: "translateY(-2px)", boxShadow: theme.shadows[6] },
      }}
    >
      <CardContent sx={{ p: { xs: 1.75, sm: 2.25 } }}>
        {/* Title Row */}
        <Box
          display="flex"
          alignItems="flex-start"
          justifyContent="space-between"
          gap={1}
          mb={1}
          flexWrap="wrap"
        >
          <Box minWidth={0} flex={1}>
            <Typography
              variant={isXs ? "subtitle2" : "subtitle1"}
              fontWeight={600}
              sx={{
                color: colors.gray[100],
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                mb: 1,
                wordBreak: "break-word",
              }}
              title={`${task?.id} - ${task?.task_title}`}
            >
              #{task?.id} — {task?.task_title}
            </Typography>

            <Box display="flex" alignItems="center" flexWrap="wrap" mt={0.25}>
              {task?.project ? (
                <Tooltip title={`Project: ${task.project.project_name}`}>
                  <Chip
                    size="small"
                    icon={<LaunchIcon sx={{ fontSize: 16 }} />}
                    label={task.project.project_name}
                    variant="outlined"
                    sx={{
                      mr: 1,
                      mb: 0.5,
                      color: colors.gray[100],
                      borderColor: colors.gray[700],
                      bgcolor: colors.primary[900],
                      maxWidth: { xs: "100%", sm: "unset" },
                    }}
                  />
                </Tooltip>
              ) : (
                <Chip
                  size="small"
                  label="No Project"
                  variant="outlined"
                  sx={{
                    mr: 1,
                    mb: 0.5,
                    color: colors.gray[300],
                    borderColor: colors.gray[700],
                  }}
                />
              )}
              {priorityChip}
            </Box>
          </Box>

          <IconButton
            size="small"
            sx={{ color: colors.gray[400], ml: "auto", mt: { xs: -0.5, sm: 0 } }}
          >
            <MoreHorizIcon />
          </IconButton>
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: task?.task_details ? colors.gray[200] : colors.gray[400],
            display: "-webkit-box",
            WebkitLineClamp: isMdDown ? 3 : 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            mb: 1.25,
            wordBreak: "break-word",
          }}
        >
          {task?.task_details || "No details provided."}
        </Typography>

        {/* Progress */}
        {Number(task?.show_completion_percentage) === 1 && (
          <Box mb={1.5}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={0.75}
            >
              <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                Progress
              </Typography>
              <Typography variant="caption" sx={{ color: colors.gray[300] }}>
                {Number(task?.completion_percentage || 0)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Number(task?.completion_percentage || 0)}
              sx={{
                height: 8,
                borderRadius: 6,
                bgcolor: colors.primary[800],
                "& .MuiLinearProgress-bar": { backgroundColor: completionColor },
              }}
            />
          </Box>
        )}

        {/* Meta & Pipeline block */}
        <Box
          display="flex"
          flexDirection="column"
          sx={{
            bgcolor: colors.primary[900],
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            p: 1,
            mb: 1.5,
          }}
        >
          {/* Creator + Assignees */}
          <Box
            display="flex"
            alignItems="center"
            gap={1.25}
            minWidth={0}
            flexWrap="wrap"
          >
            <Tooltip title={`Created by ${task?.creator?.name ?? "Unknown"}`}>
              <Avatar
                src={
                  task?.creator?.photo
                    ? `${imageBaseUrl}/${task.creator.photo}`
                    : undefined
                }
                sx={{
                  width: { xs: 28, sm: 30 },
                  height: { xs: 28, sm: 30 },
                  bgcolor: colors.blueAccent[600],
                  fontSize: 12,
                  flex: "0 0 auto",
                }}
              >
                {task?.creator?.name?.[0] ?? "?"}
              </Avatar>
            </Tooltip>

            <Tooltip title="Assigned users">
              <Box
                display="flex"
                alignItems="center"
                minWidth={0}
                sx={{ gap: 0.25, flexWrap: "wrap", flex: 1 }}
              >
                <GroupIcon
                  sx={{
                    fontSize: 18,
                    color: colors.gray[400],
                    mr: 0.5,
                    flex: "0 0 auto",
                  }}
                />

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    minWidth: 0,
                    overflow: "hidden",
                    flexWrap: "wrap",
                  }}
                >
                  {(task?.assigned_persons ?? [])
                    .slice(0, 4)
                    .map((p, idx) => (
                      <Avatar
                        key={p?.assigned_person?.id ?? idx}
                        src={
                          p?.assigned_person?.photo
                            ? `${imageBaseUrl}/${p.assigned_person.photo}`
                            : undefined
                        }
                        alt={p?.assigned_person?.name}
                        sx={{
                          width: { xs: 22, sm: 26 },
                          height: { xs: 22, sm: 26 },
                          ml: idx === 0 ? 0 : -0.5,
                          border: `2px solid ${theme.palette.background.paper}`,
                          bgcolor: colors.gray[700],
                          fontSize: 11,
                          flex: "0 0 auto",
                          mb: 0.25,
                        }}
                      >
                        {p?.assigned_person?.name?.[0] ?? "•"}
                      </Avatar>
                    ))}
                  {task?.assigned_persons?.length > 4 && (
                    <Chip
                      size="small"
                      label={`+${task.assigned_persons.length - 4}`}
                      sx={{ ml: 0.5, height: 22 }}
                    />
                  )}
                </Box>
              </Box>
            </Tooltip>
          </Box>

          {/* Pipeline toggle */}
          <Box
            mt={1}
            px={1}
            py={0.5}
            sx={{
              bgcolor: colors.primary[800],
              borderRadius: 1.5,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={isWaitingBool}
                  onChange={handleWaitingToggle}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" sx={{ color: colors.gray[200] }}>
                  Remove from Waiting Tasks and move to My Tasks
                </Typography>
              }
              sx={{ m: 0, width: "100%", justifyContent: "space-between" }}
            />
          </Box>
        </Box>

        {/* Footer actions */}
        <Box
          display="flex"
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
          gap={1}
          flexDirection={{ xs: "column", sm: "row" }}
        >
          <Box
            display="flex"
            alignItems="center"
            gap={{ xs: 1, sm: 2 }}
            color={colors.gray[400]}
            flexWrap="wrap"
          >
            {task?.created_at && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <AccessTimeIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption">
                  Created: {new Date(task.created_at).toLocaleDateString()}
                </Typography>
              </Box>
            )}
            {task?.due_date && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <TaskAltIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption">
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </Typography>
              </Box>
            )}
          </Box>

          <Button
            size="small"
            variant="contained"
            onClick={() => onDetails?.(task.id)}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              bgcolor: colors.blueAccent[500],
              color: colors.primary[900],
              "&:hover": { bgcolor: colors.blueAccent[700] },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskCardWaitingView;
