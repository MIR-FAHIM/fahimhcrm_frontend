import React from "react";
import { Box, Typography } from "@mui/material";

const NoticeBoard = ({ notices = [] }) => {
  return (
    <Box
      gridColumn="span 5"
      sx={{
        background: "#fff8e1",
        p: 3,
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        minHeight: "200px",
      }}
    >
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Notice Board
      </Typography>

      {notices.length > 0 ? (
        notices.map((notice, index) => (
          <Typography
            key={index}
            variant="body2"
            color="text.secondary"
            mt={index > 0 ? 1 : 0}
          >
            {notice.highlight ? "🚨 " : "📝 "}
            {notice.title}: {notice.notice}
          </Typography>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">
          No notices available.
        </Typography>
      )}
    </Box>
  );
};

export default NoticeBoard;
