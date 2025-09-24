import React, { useState } from 'react';
import { Box, Typography, TextField, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

// Assume colors is defined elsewhere or imported
const colors = {
  gray: { 100: '#f5f5f5', 400: '#bdbdbd' }
};

const NoteComponent = ({ details, onSaveNote }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [noteValue, setNoteValue] = useState(details.note);

  const handleSave = () => {
    // Call the parent component's save function
    // This is where you would make an API call to save the data
    onSaveNote({prospect_id:details.id, note:noteValue});
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Revert the note back to its original state and exit edit mode
    setNoteValue(details.note);
    setIsEditing(false);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, my: 2 }}>
      {!isEditing ? (
        // Display mode
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Typography variant="body1" sx={{ color: colors.gray[900], fontWeight: 'bold', mr: 2 }}>
            Keep in mind: 
          </Typography>
          <Typography variant="body2" sx={{ color: colors.gray[900],  }}>
            {details.note}
          </Typography>
          <IconButton onClick={() => setIsEditing(true)} aria-label="edit note">
            <EditIcon fontSize="small"  sx={{ color: colors.gray[900] }} />
          </IconButton>
        </Box>
      ) : (
        // Edit mode
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: colors.gray[900],
                '& fieldset': {
                  borderColor: colors.gray[900],
                },
                '&:hover fieldset': {
                  borderColor: colors.gray[900],
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.gray[900],
                },
              },
            }}
          />
          <IconButton onClick={handleSave} aria-label="save note">
            <SaveIcon sx={{ color: 'green' }} />
          </IconButton>
          <IconButton onClick={handleCancel} aria-label="cancel edit">
            <CancelIcon sx={{ color: 'red' }} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default NoteComponent;