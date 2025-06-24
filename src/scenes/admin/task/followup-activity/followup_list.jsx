import React from 'react';
import { Grid, Paper, Typography, Divider, List, ListItem, ListItemText, Avatar, Chip } from '@mui/material';


const FollowUpList = ({ followUps, taskID }) => {
    return (
        <Paper sx={{ padding: 3 }}>
            <Typography variant="h5" gutterBottom>
                Follow-ups
            </Typography>
            <Divider sx={{ marginY: 2 }} />

            {/* Follow-up List */}
            <List>
                {followUps.map((followUp) => (
                    <ListItem key={followUp.id} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ marginRight: 2 }} alt="Follow-up Avatar" src="/static/images/avatar/1.jpg" />
                        <ListItemText
                            primary={
                                <Typography variant="body1" fontWeight="bold">
                                    {followUp.followup_title}
                                </Typography>
                            }
                            secondary={
                                <React.Fragment>
                                    <Typography variant="body2" color="textSecondary">
                                        {followUp.followup_details}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        <Chip label={followUp.status === '1' ? 'Active' : 'Completed'} color={followUp.status === '1' ? 'success' : 'default'} size="small" />
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Created by: {followUp.created_by} on {new Date(followUp.created_at).toLocaleDateString()}
                                    </Typography>
                                </React.Fragment>
                            }
                        />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

export default FollowUpList;
