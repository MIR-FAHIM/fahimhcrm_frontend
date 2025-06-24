import React from "react";
import {
  Grid,
  Box,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

const TaskStatusChangeComponent = ({ task, statuses, handleStatusChange }) => {
  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Box
        sx={{
          p: 2,
          backgroundColor: "#f8fafc",
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
         <Typography variant="h6" fontWeight="bold">
                                            Status
                                          </Typography>
        <Select
          fullWidth
          size="small"
          value={task.status.id}
          onChange={(e) => handleStatusChange(task.id, e.target.value)}
          sx={{
            bgcolor: "white",
            borderRadius: 1,
            fontSize: 14,
          }}
        >
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
