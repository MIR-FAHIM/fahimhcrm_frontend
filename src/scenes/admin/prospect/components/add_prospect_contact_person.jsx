import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  TextField,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Link,
  Tooltip,
  Container,
  Stack,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Divider,
  Chip,
  useTheme,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  Language as IndustryIcon,
  Public as SourceIcon,
  PriorityHigh as PriorityIcon,
  LocationOn as LocationIcon,
  Web as WebIcon,
  Facebook as FacebookIcon,
  LinkedIn as LinkedInIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Map as MapIcon,
  Add as AddIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { tokens } from "../../../../theme";

// APIs
import {
  fetchDesignation,
  fetchInfluenceRoles,
  fetchZone,
} from "../../../../api/controller/admin_controller/department_controller";
import {
  getProspectDetails,
  updateProspect,
  addContactPerson,
  getContactPersonProspect,
} from "../../../../api/controller/admin_controller/prospect_controller";

// ---------- Helpers ----------
const normalizeLink = (url) => (url?.startsWith("http") ? url : url ? `https://${url}` : null);
const fmtDate = (d) => {
  if (!d) return "N/A";
  try {
    return format(new Date(d), "MMM dd, yyyy h:mm a");
  } catch {
    return "Invalid Date";
  }
};

// ---------- Initial State (aligned to API keys) ----------
const initialContactPersonState = {
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
  anniversary: "",
  birth_date: "",
  showMore: false,
};

const FieldCard = ({ title, icon, children, colors, theme, dense }) => (
  <Paper
    elevation={0}
    sx={{
      p: dense ? 2 : 3,
      borderRadius: 2,
      bgcolor: theme.palette.background.default,
      border: `1px solid ${theme.palette.divider}`,
      height: "100%",
    }}
  >
    <Typography
      variant="h6"
      sx={{
        fontWeight: 800,
        color: colors.blueAccent[300],
        mb: dense ? 1 : 1.5,
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      {icon} {title}
    </Typography>
    {children}
  </Paper>
);

const inputSx = (theme, colors) => ({
  "& .MuiOutlinedInput-root": {
    bgcolor: theme.palette.background.paper,
    color: colors.gray[100],
    "& .MuiSvgIcon-root": { color: colors.gray[300] },
  },
  "& .MuiInputLabel-root": { color: colors.gray[400] },
  "& .MuiFormHelperText-root": { color: colors.gray[400] },
  "& fieldset": { borderColor: colors.gray[700] },
});

const AddContactPersonPros = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Prospect details
  const [details, setProspectDetail] = useState({});
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editedAddress, setEditedAddress] = useState("");

  // Lists
  const [designationList, setDesignationList] = useState([]);
  const [influenceList, setInfluenceList] = useState([]);
  const [zoneList, setZoneList] = useState([]);

  // Contact persons
  const [contactPersons, setContactPersons] = useState([{ ...initialContactPersonState }]);

  // Feedback
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    const load = async () => {
      try {
        if (id) {
          const detailsRes = await getProspectDetails(id);
          if (detailsRes.status === "success") {
            setProspectDetail(detailsRes.data);
            setEditedAddress(detailsRes.data.address || "");
          }

          const contactsRes = await getContactPersonProspect(id);
          if (contactsRes.status === "success") {
            const mapped =
              contactsRes.data.length > 0
                ? contactsRes.data.map((c) => ({
                    person_name: c.person_name || "",
                    email: c.email || "",
                    mobile: c.mobile || "",
                    designation_id: c.designation_id || "",
                    note: c.note || "",
                    is_primary: Boolean(c.is_primary),
                    is_responsive: Boolean(c.is_responsive),
                    is_key_contact: Boolean(c.is_key_contact),
                    is_switched_job: Boolean(c.is_switched_job),
                    birth_date: c.birth_date || "",
                    anniversary: c.anniversary || "",
                    attitude_id: c.attitude_id || "",
                    influencing_role_id: c.influencing_role_id || "",
                    showMore: false,
                  }))
                : [{ ...initialContactPersonState }];
            setContactPersons(mapped);
          }
        }

        const [designationsRes, influenceRes, zoneRes] = await Promise.all([
          fetchDesignation(),
          fetchInfluenceRoles(),
          fetchZone(),
        ]);
        if (designationsRes.status === "success") setDesignationList(designationsRes.data);
        if (influenceRes.status === "success") setInfluenceList(influenceRes.data);
        if (zoneRes.status === "success") setZoneList(zoneRes.data);
      } catch (e) {
        console.error(e);
        setSnack({ open: true, message: "Failed to load data", severity: "error" });
      }
    };
    load();
  }, [id]);

  // Prospect address update
  const handleSaveProspectAddress = async () => {
    try {
      const res = await updateProspect({ prospect_id: details.id, address: editedAddress });
      if (res.status === "success") {
        setProspectDetail((p) => ({ ...p, address: editedAddress }));
        setIsEditingAddress(false);
        setSnack({ open: true, message: "Address updated", severity: "success" });
      } else {
        setSnack({ open: true, message: "Failed to update address", severity: "error" });
      }
    } catch {
      setSnack({ open: true, message: "Error updating address", severity: "error" });
    }
  };

  const handleNavigationMap = (lat, lng) => {
    if (lat && lng) navigate(`/google-map?lat=${lat}&lng=${lng}`);
  };

  // Contact persons handlers
  const handleContactChange = useCallback((idx, field, value) => {
    setContactPersons((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }, []);

  const handleToggleMoreInfo = useCallback((idx) => {
    setContactPersons((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], showMore: !next[idx].showMore };
      return next;
    });
  }, []);

  const addContactPersonField = useCallback(
    () => setContactPersons((prev) => [...prev, { ...initialContactPersonState }]),
    []
  );

  const handleRemoveContact = useCallback((idx) => {
    setContactPersons((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return next.length ? next : [{ ...initialContactPersonState }];
    });
  }, []);

  const handleSubmitContactPersons = async () => {
    try {
      const payload = contactPersons
        .map((p) => ({
          person_name: p.person_name?.trim() || "",
          designation_id: p.designation_id || null,
          mobile: p.mobile?.trim() || "",
          email: p.email?.trim() || "",
          note: p.note?.trim() || "",
          is_primary: Number(!!p.is_primary),
          is_responsive: Number(!!p.is_responsive),
          is_key_contact: Number(!!p.is_key_contact),
          is_switched_job: Number(!!p.is_switched_job),
          attitude_id: p.attitude_id || null,
          influencing_role_id: p.influencing_role_id || null,
          anniversary: p.anniversary || null,
          birth_date: p.birth_date || null,
        }))
        .filter((p) => p.person_name || p.email || p.mobile);

      if (!payload.length) {
        setSnack({ open: true, message: "Nothing to save. Fill at least one contact.", severity: "warning" });
        return;
      }

      const resp = await addContactPerson({ prospect_id: id, contacts: payload });
      if (resp.status === "success") {
        setSnack({ open: true, message: "Contacts saved", severity: "success" });
      } else {
        setSnack({ open: true, message: "Failed to save contacts", severity: "error" });
      }
    } catch {
      setSnack({ open: true, message: "Error saving contacts", severity: "error" });
    }
  };

  const HeaderIcon = details.is_individual ? PersonIcon : BusinessIcon;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Card
        sx={{
          width: "100%",
          borderRadius: 2,
          boxShadow: 4,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={1.25}>
              <HeaderIcon sx={{ color: colors.blueAccent[300] }} />
              <Typography
                variant="h5"
                fontWeight={800}
                sx={{ color: colors.gray[100], display: "flex", alignItems: "center", gap: 1 }}
              >
                {details.prospect_name || "Loading…"}
                {details.priority_id && (
                  <Chip
                    size="small"
                    label={`Priority: ${details.priority_id}`}
                    sx={{ ml: 1, bgcolor: colors.gray[900], color: colors.gray[200] }}
                  />
                )}
              </Typography>
            </Box>
          }
          subheader={
            <Box display="flex" alignItems="center" gap={2} mt={1} flexWrap="wrap">
              <Typography variant="body2" color="text.secondary">
                <strong>Created:</strong> {fmtDate(details.created_at)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Last Activity:</strong> {fmtDate(details.last_activity)}
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {details.industry_type?.industry_type_name && (
                  <Chip
                    size="small"
                    icon={<IndustryIcon fontSize="small" />}
                    label={details.industry_type.industry_type_name}
                    sx={{ bgcolor: colors.gray[900], color: colors.gray[200] }}
                  />
                )}
                {details.information_source?.information_source_name && (
                  <Chip
                    size="small"
                    icon={<SourceIcon fontSize="small" />}
                    label={details.information_source.information_source_name}
                    sx={{ bgcolor: colors.gray[900], color: colors.gray[200] }}
                  />
                )}
                {details.interested_for?.product_name && (
                  <Chip
                    size="small"
                    icon={<WebIcon fontSize="small" />}
                    label={`Interested: ${details.interested_for.product_name}`}
                    sx={{ bgcolor: colors.gray[900], color: colors.gray[200] }}
                  />
                )}
              </Box>
            </Box>
          }
          sx={{ pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}
        />

        <CardContent>
          {/* Prospect & Contact Info */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FieldCard title="Business Details" icon={<InfoIcon fontSize="small" />} colors={colors} theme={theme}>
                <Stack spacing={1.25}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <IndustryIcon fontSize="small" sx={{ color: colors.gray[300] }} />
                    <Typography variant="body1" sx={{ color: colors.gray[100] }}>
                      <strong>Industry:</strong> {details.industry_type?.industry_type_name || "N/A"}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <SourceIcon fontSize="small" sx={{ color: colors.gray[300] }} />
                    <Typography variant="body1" sx={{ color: colors.gray[100] }}>
                      <strong>Source:</strong> {details.information_source?.information_source_name || "N/A"}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PriorityIcon fontSize="small" sx={{ color: colors.gray[300] }} />
                    <Typography variant="body1" sx={{ color: colors.gray[100] }}>
                      <strong>Priority:</strong> {details.priority_id || "N/A"}
                    </Typography>
                  </Box>
                </Stack>
              </FieldCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <FieldCard title="Contact Information" icon={<LocationIcon fontSize="small" />} colors={colors} theme={theme}>
                {/* Address */}
                <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                  Address
                </Typography>
                {isEditingAddress ? (
                  <Box mt={0.5}>
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      rows={3}
                      value={editedAddress}
                      onChange={(e) => setEditedAddress(e.target.value)}
                      sx={inputSx(theme, colors)}
                    />
                    <Box mt={1} display="flex" gap={1} justifyContent="flex-end">
                      <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={handleSaveProspectAddress}>
                        Save
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => {
                          setEditedAddress(details.address || "");
                          setIsEditingAddress(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box mt={0.5} display="flex" alignItems="center" gap={1}>
                    <Typography variant="body1" sx={{ color: colors.gray[100], flex: 1 }}>
                      {details.address || "No address available"}
                    </Typography>
                    <Tooltip title="Edit address">
                      <IconButton size="small" onClick={() => setIsEditingAddress(true)} color="info">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}

                <Box mt={2} display="flex" alignItems="center" gap={1}>
                  <Typography variant="caption" sx={{ color: colors.gray[400], minWidth: 72 }}>
                    Zone
                  </Typography>
                  <Typography variant="body1" sx={{ color: colors.gray[100] }}>
                    {details.zone?.zone_name || "N/A"}
                  </Typography>
                </Box>

                <Box mt={1} display="flex" alignItems="center" gap={1}>
                  <Typography variant="caption" sx={{ color: colors.gray[400], minWidth: 72 }}>
                    Coords
                  </Typography>
                  <Typography variant="body1" sx={{ color: colors.gray[100] }}>
                    {details.latitude && details.longitude ? (
                      <Link
                        component="button"
                        variant="body1"
                        onClick={() => handleNavigationMap(details.latitude, details.longitude)}
                        sx={{ textDecoration: "underline" }}
                      >
                        {`${details.latitude}, ${details.longitude}`}
                      </Link>
                    ) : (
                      "N/A"
                    )}
                  </Typography>
                  {details.latitude && details.longitude && (
                    <Tooltip title="View on Map">
                      <IconButton
                        size="small"
                        onClick={() => handleNavigationMap(details.latitude, details.longitude)}
                        color="primary"
                        sx={{ ml: 0.5 }}
                      >
                        <MapIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </FieldCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <FieldCard title="Online Presence" icon={<WebIcon fontSize="small" />} colors={colors} theme={theme}>
                {details.website_link || details.facebook_page || details.linkedin ? (
                  <Stack spacing={1.25}>
                    {details.website_link && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <WebIcon fontSize="small" sx={{ color: colors.gray[300] }} />
                        <Link href={normalizeLink(details.website_link)} target="_blank" rel="noopener" variant="body1">
                          Website
                        </Link>
                      </Box>
                    )}
                    {details.facebook_page && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <FacebookIcon fontSize="small" sx={{ color: colors.gray[300] }} />
                        <Link href={normalizeLink(details.facebook_page)} target="_blank" rel="noopener" variant="body1">
                          Facebook
                        </Link>
                      </Box>
                    )}
                    {details.linkedin && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <LinkedInIcon fontSize="small" sx={{ color: colors.gray[300] }} />
                        <Link href={normalizeLink(details.linkedin)} target="_blank" rel="noopener" variant="body1">
                          LinkedIn
                        </Link>
                      </Box>
                    )}
                  </Stack>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No online presence details available.
                  </Typography>
                )}
              </FieldCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <FieldCard title="Notes" icon={<InfoIcon fontSize="small" />} colors={colors} theme={theme}>
                <Typography variant="body1" sx={{ whiteSpace: "pre-line", color: colors.gray[100] }}>
                  {details.note || "No notes available"}
                </Typography>
              </FieldCard>
            </Grid>
          </Grid>

          {/* ---------- Contacts ---------- */}
          <Divider sx={{ my: 4, borderColor: colors.gray[800] }} />
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" sx={{ color: colors.gray[100], fontWeight: 800 }}>
              Manage Contact Persons
            </Typography>
            <Tooltip title="Add contact">
              <IconButton onClick={addContactPersonField} color="primary">
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {contactPersons.map((person, index) => (
            <Box
              key={`cp-${index}`}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                p: 2.5,
                mb: 2.5,
                bgcolor: theme.palette.background.default,
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={person.person_name}
                    onChange={(e) => handleContactChange(index, "person_name", e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={inputSx(theme, colors)}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={person.email}
                    onChange={(e) => handleContactChange(index, "email", e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={inputSx(theme, colors)}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Mobile"
                    type="tel"
                    value={person.mobile}
                    onChange={(e) => handleContactChange(index, "mobile", e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={inputSx(theme, colors)}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <FormControl fullWidth size="small" sx={inputSx(theme, colors)}>
                    <InputLabel id={`designation-label-${index}`}>Designation</InputLabel>
                    <Select
                      labelId={`designation-label-${index}`}
                      value={person.designation_id || ""}
                      label="Designation"
                      onChange={(e) => handleContactChange(index, "designation_id", e.target.value)}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {designationList.map((d) => (
                        <MenuItem key={d.id} value={d.id}>
                          {d.designation_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={1}
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-end"
                >
                  {contactPersons.length > 1 && (
                    <Tooltip title="Remove contact">
                      <IconButton color="error" onClick={() => handleRemoveContact(index)}>
                        <RemoveCircleOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleToggleMoreInfo(index)}
                    sx={{ mt: 0.5 }}
                  >
                    {person.showMore ? "Hide Additional Info" : "Show Additional Info"}
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
                        border: `1px dashed ${colors.gray[700]}`,
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Note"
                            variant="outlined"
                            value={person.note}
                            onChange={(e) => handleContactChange(index, "note", e.target.value)}
                            size="small"
                            sx={inputSx(theme, colors)}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Box
                            display="flex"
                            flexWrap="wrap"
                            gap={2.5}
                            sx={{
                              border: `1px solid ${colors.gray[800]}`,
                              borderRadius: 2,
                              p: 1.5,
                              bgcolor: theme.palette.background.default,
                            }}
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
                                    checked={!!person[item.key]}
                                    onChange={(e) => handleContactChange(index, item.key, e.target.checked)}
                                    color="primary"
                                  />
                                }
                                label={item.label}
                                sx={{ color: colors.gray[200] }}
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
                            value={person.birth_date}
                            onChange={(e) => handleContactChange(index, "birth_date", e.target.value)}
                            size="small"
                            sx={inputSx(theme, colors)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            type="date"
                            label="Anniversary"
                            InputLabelProps={{ shrink: true }}
                            value={person.anniversary}
                            onChange={(e) => handleContactChange(index, "anniversary", e.target.value)}
                            size="small"
                            sx={inputSx(theme, colors)}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Attitude ID"
                            value={person.attitude_id}
                            onChange={(e) => handleContactChange(index, "attitude_id", e.target.value)}
                            size="small"
                            sx={inputSx(theme, colors)}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth size="small" sx={inputSx(theme, colors)}>
                            <InputLabel id={`infl-role-label-${index}`}>Influencing Role</InputLabel>
                            <Select
                              labelId={`infl-role-label-${index}`}
                              value={person.influencing_role_id || ""}
                              label="Influencing Role"
                              onChange={(e) => handleContactChange(index, "influencing_role_id", e.target.value)}
                            >
                              <MenuItem value="">
                                <em>None</em>
                              </MenuItem>
                              {influenceList.map((r) => (
                                <MenuItem key={r.id} value={r.id}>
                                  {r.role_name}
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

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              onClick={handleSubmitContactPersons}
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<SaveIcon />}
            >
              Save Contact Persons
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar open={snack.open} autoHideDuration={2500} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AddContactPersonPros;
