import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ArrowBackRounded } from "@mui/icons-material";

const colors = {
  bg: "#070A0F",
  panel: "#111821",
  panelDeep: "#0A0F16",
  border: "rgba(148, 163, 184, 0.22)",
  text: "#F8FAFC",
  muted: "#A8B3C2",
  green: "#22C55E",
  cyan: "#38BDF8",
};

const sections = [
  {
    title: "Information We Collect",
    body: "BrainToDo may collect account information, organization details, employee profile data, task records, CRM/prospect records, attendance activity, visit information, uploaded files, and technical usage data needed to operate the platform.",
  },
  {
    title: "How We Use Information",
    body: "We use information to provide HRM, CRM, task, attendance, reporting, permission, and field-force features; improve reliability; support users; secure accounts; and communicate important service updates.",
  },
  {
    title: "Data Sharing",
    body: "We do not sell personal information. Limited information may be shared with trusted service providers for hosting, storage, support, analytics, or legal compliance when required.",
  },
  {
    title: "Security",
    body: "We apply reasonable administrative, technical, and operational safeguards to protect user data. No digital system is completely risk-free, so users should also protect passwords and account access.",
  },
  {
    title: "User Responsibilities",
    body: "Organizations using BrainToDo are responsible for ensuring they have permission to store employee, client, prospect, attendance, task, and visit data in the system.",
  },
  {
    title: "Data Retention",
    body: "We retain information as long as needed to provide the service, meet business requirements, resolve issues, maintain records, or comply with applicable obligations.",
  },
  {
    title: "Contact",
    body: "For privacy questions or data-related requests, contact the BrainToDo support or creator team through the official communication channel provided to your organization.",
  },
];

const BrainToDoPrivacyPolicy = () => (
  <Box sx={{ bgcolor: colors.bg, color: colors.text, minHeight: "100vh" }}>
    <Box component="header" sx={{ borderBottom: `1px solid ${colors.border}`, bgcolor: "rgba(7, 10, 15, 0.9)", backdropFilter: "blur(12px)" }}>
      <Container maxWidth="md">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1.5 }}>
          <Typography sx={{ color: colors.text, fontSize: 20, fontWeight: 800 }}>BrainToDo</Typography>
          <Button href="/landing" startIcon={<ArrowBackRounded />} sx={{ color: colors.muted, textTransform: "none", fontWeight: 700 }}>
            Back to Landing
          </Button>
        </Stack>
      </Container>
    </Box>

    <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 5 },
          borderRadius: 3,
          bgcolor: colors.panel,
          border: `1px solid ${colors.border}`,
          boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
        }}
      >
        <Typography variant="overline" sx={{ color: colors.cyan, fontWeight: 800, letterSpacing: 0 }}>
          Legal
        </Typography>
        <Typography component="h1" sx={{ color: colors.text, fontWeight: 800, fontSize: { xs: 34, md: 48 }, lineHeight: 1.05, mt: 0.5 }}>
          Privacy Policy
        </Typography>
        <Typography sx={{ color: colors.muted, mt: 1.5, lineHeight: 1.75 }}>
          Last updated: August 18, 2026
        </Typography>
        <Typography sx={{ color: colors.muted, mt: 3, lineHeight: 1.8, fontSize: 16 }}>
          This Privacy Policy explains how BrainToDo collects, uses, stores, and protects information when organizations and users access the BrainToDo HRM, CRM, task, attendance, reporting, and field-force platform.
        </Typography>

        <Divider sx={{ borderColor: colors.border, my: 3.5 }} />

        <Stack spacing={2.5}>
          {sections.map((section, index) => (
            <Box key={section.title}>
              <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 0.8 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: 1.5, display: "grid", placeItems: "center", bgcolor: alpha(colors.green, 0.14), color: colors.green, fontWeight: 800 }}>
                  {index + 1}
                </Box>
                <Typography variant="h6" sx={{ color: colors.text, fontWeight: 800 }}>
                  {section.title}
                </Typography>
              </Stack>
              <Typography sx={{ color: colors.muted, lineHeight: 1.8 }}>
                {section.body}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Container>

    <Box component="footer" sx={{ bgcolor: colors.panelDeep, borderTop: `1px solid ${colors.border}`, py: 3 }}>
      <Container maxWidth="md">
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
          <Typography sx={{ color: colors.text, fontWeight: 800 }}>BrainToDo</Typography>
          <Typography sx={{ color: colors.muted }}>Privacy-first business, office, and team management.</Typography>
        </Stack>
      </Container>
    </Box>
  </Box>
);

export default BrainToDoPrivacyPolicy;
