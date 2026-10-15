import { useState, useEffect, useRef } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Grid,
  TextField,
  Typography,
  IconButton,
  Paper,
  Stack,
  Chip,
  Divider,
  useTheme,
  Tooltip,
} from "@mui/material";
import {
  Logout as LogoutIcon,
  Upload as UploadIcon,
  AccessTime as AccessTimeIcon,
  Apartment as ApartmentIcon,
  Badge as BadgeIcon,
  Cake as CakeIcon,
  Email as EmailIcon,
  LockReset as LockResetIcon,
  Phone as PhoneIcon,
  WorkOutline as WorkOutlineIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { buildProfileForm, resolveProfilePhoto } from "../profile_edit_utils";
import ProfileEditor from "./profile_editor";

const SectionCard = ({ title, subtitle, icon, action, children, sx }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        transition: "border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease",
        "&:hover": {
          borderColor: alpha(theme.palette.blueAccent?.main ?? theme.palette.primary.main, 0.35),
          boxShadow: theme.palette.mode === "dark" ? "0 16px 38px rgba(0,0,0,0.18)" : "0 14px 32px rgba(15,23,42,0.06)",
        },
        ...sx,
      }}
    >
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2} mb={1.5}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          {icon && (
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1.25,
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.blueAccent?.main ?? theme.palette.primary.main, 0.12),
                color: theme.palette.blueAccent?.main ?? theme.palette.primary.main,
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          )}
          <Box>
            <Typography variant="subtitle1" fontWeight={700} color={theme.palette.text.primary}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
        {action}
      </Box>
      <Divider sx={{ mb: 2 }} />
      {children}
    </Paper>
  );
};

const InfoTile = ({ icon, label, value }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: 1.5,
        bgcolor: alpha(theme.palette.text.primary, 0.035),
        border: `1px solid ${theme.palette.divider}`,
        minHeight: 72,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ color: theme.palette.text.secondary, display: "flex", "& svg": { fontSize: 18 } }}>
          {icon}
        </Box>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
          {label}
        </Typography>
      </Stack>
      <Typography
        variant="body2"
        noWrap
        title={value || "-"}
        sx={{ color: theme.palette.text.primary, fontWeight: 700, mt: 0.75 }}
      >
        {value || "-"}
      </Typography>
    </Box>
  );
};

const ReadRow = ({ label, value }) => {
  const theme = useTheme();
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" mb={1.25}>
      <Typography sx={{ color: theme.palette.text.secondary, minWidth: 120 }}>
        {label}
      </Typography>
      <Typography sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
        {value || "-"}
      </Typography>
    </Stack>
  );
};


const ProfileComponent = ({
  handleFileChange,
  handleUpload,
  changePass,
  profileData = {},
  userID,
  canManageProfile = false,
  handleLogout,
  handleUpdateData,
  imageUrl,
  isSuperAdmin = false,
  assignmentOptions = { roles: [], departments: [], designations: [] },
  attendanceMethodOptions = [],
  assignmentLoading = false,
  assignmentError = "",
  onRetryOptions,
  uploading = false,
  selectedFile,
}) => {
  const theme = useTheme();
  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;
  const brandDark = theme.palette.blueAccent?.dark ?? theme.palette.primary.dark;
  const brandContrast = theme.palette.blueAccent?.contrastText ?? theme.palette.primary.contrastText;

  const [passwordData, setPasswordData] = useState({});
  const [avatarError, setAvatarError] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const fileRef = useRef(null);
  const isMyProfile = String(userID) === String(profileData?.id);
  const canEditProfile = isMyProfile || canManageProfile;

  useEffect(() => {
    setAvatarError(false);
    setPasswordData({
      user_id: profileData.id || "",
      current_password: "",
      new_password: "",
      confirm_new_password: "",
    });
  }, [profileData]);
  const onPasswordField = (e) => {
    const { name, value } = e.target;
    setPasswordData((p) => ({ ...p, [name]: value }));
  };


  const handlePasswordSave = () => {
    setPasswordError("");
    if (
      !passwordData.current_password ||
      !passwordData.new_password ||
      !passwordData.confirm_new_password
    ) {
      setPasswordError("All password fields are required.");
      return;
    }
    if (passwordData.new_password !== passwordData.confirm_new_password) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (passwordData.new_password.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    changePass(passwordData);
  };

  const getInitials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "BT";

  const photoSrc = avatarError ? undefined : imageUrl || resolveProfilePhoto(profileData?.photo);
  const canUpload = canEditProfile;
  const officeTimes = buildProfileForm(profileData);
  const officeTimeLabel = `${officeTimes.office_start_time || "Not set"} - ${officeTimes.office_end_time || "Not set"}`;
  const profileHighlights = [
    { label: "Email", value: profileData?.email, icon: <EmailIcon /> },
    { label: "Phone", value: profileData?.phone, icon: <PhoneIcon /> },
    { label: "Birthdate", value: profileData?.birthdate ? profileData.birthdate.split("T")[0] : "-", icon: <CakeIcon /> },
    { label: "Office Time", value: officeTimeLabel, icon: <AccessTimeIcon /> },
  ];


  return (
    <Box
      sx={{
        maxWidth: 1180,
        mx: "auto",
        p: { xs: 0, md: 0 },
      }}
    >
      <SectionCard
        title="Profile Snapshot"
        subtitle="Quick identity, contact, and office-time overview."
        action={
          isMyProfile && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                color="warning"
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                sx={{ textTransform: "none" }}
              >
                Log out
              </Button>
            </Stack>
          )
        }
        sx={{ mb: 2 }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md="auto">
            <Box position="relative" width={132} height={132}>
              <Avatar
                src={photoSrc}
                alt={profileData?.name || "Profile"}
                onError={() => setAvatarError(true)}
                sx={{
                  width: 132,
                  height: 132,
                  border: `4px solid ${theme.palette.background.paper}`,
                  boxShadow: `0 0 0 1px ${alpha(brand, 0.28)}, 0 18px 34px ${alpha(brand, 0.20)}`,
                  bgcolor: brandDark,
                  color: brandContrast,
                  fontSize: 34,
                  fontWeight: 700,
                }}
              >
                {getInitials(profileData?.name)}
              </Avatar>
              {canUpload && (
                <Tooltip title="Choose profile photo">
                  <IconButton
                    size="small"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    sx={{
                      position: "absolute",
                      right: -6,
                      bottom: -6,
                      width: 40,
                      height: 40,
                      bgcolor: theme.palette.background.paper,
                      color: brand,
                      border: `1px solid ${alpha(brand, 0.35)}`,
                      boxShadow: "0 10px 24px rgba(15,23,42,0.12)",
                      "&:hover": { bgcolor: alpha(brand, 0.12) },
                    }}
                  >
                    <UploadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <input
                hidden
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md>
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 700, lineHeight: 1.1 }}>
                  {profileData?.name || "-"}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
                  {profileData?.bio || "No bio added yet."}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                icon={<BadgeIcon />}
                label={profileData?.role?.role_name || "Role -"}
                sx={{
                  bgcolor: alpha(brand, 0.10),
                  color: brand,
                  border: `1px solid ${alpha(brand, 0.25)}`,
                  fontWeight: 600,
                }}
              />
              <Chip
                size="small"
                icon={<ApartmentIcon />}
                label={profileData?.department?.department_name || "Department -"}
                sx={{
                  bgcolor: alpha(theme.palette.text.primary, 0.06),
                  color: theme.palette.text.primary,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              />
              <Chip
                size="small"
                icon={<WorkOutlineIcon />}
                label={profileData?.designation?.designation_name || "Designation -"}
                sx={{
                  bgcolor: alpha(theme.palette.text.primary, 0.06),
                  color: theme.palette.text.primary,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              />
            </Stack>

              <Grid container spacing={1.25}>
                {profileHighlights.map((item) => (
                  <Grid item xs={12} sm={6} lg={3} key={item.label}>
                    <InfoTile icon={item.icon} label={item.label} value={item.value} />
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Grid>

          {canUpload && (
            <Grid item xs={12} md="auto">
              <Button
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
                variant="contained"
                startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <UploadIcon />}
                sx={{
                  textTransform: "none",
                  bgcolor: brand,
                  color: brandContrast,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  "&:hover": { bgcolor: brandDark },
                }}
              >
                Upload Photo
              </Button>
              {selectedFile && <Typography variant="caption" display="block" sx={{ mt: 1, overflowWrap: "anywhere" }}>{selectedFile.name}</Typography>}
            </Grid>
          )}
        </Grid>
      </SectionCard>


      <ProfileEditor
        key={profileData.id}
        profile={profileData}
        canEditProfile={canEditProfile}
        canManageProfile={canManageProfile}
        isSuperAdmin={isSuperAdmin}
        options={assignmentOptions}
        attendanceMethods={attendanceMethodOptions}
        optionsLoading={assignmentLoading}
        optionsError={assignmentError}
        onRetryOptions={onRetryOptions}
        onSave={handleUpdateData}
        onStatusSave={handleUpdateData}
      />
      {/* Password */}
      {isMyProfile && (
        <SectionCard
          title="Change Password"
          subtitle="Keep your login secure with a fresh password."
          icon={<LockResetIcon fontSize="small" />}
          sx={{ mt: 2 }}
        >
          {passwordError && (
            <Typography color="error" variant="body2" sx={{ mb: 1.5 }}>
              {passwordError}
            </Typography>
          )}
          <Grid container spacing={2}>
            {[
              { name: "current_password", label: "Current Password" },
              { name: "new_password", label: "New Password" },
              { name: "confirm_new_password", label: "Confirm New Password" },
            ].map((f) => (
              <Grid key={f.name} item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="password"
                  label={f.label}
                  name={f.name}
                  value={passwordData[f.name] ?? ""}
                  onChange={onPasswordField}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: theme.palette.background.default,
                    },
                  }}
                />
              </Grid>
            ))}

            <Grid item xs={12}>
              <Button
                onClick={handlePasswordSave}
                variant="contained"
                sx={{
                  textTransform: "none",
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  fontWeight: 700,
                  "&:hover": { bgcolor: theme.palette.primary.dark },
                }}
              >
                Update Password
              </Button>
            </Grid>
          </Grid>
        </SectionCard>
      )}
    </Box>
  );
};

export default ProfileComponent;
