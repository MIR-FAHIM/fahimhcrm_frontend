import { useMemo, useState } from "react";
import {
  Avatar,
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
  AddRounded,
  ArrowForwardRounded,
  AssessmentRounded,
  AutoAwesomeRounded,
  CalendarMonthRounded,
  CheckCircleRounded,
  DashboardRounded,
  DescriptionRounded,
  FilterListRounded,
  FolderRounded,
  GroupsRounded,
  NotificationsNoneRounded,
  RouteRounded,
  SearchRounded,
  SecurityRounded,
  SettingsRounded,
  TaskAltRounded,
  ViewKanbanRounded,
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
  bg: "#F8FBFF",
  softBg: "#EEF8FF",
  white: "#FFFFFF",
  navy: "#122247",
  text: "#111827",
  muted: "#667085",
  line: "#E5ECF3",
  blue: "#1296F3",
  blueSoft: "#E9F7FF",
  green: "#A9EFCB",
  greenText: "#12714B",
  peach: "#FFDBAA",
  peachText: "#9A4F05",
  purple: "#D8D7FF",
  purpleText: "#4B4AAE",
  cyan: "#B9EEFA",
  cyanText: "#08758B",
  pink: "#F5B8DD",
  pinkText: "#9A2E72",
};

const topModes = [
  ["Calendar planner", CalendarMonthRounded],
  ["Task list", TaskAltRounded],
  ["Kanban board", ViewKanbanRounded],
  ["Projects", FolderRounded],
  ["Notes", DescriptionRounded],
];

const plannerDays = [
  {
    name: "9 Mon",
    total: "8h 15m",
    cards: [
      ["Analyze last week's results", "0:30h", colors.softBg, colors.muted],
      ["Discuss website translation requirements", "10:00 - 10:45", colors.softBg, colors.muted],
      ["Make a content marketing plan", "4:00h", colors.softBg, colors.muted],
    ],
  },
  {
    name: "10 Tue",
    total: "7h 0m",
    active: true,
    cards: [
      ["Negotiate contract terms with John", "12:30 - 14:00", colors.peach, colors.peachText],
      ["Prepare webinar notes and pass it to Sofia", "3:00h", colors.green, colors.greenText],
      ["Get ready for the executive meeting", "1:30h", "#B8E3FF", "#0B67A3"],
    ],
  },
  {
    name: "11 Wed",
    total: "6h 30m",
    cards: [
      ["Executive meeting", "9:30 - 11:00", colors.purple, colors.purpleText],
      ["Check resumes and test assignments", "2:30h", colors.cyan, colors.cyanText],
      ["Discuss design drafts and decide", "13:00 - 14:30", colors.peach, colors.peachText],
    ],
  },
  {
    name: "12 Thu",
    total: "5h 0m",
    cards: [
      ["1-to-1 with Sofia", "9:00 - 10:00", colors.peach, colors.peachText],
      ["Analyze ROI of marketing campaigns", "3:00h", colors.pink, colors.pinkText],
      ["Weekly performance review", "16:00", colors.purple, colors.purpleText],
    ],
  },
];

const waitingTasks = [
  ["Write an email announcement for the new release", "Employee Training", colors.green],
  ["Publish article: Marketing trends this year", "Blog Post Writing", "#B8E3FF"],
  ["Send campaign introducing CRM", "Employee Training", colors.green],
  ["Check translation provided by agency", "Website Translation", colors.cyan],
];

const featureTabs = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: DashboardRounded,
    image: departmentImage,
    title: "Executive Dashboard",
    copy: "See attendance, tasks, leads, field visits, and team activity from one command center.",
    rows: ["Daily attendance summary", "Task workload by department", "Lead conversion overview"],
  },
  {
    key: "tasks",
    label: "Tasks",
    icon: TaskAltRounded,
    image: allTaskImage,
    title: "Task Management",
    copy: "Plan, assign, prioritize, follow up, and review work without scattered messages.",
    rows: ["Assign tasks with project and phase", "Track task status by department", "Attach updates, images, and reports"],
  },
  {
    key: "attendance",
    label: "Attendance",
    icon: CalendarMonthRounded,
    image: attendanceImage,
    title: "Attendance & Leave",
    copy: "Manage check-in, check-out, early leave, leave approvals, and employee reports.",
    rows: ["Office hour based attendance", "Late and early leave tracking", "Approval-ready leave management"],
  },
  {
    key: "leads",
    label: "Leads",
    icon: GroupsRounded,
    image: leadImage,
    title: "Lead & Prospect CRM",
    copy: "Capture prospects, stage pipelines, contact people, visits, and sales opportunities.",
    rows: ["Stage-wise prospect board", "Contact person history", "Source-wise prospect reporting"],
  },
  {
    key: "fieldforce",
    label: "Field Force",
    icon: RouteRounded,
    image: fieldForceImage,
    title: "Field Force Visits",
    copy: "Plan visits, track field employees, and understand date-wise customer activity.",
    rows: ["Visit planner and schedule", "Employee-wise visit history", "Map based customer routes"],
  },
  {
    key: "permissions",
    label: "Permissions",
    icon: SecurityRounded,
    image: departmentImage,
    title: "Role & User Permissions",
    copy: "Control feature access by role or user with clear grouped permission views.",
    rows: ["Role-wise permission management", "User-specific feature control", "Grouped modules for safer admin work"],
  },
  {
    key: "reports",
    label: "Reports",
    icon: AssessmentRounded,
    image: reportImage,
    title: "Reports & Insights",
    copy: "Turn daily work, attendance, visits, and prospects into clear operational reports.",
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

const PlannerCard = ({ title, meta, bg, color }) => (
  <Box
    sx={{
      p: 1.4,
      borderRadius: 1.4,
      bgcolor: bg,
      color,
      minHeight: 74,
      boxShadow: `inset 0 0 0 1px ${alpha("#FFFFFF", 0.35)}`,
    }}
  >
    <Typography sx={{ fontWeight: 800, fontSize: 13, lineHeight: 1.25, color: colors.text }}>
      {title}
    </Typography>
    <Typography sx={{ mt: 0.6, fontWeight: 750, fontSize: 12, color }}>
      {meta}
    </Typography>
  </Box>
);

const PillModeNav = () => (
  <Paper
    elevation={0}
    sx={{
      width: "fit-content",
      maxWidth: "100%",
      mx: "auto",
      mb: { xs: 3, md: 4 },
      p: 0.6,
      borderRadius: 2,
      bgcolor: "#F2F7FC",
      border: `1px solid ${colors.line}`,
      overflowX: "auto",
    }}
  >
    <Stack direction="row" spacing={0.4} sx={{ minWidth: { xs: 620, md: "auto" } }}>
      {topModes.map(([label, Icon], index) => (
        <Button
          key={label}
          startIcon={<Icon />}
          sx={{
            px: 2.3,
            py: 1.05,
            borderRadius: 1.3,
            color: index === 0 ? colors.text : colors.muted,
            bgcolor: index === 0 ? colors.white : "transparent",
            textTransform: "none",
            fontWeight: 850,
            boxShadow: index === 0 ? "0 8px 18px rgba(15, 23, 42, 0.1)" : "none",
            whiteSpace: "nowrap",
            "&:hover": { bgcolor: colors.white },
          }}
        >
          {label}
        </Button>
      ))}
    </Stack>
  </Paper>
);

const SidebarLine = ({ active, children }) => (
  <Box
    sx={{
      px: 1.1,
      py: 0.75,
      borderRadius: 1,
      color: active ? colors.white : alpha(colors.white, 0.78),
      bgcolor: active ? alpha("#FFFFFF", 0.16) : "transparent",
      fontWeight: 750,
      fontSize: 12,
    }}
  >
    {children}
  </Box>
);

const PlannerMockup = () => (
  <Box sx={{ position: "relative", mt: { xs: 3, md: 4 } }}>
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2.8,
        bgcolor: colors.white,
        border: `1px solid ${colors.line}`,
        boxShadow: "0 30px 90px rgba(31, 70, 112, 0.16)",
        overflow: "hidden",
      }}
    >
      <Grid container sx={{ minHeight: { xs: 560, md: 650 } }}>
        <Grid item xs={12} md={2.1} sx={{ display: { xs: "none", md: "block" }, bgcolor: colors.navy }}>
          <Stack spacing={1.2} sx={{ p: 1.6, height: "100%" }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ pb: 1.5, borderBottom: `1px solid ${alpha("#FFFFFF", 0.16)}` }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: colors.white, color: colors.navy, fontSize: 14, fontWeight: 900 }}>B</Avatar>
              <Typography sx={{ color: colors.white, fontWeight: 850, fontSize: 13 }}>BrainToDo</Typography>
            </Stack>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, color: alpha(colors.white, 0.55), fontSize: 12, py: 0.8 }}>
              <SearchRounded sx={{ fontSize: 16 }} />
              Search...
            </Box>
            <SidebarLine active>My work</SidebarLine>
            <Typography sx={{ color: alpha(colors.white, 0.5), fontWeight: 850, fontSize: 12, pt: 1 }}>Teams</Typography>
            <SidebarLine active>Marketing</SidebarLine>
            <SidebarLine>Design</SidebarLine>
            <SidebarLine>Development</SidebarLine>
            <Typography sx={{ color: alpha(colors.white, 0.5), fontWeight: 850, fontSize: 12, pt: 1 }}>Projects</Typography>
            {["Website Development", "Sales Funnel", "Mobile App", "CRM Integration", "Field Visit"].map((item) => (
              <SidebarLine key={item}>{item}</SidebarLine>
            ))}
            <Box sx={{ flexGrow: 1 }} />
            <Button sx={{ bgcolor: alpha("#FFFFFF", 0.13), color: colors.white, borderRadius: 4, textTransform: "none", fontWeight: 850 }}>
              Invite people
            </Button>
          </Stack>
        </Grid>

        <Grid item xs={12} md={9.9}>
          <Box sx={{ height: "100%", display: "flex", minWidth: 0 }}>
            <Box sx={{ display: { xs: "none", md: "flex" }, width: 54, bgcolor: "#F8FBFF", borderRight: `1px solid ${colors.line}`, alignItems: "center", flexDirection: "column", py: 2, gap: 1.2 }}>
              {[CalendarMonthRounded, TaskAltRounded, GroupsRounded, SettingsRounded].map((Icon, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 1.2,
                    display: "grid",
                    placeItems: "center",
                    color: index === 0 ? colors.blue : colors.muted,
                    bgcolor: index === 0 ? colors.blueSoft : "transparent",
                    border: index === 0 ? `1px solid ${alpha(colors.blue, 0.2)}` : "none",
                  }}
                >
                  <Icon sx={{ fontSize: 19 }} />
                </Box>
              ))}
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
                sx={{ px: { xs: 1.5, md: 2 }, py: 1.5, borderBottom: `1px solid ${colors.line}` }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button startIcon={<AddRounded />} sx={{ bgcolor: colors.blue, color: colors.white, borderRadius: 5, textTransform: "none", fontWeight: 850, "&:hover": { bgcolor: "#0583D8" } }}>
                    Add new
                  </Button>
                  <Chip label="Today" sx={{ bgcolor: "#F2F7FC", fontWeight: 800, color: colors.text }} />
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: "none", md: "flex" } }}>
                  <Chip icon={<DashboardRounded />} label="Group by responsible" sx={{ bgcolor: colors.blueSoft, color: colors.text, fontWeight: 800 }} />
                  <Chip icon={<FilterListRounded />} label="Filter" sx={{ bgcolor: "#F7F9FC", color: colors.text, fontWeight: 800 }} />
                  <Stack direction="row" spacing={-0.8}>
                    {["#F97316", "#8B5CF6", "#22C55E", "#0EA5E9"].map((bg, index) => (
                      <Avatar key={bg} sx={{ width: 28, height: 28, bgcolor: bg, border: `2px solid ${colors.white}`, fontSize: 12 }}>{index + 1}</Avatar>
                    ))}
                  </Stack>
                  <NotificationsNoneRounded sx={{ color: colors.muted }} />
                </Stack>
              </Stack>

              <Box sx={{ p: { xs: 1.4, md: 2 }, overflowX: "auto" }}>
                <Stack direction="row" spacing={1} sx={{ minWidth: { xs: 720, md: 850 } }}>
                  <Box sx={{ flex: 1.3 }}>
                    <Typography sx={{ color: colors.muted, fontSize: 12, mb: 1 }}>April</Typography>
                    <Grid container columns={4} sx={{ borderTop: `1px solid ${colors.line}`, borderLeft: `1px solid ${colors.line}` }}>
                      {plannerDays.map((day) => (
                        <Grid item xs={1} key={day.name} sx={{ minHeight: 504, borderRight: `1px solid ${colors.line}`, borderBottom: `1px solid ${colors.line}` }}>
                          <Box sx={{ px: 1, py: 1, borderBottom: `1px solid ${colors.line}`, textAlign: "center", position: "relative" }}>
                            <Typography sx={{ fontWeight: 850, fontSize: 13, color: colors.text }}>{day.name}</Typography>
                            {day.active && <Box sx={{ position: "absolute", left: "28%", right: "28%", bottom: -1, height: 3, bgcolor: colors.blue, borderRadius: 4 }} />}
                          </Box>
                          <Stack spacing={1.1} sx={{ p: 1 }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                              <Typography sx={{ fontWeight: 850, color: colors.text, fontSize: 12 }}>Marry Williams</Typography>
                              <Typography sx={{ color: colors.muted, fontSize: 12 }}>{day.total}</Typography>
                            </Stack>
                            {day.cards.map(([title, meta, bg, color]) => (
                              <PlannerCard key={title} title={title} meta={meta} bg={bg} color={color} />
                            ))}
                          </Stack>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>

                  <Box sx={{ width: 228, display: { xs: "none", lg: "block" } }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography sx={{ fontWeight: 850, color: colors.text }}>Waiting list</Typography>
                      <Chip label="8" size="small" sx={{ bgcolor: "#EEF3F8", color: colors.muted, fontWeight: 850 }} />
                    </Stack>
                    <Stack spacing={1}>
                      {waitingTasks.map(([title, project, bg]) => (
                        <Box key={title} sx={{ p: 1.3, borderRadius: 1.4, bgcolor: bg, minHeight: 92 }}>
                          <Typography sx={{ color: colors.text, fontWeight: 850, fontSize: 13, lineHeight: 1.25 }}>{title}</Typography>
                          <Typography sx={{ color: colors.muted, fontWeight: 750, fontSize: 12, mt: 1 }}>{project}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>

    <Paper
      elevation={0}
      sx={{
        display: { xs: "none", md: "block" },
        position: "absolute",
        right: { md: 34, lg: 120 },
        bottom: -34,
        width: 244,
        height: 430,
        borderRadius: 5,
        bgcolor: "#101418",
        p: 1.2,
        boxShadow: "0 22px 60px rgba(15, 23, 42, 0.25)",
      }}
    >
      <Box sx={{ height: "100%", bgcolor: colors.white, borderRadius: 4, overflow: "hidden", p: 1.4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography sx={{ fontWeight: 900, color: colors.text, fontSize: 12 }}>Marketing</Typography>
          <Typography sx={{ color: colors.muted, fontWeight: 850, fontSize: 11 }}>9:41</Typography>
        </Stack>
        <Stack direction="row" spacing={1} justifyContent="space-between" sx={{ mt: 2, color: colors.muted }}>
          {["M", "T", "W", "T", "F"].map((day, index) => (
            <Box key={`${day}-${index}`} sx={{ width: 28, height: 28, display: "grid", placeItems: "center", borderRadius: "50%", bgcolor: index === 1 ? colors.blue : "transparent", color: index === 1 ? colors.white : colors.muted, fontWeight: 900, fontSize: 11 }}>
              {index === 1 ? "10" : day}
            </Box>
          ))}
        </Stack>
        <Stack spacing={1.1} sx={{ mt: 2 }}>
          {plannerDays[1].cards.map(([title, meta, bg, color]) => (
            <PlannerCard key={title} title={title} meta={meta} bg={bg} color={color} />
          ))}
        </Stack>
        <Box sx={{ position: "absolute", right: 22, bottom: 24, width: 36, height: 36, borderRadius: "50%", bgcolor: colors.blue, color: colors.white, display: "grid", placeItems: "center" }}>
          <AddRounded />
        </Box>
      </Box>
    </Paper>
  </Box>
);

const FeatureMockup = ({ feature }) => {
  const Icon = feature.icon;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2.6,
        border: `1px solid ${colors.line}`,
        overflow: "hidden",
        bgcolor: colors.white,
        boxShadow: "0 18px 50px rgba(31, 70, 112, 0.1)",
      }}
    >
      <Box sx={{ px: 2, py: 1.4, bgcolor: "#F7FBFF", color: colors.text, display: "flex", alignItems: "center", gap: 1, borderBottom: `1px solid ${colors.line}` }}>
        <Icon fontSize="small" sx={{ color: colors.blue }} />
        <Typography fontWeight={900}>{feature.title}</Typography>
      </Box>
      <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>
        <Box
          component="img"
          src={feature.image}
          alt={`${feature.title} UI preview`}
          sx={{
            display: "block",
            width: "100%",
            height: { xs: 240, md: 360 },
            objectFit: "cover",
            objectPosition: "top left",
            borderRadius: 2,
            border: `1px solid ${colors.line}`,
          }}
        />
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
          zIndex: 20,
          bgcolor: "rgba(255, 255, 255, 0.86)",
          backdropFilter: "blur(18px)",
          borderBottom: `1px solid ${colors.line}`,
        }}
      >
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1.35 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: colors.blue, color: colors.white, display: "grid", placeItems: "center", fontWeight: 950 }}>
                B
              </Box>
              <Typography sx={{ fontWeight: 950, fontSize: 20, color: colors.text }}>BrainToDo</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button href="#features" sx={{ display: { xs: "none", sm: "inline-flex" }, color: colors.muted, fontWeight: 850, textTransform: "none" }}>
                Features
              </Button>
              <Button href="#creator" sx={{ display: { xs: "none", md: "inline-flex" }, color: colors.muted, fontWeight: 850, textTransform: "none" }}>
                Creator
              </Button>
              <Button href={ctaUrl} variant="contained" endIcon={<ArrowForwardRounded />} sx={{ bgcolor: colors.blue, color: colors.white, fontWeight: 900, textTransform: "none", borderRadius: 2, boxShadow: "0 10px 24px rgba(18,150,243,0.22)", "&:hover": { bgcolor: "#0583D8" } }}>
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
          background: `
            radial-gradient(circle at 8% 45%, rgba(169, 239, 203, 0.34), transparent 28%),
            radial-gradient(circle at 92% 38%, rgba(185, 238, 250, 0.42), transparent 30%),
            linear-gradient(180deg, #FFFFFF 0%, #F8FBFF 58%, #F3FAFF 100%)
          `,
          borderBottom: `1px solid ${colors.line}`,
        }}
      >
        <Container maxWidth="xl" sx={{ pt: { xs: 7, md: 9 }, pb: { xs: 8, md: 11 } }}>
          <Stack alignItems="center" textAlign="center" sx={{ maxWidth: 860, mx: "auto" }}>
            <Chip
              icon={<AutoAwesomeRounded />}
              label="Work management for HRM, CRM, task, and field teams"
              sx={{
                bgcolor: colors.blueSoft,
                color: colors.blue,
                border: `1px solid ${alpha(colors.blue, 0.14)}`,
                fontWeight: 900,
                mb: 2.2,
              }}
            />
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: 42, sm: 58, md: 76 },
                lineHeight: 1.02,
                fontWeight: 950,
                letterSpacing: 0,
                color: colors.text,
                maxWidth: 860,
              }}
            >
              Work management platform for result-driven teams
            </Typography>
            <Typography
              sx={{
                mt: 2,
                maxWidth: 690,
                color: colors.muted,
                fontSize: { xs: 17, md: 21 },
                lineHeight: 1.55,
                fontWeight: 700,
              }}
            >
              BrainToDo helps teams plan people ops, track sales, manage tasks, coordinate visits, and understand progress from one clean workspace.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.4} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="center" sx={{ mt: 3.4 }}>
              <Button
                href={ctaUrl}
                size="large"
                variant="contained"
                endIcon={<ArrowForwardRounded />}
                sx={{
                  px: 3,
                  py: 1.25,
                  textTransform: "none",
                  fontWeight: 950,
                  bgcolor: colors.blue,
                  color: colors.white,
                  borderRadius: 2.2,
                  boxShadow: "0 16px 32px rgba(18,150,243,0.24)",
                  "&:hover": { bgcolor: "#0583D8" },
                }}
              >
                Try BrainToDo for Free
              </Button>
              <Typography variant="caption" sx={{ color: colors.muted, fontWeight: 800, alignSelf: "center" }}>
                No credit card required.
              </Typography>
            </Stack>
          </Stack>

          <Box sx={{ mt: { xs: 5, md: 6 } }}>
            <PillModeNav />
            <PlannerMockup />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 9 } }}>
        <Grid container spacing={2.5}>
          {featureCards.map(([title, copy], index) => (
            <Grid item xs={12} sm={6} md={4} key={title}>
              <Paper
                elevation={0}
                sx={{
                  height: "100%",
                  p: 2.3,
                  borderRadius: 2.2,
                  border: `1px solid ${colors.line}`,
                  bgcolor: colors.white,
                  boxShadow: "0 14px 34px rgba(31, 70, 112, 0.06)",
                }}
              >
                <Chip
                  size="small"
                  label={`0${index + 1}`}
                  sx={{
                    bgcolor: index % 2 ? colors.peach : colors.blueSoft,
                    color: index % 2 ? colors.peachText : colors.blue,
                    fontWeight: 950,
                    mb: 1.5,
                  }}
                />
                <Typography sx={{ fontWeight: 950, color: colors.text, mb: 1 }}>{title}</Typography>
                <Typography sx={{ color: colors.muted, lineHeight: 1.65, fontWeight: 650 }}>{copy}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box id="features" component="section" sx={{ bgcolor: colors.softBg, py: { xs: 7, md: 10 }, borderBlock: `1px solid ${colors.line}` }}>
        <Container maxWidth="lg">
          <Stack spacing={1} sx={{ maxWidth: 760, mb: 3 }}>
            <Chip label="Feature UI preview" sx={{ width: "fit-content", bgcolor: colors.white, color: colors.blue, border: `1px solid ${colors.line}`, fontWeight: 950 }} />
            <Typography variant="h3" sx={{ fontWeight: 950, color: colors.text, letterSpacing: 0 }}>
              Explore every major BrainToDo feature by tab
            </Typography>
            <Typography sx={{ color: colors.muted, fontSize: 17, lineHeight: 1.65, fontWeight: 650 }}>
              Visitors can quickly understand the system through focused UI previews before they open the application.
            </Typography>
          </Stack>

          <Paper elevation={0} sx={{ borderRadius: 2.5, border: `1px solid ${colors.line}`, overflow: "hidden", bgcolor: colors.white, boxShadow: "0 18px 50px rgba(31, 70, 112, 0.08)" }}>
            <Tabs
              value={activeFeature}
              onChange={(_, value) => setActiveFeature(value)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                px: 1,
                borderBottom: `1px solid ${colors.line}`,
                "& .MuiTab-root": { minHeight: 58, fontWeight: 900, textTransform: "none", color: colors.muted },
                "& .Mui-selected": { color: colors.blue },
                "& .MuiTabs-indicator": { bgcolor: colors.blue },
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
                  <Typography variant="h4" sx={{ fontWeight: 950, color: colors.text, mb: 1 }}>
                    {selectedFeature.title}
                  </Typography>
                  <Typography sx={{ color: colors.muted, lineHeight: 1.7, mb: 2.5, fontWeight: 650 }}>
                    {selectedFeature.copy}
                  </Typography>
                  <Stack spacing={1}>
                    {selectedFeature.rows.map((row) => (
                      <Stack key={row} direction="row" spacing={1} alignItems="center">
                        <CheckCircleRounded sx={{ color: colors.greenText, fontSize: 20 }} />
                        <Typography sx={{ color: colors.text, fontWeight: 800 }}>{row}</Typography>
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

      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 9 } }}>
        <Grid container spacing={2.5}>
          {workflow.map(([title, copy], index) => (
            <Grid item xs={12} sm={6} md={3} key={title}>
              <Paper elevation={0} sx={{ p: 2.3, height: "100%", borderRadius: 2.2, border: `1px solid ${colors.line}`, bgcolor: colors.white }}>
                <Chip label={`0${index + 1}`} sx={{ bgcolor: index % 2 ? colors.peach : colors.blueSoft, color: index % 2 ? colors.peachText : colors.blue, fontWeight: 950, mb: 2 }} />
                <Typography sx={{ fontWeight: 950, fontSize: 22, mb: 1, color: colors.text }}>{title}</Typography>
                <Typography sx={{ color: colors.muted, lineHeight: 1.65, fontWeight: 650 }}>{copy}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box id="creator" component="section" sx={{ bgcolor: colors.white, color: colors.text, py: { xs: 7, md: 10 }, borderBlock: `1px solid ${colors.line}` }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip label="The Creator Of BrainToDo" sx={{ bgcolor: colors.blueSoft, color: colors.blue, border: `1px solid ${alpha(colors.blue, 0.14)}`, fontWeight: 950, mb: 2 }} />
              <Typography variant="h3" sx={{ fontWeight: 950, letterSpacing: 0, mb: 2, color: colors.text }}>
                Hi, I&apos;m Mir Fahim Rahman
              </Typography>
              <Typography sx={{ color: colors.muted, fontSize: 17, lineHeight: 1.8, mb: 2, fontWeight: 650 }}>
                With years of experience in <strong>Flutter, Laravel, and ReactJS</strong>, I built <strong>BrainToDo</strong> from the ground up, every module crafted with care, performance, and scalability in mind.
              </Typography>
              <Typography sx={{ color: colors.muted, fontSize: 17, lineHeight: 1.8, mb: 2, fontWeight: 650 }}>
                I work <strong>one-to-one with every client</strong>, ensuring dedicated support, transparent communication, and results delivered exactly as promised.
              </Typography>
              <Typography sx={{ color: colors.text, fontSize: 18, lineHeight: 1.7, fontWeight: 900 }}>
                My commitment is simple: The system of BrainToDo will adapt to your business, office, and team management.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 1.2, md: 1.6 },
                  borderRadius: 2.8,
                  bgcolor: colors.softBg,
                  border: `1px solid ${colors.line}`,
                  boxShadow: "0 22px 60px rgba(31, 70, 112, 0.1)",
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
                    borderRadius: 2.2,
                  }}
                />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box component="section" sx={{ bgcolor: colors.bg, py: { xs: 7, md: 10 } }}>
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography variant="h3" sx={{ color: colors.text, fontWeight: 950, letterSpacing: 0 }}>
            Start managing your team with BrainToDo
          </Typography>
          <Typography sx={{ color: colors.muted, fontSize: 18, lineHeight: 1.65, mt: 1.5, mb: 3, fontWeight: 650 }}>
            Give your office one system for people, tasks, leads, visits, permissions, and decisions.
          </Typography>
          <Button href={ctaUrl} size="large" variant="contained" endIcon={<ArrowForwardRounded />} sx={{ bgcolor: colors.blue, color: colors.white, fontWeight: 950, textTransform: "none", borderRadius: 2.2, px: 3, "&:hover": { bgcolor: "#0583D8" } }}>
            Try BrainToDo for free
          </Button>
        </Container>
      </Box>

      <Divider sx={{ borderColor: colors.line }} />
      <Box component="footer" sx={{ bgcolor: colors.white, py: 3 }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1}>
            <Typography sx={{ color: colors.text, fontWeight: 950 }}>BrainToDo</Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 0.75, sm: 2 }} alignItems={{ xs: "flex-start", sm: "center" }}>
              <Typography sx={{ color: colors.muted, fontWeight: 650 }}>Built for practical business, office, and team management.</Typography>
              <Button href="/privacy-policy" sx={{ color: colors.blue, p: 0, minWidth: 0, textTransform: "none", fontWeight: 900 }}>
                Privacy Policy
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default BrainToDoLanding;
