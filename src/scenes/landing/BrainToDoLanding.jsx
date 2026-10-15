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
  bg: "#F8FAFC",
  softBg: "#F1F5F9",
  white: "#FFFFFF",
  navy: "#0F172A",
  text: "#0F172A",
  muted: "#475569",
  line: "#E2E8F0",
  blue: "#0284C7",
  blueSoft: "#E0F2FE",
  green: "#DCFCE7",
  greenText: "#15803D",
  peach: "#FFEDD5",
  peachText: "#C2410C",
  purple: "#EDE9FE",
  purpleText: "#6D28D9",
  cyan: "#CFFAFE",
  cyanText: "#0E7490",
  pink: "#FCE7F3",
  pinkText: "#BE185D",
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
      boxShadow: `inset 0 0 0 1px ${alpha("#FFFFFF", 0.4)}`,
    }}
  >
    <Typography sx={{ fontWeight: 700, fontSize: 13, lineHeight: 1.3, color: colors.text, letterSpacing: "-0.015em" }}>
      {title}
    </Typography>
    <Typography sx={{ mt: 0.6, fontWeight: 600, fontSize: 12, color, letterSpacing: "-0.01em" }}>
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
      borderRadius: 2.5,
      bgcolor: "#F1F5F9",
      border: `1px solid ${colors.line}`,
      overflowX: "auto",
    }}
  >
    <Stack direction="row" spacing={0.4} sx={{ minWidth: { xs: 620, md: "auto" } }}>
      {topModes.map(([label, Icon], index) => (
        <Button
          key={label}
          startIcon={<Icon sx={{ fontSize: 18 }} />}
          sx={{
            px: 2.2,
            py: 1,
            borderRadius: 1.8,
            color: index === 0 ? colors.text : colors.muted,
            bgcolor: index === 0 ? colors.white : "transparent",
            textTransform: "none",
            fontWeight: index === 0 ? 700 : 600,
            fontSize: 13.5,
            letterSpacing: "-0.01em",
            boxShadow: index === 0 ? "0 4px 12px rgba(15, 23, 42, 0.08)" : "none",
            whiteSpace: "nowrap",
            "&:hover": { bgcolor: index === 0 ? colors.white : alpha(colors.white, 0.6) },
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
      px: 1.2,
      py: 0.75,
      borderRadius: 1.2,
      color: active ? colors.white : alpha(colors.white, 0.7),
      bgcolor: active ? alpha("#FFFFFF", 0.14) : "transparent",
      fontWeight: active ? 600 : 500,
      fontSize: 12.5,
      letterSpacing: "-0.01em",
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
        boxShadow: "0 25px 80px rgba(15, 23, 42, 0.12)",
        overflow: "hidden",
      }}
    >
      <Grid container sx={{ minHeight: { xs: 560, md: 650 } }}>
        <Grid item xs={12} md={2.1} sx={{ display: { xs: "none", md: "block" }, bgcolor: colors.navy }}>
          <Stack spacing={1.2} sx={{ p: 1.6, height: "100%" }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ pb: 1.5, borderBottom: `1px solid ${alpha("#FFFFFF", 0.14)}` }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: colors.white, color: colors.navy, fontSize: 13.5, fontWeight: 800 }}>B</Avatar>
              <Typography sx={{ color: colors.white, fontWeight: 700, fontSize: 13.5, letterSpacing: "-0.02em" }}>BrainToDo</Typography>
            </Stack>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, color: alpha(colors.white, 0.5), fontSize: 12, py: 0.8, fontWeight: 500 }}>
              <SearchRounded sx={{ fontSize: 16 }} />
              Search...
            </Box>
            <SidebarLine active>My work</SidebarLine>
            <Typography sx={{ color: alpha(colors.white, 0.45), fontWeight: 600, fontSize: 11.5, letterSpacing: "0.04em", textTransform: "uppercase", pt: 1 }}>Teams</Typography>
            <SidebarLine active>Marketing</SidebarLine>
            <SidebarLine>Design</SidebarLine>
            <SidebarLine>Development</SidebarLine>
            <Typography sx={{ color: alpha(colors.white, 0.45), fontWeight: 600, fontSize: 11.5, letterSpacing: "0.04em", textTransform: "uppercase", pt: 1 }}>Projects</Typography>
            {["Website Development", "Sales Funnel", "Mobile App", "CRM Integration", "Field Visit"].map((item) => (
              <SidebarLine key={item}>{item}</SidebarLine>
            ))}
            <Box sx={{ flexGrow: 1 }} />
            <Button sx={{ bgcolor: alpha("#FFFFFF", 0.12), color: colors.white, borderRadius: 3, textTransform: "none", fontWeight: 600, fontSize: 12.5, "&:hover": { bgcolor: alpha("#FFFFFF", 0.18) } }}>
              Invite people
            </Button>
          </Stack>
        </Grid>

        <Grid item xs={12} md={9.9}>
          <Box sx={{ height: "100%", display: "flex", minWidth: 0 }}>
            <Box sx={{ display: { xs: "none", md: "flex" }, width: 54, bgcolor: "#F8FAFC", borderRight: `1px solid ${colors.line}`, alignItems: "center", flexDirection: "column", py: 2, gap: 1.2 }}>
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
                  <Button startIcon={<AddRounded />} sx={{ bgcolor: colors.blue, color: colors.white, borderRadius: 5, textTransform: "none", fontWeight: 600, fontSize: 13, px: 2, "&:hover": { bgcolor: "#0369A1" } }}>
                    Add new
                  </Button>
                  <Chip label="Today" sx={{ bgcolor: "#F1F5F9", fontWeight: 600, fontSize: 12.5, color: colors.text }} />
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: "none", md: "flex" } }}>
                  <Chip icon={<DashboardRounded />} label="Group by responsible" sx={{ bgcolor: colors.blueSoft, color: colors.text, fontWeight: 600, fontSize: 12 }} />
                  <Chip icon={<FilterListRounded />} label="Filter" sx={{ bgcolor: "#F8FAFC", color: colors.text, fontWeight: 600, fontSize: 12 }} />
                  <Stack direction="row" spacing={-0.8}>
                    {["#F97316", "#8B5CF6", "#22C55E", "#0EA5E9"].map((bg, index) => (
                      <Avatar key={bg} sx={{ width: 28, height: 28, bgcolor: bg, border: `2px solid ${colors.white}`, fontSize: 11, fontWeight: 600 }}>{index + 1}</Avatar>
                    ))}
                  </Stack>
                  <NotificationsNoneRounded sx={{ color: colors.muted }} />
                </Stack>
              </Stack>

              <Box sx={{ p: { xs: 1.4, md: 2 }, overflowX: "auto" }}>
                <Stack direction="row" spacing={1} sx={{ minWidth: { xs: 720, md: 850 } }}>
                  <Box sx={{ flex: 1.3 }}>
                    <Typography sx={{ color: colors.muted, fontSize: 12, fontWeight: 500, mb: 1 }}>April</Typography>
                    <Grid container columns={4} sx={{ borderTop: `1px solid ${colors.line}`, borderLeft: `1px solid ${colors.line}` }}>
                      {plannerDays.map((day) => (
                        <Grid item xs={1} key={day.name} sx={{ minHeight: 504, borderRight: `1px solid ${colors.line}`, borderBottom: `1px solid ${colors.line}` }}>
                          <Box sx={{ px: 1, py: 1, borderBottom: `1px solid ${colors.line}`, textAlign: "center", position: "relative" }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 13, color: colors.text, letterSpacing: "-0.015em" }}>{day.name}</Typography>
                            {day.active && <Box sx={{ position: "absolute", left: "28%", right: "28%", bottom: -1, height: 3, bgcolor: colors.blue, borderRadius: 4 }} />}
                          </Box>
                          <Stack spacing={1.1} sx={{ p: 1 }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                              <Typography sx={{ fontWeight: 600, color: colors.text, fontSize: 12 }}>Marry Williams</Typography>
                              <Typography sx={{ color: colors.muted, fontSize: 11.5, fontWeight: 500 }}>{day.total}</Typography>
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
                      <Typography sx={{ fontWeight: 700, fontSize: 13.5, color: colors.text, letterSpacing: "-0.015em" }}>Waiting list</Typography>
                      <Chip label="8" size="small" sx={{ bgcolor: "#F1F5F9", color: colors.muted, fontWeight: 700, fontSize: 11.5 }} />
                    </Stack>
                    <Stack spacing={1}>
                      {waitingTasks.map(([title, project, bg]) => (
                        <Box key={title} sx={{ p: 1.3, borderRadius: 1.4, bgcolor: bg, minHeight: 92 }}>
                          <Typography sx={{ color: colors.text, fontWeight: 700, fontSize: 12.5, lineHeight: 1.3, letterSpacing: "-0.01em" }}>{title}</Typography>
                          <Typography sx={{ color: colors.muted, fontWeight: 500, fontSize: 11.5, mt: 1 }}>{project}</Typography>
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
        bgcolor: "#0F172A",
        p: 1.2,
        boxShadow: "0 20px 50px rgba(15, 23, 42, 0.25)",
      }}
    >
      <Box sx={{ height: "100%", bgcolor: colors.white, borderRadius: 4, overflow: "hidden", p: 1.4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography sx={{ fontWeight: 700, color: colors.text, fontSize: 12, letterSpacing: "-0.01em" }}>Marketing</Typography>
          <Typography sx={{ color: colors.muted, fontWeight: 600, fontSize: 11 }}>9:41</Typography>
        </Stack>
        <Stack direction="row" spacing={1} justifyContent="space-between" sx={{ mt: 2, color: colors.muted }}>
          {["M", "T", "W", "T", "F"].map((day, index) => (
            <Box key={`${day}-${index}`} sx={{ width: 28, height: 28, display: "grid", placeItems: "center", borderRadius: "50%", bgcolor: index === 1 ? colors.blue : "transparent", color: index === 1 ? colors.white : colors.muted, fontWeight: 700, fontSize: 11 }}>
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
        boxShadow: "0 18px 50px rgba(15, 23, 42, 0.06)",
      }}
    >
      <Box sx={{ px: 2, py: 1.4, bgcolor: "#F8FAFC", color: colors.text, display: "flex", alignItems: "center", gap: 1, borderBottom: `1px solid ${colors.line}` }}>
        <Icon fontSize="small" sx={{ color: colors.blue }} />
        <Typography fontWeight={700} fontSize={14} letterSpacing="-0.015em">{feature.title}</Typography>
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
          bgcolor: "rgba(255, 255, 255, 0.88)",
          backdropFilter: "blur(16px)",
          borderBottom: `1px solid ${colors.line}`,
        }}
      >
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1.35 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: colors.blue, color: colors.white, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 18 }}>
                B
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: 20, color: colors.text, letterSpacing: "-0.03em" }}>BrainToDo</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button href="#features" sx={{ display: { xs: "none", sm: "inline-flex" }, color: colors.muted, fontWeight: 600, fontSize: 14, textTransform: "none", letterSpacing: "-0.01em" }}>
                Features
              </Button>
              <Button href="#creator" sx={{ display: { xs: "none", md: "inline-flex" }, color: colors.muted, fontWeight: 600, fontSize: 14, textTransform: "none", letterSpacing: "-0.01em" }}>
                Creator
              </Button>
              <Button href={ctaUrl} variant="contained" endIcon={<ArrowForwardRounded />} sx={{ bgcolor: colors.blue, color: colors.white, fontWeight: 700, fontSize: 14, textTransform: "none", borderRadius: 2, px: 2.2, py: 0.9, letterSpacing: "-0.01em", boxShadow: "0 8px 20px rgba(2,132,199,0.25)", "&:hover": { bgcolor: "#0369A1" } }}>
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
            radial-gradient(circle at 10% 40%, rgba(224, 242, 254, 0.6), transparent 32%),
            radial-gradient(circle at 90% 30%, rgba(220, 252, 231, 0.5), transparent 30%),
            linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 60%, #F1F5F9 100%)
          `,
          borderBottom: `1px solid ${colors.line}`,
        }}
      >
        <Container maxWidth="xl" sx={{ pt: { xs: 7, md: 9 }, pb: { xs: 8, md: 11 } }}>
          <Stack alignItems="center" textAlign="center" sx={{ maxWidth: 860, mx: "auto" }}>
            <Chip
              icon={<AutoAwesomeRounded sx={{ fontSize: "16px !important" }} />}
              label="Work management for HRM, CRM, task, and field teams"
              sx={{
                bgcolor: colors.blueSoft,
                color: colors.blue,
                border: `1px solid ${alpha(colors.blue, 0.16)}`,
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: "-0.01em",
                px: 0.5,
                mb: 2.2,
              }}
            />
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: 40, sm: 56, md: 72 },
                lineHeight: 1.05,
                fontWeight: 800,
                letterSpacing: { xs: "-0.025em", md: "-0.035em" },
                color: colors.text,
                maxWidth: 860,
              }}
            >
              Work management platform for{" "}
              <Box
                component="span"
                sx={{
                  background: "linear-gradient(135deg, #0284C7 0%, #2563EB 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                result-driven teams
              </Box>
            </Typography>
            <Typography
              sx={{
                mt: 2.2,
                maxWidth: 680,
                color: colors.muted,
                fontSize: { xs: 16, md: 20 },
                lineHeight: 1.6,
                fontWeight: 500,
                letterSpacing: "-0.01em",
              }}
            >
              BrainToDo helps teams plan people ops, track sales, manage tasks, coordinate visits, and understand progress from one clean workspace.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.4} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="center" sx={{ mt: 3.6 }}>
              <Button
                href={ctaUrl}
                size="large"
                variant="contained"
                endIcon={<ArrowForwardRounded />}
                sx={{
                  px: 3.2,
                  py: 1.3,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: "-0.01em",
                  bgcolor: colors.blue,
                  color: colors.white,
                  borderRadius: 2.2,
                  boxShadow: "0 12px 28px rgba(2,132,199,0.25)",
                  "&:hover": { bgcolor: "#0369A1" },
                }}
              >
                Try BrainToDo for Free
              </Button>
              <Typography variant="caption" sx={{ color: colors.muted, fontWeight: 500, fontSize: 13, alignSelf: "center" }}>
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
                  p: 2.5,
                  borderRadius: 2.2,
                  border: `1px solid ${colors.line}`,
                  bgcolor: colors.white,
                  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 16px 36px rgba(15, 23, 42, 0.08)",
                  },
                }}
              >
                <Chip
                  size="small"
                  label={`0${index + 1}`}
                  sx={{
                    bgcolor: index % 2 ? colors.peach : colors.blueSoft,
                    color: index % 2 ? colors.peachText : colors.blue,
                    fontWeight: 700,
                    fontSize: 11.5,
                    letterSpacing: "0.02em",
                    mb: 1.8,
                  }}
                />
                <Typography sx={{ fontWeight: 700, fontSize: 18, color: colors.text, mb: 1, letterSpacing: "-0.02em" }}>{title}</Typography>
                <Typography sx={{ color: colors.muted, lineHeight: 1.65, fontWeight: 450, fontSize: 14 }}>{copy}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box id="features" component="section" sx={{ bgcolor: colors.softBg, py: { xs: 7, md: 10 }, borderBlock: `1px solid ${colors.line}` }}>
        <Container maxWidth="lg">
          <Stack spacing={1.2} sx={{ maxWidth: 760, mb: 3.5 }}>
            <Chip label="Feature UI preview" sx={{ width: "fit-content", bgcolor: colors.white, color: colors.blue, border: `1px solid ${colors.line}`, fontWeight: 600, fontSize: 12.5, letterSpacing: "-0.01em" }} />
            <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: 28, md: 38 }, color: colors.text, letterSpacing: "-0.025em" }}>
              Explore every major BrainToDo feature by tab
            </Typography>
            <Typography sx={{ color: colors.muted, fontSize: 16.5, lineHeight: 1.6, fontWeight: 500, letterSpacing: "-0.01em" }}>
              Visitors can quickly understand the system through focused UI previews before they open the application.
            </Typography>
          </Stack>

          <Paper elevation={0} sx={{ borderRadius: 2.5, border: `1px solid ${colors.line}`, overflow: "hidden", bgcolor: colors.white, boxShadow: "0 16px 45px rgba(15, 23, 42, 0.06)" }}>
            <Tabs
              value={activeFeature}
              onChange={(_, value) => setActiveFeature(value)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                px: 1,
                borderBottom: `1px solid ${colors.line}`,
                "& .MuiTab-root": { minHeight: 56, fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em", textTransform: "none", color: colors.muted },
                "& .Mui-selected": { color: colors.blue, fontWeight: 700 },
                "& .MuiTabs-indicator": { bgcolor: colors.blue, height: 3, borderRadius: "3px 3px 0 0" },
              }}
            >
              {featureTabs.map((feature, index) => {
                const Icon = feature.icon;
                return <Tab key={feature.key} icon={<Icon fontSize="small" />} iconPosition="start" label={feature.label} value={index} />;
              })}
            </Tabs>

            <Grid container spacing={0}>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: { xs: 2.5, md: 3.5 }, height: "100%" }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, fontSize: 24, color: colors.text, mb: 1.2, letterSpacing: "-0.02em" }}>
                    {selectedFeature.title}
                  </Typography>
                  <Typography sx={{ color: colors.muted, lineHeight: 1.65, mb: 2.8, fontWeight: 450, fontSize: 14.5 }}>
                    {selectedFeature.copy}
                  </Typography>
                  <Stack spacing={1.2}>
                    {selectedFeature.rows.map((row) => (
                      <Stack key={row} direction="row" spacing={1.2} alignItems="center">
                        <CheckCircleRounded sx={{ color: colors.greenText, fontSize: 19 }} />
                        <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em" }}>{row}</Typography>
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
              <Paper elevation={0} sx={{ p: 2.5, height: "100%", borderRadius: 2.2, border: `1px solid ${colors.line}`, bgcolor: colors.white }}>
                <Chip label={`0${index + 1}`} sx={{ bgcolor: index % 2 ? colors.peach : colors.blueSoft, color: index % 2 ? colors.peachText : colors.blue, fontWeight: 700, fontSize: 11.5, letterSpacing: "0.02em", mb: 2 }} />
                <Typography sx={{ fontWeight: 700, fontSize: 20, mb: 1, color: colors.text, letterSpacing: "-0.02em" }}>{title}</Typography>
                <Typography sx={{ color: colors.muted, lineHeight: 1.6, fontWeight: 450, fontSize: 14 }}>{copy}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box id="creator" component="section" sx={{ bgcolor: colors.white, color: colors.text, py: { xs: 7, md: 10 }, borderBlock: `1px solid ${colors.line}` }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip label="The Creator Of BrainToDo" sx={{ bgcolor: colors.blueSoft, color: colors.blue, border: `1px solid ${alpha(colors.blue, 0.16)}`, fontWeight: 600, fontSize: 13, letterSpacing: "-0.01em", mb: 2 }} />
              <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: 28, md: 38 }, letterSpacing: "-0.025em", mb: 2.2, color: colors.text }}>
                Hi, I&apos;m Mir Fahim Rahman
              </Typography>
              <Typography sx={{ color: colors.muted, fontSize: 16, lineHeight: 1.75, mb: 2, fontWeight: 450 }}>
                With years of experience in <Box component="strong" sx={{ color: colors.text, fontWeight: 700 }}>Flutter, Laravel, and ReactJS</Box>, I built <Box component="strong" sx={{ color: colors.text, fontWeight: 700 }}>BrainToDo</Box> from the ground up, every module crafted with care, performance, and scalability in mind.
              </Typography>
              <Typography sx={{ color: colors.muted, fontSize: 16, lineHeight: 1.75, mb: 2.5, fontWeight: 450 }}>
                I work <Box component="strong" sx={{ color: colors.text, fontWeight: 700 }}>one-to-one with every client</Box>, ensuring dedicated support, transparent communication, and results delivered exactly as promised.
              </Typography>
              <Typography sx={{ color: colors.text, fontSize: 17, lineHeight: 1.6, fontWeight: 700, letterSpacing: "-0.015em", borderLeft: `3px solid ${colors.blue}`, pl: 2, py: 0.5 }}>
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
                  boxShadow: "0 20px 50px rgba(15, 23, 42, 0.08)",
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
          <Typography variant="h3" sx={{ color: colors.text, fontWeight: 800, fontSize: { xs: 28, md: 38 }, letterSpacing: "-0.025em" }}>
            Start managing your team with BrainToDo
          </Typography>
          <Typography sx={{ color: colors.muted, fontSize: 17.5, lineHeight: 1.6, mt: 1.5, mb: 3.5, fontWeight: 500, letterSpacing: "-0.01em" }}>
            Give your office one system for people, tasks, leads, visits, permissions, and decisions.
          </Typography>
          <Button href={ctaUrl} size="large" variant="contained" endIcon={<ArrowForwardRounded />} sx={{ bgcolor: colors.blue, color: colors.white, fontWeight: 700, fontSize: 15, textTransform: "none", borderRadius: 2.2, px: 3.2, py: 1.2, letterSpacing: "-0.01em", boxShadow: "0 12px 28px rgba(2,132,199,0.25)", "&:hover": { bgcolor: "#0369A1" } }}>
            Try BrainToDo for free
          </Button>
        </Container>
      </Box>

      <Divider sx={{ borderColor: colors.line }} />
      <Box component="footer" sx={{ bgcolor: colors.white, py: 3.5 }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1.5}>
            <Typography sx={{ color: colors.text, fontWeight: 800, fontSize: 18, letterSpacing: "-0.025em" }}>BrainToDo</Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 0.75, sm: 2.5 }} alignItems={{ xs: "flex-start", sm: "center" }}>
              <Typography sx={{ color: colors.muted, fontWeight: 450, fontSize: 13.5 }}>Built for practical business, office, and team management.</Typography>
              <Button href="/privacy-policy" sx={{ color: colors.blue, p: 0, minWidth: 0, textTransform: "none", fontWeight: 600, fontSize: 13.5, letterSpacing: "-0.01em" }}>
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
