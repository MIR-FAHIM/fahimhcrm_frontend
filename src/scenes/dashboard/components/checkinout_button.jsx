import React, { useState } from "react";
import { Button } from "@mui/material";
import { AccessTimeOutlined } from "@mui/icons-material";

export default function AnimatedButton({ isCheckIn, finalFunction }) {
  const [animating, setAnimating] = useState(false);

  const handlePressStart = () => {
    if (!animating) {
      setAnimating(true);
      setTimeout(() => {
        finalFunction(); // Call your final function after animation
        setAnimating(false);
      }, 2000); // Duration must match CSS animation
    }
  };

  const handlePressEnd = () => {
    if (animating) {
      setAnimating(false); // Optional: cancel logic if mouse leaves
    }
  };

  return (
    <Button
      variant="contained"
      className={animating ? "border-animate" : ""}
      sx={{
        position: "relative",
        bgcolor: "#1976d2",
        color: "#fff",
        fontWeight: 600,
        px: 3,
        py: 1.5,
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
        overflow: "hidden",
        transition: "all 0.3s ease",
        "&:hover": {
          bgcolor: "#1565c0",
          transform: "scale(1.03)",
        },
        "&.border-animate::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          borderRadius: "10px",
          border: "2px solid red",
          boxSizing: "border-box",
          animation: "drawBorder 2s linear forwards",
          pointerEvents: "none",
        },
      }}
      startIcon={<AccessTimeOutlined />}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
    >
      {isCheckIn ? "Check Out" : "Check In"}
    </Button>
  );
}
