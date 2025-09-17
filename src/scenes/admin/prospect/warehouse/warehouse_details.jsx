import React, { useState, useEffect, useMemo } from "react";
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
  Stack,
  Button,
  Chip,
  Divider,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
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
  Delete as DeleteIcon,
} from "@mui/icons-material";

import { format } from "date-fns";
import ContactPersonsProspect from "../components/contact_person_of_prospect";
import AddContactPersonPros from "../components/add_prospect_contact_person";
import {
  getProspectDetails,
  updateProspect,
  getContactPersonProspect,
 deleteProspect, // <- If you have this, uncomment and use in handleDeleteConfirm
} from "../../../../api/controller/admin_controller/prospect_controller";
import { tokens } from "../../../../theme";

/**
 * Optional: accept an onDelete callback if you don't have deleteProspect API.
 * onDelete(id) should return a promise.
 */
const WarehouseDetailsInfo = ({ onDelete }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const [details, setProspectDetail] = useState({});
  const [editedAddress, setEditedAddress] = useState("");
  const [editedName, setEditedName] = useState("");
  const [contactPersonList, setContactPersonList] = useState([]);

  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const fetchProspectDetails = async () => {
      try {
        const detailsRes = await getProspectDetails(id);
        if (detailsRes.status === "success") {
          setProspectDetail(detailsRes.data);
          setEditedAddress(detailsRes.data.address || "");
          setEditedName(detailsRes.data.prospect_name || "");
        }
      } catch (err) {
        console.error("Failed to fetch prospect details:", err);
      }
    };
    const fetchProspectContactPersons = async () => {
      try {
        const contactPersonRes = await getContactPersonProspect(id);
        if (contactPersonRes.status === "success") {
          setContactPersonList(contactPersonRes.data);
        }
      } catch (err) {
        console.error("Failed to fetch contact persons:", err);
      }
    };

    if (id) {
      fetchProspectDetails();
      fetchProspectContactPersons();
    }
  }, [id]);

  const handleViewProspectDetails = (pid) => {
    navigate(`/prospect-detail/${pid}`);
  };

  const handleSaveName = async () => {
    try {
      const response = await updateProspect({ prospect_id: details.id, prospect_name: editedName });
      if (response.status === "success") {
        setProspectDetail((prev) => ({ ...prev, prospect_name: editedName }));
        setIsEditingName(false);
        setSnack({ open: true, message: "Prospect name updated", severity: "success" });
      } else {
        setSnack({ open: true, message: "Failed to update name", severity: "error" });
      }
    } catch (error) {
      setSnack({ open: true, message: "Error updating name", severity: "error" });
    }
  };

  const handleSaveAddress = async () => {
    try {
      const response = await updateProspect({ prospect_id: details.id, address: editedAddress });
      if (response.status === "success") {
        setProspectDetail((prev) => ({ ...prev, address: editedAddress }));
        setIsEditingAddress(false);
        setSnack({ open: true, message: "Address updated", severity: "success" });
      } else {
        setSnack({ open: true, message: "Failed to update address", severity: "error" });
      }
    } catch (error) {
      setSnack({ open: true, message: "Error updating address", severity: "error" });
    }
  };

  const handleCancelName = () => {
    setEditedName(details.prospect_name || "");
    setIsEditingName(false);
  };
  const handleCancelAddress = () => {
    setEditedAddress(details.address || "");
    setIsEditingAddress(false);
  };

  const handleNavigationMap = (lat, long) => {
    if (lat && long) {
      navigate(`/google-map?lat=${lat}&lng=${long}`);
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy h:mm a");
    } catch {
      return "Invalid Date";
    }
  };

  const normalizeLink = (url) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `https://${url}`;
  };

  const handleDeleteConfirm = async () => {
    try {
      // If you have an API, use it:
       await deleteProspect( details.id);
      if (onDelete) {
        await onDelete(details.id);
      } else {
        console.warn("No delete API wired; provide `onDelete` prop or uncomment deleteProspect import.");
      }
      setSnack({ open: true, message: "Prospect deleted", severity: "success" });
      navigate("/prospect-list");
    } catch (e) {
      setSnack({ open: true, message: "Failed to delete prospect", severity: "error" });
    } finally {
      setConfirmOpen(false);
    }
  };

  const HeaderIcon = details.is_individual ? PersonIcon : BusinessIcon;

  return (
    <Card
      sx={{
        width: "100%",
        maxWidth: 980,
        m: "32px auto",
        borderRadius: 2,
        boxShadow: 3,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1.25}>
            <HeaderIcon sx={{ color: colors.blueAccent[300] }} />
            {isEditingName ? (
              <Box sx={{ flex: 1 }}>
                <TextField
                  autoFocus
                  fullWidth
                  size="small"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: theme.palette.background.default,
                      color: colors.gray[100],
                    },
                    "& fieldset": { borderColor: colors.gray[700] },
                  }}
                />
                <Box mt={1} display="flex" gap={1} justifyContent="flex-end">
                  <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={handleSaveName}>
                    Save
                  </Button>
                  <Button size="small" variant="outlined" color="error" startIcon={<CancelIcon />} onClick={handleCancelName}>
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box display="flex" alignItems="center" gap={1} sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: colors.gray[100],
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={details.prospect_name}
                >
                  {details.prospect_name || "Unnamed Prospect"}
                </Typography>
                <Tooltip title="Edit name">
                  <IconButton size="small" onClick={() => setIsEditingName(true)} color="info">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        }
        subheader={
          <Box display="flex" alignItems="center" gap={2} mt={1} flexWrap="wrap">
            <Typography variant="body2" color="text.secondary">
              <strong>Created:</strong> {formatDateForDisplay(details.created_at)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Last Activity:</strong> {formatDateForDisplay(details.last_activity)}
            </Typography>
            {/* Compact chips */}
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
              {details.priority_id && (
                <Chip
                  size="small"
                  icon={<PriorityIcon fontSize="small" />}
                  label={`Priority: ${details.priority_id}`}
                  sx={{ bgcolor: colors.gray[900], color: colors.gray[200] }}
                />
              )}
            </Box>
          </Box>
        }
        action={
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="View/Add Activity">
              <Button
                onClick={() => handleViewProspectDetails(details.id)}
                color="primary"
                variant="contained"
                size="small"
                startIcon={<SaveIcon />}
              >
                Activity
              </Button>
            </Tooltip>
            <Tooltip title="Delete prospect">
              <IconButton color="error" onClick={() => setConfirmOpen(true)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        }
        sx={{ pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}
      />

      <CardContent>
        <Grid container spacing={3}>
          {/* Contact Information */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 2,
                bgcolor: theme.palette.background.default,
                border: `1px solid ${theme.palette.divider}`,
                height: "100%",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, color: colors.blueAccent[300], mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                <LocationIcon fontSize="small" /> Contact Information
              </Typography>

              {/* Address */}
              <Box mb={1.5}>
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
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: theme.palette.background.paper,
                          color: colors.gray[100],
                        },
                        "& fieldset": { borderColor: colors.gray[700] },
                      }}
                    />
                    <Box mt={1} display="flex" gap={1} justifyContent="flex-end">
                      <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={handleSaveAddress}>
                        Save
                      </Button>
                      <Button size="small" variant="outlined" color="error" startIcon={<CancelIcon />} onClick={handleCancelAddress}>
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
              </Box>

              {/* Zone */}
              <Box mb={1}>
                <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                  Zone
                </Typography>
                <Typography variant="body1" sx={{ color: colors.gray[100] }}>
                  {details.zone?.zone_name || "N/A"}
                </Typography>
              </Box>

              {/* Coordinates + Map */}
              <Box>
                <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                  Coordinates
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5}>
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
                      <IconButton size="small" onClick={() => handleNavigationMap(details.latitude, details.longitude)} color="primary">
                        <MapIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Business / Meta */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 2,
                bgcolor: theme.palette.background.default,
                border: `1px solid ${theme.palette.divider}`,
                height: "100%",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, color: colors.blueAccent[300], mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                <InfoIcon fontSize="small" /> Business Details
              </Typography>

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
                  <WebIcon fontSize="small" sx={{ color: colors.gray[300] }} />
                  <Typography variant="body1" sx={{ color: colors.gray[100] }}>
                    <strong>Interested For:</strong> {details.interested_for?.product_name || "N/A"}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <PriorityIcon fontSize="small" sx={{ color: colors.gray[300] }} />
                  <Typography variant="body1" sx={{ color: colors.gray[100] }}>
                    <strong>Priority:</strong> {details.priority_id || "N/A"}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Online Presence */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 2,
                bgcolor: theme.palette.background.default,
                border: `1px solid ${theme.palette.divider}`,
                height: "100%",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, color: colors.blueAccent[300], mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                <WebIcon fontSize="small" /> Online Presence
              </Typography>
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
            </Paper>
          </Grid>

          {/* Notes */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 2,
                bgcolor: theme.palette.background.default,
                border: `1px solid ${theme.palette.divider}`,
                height: "100%",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, color: colors.blueAccent[300], mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                <InfoIcon fontSize="small" /> Notes
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: "pre-line", color: colors.gray[100] }}>
                {details.note || "No notes available"}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: colors.gray[800] }} />

        {/* Contacts */}
        <ContactPersonsProspect contactPersonList={contactPersonList} />
        <Box mt={2}>
          <AddContactPersonPros />
        </Box>
      </CardContent>

      {/* Delete Confirm Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete prospect?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action cannot be undone. The prospect and related references may be removed from views.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" startIcon={<DeleteIcon />}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback */}
      <Snackbar open={snack.open} autoHideDuration={2500} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default WarehouseDetailsInfo;
