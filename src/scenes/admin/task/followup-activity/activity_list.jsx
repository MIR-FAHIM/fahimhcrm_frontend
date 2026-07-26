import { Avatar, Box, Chip, Stack, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { CheckCircleRounded, HistoryRounded } from "@mui/icons-material";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const getInitial = (name = "") => name.trim().charAt(0).toUpperCase() || "U";

const ActivityList = ({ followUps = [] }) => {
  const theme = useTheme();

  if (!followUps.length) {
    return (
      <Box
        sx={{
          p: 4,
          borderRadius: 2,
          textAlign: "center",
          bgcolor: theme.palette.background.default,
          border: `1px dashed ${theme.palette.divider}`,
        }}
      >
        <HistoryRounded color="disabled" />
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
          No activity has been recorded for this task yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={0}>
      {followUps.map((followUp, index) => {
        const active = followUp.status === "1";
        const creatorName = followUp.creator?.name || followUp.created_by_name || "Unknown user";
        const tone = active ? theme.palette.success.main : theme.palette.text.secondary;

        return (
          <Box key={followUp.id || index} sx={{ display: "grid", gridTemplateColumns: "40px minmax(0, 1fr)", gap: 1.5 }}>
            <Stack alignItems="center" sx={{ pt: 0.5 }}>
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: alpha(tone, 0.14),
                  color: tone,
                  fontWeight: 900,
                  fontSize: 14,
                }}
              >
                {active ? <CheckCircleRounded fontSize="small" /> : getInitial(creatorName)}
              </Avatar>
              {index < followUps.length - 1 && (
                <Box sx={{ width: 2, flex: 1, minHeight: 28, bgcolor: theme.palette.divider, mt: 1 }} />
              )}
            </Stack>

            <Box
              sx={{
                pb: index < followUps.length - 1 ? 2 : 0,
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: theme.palette.background.default,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
                  <Typography variant="subtitle2" sx={{ color: theme.palette.text.primary, fontWeight: 900 }}>
                    {followUp.activity_title || "Task activity"}
                  </Typography>
                  <Chip
                    size="small"
                    label={active ? "Active" : "Completed"}
                    color={active ? "success" : "default"}
                    variant={active ? "filled" : "outlined"}
                    sx={{ fontWeight: 800 }}
                  />
                </Stack>

                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.75, whiteSpace: "pre-line" }}>
                  {followUp.activity_details || "No activity details provided."}
                </Typography>

                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: "block", mt: 1.25 }}>
                  {creatorName} on {formatDateTime(followUp.created_at)}
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
};

export default ActivityList;