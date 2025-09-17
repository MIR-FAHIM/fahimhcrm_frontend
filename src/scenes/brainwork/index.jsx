// src/marketing/LandingPage.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  AppBar, Toolbar, Container, Box, Paper, Stack, Typography, Button, IconButton,
  Tabs, Tab, Menu, MenuItem, Chip, Link as MLink, Dialog, useTheme
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import { alpha } from "@mui/material/styles";
import { base_url } from "../../api/config";

/** Replace with real assets in /src/marketing/assets */
const img = (name) => `../../src/assets/marketing/${name}.png`;

/* ----------------------- NAV CONFIG ----------------------- */
const NAV = [
  { label: "Use cases", items: [{ label: "HR Teams", href: "#hr" }, { label: "Sales", href: "#sales" }] },
  { label: "Solutions", items: [{ label: "Web + Mobile", href: "#apps" }, { label: "Integrations", href: "#integrations" }] },
  { label: "Resources", items: [{ label: "Docs", href: "#docs" }, { label: "Changelog", href: "/what-next" }] },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

/* -------------------- FEATURE MODEL ---------------------- */
const FEATURES = [
  {
    key: "hrms",
    label: "HRMS",
    hero: {
      title: "People ops, tidy and traceable.",
      subtitle: "Employees, departments, profiles, and permissions—centralized and searchable.",
      image: img("hrms"),
    },
    subTabs: [
      { key: "employee", label: "Employee", image: img("b_employee"), bullets: ["Unified employee directory", "Roles & permissions", "Documents & IDs"] },
      { key: "department", label: "Department", image: img("b_department"), bullets: ["Department task counts", "Managers & reporting lines", "Headcount & changes"] },
    ],
  },
  {
    key: "attendance",
    label: "Attendance",
    hero: {
      title: "Modern attendance, anywhere.",
      subtitle: "Flexible capture, ironclad controls, and clean reporting.",
      image: img("attendance"),
    },
    subTabs: [
      { key: "today", label: "Today", image: img("d_attendance"), bullets: ["One-click status", "Late/absent flags", "Shift view"] },
      { key: "report", label: "Reports", image: img("d_attendance_report"), bullets: ["Daily/Monthly export", "Filters & pivots", "CSV/Excel"] },
      { key: "leave", label: "Leave", image: img("leave"), bullets: ["Policies & accruals", "Approval flows", "Balances & history"] },
      { key: "adjust", label: "Adjustments", image: img("d_atten_adjustment"), bullets: ["Corrections with audit", "Manager approval", "Notes & evidence"] },
      {
        key: "capture",
        label: "Capture modes",
        image: img("b_map"),
        bullets: [
          "Location-based attendance (geo-fencing)",
          "IP locker attendance",
          "Remote/self check-in (mobile)"
        ],
      },
    ],
  },
  {
    key: "notice",
    label: "Add Notice",
    hero: {
      title: "Announcements that actually reach people.",
      subtitle: "Targeted notices with read receipts and scheduled publishing.",
      image: img("b_notice"),
    },
    subTabs: [
      { key: "create", label: "Create & publish", image: img("b_notice"), bullets: ["Audience targeting", "Schedule & expire", "Attachments & links"] },
      { key: "engagement", label: "Engagement", image: img("b_notice_show"), bullets: ["Read receipts", "Reminders", "Comments (optional)"] },
    ],
  },
  {
    key: "tasks",
    label: "Task Management",
    hero: {
      title: "From to-do to done—with context.",
      subtitle: "Personal queues, shared boards, follow-ups, and real progress.",
      image: img("tasks"),
    },
    subTabs: [
      { key: "my-task", label: "My Task", image: img("b_my_task"), bullets: ["Today / Upcoming", "Quick add & shortcuts", "Focus mode"] },
      { key: "all-task", label: "All Task", image: img("b_all_task"), bullets: ["Team lists & filters", "Bulk actions", "Saved views"] },
      { key: "details", label: "Task Details", image: img("b_task_details"), bullets: ["Comments & mentions", "Files & checklists", "Auto follow-ups"] },
      { key: "follow-up", label: "Task Follow-up", image: img("task_follow"), bullets: ["Comments & mentions", "Files & checklists", "Auto follow-ups"] },
     
      { key: "calendar", label: "Task Calendar", image: img("task_cal"), bullets: ["Calendar & timeline", "Dependencies", "Drag & drop"] },
      { key: "work-report", label: "Work Report", image: img("work_report"), bullets: ["Daily/weekly summaries", "Owner & status breakdown", "Export"] },
    ],
  },
  {
    key: "projects",
    label: "Projects",
    hero: {
      title: "Roadmaps that move.",
      subtitle: "Phases, teams, tasks, comms, workshops, learnings—and services you deliver.",
      image: img("projects"),
    },
    subTabs: [
      { key: "dept-list", label: "Project list", image: img("project"), bullets: ["Department filters", "Ownership & visibility", "Priorities"] },
    
      { key: "phases", label: "Project Phases", image: img("project-phase"), bullets: ["Milestones & gates", "Dependencies", "Risk tracking"] },
      { key: "team", label: "Team", image: img("team"), bullets: ["Members & roles", "Availability", "Permissions"] },
      { key: "tasks", label: "Project Task", image: img("p-task"), bullets: ["Backlog & board", "SLA & assignees", "Templates"] },
      { key: "comms", label: "Communication", image: img("p-chat"), bullets: ["Threads & mentions", "Email/Slack bridge", "Decision logs"] },
      { key: "workshop", label: "Workshop", image: img("p-workshop"), bullets: ["Agenda & notes", "Action items", "Recordings"] },
      { key: "learning", label: "Learning", image: img("p-workshop"), bullets: ["Retros & lessons", "Playbooks", "Knowledge base"] },
      { key: "services", label: "Project Services", image: img("p-workshop"), bullets: ["Service catalog", "SOW & versions", "Service status & notes"] },
    ],
  },
  {
    key: "leads",
    label: "Leads",
    hero: {
      title: "HRM + CRM, now with pipeline intelligence.",
      subtitle: "Capture, nurture, and measure sales effort across every channel.",
      image: img("leads"),
    },
    subTabs: [
      { key: "pipeline", label: "Sales pipeline", image: img("sale-pipeline"), bullets: ["Stages & SLAs", "Opportunity health", "Forecast"] },
      { key: "fb", label: "Facebook lead", image: img("fb-lead"), bullets: ["Form integration", "Auto-assignment", "Deduping"] },
     
     
      { key: "effort", label: "Lead effort calc", image: img("effort-calculation"), bullets: ["Weighted actions", "Prospect ranking", "Team scorecards"] },
      { key: "report", label: "Lead gen report", image: img("lead-report"), bullets: ["Source breakdown", "Cohorts", "Exports"] },
      {
        key: "activity-log",
        label: "Activity log",
        image: img("lead-details"),
        bullets: ["Call, meeting, visit", "WhatsApp, email, task", "Timeline & outcomes"],
      },
    ],
  },
  {
    key: "chatpm",
    label: "Chat-based PM",
    hero: {
      title: "Project management in chat—without the chaos.",
      subtitle: "Create, assign, and update tasks from conversations; decisions never get lost.",
      image: img("chat"),
    },
    subTabs: [
      { key: "threads", label: "Threads → Tasks", image: img("chat"), bullets: ["Slash commands", "Auto-linking", "Context preserved"] },
      { key: "summaries", label: "Smart summaries", image: img("chat"), bullets: ["Daily digests", "Action extraction", "Follow-ups"] },
      { key: "search", label: "Unified search", image: img("chat"), bullets: ["Tasks + docs + chat", "Filters", "Instant previews"] },
    ],
  },
];

/* ----------------------- TOP BAR ------------------------- */
const TopBar = () => {
  const theme = useTheme();
  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;
  const [anchor, setAnchor] = useState(null);
  const [menuIdx, setMenuIdx] = useState(-1);

  const open = Boolean(anchor);
  const openMenu = (e, i) => { setAnchor(e.currentTarget); setMenuIdx(i); };
  const close = () => { setAnchor(null); setMenuIdx(-1); };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{ bgcolor: "background.default", borderBottom: `1px solid ${theme.palette.divider}` }}
    >
      <Toolbar sx={{ gap: 2 }}>
<Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>
  <Box
    component="img"
    src="../../src/assets/images/braintodobanner.png" // <- replace with your logo path
    alt="BrainToDo Logo"
    sx={{
      width: 200,
      height: 80,
      objectFit: "contain",
      mr: 1,
    }}
  />
  <Typography variant="h6" fontWeight={800}>
    BrainToDo
  </Typography>
</Box>

        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
          {NAV.map((item, i) =>
            item.items ? (
              <Button key={item.label} endIcon={<ExpandMoreIcon />} onClick={(e) => openMenu(e, i)} sx={{ textTransform: "none", fontWeight: 700 }}>
                {item.label}
              </Button>
            ) : (
              <Button key={item.label} href={item.href} sx={{ textTransform: "none", fontWeight: 700 }}>
                {item.label}
              </Button>
            )
          )}
          <Menu anchorEl={anchor} open={open} onClose={close}>
            {menuIdx > -1 &&
              NAV[menuIdx].items?.map((sub) => (
                <MenuItem key={sub.label} onClick={close} component={MLink} href={sub.href}>
                  {sub.label}
                </MenuItem>
              ))}
          </Menu>
        </Box>

        <Box sx={{ flex: 1 }} />

        <Stack direction="row" spacing={1}>
          <Button variant="outlined" sx={{ textTransform: "none", fontWeight: 700 }}>Log In</Button>
          <Button
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 800,
              bgcolor: brand,
              color: theme.palette.blueAccent?.contrastText ?? "#fff",
              "&:hover": { bgcolor: theme.palette.blueAccent?.dark ?? brand },
            }}
          >
            Sign Up
          </Button>
        </Stack>

        <IconButton sx={{ display: { xs: "inline-flex", md: "none" }, ml: 1 }}>
          <MenuIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

/* ------------------------ HERO -------------------------- */
const Hero = () => {
  const theme = useTheme();
  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;
  return (
    <Container sx={{ py: { xs: 6, md: 10 }, textAlign: "center" }}>
      <Typography variant="h3" fontWeight={800} sx={{ lineHeight: 1.1, mb: 1 }}>
        HRM + CRM for result-driven teams
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Plan people ops, track sales, and ship projects—from one workspace on web and mobile.
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="center" alignItems="center">
        <Button
        onClick={() => window.location.href = `https://hrmfahim.biswasandbrothers.com/login`}
          size="large"
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          sx={{
            px: 3,
            textTransform: "none",
            fontWeight: 800,
            bgcolor: brand,
            color: theme.palette.blueAccent?.contrastText ?? "#fff",
            "&:hover": { bgcolor: theme.palette.blueAccent?.dark ?? brand },
            boxShadow: "0 6px 14px rgba(58,134,255,0.25)",
          }}
        >
          Try BrainToDo for Free
        </Button>
        <Typography variant="caption" color="text.secondary">No credit card required.</Typography>
      </Stack>
    </Container>
  );
};

/* ------------------- FEATURE TABS ----------------------- */
const FeatureTabs = () => {
  const theme = useTheme();
  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;

  const [mainTab, setMainTab] = useState(FEATURES[0].key);
  const current = useMemo(() => FEATURES.find((f) => f.key === mainTab) ?? FEATURES[0], [mainTab]);

  const [subTab, setSubTab] = useState(current.subTabs[0].key);
  useEffect(() => {
    setSubTab((prev) => (current.subTabs.some((s) => s.key === prev) ? prev : current.subTabs[0].key));
  }, [current]);

  const sub = current.subTabs.find((s) => s.key === subTab) ?? current.subTabs[0];

  // Lightbox state
  const [lightbox, setLightbox] = useState({ open: false, src: "" });

  return (
    <Container sx={{ pb: 10 }}>
      {/* Main feature tabs */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: "background.paper",
          overflow: "hidden",
          maxWidth: 1280,   // wider rail
          mx: "auto",
        }}
      >
        <Tabs
          value={mainTab}
          onChange={(_, v) => setMainTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Main features"
          sx={{
            "& .MuiTab-root": { textTransform: "none", fontWeight: 800, minHeight: 56 },
            "& .Mui-selected": { color: brand },
            "& .MuiTabs-indicator": { backgroundColor: brand, height: 3 },
          }}
        >
          {FEATURES.map((f) => <Tab key={f.key} label={f.label} value={f.key} />)}
        </Tabs>
      </Paper>

      {/* Hero + sub-tabs */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: "background.paper",
          display: "grid",
          gap: 2,
          alignItems: "stretch",
          // Left column compact, right image gets the rest
          gridTemplateColumns: { xs: "1fr", md: "380px 1fr" },
        }}
      >
        {/* Left details (compact) */}
        <Box>
          <Chip
            size="small"
            label={current.label}
            sx={{ mb: 1, fontWeight: 700, bgcolor: alpha(brand, 0.12), color: brand }}
          />
          <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
            {current.hero.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {current.hero.subtitle}
          </Typography>

          <Tabs
            value={subTab}
            onChange={(_, v) => setSubTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Sub features"
            sx={{
              "& .MuiTab-root": { textTransform: "none", fontWeight: 700, minHeight: 44, px: 1.5 },
              "& .Mui-selected": { color: brand },
              "& .MuiTabs-indicator": { backgroundColor: brand, height: 2 },
            }}
          >
            {current.subTabs.map((s) => <Tab key={s.key} label={s.label} value={s.key} />)}
          </Tabs>

          <Box sx={{ mt: 1.5 }}>
            {sub.bullets?.map((b, i) => (
              <Typography key={i} variant="body2" sx={{ display: "block", mb: 0.5 }}>
                • {b}
              </Typography>
            ))}
          </Box>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 800,
                bgcolor: brand,
                color: theme.palette.blueAccent?.contrastText ?? "#fff",
                "&:hover": { bgcolor: theme.palette.blueAccent?.dark ?? brand },
              }}
            >
              Explore {current.label}
            </Button>
          </Box>
        </Box>

        {/* Right: large image with lightbox trigger */}
        <Box
          onClick={() => setLightbox({ open: true, src: sub.image || current.hero.image })}
          sx={{
            position: "relative",
            cursor: "zoom-in",
            borderRadius: 2,
            overflow: "hidden",
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
            "&:hover img": { transform: "scale(1.015)" },
          }}
        >
          <Box
            component="img"
            src={sub.image || current.hero.image}
            alt={`${current.label} – ${sub.label}`}
            loading="lazy"
            decoding="async"
            style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", transition: "transform .25s ease" }}
          />
          <Box
            sx={{
              position: "absolute",
              right: 8,
              bottom: 8,
              bgcolor: alpha("#000", 0.4),
              color: "#fff",
              px: 1,
              py: 0.5,
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: 12,
              pointerEvents: "none",
            }}
          >
            <ZoomInIcon sx={{ fontSize: 16 }} /> Click to enlarge
          </Box>
        </Box>
      </Paper>

      {/* Lightbox dialog */}
      <Dialog
        open={lightbox.open}
        onClose={() => setLightbox({ open: false, src: "" })}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "transparent",
            boxShadow: "none",
          },
        }}
      >
        <Box
          onClick={() => setLightbox({ open: false, src: "" })}
          sx={{
            display: "grid",
            placeItems: "center",
            p: { xs: 1, md: 2 },
            cursor: "zoom-out",
            bgcolor: alpha("#000", 0.75),
          }}
        >
          <Box
            component="img"
            src={lightbox.src}
            alt="Preview"
            sx={{
              maxWidth: "92vw",
              maxHeight: "90vh",
              width: "auto",
              height: "auto",
              borderRadius: 2,
              boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
              border: `1px solid ${alpha("#fff", 0.2)}`,
            }}
          />
        </Box>
      </Dialog>
    </Container>
  );
};

/* ------------------------ PAGE -------------------------- */
export default function LandingPage() {
  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <TopBar />
      <Hero />
      <FeatureTabs />
    </Box>
  );
}
