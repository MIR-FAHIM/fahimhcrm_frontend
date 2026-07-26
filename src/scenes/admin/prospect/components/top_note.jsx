import { useEffect, useState } from "react";
import { Box, Button, IconButton, Paper, Stack, TextField, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { CancelRounded, EditRounded, NotesRounded, SaveRounded } from "@mui/icons-material";

const NoteComponent = ({ details = {}, onSaveNote }) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [noteValue, setNoteValue] = useState(details.note || "");

  useEffect(() => {
    setNoteValue(details.note || "");
    setIsEditing(false);
  }, [details.id, details.note]);

  const handleSave = () => {
    onSaveNote({ prospect_id: details.id, note: noteValue });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNoteValue(details.note || "");
    setIsEditing(false);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.warning.main, 0.08),
        border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
      }}
    >
      {!isEditing ? (
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <Box sx={{ color: theme.palette.warning.main, mt: 0.25 }}>
            <NotesRounded fontSize="small" />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 800 }}>
              Keep in mind
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.primary, whiteSpace: "pre-line", fontWeight: 700 }}>
              {details.note || "No note added for this prospect."}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setIsEditing(true)} aria-label="edit note">
            <EditRounded fontSize="small" />
          </IconButton>
        </Stack>
      ) : (
        <Stack spacing={1.25}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            size="small"
            value={noteValue}
            onChange={(event) => setNoteValue(event.target.value)}
            placeholder="Write a note the team should remember"
          />
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button size="small" variant="outlined" startIcon={<CancelRounded />} onClick={handleCancel} sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button size="small" variant="contained" startIcon={<SaveRounded />} onClick={handleSave} sx={{ borderRadius: 2, fontWeight: 900 }}>
              Save Note
            </Button>
          </Stack>
        </Stack>
      )}
    </Paper>
  );
};

export default NoteComponent;