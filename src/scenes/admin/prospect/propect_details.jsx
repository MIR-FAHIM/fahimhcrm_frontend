import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import LogActivityList from "./prospect_log_activity/fetch_prospect_log_activity";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchEmployees } from "../../../api/controller/admin_controller/user_controller";
import { useNavigate } from "react-router-dom";
import {
  getAllLogActivityOfProspect,
  addConcernPersonsMultiple,
} from "../../../api/controller/admin_controller/prospect_controller";
import { addOpportunity } from "../../../api/controller/admin_controller/opportunity_controller";
import OpportunityComponent from "./components/opportunity_components";
import {
  Box,
  Typography,
  Paper,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  Accordion,
  AccordionSummary,
  Select,
  AccordionDetails,
  Chip,
  IconButton,
  Stack,
  TextField,
  Checkbox,
  Tooltip,
  Button,
  Tabs,
  ListItemText,
  MenuItem,
  Tab,
  Snackbar,
  Alert,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import {
  changeProspectStatus,
  getProspectAllStatus,
  getProspectStagesByLog,
  getProspectDetails,
  addLogActivityProspect,
  getContactPersonProspect,
  getAssignedPersonsProspect,
  removeAssignPerson,
  updateProspect,
} from "../../../api/controller/admin_controller/prospect_controller";
import EmailForm from "./form/email_form";
import AdressProspect from "./components/address_prospect_update";
import MeetingForm from "./form/meeting_form";
import AddTaskFormProspect from "./form/task_prospect";
import ContactPersonsProspect from "./components/contact_person_of_prospect";
import DetailsProspectInfo from "./components/details_info_component";
import { tokens } from "../../../theme";

export default function ProspectDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [logActivityList, setLogActivityList] = useState([]);
  const { control, handleSubmit, setValue, watch } = useForm();
  const [tabValue, setTabValue] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [prospectStageId, setProspectStage] = useState(0);
  const [stages, setStages] = useState([]);
  const [stagesByLog, setStagesByLog] = useState([]);
  const [assignedPersons, setAssignedPersons] = useState([]);
  const [contactPersonList, setContactPersonList] = useState([]);
  const [details, setProspectDetail] = useState({});
  const [form, setForm] = useState({ prospect_id: "", stage_id: "" });
  const [concernPersons, setConcernPersons] = useState({
    prospect_id: 1,
    assign_to_ids: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState("");
  const handleSave = () => {
    setIsEditing(false);
    onSave(text);
  };
  const [logNote, setLogNote] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const userID = localStorage.getItem("userId");

  const handleAlert = (message, type = "success") => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertOpen(true);
  };

  const handleConcernsChange = (event) => {
    const { name, value } = event.target;
    setConcernPersons((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const removeAssignedPerson = async (empId) => {
    await removeAssignPerson({
      prospect_id: id,
      employee_id: empId,
    });
    const assignedPersonsRes = await getAssignedPersonsProspect(id);
    if (assignedPersonsRes.status === "success") {
      setAssignedPersons(assignedPersonsRes.data);
    }
  };

  const updateProspectInfo = async (data) => {
    const updateRes = await updateProspect(data);
    if (updateRes.status === "success") {
      const detailsRes = await getProspectDetails(id);
      if (detailsRes.status === "success") {
        setProspectDetail(detailsRes.data);
        setProspectStage(detailsRes.data.stage_id);
      }
      setIsEditing(false);
    }
  };

  const addMultipleConernPersons = async () => {
    const payload = {
      prospect_id: id,
      employees: concernPersons.assign_to_ids.map((id) => ({
        employee_id: id,
        is_active: 0,
        notify: 0,
      })),
    };
    await addConcernPersonsMultiple(payload);
    const assignedPersonsRes = await getAssignedPersonsProspect(id);
    if (assignedPersonsRes.status === "success") {
      setAssignedPersons(assignedPersonsRes.data);
    }
  };

  const activityColors = {
    general: colors.orangeAccent[900],
    task: colors.blueAccent[500],
    call: colors.redAccent[900],
    email: colors.purpleAccent[900],
    whatsapp: colors.greenAccent[900],
    visit: colors.redAccent[900],
    message: colors.gray[900],
    meeting: colors.orangeAccent[900],
  };

  const handleChange = async (stageID) => {
    setForm((prev) => ({ ...prev, stage_id: stageID }));
    try {
      await changeProspectStatus({
        prospect_id: id,
        stage_id: stageID,
        user_id: userID,
      });
      const response = await getProspectDetails(id);
      if (response.status === "success") {
        setProspectDetail(response.data);
        setProspectStage(response.data.stage_id);
        const stagesResByLog = await getProspectStagesByLog({
          prospect_id: id,
        });
        if (stagesResByLog.status === "success") {
          setStagesByLog(stagesResByLog.data);
        }
      }
    } catch (error) {
      console.error("Error changing status:", error);
      handleAlert("Failed to change status", "error");
    }
  };

  const addLogActivity = async (activity_type) => {
    try {
      const response = await addLogActivityProspect({
        prospect_id: id,
        activity_type: activity_type,
        title: `${activity_type} a prospect`,
        notes: logNote,
        activity_time: "",
        related_id: "",
        created_by: 1,
      });
      if (response.status === true) {
        const logActivityRes = await getAllLogActivityOfProspect(id);
        if (logActivityRes.status === true) {
          setLogActivityList(logActivityRes.data);
        }
        handleAlert(`${activity_type} logged successfully`);
        setLogNote("");
      } else {
        handleAlert("Failed to log activity", "error");
      }
    } catch (err) {
      console.error(err);
      handleAlert("Error logging activity", "error");
    }
  };

  const onToggleOpportunityController = async (data) => {
    const updateRes = await updateProspect(data);
    if (updateRes.status === "success") {
      const detailsRes = await getProspectDetails(id);
      if (detailsRes.status === "success") {
        setProspectDetail(detailsRes.data);
        setProspectStage(detailsRes.data.stage_id);
      }
    }
  };

  const goToMap = async () => {
    navigate(`/googlemap-set/${id}/${details.latitude}/${details.longitude}`);
  };

  const onSubmitOpportunity = async (data) => {
    const addRes = await addOpportunity(data);
  };

  useEffect(() => {
    (async () => {
      try {
        const detailsRes = await getProspectDetails(id);
        if (detailsRes.status === "success") {
          setProspectDetail(detailsRes.data);
          setProspectStage(detailsRes.data.stage_id);
        }
        const stagesRes = await getProspectAllStatus();
        if (stagesRes.status === "success") {
          setStages(stagesRes.data);
        }
        const stagesResByLog = await getProspectStagesByLog({
          prospect_id: id,
        });
        if (stagesResByLog.status === "success") {
          setStagesByLog(stagesResByLog.data);
        }
        const assignedPersonsRes = await getAssignedPersonsProspect(id);
        if (assignedPersonsRes.status === "success") {
          setAssignedPersons(assignedPersonsRes.data);
        }
        const contactPersonRes = await getContactPersonProspect(id);
        if (contactPersonRes.status === "success") {
          setContactPersonList(contactPersonRes.data);
        }
        const logActivityRes = await getAllLogActivityOfProspect(id);
        if (logActivityRes.status === true) {
          setLogActivityList(logActivityRes.data);
        }
        fetchEmployees()
          .then((res) => setEmployees(res.data || []))
          .catch(console.error);
      } catch (err) {
        console.error("Fetch error", err);
      }
    })();
  }, [id]);

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  return (
    <Box sx={{ p: 3, backgroundColor: theme.palette.background.default, minHeight: "100vh" }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: colors.gray[100] }}>
        Lead
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
        }}
      >
        {/* Left Section */}
        <Box sx={{ width: { xs: "100%", md: "25%" } }}>
          <Paper sx={{ p: 3, backgroundColor: theme.palette.background.paper, borderRadius: 3, boxShadow: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                py: 1,
              }}
            >
              {isEditing ? (
                <>
                  <TextField
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    variant="standard"
                    size="small"
                    sx={{
                      minWidth: 200,
                      "& input": {
                        fontSize: "1rem",
                        color: colors.blueAccent[500],
                      },
                    }}
                  />
                  <IconButton
                    onClick={() =>
                      updateProspectInfo({ prospect_id: id, prospect_name: text })
                    }
                    size="small"
                    color="primary"
                    sx={{ ml: 0.5, color: colors.blueAccent[500] }}
                  >
                    <SaveIcon fontSize="small" />
                  </IconButton>
                </>
              ) : (
                <>
                  <Typography
                    variant="h6"
                    sx={{
                      color: colors.blueAccent[500],
                      fontWeight: 500,
                    }}
                  >
                    {details.prospect_name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setText(details.prospect_name);
                      setIsEditing(true);
                    }}
                    sx={{
                      ml: 0.5,
                      p: 0.5,
                      color: colors.gray[400],
                      "&:hover": {
                        backgroundColor: "transparent",
                        color: colors.gray[100],
                      },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </>
              )}
            </Box>
            <OpportunityComponent details={details} onToggleOpportunity={onToggleOpportunityController} onSubmitOpportunity={onSubmitOpportunity} />
            <Typography variant="caption" display="block" gutterBottom sx={{ color: colors.gray[400] }}>
              Created: Mehrun Nesa on {dayjs(details.created_at).format("MMMM D, YYYY")}
            </Typography>

            <AdressProspect details={details} onAddressUpdate={updateProspectInfo} />
            <Button
              variant="outlined"
              onClick={goToMap}
              sx={{
                backgroundColor: theme.palette.background.paper,
                borderColor: colors.blueAccent[500],
                borderWidth: 2,
                borderRadius: 1,
                whiteSpace: "nowrap",
                color: colors.blueAccent[500],
                '&:hover': {
                  backgroundColor: colors.blueAccent[900],
                  borderColor: colors.blueAccent[700],
                  color: colors.blueAccent[100],
                }
              }}
            >
              View Map
            </Button>
            <Divider sx={{ my: 2, backgroundColor: colors.gray[700] }} />
            <ContactPersonsProspect contactPersonList={contactPersonList} />
            {(details.is_opportunity === 0 ? ["Assigned To", "Details", "Attached Files"] : ["Assigned To", "Details", "Attached Files", "Leads", "Quotations", "Orders"])
              .map((label, i) => (
                <Accordion key={i} sx={{ mt: 2, backgroundColor: theme.palette.background.paper, color: colors.gray[100] }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: colors.gray[100] }} />}>
                    {label}
                  </AccordionSummary>
                  <AccordionDetails>
                    {label === 'Details' ?
                      <DetailsProspectInfo details={details} onAddressUpdate={removeAssignedPerson} />
                      :
                      label === "Assigned To" ?
                        <Box>
                          <Box sx={{ mb: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 2,
                                flexWrap: "wrap",
                              }}
                            >
                              <FormControl fullWidth sx={{ flex: 1, minWidth: 250 }}>
                                <InputLabel id="assign-to-label" sx={{ color: colors.gray[400] }}>Assign To</InputLabel>
                                <Select
                                  labelId="assign-to-label"
                                  multiple
                                  name="assign_to_ids"
                                  value={concernPersons.assign_to_ids}
                                  onChange={handleConcernsChange}
                                  renderValue={(selected) =>
                                    employees
                                      .filter((e) => selected.includes(e.id))
                                      .map((e) => e.name)
                                      .join(", ")
                                  }
                                  sx={{ color: colors.gray[100] }}
                                >
                                  {employees.map((option) => (
                                    <MenuItem key={option.id} value={option.id}>
                                      <Checkbox checked={concernPersons.assign_to_ids.includes(option.id)} sx={{ color: colors.greenAccent[500] }} />
                                      <ListItemText primary={option.name} />
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                              <Button
                                variant="contained"
                                onClick={addMultipleConernPersons}
                                sx={{
                                  whiteSpace: "nowrap",
                                  backgroundColor: colors.greenAccent[500],
                                  color: colors.gray[500],
                                  "&:hover": { backgroundColor: colors.greenAccent[700] },
                                }}
                              >
                                Add
                              </Button>
                            </Box>
                          </Box>
                          <Box
                            sx={{
                              maxHeight: 250,
                              overflowY: "auto",
                              mt: 1,
                              pr: 1,
                            }}
                          >
                            {assignedPersons && assignedPersons.length > 0 ? (
                              assignedPersons.map((person) => (
                                <Box
                                  key={person.id}
                                  sx={{
                                    mb: 1.5,
                                    p: 1.5,
                                    backgroundColor: colors.primary[700],
                                    borderRadius: 2,
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <Box>
                                    <Typography variant="body1" fontWeight="bold" sx={{ color: colors.gray[100] }}>
                                      {person.employee.name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: colors.gray[400] }}>
                                      📱 {person.employee.phone}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: colors.blueAccent[300] }}>
                                      ✉️ {person.employee.email}
                                    </Typography>
                                  </Box>
                                  <IconButton
                                    onClick={() => removeAssignedPerson(person.employee.id)}
                                    sx={{ color: colors.redAccent[500] }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Box>
                              ))
                            ) : (
                              <Typography variant="body2" sx={{ color: colors.gray[400] }} mt={1}>
                                No concerned persons assigned.
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        : <Box></Box>
                    }
                  </AccordionDetails>
                </Accordion>
              ))}
          </Paper>
        </Box>

        {/* Right Section */}
        <Box sx={{ width: { xs: "100%", md: "75%" } }}>
          <Paper sx={{ p: 3, mb: 3, backgroundColor: theme.palette.background.paper, borderRadius: 3, boxShadow: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                flexWrap: "wrap",
                mb: 2,
                justifyContent: "space-between",
              }}
            >
              {details.created_at && (
                <Typography variant="body2" sx={{ color: colors.gray[400] }}>
                  {`Since ${Math.floor((new Date() - new Date(details.created_at)) / (1000 * 60 * 60 * 24))} days`}
                </Typography>
              )}
              <Box sx={{ minWidth: 250 }}>
                <TextField
                  select
                  fullWidth
                  name="stage_id"
                  label="Change Stage"
                  value={form.stage_id}
                  onChange={(e) => handleChange(e.target.value)}
                  sx={{ color: colors.gray[100] }}
                >
                  {stages.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.stage_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1.5,
                  p: 1,
                  backgroundColor: colors.gray[900],
                  borderRadius: 2,
                  boxShadow: 1,
                }}
              >
                {details.activity_summary &&
                  Object.entries(details.activity_summary).map(([type, count]) => (
                    <Box
                      key={type}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: 1.5,
                        py: 0.5,
                        backgroundColor: activityColors[type] || colors.primary[800],
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: "bold", textTransform: "capitalize", color: colors.gray[100] }}>
                        {type}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.gray[100] }}>{count}</Typography>
                    </Box>
                  ))}
              </Box>
            </Box>
            <Box sx={{ overflowX: "auto", py: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  minWidth: "600px",
                }}
              >
                {stagesByLog.map((stage, index) => {
                  const isCompleted = stage.id < prospectStageId;
                  const isCurrent = stage.id === prospectStageId;
                  const tooltipTitle = stage.last_updated_at
                    ? `Last Updated: ${stage.last_updated_at}\nBy ${stage.changed_by_name}`
                    : "Not yet visited";
                  return (
                    <Box key={stage.id} sx={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
                      <Tooltip title={<Typography sx={{ whiteSpace: 'pre-line' }}>{tooltipTitle}</Typography>} arrow>
                        <Chip
                          label={stage.stage_name}
                          color={isCurrent || isCompleted ? "success" : "default"}
                          variant={isCurrent ? "filled" : "outlined"}
                          sx={{ cursor: "pointer" }}
                        />
                      </Tooltip>
                      {stage.last_updated_at && (
                        <Typography variant="caption" sx={{ color: colors.gray[400], mt: 0.5 }}>
                          {new Date(stage.last_updated_at).toLocaleDateString()}
                        </Typography>
                      )}
                      {index !== stagesByLog.length - 1 && (
                        <Box sx={{ width: 20, height: 2, backgroundColor: colors.gray[600], mx: 1 }} />
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: colors.gray[700], mb: 2 }}>
              {["Log Activity", "Email", "Meeting", "Task"].map((label, index) => (
                <Tab key={index} label={label} sx={{ color: colors.gray[100] }} />
              ))}
            </Tabs>
            {tabValue === 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  multiline
                  rows={3}
                  label="Log Description"
                  variant="outlined"
                  fullWidth
                  value={logNote}
                  onChange={(e) => setLogNote(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: colors.gray[100],
                      "& fieldset": { borderColor: colors.gray[700] },
                      "&:hover fieldset": { borderColor: colors.gray[500] },
                      "&.Mui-focused fieldset": { borderColor: colors.blueAccent[500] },
                    },
                    "& .MuiInputLabel-root": { color: colors.gray[400] },
                  }}
                />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap">
                  <Button variant="outlined" onClick={() => addLogActivity("call")} sx={{ color: colors.greenAccent[500], borderColor: colors.greenAccent[500] }}>Log a Call</Button>
                  <Button variant="outlined" onClick={() => addLogActivity("email")} sx={{ color: colors.greenAccent[500], borderColor: colors.greenAccent[500] }}>Log an E-mail</Button>
                  <Button variant="outlined" onClick={() => addLogActivity("meeting")} sx={{ color: colors.greenAccent[500], borderColor: colors.greenAccent[500] }}>Log a Meeting</Button>
                  <Button variant="outlined" onClick={() => addLogActivity("visit")} sx={{ color: colors.greenAccent[500], borderColor: colors.greenAccent[500] }}>Visit Log</Button>
                  <Button variant="outlined" onClick={() => addLogActivity("whatsapp")} sx={{ color: colors.greenAccent[500], borderColor: colors.greenAccent[500] }}>Whatsapp</Button>
                </Stack>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" sx={{ color: colors.gray[100], mb: 2 }}>
                    Templates
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ color: colors.gray[100], mb: 1 }}>
                        Favorite Templates
                      </Typography>
                      <Box sx={{ height: 175, overflow: 'auto', pr: 1 }}>
                        {[
                          "Called the client – no answer", "Spoke over WhatsApp – client asked for brochure",
                          "Sent follow-up email regarding product demo", "Visited office – client was not available",
                          "Client requested a call back via WhatsApp", "Had a brief call – client asked for pricing details",
                          "Emailed updated proposal", "Visited client – gave live demo",
                          "Shared product catalog on WhatsApp", "Follow-up call made – spoke with assistant",
                          "Client responded on email, requested more info", "Left voicemail – awaiting response",
                          "Client said they will confirm demo date via WhatsApp", "Sent reminder email for scheduled meeting",
                          "Dropped by client’s office – they were in a meeting"
                        ].map((text, i) => (
                          <Paper key={i}
                            onClick={() => setLogNote(text)}
                            sx={{ p: 2, mt: 1, backgroundColor: colors.primary[700], color: colors.gray[100], cursor: 'pointer' }}>
                            {text}
                          </Paper>
                        ))}
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ color: colors.gray[100], mb: 1 }}>
                        All Templates
                      </Typography>
                      <Box sx={{ height: 175, overflow: 'auto', pr: 1 }}>
                        {[
                          "Called the client – no answer", "Spoke over WhatsApp – client asked for brochure",
                          "Sent follow-up email regarding product demo", "Visited office – client was not available",
                          "Client requested a call back via WhatsApp", "Had a brief call – client asked for pricing details",
                          "Emailed updated proposal", "Visited client – gave live demo",
                          "Shared product catalog on WhatsApp", "Follow-up call made – spoke with assistant",
                          "Client responded on email, requested more info", "Left voicemail – awaiting response",
                          "Client said they will confirm demo date via WhatsApp", "Sent reminder email for scheduled meeting",
                          "Dropped by client’s office – they were in a meeting"
                        ].map((text, i) => (
                          <Paper key={i}
                            onClick={() => setLogNote(text)}
                            sx={{ p: 2, mt: 1, backgroundColor: colors.primary[700], color: colors.gray[100], cursor: 'pointer' }}>
                            {text}
                          </Paper>
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            ) : tabValue === 1 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <EmailForm emailList={contactPersonList} />
              </Box>
            ) : tabValue === 2 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <MeetingForm meetingTitlee={`We have a meeting with ${details?.prospect_name}`} prospectId={details?.id} />
              </Box>
            ) : tabValue === 3 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <AddTaskFormProspect prospect_id={details?.id} />
              </Box>
            ) : (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" sx={{ color: colors.gray[400] }}>
                  This is a simple component for the "{["Log Activity", "Email", "Call", "Meeting", "Other"][tabValue]}" tab.
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
      <LogActivityList id={id} logActivityListData={logActivityList} />
      <Snackbar open={alertOpen} autoHideDuration={3000} onClose={() => setAlertOpen(false)}>
        <Alert onClose={() => setAlertOpen(false)} severity={alertType} sx={{ width: "100%" }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}