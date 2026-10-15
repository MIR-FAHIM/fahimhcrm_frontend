import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  AddCircleOutlineRounded,
  AddRounded,
  ArrowBackRounded,
  BusinessRounded,
  CancelRounded,
  CheckCircleRounded,
  DeleteOutlineRounded,
  EditNoteRounded,
  EmailRounded,
  Facebook,
  FlagRounded,
  GroupsRounded,
  InfoRounded,
  LanguageRounded,
  LinkedIn,
  LocationOnRounded,
  MyLocationRounded,
  OpenInNewRounded,
  PersonAddRounded,
  PersonRounded,
  PhoneRounded,
  PriorityHighRounded,
  SaveRounded,
  ShoppingBagRounded,
  SourceRounded,
  StarRounded,
  VisibilityRounded,
} from "@mui/icons-material";

import {
  addConcernPersonsMultiple,
  addContactPerson,
  fetchDistrictsByDivision,
  fetchDivisions,
  fetchUpozelasByDistrict,
  getAssignedPersonsProspect,
  getContactPersonProspect,
  getProspectAllStatus,
  getProspectDetails,
  getProspectIndustryType,
  getProspectSource,
  removeAssignPerson,
  updateProspect,
} from "../../../api/controller/admin_controller/prospect_controller";
import { getProduct } from "../../../api/controller/admin_controller/product_controller";
import { getPriority } from "../../../api/controller/admin_controller/task_controller/task_controller";
import { fetchEmployees } from "../../../api/controller/admin_controller/user_controller";
import {
  fetchDesignation,
  fetchInfluenceRoles,
} from "../../../api/controller/admin_controller/department_controller";

const isTrue = (value) => value === true || value === 1 || value === "1";
const asList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
};
const nullableId = (val) => (val ? Number(val) : null);
const locationName = (opt) =>
  opt?.name ||
  opt?.division_name ||
  opt?.district_name ||
  opt?.upazila_name ||
  opt?.upozela_name ||
  opt?.thana_name ||
  "";

export default function EditProspect() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  // Primary Theme Colors
  const brand = theme.palette.primary.main;
  const brandLight = alpha(brand, 0.1);

  // Loading & UI States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  // Dropdown Data Lists
  const [stages, setStages] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [sources, setSources] = useState([]);
  const [products, setProducts] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [influenceRoles, setInfluenceRoles] = useState([]);

  // Location Dropdown Data
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingUpazilas, setLoadingUpazilas] = useState(false);

  // Assigned Employees & Contact Persons
  const [assignedPersons, setAssignedPersons] = useState([]);
  const [contactPersons, setContactPersons] = useState([]);
  const [newAssigneeIds, setNewAssigneeIds] = useState([]);

  // Add Contact Person Modal State
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    person_name: "",
    designation_id: "",
    email: "",
    mobile: "",
    note: "",
    is_primary: false,
    is_key_contact: false,
    is_responsive: true,
    is_switched_job: false,
    attitude_id: "",
    influencing_role_id: "",
    birth_date: "",
    anniversary: "",
  });

  // Main Comprehensive Form State
  const [form, setForm] = useState({
    prospect_id: id,
    prospect_name: "",
    is_individual: 0,
    is_active: 1,
    stage_id: "",
    industry_type_id: "",
    information_source_id: "",
    interested_for_id: "",
    priority_id: "",
    is_opportunity: 0,
    address: "",
    division_id: "",
    district_id: "",
    thana_id: "",
    latitude: "",
    longitude: "",
    website_link: "",
    facebook_page: "",
    linkedin: "",
    note: "",
  });

  // Errors state
  const [formErrors, setFormErrors] = useState({});

  const showAlert = (message, severity = "success") => {
    setAlert({ open: true, message, severity });
  };

  // 1. Initial Load: Fetch Prospect Details & Master Lists
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        detailsRes,
        stagesRes,
        industriesRes,
        sourcesRes,
        productsRes,
        prioritiesRes,
        employeesRes,
        assignedRes,
        contactsRes,
        divisionsRes,
        designationsRes,
        influenceRes,
      ] = await Promise.all([
        getProspectDetails(id),
        getProspectAllStatus().catch(() => []),
        getProspectIndustryType().catch(() => []),
        getProspectSource().catch(() => []),
        getProduct().catch(() => []),
        getPriority().catch(() => []),
        fetchEmployees().catch(() => []),
        getAssignedPersonsProspect(id).catch(() => []),
        getContactPersonProspect(id).catch(() => []),
        fetchDivisions().catch(() => []),
        fetchDesignation().catch(() => []),
        fetchInfluenceRoles().catch(() => []),
      ]);

      const data = detailsRes?.data || {};

      // Set Master Lists
      setStages(asList(stagesRes));
      setIndustries(asList(industriesRes));
      setSources(asList(sourcesRes));
      setProducts(asList(productsRes));

      const prioList = asList(prioritiesRes);
      setPriorities(
        prioList.length
          ? prioList
          : [
              { id: 1, priority_name: "Low" },
              { id: 2, priority_name: "Medium" },
              { id: 3, priority_name: "High" },
              { id: 4, priority_name: "Urgent" },
            ]
      );

      setEmployees(employeesRes?.data || asList(employeesRes));
      setAssignedPersons(asList(assignedRes));
      setContactPersons(asList(contactsRes));
      setDivisions(asList(divisionsRes));
      setDesignations(asList(designationsRes));
      setInfluenceRoles(asList(influenceRes));

      // Populate Form Values
      const divId = data.division_id || data.division?.id || "";
      const distId = data.district_id || data.district?.id || "";
      const thanaId = data.thana_id || data.thana?.id || data.upazila?.id || "";

      setForm({
        prospect_id: id,
        prospect_name: data.prospect_name || "",
        is_individual: isTrue(data.is_individual) ? 1 : 0,
        is_active: data.is_active === 0 || data.is_active === "0" ? 0 : 1,
        stage_id: data.stage_id || data.stage?.id || "",
        industry_type_id: data.industry_type_id || data.industry_type?.id || "",
        information_source_id: data.information_source_id || data.information_source?.id || "",
        interested_for_id: data.interested_for_id || data.interested_for?.id || data.interested_product_id || "",
        priority_id: data.priority_id || data.priority?.id || "",
        is_opportunity: isTrue(data.is_opportunity) ? 1 : 0,
        address: data.address || "",
        division_id: divId,
        district_id: distId,
        thana_id: thanaId,
        latitude: data.latitude != null ? String(data.latitude) : "",
        longitude: data.longitude != null ? String(data.longitude) : "",
        website_link: data.website_link || "",
        facebook_page: data.facebook_page || "",
        linkedin: data.linkedin || "",
        note: data.note || "",
      });

      // Load Pre-selected Districts and Upazilas if present
      if (divId) {
        setLoadingDistricts(true);
        fetchDistrictsByDivision(divId)
          .then((res) => setDistricts(asList(res)))
          .catch(console.error)
          .finally(() => setLoadingDistricts(false));
      }

      if (distId) {
        setLoadingUpazilas(true);
        fetchUpozelasByDistrict(distId)
          .then((res) => setUpazilas(asList(res)))
          .catch(console.error)
          .finally(() => setLoadingUpazilas(false));
      }
    } catch (err) {
      console.error("Failed to load prospect details for editing:", err);
      showAlert("Failed to load prospect data. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Handle General Form Value Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle Location Cascade Changes
  const handleDivisionChange = (_, division) => {
    const divisionId = division?.id || "";
    setDistricts([]);
    setUpazilas([]);
    setForm((prev) => ({
      ...prev,
      division_id: divisionId,
      district_id: "",
      thana_id: "",
    }));

    if (!divisionId) return;

    setLoadingDistricts(true);
    fetchDistrictsByDivision(divisionId)
      .then((res) => setDistricts(asList(res)))
      .catch((err) => showAlert(err.message || "Failed to load districts", "error"))
      .finally(() => setLoadingDistricts(false));
  };

  const handleDistrictChange = (_, district) => {
    const districtId = district?.id || "";
    setUpazilas([]);
    setForm((prev) => ({
      ...prev,
      district_id: districtId,
      thana_id: "",
    }));

    if (!districtId) return;

    setLoadingUpazilas(true);
    fetchUpozelasByDistrict(districtId)
      .then((res) => setUpazilas(asList(res)))
      .catch((err) => showAlert(err.message || "Failed to load upazilas", "error"))
      .finally(() => setLoadingUpazilas(false));
  };

  const handleUpazilaChange = (_, upazila) => {
    setForm((prev) => ({ ...prev, thana_id: upazila?.id || "" }));
  };

  // Get Current GPS Location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      showAlert("Geolocation is not supported by your browser.", "warning");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: String(pos.coords.latitude.toFixed(6)),
          longitude: String(pos.coords.longitude.toFixed(6)),
        }));
        setLocating(false);
        showAlert("Coordinates detected successfully!");
      },
      (err) => {
        console.error("GPS error:", err);
        setLocating(false);
        showAlert("Could not retrieve GPS location. Please enter manually.", "error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Team Member Assignment Changes
  const handleRemoveAssignee = async (empId) => {
    try {
      await removeAssignPerson({ prospect_id: id, employee_id: empId });
      setAssignedPersons((prev) => prev.filter((p) => p.employee?.id !== empId));
      showAlert("Team member removed from prospect.");
    } catch (err) {
      console.error(err);
      showAlert("Failed to remove assigned person.", "error");
    }
  };

  const handleAddNewAssignees = async () => {
    if (!newAssigneeIds.length) return;
    try {
      const payload = {
        prospect_id: id,
        employees: newAssigneeIds.map((empId) => ({
          employee_id: empId,
          is_active: 0,
          notify: 0,
        })),
      };
      await addConcernPersonsMultiple(payload);
      const res = await getAssignedPersonsProspect(id);
      if (res?.status === "success") setAssignedPersons(asList(res));
      setNewAssigneeIds([]);
      showAlert("Assigned team members updated.");
    } catch (err) {
      console.error(err);
      showAlert("Failed to add new team members.", "error");
    }
  };

  // Contact Person Modal Submit
  const handleSaveContactPerson = async (e) => {
    e.preventDefault();
    if (!contactForm.person_name.trim()) {
      showAlert("Contact person name is required.", "warning");
      return;
    }
    setSavingContact(true);
    try {
      const payload = {
        prospect_id: id,
        person_name: contactForm.person_name.trim(),
        designation_id: nullableId(contactForm.designation_id),
        email: contactForm.email.trim(),
        mobile: contactForm.mobile.trim(),
        note: contactForm.note.trim(),
        is_primary: contactForm.is_primary ? 1 : 0,
        is_key_contact: contactForm.is_key_contact ? 1 : 0,
        is_responsive: contactForm.is_responsive ? 1 : 0,
        is_switched_job: contactForm.is_switched_job ? 1 : 0,
        attitude_id: contactForm.attitude_id || null,
        influencing_role_id: nullableId(contactForm.influencing_role_id),
        birth_date: contactForm.birth_date || null,
        anniversary: contactForm.anniversary || null,
      };

      const res = await addContactPerson(payload);
      if (res?.status === "success" || res?.status === 200) {
        showAlert("Contact person added successfully!");
        setContactModalOpen(false);
        // Refresh contacts list
        const updatedContacts = await getContactPersonProspect(id);
        if (updatedContacts?.status === "success") {
          setContactPersons(asList(updatedContacts));
        }
        // Reset contact form
        setContactForm({
          person_name: "",
          designation_id: "",
          email: "",
          mobile: "",
          note: "",
          is_primary: false,
          is_key_contact: false,
          is_responsive: true,
          is_switched_job: false,
          attitude_id: "",
          influencing_role_id: "",
          birth_date: "",
          anniversary: "",
        });
      } else {
        showAlert(res?.message || "Failed to add contact person.", "error");
      }
    } catch (err) {
      console.error(err);
      showAlert("Error adding contact person.", "error");
    } finally {
      setSavingContact(false);
    }
  };

  // Main Comprehensive Form Submit
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Validation
    if (!form.prospect_name.trim()) {
      setFormErrors({ prospect_name: "Prospect name is required" });
      showAlert("Please enter the prospect / company name.", "warning");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        prospect_id: id,
        prospect_name: form.prospect_name.trim(),
        is_individual: form.is_individual,
        is_active: form.is_active,
        stage_id: nullableId(form.stage_id),
        industry_type_id: nullableId(form.industry_type_id),
        information_source_id: nullableId(form.information_source_id),
        interested_for_id: nullableId(form.interested_for_id),
        priority_id: nullableId(form.priority_id),
        is_opportunity: form.is_opportunity,
        address: form.address ? form.address.trim() : "",
        division_id: nullableId(form.division_id),
        district_id: nullableId(form.district_id),
        thana_id: nullableId(form.thana_id),
        latitude: form.latitude ? String(form.latitude).trim() : null,
        longitude: form.longitude ? String(form.longitude).trim() : null,
        website_link: form.website_link ? form.website_link.trim() : "",
        facebook_page: form.facebook_page ? form.facebook_page.trim() : "",
        linkedin: form.linkedin ? form.linkedin.trim() : "",
        note: form.note ? form.note.trim() : "",
      };

      const res = await updateProspect(payload);
      if (res?.status === "success" || res?.status === 200) {
        // If there were any new team members selected, assign them as well
        if (newAssigneeIds.length) {
          await handleAddNewAssignees();
        }
        showAlert("Prospect updated successfully!");
        setTimeout(() => {
          navigate(`/prospect-detail/${id}`);
        }, 1200);
      } else {
        showAlert(res?.message || "Failed to update prospect.", "error");
      }
    } catch (err) {
      console.error("Failed to update prospect:", err);
      showAlert(err?.response?.data?.message || err?.message || "Error saving prospect changes.", "error");
    } finally {
      setSaving(false);
    }
  };

  const selectedDivision = divisions.find((d) => String(d.id) === String(form.division_id)) || null;
  const selectedDistrict = districts.find((d) => String(d.id) === String(form.district_id)) || null;
  const selectedUpazila = upazilas.find((u) => String(u.id) === String(form.thana_id)) || null;

  const currentStage = stages.find((s) => String(s.id) === String(form.stage_id));
  const currentPriority = priorities.find((p) => String(p.id) === String(form.priority_id));

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
        <Skeleton variant="rounded" height={60} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rounded" height={340} sx={{ mb: 3 }} />
            <Skeleton variant="rounded" height={280} sx={{ mb: 3 }} />
            <Skeleton variant="rounded" height={260} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rounded" height={280} sx={{ mb: 3 }} />
            <Skeleton variant="rounded" height={340} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: { xs: 2, md: 3.5 },
        bgcolor: theme.palette.background.default,
        minHeight: "100vh",
        maxWidth: 1300,
        mx: "auto",
      }}
    >
      {/* Top Header & Action Navigation Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 2.5,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          position: "sticky",
          top: 16,
          zIndex: 15,
          boxShadow: theme.palette.mode === "dark" ? "none" : "0 10px 30px rgba(15,23,42,0.06)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackRounded />}
              onClick={() => navigate(`/prospect-detail/${id}`)}
              sx={{ borderRadius: 2, fontWeight: 700, textTransform: "none" }}
            >
              Back to Details
            </Button>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.text.primary }} noWrap>
                  {form.prospect_name || "Edit Prospect"}
                </Typography>
                <Chip
                  size="small"
                  label={form.is_individual === 1 ? "Individual" : "Organization"}
                  color="default"
                  sx={{ fontWeight: 700 }}
                />
                {currentStage && (
                  <Chip
                    size="small"
                    label={currentStage.stage_name}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                )}
                {form.is_opportunity === 1 && (
                  <Chip
                    size="small"
                    icon={<StarRounded sx={{ fontSize: "16px !important" }} />}
                    label="Qualified Opportunity"
                    color="success"
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </Stack>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Single centralized hub to update all prospect details, location, social presence, and team members.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} sx={{ width: { xs: "100%", md: "auto" } }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate(`/prospect-detail/${id}`)}
              disabled={saving}
              sx={{ borderRadius: 2, fontWeight: 700, textTransform: "none", flex: { xs: 1, md: "initial" } }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveRounded />}
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                textTransform: "none",
                px: 3,
                boxShadow: "0 8px 20px rgba(2, 132, 199, 0.28)",
                flex: { xs: 1, md: "initial" },
              }}
            >
              {saving ? "Saving Changes..." : "Save All Changes"}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {/* LEFT COLUMN: Main Information, Classification, Location, Social */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={3}>
            {/* 1. Basic / Core Information */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 2.5,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
              }}
            >
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: brandLight, color: brand, width: 40, height: 40 }}>
                    <BusinessRounded />
                  </Avatar>
                }
                title={<Typography variant="h6" fontWeight={700}>Basic & Account Information</Typography>}
                subheader="Primary identification details, record classification, and internal notes"
              />
              <Divider />
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Prospect / Company Name"
                      name="prospect_name"
                      value={form.prospect_name}
                      onChange={handleChange}
                      error={Boolean(formErrors.prospect_name)}
                      helperText={formErrors.prospect_name}
                      placeholder="e.g. Acme Corporation or Dr. John Smith"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BusinessRounded fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="record-type-label">Prospect Record Type</InputLabel>
                      <Select
                        labelId="record-type-label"
                        label="Prospect Record Type"
                        name="is_individual"
                        value={form.is_individual}
                        onChange={handleChange}
                      >
                        <MenuItem value={0}>Organization (Company / Business)</MenuItem>
                        <MenuItem value={1}>Individual Person</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="active-status-label">Account Status</InputLabel>
                      <Select
                        labelId="active-status-label"
                        label="Account Status"
                        name="is_active"
                        value={form.is_active}
                        onChange={handleChange}
                      >
                        <MenuItem value={1}>Active</MenuItem>
                        <MenuItem value={0}>Inactive / Archived</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Internal Notes / Description"
                      name="note"
                      value={form.note}
                      onChange={handleChange}
                      placeholder="Add important context, background information, or special requirements regarding this prospect..."
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* 2. Business & Opportunity Classification */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 2.5,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
              }}
            >
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.12), color: theme.palette.warning.main, width: 40, height: 40 }}>
                    <FlagRounded />
                  </Avatar>
                }
                title={<Typography variant="h6" fontWeight={700}>Classification & Pipeline Stage</Typography>}
                subheader="Define sales stage, target product, industry vertical, and priority"
              />
              <Divider />
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="stage-select-label">Sales Stage</InputLabel>
                      <Select
                        labelId="stage-select-label"
                        label="Sales Stage"
                        name="stage_id"
                        value={form.stage_id}
                        onChange={handleChange}
                      >
                        <MenuItem value="">-- Select Stage --</MenuItem>
                        {stages.map((stage) => (
                          <MenuItem key={stage.id} value={stage.id}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              {stage.color_code && (
                                <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: stage.color_code }} />
                              )}
                              <span>{stage.stage_name}</span>
                            </Stack>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="priority-select-label">Priority</InputLabel>
                      <Select
                        labelId="priority-select-label"
                        label="Priority"
                        name="priority_id"
                        value={form.priority_id}
                        onChange={handleChange}
                      >
                        <MenuItem value="">-- Select Priority --</MenuItem>
                        {priorities.map((priority) => (
                          <MenuItem key={priority.id} value={priority.id}>
                            {priority.priority_name || priority.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="industry-select-label">Industry Type</InputLabel>
                      <Select
                        labelId="industry-select-label"
                        label="Industry Type"
                        name="industry_type_id"
                        value={form.industry_type_id}
                        onChange={handleChange}
                      >
                        <MenuItem value="">-- Select Industry --</MenuItem>
                        {industries.map((industry) => (
                          <MenuItem key={industry.id} value={industry.id}>
                            {industry.industry_type_name || industry.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="source-select-label">Information Source</InputLabel>
                      <Select
                        labelId="source-select-label"
                        label="Information Source"
                        name="information_source_id"
                        value={form.information_source_id}
                        onChange={handleChange}
                      >
                        <MenuItem value="">-- Select Source --</MenuItem>
                        {sources.map((source) => (
                          <MenuItem key={source.id} value={source.id}>
                            {source.information_source_name || source.source_name || source.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="product-select-label">Interested Product / Service</InputLabel>
                      <Select
                        labelId="product-select-label"
                        label="Interested Product / Service"
                        name="interested_for_id"
                        value={form.interested_for_id}
                        onChange={handleChange}
                      >
                        <MenuItem value="">-- Select Product / Service --</MenuItem>
                        {products.map((prod) => (
                          <MenuItem key={prod.id} value={prod.id}>
                            {prod.product_name || prod.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: `1px solid ${form.is_opportunity === 1 ? alpha(theme.palette.success.main, 0.4) : theme.palette.divider}`,
                        bgcolor: form.is_opportunity === 1 ? alpha(theme.palette.success.main, 0.08) : theme.palette.background.default,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        height: "100%",
                        boxSizing: "border-box",
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={700} color={form.is_opportunity === 1 ? "success.main" : "text.primary"}>
                          Qualified Opportunity
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Toggle when lead is ready for sales negotiation
                        </Typography>
                      </Box>
                      <Switch
                        checked={form.is_opportunity === 1}
                        onChange={(e) => setForm((prev) => ({ ...prev, is_opportunity: e.target.checked ? 1 : 0 }))}
                        color="success"
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* 3. Location & Physical Address */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 2.5,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
              }}
            >
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.12), color: theme.palette.error.main, width: 40, height: 40 }}>
                    <LocationOnRounded />
                  </Avatar>
                }
                title={<Typography variant="h6" fontWeight={700}>Location & Geographic Address</Typography>}
                subheader="Division, district, upazila, full street address, and GPS coordinates"
                action={
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={locating ? <CircularProgress size={16} /> : <MyLocationRounded />}
                    disabled={locating}
                    onClick={handleDetectLocation}
                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                  >
                    {locating ? "Detecting GPS..." : "Detect GPS"}
                  </Button>
                }
              />
              <Divider />
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={4}>
                    <Autocomplete
                      options={divisions}
                      value={selectedDivision}
                      onChange={handleDivisionChange}
                      getOptionLabel={locationName}
                      isOptionEqualToValue={(opt, val) => String(opt.id) === String(val.id)}
                      renderInput={(params) => (
                        <TextField {...params} label="Division" placeholder="Select Division" />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Autocomplete
                      options={districts}
                      value={selectedDistrict}
                      loading={loadingDistricts}
                      disabled={!form.division_id || loadingDistricts}
                      onChange={handleDistrictChange}
                      getOptionLabel={locationName}
                      isOptionEqualToValue={(opt, val) => String(opt.id) === String(val.id)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="District"
                          placeholder={form.division_id ? "Select District" : "Select Division first"}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {loadingDistricts ? <CircularProgress color="inherit" size={16} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Autocomplete
                      options={upazilas}
                      value={selectedUpazila}
                      loading={loadingUpazilas}
                      disabled={!form.district_id || loadingUpazilas}
                      onChange={handleUpazilaChange}
                      getOptionLabel={locationName}
                      isOptionEqualToValue={(opt, val) => String(opt.id) === String(val.id)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Upazila / Thana"
                          placeholder={form.district_id ? "Select Upazila" : "Select District first"}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {loadingUpazilas ? <CircularProgress color="inherit" size={16} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Detailed Street Address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="e.g. House #12, Road #4, Sector #3, Banani, Dhaka"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOnRounded fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Latitude"
                      name="latitude"
                      value={form.latitude}
                      onChange={handleChange}
                      placeholder="e.g. 23.777176"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Longitude"
                      name="longitude"
                      value={form.longitude}
                      onChange={handleChange}
                      placeholder="e.g. 90.399452"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* 4. Online Presence & Social Links */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 2.5,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
              }}
            >
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.12), color: theme.palette.info.main, width: 40, height: 40 }}>
                    <LanguageRounded />
                  </Avatar>
                }
                title={<Typography variant="h6" fontWeight={700}>Online Presence & Social Links</Typography>}
                subheader="Official website, Facebook page, and LinkedIn company/profile link"
              />
              <Divider />
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Website URL"
                      name="website_link"
                      value={form.website_link}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LanguageRounded fontSize="small" sx={{ color: theme.palette.info.main }} />
                          </InputAdornment>
                        ),
                        endAdornment: form.website_link ? (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              href={form.website_link.startsWith("http") ? form.website_link : `https://${form.website_link}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <OpenInNewRounded fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ) : null,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Facebook Page / URL"
                      name="facebook_page"
                      value={form.facebook_page}
                      onChange={handleChange}
                      placeholder="https://facebook.com/page"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Facebook fontSize="small" sx={{ color: "#1877F2" }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="LinkedIn Profile / Company"
                      name="linkedin"
                      value={form.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/profile"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LinkedIn fontSize="small" sx={{ color: "#0A66C2" }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* RIGHT COLUMN: Assigned Team & Contact Persons */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* 5. Assigned Team Members */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 2.5,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
              }}
            >
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: brandLight, color: brand, width: 36, height: 36 }}>
                    <GroupsRounded fontSize="small" />
                  </Avatar>
                }
                title={<Typography variant="subtitle1" fontWeight={700}>Account Executives / Assigned Team</Typography>}
                subheader="Employees handling this account"
              />
              <Divider />
              <CardContent sx={{ p: 2.5 }}>
                {/* Currently Assigned List */}
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", display: "block", mb: 1 }}>
                  Currently Assigned ({assignedPersons.length})
                </Typography>

                {assignedPersons.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: "italic" }}>
                    No team members assigned yet.
                  </Typography>
                ) : (
                  <Stack spacing={1} sx={{ mb: 2.5 }}>
                    {assignedPersons.map((person) => {
                      const emp = person.employee || person;
                      const empName = emp.name || emp.employee_name || `Employee #${emp.id}`;
                      return (
                        <Paper
                          key={person.id || emp.id}
                          elevation={0}
                          sx={{
                            p: 1.25,
                            borderRadius: 2,
                            border: `1px solid ${theme.palette.divider}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                            <Avatar sx={{ width: 30, height: 30, fontSize: 13, bgcolor: brandLight, color: brand }}>
                              {empName[0]?.toUpperCase() || "E"}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2" fontWeight={700} noWrap>
                                {empName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {emp.email || emp.mobile || "Assigned"}
                              </Typography>
                            </Box>
                          </Stack>
                          <Tooltip title="Remove team member">
                            <IconButton size="small" color="error" onClick={() => handleRemoveAssignee(emp.id)}>
                              <DeleteOutlineRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Paper>
                      );
                    })}
                  </Stack>
                )}

                <Divider sx={{ mb: 2 }} />

                {/* Assign New Team Members */}
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", display: "block", mb: 1 }}>
                  Assign Additional Members
                </Typography>
                <Autocomplete
                  multiple
                  options={employees.filter((emp) => !assignedPersons.some((a) => a.employee?.id === emp.id))}
                  getOptionLabel={(opt) => opt.name || opt.employee_name || `Employee #${opt.id}`}
                  value={employees.filter((emp) => newAssigneeIds.includes(emp.id))}
                  onChange={(_, val) => setNewAssigneeIds(val.map((item) => item.id))}
                  renderInput={(params) => (
                    <TextField {...params} size="small" placeholder="Select employees to assign" />
                  )}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => (
                      <Chip
                        size="small"
                        label={option.name || option.employee_name}
                        {...getTagProps({ index })}
                        key={option.id}
                      />
                    ))
                  }
                />
                {newAssigneeIds.length > 0 && (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<PersonAddRounded />}
                    onClick={handleAddNewAssignees}
                    sx={{ mt: 1.5, width: "100%", borderRadius: 2, fontWeight: 700, textTransform: "none" }}
                  >
                    Assign Selected ({newAssigneeIds.length})
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* 6. Concern / Contact Persons */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 2.5,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
              }}
            >
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.12), color: theme.palette.success.main, width: 36, height: 36 }}>
                    <PersonRounded fontSize="small" />
                  </Avatar>
                }
                title={<Typography variant="subtitle1" fontWeight={700}>Concern & Contact Persons</Typography>}
                subheader="Key stakeholders at this client"
                action={
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddRounded />}
                    onClick={() => setContactModalOpen(true)}
                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
                  >
                    Add Contact
                  </Button>
                }
              />
              <Divider />
              <CardContent sx={{ p: 2.5 }}>
                {contactPersons.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", textAlign: "center", py: 2 }}>
                    No contact persons added yet. Click &quot;Add Contact&quot; to create one.
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {contactPersons.map((contact) => (
                      <Paper
                        key={contact.id}
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.divider}`,
                          bgcolor: theme.palette.background.default,
                        }}
                      >
                        <Stack direction="row" spacing={1.25} alignItems="flex-start">
                          <Avatar sx={{ width: 34, height: 34, bgcolor: brandLight, color: brand, fontSize: 13, fontWeight: 700 }}>
                            {contact.person_name?.[0]?.toUpperCase() || "C"}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                              <Typography variant="body2" fontWeight={700}>
                                {contact.person_name}
                              </Typography>
                              {isTrue(contact.is_primary) && (
                                <Chip size="small" label="Primary" color="primary" sx={{ height: 20, fontSize: 10, fontWeight: 700 }} />
                              )}
                              {isTrue(contact.is_key_contact) && (
                                <Chip size="small" label="Key" color="warning" sx={{ height: 20, fontSize: 10, fontWeight: 700 }} />
                              )}
                            </Stack>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                              {contact.designation?.designation_name || contact.designation_name || "Designation not set"}
                            </Typography>
                            {contact.mobile && (
                              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ fontSize: 12, color: theme.palette.text.secondary }}>
                                <PhoneRounded sx={{ fontSize: 13 }} />
                                <span>{contact.mobile}</span>
                              </Stack>
                            )}
                            {contact.email && (
                              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ fontSize: 12, color: theme.palette.text.secondary }}>
                                <EmailRounded sx={{ fontSize: 13 }} />
                                <span>{contact.email}</span>
                              </Stack>
                            )}
                          </Box>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>

            {/* Save Card on Side on Desktop */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 2.5,
                border: `1px solid ${alpha(brand, 0.3)}`,
                bgcolor: alpha(brand, 0.04),
                p: 2,
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Ready to apply changes?
              </Typography>
              <Typography variant="caption" color="text.secondary" paragraph>
                Updates will be reflected across pipeline, activity timeline, and client workspaces immediately.
              </Typography>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={saving}
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveRounded />}
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  fontWeight: 800,
                  textTransform: "none",
                  boxShadow: "0 8px 20px rgba(2, 132, 199, 0.28)",
                }}
              >
                {saving ? "Saving Changes..." : "Save All Changes"}
              </Button>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Add Contact Person Modal Dialog */}
      <Dialog
        open={contactModalOpen}
        onClose={() => !savingContact && setContactModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Add Contact Person</DialogTitle>
        <Divider />
        <Box component="form" onSubmit={handleSaveContactPerson}>
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Contact Person Name"
                  value={contactForm.person_name}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, person_name: e.target.value }))}
                  placeholder="e.g. Jane Doe"
                  autoFocus
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="contact-desig-label">Designation</InputLabel>
                  <Select
                    labelId="contact-desig-label"
                    label="Designation"
                    value={contactForm.designation_id}
                    onChange={(e) => setContactForm((prev) => ({ ...prev, designation_id: e.target.value }))}
                  >
                    <MenuItem value="">-- Select Designation --</MenuItem>
                    {designations.map((desig) => (
                      <MenuItem key={desig.id} value={desig.id}>
                        {desig.designation_name || desig.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="contact-influence-label">Influencing Role</InputLabel>
                  <Select
                    labelId="contact-influence-label"
                    label="Influencing Role"
                    value={contactForm.influencing_role_id}
                    onChange={(e) => setContactForm((prev) => ({ ...prev, influencing_role_id: e.target.value }))}
                  >
                    <MenuItem value="">-- Select Role --</MenuItem>
                    {influenceRoles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.role_name || role.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone / Mobile"
                  value={contactForm.mobile}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, mobile: e.target.value }))}
                  placeholder="+880 1..."
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email Address"
                  value={contactForm.email}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="name@company.com"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Birth Date"
                  value={contactForm.birth_date}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, birth_date: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Anniversary"
                  value={contactForm.anniversary}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, anniversary: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Notes on Contact Person"
                  value={contactForm.note}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, note: e.target.value }))}
                  placeholder="Personal interests, preferred contact channel, schedule..."
                />
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={contactForm.is_primary}
                        onChange={(e) => setContactForm((prev) => ({ ...prev, is_primary: e.target.checked }))}
                      />
                    }
                    label="Primary Contact"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={contactForm.is_key_contact}
                        onChange={(e) => setContactForm((prev) => ({ ...prev, is_key_contact: e.target.checked }))}
                      />
                    }
                    label="Key Decision Maker"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={contactForm.is_responsive}
                        onChange={(e) => setContactForm((prev) => ({ ...prev, is_responsive: e.target.checked }))}
                      />
                    }
                    label="Responsive"
                  />
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setContactModalOpen(false)} disabled={savingContact} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={savingContact || !contactForm.person_name.trim()}
              startIcon={savingContact && <CircularProgress size={16} color="inherit" />}
            >
              {savingContact ? "Adding..." : "Add Contact"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Snackbar Alert */}
      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setAlert((prev) => ({ ...prev, open: false }))}
          severity={alert.severity}
          sx={{ width: "100%", borderRadius: 2, fontWeight: 600 }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
