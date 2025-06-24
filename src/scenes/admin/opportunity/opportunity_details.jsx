import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import LogActivityList from "../prospect/prospect_log_activity/fetch_prospect_log_activity";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchEmployees } from "../../../api/controller/admin_controller/user_controller";
import {
  getAllLogActivityOfProspect,
  addConcernPersonsMultiple,
} from "../../../api/controller/admin_controller/prospect_controller";
import {

  getOpportunityDetail,
} from "../../../api/controller/admin_controller/opportunity_controller";

import OpportunityComponent from "../prospect/components/opportunity_components";
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
import EmailForm from "../prospect/form/email_form";
import AdressProspect from "../prospect/components/address_prospect_update";
import MeetingForm from "../prospect/form/meeting_form";
import AddTaskFormProspect from "../prospect/form/task_prospect";
import ContactPersonsProspect from "../prospect/components/contact_person_of_prospect";
import DetailsProspectInfo from "../prospect/components/details_info_component";

export default function OpportunityDetailsPage() {
  const { id } = useParams();
  const [logActivityList, setLogActivityList] = useState([]);
  const { control, handleSubmit, setValue, watch } = useForm();
  const [tabValue, setTabValue] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [prospectStageId, setProspectStage] = useState(0);
  const [prospectID, setProspectID] = useState(0);
  const [stages, setStages] = useState([]);
  const [stagesByLog, setStagesByLog] = useState([]);
  const [assignedPersons, setAssignedPersons] = useState([]);
  const [contactPersonList, setContactPersonList] = useState([]);
  const [details, setProspectDetail] = useState({});
  const [detailsOpportunity, setOpportunity] = useState({});
  const [form, setForm] = useState({ prospect_id: "", stage_id: "" });
  const [concernPersons, setConcernPersons] = useState({
    prospect_id: 1,
    assign_to_ids: [], // for employee_id array
  });
  // for update info
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState('');
  const handleSave = () => {
    setIsEditing(false);
    onSave(text);
  };

  // for update info end 


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
      'prospect_id': prospectID,
      'employee_id': empId,
    });
    const assignedPersonsRes = await getAssignedPersonsProspect(prospectID);
    if (assignedPersonsRes.status === "success") {
      setAssignedPersons(assignedPersonsRes.data);
    }
  };
  const updateProspectInfo = async (data) => {

    const updateRes = await updateProspect(data);
    if (updateRes.status === "success") {
      const detailsRes = await getProspectDetails(prospectID);
      if (detailsRes.status === "success") {
        setProspectDetail(detailsRes.data);
        setProspectStage(detailsRes.data.stage_id);
      }
      setIsEditing(false);

    }
  };
  const addMultipleConernPersons = async () => {
    const payload = {
      prospect_id: prospectID,
      employees: concernPersons.assign_to_ids.map((id) => ({
        employee_id: id,
        is_active: 0,
        notify: 0,
      })),
    };
    await addConcernPersonsMultiple(payload);
    const assignedPersonsRes = await getAssignedPersonsProspect(prospectID);
    if (assignedPersonsRes.status === "success") {
      setAssignedPersons(assignedPersonsRes.data);
    }
  };
  const activityColors = {
    general: "#fef3c7",   // light yellow
    task: "#e0f2fe",      // light blue
    call: "#fee2e2",      // light red
    email: "#ede9fe",     // light purple
    whatsapp: "#dcfce7",  // light green
    visit: "#fce7f3",     // light pink
    message: "#e2e8f0",   // default gray
    meeting: "#fff7ed",   // light orange
  };
  const handleChange = async (stageID) => {
    setForm((prev) => ({ ...prev, stage_id: stageID }));
    try {
      await changeProspectStatus({ prospect_id: prospectID, stage_id: stageID, user_id: userID });
      const response = await getProspectDetails(prospectID);
      if (response.status === "success") {
        setProspectDetail(response.data);
        setProspectStage(response.data.stage_id);
        const stagesResByLog = await getProspectStagesByLog({ prospect_id: prospectID });
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
        prospect_id: prospectID,
        activity_type: activity_type,
        title: `${activity_type} a prospect`,
        notes: logNote,
        activity_time: "",
        related_id: "",
        created_by: 1, // update this dynamically if needed
      });
      if (response.status === true) {
        const logActivityRes = await getAllLogActivityOfProspect(prospectID);
        if (logActivityRes.status === true) {
          setLogActivityList(logActivityRes.data);
        }
        handleAlert(`${activity_type} logged successfully`);
        setLogNote(""); // clear field
      } else {
        handleAlert("Failed to log activity", "error");
      }
    } catch (err) {
      console.error(err);
      handleAlert("Error logging activity", "error");
    }
  };



  const onToggleOpportunity = async (data) =>{
    const updateRes = await updateProspect(data);
    if (updateRes.status === "success") {
      const detailsRes = await getProspectDetails(prospectID);
      if (detailsRes.status === "success") {
        setProspectDetail(detailsRes.data);
        setProspectStage(detailsRes.data.stage_id);
      }
     
    }
  }

const getOpportunityDetails = async () => {
  try {
    const detailsOpporRes = await getOpportunityDetail(id);

    if (detailsOpporRes.status === "success") {
      const opportunityData = detailsOpporRes.data;
      const prospectID = opportunityData.prospect_id;

      setOpportunity(opportunityData);
      setProspectID(prospectID); // still update state if needed

      // Fetch Prospect Details
      const detailsRes = await getProspectDetails(prospectID);
      if (detailsRes.status === "success") {
        setProspectDetail(detailsRes.data);
        setProspectStage(detailsRes.data.stage_id);
      }

      // Fetch All Stages
      const stagesRes = await getProspectAllStatus();
      if (stagesRes.status === "success") {
        setStages(stagesRes.data);
      }

      // Fetch Stages by Log
      const stagesResByLog = await getProspectStagesByLog({ prospect_id: prospectID });
      if (stagesResByLog.status === "success") {
        setStagesByLog(stagesResByLog.data);
      }

      // Fetch Assigned Persons
      const assignedPersonsRes = await getAssignedPersonsProspect(prospectID);
      if (assignedPersonsRes.status === "success") {
        setAssignedPersons(assignedPersonsRes.data);
      }

      // Fetch Contact Person
      const contactPersonRes = await getContactPersonProspect(prospectID);
      if (contactPersonRes.status === "success") {
        setContactPersonList(contactPersonRes.data);
      }

      // Fetch Log Activities
      const logActivityRes = await getAllLogActivityOfProspect(prospectID);
      if (logActivityRes.status === true) {
        setLogActivityList(logActivityRes.data);
      }
    }
  } catch (error) {
    console.error("Error in getOpportunityDetails:", error);
  }
};


  useEffect(() => {
    (async () => {
      try {
        getOpportunityDetails();
   
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
    <Box sx={{ p: 3, backgroundColor: "#eef2f7", minHeight: "100vh" }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "#1e293b" }}>
        Opportunity
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
          <Paper sx={{ p: 3, backgroundColor: "#ffffff", borderRadius: 3, boxShadow: 3 }}>
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
                        color: "#1e40af",
                      },
                    }}
                  />
                  <IconButton
                    onClick={() =>
                      updateProspectInfo({ prospect_id: id, prospect_name: text })
                    }
                    size="small"
                    color="primary"
                    sx={{ ml: 0.5 }}
                  >
                    <SaveIcon fontSize="small" />
                  </IconButton>
                </>
              ) : (
                <>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#1e40af",
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
                      color: "grey.500",
                      "&:hover": {
                        backgroundColor: "transparent",
                        color: "grey.700",
                      },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </>
              )}
            </Box>
            <Typography
                    variant="h6"
                    sx={{
                    
                      fontWeight: 300,
                    }}
                  >
                    
                     Opportunity ID: #{id}
                  </Typography>
            <Typography
                    variant="h6"
                    sx={{
                    
                      fontWeight: 300,
                    }}
                  >
                    
                     Lead ID: #{details.id}
                  </Typography>

            <Typography variant="caption" display="block" gutterBottom>
              Created: Mehrun Nesa on {dayjs(details.created_at).format("MMMM D, YYYY")}
            </Typography>

            <AdressProspect details={details} onAddressUpdate={updateProspectInfo} />
            <Divider sx={{ my: 2 }} />

            <ContactPersonsProspect contactPersonList={contactPersonList} />

            {(details.is_opportunity === 0 ? ["Assigned To", "Details", "Attached Files"]
            : ["Assigned To", "Details", "Attached Files", "Leads", "Quotations", "Orders"])
            .map((label, i) => (
              <Accordion key={i} sx={{ mt: 2 }}>
                
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  {label}
                </AccordionSummary>



                <AccordionDetails>

                  {label === 'Details' ?
                    <DetailsProspectInfo details={details} onAddressUpdate={removeAssignedPerson} />


                    :

                    label == "Assigned To"?

                    <Box>
                      <Box sx={{ mb: 2 }}>
                        {/* Dropdown and Add Button Row */}
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
                            <InputLabel id="assign-to-label">Assign To</InputLabel>
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
                            >
                              {employees.map((option) => (
                                <MenuItem key={option.id} value={option.id}>
                                  <Checkbox checked={concernPersons.assign_to_ids.includes(option.id)} />
                                  <ListItemText primary={option.name} />
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <Button
                            variant="contained"
                            color="primary"
                            sx={{ whiteSpace: "nowrap" }}
                            onClick={addMultipleConernPersons}
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
                                backgroundColor: "#f9f9f9",
                                borderRadius: 2,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Box>
                                <Typography variant="body1" fontWeight="bold">
                                  {person.employee.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  📱 {person.employee.phone}
                                </Typography>
                                <Typography variant="body2" color="primary">
                                  ✉️ {person.employee.email}
                                </Typography>
                              </Box>
                              <IconButton
                                color="error"
                                onClick={() => removeAssignedPerson(person.employee.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary" mt={1}>
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
          <Paper sx={{ p: 3, mb: 3, backgroundColor: "#ffffff", borderRadius: 3, boxShadow: 3 }}>
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
                <Typography variant="body2" color="text.secondary">
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
                >
                  {stages.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.stage_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* Activity Summary */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1.5,
                  p: 1,
                  backgroundColor: "#f9fafb",
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
                        backgroundColor: activityColors[type] || "#f1f5f9",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: "bold", textTransform: "capitalize" }}>
                        {type}
                      </Typography>
                      <Typography variant="caption">{count}</Typography>
                    </Box>
                  ))}
              </Box>
            </Box>


            {/* Stage timeline */}
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

                      {/* Optional: show date below chip instead of tooltip */}
                      {stage.last_updated_at && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                          {new Date(stage.last_updated_at).toLocaleDateString()}
                        </Typography>
                      )}

                      {index !== stagesByLog.length - 1 && (
                        <Box sx={{ width: 20, height: 2, backgroundColor: "#cbd5e1", mx: 1 }} />
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Tab Bar */}
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              {["Log Activity", "Email", "Meeting", "Task"].map((label, index) => (
                <Tab key={index} label={label} />
              ))}
            </Tabs>

            {/* Conditional Content */}
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
                />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap">
                  <Button variant="outlined" onClick={() => addLogActivity("call")}>Log a Call</Button>
                  <Button variant="outlined" onClick={() => addLogActivity("email")}>Log an E-mail</Button>
                  <Button variant="outlined" onClick={() => addLogActivity("meeting")}>Log a Meeting</Button>
                  <Button variant="outlined" onClick={() => addLogActivity("visit")}>Visit Log</Button>
                  <Button variant="outlined" onClick={() => addLogActivity("whatsapp")}>Whatsapp</Button>
                </Stack>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" sx={{ color: "#1e293b", mb: 2 }}>
                    Templates
                  </Typography>

                  <Grid container spacing={2}>
                    {/* Favorite Templates */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ color: "#1e293b", mb: 1 }}>
                        Favorite Templates
                      </Typography>
                      <Box sx={{ height: 175, overflow: 'auto', pr: 1 }}>
                        {[
                          "Called the client – no answer",
                          "Spoke over WhatsApp – client asked for brochure",
                          "Sent follow-up email regarding product demo",
                          "Visited office – client was not available",
                          "Client requested a call back via WhatsApp",
                          "Had a brief call – client asked for pricing details",
                          "Emailed updated proposal",
                          "Visited client – gave live demo",
                          "Shared product catalog on WhatsApp",
                          "Follow-up call made – spoke with assistant",
                          "Client responded on email, requested more info",
                          "Left voicemail – awaiting response",
                          "Client said they will confirm demo date via WhatsApp",
                          "Sent reminder email for scheduled meeting",
                          "Dropped by client’s office – they were in a meeting"
                        ].map((text, i) => (
                          <Paper key={i}
                            onClick={() => setLogNote(text)}
                            sx={{ p: 2, mt: 1, backgroundColor: "#f1f5f9" }}>
                            {text}
                          </Paper>
                        ))}
                      </Box>
                    </Grid>

                    {/* All Templates */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ color: "#1e293b", mb: 1 }}>
                        All Templates
                      </Typography>
                      <Box sx={{ height: 175, overflow: 'auto', pr: 1 }}>
                        {[
                          "Called the client – no answer",
                          "Spoke over WhatsApp – client asked for brochure",
                          "Sent follow-up email regarding product demo",
                          "Visited office – client was not available",
                          "Client requested a call back via WhatsApp",
                          "Had a brief call – client asked for pricing details",
                          "Emailed updated proposal",
                          "Visited client – gave live demo",
                          "Shared product catalog on WhatsApp",
                          "Follow-up call made – spoke with assistant",
                          "Client responded on email, requested more info",
                          "Left voicemail – awaiting response",
                          "Client said they will confirm demo date via WhatsApp",
                          "Sent reminder email for scheduled meeting",
                          "Dropped by client’s office – they were in a meeting"
                        ].map((text, i) => (
                          <Paper key={i}
                            onClick={() => setLogNote(text)}
                            sx={{ p: 2, mt: 1, backgroundColor: "#f1f5f9" }}>
                            {text}
                          </Paper>
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </Box>


              </Box>

            ) :
              tabValue === 1 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <EmailForm emailList={contactPersonList} />






                </Box>
              ) : tabValue === 2 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <MeetingForm meetingTitlee={`We have a meeting with ${details?.prospect_name}`} prospectId={details?.id} />



                </Box>
              ) :
                tabValue === 3 ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <AddTaskFormProspect prospect_id={details?.id} />



                  </Box>
                ) :
                  (
                    <Box sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        This is a simple component for the "{["Log Activity", "Email", "Call", "Meeting", "Other"][tabValue]}" tab.
                      </Typography>
                    </Box>
                  )}
          </Paper>
        </Box>


      </Box>
      <LogActivityList id={id} logActivityListData={logActivityList} />
      {/* Snackbar for feedback */}
      <Snackbar open={alertOpen} autoHideDuration={3000} onClose={() => setAlertOpen(false)}>
        <Alert onClose={() => setAlertOpen(false)} severity={alertType} sx={{ width: "100%" }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
