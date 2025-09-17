// src/scenes/prospect/IndividualForm.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Select,
  InputLabel,
  FormControl,
  Grid,
  MenuItem,
  Typography,
  Chip,
  Button,
  Divider,
  Paper,
  ListItemText,
  Checkbox,
  FormControlLabel,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AddIcon from "@mui/icons-material/Add";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import MapComponentSetLocation from "./form/google_map_set_location";

import {
  addProspect,
  getProspectIndustryType,
  getProspectSource,
  addContactPerson,
  checkProspectAvaiblity,
  addConcernPersonsMultiple,
} from "../../../api/controller/admin_controller/prospect_controller";
import { getProduct } from "../../../api/controller/admin_controller/product_controller";
import { fetchEmployees } from "../../../api/controller/admin_controller/user_controller";
import {
  fetchDesignation,
  fetchInfluenceRoles,
  fetchZone,
} from "../../../api/controller/admin_controller/department_controller";

/* Reusable section wrapper */
const Section = ({ title, subtitle, children, mt = 3 }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        mt,
        p: 2.5,
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      {(title || subtitle) && (
        <Box mb={2}>
          {title && (
            <Typography variant="subtitle1" fontWeight={800} color="text.primary">
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
      {children}
    </Paper>
  );
};

const IndividualForm = () => {
  const theme = useTheme();

  // Brand accents from theme
  const brand = theme.palette.blueAccent?.main ?? theme.palette.info.main;
  const brandDark = theme.palette.blueAccent?.dark ?? brand;
  const brandContrast =
    theme.palette.blueAccent?.contrastText ??
    theme.palette.getContrastText(brand);

  const [concernPersons, setConcernPersons] = useState({
    prospect_id: 1,
    assign_to_ids: [],
  });
  const [openModal, setOpenModal] = useState(false);
  const [matchedProspects, setMatchedProspects] = useState([]);
  const [modalMessage, setModalMessage] = useState("");

  const [form, setForm] = useState({
    prospect_name: "",
    industry_type_id: "",
    interested_for_id: "",
    information_source_id: "",
    stage_id: "1",
    priority_id: "1",
    status: "0",
    website_link: "",
    facebook_page: "",
    linkedin: "",
    zone_id: "1",
    latitude: "23.777176",
    longitude: "90.399452",
    address: "",
    note: "",
    type: "prospect",
    is_active: "1",
    is_individual: "1", // individual form -> set to "1"
    assign_to_id: "",
  });

  const [industryList, setIndustry] = useState([]);
  const [zoneList, setZone] = useState([]);
  const [designationList, setDesignation] = useState([]);
  const [influenceList, setInfluenceList] = useState([]);
  const [sourceList, setSource] = useState([]);
  const [productList, setProductList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isClient, setIsClient] = useState(false);

  const [contactPersons, setContactPersons] = useState([
    {
      name: "",
      designation: "",
      email: "",
      mobile: "",
      note: "",
      is_primary: false,
      is_key_contact: false,
      is_responsive: true,
      is_switched_job: false,
      attitude_id: null,
      influencing_role_id: null,
      anniversary: null,
      birth_date: null,
      showMore: false,
    },
  ]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCheckProspectAvailability = async () => {
    try {
      const res = await checkProspectAvaiblity({ prospect_name: form.prospect_name });
      if (res.status === "success" && res.data && res.data.length > 0) {
        setMatchedProspects(res.data);
        setModalMessage("");
      } else {
        setMatchedProspects([]);
        setModalMessage("No matched prospects found.");
      }
      setOpenModal(true);
    } catch (error) {
      console.error("Check Prospect Availability Error:", error);
      setModalMessage("Error checking prospect availability.");
      setMatchedProspects([]);
      setOpenModal(true);
    }
  };

  useEffect(() => {
    getProspectIndustryType().then((res) => setIndustry(res.data || [])).catch((err) => console.error("Industry Error:", err));
    fetchZone().then((res) => setZone(res.data || [])).catch((err) => console.error("Zone Error:", err));
    fetchDesignation().then((res) => setDesignation(res.data || [])).catch((err) => console.error("Designation Error:", err));
    fetchInfluenceRoles().then((res) => setInfluenceList(res.data || [])).catch((err) => console.error("Influence Error:", err));
    getProspectSource().then((res) => setSource(res.data || [])).catch((err) => console.error("Source Error:", err));
    getProduct().then((res) => setProductList(res.data || [])).catch((err) => console.error("Product Error:", err));
    fetchEmployees().then((res) => setEmployees(res.data || [])).catch(console.error);
  }, []);

  const setLatLon = (name, value) => setForm({ ...form, [name]: value });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addMultipleConernPersons = (prosID) => {
    const payload = {
      prospect_id: prosID,
      employees: concernPersons.assign_to_ids.map((id) => ({
        employee_id: id,
        is_active: 0,
        notify: 0,
      })),
    };
    addConcernPersonsMultiple(payload);
  };

  const handleSetLatLon = (event) => {
    const newLat = event.latLng.lat();
    const newLng = event.latLng.lng();
    setForm((prev) => ({
      ...prev,
      latitude: newLat.toString(),
      longitude: newLng.toString(),
    }));
  };

  const handleContactChange = (index, field, value) => {
    const updated = [...contactPersons];
    updated[index][field] = value;
    setContactPersons(updated);
  };

  const handleRemoveContact = (index) => {
    const updated = [...contactPersons];
    updated.splice(index, 1);
    setContactPersons(updated);
  };

  const addContactPersonField = () => {
    setContactPersons((prev) => [
      ...prev,
      {
        name: "",
        designation: "",
        email: "",
        mobile: "",
        note: "",
        is_primary: false,
        is_key_contact: false,
        is_responsive: true,
        is_switched_job: false,
        attitude_id: null,
        influencing_role_id: null,
        anniversary: null,
        birth_date: null,
        showMore: false,
      },
    ]);
  };

  const handleConcernsChange = (event) => {
    const { name, value } = event.target;
    setConcernPersons((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.keys(form).forEach((k) => formData.append(k, form[k]));

    try {
      const response = await addProspect(formData);
      if (response.status === "success") {
        const prospectId = response.data.id;
        handleSnackbar(response.message || "Prospect created.", "success");
        handleSubmitContact(prospectId);
        addMultipleConernPersons(prospectId);
      } else {
        handleSnackbar(response.message || "Failed to create prospect.", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      handleSnackbar("Failed to create organization.", "error");
    }
  };

  const handleSubmitContact = async (prosID) => {
    try {
      const formattedContacts = contactPersons.map((person) => ({
        person_name: person.name?.trim(),
        designation_id: person.designation || "1",
        mobile: person.mobile?.trim(),
        email: person.email?.trim(),
        note: person.note?.trim(),
        is_primary: Number(person.is_primary),
        is_responsive: Number(person.is_responsive),
        attitude_id: person.attitude_id || 0,
        is_key_contact: Number(person.is_key_contact),
        influencing_role_id: person.influencing_role_id || 0,
        anniversary: person.anniversary || "",
        birth_date: person.birth_date || "",
      }));
      await addContactPerson({ prospect_id: prosID, contacts: formattedContacts });
      handleSnackbar("Individual and contact persons added successfully!", "success");
    } catch (error) {
      console.error("Error submitting contacts:", error);
      handleSnackbar("Failed to create individual or contact persons.", "error");
    }
  };

  // Common control styles
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      bgcolor: theme.palette.background.paper,
    },
  };
  const selectSx = {
    "& fieldset": { borderColor: theme.palette.divider },
  };
  const checkboxSx = {
    color: `${theme.palette.success.main} !important`,
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1200, mx: "auto", bgcolor: theme.palette.background.default }}>
      {/* Title */}
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Typography variant="h5" fontWeight={800} color="text.primary">
          Create Individual Lead
        </Typography>
        <Chip
          size="small"
          label="New"
          sx={{ bgcolor: alpha(brand, 0.16), color: brand, fontWeight: 700 }}
        />
      </Box>
      <Divider sx={{ mb: 2, borderColor: theme.palette.divider }} />

      {/* Individual Details */}
      <Section title="Individual Details" subtitle="Core information about the lead.">
        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <TextField
              fullWidth
              required
              name="prospect_name"
              label="Full Name"
              value={form.prospect_name}
              onChange={handleChange}
              sx={inputSx}
            />
            <Button
              variant="outlined"
              onClick={handleCheckProspectAvailability}
              sx={{
                mt: 1.25,
                borderColor: brand,
                color: brand,
                "&:hover": { bgcolor: alpha(brand, 0.1), borderColor: brand },
              }}
            >
              Check Existing
            </Button>
          </Grid>

          <Grid item xs={12} md={5}>
            <FormControl fullWidth>
              <InputLabel>Industry Type</InputLabel>
              <Select
                name="industry_type_id"
                value={form.industry_type_id}
                label="Industry Type"
                onChange={handleChange}
                sx={selectSx}
              >
                {industryList.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.industry_type_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Zone</InputLabel>
              <Select
                name="zone_id"
                value={form.zone_id}
                label="Zone"
                onChange={handleChange}
                sx={selectSx}
              >
                {zoneList.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.zone_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Information Source</InputLabel>
              <Select
                name="information_source_id"
                value={form.information_source_id}
                label="Information Source"
                onChange={handleChange}
                sx={selectSx}
              >
                {sourceList.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.information_source_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Service / Item</InputLabel>
              <Select
                name="interested_for_id"
                value={form.interested_for_id}
                label="Service / Item"
                onChange={handleChange}
                sx={selectSx}
              >
                {productList.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.product_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Assign to (multiple) */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Assign To</InputLabel>
              <Select
                label="Assign To"
                multiple
                name="assign_to_ids"
                value={concernPersons.assign_to_ids}
                onChange={handleConcernsChange}
                renderValue={(selected) =>
                  (employees || [])
                    .filter((e) => selected.includes(e.id))
                    .map((e) => e.name)
                    .join(", ")
                }
                sx={selectSx}
              >
                {employees.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    <Checkbox
                      checked={concernPersons.assign_to_ids.includes(option.id)}
                      sx={checkboxSx}
                    />
                    <ListItemText primary={option.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Links + Address */}
          {["website_link", "facebook_page", "linkedin", "address"].map((field) => (
            <Grid item xs={12} md={6} key={field}>
              <TextField
                fullWidth
                name={field}
                label={field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                value={form[field]}
                onChange={handleChange}
                sx={inputSx}
              />
            </Grid>
          ))}

          {/* Note */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              name="note"
              label="Important Note"
              value={form.note}
              onChange={handleChange}
              sx={inputSx}
            />
          </Grid>
        </Grid>
      </Section>

      {/* Location */}
      <Section title="Select Location" subtitle="Pin the individual’s location.">
        <MapComponentSetLocation
          latitude={form.latitude}
          longitude={form.longitude}
          onMapClick={handleSetLatLon}
        />
        <Box mt={1} display="flex" gap={1} flexWrap="wrap">
          <Chip size="small" label={`Lat: ${form.latitude}`} />
          <Chip size="small" label={`Lng: ${form.longitude}`} />
        </Box>
      </Section>

      {/* Contact Persons */}
      <Section title="Contact Persons" subtitle="Add one or more contacts.">
        <Box display="flex" justifyContent="flex-end" mb={1}>
          <Button
            startIcon={<AddIcon />}
            onClick={addContactPersonField}
            variant="outlined"
            sx={{
              borderColor: brand,
              color: brand,
              borderWidth: 1.5,
              borderStyle: "solid",
              borderRadius: 2,
              "&:hover": { bgcolor: alpha(brand, 0.08), borderColor: brand },
            }}
          >
            Add Contact
          </Button>
        </Box>

        {contactPersons.map((person, index) => (
          <Paper
            key={index}
            elevation={0}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              p: 2,
              mb: 2,
              bgcolor: theme.palette.background.paper,
            }}
          >
            <Grid container spacing={2} alignItems="flex-start">
              {["name", "email", "mobile"].map((field) => (
                <Grid item xs={12} sm={3} key={field}>
                  <TextField
                    fullWidth
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={person[field]}
                    onChange={(e) => handleContactChange(index, field, e.target.value)}
                    sx={inputSx}
                  />
                </Grid>
              ))}

              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Designation</InputLabel>
                  <Select
                    value={person.designation || ""}
                    label="Designation"
                    onChange={(e) => handleContactChange(index, "designation", e.target.value)}
                    sx={selectSx}
                  >
                    {designationList.map((designation) => (
                      <MenuItem key={designation.id} value={designation.id}>
                        {designation.designation_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm="auto">
                {index > 0 && (
                  <IconButton
                    onClick={() => handleRemoveContact(index)}
                    sx={{ mt: 0.5, color: theme.palette.error.main }}
                  >
                    <RemoveCircleOutlineIcon />
                  </IconButton>
                )}
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => {
                    const updated = [...contactPersons];
                    updated[index].showMore = !updated[index].showMore;
                    setContactPersons(updated);
                  }}
                  sx={{ color: brand, fontWeight: 700 }}
                >
                  {person.showMore ? "Hide Additional Info" : "Add More Info"}
                </Button>
              </Grid>

              {person.showMore && (
                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: theme.palette.background.paper,
                      border: `1px dashed ${theme.palette.divider}`,
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Note"
                          value={person.note}
                          onChange={(e) => handleContactChange(index, "note", e.target.value)}
                          sx={inputSx}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Box
                          display="flex"
                          flexWrap="wrap"
                          gap={2}
                          sx={{ p: 1.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}
                        >
                          {[
                            { label: "Is Primary", key: "is_primary" },
                            { label: "Is Responsive", key: "is_responsive" },
                            { label: "Is Key Contact", key: "is_key_contact" },
                            { label: "Switched Job", key: "is_switched_job" },
                          ].map((item) => (
                            <FormControlLabel
                              key={item.key}
                              control={
                                <Checkbox
                                  checked={person[item.key]}
                                  onChange={(e) => handleContactChange(index, item.key, e.target.checked)}
                                  sx={checkboxSx}
                                />
                              }
                              label={<Typography color="text.primary">{item.label}</Typography>}
                            />
                          ))}
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="date"
                          label="Birth Date"
                          InputLabelProps={{ shrink: true }}
                          value={person.birth_date || ""}
                          onChange={(e) => handleContactChange(index, "birth_date", e.target.value)}
                          sx={inputSx}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="date"
                          label="Anniversary"
                          InputLabelProps={{ shrink: true }}
                          value={person.anniversary || ""}
                          onChange={(e) => handleContactChange(index, "anniversary", e.target.value)}
                          sx={inputSx}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Attitude ID"
                          value={person.attitude_id || ""}
                          onChange={(e) => handleContactChange(index, "attitude_id", e.target.value)}
                          sx={inputSx}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Influencing Role</InputLabel>
                          <Select
                            value={person.influencing_role_id || ""}
                            label="Influencing Role"
                            onChange={(e) => handleContactChange(index, "influencing_role_id", e.target.value)}
                            sx={selectSx}
                          >
                            {influenceList.map((data) => (
                              <MenuItem key={data.id} value={data.id}>
                                {data.role_name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Paper>
        ))}
      </Section>

      {/* Attachments + Client flag */}
      <Section>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Typography variant="body2" color="text.secondary">
              Attachments (Doc/Media)
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              sx={{
                borderColor: theme.palette.divider,
                color: theme.palette.text.primary,
                "&:hover": { bgcolor: theme.palette.action.hover, borderColor: brand },
              }}
            >
              Upload
              <input type="file" hidden />
            </Button>
          </Grid>
          <Grid item xs />
          <Grid item>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isClient}
                  onChange={(e) => setIsClient(e.target.checked)}
                  sx={checkboxSx}
                />
              }
              label={<Typography color="text.primary">Already a Client</Typography>}
            />
          </Grid>
        </Grid>
      </Section>

      {/* Actions */}
      <Box mt={3}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="outlined"
              sx={{
                borderColor: brand,
                color: brand,
                "&:hover": { bgcolor: alpha(brand, 0.08), borderColor: brand },
              }}
            >
              Get Template
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              sx={{
                bgcolor: theme.palette.info.main,
                color: theme.palette.getContrastText(theme.palette.info.main),
                "&:hover": { bgcolor: theme.palette.info.dark || theme.palette.info.main },
              }}
            >
              Bulk Upload
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              sx={{
                bgcolor: theme.palette.success.main,
                color: theme.palette.getContrastText(theme.palette.success.main),
                "&:hover": { bgcolor: theme.palette.success.dark || theme.palette.success.main },
              }}
            >
              Save
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Matched Prospects Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Typography variant="h6" fontWeight={800}>Matched Prospects</Typography>
        </DialogTitle>
        <DialogContent dividers>
          {matchedProspects.length > 0 ? (
            matchedProspects.map((prospect) => {
              const chipBg = prospect.stage?.color_code || alpha(brand, 0.14);
              const chipFg = theme.palette.getContrastText(chipBg);
              const url = prospect.website_link;
              const safe = url && (url.startsWith("http") ? url : `https://${url}`);
              return (
                <Paper
                  key={prospect.id}
                  elevation={0}
                  sx={{
                    mb: 2,
                    p: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    bgcolor: theme.palette.background.paper,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                    {prospect.prospect_name}
                  </Typography>
                  {prospect.address && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {prospect.address}
                    </Typography>
                  )}
                  {safe && (
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      <Link href={safe} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ color: brand }}>
                        {url}
                      </Link>
                    </Typography>
                  )}
                  <Box mt={1}>
                    <Chip
                      size="small"
                      label={`Stage: ${prospect.stage?.stage_name || "N/A"}`}
                      sx={{ bgcolor: chipBg, color: chipFg, fontWeight: 700 }}
                    />
                  </Box>
                </Paper>
              );
            })
          ) : (
            <Typography color="text.secondary">{modalMessage}</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => setOpenModal(false)}
            sx={{ bgcolor: brand, color: brandContrast, "&:hover": { bgcolor: brandDark } }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default IndividualForm;
