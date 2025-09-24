import React, { useState, useEffect } from 'react';
import {
  Box,
  Switch,
  FormControlLabel,
  Typography,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';
import OpportunityIcon from '@mui/icons-material/Star';
import opportunity from "../../../../assets/images/opportunity.png";

const OpportunityComponent = ({ details, onToggleOpportunity, onSubmitOpportunity }) => {
  const theme = useTheme();
  const [isOpportunity, setIsOpportunity] = useState(details.is_opportunity === 1);
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState({
    details: '',
    prospect_id: details.id,
    created_by: '',
    closing_date: '',
    expected_amount: '',
    priority_id: '',
    stage_id: '',
    approved_by: '',
    status: '',
    note: ''
  });

  useEffect(() => {
    setIsOpportunity(details.is_opportunity === 1);
  }, [details.is_opportunity]);

  const handleToggle = () => {
    const newStatus = !isOpportunity;
    if (newStatus) {
      setOpenForm(true); // only open dialog
    } else {
      setIsOpportunity(false);
      if (onToggleOpportunity) {
        onToggleOpportunity({
          prospect_id: details.id,
          is_opportunity: 0
        });
      }
    }
  };

  const handleSubmit = async () => {
    const updatedFormData = {
      ...formData,
      prospect_id: details.id,
    };
    if (onSubmitOpportunity) {
      await onSubmitOpportunity(updatedFormData);
      setIsOpportunity(true);
      if (onToggleOpportunity) {
        onToggleOpportunity({
          prospect_id: details.id,
          is_opportunity: 1
        });
      }
    }
    handleCloseForm();
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
      {/* Left Side: Type and Toggle */}
      <Box display="flex" alignItems="center" gap={2}>
        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            backgroundColor: details.is_individual === true
              ? theme.palette.info.light
              : theme.palette.primary.light,
            color: details.is_individual === 1
              ? theme.palette.info.contrastText
              : theme.palette.primary.contrastText,
            fontSize: '0.75rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {details.is_individual === true ? 'Individual' : 'Organization'}
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={isOpportunity}
              onChange={handleToggle}
              color="primary"
              size="small"
              sx={{
                '& .MuiSwitch-thumb': {
                  backgroundColor: isOpportunity
                    ? theme.palette.success.main
                    : theme.palette.grey[400],
                },
                '& .MuiSwitch-track': {
                  backgroundColor: isOpportunity
                    ? theme.palette.success.light
                    : theme.palette.grey[300],
                },
              }}
            />
          }
          label={
            <Box display="flex" alignItems="center" gap={0.5}>
              <OpportunityIcon
                fontSize="small"
                sx={{
                  color: isOpportunity
                    ? theme.palette.success.main
                    : theme.palette.grey[500]
                }}
              />
              <Typography variant="caption" fontWeight="bold">
                {isOpportunity ? 'Opportunity' : 'Mark as Opportunity'}
              </Typography>
            </Box>
          }
          labelPlacement="end"
          sx={{
            margin: 0,
            '& .MuiFormControlLabel-label': {
              color: isOpportunity
                ? theme.palette.success.main
                : theme.palette.text.secondary
            }
          }}
        />
      </Box>

      {/* Right Side: Big Icon if isOpportunity */}
      {isOpportunity && (
        <img
          src={opportunity}
          alt="Opportunity"
          style={{ height: 24 }}
        />
      )}

      {/* Opportunity Form Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm}>
        <DialogTitle>Add Opportunity Details</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="details"
            label="Details"
            type="text"
            fullWidth
            value={formData.details}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="created_by"
            label="Created By"
            type="text"
            fullWidth
            value={formData.created_by}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="closing_date"
            label="Closing Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.closing_date}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="expected_amount"
            label="Expected Amount"
            type="number"
            fullWidth
            value={formData.expected_amount}
            onChange={handleChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Priority</InputLabel>
            <Select
              name="priority_id"
              value={formData.priority_id}
              label="Priority"
              onChange={handleChange}
            >
              <MenuItem value={1}>High</MenuItem>
              <MenuItem value={2}>Medium</MenuItem>
              <MenuItem value={3}>Low</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Stage</InputLabel>
            <Select
              name="stage_id"
              value={formData.stage_id}
              label="Stage"
              onChange={handleChange}
            >
              <MenuItem value={1}>Initial Findings</MenuItem>
              <MenuItem value={2}>Proposal</MenuItem>
              <MenuItem value={3}>Negotiation</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="approved_by"
            label="Approved By"
            type="text"
            fullWidth
            value={formData.approved_by}
            onChange={handleChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              label="Status"
              onChange={handleChange}
            >
              <MenuItem value={"1"}>Open</MenuItem>
              <MenuItem value={"2"}>Closed</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="note"
            label="Note"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={formData.note}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OpportunityComponent;
