// src/scenes/task/components_task/employee_selector.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box, TextField, Autocomplete, Typography, Avatar, IconButton, Button, Chip, Stack, Tooltip
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import { tokens } from "../../../../theme";
import { fetchEmployees } from "../../../../api/controller/admin_controller/user_controller";
import { image_file_url } from "../../../../api/config/index";
import { useTheme } from "@mui/material/styles";

const EmployeeSelector = ({
  handleAssignData,
  handleUnassignData,
  handleAddNotification,
  taskID,
  assignedPersons = [],
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const userID = localStorage.getItem("userId");

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchEmployees();
        setEmployees(res?.data ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const assignedIds = useMemo(
    () => new Set(assignedPersons.map((p) => p.assigned_person.id)),
    [assignedPersons]
  );
  const available = useMemo(
    () => employees.filter((e) => !assignedIds.has(e.id)),
    [employees, assignedIds]
  );

  const handleAssign = (emp) => {
    if (!emp) return;
    handleAssignData({
      task_id: taskID,
      assigned_person: emp.id,
      assigned_by: userID,
      is_main: 1,
    });
    setSelected(null);
  };

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
        Assigned to
      </Typography>

      {/* Assigned list (compact) */}
      {assignedPersons.length === 0 ? (
        <Typography variant="body2" sx={{ opacity: 0.7, mb: 1 }}>
          No one assigned yet.
        </Typography>
      ) : (
        <Stack spacing={1} sx={{ mb: 1 }}>
          {assignedPersons.map((a) => (
            <Stack
              key={a.id}
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                p: 1,
                borderRadius: 1,
                border: `1px solid ${colors.gray[800]}`
              }}
            >
              <Avatar
                src={a.assigned_person.photo ? `${image_file_url}/${a.assigned_person.photo}` : ""}
                sx={{ width: 32, height: 32 }}
              />
              <Box flex={1} minWidth={0}>
                <Typography variant="body2" noWrap title={a.assigned_person.name}>
                  {a.assigned_person.name}
                </Typography>
                <Stack direction="row" spacing={0.5} mt={0.25} flexWrap="wrap">
                  {a.assigned_person.role?.role_name && (
                    <Chip size="small" label={a.assigned_person.role.role_name} />
                  )}
                  {a.assigned_person.department?.department_name && (
                    <Chip size="small" label={a.assigned_person.department.department_name} />
                  )}
                </Stack>
              </Box>
              <Tooltip title="Send reminder">
                <IconButton size="small" onClick={() => handleAddNotification(a.assigned_person.id)}>
                  <NotificationsActiveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Unassign">
                <IconButton size="small" color="error" onClick={() => handleUnassignData?.(a.id)}>
                  <PersonRemoveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          ))}
        </Stack>
      )}

      {/* Add via autocomplete (no full list UI) */}
      <Autocomplete
        options={available}
        loading={loading}
        value={selected}
        onChange={(_, v) => handleAssign(v)}
        getOptionLabel={(o) => o?.name ?? ""}
        isOptionEqualToValue={(o, v) => o.id === v.id}
        renderInput={(params) => (
          <TextField {...params} size="small" label="Assign employee…" placeholder="Type a name" />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.id}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar src={option.photo ? `${image_file_url}/${option.photo}` : ""} sx={{ width: 24, height: 24 }} />
              <Typography variant="body2">{option.name}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.65 }}>
                {option.role?.role_name ? `• ${option.role.role_name}` : ""}
              </Typography>
            </Stack>
          </li>
        )}
        noOptionsText="No available employees"
        clearOnBlur
      />
    </Box>
  );
};

export default EmployeeSelector;
