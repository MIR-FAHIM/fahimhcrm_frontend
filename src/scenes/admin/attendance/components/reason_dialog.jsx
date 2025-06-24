import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  useTheme
} from "@mui/material";
import { InfoOutlined, Close } from "@mui/icons-material";

const EnhancedLateReasonDialog = ({
  lateDialogOpen,
  handleLateReasonClose,
  selectedLateReason,
  attendance
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={lateDialogOpen}
      onClose={handleLateReasonClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: theme.shadows[8],
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.common.white,
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          padding: '16px 24px'
        }}
      >
        <InfoOutlined fontSize="small" sx={{ mr: 1 }} />
        Late Reason Details
      </DialogTitle>

      <Divider />

      <DialogContent
        sx={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <Box display="flex" flexDirection="column" gap={1}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 'medium',
              color: theme.palette.text.primary
            }}
          >
            {selectedLateReason || "No specific reason was provided for being late."}
          </Typography>

          {attendance?.late_reason_image && (
            <Box mt={2}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Supporting Document:
              </Typography>
              <Box
                component="img"
                src={`${base_url}/storage/${attendance.late_reason_image}`}
                alt="Late reason evidence"
                sx={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.divider}`
                }}
              />
            </Box>
          )}
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions
        sx={{
          padding: '16px',
          justifyContent: 'flex-end'
        }}
      >
        <Button
          onClick={handleLateReasonClose}
          variant="contained"
          color="primary"
          sx={{
            borderRadius: '8px',
            padding: '8px 16px',
            textTransform: 'none'
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnhancedLateReasonDialog;
