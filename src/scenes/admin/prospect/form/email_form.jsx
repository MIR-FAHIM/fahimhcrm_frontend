import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Paper,
  Autocomplete,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckIcon from '@mui/icons-material/Check';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const EmailForm = ({ onSend, emailList }) => {
  // Format email list for autocomplete
  const formattedEmailList = emailList
    .filter(item => item.email)
    .map(item => ({
      label: `${item.person_name} <${item.email}>`,
      value: item.email
    }));

  // State for email data
  const [emailData, setEmailData] = useState({
    to: [],
    cc: [],
    subject: '',
    body: ''
  });

  // Template data
  const templateList = [
    {
      id: 1,
      title: 'Welcome Email',
      subject: 'Welcome to Our Service!',
      body: '<p>Hello,</p><p>We are excited to have you on board. Let us know if you need any help.</p>'
    },
    {
      id: 2,
      title: 'Follow-up Email',
      subject: 'Checking In',
      body: '<p>Hi,</p><p>Just checking in to see how everything is going. Let us know if you have any questions.</p>'
    },
    {
      id: 3,
      title: 'Thank You Email',
      subject: 'Thank You!',
      body: '<p>Thank you for your time. We appreciate your support and look forward to working together.</p>'
    }
  ];

  // Handler for autocomplete changes
  const handleAutocompleteChange = (field) => (_, selectedOptions) => {
    setEmailData((prev) => ({
      ...prev,
      [field]: selectedOptions.map(opt => opt.value)
    }));
  };

  // Handler for input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmailData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for body content changes
  const handleBodyChange = (content) => {
    setEmailData((prev) => ({ ...prev, body: content }));
  };

  // Handler for form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedData = {
      ...emailData,
      to: emailData.to.join(','),
      cc: emailData.cc.join(',')
    };
    onSend(formattedData);
  };

  // Handler for template selection
  const handleTemplateSelect = (template) => {
    setEmailData((prev) => ({
      ...prev,
      subject: template.subject,
      body: template.body
    }));
  };

  // Helper to get selected options
  const getSelectedOptions = (selectedEmails) =>
    formattedEmailList.filter(opt => selectedEmails.includes(opt.value));

  return (
    <Paper elevation={3} sx={{ padding: 4, maxWidth: '1200px', margin: 'auto' }}>
      <Grid container spacing={4}>
        {/* Email Form Section */}
        <Grid item xs={12} md={8}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* To Field */}
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={formattedEmailList}
                  getOptionLabel={(option) => option.label}
                  value={getSelectedOptions(emailData.to)}
                  onChange={handleAutocompleteChange('to')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="To"
                      required
                    />
                  )}
                />
              </Grid>

              {/* CC Field */}
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={formattedEmailList}
                  getOptionLabel={(option) => option.label}
                  value={getSelectedOptions(emailData.cc)}
                  onChange={handleAutocompleteChange('cc')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="CC"
                      placeholder="Optional"
                    />
                  )}
                />
              </Grid>

              {/* Subject Field */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject"
                  name="subject"
                  value={emailData.subject}
                  onChange={handleChange}
                  required
                />
              </Grid>

              {/* Email Body */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Body
                </Typography>
                <ReactQuill
                  theme="snow"
                  value={emailData.body}
                  onChange={handleBodyChange}
                  placeholder="Write your message here..."
                  style={{ height: '200px' }}
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Send Email
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* Template List Section */}
        <Grid item xs={12} md={4}>
          <Box sx={{
            backgroundColor: 'background.paper',
            borderRadius: 2,
            boxShadow: 2,
            p: 2,
            height: '100%'
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              <Box display="flex" alignItems="center" gap={1}>
                <DescriptionIcon color="primary" />
                Templates
              </Box>
            </Typography>
            <Divider sx={{ mb: 2, borderColor: 'primary.main' }} />

            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {templateList.map((template, index) => (
                <React.Fragment key={template.id}>
                  <ListItem
                    disablePadding
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        cursor: 'pointer'
                      },
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <ListItemButton
                      onClick={() => handleTemplateSelect(template)}
                      sx={{
                        borderRadius: 1,
                        mx: 1,
                        my: 0.5,
                      }}
                    >
                      <ListItemAvatar sx={{ minWidth: 40 }}>
                        <Avatar sx={{
                          bgcolor: index % 2 === 0 ? 'primary.light' : 'secondary.light',
                          width: 32,
                          height: 32
                        }}>
                          <DescriptionIcon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={template.title}
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {template.description || 'No description'}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < templateList.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default EmailForm;
