import { useEffect, useState } from "react";
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  BusinessRounded,
  CancelRounded,
  EditRounded,
  Facebook,
  FlagRounded,
  InfoRounded,
  LanguageRounded,
  LinkedIn,
  LocationOnRounded,
  PersonRounded,
  SaveRounded,
  SourceRounded,
  WebRounded,
} from "@mui/icons-material";
import { format } from "date-fns";
import {
  fetchDistrictsByDivision,
  fetchDivisions,
  fetchUpozelasByDistrict,
  getProspectIndustryType,
  getProspectSource,
} from "../../../../api/controller/admin_controller/prospect_controller";
import { getProduct } from "../../../../api/controller/admin_controller/product_controller";
import { getPriority } from "../../../../api/controller/admin_controller/task_controller/task_controller";

const valueOrDash = (value) => value || "-";
const isTrue = (value) => value === true || value === 1 || value === "1";
const asList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
};
const idValue = (value) => (value === null || value === undefined ? "" : String(value));
const findById = (items, id) => items.find((item) => idValue(item.id) === idValue(id)) || null;
const getLocationName = (relation, directValue) =>
  relation?.name ||
  relation?.division_name ||
  relation?.district_name ||
  relation?.thana_name ||
  relation?.upazila_name ||
  directValue ||
  "";
const locationOptionName = (option) =>
  option?.name ||
  option?.division_name ||
  option?.district_name ||
  option?.upazila_name ||
  option?.upozela_name ||
  option?.thana_name ||
  "";
const relationOption = (relation, id) => (relation || id ? { ...(relation || {}), id: relation?.id || id } : null);
const nullableId = (value) => (value ? Number(value) : null);

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return format(date, "MMM dd, yyyy h:mm a");
};

const InfoRow = ({ icon, label, value, action }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: theme.palette.background.default,
        border: `1px solid ${theme.palette.divider}`,
        minHeight: "100%",
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        {icon && (
          <Avatar variant="rounded" sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.12), color: theme.palette.primary.main }}>
            {icon}
          </Avatar>
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 600, wordBreak: "break-word" }}>
            {valueOrDash(value)}
          </Typography>
        </Box>
        {action}
      </Stack>
    </Paper>
  );
};

const DetailsProspectInfo = ({ details = {}, onAddressUpdate }) => {
  const theme = useTheme();
  
  // Location edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editedAddress, setEditedAddress] = useState(details.address || "");
  const [locationForm, setLocationForm] = useState({
    division_id: details.division_id || details.division?.id || "",
    district_id: details.district_id || details.district?.id || "",
    thana_id: details.thana_id || details.thana?.id || details.upazila?.id || "",
  });
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [locationLoading, setLocationLoading] = useState({ divisions: false, districts: false, upazilas: false });
  const [locationError, setLocationError] = useState("");
  const [savingLocation, setSavingLocation] = useState(false);

  // Prospect Info Edit states (Industry, Source, Interested For, Priority & Online Presence)
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({
    industry_type_id: details.industry_type_id || details.industry_type?.id || "",
    information_source_id: details.information_source_id || details.information_source?.id || "",
    interested_for_id: details.interested_for_id || details.interested_for?.id || details.interested_product_id || "",
    priority_id: details.priority_id || details.priority?.id || "",
    website_link: details.website_link || "",
    facebook_page: details.facebook_page || "",
    linkedin: details.linkedin || "",
  });
  const [industryList, setIndustryList] = useState([]);
  const [sourceList, setSourceList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [priorityList, setPriorityList] = useState([]);
  const [infoLoading, setInfoLoading] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoError, setInfoError] = useState("");

  const isIndividual = isTrue(details.is_individual);
  const divisionName = getLocationName(details.division, details.division_name);
  const districtName = getLocationName(details.district, details.district_name);
  const thanaName = getLocationName(details.thana || details.upazila, details.thana_name || details.upazila_name);
  const selectedDivision = findById(divisions, locationForm.division_id) || relationOption(details.division, locationForm.division_id);
  const selectedDistrict = findById(districts, locationForm.district_id) || relationOption(details.district, locationForm.district_id);
  const selectedUpazila = findById(upazilas, locationForm.thana_id) || relationOption(details.thana || details.upazila, locationForm.thana_id);

  // Sync Address Form
  useEffect(() => {
    setEditedAddress(details.address || "");
    setLocationForm({
      division_id: details.division_id || details.division?.id || "",
      district_id: details.district_id || details.district?.id || "",
      thana_id: details.thana_id || details.thana?.id || details.upazila?.id || "",
    });
    setIsEditing(false);
    setLocationError("");
  }, [details.id, details.address, details.division_id, details.district_id, details.thana_id, details.division?.id, details.district?.id, details.thana?.id, details.upazila?.id]);

  // Sync Info Form (Industry, Source, Interested For, Priority, Online Links)
  useEffect(() => {
    setInfoForm({
      industry_type_id: details.industry_type_id || details.industry_type?.id || "",
      information_source_id: details.information_source_id || details.information_source?.id || "",
      interested_for_id: details.interested_for_id || details.interested_for?.id || details.interested_product_id || "",
      priority_id: details.priority_id || details.priority?.id || "",
      website_link: details.website_link || "",
      facebook_page: details.facebook_page || "",
      linkedin: details.linkedin || "",
    });
    setIsEditingInfo(false);
    setInfoError("");
  }, [
    details.id,
    details.industry_type_id,
    details.industry_type?.id,
    details.information_source_id,
    details.information_source?.id,
    details.interested_for_id,
    details.interested_for?.id,
    details.interested_product_id,
    details.priority_id,
    details.priority?.id,
    details.website_link,
    details.facebook_page,
    details.linkedin,
  ]);

  // Load Prospect Info Dropdown Options when Edit Info Mode Opens
  useEffect(() => {
    if (!isEditingInfo) return;
    let mounted = true;
    setInfoLoading(true);
    setInfoError("");

    Promise.all([
      getProspectIndustryType().catch(() => []),
      getProspectSource().catch(() => []),
      getProduct().catch(() => []),
      getPriority().catch(() => []),
    ])
      .then(([indRes, srcRes, prodRes, prioRes]) => {
        if (!mounted) return;
        setIndustryList(asList(indRes));
        setSourceList(asList(srcRes));
        setProductList(asList(prodRes));

        const prioData = asList(prioRes);
        setPriorityList(
          prioData.length
            ? prioData
            : [
                { id: 1, priority_name: "Low" },
                { id: 2, priority_name: "Medium" },
                { id: 3, priority_name: "High" },
                { id: 4, priority_name: "Urgent" },
              ]
        );
      })
      .catch((err) => {
        if (mounted) setInfoError(err.message || "Failed to fetch dropdown options.");
      })
      .finally(() => {
        if (mounted) setInfoLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isEditingInfo]);

  // Load Location Options when Location Edit Mode Opens
  useEffect(() => {
    if (!isEditing) return;
    let mounted = true;
    setLocationLoading((current) => ({ ...current, divisions: true }));
    fetchDivisions()
      .then((response) => {
        if (mounted) setDivisions(asList(response));
      })
      .catch((error) => {
        if (mounted) setLocationError(error.message || "Failed to fetch divisions.");
      })
      .finally(() => {
        if (mounted) setLocationLoading((current) => ({ ...current, divisions: false }));
      });

    return () => {
      mounted = false;
    };
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing || !locationForm.division_id) {
      if (!locationForm.division_id) setDistricts([]);
      return;
    }
    let mounted = true;
    setLocationLoading((current) => ({ ...current, districts: true }));
    fetchDistrictsByDivision(locationForm.division_id)
      .then((response) => {
        if (mounted) setDistricts(asList(response));
      })
      .catch((error) => {
        if (mounted) setLocationError(error.message || "Failed to fetch districts.");
      })
      .finally(() => {
        if (mounted) setLocationLoading((current) => ({ ...current, districts: false }));
      });

    return () => {
      mounted = false;
    };
  }, [isEditing, locationForm.division_id]);

  useEffect(() => {
    if (!isEditing || !locationForm.district_id) {
      if (!locationForm.district_id) setUpazilas([]);
      return;
    }
    let mounted = true;
    setLocationLoading((current) => ({ ...current, upazilas: true }));
    fetchUpozelasByDistrict(locationForm.district_id)
      .then((response) => {
        if (mounted) setUpazilas(asList(response));
      })
      .catch((error) => {
        if (mounted) setLocationError(error.message || "Failed to fetch upazilas.");
      })
      .finally(() => {
        if (mounted) setLocationLoading((current) => ({ ...current, upazilas: false }));
      });

    return () => {
      mounted = false;
    };
  }, [isEditing, locationForm.district_id]);

  // Save Prospect Info (Industry, Source, Interested For, Priority & Online Presence)
  const handleInfoSave = async () => {
    setSavingInfo(true);
    setInfoError("");
    try {
      await onAddressUpdate({
        prospect_id: details.id,
        industry_type_id: nullableId(infoForm.industry_type_id),
        information_source_id: nullableId(infoForm.information_source_id),
        interested_for_id: nullableId(infoForm.interested_for_id),
        priority_id: nullableId(infoForm.priority_id),
        website_link: infoForm.website_link ? infoForm.website_link.trim() : "",
        facebook_page: infoForm.facebook_page ? infoForm.facebook_page.trim() : "",
        linkedin: infoForm.linkedin ? infoForm.linkedin.trim() : "",
      });
      setIsEditingInfo(false);
    } catch (err) {
      setInfoError(err?.response?.data?.message || err?.message || "Failed to update prospect info.");
    } finally {
      setSavingInfo(false);
    }
  };

  const handleInfoCancel = () => {
    setInfoForm({
      industry_type_id: details.industry_type_id || details.industry_type?.id || "",
      information_source_id: details.information_source_id || details.information_source?.id || "",
      interested_for_id: details.interested_for_id || details.interested_for?.id || details.interested_product_id || "",
      priority_id: details.priority_id || details.priority?.id || "",
      website_link: details.website_link || "",
      facebook_page: details.facebook_page || "",
      linkedin: details.linkedin || "",
    });
    setInfoError("");
    setIsEditingInfo(false);
  };

  // Save Location & Address
  const handleSaveClick = async () => {
    setSavingLocation(true);
    setLocationError("");
    try {
      await onAddressUpdate({
        prospect_id: details.id,
        address: editedAddress,
        division_id: nullableId(locationForm.division_id),
        district_id: nullableId(locationForm.district_id),
        thana_id: nullableId(locationForm.thana_id),
      });
      setIsEditing(false);
    } catch (error) {
      setLocationError(error?.response?.data?.message || error?.message || "Failed to update prospect address.");
    } finally {
      setSavingLocation(false);
    }
  };

  const handleCancelClick = () => {
    setEditedAddress(details.address || "");
    setLocationForm({
      division_id: details.division_id || details.division?.id || "",
      district_id: details.district_id || details.district?.id || "",
      thana_id: details.thana_id || details.thana?.id || details.upazila?.id || "",
    });
    setLocationError("");
    setIsEditing(false);
  };

  const socialLinks = [
    { key: "website_link", label: "Website", icon: <WebRounded fontSize="small" /> },
    { key: "facebook_page", label: "Facebook", icon: <Facebook fontSize="small" /> },
    { key: "linkedin", label: "LinkedIn", icon: <LinkedIn fontSize="small" /> },
  ].filter((item) => details[item.key]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Header */}
      <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar variant="rounded" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12), color: theme.palette.primary.main }}>
            {isIndividual ? <PersonRounded /> : <BusinessRounded />}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
              Prospect Details
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Created {formatDate(details.created_at)} | Last activity {formatDate(details.last_activity)}
            </Typography>
          </Box>
        </Stack>

        {!isEditingInfo && (
          <Tooltip title="Edit Industry, Source, Interested For, Priority & Online Presence">
            <Button
              size="small"
              variant="outlined"
              startIcon={<EditRounded fontSize="small" />}
              onClick={() => setIsEditingInfo(true)}
              sx={{ borderRadius: 2, fontWeight: 700, textTransform: "none" }}
            >
              Edit Info
            </Button>
          </Tooltip>
        )}
      </Stack>

      {/* Prospect Info Edit Error Alert */}
      {infoError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {infoError}
        </Alert>
      )}

      {/* Editable Prospect Info Section (Industry, Source, Interested For, Priority, Online Links) */}
      {isEditingInfo ? (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2, bgcolor: theme.palette.background.default }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: theme.palette.primary.main }}>
            Update Prospect Info & Online Presence
          </Typography>
          {infoLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {/* Industry Dropdown */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Industry</InputLabel>
                  <Select
                    name="industry_type_id"
                    value={infoForm.industry_type_id}
                    label="Industry"
                    onChange={(e) => setInfoForm((prev) => ({ ...prev, industry_type_id: e.target.value }))}
                  >
                    <MenuItem value="">
                      <em>None / Unspecified</em>
                    </MenuItem>
                    {industryList.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.industry_type_name || item.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Source Dropdown */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Source</InputLabel>
                  <Select
                    name="information_source_id"
                    value={infoForm.information_source_id}
                    label="Source"
                    onChange={(e) => setInfoForm((prev) => ({ ...prev, information_source_id: e.target.value }))}
                  >
                    <MenuItem value="">
                      <em>None / Unspecified</em>
                    </MenuItem>
                    {sourceList.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.information_source_name || item.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Interested For Dropdown */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Interested For</InputLabel>
                  <Select
                    name="interested_for_id"
                    value={infoForm.interested_for_id}
                    label="Interested For"
                    onChange={(e) => setInfoForm((prev) => ({ ...prev, interested_for_id: e.target.value }))}
                  >
                    <MenuItem value="">
                      <em>None / Unspecified</em>
                    </MenuItem>
                    {productList.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.product_name || item.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Priority Dropdown */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    name="priority_id"
                    value={infoForm.priority_id}
                    label="Priority"
                    onChange={(e) => setInfoForm((prev) => ({ ...prev, priority_id: e.target.value }))}
                  >
                    <MenuItem value="">
                      <em>None / Unspecified</em>
                    </MenuItem>
                    {priorityList.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.priority_name || item.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Online Presence Links Fields */}
              <Grid item xs={12}>
                <Divider sx={{ my: 0.5 }}>
                  <Chip label="Online Presence Links" size="small" sx={{ fontWeight: 700 }} />
                </Divider>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Website Link"
                  placeholder="https://example.com"
                  name="website_link"
                  value={infoForm.website_link}
                  onChange={(e) => setInfoForm((prev) => ({ ...prev, website_link: e.target.value }))}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WebRounded fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Facebook Page URL"
                  placeholder="https://facebook.com/..."
                  name="facebook_page"
                  value={infoForm.facebook_page}
                  onChange={(e) => setInfoForm((prev) => ({ ...prev, facebook_page: e.target.value }))}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Facebook fontSize="small" sx={{ color: "#1877F2" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="LinkedIn URL"
                  placeholder="https://linkedin.com/in/..."
                  name="linkedin"
                  value={infoForm.linkedin}
                  onChange={(e) => setInfoForm((prev) => ({ ...prev, linkedin: e.target.value }))}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkedIn fontSize="small" sx={{ color: "#0A66C2" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<CancelRounded />}
                    onClick={handleInfoCancel}
                    disabled={savingInfo}
                    sx={{ borderRadius: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={savingInfo ? <CircularProgress size={16} color="inherit" /> : <SaveRounded />}
                    onClick={handleInfoSave}
                    disabled={savingInfo}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    Save Changes
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          )}
        </Paper>
      ) : (
        /* Read-Only Info Display */
        <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
          <Grid item xs={12} sm={6}>
            <InfoRow
              icon={<LanguageRounded fontSize="small" />}
              label="Industry"
              value={details.industry_type?.industry_type_name || details.industry_type_name}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoRow
              icon={<SourceRounded fontSize="small" />}
              label="Source"
              value={details.information_source?.information_source_name || details.information_source_name}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoRow
              icon={<InfoRounded fontSize="small" />}
              label="Interested For"
              value={details.interested_for?.product_name || details.interested_for_name}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoRow
              icon={<FlagRounded fontSize="small" />}
              label="Priority"
              value={details.priority?.priority_name || (details.priority_id ? `Priority ${details.priority_id}` : null)}
            />
          </Grid>
        </Grid>
      )}

      {/* Address and Location Card */}
      <Grid container spacing={1.5}>
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: theme.palette.background.default,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="flex-start">
              <Avatar variant="rounded" sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.12), color: theme.palette.primary.main }}>
                <LocationOnRounded fontSize="small" />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
                  Address
                </Typography>
                {isEditing ? (
                  <Stack spacing={1} sx={{ mt: 0.75 }}>
                    <TextField fullWidth size="small" multiline minRows={3} value={editedAddress} onChange={(event) => setEditedAddress(event.target.value)} />
                    <Grid container spacing={1}>
                      <Grid item xs={12} md={4}>
                        <Autocomplete
                          options={divisions}
                          value={selectedDivision}
                          loading={locationLoading.divisions}
                          onChange={(_, division) => {
                            setLocationForm({
                              division_id: division?.id || "",
                              district_id: "",
                              thana_id: "",
                            });
                          }}
                          getOptionLabel={locationOptionName}
                          isOptionEqualToValue={(option, value) => idValue(option.id) === idValue(value.id)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              label="Division"
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {locationLoading.divisions ? <CircularProgress color="inherit" size={18} /> : null}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Autocomplete
                          options={districts}
                          value={selectedDistrict}
                          loading={locationLoading.districts}
                          disabled={!locationForm.division_id || locationLoading.districts}
                          onChange={(_, district) => {
                            setLocationForm((current) => ({
                              ...current,
                              district_id: district?.id || "",
                              thana_id: "",
                            }));
                          }}
                          getOptionLabel={locationOptionName}
                          isOptionEqualToValue={(option, value) => idValue(option.id) === idValue(value.id)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              label="District"
                              placeholder={locationForm.division_id ? "Search district" : "Select division first"}
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {locationLoading.districts ? <CircularProgress color="inherit" size={18} /> : null}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Autocomplete
                          options={upazilas}
                          value={selectedUpazila}
                          loading={locationLoading.upazilas}
                          disabled={!locationForm.district_id || locationLoading.upazilas}
                          onChange={(_, upazila) => {
                            setLocationForm((current) => ({ ...current, thana_id: upazila?.id || "" }));
                          }}
                          getOptionLabel={locationOptionName}
                          isOptionEqualToValue={(option, value) => idValue(option.id) === idValue(value.id)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              label="Upazila / Thana"
                              placeholder={locationForm.district_id ? "Search upazila or thana" : "Select district first"}
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {locationLoading.upazilas ? <CircularProgress color="inherit" size={18} /> : null}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                    {locationError && <Alert severity="error">{locationError}</Alert>}
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" variant="outlined" startIcon={<CancelRounded />} onClick={handleCancelClick} disabled={savingLocation} sx={{ borderRadius: 2 }}>
                        Cancel
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={savingLocation ? <CircularProgress size={16} color="inherit" /> : <SaveRounded />}
                        onClick={handleSaveClick}
                        disabled={savingLocation}
                        sx={{ borderRadius: 2, fontWeight: 700 }}
                      >
                        Save
                      </Button>
                    </Stack>
                  </Stack>
                ) : (
                  <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 600, whiteSpace: "pre-line" }}>
                    {details.address || "No address available"}
                  </Typography>
                )}
              </Box>
              {!isEditing && (
                <Tooltip title="Edit address">
                  <IconButton size="small" onClick={() => setIsEditing(true)}>
                    <EditRounded fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <InfoRow icon={<LocationOnRounded fontSize="small" />} label="Coordinates" value={details.latitude && details.longitude ? `${details.latitude}, ${details.longitude}` : "-"} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <InfoRow label="Division" value={divisionName} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <InfoRow label="District" value={districtName} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <InfoRow label="Upazila / Thana" value={thanaName} />
        </Grid>
      </Grid>

      {/* Online Presence */}
      <Box sx={{ mt: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="subtitle2" sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
            Online Presence
          </Typography>
          {!isEditingInfo && (
            <Tooltip title="Edit Online Presence Links">
              <IconButton size="small" onClick={() => setIsEditingInfo(true)}>
                <EditRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
        {socialLinks.length ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {socialLinks.map((item) => (
              <Chip
                key={item.key}
                icon={item.icon}
                label={item.label}
                clickable
                component={Link}
                href={details[item.key]}
                target="_blank"
                rel="noopener"
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            No online links available.
          </Typography>
        )}
      </Box>

      {/* Notes */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ color: theme.palette.text.primary, fontWeight: 700, mb: 1 }}>
          Notes
        </Typography>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: theme.palette.background.default, border: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.primary, whiteSpace: "pre-line" }}>
            {details.note || "No notes available."}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default DetailsProspectInfo;
