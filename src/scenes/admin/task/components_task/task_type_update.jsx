import React from "react";
import {
  Grid,
  Box,
  MenuItem,
  Select,
  Typography,
  useTheme, // Import the useTheme hook
} from "@mui/material";

const TaskTypeUpdateComponent = ({ task, taskTypeList, handleTaskTypeUpdate }) => {
  const theme = useTheme(); // Get the current theme object

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
         <Typography variant="h6" fontWeight="bold" color="text.primary">
            Task Type
         </Typography>
        <Select
          fullWidth
          size="small"
          value={task.task_type.id}
          onChange={(e) => handleTaskTypeUpdate(task.id, e.target.value)}
          sx={{
            // Use the theme's default background color, which adjusts automatically
            bgcolor: theme.palette.background.default, 
            borderRadius: 1,
            fontSize: 14,
          }}
        >
          {taskTypeList.map((status) => (
            <MenuItem key={status.id} value={status.id}>
              {status.type_name}
            </MenuItem>
          ))}
        </Select>
      </Box>
    </Grid>
  );
};

export default TaskTypeUpdateComponent;