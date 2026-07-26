import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
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

const valueOrDash = (value) => value || "-";
const isTrue = (value) => value === true || value === 1 || value === "1";

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
        <Avatar variant="rounded" sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.12), color: theme.palette.primary.main }}>
          {icon}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 800, wordBreak: "break-word" }}>
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
  const isIndividual = isTrue(details.is_individual);

  useEffect(() => {
    setEditedAddress(details.address || "");
    setIsEditing(false);
  }, [details.id, details.address]);

  const handleSaveClick = () => {
    onAddressUpdate({ prospect_id: details.id, address: editedAddress });
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setEditedAddress(details.address || "");
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
          <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 900 }}>
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
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" variant="outlined" startIcon={<CancelRounded />} onClick={handleCancelClick} sx={{ borderRadius: 2 }}>
                        Cancel
                      </Button>
                      <Button size="small" variant="contained" startIcon={<SaveRounded />} onClick={handleSaveClick} sx={{ borderRadius: 2, fontWeight: 900 }}>
                        Save
                      </Button>
                    </Stack>
                  </Stack>
                ) : (
                  <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 800, whiteSpace: "pre-line" }}>
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
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ color: theme.palette.text.primary, fontWeight: 900, mb: 1 }}>
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
                sx={{ fontWeight: 800 }}
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
        <Typography variant="subtitle2" sx={{ color: theme.palette.text.primary, fontWeight: 900, mb: 1 }}>
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