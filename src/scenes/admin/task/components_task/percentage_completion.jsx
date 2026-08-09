import {
  Box,
  Button,
  FormControlLabel,
  Slider,
  Stack,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { SaveRounded, VisibilityRounded } from "@mui/icons-material";

const TaskCompletionSlider = ({
  completionPercentage,
  showCompletionPercentage,
  handleCompletionChange,
  handleSaveCompletion,
  handleShowCompletionChange,
}) => {
  const theme = useTheme();
  const value = Number(completionPercentage || 0);

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: theme.palette.background.default,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="subtitle1" sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
            Task Progress
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            Save the current completion percentage and choose whether it appears to viewers.
          </Typography>
        </Box>
        <Typography
          variant="h4"
          sx={{
            color: theme.palette.success.main,
            fontWeight: 700,
            minWidth: 88,
            textAlign: { xs: "left", sm: "right" },
          }}
        >
          {value}%
        </Typography>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} sx={{ mt: 3 }}>
        <Slider
          value={value}
          onChange={handleCompletionChange}
          valueLabelDisplay="auto"
          min={0}
          max={100}
          marks={[0, 25, 50, 75, 100].map((mark) => ({ value: mark, label: `${mark}%` }))}
          sx={{
            flex: 1,
            color: theme.palette.success.main,
            "& .MuiSlider-thumb": {
              width: 22,
              height: 22,
              boxShadow: `0 0 0 6px ${alpha(theme.palette.success.main, 0.14)}`,
            },
            "& .MuiSlider-rail": { opacity: 0.32 },
          }}
        />
        <Button
          variant="contained"
          startIcon={<SaveRounded />}
          onClick={handleSaveCompletion}
          sx={{ borderRadius: 2, fontWeight: 700, whiteSpace: "nowrap" }}
        >
          Save Progress
        </Button>
      </Stack>

      <Box
        sx={{
          mt: 2,
          px: 1.5,
          py: 1,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.success.main, 0.07),
          border: `1px solid ${alpha(theme.palette.success.main, 0.18)}`,
        }}
      >
        <FormControlLabel
          control={<Switch checked={showCompletionPercentage} onChange={handleShowCompletionChange} color="success" />}
          label={
            <Stack direction="row" spacing={1} alignItems="center">
              <VisibilityRounded fontSize="small" color="success" />
              <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                Display completion progress
              </Typography>
            </Stack>
          }
        />
      </Box>
    </Box>
  );
};

export default TaskCompletionSlider;