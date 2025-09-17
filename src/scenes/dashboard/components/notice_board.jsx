// src/scenes/dashboard/components/notice_board.jsx
import { Box, Typography, useTheme, Divider, Stack } from "@mui/material";
import { tokens } from "../../../theme";

const NoticeBoard = ({ notices = [] }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box
      gridColumn="span 5"
      sx={{
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${colors.gray[800]}`,
        p: 2.5,
        borderRadius: 3,
        boxShadow: 2,
        minHeight: 200,
      }}
    >
      <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
        Notice Board
      </Typography>
      <Divider sx={{ mb: 1.5, borderColor: colors.gray[800] }} />
      {notices.length ? (
        <Stack spacing={1.25}>
          {notices.map((n, i) => (
            <Typography key={i} variant="body2" sx={{ color: colors.gray[200] }}>
              {n.highlight ? "🚨" : "📝"} <b>{n.title}</b> — {n.notice}
            </Typography>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" sx={{ color: colors.gray[400] }}>
          No notices available.
        </Typography>
      )}
    </Box>
  );
};

export default NoticeBoard;
