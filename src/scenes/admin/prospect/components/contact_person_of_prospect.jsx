import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Divider,
  Chip
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

const ContactPersonsProspect = ({ contactPersonList }) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
        Contact Persons
      </Typography>

      {contactPersonList && contactPersonList.length > 0 ? (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          mt: 1
        }}>
          {contactPersonList.map((person, index) => (
            <Paper
              key={person.id}
              elevation={1}
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: 'background.paper',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{
                  bgcolor: index % 2 === 0 ? 'primary.light' : 'secondary.light',
                  width: 40,
                  height: 40
                }}>
                  <PersonIcon />
                </Avatar>

                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {person.person_name}
                  </Typography>

                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    {person.mobile && (
                      <Chip
                        icon={<PhoneIcon fontSize="small" />}
                        label={person.mobile}
                        variant="outlined"
                        size="small"
                        sx={{ borderColor: 'text.secondary' }}
                      />
                    )}

                    
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                  {person.email && (
                      <Chip
                        icon={<EmailIcon fontSize="small" />}
                        label={person.email}
                        variant="outlined"
                        size="small"
                        color="primary"
                      />
                    )}

                    
                  </Box>
                  
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      ) : (
        <Box sx={{
          p: 2,
          backgroundColor: 'background.paper',
          borderRadius: 1,
          textAlign: 'center'
        }}>
          <Typography variant="body2" color="text.secondary">
            No contact persons available.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ContactPersonsProspect;
