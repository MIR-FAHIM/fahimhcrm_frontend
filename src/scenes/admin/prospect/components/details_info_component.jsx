import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Divider,
  Chip,
  IconButton,
  TextField,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Link,
  Tooltip
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  Language as IndustryIcon,
  Public as SourceIcon,
  Flag as StageIcon,
  PriorityHigh as PriorityIcon,
  LocationOn as LocationIcon,
  Web as WebIcon,
  Facebook as FacebookIcon,
  LinkedIn as LinkedInIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const DetailsProspectInfo = ({ details, onAddressUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAddress, setEditedAddress] = useState(details.address);

  const handleEditClick = () => {
    setEditedAddress(details.address);
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    onAddressUpdate({ prospect_id: details.id, address: editedAddress });
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setEditedAddress(details.address);
    setIsEditing(false);
  };

  const handleAddressChange = (e) => {
    setEditedAddress(e.target.value);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
  };

  // Get activity summary as array for display
  const getActivitySummary = () => {
    return Object.entries(details.activity_summary || {}).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      count: value
    }));
  };

  return (
    <Card sx={{ width: '100%', maxWidth: 800, margin: 'auto' }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            {details.is_individual ? <PersonIcon /> : <BusinessIcon />}
            <Typography variant="h6" fontWeight="bold">
              {details.prospect_name}
            </Typography>
            
          </Box>
        }
        subheader={
          <Box display="flex" alignItems="center" gap={2} mt={1}>
            <Tooltip title="Created">
              <Typography variant="caption" color="text.secondary">
                Created: {formatDate(details.created_at)}
              </Typography>
            </Tooltip>
            <Tooltip title="Last Activity">
              <Typography variant="caption" color="text.secondary">
                Last Activity: {formatDate(details.last_activity)}
              </Typography>
            </Tooltip>
          </Box>
        }
      />

      <CardContent>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, borderRadius: 2, backgroundColor: 'background.paper' }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon fontSize="small" />
                Basic Information
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <IndustryIcon fontSize="small" color="primary" />
                  <Typography variant="body2">
                    <strong>Industry:</strong> {details.industry_type?.industry_type_name || 'N/A'}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <SourceIcon fontSize="small" color="primary" />
                  <Typography variant="body2">
                    <strong>Source:</strong> {details.information_source?.information_source_name || 'N/A'}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <SourceIcon fontSize="small" color="primary" />
                  <Typography variant="body2">
                    <strong>Interested For:</strong> {details.interested_for?.product_name || 'N/A'}
                  </Typography>
                </Box>

                

                <Box display="flex" alignItems="center" gap={1}>
                  <PriorityIcon fontSize="small" color="primary" />
                  <Typography variant="body2">
                    <strong>Priority:</strong> {details.priority_id || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, borderRadius: 2, backgroundColor: 'background.paper' }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon fontSize="small" />
                Contact Information
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationIcon fontSize="small" color="primary" />
                  <Typography variant="body2">
                    <strong>Address:</strong>
                    {isEditing ? (
                      <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          value={editedAddress}
                          onChange={handleAddressChange}
                          multiline
                          rows={3}
                        />
                        <Box display="flex" gap={1}>
                          <IconButton
                            onClick={handleSaveClick}
                            color="primary"
                            size="small"
                          >
                            <SaveIcon />
                          </IconButton>
                          <IconButton
                            onClick={handleCancelClick}
                            color="error"
                            size="small"
                          >
                            <CancelIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    ) : (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                          {details.address || 'No address available'}
                        </Typography>
                        <IconButton
                          onClick={handleEditClick}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <LocationIcon fontSize="small" color="primary" />
                  <Typography variant="body2">
                    <strong>Zone:</strong> {details.zone?.zone_name || 'N/A'}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <LocationIcon fontSize="small" color="primary" />
                  <Typography variant="body2">
                    <strong>Coordinates:</strong> {details.latitude}, {details.longitude}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Online Presence */}
          <Grid item xs={12} >
            <Paper sx={{ p: 2, borderRadius: 2, backgroundColor: 'background.paper' }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <WebIcon fontSize="small" />
                Online Presence
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {details.website_link && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <WebIcon fontSize="small" color="primary" />
                    <Link href={details.website_link} target="_blank" rel="noopener">
                      <Typography variant="body2">
                        Website
                      </Typography>
                    </Link>
                  </Box>
                )}

                {details.facebook_page && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <FacebookIcon fontSize="small" color="primary" />
                    <Link href={details.facebook_page} target="_blank" rel="noopener">
                      <Typography variant="body2">
                        Facebook
                      </Typography>
                    </Link>
                  </Box>
                )}

                {details.linkedin && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <LinkedInIcon fontSize="small" color="primary" />
                    <Link href={details.linkedin} target="_blank" rel="noopener">
                      <Typography variant="body2">
                        LinkedIn
                      </Typography>
                    </Link>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          

          {/* Notes */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, borderRadius: 2, backgroundColor: 'background.paper' }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon fontSize="small" />
                Notes
              </Typography>

              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                {details.note || 'No notes available'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DetailsProspectInfo;
