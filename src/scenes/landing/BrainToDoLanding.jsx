import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  AccessTimeRounded,
  ArrowForwardRounded,
  AssessmentRounded,
  AutoAwesomeRounded,
  CheckCircleRounded,
  DashboardRounded,
  GroupsRounded,
  RouteRounded,
  SecurityRounded,
  TaskAltRounded,
} from "@mui/icons-material";
import allTaskImage from "../../assets/marketing/b_all_task.png";
import attendanceImage from "../../assets/marketing/d_attendance_report.png";
import departmentImage from "../../assets/marketing/b_department.png";
import fieldForceImage from "../../assets/marketing/b_map.png";
import leadImage from "../../assets/marketing/sale-pipeline.png";
import mirPoster from "../../assets/marketing/mirposter.png";
import reportImage from "../../assets/marketing/work_report.png";

const ctaUrl = "https://hcrm.braintodo.com/login";

const colors = {
  bg: "#070A0F",
  band: "#0B1017",
  panel: "#111821",
  panelSoft: "#141C26",
  panelDeep: "#0A0F16",
  border: "rgba(148, 163, 184, 0.2)",
  borderStrong: "rgba(148, 163, 184, 0.34)",
  text: "#F8FAFC",
  muted: "#A8B3C2",
  mutedStrong: "#CBD5E1",
  green: "#22C55E",
  greenDeep: "#16A34A",
  cyan: "#38BDF8",
  amber: "#F59E0B",
};

const featureTabs = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: DashboardRounded,
    image: departmentImage,
    title: "Executive Dashboard",
    copy: "See attendance, tasks, leads, field visits, and team activity from one command center.",
    stats: ["84% present", "27 open tasks", "12 new leads"],
    rows: ["Daily attendance summary", "Task workload by department", "Lead conversion overview"],
  },
  {
    key: "tasks",
    label: "Tasks",
    icon: TaskAltRounded,
    image: allTaskImage,
    title: "Task Management",
    copy: "Plan, assign, prioritize, follow up, and review work without scattered messages.",
    stats: ["Priority", "Calendar", "Follow-up"],
    rows: ["Assign tasks with project and phase", "Track task status by department", "Attach updates, images, and reports"],
  },
  {
    key: "attendance",
    label: "Attendance",
    icon: AccessTimeRounded,
    image: attendanceImage,
    title: "Attendance & Leave",
    copy: "Manage check-in, check-out, early leave, leave approvals, and employee reports.",
    stats: ["Check in", "Leave", "Reports"],
    rows: ["Office hour based attendance", "Late and early leave tracking", "Approval-ready leave management"],
  },
  {
    key: "leads",
    label: "Leads",
    icon: GroupsRounded,
    image: leadImage,
    title: "Lead & Prospect CRM",
    copy: "Capture prospects, stage pipelines, contact people, visits, and sales opportunities.",
    stats: ["Pipeline", "Contacts", "Opportunity"],
    rows: ["Stage-wise prospect board", "Contact person history", "Source-wise prospect reporting"],
  },
  {
    key: "fieldforce",
    label: "Field Force",
    icon: RouteRounded,
    image: fieldForceImage,
    title: "Field Force Visits",
    copy: "Plan visits, track field employees, and understand date-wise customer activity.",
    stats: ["Planner", "Map", "Date-wise"],
    rows: ["Visit planner and schedule", "Employee-wise visit history", "Map based customer routes"],
  },
  {
    key: "permissions",
    label: "Permissions",
    icon: SecurityRounded,
    image: departmentImage,
    title: "Role & User Permissions",
    copy: "Control feature access by role or user with clear grouped permission views.",
    stats: ["Roles", "Users", "Features"],
    rows: ["Role-wise permission management", "User-specific feature control", "Grouped modules for safer admin work"],
  },
  {
    key: "reports",
    label: "Reports",
    icon: AssessmentRounded,
    image: reportImage,
    title: "Reports & Insights",
    copy: "Turn daily work, attendance, visits, and prospects into clear operational reports.",
    stats: ["Daily", "Monthly", "Team"],
    rows: ["Daily work reports", "Prospect source reporting", "Attendance dashboard summaries"],
  },
];

const featureCards = [
  ["Task Management", "Assign work, track status, review progress, and keep follow-ups attached to the task."],
  ["Attendance & Leave", "Manage check-in, checkout, late entries, early leave, and leave approvals."],
  ["Prospect CRM", "Track leads, contact persons, opportunity stages, and source-wise performance."],
  ["Field Force", "Plan visits, monitor routes, and review date-wise customer activity."],
  ["Permissions", "Control every important module with role-wise and user-wise feature permissions."],
  ["Reports", "Understand daily work, prospect growth, attendance, and operational activity."],
];

const workflow = [
  ["Plan", "Create tasks, visits, projects, and department workflows."],
  ["Operate", "Let employees work from one system with clear responsibilities."],
  ["Measure", "Review dashboards and reports to understand what is happening."],
  ["Improve", "Adjust permissions, stages, priorities, and process as the team grows."],
];

const MetricCard = ({ label, value, accent = colors.cyan }) => (
  <Paper
    elevation={0}
    sx={{
      p: 1.5,
      borderRadius: 2,
      bgcolor: alpha(accent, 0.1),
      border: `1px solid ${alpha(accent, 0.26)}`,
      minWidth: 132,
    }}
  >
    <Typography variant="caption" sx={{ color: colors.muted, fontWeight: 650 }}>
      {label}
    </Typography>
    <Typography sx={{ color: colors.text, fontWeight: 700, fontSize: 22, mt: 0.3 }}>
      {value}
    </Typography>
  </Paper>
);

const HeroProductPanel = () => (
  <Box
    sx={{
      position: "relative",
      mt: { xs: 5, md: 0 },
    }}
  >
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        bgcolor: colors.panel,
        border: `1px solid ${colors.borderStrong}`,
        boxShadow: "0 28px 90px rgba(0,0,0,0.34)",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 1.4, bgcolor: colors.panelDeep, borderBottom: `1px solid ${colors.border}` }}>
        <Stack direction="row" spacing={0.8} alignItems="center">
          {["#EF4444", "#F59E0B", "#22C55E"].map((dot) => (
            <Box key={dot} sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: dot }} />
          ))}
          <Typography sx={{ color: colors.muted, fontWeight: 650, fontSize: 13, ml: 1 }}>
            BrainToDo workspace
          </Typography>
        </Stack>
      </Box>
      <Box sx={{ p: { xs: 1.2, md: 1.5 } }}>
        <Box
          component="img"
          src={allTaskImage}
          alt="BrainToDo dashboard preview"
          sx={{
            display: "block",
            width: "100%",
            minHeight: { xs: 260, md: 390 },
            maxHeight: 470,
            objectFit: "cover",
            objectPosition: "top left",
            borderRadius: 2.5,
            border: `1px solid ${colors.border}`,
          }}
        />
      </Box>
    </Paper>

    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.2}
      sx={{
        mt: 1.4,
        justifyContent: { xs: "stretch", md: "flex-end" },
      }}
    >
      <MetricCard label="Teams aligned" value="1 system" accent={colors.green} />
      <MetricCard label="Operations" value="HRM + CRM" accent={colors.cyan} />
      <MetricCard label="Reports" value="Live view" accent={colors.amber} />
    </Stack>
  </Box>
);

const FeatureMockup = ({ feature }) => {
  const Icon = feature.icon;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${colors.borderStrong}`,
        overflow: "hidden",
        bgcolor: colors.panel,
        boxShadow: "0 26px 70px rgba(0,0,0,0.28)",
      }}
    >
      <Box sx={{ px: 2, py: 1.4, bgcolor: colors.panelDeep, color: colors.text, display: "flex", alignItems: "center", gap: 1, borderBottom: `1px solid ${colors.border}` }}>
        <Icon fontSize="small" />
        <Typography fontWeight={700}>{feature.title}</Typography>
      </Box>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Box
          component="img"
          src={feature.image}
          alt={`${feature.title} UI preview`}
          sx={{
            display: "block",
            width: "100%",
            height: { xs: 260, md: 380 },
            objectFit: "cover",
            objectPosition: "top left",
            borderRadius: 2,
            border: `1px solid ${colors.border}`,
            mb: 2,
          }}
        />
        <Grid container spacing={1.5} mb={2}>
          {feature.stats.map((stat, index) => (
            <Grid item xs={12} sm={4} key={stat}>
              <Box
                sx={{
                  borderRadius: 2,
                  p: 1.5,
                  bgcolor: index === 0 ? alpha(colors.cyan, 0.12) : index === 1 ? alpha(colors.green, 0.12) : alpha(colors.amber, 0.12),
                  border: `1px solid ${index === 0 ? alpha(colors.cyan, 0.22) : index === 1 ? alpha(colors.green, 0.22) : alpha(colors.amber, 0.22)}`,
                  minHeight: 78,
                }}
              >
                <Typography variant="caption" sx={{ color: colors.muted, fontWeight: 600 }}>
                  BrainToDo
                </Typography>
                <Typography sx={{ color: colors.text, fontWeight: 700, mt: 0.5 }}>
                  {stat}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  );
};

const BrainToDoLanding = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const selectedFeature = useMemo(() => featureTabs[activeFeature], [activeFeature]);

  return (
    <Box sx={{ bgcolor: colors.bg, color: colors.text, minHeight: "100vh" }}>
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor: "rgba(7, 10, 15, 0.86)",
          backdropFilter: "blur(14px)",
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1.35 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: colors.green, color: "#052E16", display: "grid", placeItems: "center", fontWeight: 700 }}>
                B
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: 20, color: colors.text }}>BrainToDo</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button href="#features" sx={{ display: { xs: "none", sm: "inline-flex" }, color: colors.mutedStrong, fontWeight: 650, textTransform: "none" }}>
                Features
              </Button>
              <Button href={ctaUrl} variant="contained" endIcon={<ArrowForwardRounded />} sx={{ bgcolor: colors.green, color: "#052E16", fontWeight: 700, textTransform: "none", borderRadius: 2, "&:hover": { bgcolor: "#4ADE80" } }}>
                Try Free
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Box
        component="section"
        sx={{
          position: "relative",
          overflow: "hidden",
          bgcolor: colors.bg,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <Container maxWidth="lg" sx={{ pt: { xs: 7, md: 10 }, pb: { xs: 7, md: 10 } }}>
          <Grid container spacing={{ xs: 5, md: 6 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip
                icon={<AutoAwesomeRounded />}
                label="Smart HRM, CRM, task, and team operations"
                sx={{
                  bgcolor: alpha(colors.cyan, 0.12),
                  color: "#BAE6FD",
                  border: `1px solid ${alpha(colors.cyan, 0.24)}`,
                  fontWeight: 700,
                  mb: 2.5,
                }}
              />
              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: 46, sm: 58, md: 76 },
                  lineHeight: 0.98,
                  fontWeight: 700,
                  letterSpacing: 0,
                  color: colors.text,
                  maxWidth: 720,
                }}
              >
                HRM + CRM for result-driven teams
              </Typography>
              <Typography
                sx={{
                  mt: 2.4,
                  maxWidth: 650,
                  color: colors.muted,
                  fontSize: { xs: 17, md: 20 },
                  lineHeight: 1.65,
                  fontWeight: 650,
                }}
              >
                Plan people ops, track sales, approve attendance, manage visits, and ship projects from one secure workspace on web and mobile.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }} sx={{ mt: 4 }}>
                <Button
                  href={ctaUrl}
                  size="large"
                  variant="contained"
                  endIcon={<ArrowForwardRounded />}
                  sx={{
                    px: 3,
                    py: 1.25,
                    textTransform: "none",
                    fontWeight: 700,
                    bgcolor: colors.green,
                    color: "#052E16",
                    borderRadius: 2.2,
                    boxShadow: `0 14px 32px ${alpha(colors.green, 0.24)}`,
                    "&:hover": { bgcolor: "#4ADE80" },
                  }}
                >
                  Try BrainToDo for Free
                </Button>
                <Button
                  href="#features"
                  size="large"
                  variant="outlined"
                  sx={{
                    px: 3,
                    py: 1.25,
                    color: colors.text,
                    borderColor: colors.borderStrong,
                    fontWeight: 700,
                    textTransform: "none",
                    borderRadius: 2.2,
                    "&:hover": { borderColor: colors.cyan, bgcolor: alpha(colors.cyan, 0.08) },
                  }}
                >
                  Explore feature UI
                </Button>
              </Stack>

              <Stack direction="row" spacing={1.2} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 2.3 }}>
                <Typography variant="caption" sx={{ color: colors.muted, fontWeight: 650 }}>
                  No credit card required.
                </Typography>
                {["HR", "Sales", "Projects", "Field teams"].map((item) => (
                  <Chip key={item} size="small" label={item} sx={{ bgcolor: colors.panelSoft, color: colors.mutedStrong, border: `1px solid ${colors.border}`, fontWeight: 650 }} />
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <HeroProductPanel />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
        <Grid container spacing={2.5}>
          {featureCards.map(([title, copy], index) => (
            <Grid item xs={12} sm={6} md={4} key={title}>
              <Paper
                elevation={0}
                sx={{
                  height: "100%",
                  p: 2.3,
                  borderRadius: 3,
                  border: `1px solid ${colors.border}`,
                  bgcolor: colors.panel,
                }}
              >
                <Chip
                  size="small"
                  label={`0${index + 1}`}
                  sx={{ bgcolor: index % 2 ? alpha(colors.amber, 0.14) : alpha(colors.cyan, 0.14), color: index % 2 ? "#FCD34D" : "#BAE6FD", fontWeight: 700, mb: 1.5 }}
                />
                <Typography sx={{ fontWeight: 700, color: colors.text, mb: 1 }}>{title}</Typography>
                <Typography sx={{ color: colors.muted, lineHeight: 1.65 }}>{copy}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box id="features" component="section" sx={{ bgcolor: colors.band, py: { xs: 7, md: 10 }, borderBlock: `1px solid ${colors.border}` }}>
        <Container maxWidth="lg">
          <Stack spacing={1} sx={{ maxWidth: 760, mb: 3 }}>
            <Chip label="Feature UI preview" sx={{ width: "fit-content", bgcolor: alpha(colors.green, 0.14), color: "#BBF7D0", border: `1px solid ${alpha(colors.green, 0.24)}`, fontWeight: 700 }} />
            <Typography variant="h3" sx={{ fontWeight: 700, color: colors.text, letterSpacing: 0 }}>
              Explore every major BrainToDo feature by tab
            </Typography>
            <Typography sx={{ color: colors.muted, fontSize: 17, lineHeight: 1.65 }}>
              Visitors can quickly understand the system through focused UI previews before they open the application.
            </Typography>
          </Stack>

          <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${colors.borderStrong}`, overflow: "hidden", bgcolor: colors.panelDeep }}>
            <Tabs
              value={activeFeature}
              onChange={(_, value) => setActiveFeature(value)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                px: 1,
                borderBottom: `1px solid ${colors.border}`,
                "& .MuiTab-root": { minHeight: 58, fontWeight: 700, textTransform: "none", color: colors.muted },
                "& .Mui-selected": { color: colors.cyan },
                "& .MuiTabs-indicator": { bgcolor: colors.cyan },
              }}
            >
              {featureTabs.map((feature, index) => {
                const Icon = feature.icon;
                return <Tab key={feature.key} icon={<Icon fontSize="small" />} iconPosition="start" label={feature.label} value={index} />;
              })}
            </Tabs>

            <Grid container spacing={0}>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: { xs: 2.5, md: 3 }, height: "100%" }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: colors.text, mb: 1 }}>
                    {selectedFeature.title}
                  </Typography>
                  <Typography sx={{ color: colors.muted, lineHeight: 1.7, mb: 2.5 }}>
                    {selectedFeature.copy}
                  </Typography>
                  <Stack spacing={1}>
                    {selectedFeature.rows.map((row) => (
                      <Stack key={row} direction="row" spacing={1} alignItems="center">
                        <CheckCircleRounded sx={{ color: colors.green, fontSize: 20 }} />
                        <Typography sx={{ color: colors.mutedStrong, fontWeight: 600 }}>{row}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Box sx={{ p: { xs: 2, md: 3 } }}>
                  <FeatureMockup feature={selectedFeature} />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
        <Grid container spacing={2.5}>
          {workflow.map(([title, copy], index) => (
            <Grid item xs={12} sm={6} md={3} key={title}>
              <Paper elevation={0} sx={{ p: 2.3, height: "100%", borderRadius: 3, border: `1px solid ${colors.border}`, bgcolor: colors.panel }}>
                <Chip label={`0${index + 1}`} sx={{ bgcolor: index % 2 ? alpha(colors.amber, 0.14) : alpha(colors.cyan, 0.14), color: index % 2 ? "#FCD34D" : "#BAE6FD", fontWeight: 700, mb: 2 }} />
                <Typography sx={{ fontWeight: 700, fontSize: 22, mb: 1, color: colors.text }}>{title}</Typography>
                <Typography sx={{ color: colors.muted, lineHeight: 1.65 }}>{copy}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box component="section" sx={{ bgcolor: colors.panelDeep, color: colors.text, py: { xs: 7, md: 10 }, borderBlock: `1px solid ${colors.border}` }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip label="The Creator Of BrainToDo" sx={{ bgcolor: alpha(colors.cyan, 0.14), color: "#BAE6FD", border: `1px solid ${alpha(colors.cyan, 0.24)}`, fontWeight: 700, mb: 2 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: 0, mb: 2, color: colors.text }}>
                Hi, I&apos;m Mir Fahim Rahman
              </Typography>
              <Typography sx={{ color: colors.mutedStrong, fontSize: 17, lineHeight: 1.8, mb: 2 }}>
                With years of experience in <strong>Flutter, Laravel, and ReactJS</strong>, I built <strong>BrainToDo</strong> from the ground up, every module crafted with care, performance, and scalability in mind.
              </Typography>
              <Typography sx={{ color: colors.mutedStrong, fontSize: 17, lineHeight: 1.8, mb: 2 }}>
                I work <strong>one-to-one with every client</strong>, ensuring dedicated support, transparent communication, and results delivered exactly as promised.
              </Typography>
              <Typography sx={{ color: colors.text, fontSize: 18, lineHeight: 1.7, fontWeight: 700 }}>
                My commitment is simple: The system of BrainToDo will adapt to your business, office, and team management.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 1.2, md: 1.6 },
                  borderRadius: 4,
                  bgcolor: colors.panel,
                  border: `1px solid ${colors.borderStrong}`,
                  boxShadow: "0 28px 90px rgba(0, 0, 0, 0.28)",
                }}
              >
                <Box
                  component="img"
                  src={mirPoster}
                  alt="Mir Fahim Rahman, Creator of BrainToDo"
                  sx={{
                    display: "block",
                    width: "100%",
                    maxHeight: { xs: 520, md: 640 },
                    objectFit: "cover",
                    objectPosition: "center",
                    borderRadius: 3,
                  }}
                />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box component="section" sx={{ bgcolor: colors.bg, py: { xs: 7, md: 10 } }}>
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography variant="h3" sx={{ color: colors.text, fontWeight: 700, letterSpacing: 0 }}>
            Start managing your team with BrainToDo
          </Typography>
          <Typography sx={{ color: colors.muted, fontSize: 18, lineHeight: 1.65, mt: 1.5, mb: 3 }}>
            Give your office one system for people, tasks, leads, visits, permissions, and decisions.
          </Typography>
          <Button href={ctaUrl} size="large" variant="contained" endIcon={<ArrowForwardRounded />} sx={{ bgcolor: colors.green, color: "#052E16", fontWeight: 700, textTransform: "none", borderRadius: 2.2, px: 3, "&:hover": { bgcolor: "#4ADE80" } }}>
            Try BrainToDo for free
          </Button>
        </Container>
      </Box>

      <Divider sx={{ borderColor: colors.border }} />
      <Box component="footer" sx={{ bgcolor: colors.panelDeep, py: 3 }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1}>
            <Typography sx={{ color: colors.text, fontWeight: 700 }}>BrainToDo</Typography>
            <Typography sx={{ color: colors.muted }}>Built for practical business, office, and team management.</Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default BrainToDoLanding;
