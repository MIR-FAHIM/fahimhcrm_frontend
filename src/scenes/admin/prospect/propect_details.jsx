import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  AddCommentRounded,
  ArrowBackRounded,
  BusinessRounded,
  CalendarMonthRounded,
  CheckCircleRounded,
  EmailRounded,
  EventRounded,
  FlagRounded,
  HistoryRounded,
  MapRounded,
  PersonRounded,
  RefreshRounded,
  StarRounded,
  TaskAltRounded,
  TimelineRounded,
  WhatsApp,
  PhoneInTalkRounded,
} from "@mui/icons-material";
import dayjs from "dayjs";

import { fetchEmployees } from "../../../api/controller/admin_controller/user_controller";
import {
  addConcernPersonsMultiple,
  addLogActivityProspect,
  changeProspectStatus,
  getAllLogActivityOfProspect,
  getAssignedPersonsProspect,
  getContactPersonProspect,
  getProspectAllStatus,
  getProspectDetails,
  getProspectStagesByLog,
  removeAssignPerson,
  updateProspect,
} from "../../../api/controller/admin_controller/prospect_controller";
import { addOpportunity } from "../../../api/controller/admin_controller/opportunity_controller";
import AddTaskFormProspect from "./form/task_prospect";
import EmailForm from "./form/email_form";
import LogActivityList from "./prospect_log_activity/fetch_prospect_log_activity";
import MeetingForm from "./form/meeting_form";
import NoteComponent from "./components/top_note";
import ProspectSidebar from "./components/detail_prospect_side_panel";

const ACTIVITY_TEMPLATES = [
  "Called the client - no answer.",
  "Spoke over WhatsApp - client asked for brochure.",
  "Sent follow-up email regarding product demo.",
  "Visited office - client was not available.",
  "Client requested a call back with pricing details.",
  "Emailed updated proposal.",
  "Visited client - gave live demo.",
  "Shared product catalog on WhatsApp.",
  "Follow-up call made - spoke with assistant.",
  "Client responded by email and requested more information.",
  "Left voicemail - awaiting response.",
  "Sent reminder email for scheduled meeting.",
];

const ACTIVITY_ACTIONS = [
  { type: "call", label: "Log Call", icon: <PhoneInTalkRounded fontSize="small" />, tone: "success" },
  { type: "email", label: "Log Email", icon: <EmailRounded fontSize="small" />, tone: "info" },
  { type: "meeting", label: "Log Meeting", icon: <EventRounded fontSize="small" />, tone: "warning" },
  { type: "visit", label: "Visit Log", icon: <MapRounded fontSize="small" />, tone: "error" },
  { type: "whatsapp", label: "WhatsApp", icon: <WhatsApp fontSize="small" />, tone: "success" },
];

const TABS = [
  { label: "Log Activity", icon: <AddCommentRounded fontSize="small" /> },
  { label: "Email", icon: <EmailRounded fontSize="small" /> },
  { label: "Meeting", icon: <EventRounded fontSize="small" /> },
  { label: "Task", icon: <TaskAltRounded fontSize="small" /> },
];

const isTrue = (value) => value === true || value === 1 || value === "1";

const formatDate = (value) => {
  if (!value) return "-";
  const date = dayjs(value);
  return date.isValid() ? date.format("MMM D, YYYY") : "-";
};

const getDaysSince = (dateValue) => {
  if (!dateValue) return "-";
  const date = dayjs(dateValue);
  if (!date.isValid()) return "-";
  return Math.max(0, dayjs().diff(date, "day"));
};

const getStageName = (details, stages) => {
  const current = stages.find((stage) => Number(stage.id) === Number(details.stage_id));
  return details.stage?.stage_name || current?.stage_name || "No stage";
};

const getActivityColor = (theme, type) => {
  const map = {
    call: theme.palette.success.main,
    email: theme.palette.info.main,
    whatsapp: theme.palette.success.dark || theme.palette.success.main,
    visit: theme.palette.error.main,
    task: theme.palette.primary.main,
    general: theme.palette.text.secondary,
    message: theme.palette.info.dark || theme.palette.info.main,
    meeting: theme.palette.warning.main,
  };
  return map[type] || theme.palette.primary.main;
};

const StatTile = ({ icon, label, value, tone = "primary" }) => {
  const theme = useTheme();
  const color = theme.palette[tone]?.main || theme.palette.primary.main;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        flex: "1 1 150px",
        minWidth: { xs: 145, sm: 160 },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
        <Box>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
            {label}
          </Typography>
          <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
            {value}
          </Typography>
        </Box>
        <Avatar variant="rounded" sx={{ bgcolor: alpha(color, 0.12), color, width: 40, height: 40 }}>
          {icon}
        </Avatar>
      </Stack>
    </Paper>
  );
};

const Section = ({ title, subtitle, icon, action, children }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          {icon && (
            <Avatar variant="rounded" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12), color: theme.palette.primary.main }}>
              {icon}
            </Avatar>
          )}
          <Box>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 700, lineHeight: 1.1 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
        {action}
      </Stack>
      {children}
    </Paper>
  );
};

const StageJourney = ({ stages = [], currentStageId, onChangeStage }) => {
  const theme = useTheme();
  const currentIndex = stages.findIndex((stage) => Number(stage.id) === Number(currentStageId));

  if (!stages.length) {
    return (
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        No stage history is available for this prospect.
      </Alert>
    );
  }

  return (
    <Box sx={{ overflowX: "auto", pb: 1 }}>
      <Stack direction="row" alignItems="stretch" spacing={1.25} sx={{ minWidth: 680 }}>
        {stages.map((stage, index) => {
          const isCurrent = Number(stage.id) === Number(currentStageId);
          const isCompleted = currentIndex >= 0 ? index < currentIndex : Number(stage.id) < Number(currentStageId);
          const active = isCurrent || isCompleted;
          const color = active ? theme.palette.success.main : theme.palette.text.secondary;
          const tooltipTitle = stage.last_updated_at
            ? `Last updated: ${stage.last_updated_at} by ${stage.changed_by_name || "Unknown"}`
            : "Not visited yet";

          return (
            <Stack key={stage.id} direction="row" alignItems="center" spacing={1.25} sx={{ flex: 1 }}>
              <Tooltip title={tooltipTitle} arrow>
                <Paper
                  elevation={0}
                  onClick={() => onChangeStage(stage.id)}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    cursor: "pointer",
                    minWidth: 150,
                    bgcolor: isCurrent ? alpha(theme.palette.success.main, 0.12) : theme.palette.background.default,
                    border: `1px solid ${isCurrent ? alpha(theme.palette.success.main, 0.45) : theme.palette.divider}`,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: alpha(color, 0.14),
                        color,
                      }}
                    >
                      {active ? <CheckCircleRounded fontSize="small" /> : index + 1}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" noWrap sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
                        {stage.stage_name}
                      </Typography>
                      <Typography variant="caption" noWrap sx={{ color: theme.palette.text.secondary }}>
                        {stage.last_updated_at ? formatDate(stage.last_updated_at) : "Pending"}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Tooltip>
              {index < stages.length - 1 && (
                <Box sx={{ width: 26, height: 2, bgcolor: active ? alpha(theme.palette.success.main, 0.6) : theme.palette.divider }} />
              )}
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
};

const ActivitySummary = ({ summary = {} }) => {
  const theme = useTheme();
  const entries = Object.entries(summary || {});

  if (!entries.length) {
    return (
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        No activity summary has been recorded yet.
      </Alert>
    );
  }

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {entries.map(([type, count]) => {
        const color = getActivityColor(theme, type);
        return (
          <Chip
            key={type}
            label={`${type.replace(/_/g, " ")} ${count}`}
            sx={{
              textTransform: "capitalize",
              fontWeight: 700,
              bgcolor: alpha(color, 0.12),
              color,
              border: `1px solid ${alpha(color, 0.22)}`,
            }}
          />
        );
      })}
    </Stack>
  );
};

const ProspectDetailsSkeleton = () => (
  <Box sx={{ p: { xs: 2, md: 4 } }}>
    <Skeleton variant="rounded" height={118} sx={{ mb: 2 }} />
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "380px minmax(0, 1fr)" }, gap: 2.5 }}>
      <Skeleton variant="rounded" height={620} />
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={220} />
        <Skeleton variant="rounded" height={360} />
      </Stack>
    </Box>
  </Box>
);

export default function ProspectDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();
  const userID = localStorage.getItem("userId");

  const [logActivityList, setLogActivityList] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [prospectStageId, setProspectStage] = useState(0);
  const [stages, setStages] = useState([]);
  const [stagesByLog, setStagesByLog] = useState([]);
  const [assignedPersons, setAssignedPersons] = useState([]);
  const [contactPersonList, setContactPersonList] = useState([]);
  const [details, setProspectDetail] = useState({});
  const [form, setForm] = useState({ prospect_id: id, stage_id: "" });
  const [concernPersons, setConcernPersons] = useState({ prospect_id: id, assign_to_ids: [] });
  const [logNote, setLogNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");

  const handleAlert = (message, type = "success") => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertOpen(true);
  };

  const isIndividual = isTrue(details.is_individual);
  const isOpportunity = isTrue(details.is_opportunity);
  const stageName = getStageName(details, stages);
  const daysSince = getDaysSince(details.created_at);

  const loadWorkspace = async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const [detailsRes, stagesRes, stageLogRes, assignedRes, contactRes, logRes, employeeRes] = await Promise.all([
        getProspectDetails(id),
        getProspectAllStatus(),
        getProspectStagesByLog({ prospect_id: id }),
        getAssignedPersonsProspect(id),
        getContactPersonProspect(id),
        getAllLogActivityOfProspect(id),
        fetchEmployees(),
      ]);

      if (detailsRes?.status === "success") {
        setProspectDetail(detailsRes.data || {});
        setProspectStage(detailsRes.data?.stage_id || 0);
        setForm({ prospect_id: id, stage_id: detailsRes.data?.stage_id || "" });
      }
      if (stagesRes?.status === "success") setStages(stagesRes.data || []);
      if (stageLogRes?.status === "success") setStagesByLog(stageLogRes.data || []);
      if (assignedRes?.status === "success") setAssignedPersons(assignedRes.data || []);
      if (contactRes?.status === "success") setContactPersonList(contactRes.data || []);
      if (logRes?.status === true || logRes?.status === "success") setLogActivityList(logRes.data || []);
      setEmployees(employeeRes?.data || []);
    } catch (error) {
      console.error("Prospect workspace fetch error", error);
      handleAlert("Prospect details could not be loaded.", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setConcernPersons({ prospect_id: id, assign_to_ids: [] });
    loadWorkspace();
  }, [id]);

  const handleGetContactPersons = async () => {
    const contactPersonRes = await getContactPersonProspect(id);
    if (contactPersonRes.status === "success") setContactPersonList(contactPersonRes.data || []);
  };

  const handleGetDetails = async () => {
    const detailsRes = await getProspectDetails(id);
    if (detailsRes.status === "success") {
      setProspectDetail(detailsRes.data || {});
      setProspectStage(detailsRes.data?.stage_id || 0);
      setForm({ prospect_id: id, stage_id: detailsRes.data?.stage_id || "" });
    }
  };

  const refreshAssignedPersons = async () => {
    const assignedPersonsRes = await getAssignedPersonsProspect(id);
    if (assignedPersonsRes.status === "success") setAssignedPersons(assignedPersonsRes.data || []);
  };

  const handleConcernsChange = (event) => {
    const { name, value } = event.target;
    setConcernPersons((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const removeAssignedPerson = async (empId) => {
    await removeAssignPerson({ prospect_id: id, employee_id: empId });
    await refreshAssignedPersons();
    handleAlert("Assigned person removed.");
  };

  const updateProspectInfo = async (data) => {
    const updateRes = await updateProspect(data);
    if (updateRes.status === "success") {
      await handleGetDetails();
      handleAlert("Prospect information updated.");
    }
  };

  const handleSaveNote = async (data) => {
    const updateRes = await updateProspect(data);
    if (updateRes.status === "success") {
      await handleGetDetails();
      handleAlert("Prospect note updated.");
    }
  };

  const addMultipleConcernPersons = async () => {
    const employeeIds = concernPersons.assign_to_ids || [];
    if (!employeeIds.length) {
      handleAlert("Select at least one employee to assign.", "warning");
      return;
    }

    const payload = {
      prospect_id: id,
      employees: employeeIds.map((employeeId) => ({ employee_id: employeeId, is_active: 0, notify: 0 })),
    };
    await addConcernPersonsMultiple(payload);
    setConcernPersons({ prospect_id: id, assign_to_ids: [] });
    await refreshAssignedPersons();
    handleAlert("Concerned person added.");
  };

  const handleStageChange = async (stageID) => {
    setForm((prev) => ({ ...prev, stage_id: stageID }));
    try {
      await changeProspectStatus({ prospect_id: id, stage_id: stageID, user_id: userID });
      await handleGetDetails();
      const stagesResByLog = await getProspectStagesByLog({ prospect_id: id });
      if (stagesResByLog.status === "success") setStagesByLog(stagesResByLog.data || []);
      handleAlert("Prospect stage updated.");
    } catch (error) {
      console.error("Error changing status:", error);
      handleAlert("Failed to change status.", "error");
    }
  };

  const addLogActivity = async (activityType) => {
    if (!logNote.trim()) {
      handleAlert("Write a short log note first.", "warning");
      return;
    }

    try {
      const response = await addLogActivityProspect({
        prospect_id: id,
        activity_type: activityType,
        title: `${activityType} prospect activity`,
        notes: logNote.trim(),
        activity_time: "",
        related_id: "",
        created_by: userID,
      });

      if (response.status === true || response.status === "success") {
        const logActivityRes = await getAllLogActivityOfProspect(id);
        if (logActivityRes.status === true || logActivityRes.status === "success") {
          setLogActivityList(logActivityRes.data || []);
        }
        handleAlert(`${activityType} logged successfully.`);
        setLogNote("");
      } else {
        handleAlert("Failed to log activity.", "error");
      }
    } catch (error) {
      console.error(error);
      handleAlert("Error logging activity.", "error");
    }
  };

  const onToggleOpportunityController = async (data) => {
    const updateRes = await updateProspect(data);
    if (updateRes.status === "success") {
      await handleGetDetails();
      handleAlert("Opportunity status updated.");
    }
  };

  const goToMap = () => navigate(`/googlemap-set/${id}/${details.latitude}/${details.longitude}`);

  const onSubmitOpportunity = async (data) => {
    const addRes = await addOpportunity(data);
    handleAlert(addRes?.message || "Opportunity details submitted.");
  };

  const logCount = logActivityList.length;
  const contactCount = contactPersonList.length;
  const assignedCount = assignedPersons.length;
  const meetingTitle = `We have a meeting with ${details?.prospect_name || "this prospect"}`;

  if (loading) return <ProspectDetailsSkeleton />;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      <Stack
        direction={{ xs: "column", xl: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", xl: "center" }}
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
          <Button variant="outlined" startIcon={<ArrowBackRounded />} onClick={() => navigate(-1)} sx={{ borderRadius: 2, flexShrink: 0 }}>
            Back
          </Button>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Chip icon={isIndividual ? <PersonRounded /> : <BusinessRounded />} label={isIndividual ? "Individual" : "Organization"} sx={{ fontWeight: 700 }} />
              <Chip icon={<FlagRounded />} label={stageName} color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
              {isOpportunity && <Chip icon={<StarRounded />} label="Opportunity" color="success" sx={{ fontWeight: 700 }} />}
            </Stack>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
              Prospect workspace with relationship, stage, activity, meetings, emails, and task actions.
            </Typography>
          </Box>
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }}>
          <TextField
            select
            size="small"
            label="Change Stage"
            value={form.stage_id || prospectStageId || ""}
            onChange={(event) => handleStageChange(event.target.value)}
            sx={{ minWidth: { xs: "100%", sm: 240 } }}
          >
            {stages.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.stage_name}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            startIcon={refreshing ? <CircularProgress size={16} color="inherit" /> : <RefreshRounded />}
            disabled={refreshing}
            onClick={() => loadWorkspace({ silent: true })}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 2.5,
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, transparent 42%)`,
          }}
        />
        <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" spacing={2.5} sx={{ position: "relative" }}>
          <Stack direction="row" spacing={2} sx={{ minWidth: 0 }}>
            <Avatar
              variant="rounded"
              sx={{
                width: 64,
                height: 64,
                bgcolor: alpha(theme.palette.primary.main, 0.14),
                color: theme.palette.primary.main,
                fontWeight: 700,
              }}
            >
              {isIndividual ? <PersonRounded /> : <BusinessRounded />}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 700, lineHeight: 1.1, wordBreak: "break-word" }}>
                {details.prospect_name || "Untitled prospect"}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.75 }}>
                {details.industry_type?.industry_type_name || "No industry"} | {details.information_source?.information_source_name || "No source"}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.25 }}>
                <Chip size="small" icon={<CalendarMonthRounded />} label={`Created ${formatDate(details.created_at)}`} />
                <Chip size="small" label={`${daysSince} days in pipeline`} />
                {details.last_activity && <Chip size="small" icon={<HistoryRounded />} label={`Last activity ${formatDate(details.last_activity)}`} />}
              </Stack>
            </Box>
          </Stack>
          <Box sx={{ minWidth: { xs: "100%", lg: 360 } }}>
            <NoteComponent details={details} onSaveNote={handleSaveNote} />
          </Box>
        </Stack>
      </Paper>

      <Stack direction="row" gap={2} flexWrap="wrap" sx={{ mb: 2.5 }}>
        <StatTile icon={<TimelineRounded />} label="Stage" value={stageName} />
        <StatTile icon={<PersonRounded />} label="Contacts" value={contactCount} tone="info" />
        <StatTile icon={<BusinessRounded />} label="Assigned" value={assignedCount} tone="success" />
        <StatTile icon={<HistoryRounded />} label="Activities" value={logCount} tone="warning" />
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "380px minmax(0, 1fr)" },
          gap: 2.5,
          alignItems: "start",
        }}
      >
        <ProspectSidebar
          details={details}
          onAdded={handleGetContactPersons}
          contactPersonList={contactPersonList}
          employees={employees}
          assignedPersons={assignedPersons}
          concernPersons={concernPersons}
          updateProspectInfo={updateProspectInfo}
          onToggleOpportunityController={onToggleOpportunityController}
          onSubmitOpportunity={onSubmitOpportunity}
          goToMap={goToMap}
          handleConcernsChange={handleConcernsChange}
          addMultipleConernPersons={addMultipleConcernPersons}
          removeAssignedPerson={removeAssignedPerson}
        />

        <Stack spacing={2.5} sx={{ minWidth: 0 }}>
          <Section icon={<TimelineRounded />} title="Stage Journey" subtitle="Click a stage to move the prospect through the pipeline">
            <StageJourney stages={stagesByLog.length ? stagesByLog : stages} currentStageId={prospectStageId} onChangeStage={handleStageChange} />
          </Section>

          <Section icon={<HistoryRounded />} title="Activity Summary" subtitle="A quick read of all interactions captured for this prospect">
            <ActivitySummary summary={details.activity_summary} />
          </Section>

          <Section icon={<AddCommentRounded />} title="Engagement Center" subtitle="Log activity, send email, schedule meetings, or create a task">
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                mb: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
                "& .MuiTab-root": { fontWeight: 700, minHeight: 44 },
              }}
            >
              {TABS.map((tab, index) => (
                <Tab key={tab.label} icon={tab.icon} iconPosition="start" label={tab.label} value={index} />
              ))}
            </Tabs>

            {tabValue === 0 && (
              <Stack spacing={2}>
                <TextField
                  multiline
                  minRows={4}
                  label="Log Description"
                  placeholder="Write what happened, what the client asked for, and the next step."
                  fullWidth
                  value={logNote}
                  onChange={(event) => setLogNote(event.target.value)}
                />
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {ACTIVITY_ACTIONS.map((action) => (
                    <Button
                      key={action.type}
                      variant="outlined"
                      startIcon={action.icon}
                      onClick={() => addLogActivity(action.type)}
                      sx={{
                        borderRadius: 2,
                        fontWeight: 700,
                        color: theme.palette[action.tone]?.main || theme.palette.primary.main,
                        borderColor: alpha(theme.palette[action.tone]?.main || theme.palette.primary.main, 0.45),
                      }}
                    >
                      {action.label}
                    </Button>
                  ))}
                </Stack>
                <Grid container spacing={1.5}>
                  {ACTIVITY_TEMPLATES.map((template, index) => (
                    <Grid item xs={12} md={6} key={template}>
                      <Paper
                        elevation={0}
                        onClick={() => setLogNote(template)}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          cursor: "pointer",
                          bgcolor: theme.palette.background.default,
                          border: `1px solid ${theme.palette.divider}`,
                          "&:hover": { borderColor: alpha(theme.palette.primary.main, 0.55) },
                        }}
                      >
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
                          Template {index + 1}
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
                          {template}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            )}
            {tabValue === 1 && <EmailForm emailList={contactPersonList} />}
            {tabValue === 2 && <MeetingForm meetingTitlee={meetingTitle} prospectId={details?.id} />}
            {tabValue === 3 && <AddTaskFormProspect prospect_id={details?.id} />}
          </Section>
        </Stack>
      </Box>

      <Box sx={{ mt: 2.5 }}>
        <LogActivityList id={id} logActivityListData={logActivityList} />
      </Box>

      <Snackbar open={alertOpen} autoHideDuration={3000} onClose={() => setAlertOpen(false)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={() => setAlertOpen(false)} severity={alertType} sx={{ width: "100%", borderRadius: 2 }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}