// src/components/prospect/ContactPersonsProspect.jsx
import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Stack,
  Snackbar,
  Alert,
  Divider,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

import { addContactPerson } from "../../../../api/controller/admin_controller/prospect_controller";

/**
 * Props:
 * - contactPersonList: Array of existing contacts
 * - prospectId: number (required for adding)
 * - designationList?: [{id, designation_name}]
 * - influenceList?: [{id, role_name}]
 * - onAdded?: function() -> called after successful add to refresh parent
 */
const ContactPersonsProspect = ({
  contactPersonList = [],
  prospectId,
  designationList = [],
  influenceList = [],
  onAdded,
}) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    person_name: "",
    designation_id: "",
    email: "",
    mobile: "",
    note: "",
    is_primary: false,
    is_key_contact: false,
    is_responsive: true,
    is_switched_job: false,
    attitude_id: "", // free text / number
    influencing_role_id: "",
    anniversary: "",
    birth_date: "",
  });

  const [toast, setToast] = useState({
    open: false,
    msg: "",
    sev: "success",
  });

  const closeToast = () => setToast((s) => ({ ...s, open: false }));

  const resetForm = () =>
    setForm({
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
    });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    if (!saving) setOpen(false);
  };

  const canSubmit = useMemo(() => {
    // minimally require a name or a mobile/email
    return (
      (form.person_name?.trim()?.length || 0) > 0 &&
      (form.mobile?.trim()?.length > 0 || form.email?.trim()?.length > 0)
    );
  }, [form]);

  const handleChange = (key) => (e) => {
    const val =
      e?.target?.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handleSubmit = async () => {
    if (!prospectId) {
      setToast({
        open: true,
        msg: "Missing prospect ID.",
        sev: "error",
      });
      return;
    }
    if (!canSubmit) {
      setToast({
        open: true,
        msg: "Please add at least a name and mobile or email.",
        sev: "warning",
      });
      return;
    }

    setSaving(true);
    try {
      // Match OrganizationForm payload
      const payload = {
        prospect_id: prospectId,
        contacts: [
          {
           
            person_name: form.person_name?.trim(),
            designation_id: form.designation_id || "1",
            mobile: form.mobile?.trim(),
            email: form.email?.trim(),
            note: form.note?.trim(),
            is_primary: Number(form.is_primary),
            is_responsive: Number(form.is_responsive),
            attitude_id: form.attitude_id || 0,
            is_key_contact: Number(form.is_key_contact),
            influencing_role_id: form.influencing_role_id || 0,
            is_switched_job: Number(form.is_switched_job),
            anniversary: form.anniversary || "",
            birth_date: form.birth_date || "",
          },
        ],
      };

      const res = await addContactPerson(payload);

      if (res?.status === "success") {
        setToast({
          open: true,
          msg: res?.message || "Contact added.",
          sev: "success",
        });
        resetForm();
        setOpen(false);
        onAdded?.(); // let parent refresh
      } else {
        setToast({
          open: true,
          msg: res?.message || "Failed to add contact.",
          sev: "error",
        });
      }
    } catch (err) {
      console.error(err);
      setToast({
        open: true,
        msg: "Failed to add contact.",
        sev: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
          Contact Persons
        </Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          variant="outlined"
          onClick={handleOpen}
        >
          Add Contact
        </Button>
      </Box>

      {contactPersonList && contactPersonList.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            mt: 1,
          }}
        >
          {contactPersonList.map((person, index) => (
            <Paper
              key={person.id ?? `${person.person_name}-${index}`}
              elevation={1}
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "background.paper",
                transition: "all 0.25s ease",
                "&:hover": { boxShadow: 3, transform: "translateY(-2px)" },
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  sx={{
                    bgcolor:
                      index % 2 === 0 ? "primary.light" : "secondary.light",
                    width: 40,
                    height: 40,
                  }}
                >
                  <PersonIcon />
                </Avatar>

                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    noWrap
                    title={person.person_name}
                  >
                    {person.person_name}
                  </Typography>

                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    mt={1}
                    flexWrap="wrap"
                    useFlexGap
                  >
                    {person.mobile && (
                      <Chip
                        icon={<PhoneIcon fontSize="small" />}
                        label={person.mobile}
                        variant="outlined"
                        size="small"
                        sx={{ borderColor: "text.secondary" }}
                      />
                    )}
                    {person.email && (
                      <Chip
                        icon={<EmailIcon fontSize="small" />}
                        label={person.email}
                        variant="outlined"
                        size="small"
                        color="primary"
                      />
                    )}
                    {person.designation?.designation_name && (
                      <Chip
                        label={person.designation.designation_name}
                        size="small"
                      />
                    )}
                    {person.is_primary ? (
                      <Chip label="Primary" color="success" size="small" />
                    ) : null}
                  </Stack>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      ) : (
        <Paper
          variant="outlined"
          sx={{ p: 2, borderRadius: 2, textAlign: "center", mt: 1 }}
        >
          <Typography variant="body2" color="text.secondary" mb={1}>
            No contact persons available.
          </Typography>
          <Button startIcon={<AddIcon />} variant="outlined" onClick={handleOpen}>
            Add New Contact
          </Button>
        </Paper>
      )}

      {/* Add Contact Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
          Add Contact
          <IconButton
            onClick={handleClose}
            sx={{ ml: "auto" }}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Name"
              value={form.person_name}
              onChange={handleChange("person_name")}
              autoFocus
              required
              fullWidth
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Mobile"
                value={form.mobile}
                onChange={handleChange("mobile")}
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Designation</InputLabel>
                <Select
                  label="Designation"
                  value={form.designation_id}
                  onChange={handleChange("designation_id")}
                >
                  {designationList.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.designation_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Influencing Role</InputLabel>
                <Select
                  label="Influencing Role"
                  value={form.influencing_role_id}
                  onChange={handleChange("influencing_role_id")}
                >
                  {influenceList.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.role_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <TextField
              label="Note"
              value={form.note}
              onChange={handleChange("note")}
              fullWidth
              multiline
              minRows={2}
            />

            <Divider />

            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.is_primary}
                    onChange={handleChange("is_primary")}
                  />
                }
                label="Primary"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.is_key_contact}
                    onChange={handleChange("is_key_contact")}
                  />
                }
                label="Key Contact"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.is_responsive}
                    onChange={handleChange("is_responsive")}
                  />
                }
                label="Responsive"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.is_switched_job}
                    onChange={handleChange("is_switched_job")}
                  />
                }
                label="Switched Job"
              />
            </FormGroup>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Birth Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.birth_date}
                onChange={handleChange("birth_date")}
                fullWidth
              />
              <TextField
                label="Anniversary"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.anniversary}
                onChange={handleChange("anniversary")}
                fullWidth
              />
            </Stack>

            <TextField
              label="Attitude ID (optional)"
              value={form.attitude_id}
              onChange={handleChange("attitude_id")}
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!canSubmit || saving}
          >
            {saving ? "Saving…" : "Save Contact"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={2600}
        onClose={closeToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={closeToast} severity={toast.sev} sx={{ width: "100%" }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactPersonsProspect;
