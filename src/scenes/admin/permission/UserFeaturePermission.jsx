import { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Avatar,
  Box,
  CircularProgress,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { fetchEmployees } from "../../../api/controller/admin_controller/user_controller";
import FeaturePermissionBoard from "./FeaturePermissionBoard";

const UserFeaturePermission = () => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetchEmployees();
        if (!mounted) return;
        const employees = res?.data ?? res ?? [];
        setUsers(Array.isArray(employees) ? employees : []);
      } catch (error) {
        console.error("Failed to load users:", error);
        if (mounted) setUsers([]);
      } finally {
        if (mounted) setUserLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedUserLabel = useMemo(() => {
    if (!selectedUser) return "Select an employee to view and update permissions.";
    const role = selectedUser?.role?.role_name ? ` - ${selectedUser.role.role_name}` : "";
    return `Managing permissions for ${selectedUser.name}${role}`;
  }, [selectedUser]);

  const userSelector = (
    <Autocomplete
      options={users}
      value={selectedUser}
      loading={userLoading}
      onChange={(_, nextUser) => setSelectedUser(nextUser)}
      getOptionLabel={(option) => option?.name || option?.email || `User ${option?.id || ""}`}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      sx={{ minWidth: { xs: "100%", md: 320 } }}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.id}>
          <Avatar
            src={option.photo || undefined}
            sx={{
              width: 30,
              height: 30,
              mr: 1.25,
              bgcolor: alpha(theme.palette.primary.main, 0.16),
            }}
          >
            {(option.name || "?").slice(0, 1).toUpperCase()}
          </Avatar>
          <Box minWidth={0}>
            <Typography variant="body2" fontWeight={800} noWrap>
              {option.name || `User ${option.id}`}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {option.email || option?.role?.role_name || "No email"}
            </Typography>
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select user"
          size="small"
          placeholder="Search employee"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
            },
          }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {userLoading ? <CircularProgress color="inherit" size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );

  return (
    <FeaturePermissionBoard
      userId={selectedUser?.id}
      title="User Permission"
      subtitle={selectedUserLabel}
      toolbar={userSelector}
      emptySelectionMessage="Select a user from the dropdown to view and update that user's permissions."
    />
  );
};

export default UserFeaturePermission;
