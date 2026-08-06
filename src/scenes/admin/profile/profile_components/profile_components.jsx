import { useState, useEffect, useMemo, useRef } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  TextField,
  Typography,
  IconButton,
  Paper,
  Select,
  MenuItem,
  Stack,
  Chip,
  Divider,
  useTheme,
  Tooltip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Logout as LogoutIcon,
  Upload as UploadIcon,
  AccessTime as AccessTimeIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Apartment as ApartmentIcon,
  Badge as BadgeIcon,
  Cake as CakeIcon,
  Email as EmailIcon,
  LockReset as LockResetIcon,
  Phone as PhoneIcon,
  WorkOutline as WorkOutlineIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { image_file_url } from "../../../../api/config";

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
            <Typography variant="subtitle1" fontWeight={900} color={theme.palette.text.primary}>
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
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 800 }}>
          {label}
        </Typography>
      </Stack>
      <Typography
        variant="body2"
        noWrap
        title={value || "-"}
        sx={{ color: theme.palette.text.primary, fontWeight: 900, mt: 0.75 }}
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

const hasTimeValue = (value) => value !== null && value !== undefined && value !== "";

const normalizeTimePart = (value, max) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(Math.max(Math.trunc(number), 0), max);
};

const buildTimeValue = (hour, minute) => {
  if (!hasTimeValue(hour) && !hasTimeValue(minute)) return "";
  return `${String(normalizeTimePart(hour, 23)).padStart(2, "0")}:${String(
    normalizeTimePart(minute, 59)
  ).padStart(2, "0")}`;
};

const splitTimeValue = (timeValue) => {
  if (!timeValue) return { hour: null, minute: null };
  const [hour = "0", minute = "0"] = String(timeValue).split(":");
  return {
    hour: normalizeTimePart(hour, 23),
    minute: normalizeTimePart(minute, 59),
  };
};

const buildEditableProfileState = (profileData = {}) => ({
  user_id: profileData.id || "",
  name: profileData.name || "",
  email: profileData.email || "",
  phone: profileData.phone || "",
  address: profileData.address || "",
  birthdate: profileData.birthdate || "",
  bio: profileData.bio || "",
  start_hour: profileData.start_hour ?? "",
  start_min: profileData.start_min ?? "",
  end_hour: profileData.end_hour ?? "",
  end_min: profileData.end_min ?? "",
  office_start_time: buildTimeValue(profileData.start_hour, profileData.start_min),
  office_end_time: buildTimeValue(profileData.end_hour, profileData.end_min),
});

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
  assignmentValues = { role_id: "", department_id: "", designation_id: "" },
  assignmentLoading = false,
  assignmentSaving = { role: false, department: false, designation: false },
  onAssignmentChange = () => {},
  onAssignmentSave = () => {},
}) => {
  const theme = useTheme();
  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;
  const brandDark = theme.palette.blueAccent?.dark ?? theme.palette.primary.dark;
  const brandContrast = theme.palette.blueAccent?.contrastText ?? theme.palette.primary.contrastText;

  const [editData, setEditData] = useState({});
  const [passwordData, setPasswordData] = useState({});
  const [avatarError, setAvatarError] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isEditable, setIsEditable] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fileRef = useRef(null);
  const isMyProfile = parseInt(userID, 10) === profileData?.id;

  useEffect(() => {
    if (!profileData) return;
    const roleId = profileData?.role?.id;
    setIsEditable(roleId === 1 || roleId === 2);

    setEditData(buildEditableProfileState(profileData));

    setPasswordData({
      user_id: profileData.id || "",
      current_password: "",
      new_password: "",
      confirm_new_password: "",
    });
  }, [profileData]);

  const onEditField = (e) => {
    const { name, value } = e.target;
    setEditData((p) => ({ ...p, [name]: value }));
  };

  const onPasswordField = (e) => {
    const { name, value } = e.target;
    setPasswordData((p) => ({ ...p, [name]: value }));
  };

  const handleSave = () => {
    const { office_start_time, office_end_time, ...profilePayload } = editData;
    const startTime = splitTimeValue(office_start_time);
    const endTime = splitTimeValue(office_end_time);

    handleUpdateData({
      ...profilePayload,
      start_hour: startTime.hour,
      start_min: startTime.minute,
      end_hour: endTime.hour,
      end_min: endTime.minute,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditData(buildEditableProfileState(profileData));
    setIsEditing(false);
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

  const placeholderAvatar = "https://placehold.co/240x240/3A86FF/FFFFFF?text=BT";
  const photoSrc = avatarError
    ? placeholderAvatar
    : imageUrl || (profileData?.photo ? `${image_file_url}/${profileData.photo}` : placeholderAvatar);

  const canUpload = isMyProfile;
  const canEditWorkingHours = isMyProfile || canManageProfile || isEditable || isSuperAdmin;
  const assignmentRows = [
    {
      key: "role",
      field: "role_id",
      label: "Role",
      valueKey: "id",
      labelKey: "role_name",
      options: assignmentOptions.roles || [],
      saving: assignmentSaving.role,
    },
    {
      key: "department",
      field: "department_id",
      label: "Department",
      valueKey: "id",
      labelKey: "department_name",
      options: assignmentOptions.departments || [],
      saving: assignmentSaving.department,
    },
    {
      key: "designation",
      field: "designation_id",
      label: "Designation",
      valueKey: "id",
      labelKey: "designation_name",
      options: assignmentOptions.designations || [],
      saving: assignmentSaving.designation,
    },
  ];

  const officeTimeLabel = useMemo(() => {
    if (!editData.office_start_time && !editData.office_end_time) return "Not set";
    return `${editData.office_start_time || "Not set"} - ${editData.office_end_time || "Not set"}`;
  }, [editData.office_start_time, editData.office_end_time]);

  const profileHighlights = [
    { label: "Email", value: profileData?.email, icon: <EmailIcon /> },
    { label: "Phone", value: profileData?.phone, icon: <PhoneIcon /> },
    { label: "Birthdate", value: profileData?.birthdate ? profileData.birthdate.split("T")[0] : "-", icon: <CakeIcon /> },
    { label: "Office Time", value: officeTimeLabel, icon: <AccessTimeIcon /> },
  ];

  const getSelectedOptionLabel = (row) => {
    const selected = row.options.find(
      (option) => String(option[row.valueKey]) === String(assignmentValues[row.field])
    );
    return selected?.[row.labelKey] || "Not selected";
  };

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
                  fontWeight: 900,
                }}
              >
                {getInitials(profileData?.name)}
              </Avatar>
              {canUpload && (
                <Tooltip title="Choose profile photo">
                  <IconButton
                    size="small"
                    onClick={() => fileRef.current?.click()}
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
              />
            </Box>
          </Grid>

          <Grid item xs={12} md>
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 950, lineHeight: 1.1 }}>
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
                  fontWeight: 800,
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
                variant="contained"
                startIcon={<UploadIcon />}
                sx={{
                  textTransform: "none",
                  bgcolor: brand,
                  color: brandContrast,
                  fontWeight: 900,
                  whiteSpace: "nowrap",
                  "&:hover": { bgcolor: brandDark },
                }}
              >
                Upload Photo
              </Button>
            </Grid>
          )}
        </Grid>
      </SectionCard>


      {isSuperAdmin && (
        <SectionCard
          title="Super Admin Controls"
          subtitle="Change this employee's role, department, or designation. Each field saves independently."
          icon={<AdminPanelSettingsIcon fontSize="small" />}
          sx={{ mb: 2 }}
        >
          <Grid container spacing={2}>
            {assignmentRows.map((row) => (
              <Grid key={row.key} item xs={12} md={4}>
                <Box
                  sx={{
                    height: "100%",
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.text.primary, 0.035),
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Stack spacing={1.25}>
                    <Box>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 800 }}>
                        {row.label}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 900 }}>
                        {getSelectedOptionLabel(row)}
                      </Typography>
                    </Box>
                  <FormControl fullWidth size="small" disabled={!isSuperAdmin || assignmentLoading || row.saving}>
                    <Select
                      displayEmpty
                      value={assignmentValues[row.field] || ""}
                      onChange={(event) => onAssignmentChange(row.field, event.target.value)}
                      sx={{
                        bgcolor: theme.palette.background.paper,
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: alpha(brand, 0.20),
                        },
                      }}
                    >
                      <MenuItem value="" disabled>
                        Select {row.label}
                      </MenuItem>
                      {row.options.map((option) => (
                        <MenuItem key={option[row.valueKey]} value={String(option[row.valueKey])}>
                          {option[row.labelKey] || `#${option[row.valueKey]}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => onAssignmentSave(row.key)}
                    disabled={!isSuperAdmin || assignmentLoading || row.saving || !assignmentValues[row.field]}
                    startIcon={row.saving ? <CircularProgress size={15} color="inherit" /> : <SaveIcon />}
                    sx={{
                      textTransform: "none",
                      fontWeight: 900,
                      bgcolor: brand,
                      color: brandContrast,
                      "&:hover": { bgcolor: brandDark },
                    }}
                  >
                    Save {row.label}
                  </Button>
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>
        </SectionCard>
      )}
      {/* General Info + Office Time */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <SectionCard
            title="General Information"
            subtitle="Personal and contact details used across the HRM workspace."
            icon={<BadgeIcon fontSize="small" />}
            action={
              isMyProfile && (
                <Stack direction="row" spacing={1}>
                  {isEditing && (
                    <Button
                      variant="outlined"
                      onClick={handleCancelEdit}
                      sx={{ textTransform: "none" }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    variant={isEditing ? "contained" : "outlined"}
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                    startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                    sx={{
                      textTransform: "none",
                      fontWeight: 900,
                      ...(isEditing
                        ? {
                            bgcolor: brand,
                            color: brandContrast,
                            "&:hover": { bgcolor: brandDark },
                          }
                        : {}),
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {isEditing ? "Save" : "Edit Profile"}
                  </Button>
                </Stack>
              )
            }
          >
            <Grid container spacing={2}>
              {[
                { name: "name", label: "Name" },
                { name: "email", label: "Email", disabled: !isEditable },
                { name: "phone", label: "Phone" },
                { name: "address", label: "Address" },
              ].map((f) => (
                <Grid key={f.name} item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={f.label}
                    name={f.name}
                    value={editData[f.name] ?? ""}
                    onChange={onEditField}
                    size="small"
                    disabled={!isEditing || f.disabled}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: theme.palette.background.default,
                      },
                    }}
                  />
                </Grid>
              ))}

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Birthdate"
                  name="birthdate"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={editData.birthdate ? editData.birthdate.split("T")[0] : ""}
                  onChange={onEditField}
                  size="small"
                  disabled={!isEditing}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: theme.palette.background.default,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  name="bio"
                  multiline
                  minRows={3}
                  value={editData.bio ?? ""}
                  onChange={onEditField}
                  size="small"
                  disabled={!isEditing}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: theme.palette.background.default,
                    },
                  }}
                />
              </Grid>

              {isMyProfile && isEditing && (
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Review your changes, then use Save at the top of this section.
                  </Typography>
                </Grid>
              )}
            </Grid>
          </SectionCard>
        </Grid>

        <Grid item xs={12} md={5}>
          <SectionCard
            title="Working Hours"
            subtitle="Office timing used for attendance and early leave checks."
            icon={<AccessTimeIcon fontSize="small" />}
          >
            <Box
              sx={{
                p: 1.5,
                mb: 1.5,
                borderRadius: 1.5,
                bgcolor: alpha(brand, 0.08),
                border: `1px solid ${alpha(brand, 0.18)}`,
              }}
            >
              <Stack direction="row" spacing={1.25} alignItems="center">
                <AccessTimeIcon fontSize="small" sx={{ color: brand }} />
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 800 }}>
                    Current Schedule
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: theme.palette.text.primary, fontWeight: 950, lineHeight: 1.1 }}>
                    {officeTimeLabel}
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Office Start Time"
                  name="office_start_time"
                  type="time"
                  size="small"
                  value={editData.office_start_time ?? ""}
                  onChange={onEditField}
                  disabled={!canEditWorkingHours}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  sx={{ "& .MuiOutlinedInput-root": { bgcolor: theme.palette.background.default } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Office End Time"
                  name="office_end_time"
                  type="time"
                  size="small"
                  value={editData.office_end_time ?? ""}
                  onChange={onEditField}
                  disabled={!canEditWorkingHours}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  sx={{ "& .MuiOutlinedInput-root": { bgcolor: theme.palette.background.default } }}
                />
              </Grid>
              {canEditWorkingHours && (
                <Grid item xs={12}>
                  <Button
                    onClick={handleSave}
                    variant="contained"
                    startIcon={<SaveIcon />}
                    sx={{
                      textTransform: "none",
                      bgcolor: brand,
                      color: brandContrast,
                      fontWeight: 900,
                      "&:hover": { bgcolor: brandDark },
                    }}
                  >
                    Save Working Hours
                  </Button>
                </Grid>
              )}
              {!canEditWorkingHours && (
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Working hours are view-only for this profile.
                  </Typography>
                </Grid>
              )}
            </Grid>
          </SectionCard>
        </Grid>
      </Grid>

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
                  fontWeight: 900,
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
