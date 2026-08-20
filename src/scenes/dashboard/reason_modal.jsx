import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

const ReasonModal = ({ title, onSubmit, onClose }) => {
  const theme = useTheme();
  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;
  const brandDark = theme.palette.blueAccent?.dark ?? theme.palette.primary.dark;
  const brandContrast = theme.palette.blueAccent?.contrastText ?? theme.palette.primary.contrastText;

  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const helperText = useMemo(() => {
    const lowerTitle = String(title || "").toLowerCase();
    if (lowerTitle.includes("early")) return "Explain why you need to check out before your office end time.";
    if (lowerTitle.includes("late")) return "Explain why your check-in was late today.";
    return "Write a short reason for this attendance action.";
  }, [title]);

  const handleSubmit = async () => {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setError("Please enter a reason before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await onSubmit(trimmedReason);
      onClose();
    } catch (err) {
      console.error("Reason submit failed:", err);
      setError("Could not submit the reason. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.palette.mode === "dark" ? "0 28px 80px rgba(0,0,0,0.55)" : "0 28px 80px rgba(15,23,42,0.18)",
        },
      }}
      BackdropProps={{
        sx: {
          bgcolor: theme.palette.mode === "dark" ? "rgba(0,0,0,0.72)" : "rgba(15,23,42,0.38)",
          backdropFilter: "blur(3px)",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1.25 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              bgcolor: alpha(brand, 0.12),
              color: brand,
              flexShrink: 0,
            }}
          >
            <AccessTimeRoundedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 800, lineHeight: 1.15 }}>
              {title || "Attendance Reason"}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.25 }}>
              {helperText}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: theme.palette.divider }}>
        <Stack spacing={1.5}>
          {error && (
            <Alert severity="warning" sx={{ py: 0.75 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={4}
            maxRows={7}
            label="Reason"
            placeholder="Write the attendance reason here..."
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              if (error) setError("");
            }}
            disabled={submitting}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: theme.palette.background.default,
              },
            }}
          />
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            Keep it clear and short so admins can review it later.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={submitting} sx={{ textTransform: "none", fontWeight: 700 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SendRoundedIcon />}
          sx={{
            textTransform: "none",
            fontWeight: 800,
            bgcolor: brand,
            color: brandContrast,
            "&:hover": { bgcolor: brandDark },
          }}
        >
          Submit Reason
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReasonModal;
