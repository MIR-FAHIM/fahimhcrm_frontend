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
  const [editedDetails, setEditedDetails] = useState(task.task_details);

  // Styled components
  const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
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
    },
    '& .MuiInput-underline:before': {
      borderBottomColor: theme.palette.primary.light,
    },
    '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
      borderBottomColor: theme.palette.primary.main,
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: theme.palette.primary.main,
    }
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
    <Grid item xs={12} sm={6} md={4} lg={3}>
     
        {/* Title Section */}
        <Typography
                variant="h6"
                sx={{
                  flexGrow: 2,
                  fontWeight: 100,
                  color: 'text.primary'
                }}
              >
               ID: {task.id}
              </Typography>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          {isEditingTitle ? (
            <Box display="flex" alignItems="center" gap={1} width="100%">
              <StyledTextField
                fullWidth
                variant="standard"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                InputProps={{
                  style: {
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    padding: 0
                  }
                }}
              />
              <IconButton
                onClick={() => handleSave('task_title')}
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
          ) : (
            <Box display="flex" alignItems="center" gap={1} width="100%">
              <Typography
                variant="h6"
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

        <Divider sx={{ my: 1, borderColor: 'divider' }} />

        {/* Description Section */}
        <Box display="flex" flexDirection="column" gap={1}>
          {isEditingDetails ? (
            <Box display="flex" flexDirection="column" gap={1}>
              <StyledTextField
                fullWidth
                multiline
                minRows={3}
                variant="standard"
                value={editedDetails}
                onChange={(e) => setEditedDetails(e.target.value)}
                InputProps={{
                  style: {
                    fontSize: '0.9rem',
                    padding: 0
                  }
                }}
              />
              <Box display="flex" justifyContent="flex-end">
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
                  lineHeight: 1.5
                }}
              >
                {task.task_details}
              </Typography>
              <Box display="flex" justifyContent="flex-end">
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
     
    </Grid>
  );
};

export default TaskTitleInfo;
