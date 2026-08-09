import { useMemo, useState } from "react";
import OrganizationForm from "./organization_prospect_form";
import IndividualForm from "./individual_propsect_form";
import {
  Box,
  ButtonBase,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  ApartmentRounded,
  AutoAwesomeRounded,
  CheckCircleRounded,
  GroupsRounded,
  PersonRounded,
  TrendingUpRounded,
} from "@mui/icons-material";

function TabPanel({ children, value, index }) {
  return (
    <Box role="tabpanel" hidden={value !== index}>
      {value === index && children}
    </Box>
  );
}

const leadTypes = [
  {
    title: "Individual Lead",
    description: "Capture a person, contact details, source, interest, owner, and visit location.",
    icon: PersonRounded,
    chips: ["Person profile", "Contact focused", "Fast entry"],
  },
  {
    title: "Organization Lead",
    description: "Create a company or office lead with assigned owners and multiple contact people.",
    icon: ApartmentRounded,
    chips: ["Company profile", "Multiple contacts", "Team assignment"],
  },
];

const AddProspectTabs = () => {
  const theme = useTheme();
  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;
  const [tabValue, setTabValue] = useState(0);

  const selectedLead = useMemo(() => leadTypes[tabValue], [tabValue]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
        py: { xs: 2, md: 4 },
      }}
    >
      <Container maxWidth="xl">
        <Paper
          elevation={0}
          sx={{
            mb: 2.5,
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            overflow: "hidden",
            position: "relative",
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(135deg, ${alpha(brand, 0.14)}, transparent 46%), radial-gradient(circle at 88% 20%, ${alpha(theme.palette.success.main, 0.16)}, transparent 30%)`,
              pointerEvents: "none",
            }}
          />
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
            sx={{ position: "relative" }}
          >
            <Box>
              <Chip
                icon={<AutoAwesomeRounded />}
                label="Lead entry workspace"
                size="small"
                sx={{
                  mb: 1.2,
                  bgcolor: alpha(brand, 0.12),
                  color: brand,
                  fontWeight: 700,
                }}
              />
              <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 700, letterSpacing: 0 }}>
                Add New Prospect
              </Typography>
              <Typography sx={{ color: theme.palette.text.secondary, mt: 0.6, maxWidth: 720 }}>
                Choose the right lead type, capture the essential details first, and keep contacts, ownership, and location organized in one flow.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip icon={<CheckCircleRounded />} label="Core details" variant="outlined" sx={{ fontWeight: 650 }} />
              <Chip icon={<GroupsRounded />} label="Contacts" variant="outlined" sx={{ fontWeight: 650 }} />
              <Chip icon={<TrendingUpRounded />} label="Sales pipeline" variant="outlined" sx={{ fontWeight: 650 }} />
            </Stack>
          </Stack>
        </Paper>

        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          {leadTypes.map((lead, index) => {
            const Icon = lead.icon;
            const active = tabValue === index;
            return (
              <Grid item xs={12} md={6} key={lead.title}>
                <ButtonBase
                  onClick={() => setTabValue(index)}
                  sx={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    borderRadius: 3,
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.4,
                      minHeight: 154,
                      borderRadius: 3,
                      border: `1px solid ${active ? brand : theme.palette.divider}`,
                      bgcolor: active ? alpha(brand, theme.palette.mode === "dark" ? 0.2 : 0.08) : theme.palette.background.paper,
                      boxShadow: active ? `0 18px 50px ${alpha(brand, 0.16)}` : "none",
                      transition: "border-color .18s ease, box-shadow .18s ease, transform .18s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        borderColor: brand,
                      },
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 46,
                          height: 46,
                          borderRadius: 2,
                          display: "grid",
                          placeItems: "center",
                          bgcolor: active ? brand : alpha(brand, 0.12),
                          color: active ? theme.palette.getContrastText(brand) : brand,
                          flex: "0 0 auto",
                        }}
                      >
                        <Icon />
                      </Box>
                      <Box>
                        <Typography sx={{ color: theme.palette.text.primary, fontWeight: 700, fontSize: 20 }}>
                          {lead.title}
                        </Typography>
                        <Typography sx={{ color: theme.palette.text.secondary, mt: 0.6, lineHeight: 1.6 }}>
                          {lead.description}
                        </Typography>
                        <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap" sx={{ mt: 1.4 }}>
                          {lead.chips.map((chip) => (
                            <Chip key={chip} label={chip} size="small" sx={{ fontWeight: 600 }} />
                          ))}
                        </Stack>
                      </Box>
                    </Stack>
                  </Paper>
                </ButtonBase>
              </Grid>
            );
          })}
        </Grid>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper,
            overflow: "hidden",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
            spacing={1.5}
            sx={{ px: { xs: 2, md: 2.5 }, pt: 2, pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}
          >
            <Box>
              <Typography sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
                {selectedLead.title} Form
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Fill the form below and save when the lead profile is ready.
              </Typography>
            </Box>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              variant="fullWidth"
              sx={{
                minWidth: { xs: "100%", md: 360 },
                bgcolor: alpha(brand, 0.06),
                borderRadius: 2,
                minHeight: 44,
                "& .MuiTab-root": {
                  minHeight: 44,
                  textTransform: "none",
                  fontWeight: 700,
                },
              }}
            >
              <Tab icon={<PersonRounded fontSize="small" />} iconPosition="start" label="Individual" />
              <Tab icon={<ApartmentRounded fontSize="small" />} iconPosition="start" label="Organization" />
            </Tabs>
          </Stack>

          <TabPanel value={tabValue} index={0}>
            <IndividualForm />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <OrganizationForm />
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
};

export default AddProspectTabs;
