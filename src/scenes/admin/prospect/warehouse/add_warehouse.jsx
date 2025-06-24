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
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AddIcon from "@mui/icons-material/Add";
import MapComponentSetLocation from "../form/google_map_set_location";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

import {
  addProspect,
  getProspectIndustryType,
  getProspectSource,
  addContactPerson,
  checkProspectAvaiblity,
  addConcernPersonsMultiple,
} from "../../../../api/controller/admin_controller/prospect_controller";
import {
  getProduct,

} from "../../../../api/controller/admin_controller/product_controller";

import { fetchEmployees } from "../../../../api/controller/admin_controller/user_controller";
import { fetchDesignation, fetchInfluenceRoles } from "../../../../api/controller/admin_controller/department_controller";
import { fetchZone } from "../../../../api/controller/admin_controller/department_controller";

const WarehouseForm = () => {
  const [concernPersons, setConcernPersons] = useState({
    prospect_id: 1,
    assign_to_ids: [], // for employee_id array
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
    type: "warehouse",
    is_active: "1",
    is_individual: "0",
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
      showMore: false, // optional for UI toggle
    },
  ]);


  const handleCheckProspectAvailability = async () => {
    try {
      const res = await checkProspectAvaiblity({ 'prospect_name': form.prospect_name });

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
      setOpenModal(true);
    }
  };



  useEffect(() => {
    getProspectIndustryType()
      .then((res) => setIndustry(res.data || []))
      .catch((err) => console.error("Industry Error:", err));
    fetchZone()
      .then((res) => setZone(res.data || []))
      .catch((err) => console.error("Zone Error:", err));
    fetchDesignation()
      .then((res) => setDesignation(res.data || []))
      .catch((err) => console.error("Designation Error:", err));
    fetchInfluenceRoles()
      .then((res) => setInfluenceList(res.data || []))
      .catch((err) => console.error("setInfluenceList Error:", err));

    getProspectSource()
      .then((res) => setSource(res.data || []))
      .catch((err) => console.error("Source Error:", err));

    getProduct()
      .then((res) => setProductList(res.data || []))
      .catch((err) => console.error("Source Error:", err));

    fetchEmployees()
      .then((res) => setEmployees(res.data || []))
      .catch(console.error);
  }, []);
  const setLatLon = (name, value) => {
    setForm({ ...form, [name]: value });
  };
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
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
  //   23.8103; // Default to Dhaka, BD
  //  90.4125;
  // In your page component where handleMapClick is defined
  const handleSetLatLon = (event) => {
     console.log("Map click triggered");
    const newLat = event.latLng.lat();
    const newLng = event.latLng.lng();
    console.log("from map Position :", { lat: newLat, lng: newLng });
    setForm((prev) => ({
      ...prev,
      latitude: newLat.toString(),
      longitude: newLng.toString(),
    }));
    // setLatLon('latitude', event.lat.toString());
    // setLatLon('longitude', event.lng.toString());


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
    setContactPersons([
      ...contactPersons,
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
    setConcernPersons((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };
  const handleSubmit = async () => {
    const formData = new FormData();
    for (const key in form) {
      formData.append(key, form[key]);
    }

    try {
      await addProspect(formData).then((e) => {


        if (e.status === 'success') {


          const prospectId = e.data.id;
          alert(e.message);
          handleSubmitContact(prospectId);
          addMultipleConernPersons(prospectId);
        }


      });


      // Now add contact persons

    } catch (error) {
      console.error("Error:", error);
      alert("Failed to create organization or contact persons.");
    }
  };


  const handleSubmitContact = async (prosID) => {
    try {
      const formattedContacts = contactPersons.map((person) => ({
        person_name: person.name?.trim(),
        designation_id: person.designation || "1", // consider validating this
        mobile: person.mobile?.trim(),
        email: person.email?.trim(),
        note: person.note?.trim(),
        is_primary: Number(person.is_primary),
        is_responsive: Number(person.is_responsive),
        attitude_id: person.attitude_id || 0,
        is_key_contact: Number(person.is_key_contact),
        influencing_role_id: person.influencing_role_id || 0,
        is_switched_job: Number(person.is_switched_job),
        anniversary: person.anniversary || "",
        birth_date: person.birth_date || "",
      }));

      const responseContact = await addContactPerson({
        prospect_id: prosID,
        contacts: formattedContacts,
      });

      console.log("Prospect and contacts created:", responseContact);
      alert("Organization and contact persons added successfully!");
    } catch (error) {
      console.error("Error submitting contacts:", error);
      alert("Failed to create organization or contact persons.");
    }
  };


  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Create Warehouse
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={2}>
        {/* Basic Fields */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            name="prospect_name"
            label="Warehouse Name"
            value={form.prospect_name}
            onChange={handleChange}
          />

          <Button
            variant="outlined"
            onClick={handleCheckProspectAvailability}
            sx={{ mt: 1 }}
          >
            Check Warehouse Availability
          </Button>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            name="industry_type_id"
            label="Industry Type"
            value={form.industry_type_id}
            onChange={handleChange}
          >
            {industryList.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.industry_type_name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>


        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            name="zone_id"
            label="Zone"
            value={form.zone_id}
            onChange={handleChange}
          >
            {zoneList.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.zone_name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            name="information_source_id"
            label="Information Source"
            value={form.information_source_id}
            onChange={handleChange}
          >
            {sourceList.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.information_source_name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>


        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
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
                  .join(', ')
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
        </Grid>

        {/* Additional Links */}
        {["website_link", "facebook_page", "linkedin", "address"].map((field, idx) => (
          <Grid item xs={12} sm={6} key={idx}>
            <TextField
              fullWidth
              name={field}
              label={`${field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} (Optional)`}
              value={form[field]}
              onChange={handleChange}
            />
          </Grid>
        ))}

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            name="note"
            label="Important Note"
            value={form.note}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Select Location
          </Typography>
      
          <MapComponentSetLocation
 onMapClick={handleSetLatLon}
          
           
          />
        </Grid>
        {/* Contact Persons */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Contact Persons</Typography>
            <IconButton onClick={addContactPersonField} color="primary">
              <AddIcon />
            </IconButton>
          </Box>

          {contactPersons.map((person, index) => (
            <Box
              key={index}
              sx={{
                border: "1px solid #ddd",
                borderRadius: 2,
                p: 3,
                mb: 3,
                backgroundColor: "#fafafa",
              }}
            >
              <Grid container spacing={2}>
                {/* Basic Info */}
                {["name", "email", "mobile"].map((field, i) => (
                  <Grid item xs={12} sm={3} key={i}>
                    <TextField
                      fullWidth
                      label={field.charAt(0).toUpperCase() + field.slice(1)}
                      value={person[field]}
                      onChange={(e) => handleContactChange(index, field, e.target.value)}
                    />
                  </Grid>
                ))}
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel id={`designation-label-${index}`}>Designation</InputLabel>
                    <Select
                      labelId={`designation-label-${index}`}
                      value={person.designation || ""}
                      label="Designation"
                      onChange={(e) => handleContactChange(index, "designation", e.target.value)}
                    >
                      {designationList.map((designation) => (
                        <MenuItem key={designation.id} value={designation.id}>
                          {designation.designation_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {/* Remove Button */}
                <Grid item xs={12} sm={1}>
                  {index > 0 && (
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveContact(index)}
                      sx={{ mt: 1 }}
                    >
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                  )}
                </Grid>

                {/* Toggle Optional Fields */}
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      const updated = [...contactPersons];
                      updated[index].showMore = !updated[index].showMore;
                      setContactPersons(updated);
                    }}
                  >
                    {person.showMore ? "Hide Additional Info" : "Add More Info"}
                  </Button>
                </Grid>

                {/* Extended Info */}
                {person.showMore && (
                  <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 3, backgroundColor: "#f9f9f9", borderRadius: 2 }}>
                      <Grid container spacing={3}>

                        {/* Note */}
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Note"
                            variant="outlined"
                            value={person.note}
                            onChange={(e) => handleContactChange(index, "note", e.target.value)}
                          />
                        </Grid>

                        {/* Checkboxes */}
                        <Grid item xs={12}>
                          <Box
                            display="flex"
                            flexWrap="wrap"
                            gap={3}
                            sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2 }}
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
                                    onChange={(e) =>
                                      handleContactChange(index, item.key, e.target.checked)
                                    }
                                    color="primary"
                                  />
                                }
                                label={item.label}
                              />
                            ))}
                          </Box>
                        </Grid>

                        {/* Dates */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            type="date"
                            label="Birth Date"
                            InputLabelProps={{ shrink: true }}
                            value={person.birth_date}
                            onChange={(e) =>
                              handleContactChange(index, "birth_date", e.target.value)
                            }
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            type="date"
                            label="Anniversary"
                            InputLabelProps={{ shrink: true }}
                            value={person.anniversary}
                            onChange={(e) =>
                              handleContactChange(index, "anniversary", e.target.value)
                            }
                          />
                        </Grid>

                        {/* ID fields */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Attitude ID"
                            value={person.attitude_id}
                            onChange={(e) =>
                              handleContactChange(index, "attitude_id", e.target.value)
                            }
                          />
                        </Grid>

                        {/* Influencing Role */}
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel id={`designation-label-${index}`}>Influencing Role</InputLabel>
                            <Select
                              labelId={`designation-label-${index}`}
                              value={person.influencing_role_id || ""}
                              label="Influencing Role"
                              onChange={(e) => handleContactChange(index, "influencing_role_id", e.target.value)}
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
            </Box>
          ))}
        </Grid>


        {/* File Upload */}
        <Grid item xs={12}>
          <Typography variant="body2" gutterBottom>
            Attachments (Doc/Media)
          </Typography>
          <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
            Upload
            <input type="file" hidden />
          </Button>
        </Grid>

        {/* Checkbox */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isClient}
                onChange={(e) => setIsClient(e.target.checked)}
              />
            }
            label="Already a Client"
          />
        </Grid>

        {/* Buttons */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Button fullWidth variant="outlined">
                Get Template
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button fullWidth variant="contained" color="info">
                Bulk Upload
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button fullWidth variant="contained" color="success" onClick={handleSubmit}>
                Save
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {openModal && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
          onClick={() => setOpenModal(false)}
        >
          <Box
            sx={{
              backgroundColor: "#fff",
              borderRadius: 2,
              p: 3,
              minWidth: { xs: "90%", sm: 400 },
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()} // prevent click from closing when clicking inside
          >
            <Typography variant="h6" gutterBottom>
              Matched Prospects
            </Typography>

            {matchedProspects.length > 0 ? (
              matchedProspects.map((prospect) => (
                <Box
                  key={prospect.id}
                  sx={{
                    mb: 2,
                    p: 2,
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    backgroundColor: "#ffffff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)", // soft shadow
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    {prospect.prospect_name}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    {prospect.address}
                  </Typography>

                  <Typography variant="body2" color="primary.main" mt={0.5}>
                    Website: {prospect.website_link}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      display: "inline-block",
                      backgroundColor: "#e8f5e9", // light green background
                      color: "#2e7d32",            // darker green text
                      px: 1.5,
                      py: 0.5,
                      borderRadius: "16px",
                      fontWeight: 500,
                      fontSize: "13px",
                      mt: 1,
                    }}
                  >
                    Stage: {prospect.stage?.stage_name}
                  </Typography>
                </Box>

              ))
            ) : (
              <Typography>{modalMessage}</Typography>
            )}

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => setOpenModal(false)}
            >
              Close
            </Button>
          </Box>
        </Box>
      )}

    </Box>


  );
};

export default WarehouseForm;
