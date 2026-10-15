import { useEffect, useState } from "react";
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, FormControlLabel, Grid, MenuItem, Stack, Switch, TextField, Typography,
} from "@mui/material";
import { EditOutlined, SaveOutlined } from "@mui/icons-material";
import {
  ATTENDANCE_FIELDS, EMPLOYMENT_FIELDS, PERSONAL_FIELDS, PREFERENCE_FIELDS,
  asBoolean, buildProfileChanges, buildProfileForm,
} from "../profile_edit_utils";
import { getAttendanceMethodLabel, summarizeAttendanceMethod } from "../../setting/attendance_method_utils";

const ProfileEditor = ({
  profile, canEditProfile, canManageProfile, isSuperAdmin, options,
  attendanceMethods, optionsLoading, optionsError, onRetryOptions, onSave, onStatusSave,
}) => {
  const [values, setValues] = useState(() => buildProfileForm(profile));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    // Background refreshes must not replace an unsaved draft.
    if (!editing) setValues(buildProfileForm(profile));
  }, [profile, editing]);

  const fields = [
    ...(canEditProfile ? [...PERSONAL_FIELDS, ...PREFERENCE_FIELDS] : []),
    ...(canManageProfile ? ATTENDANCE_FIELDS : []),
    ...(isSuperAdmin ? EMPLOYMENT_FIELDS : []),
  ];
  const change = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };
  const cancel = () => {
    setValues(buildProfileForm(profile));
    setErrors({});
    setSaveError("");
    setEditing(false);
  };
  const save = async (event) => {
    event.preventDefault();
    if (!canEditProfile || saving || statusSaving) return;
    const result = buildProfileChanges(profile, values, fields);
    setErrors(result.errors);
    setSaveError("");
    if (Object.keys(result.errors).length) return;
    if (Object.keys(result.payload).length === 1) { setEditing(false); return; }
    setSaving(true);
    try {
      await onSave(result.payload);
      setEditing(false);
    } catch (error) {
      setSaveError(error.message || "Failed to save employee information.");
      const serverErrors = error.response?.data?.errors ?? {};
      const errorFields = { start_hour: "office_start_time", start_min: "office_start_time", end_hour: "office_end_time", end_min: "office_end_time" };
      setErrors(Object.fromEntries(Object.entries(serverErrors).map(([key, messages]) => [errorFields[key] || key, Array.isArray(messages) ? messages.join(" ") : String(messages)])));
    } finally {
      setSaving(false);
    }
  };
  const changeStatus = async (active) => {
    if (!canManageProfile || statusSaving || saving) return;
    setStatusSaving(true);
    setSaveError("");
    try {
      await onStatusSave({ user_id: Number(profile.id), isActive: active });
      setConfirmDeactivate(false);
    } catch (error) {
      setSaveError(error.message || "Failed to update employee status.");
    } finally {
      setStatusSaving(false);
    }
  };

  const disabled = !editing || saving || statusSaving;
  const selectedMethod = attendanceMethods.find((method) => String(method.id) === values.attendance_method_id)
    ?? (String(profile.attendance_method?.id) === values.attendance_method_id ? profile.attendance_method : null);
  const input = (name, label, extra = {}) => (
    <TextField fullWidth size="small" name={name} label={label} value={values[name]}
      onChange={(event) => change(name, event.target.value)} disabled={disabled}
      error={Boolean(errors[name])} helperText={errors[name]} {...extra} />
  );
  const select = (name, label, list, labelKey, current, allowClear = false) => {
    const available = Array.isArray(list) ? [...list] : [];
    if (values[name] && !available.some((option) => String(option.id) === values[name])) {
      available.push({ id: values[name], [labelKey]: current?.[labelKey] || `Assigned #${values[name]}` });
    }
    return (
      <TextField select fullWidth size="small" label={label} value={values[name]}
        disabled={disabled || optionsLoading || Boolean(optionsError)}
        onChange={(event) => change(name, event.target.value)}
        error={Boolean(errors[name])} helperText={errors[name] || (optionsLoading ? "Loading options..." : undefined)}>
        <MenuItem value="" disabled={!allowClear}>{allowClear ? "Use global attendance method" : `Select ${label.toLowerCase()}`}</MenuItem>
        {available.map((option) => <MenuItem key={option.id} value={String(option.id)}>
          {name === "attendance_method_id" ? `${getAttendanceMethodLabel(option.method)} (#${option.id})` : option[labelKey]}
        </MenuItem>)}
      </TextField>
    );
  };

  return (
    <Box component="form" onSubmit={save} sx={{ mt: 2, p: { xs: 2, md: 2.5 }, bgcolor: "background.paper", border: 1, borderColor: "divider", borderRadius: 2 }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }} justifyContent="space-between" mb={2}>
        <Typography variant="subtitle1" fontWeight={700}>Employee Information</Typography>
        {canEditProfile && <Stack direction="row" spacing={1}>
          {editing ? <>
            <Button type="button" variant="outlined" disabled={saving || statusSaving} onClick={cancel}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving || statusSaving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveOutlined />}>Save Changes</Button>
          </> : <Button type="button" variant="outlined" disabled={statusSaving} onClick={() => setEditing(true)} startIcon={<EditOutlined />}>Edit Profile</Button>}
        </Stack>}
      </Stack>
      {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
      {optionsError && <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={onRetryOptions} disabled={optionsLoading}>Retry</Button>}>{optionsError}</Alert>}

      <Typography variant="subtitle2" mb={2}>Personal</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>{input("name", "Name")}</Grid>
        <Grid item xs={12} sm={6}>{input("email", "Email", { type: "email" })}</Grid>
        <Grid item xs={12} sm={6}>{input("phone", "Phone", { type: "tel" })}</Grid>
        <Grid item xs={12} sm={6}>{input("birthdate", "Birthdate", { type: "date", InputLabelProps: { shrink: true } })}</Grid>
        <Grid item xs={12}>{input("address", "Address", { multiline: true, minRows: 2 })}</Grid>
        <Grid item xs={12}>{input("bio", "Bio", { multiline: true, minRows: 3 })}</Grid>
      </Grid>

      {isSuperAdmin && <>
        <Divider sx={{ my: 2.5 }} /><Typography variant="subtitle2" mb={2}>Employment</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>{select("role_id", "Role", options.roles, "role_name", profile.role)}</Grid>
          <Grid item xs={12} md={4}>{select("department_id", "Department", options.departments, "department_name", profile.department)}</Grid>
          <Grid item xs={12} md={4}>{select("designation_id", "Designation", options.designations, "designation_name", profile.designation)}</Grid>
        </Grid>
      </>}

      <Divider sx={{ my: 2.5 }} /><Typography variant="subtitle2" mb={2}>Attendance</Typography>
      <Grid container spacing={2}>
        {canManageProfile && <Grid item xs={12}>{select("attendance_method_id", "Attendance Method", attendanceMethods, "method", profile.attendance_method, true)}
          <Typography variant="body2" color="text.secondary" mt={1}>{selectedMethod ? summarizeAttendanceMethod(selectedMethod) : "Uses the active global method; no restriction applies when no global method is active."}</Typography>
        </Grid>}
        <Grid item xs={12} sm={6}>{input("office_start_time", "Office Start Time", { type: "time", disabled: disabled || !canManageProfile, InputLabelProps: { shrink: true }, inputProps: { step: 60 } })}</Grid>
        <Grid item xs={12} sm={6}>{input("office_end_time", "Office End Time", { type: "time", disabled: disabled || !canManageProfile, InputLabelProps: { shrink: true }, inputProps: { step: 60 } })}</Grid>
      </Grid>

      {canEditProfile && <>
        <Divider sx={{ my: 2.5 }} /><Typography variant="subtitle2" mb={1}>Preferences</Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <FormControlLabel control={<Switch checked={values.is_dark_mode} disabled={disabled} onChange={(event) => change("is_dark_mode", event.target.checked)} />} label="Dark mode" />
          <FormControlLabel control={<Switch checked={values.is_prospect_table_view} disabled={disabled} onChange={(event) => change("is_prospect_table_view", event.target.checked)} />} label="Prospect table view" />
        </Stack>
      </>}

      <Divider sx={{ my: 2.5 }} />
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
        <Typography variant="subtitle2">Status</Typography>
        <Chip size="small" color={asBoolean(profile.isActive) ? "success" : "default"} label={asBoolean(profile.isActive) ? "Active" : "Inactive"} />
        {canManageProfile && <FormControlLabel label={statusSaving ? "Saving..." : "Active"}
          control={<Switch checked={asBoolean(profile.isActive)} disabled={saving || statusSaving}
            onChange={(event) => {
              if (event.target.checked) changeStatus(true);
              else { setSaveError(""); setConfirmDeactivate(true); }
            }} />} />}
      </Stack>
      <Dialog open={confirmDeactivate} onClose={() => !statusSaving && setConfirmDeactivate(false)} fullWidth maxWidth="xs">
        <DialogTitle>Deactivate employee?</DialogTitle>
        <DialogContent>
          {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
          <Typography>Mark {profile.name} as inactive? This changes their employee status.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeactivate(false)} disabled={statusSaving}>Cancel</Button>
          <Button color="warning" variant="contained" onClick={() => changeStatus(false)} disabled={statusSaving}
            startIcon={statusSaving ? <CircularProgress size={16} color="inherit" /> : undefined}>Deactivate</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileEditor;
