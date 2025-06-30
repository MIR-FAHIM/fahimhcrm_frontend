import React from 'react';
import {
  Box,
  Typography,
  Slider,
  Button,
  FormControlLabel,
  Checkbox,
  Paper,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { tokens } from '../../../../theme'; // Assuming you have this for consistent theming

// Styled Paper for the component's container
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[5], // A bit more pronounced shadow
  backgroundColor: theme.palette.mode === 'dark' ? '#2c3e50' : '#ffffff', // Darker background for dark mode, subtle white for light
  transition: 'all 0.3s ease-in-out',
  border: `1px solid ${theme.palette.divider}`, // Subtle border
}));

// Styled Slider for custom thumb and track appearance
const StyledSlider = styled(Slider)(({ theme }) => ({
  height: 8, // Thicker slider track
  '& .MuiSlider-track': {
    border: 'none',
    backgroundColor: theme.palette.success.main, // Green for completion
  },
  '& .MuiSlider-thumb': {
    height: 24,
    width: 24,
    backgroundColor: theme.palette.success.light, // Brighter green thumb
    border: '2px solid currentColor',
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: `inherit`, // Removes default shadow, will add custom one below
    },
    '&:before': {
      display: 'none', // Remove the default before pseudo-element
    },
    boxShadow: `0px 2px 8px rgba(0,0,0,0.2)`, // Custom subtle shadow for thumb
  },
  '& .MuiSlider-rail': {
    opacity: 0.5,
    backgroundColor: theme.palette.grey[400], // Lighter grey for remaining part
  },
  '& .MuiSlider-valueLabel': {
    backgroundColor: theme.palette.primary.main, // Match primary color for label background
    color: theme.palette.primary.contrastText,
  },
}));

const TaskCompletionSlider = ({
  completionPercentage,
  showCompletionPercentage,
  handleCompletionChange,
  handleSaveCompletion,
  handleShowCompletionChange,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <StyledPaper>
      <Typography variant="h5" gutterBottom sx={{ color: colors.gray[100], fontWeight: 600 }}>
        Task Progress
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: 3, gap: 2 }}>
        <StyledSlider
          value={completionPercentage}
          onChange={handleCompletionChange}
          aria-labelledby="completion-percentage-slider"
          valueLabelDisplay="on" // Always display the value label
          min={0}
          max={100}
          sx={{ flexGrow: 1 }} // Allows the slider to take available space
        />
        <Button
          variant="contained"
          onClick={handleSaveCompletion}
          sx={{
            minWidth: '80px', // Ensure consistent button width
            bgcolor: colors.greenAccent[600],
            '&:hover': {
              bgcolor: colors.greenAccent[700],
            },
            color: 'white', // Ensure text color is readable
            boxShadow: `0px 2px 8px ${colors.greenAccent[900]}`, // Subtle shadow for button
          }}
        >
          Save
        </Button>
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            checked={showCompletionPercentage}
            onChange={handleShowCompletionChange}
            sx={{
              color: colors.greenAccent[300], // Checkbox color
              '&.Mui-checked': {
                color: colors.greenAccent[500],
              },
            }}
          />
        }
        label={
          <Typography variant="body1" sx={{ color: colors.gray[200] }}>
            Display Completion Progress
          </Typography>
        }
        sx={{ mt: 1 }} // Margin top for spacing
      />
    </StyledPaper>
  );
};

export default TaskCompletionSlider;