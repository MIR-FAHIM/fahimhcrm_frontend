// src/components/prospect/ProspectSidebar.jsx
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  ListItemText,
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
  AssignmentIndRounded,
  BusinessRounded,
  DeleteRounded,
  EditRounded,
  EmailRounded,
  FolderRounded,
  LocationOnRounded,
  MapRounded,
  PersonRounded,
  PhoneRounded,
  SaveRounded,
  StarRounded,
} from "@mui/icons-material";

import AdressProspect from "./address_prospect_update";
import ContactPersonsProspect from "./contact_person_of_prospect";
import DetailsProspectInfo from "./details_info_component";
import OpportunityComponent from "./opportunity_components";

const isTrue = (value) => value === true || value === 1 || value === "1";

const SectionCard = ({ icon, title, subtitle, children }) => {
  const theme = useTheme();

  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}>
        <Avatar variant="rounded" sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.12), color: theme.palette.primary.main }}>
          {icon}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ color: theme.palette.text.primary, fontWeight: 900 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
      {children}
    </Box>
  );
};

const ProspectSidebar = ({
  onAdded,
  details = {},
  contactPersonList = [],
  employees = [],
  assignedPersons = [],
  concernPersons,
  updateProspectInfo,
  onToggleOpportunityController,
  onSubmitOpportunity,
  goToMap,
  handleConcernsChange,
  addMultipleConernPersons,
  removeAssignedPerson,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(details.prospect_name || "");
  const theme = useTheme();
  const isIndividual = isTrue(details.is_individual);
  const canShowMap = !isIndividual && details.latitude != null && details.longitude != null;

  useEffect(() => {
    setText(details.prospect_name || "");
    setIsEditing(false);
  }, [details.id, details.prospect_name]);

  const assignedIds = assignedPersons.map((person) => person.employee?.id).filter(Boolean);
  const selectedAssignees = concernPersons?.assign_to_ids || [];

  return (
    <Stack spacing={2.5} sx={{ minWidth: 0, position: { lg: "sticky" }, top: { lg: 24 } }}>
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Avatar
              variant="rounded"
              sx={{
                width: 54,
                height: 54,
                bgcolor: alpha(theme.palette.primary.main, 0.14),
                color: theme.palette.primary.main,
              }}
            >
              {isIndividual ? <PersonRounded /> : <BusinessRounded />}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {isEditing ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField size="small" value={text} onChange={(event) => setText(event.target.value)} fullWidth autoFocus />
                  <Tooltip title="Save name">
                    <IconButton
                      color="primary"
                      onClick={() => {
                        updateProspectInfo({ prospect_id: details.id, prospect_name: text.trim() });
                        setIsEditing(false);
                      }}
                    >
                      <SaveRounded />
                    </IconButton>
                  </Tooltip>
                </Stack>
              ) : (
                <Stack direction="row" alignItems="flex-start" spacing={1}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 900, lineHeight: 1.15 }}>
                      {details.prospect_name || "Untitled prospect"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      Created {details.created_at ? dayjs(details.created_at).format("MMM D, YYYY") : "-"}
                    </Typography>
                  </Box>
                  <Tooltip title="Edit prospect name">
                    <IconButton size="small" onClick={() => setIsEditing(true)}>
                      <EditRounded fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )}
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={isIndividual ? "Individual" : "Organization"} icon={isIndividual ? <PersonRounded /> : <BusinessRounded />} sx={{ fontWeight: 800 }} />
            {isTrue(details.is_opportunity) && <Chip color="success" icon={<StarRounded />} label="Opportunity" sx={{ fontWeight: 800 }} />}
          </Stack>

          <OpportunityComponent details={details} onToggleOpportunity={onToggleOpportunityController} onSubmitOpportunity={onSubmitOpportunity} />
        </Stack>

        <Divider sx={{ my: 2 }} />

        <SectionCard icon={<LocationOnRounded fontSize="small" />} title="Location" subtitle="Address and map context">
          <AdressProspect details={details} onAddressUpdate={updateProspectInfo} />
          {canShowMap && (
            <Button fullWidth variant="outlined" startIcon={<MapRounded />} onClick={goToMap} sx={{ mt: 1.25, borderRadius: 2, fontWeight: 900 }}>
              View Map
            </Button>
          )}
        </SectionCard>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <ContactPersonsProspect contactPersonList={contactPersonList} prospectId={details.id} onAdded={onAdded} />
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <SectionCard icon={<AssignmentIndRounded fontSize="small" />} title="Assigned Team" subtitle="People responsible for this prospect">
          <FormControl fullWidth size="small" sx={{ mb: 1.25 }}>
            <InputLabel id="assign-to-label">Assign To</InputLabel>
            <Select
              labelId="assign-to-label"
              multiple
              name="assign_to_ids"
              value={selectedAssignees}
              label="Assign To"
              onChange={handleConcernsChange}
              renderValue={(selected) =>
                employees
                  .filter((employee) => selected.includes(employee.id))
                  .map((employee) => employee.name)
                  .join(", ")
              }
            >
              {employees.map((option) => {
                const alreadyAssigned = assignedIds.includes(option.id);
                return (
                  <MenuItem key={option.id} value={option.id} disabled={alreadyAssigned}>
                    <Checkbox checked={selectedAssignees.includes(option.id)} />
                    <ListItemText primary={option.name} secondary={alreadyAssigned ? "Already assigned" : option.email} />
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <Button fullWidth variant="contained" onClick={addMultipleConernPersons} sx={{ borderRadius: 2, fontWeight: 900 }}>
            Add Assigned Person
          </Button>

          <Stack spacing={1.25} sx={{ mt: 2 }}>
            {assignedPersons.length ? (
              assignedPersons.map((person) => (
                <Paper
                  key={person.id}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: theme.palette.background.default,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.14), color: theme.palette.primary.main }}>
                      {person.employee?.name?.charAt(0) || "U"}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" noWrap sx={{ color: theme.palette.text.primary, fontWeight: 900 }}>
                        {person.employee?.name || "Unknown employee"}
                      </Typography>
                      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                        {person.employee?.phone && <Chip size="small" icon={<PhoneRounded />} label={person.employee.phone} />}
                        {person.employee?.email && <Chip size="small" icon={<EmailRounded />} label={person.employee.email} variant="outlined" />}
                      </Stack>
                    </Box>
                    <Tooltip title="Remove assigned person">
                      <IconButton color="error" size="small" onClick={() => removeAssignedPerson(person.employee.id)}>
                        <DeleteRounded fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                No concerned persons assigned.
              </Typography>
            )}
          </Stack>
        </SectionCard>
      </Paper>

      <DetailsProspectInfo details={details} onAddressUpdate={updateProspectInfo} />

      {isTrue(details.is_opportunity) && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <SectionCard icon={<FolderRounded fontSize="small" />} title="Opportunity Modules" subtitle="Related business records">
            <Stack spacing={1}>
              {[
                "Attached Files",
                "Leads",
                "Quotations",
                "Orders",
              ].map((label) => (
                <Button key={label} variant="outlined" disabled sx={{ justifyContent: "flex-start", borderRadius: 2 }}>
                  {label}
                </Button>
              ))}
            </Stack>
          </SectionCard>
        </Paper>
      )}
    </Stack>
  );
};

export default ProspectSidebar;