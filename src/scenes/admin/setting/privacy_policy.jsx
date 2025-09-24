// PrivacyPolicy.jsx
import React from "react";
import {
  Container,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material";

const PrivacyPolicy = () =>{
  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          background: (theme) =>
            theme.palette.mode === "light" ? "#fafafa" : "background.paper",
        }}
      >
        {/* Title */}
        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
          sx={{ color: "primary.main" }}
        >
          Privacy Policy
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Last Updated: {new Date().toLocaleDateString()}
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Intro */}
        <Typography variant="body1" paragraph>
          At <strong>BrainToDo</strong>, your privacy is extremely important to us. 
          This Privacy Policy explains how we collect, use, and protect your 
          information when you use our platform.
        </Typography>

        {/* Information We Collect */}
        <Box sx={{ my: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            1. Information We Collect
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText
                primary="Personal Information"
                secondary="Such as your name, email address, phone number, and organization details when you sign up."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Usage Data"
                secondary="Information about how you use BrainToDo (pages visited, tasks created, device/browser info)."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Files & Content"
                secondary="Any tasks, notes, or files uploaded while using the platform."
              />
            </ListItem>
          </List>
        </Box>

        {/* How We Use Data */}
        <Box sx={{ my: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            2. How We Use Your Information
          </Typography>
          <Typography variant="body1" paragraph>
            We use the collected information to:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="Provide and improve the BrainToDo platform" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Communicate important updates or changes" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Ensure security, fraud prevention, and compliance" />
            </ListItem>
          </List>
        </Box>

        {/* Sharing */}
        <Box sx={{ my: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            3. Data Sharing & Disclosure
          </Typography>
          <Typography variant="body1" paragraph>
            We <strong>do not sell</strong> your personal information. However, 
            we may share limited data with:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="Trusted service providers (for hosting, support, analytics)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Authorities when required by law" />
            </ListItem>
          </List>
        </Box>

        {/* Security */}
        <Box sx={{ my: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            4. Data Security
          </Typography>
          <Typography variant="body1" paragraph>
            We use industry-standard encryption, access controls, and monitoring 
            to keep your data safe. However, no online system is 100% secure.
          </Typography>
        </Box>

        {/* Your Rights */}
        <Box sx={{ my: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            5. Your Rights
          </Typography>
          <Typography variant="body1" paragraph>
            You have the right to access, update, or delete your personal data. 
            For requests, contact us at{" "}
            <strong>support@braintodo.com</strong>.
          </Typography>
        </Box>

        {/* Changes */}
        <Box sx={{ my: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            6. Changes to this Policy
          </Typography>
          <Typography variant="body1" paragraph>
            We may update this Privacy Policy from time to time. Updates will be 
            reflected with a new "Last Updated" date at the top.
          </Typography>
        </Box>

        {/* Contact */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            7. Contact Us
          </Typography>
          <Typography variant="body1">
            If you have any questions, please contact us at: <br />
            📧 <strong>support@braintodo.com</strong>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
export default PrivacyPolicy;