import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
  Checkbox,
  Box,
  IconButton,
  useTheme
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import { tokens } from '../../../../theme';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';


// Styled Paper for the component's main container
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2), // Reduced from 3 to 2
  borderRadius: theme.shape.borderRadius * 1.5, // Slightly less rounded
  boxShadow: theme.shadows[3], // Slightly less pronounced shadow
  backgroundColor: theme.palette.mode === 'dark' ? '#2c3e50' : '#ffffff',
  transition: 'all 0.3s ease-in-out',
  border: `1px solid ${theme.palette.divider}`,
}));

// Styled ListItem for individual follow-up items
const StyledListItem = styled(ListItem)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey : theme.palette.grey,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1), // Reduced from 1.5 to 1
  padding: theme.spacing(1, 1.5), // Reduced from 1.5, 2 to 1, 1.5
  boxShadow: theme.shadows[0], // Removed individual item shadow for flatter look
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey : theme.palette.grey,
  },
  // Style for completed items
  '&.completed': {
    opacity: 0.7,
    textDecoration: 'line-through',
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey : theme.palette.grey,
    '& .MuiListItemText-primary, & .MuiListItemText-secondary': {
      color: theme.palette.text.disabled,
    },
  },
}));


const TaskFollowUpNotes = ({
  followUps = [],
  taskID,
  onToggleComplete,
  onEditFollowUp,
  onDeleteFollowUp,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <StyledPaper>
      <Typography variant="h6" gutterBottom sx={{ color: colors.gray[100], fontWeight: 600 }}> {/* Changed to h6 */}
        Follow-up Notes
      </Typography>
      <Divider sx={{ marginY: 1.5, borderColor: colors.grey }} /> {/* Reduced marginY */}

      {followUps.length === 0 ? (
        <Typography variant="body2" color={colors.gray[300]} sx={{ fontStyle: 'italic' }}>
          No follow-up notes added yet for this task.
        </Typography>
      ) : (
        <Grid container spacing={1.5}> {/* Reduced Grid spacing */}
          {followUps.map((followUp) => (
            <Grid item xs={12} sm={6} key={followUp.id}>
              <StyledListItem
                className={followUp.status === '0' ? 'completed' : ''}
                secondaryAction={
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      pr: 0.5, // Reduced from 1 to 0.5
                      gap: 0.5 // Added gap between vertical items
                    }}
                  >
                    <Checkbox
                      edge="end"
                      checked={followUp.status === '0'}
                      onChange={() => onToggleComplete(followUp.id, followUp.status === '1' ? '0' : '1')}
                      sx={{
                        color: colors.greenAccent[300],
                        '&.Mui-checked': {
                          color: colors.greenAccent[500],
                        },
                        p: 0, // Removed padding completely for minimal space
                      }}
                    />
                     {onEditFollowUp && (
                        <IconButton
                            edge="end"
                            aria-label="edit"
                            onClick={() => onEditFollowUp(followUp)}
                            sx={{ color: colors.blueAccent[300], p: 0 }} // Removed padding
                        >
                            <EditIcon sx={{ fontSize: '1.1rem' }} /> {/* Slightly smaller icon */}
                        </IconButton>
                    )}
                    {onDeleteFollowUp && (
                        <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => onDeleteFollowUp(followUp.id)}
                            sx={{ color: colors.redAccent[400], p: 0 }} // Removed padding
                        >
                            <DeleteIcon sx={{ fontSize: '1.1rem' }} /> {/* Slightly smaller icon */}
                        </IconButton>
                    )}
                  </Box>
                }
              >
                <Avatar sx={{ marginRight: 1.5,  width: 36, height: 36 }} /* Smaller Avatar */
                        alt={followUp.created_by_name || "User"}
                        src={followUp.created_by_avatar_url || ''}
                >
                    {!followUp.created_by_avatar_url && <PersonOutlineIcon sx={{ fontSize: '1.2rem' }} />} {/* Smaller fallback icon */}
                </Avatar>

                <ListItemText
                  primary={
                    <Typography variant="body3" fontWeight="bold" sx={{ color: colors.gray[100] }}> {/* Changed to body2 */}
                      {followUp.followup_title}
                    </Typography>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography variant="body2" color={colors.gray[300]} sx={{ whiteSpace: 'pre-line', lineHeight: 1.3 }}> {/* Changed to caption, reduced lineHeight */}
                        {followUp.followup_details}
                      </Typography>
                      <Box sx={{ mt: 0.2, display: 'flex', alignItems: 'center', gap: 0.5 }}> {/* Reduced mt and gap */}
                        <Chip
                          label={followUp.status === '1' ? 'Active' : 'Completed'}
                          color={followUp.status === '1' ? 'success' : 'default'}
                          size="small"
                          sx={{
                            fontWeight: 'bold',
                            fontSize: '0.65rem', // Slightly smaller font for chip
                            height: '20px', // Smaller chip height
                            backgroundColor: followUp.status === '1' ? colors.gray[700] : colors.gray[600],
                            color: 'white',
                          }}
                        />
                        <Typography variant="caption" color={colors.gray[400]} sx={{ fontSize: '0.7rem' }}> {/* Adjusted font size */}
                          by {followUp.created_by_name || 'N/A'} on {new Date(followUp.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </React.Fragment>
                  }
                />
              </StyledListItem>
            </Grid>
          ))}
        </Grid>
      )}
    </StyledPaper>
  );
};

export default TaskFollowUpNotes;