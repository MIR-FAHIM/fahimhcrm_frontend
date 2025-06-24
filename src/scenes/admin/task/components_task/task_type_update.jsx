import React from "react";
import {
  Grid,
  Box,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

const TaskTypeUpdateComponent = ({ task, taskTypeList, handleTaskTypeUpdate }) => {
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
                                            Task Type
                                          </Typography>
        <Select
          fullWidth
          size="small"
          value={task.task_type.id}
          onChange={(e) => handleTaskTypeUpdate(task.id, e.target.value)}
          sx={{
            bgcolor: "white",
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
