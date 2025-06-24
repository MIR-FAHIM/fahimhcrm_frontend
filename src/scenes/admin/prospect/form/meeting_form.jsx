import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  MenuItem,
  Box,
  Grid,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { addMeeting, fetchMeetingByProspect } from '../../../../api/controller/admin_controller/prospect_controller';
import { fetchEmployees } from "../../../../api/controller/admin_controller/user_controller";
import { addTask } from '../../../../api/controller/admin_controller/task_controller/task_controller';

const MeetingForm = ({ prospectId, meetingTitlee }) => {
  const userID = localStorage.getItem("userId");
  const [formData, setFormData] = useState({
    meeting_title: '',
    meeting_context: '',
    task_id: '',
    assign_to: '',
    prospect_id: prospectId,
    meeting_type: '',
    start_time: '',
    notify_time: '',
    status: "0",
    meeting_with: '',
    priority_id: 1,
  });
  
  const [employees, setEmployees] = useState([]);
  const [meetingList, setMeetingList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState('');

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      meeting_title: meetingTitlee || '',
    }));

    fetchMeetingData();
    fetchEmployees()
      .then((res) => setEmployees(res.data || []))
      .catch(console.error);
  }, []);

  const fetchMeetingData = async () => {
    try {
      const responseMeeting = await fetchMeetingByProspect(prospectId);
      setMeetingList(responseMeeting.data || []);
    } catch (err) {
      console.error('Failed to fetch meeting list', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponseMsg('');

    const taskData = {
      task_title: formData.meeting_title,
      task_details: formData.meeting_context,
      priority_id: 2,
      task_type_id: 1,
      is_remind: 0,
      due_date: formData.start_time || '',
      status_id: 1,
      department_id: 1,
      created_by: userID,
      show_completion_percentage: 0,
      completion_percentage: 0,
    };

    try {
      const taskResponse = await addTask(taskData);

      if (taskResponse.data && taskResponse.data.id) {
        const updatedFormData = { ...formData, task_id: taskResponse.data.id };
        await addMeeting(updatedFormData);
        setResponseMsg('Meeting added successfully!');
        setFormData((prev) => ({
          ...prev,
          meeting_context: '',
          assign_to: '',
          meeting_with: '',
          start_time: '',
          notify_time: '',
        }));
        fetchMeetingData(); // Refresh meeting list
      } else {
        throw new Error('Failed to create task or missing task_id');
      }
    } catch (err) {
      setResponseMsg('Failed to add meeting: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      {/* Left side: Meeting Form */}
      <Box flex={2}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Schedule a Meeting
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Meeting Title"
                  name="meeting_title"
                  value={formData.meeting_title}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Meeting Context"
                  name="meeting_context"
                  value={formData.meeting_context}
                  onChange={handleChange}
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  select
                  fullWidth
                  name="assign_to"
                  label="Assign To"
                  value={formData.assign_to}
                  onChange={handleChange}
                >
                  {employees.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Meeting Person"
                  name="meeting_with"
                  value={formData.meeting_with}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Start Time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Notify Time"
                  name="notify_time"
                  value={formData.notify_time}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  fullWidth
                >
                  {loading ? 'Sending...' : 'Add Meeting'}
                </Button>
              </Grid>

              {responseMsg && (
                <Grid item xs={12}>
                  <Typography color={responseMsg.includes('Failed') ? 'error' : 'success.main'}>
                    {responseMsg}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </form>
        </Paper>
      </Box>

      {/* Right side: Meeting List */}
      <Box flex={1}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Meetings
          </Typography>
          <Divider />
          <List>
            {meetingList.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                No meetings found.
              </Typography>
            ) : (
              meetingList.map((meeting) => (
                <ListItem key={meeting.id} alignItems="flex-start">
                  <ListItemText
                    primary={meeting.meeting_title}
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          With: {meeting.meeting_with || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Start: {new Date(meeting.start_time).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Context: {meeting.meeting_context}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))
            )}
          </List>
        </Paper>
      </Box>
    </Box>
  );
};

export default MeetingForm;
