import React from "react";
import {
  Grid,
  Box,
  MenuItem,
  Typography,
  Select,
} from "@mui/material";

const TaskPriorityUpdateComponent = ({ task, taskPriorityList, handleTaskPriorityUpdate }) => {
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
                                    Priority
                                  </Typography>
        <Select
          fullWidth
          size="small"
          value={task.priority.id}
          onChange={(e) => handleTaskPriorityUpdate(task.id, e.target.value)}
          sx={{
            bgcolor: "white",
            borderRadius: 1,
            fontSize: 14,
          }}
        >
          {taskPriorityList.map((status) => (
            <MenuItem key={status.id} value={status.id}>
              {status.priority_name}
            </MenuItem>
          ))}
        </Select>
      </Box>
    </Grid>
  );
};

export default TaskPriorityUpdateComponent;
