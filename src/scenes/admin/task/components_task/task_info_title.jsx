import React, { useState } from "react";
import {
  Grid,
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Divider
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { styled } from '@mui/material/styles';

const TaskTitleInfo = ({ task, handleTaskInfoUpdate }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.task_title);
  const [editedDetails, setEditedDetails, ] = useState(task.task_details);

  // Styled components
  const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3), // Increased padding for more breathing room
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: theme.shadows[3],
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: theme.shadows[6],
    }
  }));

  const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiInputBase-root': {
      backgroundColor: theme.palette.background.default,
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(0.5, 1), // Slightly more padding for input field
    },
    '& .MuiInput-underline:before': {
      borderBottomColor: theme.palette.divider, // Use divider color for subtle line
    },
    '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
      borderBottomColor: theme.palette.primary.main,
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: theme.palette.primary.main,
    },
    // Adjust font size for better readability in edit mode
    '& .MuiInputBase-input': {
      fontSize: '1rem', // Default font size
      fontWeight: 'inherit',
      color: 'inherit',
    },
    '&.title-field .MuiInputBase-input': {
      fontSize: '1.5rem', // Larger font for title
      fontWeight: 600,
    },
    '&.details-field .MuiInputBase-input': {
      fontSize: '1rem', // Slightly larger for details
      lineHeight: 1.6,
      fontWeight: 600,
      color: 'black', // Set text color to black
    }
  }));

  const IdCircle = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40, // Diameter of the circle
    height: 40, // Diameter of the circle
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main, // Or a contrasting color
    color: theme.palette.primary.contrastText,
    fontWeight: 'bold',
    fontSize: '0.85rem',
    flexShrink: 0, // Prevent it from shrinking
  }));

  const handleSave = (field) => {
    if (field === 'task_title') {
      handleTaskInfoUpdate(field, editedTitle);
      setIsEditingTitle(false);
    } else if (field === 'task_details') {
      handleTaskInfoUpdate(field, editedDetails);
      setIsEditingDetails(false);
    }
  };

  return (
    <Grid item xs={12}>
      <StyledPaper>
        {/* ID and Title Section */}
        <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
          <IdCircle>
            {task.id}
          </IdCircle>
          <Box flexGrow={1}>
            {isEditingTitle ? (
              <Box display="flex" alignItems="center" gap={1} width="100%">
                <StyledTextField
                  fullWidth
                  variant="standard"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="title-field"
                  InputProps={{ disableUnderline: false }}
                />
                <IconButton
                  onClick={() => handleSave('task_title')}
                  size="small"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark'
                    },
                    ml: 1
                  }}
                >
                  <SaveIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <Box display="flex" alignItems="center" gap={1} width="100%">
                <Typography
                  variant="h5"
                  sx={{
                    flexGrow: 1,
                    fontWeight: 600,
                    color: 'text.primary'
                  }}
                >
                  {task.task_title}
                </Typography>
                <IconButton
                  onClick={() => setIsEditingTitle(true)}
                  size="small"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'primary.main'
                    }
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2, borderColor: 'divider' }} />

        {/* Description Section */}
        <Box display="flex" flexDirection="column" gap={1}>
          <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
            Details:
          </Typography>
          {isEditingDetails ? (
            <Box display="flex" flexDirection="column" gap={1}>
              <StyledTextField
                fullWidth
                multiline
                minRows={3}
                variant="standard"
                value={editedDetails}
                onChange={(e) => setEditedDetails(e.target.value)}
                className="details-field"
                InputProps={{ disableUnderline: false }}
              />
              <Box display="flex" justifyContent="flex-end" mt={1}>
                <IconButton
                  onClick={() => handleSave('task_details')}
                  size="small"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark'
                    }
                  }}
                >
                  <SaveIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  whiteSpace: 'pre-line',
                  lineHeight: 1.6
                }}
              >
                {task.task_details || "No details provided."}
              </Typography>
              <Box display="flex" justifyContent="flex-end" mt={1}>
                <IconButton
                  onClick={() => setIsEditingDetails(true)}
                  size="small"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'primary.main'
                    }
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          )}
        </Box>
      </StyledPaper>
    </Grid>
  );
};

export default TaskTitleInfo;