import { useEffect, useState } from "react";
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Link,
  Paper,
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
  PublicRounded,
  SaveRounded,
  SourceRounded,
  WebRounded,
} from "@mui/icons-material";
import { format } from "date-fns";
import {
  fetchDistrictsByDivision,
  fetchDivisions,
  fetchUpozelasByDistrict,
} from "../../../../api/controller/admin_controller/prospect_controller";

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
  const isIndividual = isTrue(details.is_individual);
  const divisionName = getLocationName(details.division, details.division_name);
  const districtName = getLocationName(details.district, details.district_name);
  const thanaName = getLocationName(details.thana || details.upazila, details.thana_name || details.upazila_name);
  const selectedDivision = findById(divisions, locationForm.division_id) || relationOption(details.division, locationForm.division_id);
  const selectedDistrict = findById(districts, locationForm.district_id) || relationOption(details.district, locationForm.district_id);
  const selectedUpazila = findById(upazilas, locationForm.thana_id) || relationOption(details.thana || details.upazila, locationForm.thana_id);

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
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
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

      <Grid container spacing={1.5}>
        <Grid item xs={12} sm={6}>
          <InfoRow icon={<LanguageRounded fontSize="small" />} label="Industry" value={details.industry_type?.industry_type_name} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoRow icon={<SourceRounded fontSize="small" />} label="Source" value={details.information_source?.information_source_name} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoRow icon={<InfoRounded fontSize="small" />} label="Interested For" value={details.interested_for?.product_name} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoRow icon={<FlagRounded fontSize="small" />} label="Priority" value={details.priority?.priority_name || details.priority_id} />
        </Grid>
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
        <Grid item xs={12} sm={6}>
          <InfoRow icon={<PublicRounded fontSize="small" />} label="Zone" value={details.zone?.zone_name} />
        </Grid>
        <Grid item xs={12} sm={6}>
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

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ color: theme.palette.text.primary, fontWeight: 700, mb: 1 }}>
          Online Presence
        </Typography>
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
