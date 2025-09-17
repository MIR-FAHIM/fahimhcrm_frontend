import React, { useState } from "react";
import { Button, CircularProgress, Box } from "@mui/material";
import { AccessTimeOutlined } from "@mui/icons-material";

export default function AnimatedButton({ isCheckIn, finalFunction }) {
  const [animating, setAnimating] = useState(false);

  const handlePressStart = () => {
    if (!animating) {
      setAnimating(true);
      setTimeout(() => {
        finalFunction();
        setAnimating(false);
      }, 2000);
    }
  };

  const handlePressEnd = () => {
    if (animating) {
      setAnimating(false);
    }
  };

  const buttonColor = isCheckIn ? "#e53935" : "#43a047"; // red for out, green for in
  const hoverColor = isCheckIn ? "#c62828" : "#2e7d32";

  return (
    <Button
      variant="contained"
      startIcon={!animating && <AccessTimeOutlined />}
      disabled={animating}
      className={animating ? "pulse-animate" : ""}
      sx={{
        position: "relative",
        bgcolor: buttonColor,
        color: "#fff",
        fontWeight: 700,
        px: 3.5,
        py: 1.6,
        borderRadius: "12px",
        boxShadow: `0 6px 16px ${buttonColor}66`,
        overflow: "hidden",
        transition: "all 0.3s ease",
        textTransform: "none",
        "&:hover": {
          bgcolor: hoverColor,
          transform: "translateY(-2px) scale(1.05)",
          boxShadow: `0 8px 20px ${buttonColor}88`,
        },
        "&.pulse-animate::after": {
          content: '""',
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "100%",
          height: "100%",
          borderRadius: "12px",
          border: `2px solid ${buttonColor}`,
          transform: "translate(-50%, -50%) scale(1)",
          animation: "pulseBorder 1.2s infinite ease-out",
          pointerEvents: "none",
        },
      }}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
    >
      {animating ? (
        <Box display="flex" alignItems="center" gap={1}>
          <CircularProgress size={20} sx={{ color: "#fff" }} />
          <span>Processing...</span>
        </Box>
      ) : (
        isCheckIn ? "Check Out" : "Check In"
      )}
    </Button>
  );
}
