import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  CampaignOutlined,
  NotificationsActiveOutlined,
} from "@mui/icons-material";
import { format } from "date-fns";

const formatNoticeDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return format(parsed, "MMM dd");
};

const NoticeBoard = ({ notices = [] }) => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const warning = theme.palette.warning.main;

  return (
    <Card
      variant="outlined"
      sx={{
        bgcolor: theme.palette.background.paper,
        borderColor: theme.palette.divider,
        borderRadius: 2,
        boxShadow: "none",
        minHeight: "100%",
      }}
    >
      <CardContent sx={{ p: 2.25 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                display: "grid",
                placeItems: "center",
                color: primary,
                bgcolor: alpha(primary, theme.palette.mode === "dark" ? 0.16 : 0.1),
              }}
            >
              <CampaignOutlined fontSize="small" />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Notices
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {notices.length} active update{notices.length === 1 ? "" : "s"}
              </Typography>
            </Box>
          </Stack>

          {notices.some((notice) => notice.highlight) && (
            <Chip
              size="small"
              label="Priority"
              icon={<NotificationsActiveOutlined />}
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                bgcolor: alpha(warning, 0.14),
              }}
            />
          )}
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        {notices.length ? (
          <Stack spacing={1.25}>
            {notices.slice(0, 6).map((notice, index) => {
              const dateLabel = formatNoticeDate(
                notice.created_at || notice.updated_at || notice.date
              );
              const tone = notice.highlight ? warning : primary;

              return (
                <Box
                  key={notice.id || index}
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    border: `1px solid ${alpha(tone, 0.24)}`,
                    bgcolor: alpha(tone, theme.palette.mode === "dark" ? 0.1 : 0.06),
                  }}
                >
                  <Stack direction="row" alignItems="flex-start" spacing={1.25}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: tone,
                        mt: 0.8,
                        flexShrink: 0,
                      }}
                    />
                    <Box minWidth={0} flex={1}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        gap={1}
                      >
                        <Typography variant="body2" fontWeight={700} noWrap>
                          {notice.title || "Notice"}
                        </Typography>
                        {dateLabel && (
                          <Typography variant="caption" color="text.secondary" flexShrink={0}>
                            {dateLabel}
                          </Typography>
                        )}
                      </Stack>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {notice.notice || notice.description || "No notice details available."}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <Box
            sx={{
              py: 4,
              textAlign: "center",
              color: theme.palette.text.secondary,
            }}
          >
            <NotificationsActiveOutlined sx={{ mb: 1, opacity: 0.5 }} />
            <Typography variant="body2" fontWeight={600}>
              No notices available
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default NoticeBoard;
