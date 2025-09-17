import React, { useState, useEffect } from "react";
import {
  Box, Typography, Button, Card, CardContent, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Grid, Tooltip, Stack, Slider, Tabs, Tab, Divider,CircularProgress as MuiCircularProgress,
  useTheme, MenuItem, FormControlLabel, Switch,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import AddIcon from "@mui/icons-material/Add";
import { tokens } from "../../../theme";
import ClientTicket from "./components/ticket";
import ClientTask from "./components/client_task";
import { addTicket, getClientDetails } from "../../../api/controller/admin_controller/client_controller";

// Mock data and components to ensure the code can be previewed
// In your environment, these would be imported from your files


const mockPriorities = [
  { id: 1, priority_name: 'Important' },
  { id: 2, priority_name: 'Urgent' },
  { id: 3, priority_name: 'Low' },
];

const mockTypes = ['tech', 'billing', 'support'];


const ClientDetails = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  // Using a mock ID since useParams won't work in this environment
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [clientDetails, setClientDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    type: '',
    issue_id: '',
    priority_id: '',
    is_urgent: false,
    category: '',
  });

  useEffect(() => {
    fetchClientDetails();
  }, [id]);

  const fetchClientDetails = async () => {
    setLoading(true);
    try {
      // Replaced getClientDetails(id) with mock data
      const res =await  getClientDetails(1);
      setClientDetails(res.data || {});
    } catch (error) {
      console.error("Error fetching setClientDetails details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    // Reset form fields
    setNewTicket({
      subject: '',
      description: '',
      type: '',
      issue_id: '',
      priority_id: '',
      is_urgent: false,
      category: '',
    });
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewTicket(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
        const ticketData = { ...newTicket, client_id: id };
        // This is a placeholder for the actual API call
         const res = await addTicket(ticketData);
        console.log("Submitting new ticket:", ticketData);
        // if (res.status === 'success') { ... }
        alert('Ticket submitted successfully!');
        handleCloseForm();
    } catch (error) {
        console.error("Failed to submit ticket:", error);
        alert('Failed to submit ticket. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.palette.background.default }}>
        <MuiCircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: theme.palette.background.default }}>
      {/* Left Side – Project Info */}
      <Box
        sx={{
          width: { xs: '100%', md: 250 },
          p: { xs: 2, md: 3 },
          borderRight: { xs: 'none', md: `1px solid ${colors.gray[700]}` },
          backgroundColor: theme.palette.background.paper,
          mb: { xs: 2, md: 0 },
        }}
      >
        <Typography variant="h5" fontWeight={700} mb={3} sx={{ color: colors.primary[100] }}>
          📁 Client Details
        </Typography>

         <Typography variant="subtitle1" fontWeight={600}>Client Name</Typography>
            <Typography variant="body2" mb={2}>{clientDetails.prospect?.prospect_name} (ID: {clientDetails.prospect?.id})</Typography>
            <Typography variant="subtitle1" fontWeight={600}>Address</Typography>
            <Typography variant="body2" mb={2}>{clientDetails.prospect?.address}</Typography>
            <Typography variant="subtitle1" fontWeight={600}>Website</Typography>
            <Typography variant="body2" mb={2}>{clientDetails.prospect?.website_link}</Typography>
            <Typography variant="subtitle1" fontWeight={600}>Note</Typography>
            <Typography variant="body2" mb={2}>{clientDetails.prospect?.note}</Typography>
            <Typography variant="subtitle1" fontWeight={600}>Industry</Typography>
            <Typography variant="body2" mb={2}>{clientDetails.prospect?.industry_type?.industry_type_name}</Typography>
            <Typography variant="subtitle1" fontWeight={600}>Information Source</Typography>
            <Typography variant="body2" mb={2}>{clientDetails.prospect?.information_source?.information_source_name}</Typography>
            <Typography variant="subtitle1" fontWeight={600}>Created At</Typography>
            <Typography variant="body2" mb={2}>{dayjs(clientDetails.prospect?.created_at).format("MMM D, YYYY · h:mm A")}</Typography>
        
        <Box mt={4}>
          <Button
            variant="contained"
            fullWidth
            sx={{
              color:colors.gray[100],
              backgroundColor: colors.gray[800],
              "&:hover": {
                backgroundColor: colors.primary[700],
              },
            }}
            startIcon={<AddIcon />}
            onClick={handleOpenForm}
          >
            Add New Ticket
          </Button>
        </Box>
      </Box>

      {/* Right Side – Tabs and Content */}
      <Box sx={{ flex: 1, p: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="Project Tabs"
          TabIndicatorProps={{ style: { backgroundColor: colors.blueAccent[500] } }}
        >
          <Tab label="Tickets" sx={{ color: colors.gray[100] }} />
          <Tab label="Tasks" sx={{ color: colors.gray[100] }} />
          <Tab label="Communications" sx={{ color: colors.gray[100] }} />
          <Tab label="Files" sx={{ color: colors.gray[100] }} />
        </Tabs>

        <Divider sx={{ my: 2, borderColor: colors.gray[700] }} />

        {/* Tab Content */}
        {activeTab === 0 && (
         <ClientTicket/>
        )}

        {activeTab === 1 && (
          <ClientTask clntID={id}/>
        )}
        {activeTab === 2 && (
          <Box sx={{ color: colors.gray[100] }}>
            {/* Communications Content here */}
          </Box>
        )}
        {activeTab === 3 && (
          <Box sx={{ color: colors.gray[100] }}>
            {/* Files Content here */}
          </Box>
        )}
      </Box>

      {/* Add Ticket Form Dialog */}
      <Dialog open={isFormOpen} onClose={handleCloseForm} fullWidth maxWidth="sm">
        <DialogTitle>Add New Ticket</DialogTitle>
        <Box component="form" onSubmit={handleFormSubmit}>
          <DialogContent dividers>
            <TextField
              margin="dense"
              name="subject"
              label="Subject"
              type="text"
              fullWidth
              variant="outlined"
              required
              value={newTicket.subject}
              onChange={handleFormChange}
            />
            <TextField
              margin="dense"
              name="description"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={newTicket.description}
              onChange={handleFormChange}
            />
            <TextField
              margin="dense"
              name="type"
              label="Type"
              select
              fullWidth
              variant="outlined"
              value={newTicket.type}
              onChange={handleFormChange}
            >
              {mockTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="dense"
              name="priority_id"
              label="Priority"
              select
              fullWidth
              variant="outlined"
              value={newTicket.priority_id}
              onChange={handleFormChange}
            >
              {mockPriorities.map((priority) => (
                <MenuItem key={priority.id} value={priority.id}>
                  {priority.priority_name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="dense"
              name="issue_id"
              label="Issue ID"
              type="number"
              fullWidth
              variant="outlined"
              value={newTicket.issue_id}
              onChange={handleFormChange}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={newTicket.is_urgent}
                  onChange={handleFormChange}
                  name="is_urgent"
                />
              }
              label="Is Urgent"
            />
            <TextField
              margin="dense"
              name="category"
              label="Category"
              type="text"
              fullWidth
              variant="outlined"
              value={newTicket.category}
              onChange={handleFormChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseForm} color="primary">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Add Ticket
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default ClientDetails;