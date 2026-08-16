import React from "react";
import {
  Grid,
  Box,
  CircularProgress,
  MenuItem,
  Select,
  Typography,
  useTheme, // Import the useTheme hook
} from "@mui/material";

const TaskStatusChangeComponent = ({ task, statuses, loading = false, handleStatusChange }) => {
  const theme = useTheme(); // Get the current theme object
  const currentStatusId = task?.status?.id || task?.status_id || "";

  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Box
        sx={{
          p: 2,
          // Use theme's background paper color, which adapts to dark mode
          backgroundColor: theme.palette.background.paper, 
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
         <Typography variant="h6" fontWeight={600} color="text.primary">
            Status
         </Typography>
        <Select
          fullWidth
          size="small"
          value={currentStatusId}
          disabled={loading || !statuses.length}
          onChange={(e) => handleStatusChange(task.id, e.target.value)}
          sx={{
            // Use the theme's background color, which adjusts automatically
            bgcolor: theme.palette.background.default, 
            borderRadius: 1,
            fontSize: 14,
          }}
        >
          {loading && (
            <MenuItem value={currentStatusId}>
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={16} />
                Loading statuses...
              </Box>
            </MenuItem>
          )}
          {!loading && !statuses.length && (
            <MenuItem value={currentStatusId}>No statuses found</MenuItem>
          )}
          {statuses.map((status) => (
            <MenuItem key={status.id} value={status.id}>
              {status.status_name}
            </MenuItem>
          ))}
        </Select>
      </Box>
    </Grid>
  );
};

export default TaskStatusChangeComponent;
