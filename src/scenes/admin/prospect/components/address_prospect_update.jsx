import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Divider,
  Chip,
  IconButton,
  TextField,
  Button
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const AddressProspect = ({ details, onAddressUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAddress, setEditedAddress] = useState(details.address);

  const handleEditClick = () => {
    setEditedAddress(details.address);
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    onAddressUpdate({prospect_id:details.id, address:editedAddress});
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setEditedAddress(details.address);
    setIsEditing(false);
  };

  const handleAddressChange = (e) => {
    setEditedAddress(e.target.value);
  };

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
        Address Information
      </Typography>

      <Paper sx={{
        p: 2,
        mt: 1,
        borderRadius: 1,
        backgroundColor: 'background.paper'
      }}>
        {isEditing ? (
          <Box display="flex" alignItems="center" gap={1}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              value={editedAddress}
              onChange={handleAddressChange}
              multiline
              rows={3}
            />
            <Box display="flex" gap={1}>
              <IconButton
                onClick={handleSaveClick}
                color="primary"
                size="small"
              >
                <SaveIcon />
              </IconButton>
              <IconButton
                onClick={handleCancelClick}
                color="error"
                size="small"
              >
                <CancelIcon />
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              {details.address || 'No address available'}
            </Typography>
            <IconButton
              onClick={handleEditClick}
              size="small"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AddressProspect;
