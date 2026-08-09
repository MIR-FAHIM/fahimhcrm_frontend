import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import BusinessCenterRoundedIcon from "@mui/icons-material/BusinessCenterRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import SourceRoundedIcon from "@mui/icons-material/SourceRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import ClientTicket from "./components/ticket";
import ClientTask from "./components/client_task";
import MeetingForm from "../prospect/form/meeting_form";
import { addTicket, getClientDetails } from "../../../api/controller/admin_controller/client_controller";

const mockPriorities = [
  { id: 1, priority_name: "Important" },
  { id: 2, priority_name: "Urgent" },
  { id: 3, priority_name: "Low" },
];

const mockTypes = ["tech", "billing", "support"];

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "CL";

const getLocationName = (relation, directValue) =>
  relation?.name ||
  relation?.division_name ||
  relation?.district_name ||
  relation?.thana_name ||
  relation?.upazila_name ||
  directValue ||
  "";

const InfoCard = ({ icon, label, value, action }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.6,
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        minHeight: 92,
      }}
    >
      <Stack direction="row" spacing={1.2} alignItems="flex-start">
        {icon && (
          <Avatar
            variant="rounded"
            sx={{
              width: 34,
              height: 34,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
            }}
          >
            {icon}
          </Avatar>
        )}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 650 }}>
            {label}
          </Typography>
          <Typography
            variant="body2"
            title={value || "-"}
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 700,
              mt: 0.4,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {value || "-"}
          </Typography>
          {action}
        </Box>
      </Stack>
    </Paper>
  );
};

const EmptyPanel = ({ icon, title, subtitle }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 5,
        textAlign: "center",
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        border: `1px dashed ${theme.palette.divider}`,
      }}
    >
      <Avatar variant="rounded" sx={{ mx: "auto", mb: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.12), color: theme.palette.primary.main }}>
        {icon}
      </Avatar>
      <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
        {subtitle}
      </Typography>
    </Paper>
  );
};

const ClientDetails = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;
  const brandDark = theme.palette.blueAccent?.dark ?? theme.palette.primary.dark;
  const brandContrast = theme.palette.blueAccent?.contrastText ?? theme.palette.primary.contrastText;

  const [activeTab, setActiveTab] = useState("tickets");
  const [clientDetails, setClientDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketRefreshKey, setTicketRefreshKey] = useState(0);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    type: "",
    issue_id: "",
    priority_id: "",
    is_urgent: false,
    category: "",
  });

  const prospect = clientDetails?.prospect || {};
  const clientName = prospect?.prospect_name || "Client";
  const meetingTitle = `We have a meeting with ${clientName}`;
  const createdAt = prospect?.created_at ? dayjs(prospect.created_at).format("MMM D, YYYY · h:mm A") : "-";

  const divisionName = getLocationName(prospect?.division || clientDetails?.division, prospect?.division_name || clientDetails?.division_name);
  const districtName = getLocationName(prospect?.district || clientDetails?.district, prospect?.district_name || clientDetails?.district_name);
  const thanaName = getLocationName(
    prospect?.thana || prospect?.upazila || clientDetails?.thana || clientDetails?.upazila,
    prospect?.thana_name || prospect?.upazila_name || clientDetails?.thana_name || clientDetails?.upazila_name
  );

  const tabs = useMemo(
    () => [
      { value: "tickets", label: "Tickets", icon: <SupportAgentRoundedIcon fontSize="small" /> },
      { value: "tasks", label: "Tasks", icon: <TaskAltRoundedIcon fontSize="small" /> },
      { value: "meeting", label: "Meeting", icon: <EventRoundedIcon fontSize="small" /> },
      { value: "communications", label: "Communications", icon: <TimelineRoundedIcon fontSize="small" /> },
      { value: "files", label: "Files", icon: <FolderRoundedIcon fontSize="small" /> },
    ],
    []
  );

  const showSnack = (msg, sev = "success") => setSnack({ open: true, msg, sev });

  const fetchClientDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getClientDetails(id);
      if (res?.status === "success") {
        setClientDetails(res.data || {});
      } else {
        setError(res?.message || "Failed to fetch client details.");
      }
    } catch (err) {
      console.error("Error fetching client details:", err);
      setError("Failed to fetch client details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientDetails();
  }, [id]);

  const handleCloseForm = () => {
    if (submittingTicket) return;
    setIsFormOpen(false);
    setNewTicket({
      subject: "",
      description: "",
      type: "",
      issue_id: "",
      priority_id: "",
      is_urgent: false,
      category: "",
    });
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setNewTicket((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setSubmittingTicket(true);
    try {
      const ticketData = { ...newTicket, client_id: id };
      const res = await addTicket(ticketData);
      if (res?.status && res.status !== "success") {
        showSnack(res.message || "Failed to create ticket.", "error");
        return;
      }
      showSnack("Ticket submitted successfully.");
      setTicketRefreshKey((current) => current + 1);
      handleCloseForm();
      setActiveTab("tickets");
    } catch (err) {
      console.error("Failed to submit ticket:", err);
      showSnack(err?.response?.data?.message || "Failed to submit ticket.", "error");
    } finally {
      setSubmittingTicket(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: "100vh", bgcolor: theme.palette.background.default }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 2, bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, textAlign: "center" }}>
          <CircularProgress sx={{ color: brand, mb: 2 }} />
          <Typography sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>Loading client workspace</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: theme.palette.background.default, p: { xs: 2, md: 4 } }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} sx={{ mb: 2.5 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <IconButton onClick={() => navigate("/client-list")} sx={{ border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.paper }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 700, lineHeight: 1 }}>
              Client Details
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Support tickets, tasks, communication notes, and client context.
            </Typography>
          </Box>
        </Stack>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsFormOpen(true)}
          sx={{ bgcolor: brand, color: brandContrast, fontWeight: 700, "&:hover": { bgcolor: brandDark } }}
        >
          Add New Ticket
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 2.5,
          borderRadius: 2.5,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          background:
            theme.palette.mode === "dark"
              ? `linear-gradient(135deg, ${alpha(brand, 0.20)}, ${alpha(theme.palette.background.paper, 0.98)} 48%)`
              : `linear-gradient(135deg, ${alpha(brand, 0.10)}, ${theme.palette.background.paper} 48%)`,
        }}
      >
        <Stack direction={{ xs: "column", lg: "row" }} spacing={2.5} justifyContent="space-between" alignItems={{ xs: "flex-start", lg: "center" }}>
          <Stack direction="row" spacing={1.75} alignItems="center">
            <Avatar
              sx={{
                width: 72,
                height: 72,
                bgcolor: alpha(brand, 0.14),
                color: brand,
                border: `1px solid ${alpha(brand, 0.28)}`,
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              {getInitials(clientName)}
            </Avatar>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 700, lineHeight: 1.05 }}>
                  {clientName}
                </Typography>
                <Chip label={`Client #${clientDetails?.id || id}`} size="small" sx={{ bgcolor: alpha(brand, 0.12), color: brand, fontWeight: 700 }} />
              </Stack>
              <Typography sx={{ color: theme.palette.text.secondary, mt: 0.7 }}>
                {prospect?.address || "No address added yet."}
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1.25 }}>
                <Chip icon={<BusinessCenterRoundedIcon />} label={prospect?.industry_type?.industry_type_name || "Industry not set"} variant="outlined" sx={{ fontWeight: 650 }} />
                <Chip icon={<SourceRoundedIcon />} label={prospect?.information_source?.information_source_name || "Source not set"} variant="outlined" sx={{ fontWeight: 650 }} />
                <Chip icon={<ArticleRoundedIcon />} label={`Created ${createdAt}`} variant="outlined" sx={{ fontWeight: 650 }} />
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={3.5}>
          <Stack spacing={1.5}>
            <InfoCard icon={<LocationOnRoundedIcon fontSize="small" />} label="Address" value={prospect?.address} />
            {divisionName && <InfoCard label="Division" value={divisionName} />}
            {districtName && <InfoCard label="District" value={districtName} />}
            {thanaName && <InfoCard label="Upazila / Thana" value={thanaName} />}
            <InfoCard
              icon={<LanguageRoundedIcon fontSize="small" />}
              label="Website"
              value={prospect?.website_link}
              action={
                prospect?.website_link ? (
                  <Button size="small" href={prospect.website_link} target="_blank" rel="noreferrer" sx={{ mt: 0.5, px: 0, fontWeight: 700 }}>
                    Open Website
                  </Button>
                ) : null
              }
            />
            <InfoCard icon={<NotesRoundedIcon fontSize="small" />} label="Note" value={prospect?.note} />
          </Stack>
        </Grid>

        <Grid item xs={12} lg={8.5}>
          <Paper elevation={0} sx={{ borderRadius: 2, bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, overflow: "hidden" }}>
            <Tabs
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                px: 1,
                borderBottom: `1px solid ${theme.palette.divider}`,
                ".MuiTabs-indicator": { bgcolor: brand, height: 3, borderRadius: 999 },
                ".MuiTab-root": {
                  minHeight: 58,
                  textTransform: "none",
                  fontWeight: 700,
                  color: theme.palette.text.secondary,
                  borderRadius: 1.5,
                  "&:hover": { bgcolor: alpha(brand, 0.08), color: theme.palette.text.primary },
                  "&.Mui-selected": { color: brand, bgcolor: alpha(brand, 0.10) },
                },
              }}
            >
              {tabs.map((tab) => (
                <Tab key={tab.value} value={tab.value} icon={tab.icon} iconPosition="start" label={tab.label} />
              ))}
            </Tabs>
            <Box sx={{ p: { xs: 1.5, md: 2 }, minHeight: 560 }}>
              {activeTab === "tickets" && <ClientTicket clientId={id} refreshKey={ticketRefreshKey} />}
              {activeTab === "tasks" && <ClientTask clntID={id} />}
              {activeTab === "meeting" && (
                prospect?.id ? (
                  <MeetingForm prospectId={prospect.id} meetingTitlee={meetingTitle} />
                ) : (
                  <EmptyPanel icon={<EventRoundedIcon />} title="No prospect link found" subtitle="This client needs a linked prospect before meetings can be scheduled." />
                )
              )}
              {activeTab === "communications" && (
                <EmptyPanel icon={<TimelineRoundedIcon />} title="No communication timeline yet" subtitle="Call notes, emails, and client updates can be organized here." />
              )}
              {activeTab === "files" && (
                <EmptyPanel icon={<FolderRoundedIcon />} title="No files attached yet" subtitle="Client documents and shared assets can be shown here when available." />
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={isFormOpen} onClose={handleCloseForm} fullWidth maxWidth="sm" PaperProps={{ sx: { bgcolor: theme.palette.background.paper, color: theme.palette.text.primary } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Add New Ticket</DialogTitle>
        <Box component="form" onSubmit={handleFormSubmit}>
          <DialogContent dividers sx={{ borderColor: theme.palette.divider }}>
            <Stack spacing={2}>
              <TextField name="subject" label="Subject" fullWidth required value={newTicket.subject} onChange={handleFormChange} />
              <TextField name="description" label="Description" fullWidth multiline minRows={4} value={newTicket.description} onChange={handleFormChange} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField name="type" label="Type" select fullWidth value={newTicket.type} onChange={handleFormChange}>
                    {mockTypes.map((type) => (
                      <MenuItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="priority_id" label="Priority" select fullWidth value={newTicket.priority_id} onChange={handleFormChange}>
                    {mockPriorities.map((priority) => (
                      <MenuItem key={priority.id} value={priority.id}>{priority.priority_name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="issue_id" label="Issue ID" type="number" fullWidth value={newTicket.issue_id} onChange={handleFormChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="category" label="Category" fullWidth value={newTicket.category} onChange={handleFormChange} />
                </Grid>
              </Grid>
              <Divider />
              <FormControlLabel control={<Switch checked={newTicket.is_urgent} onChange={handleFormChange} name="is_urgent" />} label="Mark as urgent" />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseForm} disabled={submittingTicket}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submittingTicket} startIcon={submittingTicket ? <CircularProgress size={16} color="inherit" /> : <AddIcon />} sx={{ bgcolor: brand, color: brandContrast, fontWeight: 700, "&:hover": { bgcolor: brandDark } }}>
              Add Ticket
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((state) => ({ ...state, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.sev} sx={{ width: "100%" }} onClose={() => setSnack((state) => ({ ...state, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClientDetails;
