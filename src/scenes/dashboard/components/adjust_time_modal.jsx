// src/scenes/dashboard/components/adjust_time_modal.jsx
import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, useTheme
} from "@mui/material";
import { tokens } from "../../../theme";

const AdjustTimeModal = ({ userId, onSubmit, onClose, attendanceID, type, open = true }) => {
  const [requestedTime, setRequestedTime] = useState("");
  const [note, setNote] = useState("");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleSubmit = () => {
    if (!requestedTime || !note.trim()) return alert("Please fill in all fields");
    onSubmit({ requested_time: requestedTime, note, user_id: userId, attendance_id: attendanceID, type });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Request time adjustment</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            label="Requested time"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={requestedTime}
            onChange={(e) => setRequestedTime(e.target.value)}
            fullWidth
          />
          <TextField
            label="Note"
            placeholder="Add context for the adjustment"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="text" onClick={onClose} sx={{ color: colors.gray[300] }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdjustTimeModal;
