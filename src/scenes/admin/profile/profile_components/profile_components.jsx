import { useState, useEffect, useMemo, useRef } from "react";
import {
  Avatar,
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  IconButton,
  Paper,
  Stack,
  Chip,
  Divider,
  useTheme,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Logout as LogoutIcon,
  Upload as UploadIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { image_file_url } from "../../../../api/config";

const SectionCard = ({ title, action, children, sx }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        ...sx,
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Typography variant="subtitle1" fontWeight={700} color={theme.palette.text.primary}>
          {title}
        </Typography>
        {action}
      </Box>
      <Divider sx={{ mb: 2 }} />
      {children}
    </Paper>
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
  handleLogout,
  handleUpdateData,
}) => {
  const theme = useTheme();

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

    setEditData({
      user_id: profileData.id || "",
      name: profileData.name || "",
      email: profileData.email || "",
      phone: profileData.phone || "",
      address: profileData.address || "",
      birthdate: profileData.birthdate || "",
      bio: profileData.bio || "",
      start_hour: profileData.start_hour ?? "",
      start_min: profileData.start_min ?? "",
    });

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
    handleUpdateData(editData);
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

  const photoSrc = avatarError
    ? "https://picsum.photos/200/300"
    : `${image_file_url}/${profileData?.photo}`;

  const canUpload = isMyProfile;

  const officeTimeLabel = useMemo(() => {
    const hh = editData.start_hour?.toString().padStart(2, "0");
    const mm = editData.start_min?.toString().padStart(2, "0");
    if (!hh && !mm) return "Not set";
    return `${hh ?? "00"}:${mm ?? "00"}`;
  }, [editData.start_hour, editData.start_min]);

  return (
    <Box
      sx={{
        maxWidth: 980,
        mx: "auto",
        p: { xs: 2, md: 3 },
        bgcolor: theme.palette.background.default,
      }}
    >
      {/* Header Card */}
      <SectionCard
        title="Profile"
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
            <Box position="relative" width={112} height={112}>
              <Avatar
                src={photoSrc}
                alt={profileData?.name || "Profile"}
                onError={() => setAvatarError(true)}
                sx={{
                  width: 112,
                  height: 112,
                  border: `2px solid ${theme.palette.divider}`,
                  bgcolor: theme.palette.blueAccent.dark,
                  color: theme.palette.blueAccent.contrastText,
                }}
              />
              {canUpload && (
                <IconButton
                  size="small"
                  onClick={() => fileRef.current?.click()}
                  sx={{
                    position: "absolute",
                    right: -10,
                    bottom: -10,
                    bgcolor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    border: `1px solid ${theme.palette.divider}`,
                    "&:hover": { bgcolor: alpha(theme.palette.blueAccent.main, 0.12) },
                  }}
                >
                  <UploadIcon fontSize="small" />
                </IconButton>
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
            <Typography variant="h5" fontWeight={800} color={theme.palette.text.primary} mb={0.5}>
              {profileData?.name || "-"}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                size="small"
                label={profileData?.role?.role_name || "Role -"}
                sx={{
                  bgcolor: alpha(theme.palette.text.primary, 0.06),
                  color: theme.palette.text.primary,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              />
              <Chip
                size="small"
                label={profileData?.department?.department_name || "Department -"}
                sx={{
                  bgcolor: alpha(theme.palette.text.primary, 0.06),
                  color: theme.palette.text.primary,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              />
              <Chip
                size="small"
                label={profileData?.designation?.designation_name || "Designation -"}
                sx={{
                  bgcolor: alpha(theme.palette.text.primary, 0.06),
                  color: theme.palette.text.primary,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              />
            </Stack>

            {canUpload && (
              <Box mt={1.5}>
                <Button
                  onClick={handleUpload}
                  variant="contained"
                  startIcon={<UploadIcon />}
                  sx={{
                    textTransform: "none",
                    bgcolor: theme.palette.blueAccent.main,
                    color: theme.palette.blueAccent.contrastText,
                    "&:hover": { bgcolor: theme.palette.blueAccent.dark },
                  }}
                >
                  Upload New Photo
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </SectionCard>

      {/* General Info + Office Time */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <SectionCard
            title="General Information"
            action={
              isMyProfile && (
                <Button
                  variant={isEditing ? "contained" : "outlined"}
                  onClick={() => setIsEditing((v) => !v)}
                  startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                  sx={{
                    textTransform: "none",
                    ...(isEditing
                      ? {
                          bgcolor: theme.palette.blueAccent.main,
                          color: theme.palette.blueAccent.contrastText,
                          "&:hover": { bgcolor: theme.palette.blueAccent.dark },
                        }
                      : {}),
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {isEditing ? "Save" : "Edit"}
                </Button>
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
                  <Button
                    onClick={handleSave}
                    variant="contained"
                    startIcon={<SaveIcon />}
                    sx={{
                      textTransform: "none",
                      bgcolor: theme.palette.blueAccent.main,
                      color: theme.palette.blueAccent.contrastText,
                      "&:hover": { bgcolor: theme.palette.blueAccent.dark },
                    }}
                  >
                    Save Changes
                  </Button>
                </Grid>
              )}
            </Grid>
          </SectionCard>
        </Grid>

        <Grid item xs={12} md={5}>
          <SectionCard title="Office Entry Time">
            <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
              <AccessTimeIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
              <Typography sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                Current: {officeTimeLabel}
              </Typography>
            </Stack>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Hour (0–23)"
                  name="start_hour"
                  size="small"
                  value={editData.start_hour ?? ""}
                  onChange={onEditField}
                  disabled={!isEditable}
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  sx={{ "& .MuiOutlinedInput-root": { bgcolor: theme.palette.background.default } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Minute (0–59)"
                  name="start_min"
                  size="small"
                  value={editData.start_min ?? ""}
                  onChange={onEditField}
                  disabled={!isEditable}
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  sx={{ "& .MuiOutlinedInput-root": { bgcolor: theme.palette.background.default } }}
                />
              </Grid>
              {isEditable && (
                <Grid item xs={12}>
                  <Button
                    onClick={handleSave}
                    variant="contained"
                    startIcon={<SaveIcon />}
                    sx={{
                      textTransform: "none",
                      bgcolor: theme.palette.blueAccent.main,
                      color: theme.palette.blueAccent.contrastText,
                      "&:hover": { bgcolor: theme.palette.blueAccent.dark },
                    }}
                  >
                    Save Entry Time
                  </Button>
                </Grid>
              )}
            </Grid>
          </SectionCard>
        </Grid>
      </Grid>

      {/* Password */}
      {isMyProfile && (
        <SectionCard title="Change Password" sx={{ mt: 2 }}>
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
                  bgcolor: theme.palette.primary.light,
                  color: theme.palette.getContrastText(theme.palette.primary.light),
                  "&:hover": { bgcolor: theme.palette.primary.main },
                }}
              >
                Update Password
              </Button>
            </Grid>
          </Grid>
        </SectionCard>
      )}

      {/* Bottom Actions */}
      {isMyProfile && (
        <Box display="flex" gap={1.5} flexWrap="wrap" mt={2}>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{
              textTransform: "none",
              bgcolor: theme.palette.blueAccent.main,
              color: theme.palette.blueAccent.contrastText,
              "&:hover": { bgcolor: theme.palette.blueAccent.dark },
            }}
          >
            Save Changes
          </Button>
          <Button
            onClick={handleLogout}
            variant="outlined"
            color="warning"
            startIcon={<LogoutIcon />}
            sx={{ textTransform: "none" }}
          >
            Log Out
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ProfileComponent;
