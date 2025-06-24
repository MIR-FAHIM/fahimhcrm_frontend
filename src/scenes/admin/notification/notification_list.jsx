import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Container, Divider, Paper } from "@mui/material";
import { getNotificationUser } from "../../../api/controller/admin_controller/notification_controller";

const NotificationPage = () => {
  const userID = localStorage.getItem("userId");
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const response = await getNotificationUser(userID); // API call
      if (response.status === "success") {
        setNotifications(response.notifications); // Update state
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userID]); // Only run when userID changes

  const handleViewDetails = (notificationId) => {
    console.log(`Viewing details for notification with ID: ${notificationId}`);
    // Add navigation or modal logic here if needed
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Notifications
      </Typography>

      <Divider sx={{ mb: 3 }} />

      {notifications.length === 0 ? (
        <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1" color="textSecondary">
            No notifications available.
          </Typography>
        </Paper>
      ) : (
        notifications.map((notification) => (
          <Paper
            key={notification.id}
            elevation={notification.is_seen ? 0 : 3}
            sx={{
              mb: 2,
              p: 2,
              borderLeft: `6px solid ${notification.is_seen ? "#ccc" : "#28a745"}`,
              backgroundColor: notification.is_seen ? "#f9f9f9" : "#e6f4ea",
              transition: "all 0.3s ease-in-out",
            }}
          >
            <Typography variant="h6" gutterBottom>
              {notification.title}
            </Typography>
            <Typography variant="body2" gutterBottom>
              {notification.subtitle}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {new Date(notification.created_at).toLocaleString()}
            </Typography>

            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={() => handleViewDetails(notification.id)}
              >
                View Details
              </Button>
            </Box>
          </Paper>
        ))
      )}
    </Container>
  );
};

export default NotificationPage;
