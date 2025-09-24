// src/components/prospect/ProspectSidebar.jsx
import React, { useState } from "react";
import dayjs from "dayjs";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  TextField,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  useTheme,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import OpportunityComponent from "./opportunity_components";
import AdressProspect from "./address_prospect_update";
import ContactPersonsProspect from "./contact_person_of_prospect";
import DetailsProspectInfo from "./details_info_component";

// colors should come from your theme tokens
import { tokens } from "../../../../theme";

const ProspectSidebar = ({
  onAdded,
  details,
  contactPersonList,
  employees,
  assignedPersons,
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
  const [text, setText] = useState(details.prospect_name);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);


  return (
    <Box sx={{ width: { xs: "100%", md: "25%" } }}>
      <Paper
        sx={{
          p: 3,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        {/* Title + Edit */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}>
          {isEditing ? (
            <>
              <TextField
                value={text}
                onChange={(e) => setText(e.target.value)}
                variant="standard"
                size="small"
                sx={{
                  minWidth: 200,
                  "& input": {
                    fontSize: "1rem",
                    color: colors.blueAccent[500],
                  },
                }}
              />
              <IconButton
                onClick={() => {
                  updateProspectInfo({ prospect_id: details.id, prospect_name: text });
                  setIsEditing(false);
                }}
                size="small"
                sx={{ ml: 0.5, color: colors.blueAccent[500] }}
              >
                <SaveIcon fontSize="small" />
              </IconButton>
            </>
          ) : (
            <>
              <Typography
                variant="h6"
                sx={{ color: colors.blueAccent[500], fontWeight: 500 }}
              >
                {details.prospect_name}
              </Typography>
              <IconButton
                size="small"
                onClick={() => {
                  setText(details.prospect_name);
                  setIsEditing(true);
                }}
                sx={{
                  ml: 0.5,
                  p: 0.5,
                  color: colors.gray[400],
                  "&:hover": { color: colors.gray[100] },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>

        {/* Opportunity */}
        <OpportunityComponent
          details={details}
          onToggleOpportunity={onToggleOpportunityController}
          onSubmitOpportunity={onSubmitOpportunity}
        />

        {/* Created info */}
        <Typography
          variant="caption"
          display="block"
          gutterBottom
          sx={{ color: colors.gray[400] }}
        >
          Created: Mehrun Nesa on{" "}
          {dayjs(details.created_at).format("MMMM D, YYYY")}
        </Typography>

        {/* Address */}
        <AdressProspect details={details} onAddressUpdate={updateProspectInfo} />

        {/* Map Button */}

        {details.is_individual === false && (
              <Button
          variant="outlined"
          onClick={goToMap}
          sx={{
            mt: 1,
            backgroundColor: theme.palette.background.paper,
            borderColor: colors.blueAccent[500],
            borderWidth: 2,
            borderRadius: 1,
            whiteSpace: "nowrap",
            color: colors.blueAccent[500],
            "&:hover": {
              backgroundColor: colors.blueAccent[900],
              borderColor: colors.blueAccent[700],
              color: colors.blueAccent[100],
            },
          }}
        >
          View Map
        </Button>
        )}
      

        <Divider sx={{ my: 2, backgroundColor: colors.gray[700] }} />

        {/* Contact Persons */}
        <ContactPersonsProspect contactPersonList={contactPersonList} prospectId={details.id} onAdded={onAdded}/>

        {/* Accordions */}
        {(details.is_opportunity === 0
          ? ["Assigned To", "Details", "Attached Files"]
          : ["Assigned To", "Details", "Attached Files", "Leads", "Quotations", "Orders"]
        ).map((label, i) => (
          <Accordion
            key={i}
            sx={{
              mt: 2,
              backgroundColor: theme.palette.background.paper,
              color: colors.gray[100],
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: colors.gray[100] }} />}
            >
              {label}
            </AccordionSummary>
            <AccordionDetails>
              {label === "Details" ? (
                <DetailsProspectInfo
                  details={details}
                  onAddressUpdate={updateProspectInfo}
                />
              ) : label === "Assigned To" ? (
                <Box>
                  {/* Assign To Selector */}
                  <Box sx={{ mb: 2 }}>
                    <FormControl fullWidth sx={{ flex: 1, minWidth: 250 }}>
                      <InputLabel id="assign-to-label" sx={{ color: colors.gray[400] }}>
                        Assign To
                      </InputLabel>
                      <Select
                        labelId="assign-to-label"
                        multiple
                        name="assign_to_ids"
                        value={concernPersons.assign_to_ids}
                        onChange={handleConcernsChange}
                        renderValue={(selected) =>
                          employees
                            .filter((e) => selected.includes(e.id))
                            .map((e) => e.name)
                            .join(", ")
                        }
                        sx={{ color: colors.gray[100] }}
                      >
                        {employees.map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            <Checkbox
                              checked={concernPersons.assign_to_ids.includes(option.id)}
                              sx={{ color: colors.greenAccent[500] }}
                            />
                            <ListItemText primary={option.name} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="contained"
                      onClick={addMultipleConernPersons}
                      sx={{
                        mt: 1,
                        backgroundColor: colors.greenAccent[500],
                        color: colors.gray[500],
                        "&:hover": { backgroundColor: colors.greenAccent[700] },
                      }}
                    >
                      Add
                    </Button>
                  </Box>

                  {/* Assigned persons list */}
                  <Box sx={{ maxHeight: 250, overflowY: "auto", mt: 1, pr: 1 }}>
                    {assignedPersons?.length > 0 ? (
                      assignedPersons.map((person) => (
                        <Box
                          key={person.id}
                          sx={{
                            mb: 1.5,
                            p: 1.5,
                            backgroundColor: colors.primary[700],
                            borderRadius: 2,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box>
                            <Typography
                              variant="body1"
                              fontWeight="bold"
                              sx={{ color: colors.gray[100] }}
                            >
                              {person.employee.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.gray[400] }}>
                              📱 {person.employee.phone}
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.blueAccent[300] }}>
                              ✉️ {person.employee.email}
                            </Typography>
                          </Box>
                          <IconButton
                            onClick={() => removeAssignedPerson(person.employee.id)}
                            sx={{ color: colors.redAccent[500] }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      ))
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ color: colors.gray[400], mt: 1 }}
                      >
                        No concerned persons assigned.
                      </Typography>
                    )}
                  </Box>
                </Box>
              ) : (
                <Box />
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
    </Box>
  );
};

export default ProspectSidebar;
