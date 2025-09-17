import React, { useState } from "react";
import {
  Grid,
  Typography,
  Box,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  useTheme, // Import the useTheme hook
  TextField // Import TextField for the DatePicker
} from "@mui/material";
import {
  updateTask
} from '../../../../api/controller/admin_controller/task_controller/task_controller';
import EditIcon from '@mui/icons-material/Edit';
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";

// Extend dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(duration);

const TaskDueDate = ({ task, onEditDueDate }) => {
  const theme = useTheme(); // Get the current theme object
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs(task.due_date));

  const calculateTimeRemaining = (dueDate) => {
    const now = dayjs();
    const due = dayjs(dueDate);
    const diffInHours = due.diff(now, "hour");
    const diffInDays = due.diff(now, "day");

    if (diffInHours < 0) {
      return "Overdue";
    }

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} remaining`;
    } else {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} remaining`;
    }
  };

  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleSaveDate = async () => {
    try {
      await onEditDueDate(selectedDate); // Call the onEditDueDate function with the selected date
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving due date:", error);
    }
  };

  return (
    <Grid item xs={6} sm={3}>
      <Box
        sx={{
          p: 2,
          // Use theme's background paper color, which adapts to dark mode
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="subtitle2" color="text.primary">
            Due Date
          </Typography>
          <Typography color="text.primary">
            {task.due_date ? dayjs(task.due_date).format("MMM D, YYYY") : "Not Set"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {task.due_date ? calculateTimeRemaining(task.due_date) : "Not Set"}
          </Typography>
        </Box>
        <IconButton onClick={handleOpenDialog} color="primary">
          <EditIcon fontSize="small"/>
        </IconButton>
      </Box>

      <Dialog
        open={open}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        }}
      >
        <DialogTitle>Edit Due Date</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Due Date"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              renderInput={(params) => <TextField {...params} />}
              sx={{mt:2}}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveDate} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default TaskDueDate;