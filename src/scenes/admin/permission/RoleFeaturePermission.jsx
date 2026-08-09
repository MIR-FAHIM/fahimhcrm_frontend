import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  Skeleton,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  AccessTimeOutlined,
  AdminPanelSettingsOutlined,
  BadgeOutlined,
  BlockRounded,
  CampaignOutlined,
  CheckCircleRounded,
  CloseRounded,
  GroupsOutlined,
  MapOutlined,
  RefreshRounded,
  SaveRounded,
  SearchRounded,
  TaskAltOutlined,
  ToggleOffRounded,
  ToggleOnRounded,
} from "@mui/icons-material";
import { fetchRole } from "../../../api/controller/admin_controller/department_controller";
import {
  getRoleFeaturePermissions,
  updateRoleFeaturePermissions,
} from "../../../api/controller/admin_controller/feature_permission_controller";

const formatLabel = (value = "") =>
  String(value)
    .replace(/_/g, " ")
    .replace(/\./g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatFeatureName = (value = "") =>
  formatLabel(String(value).replace(/^(can|show|user)\s*/i, ""));

const asBoolean = (value) => value === true || value === 1 || value === "1";

const moduleMeta = {
  attendance: {
    label: "Attendance",
    icon: <AccessTimeOutlined fontSize="small" />,
    tone: "info",
  },
  employee: {
    label: "Employee",
    icon: <BadgeOutlined fontSize="small" />,
    tone: "secondary",
  },
  task: {
    label: "Task",
    icon: <TaskAltOutlined fontSize="small" />,
    tone: "success",
  },
  lead: {
    label: "Lead",
    icon: <GroupsOutlined fontSize="small" />,
    tone: "warning",
  },
  notice: {
    label: "Notice",
    icon: <CampaignOutlined fontSize="small" />,
    tone: "warning",
  },
  field_force: {
    label: "Field Force",
    icon: <MapOutlined fontSize="small" />,
    tone: "info",
  },
};

const getModuleMeta = (moduleName) => ({
  label: moduleMeta[moduleName]?.label || formatLabel(moduleName),
  icon: moduleMeta[moduleName]?.icon || <AdminPanelSettingsOutlined fontSize="small" />,
  tone: moduleMeta[moduleName]?.tone || "primary",
});

const getRoleLabel = (role = {}) =>
  role.role_name || role.name || role.title || `Role ${role.id || ""}`;

const getGroupedPayload = (response) =>
  response?.data?.permissions ||
  response?.data?.features ||
  response?.data ||
  response?.permissions ||
  response?.features ||
  response ||
  {};

const normalizeFeature = (feature, moduleName) => ({
  id: feature.feature_id,
  module: feature.module || moduleName,
  feature_id: feature.feature_id,
  feature_key: feature.feature_key || "",
  feature_name: feature.feature_name || feature.feature_key || "",
  details: feature.details || "",
  is_active: asBoolean(feature.is_active),
  has_permission: asBoolean(feature.has_permission),
});

const normalizeGroupedPermissions = (data = {}) => {
  if (Array.isArray(data)) {
    return data.reduce((acc, feature) => {
      const moduleName = feature.module || "other";
      acc[moduleName] = acc[moduleName] || [];
      acc[moduleName].push(normalizeFeature(feature, moduleName));
      return acc;
    }, {});
  }

  return Object.entries(data).reduce((acc, [moduleName, features]) => {
    acc[moduleName] = Array.isArray(features)
      ? features.map((feature) => normalizeFeature(feature, moduleName))
      : [];
    return acc;
  }, {});
};

const flattenFeatures = (groups) => Object.values(groups).flat();

const createPermissionMap = (groups) =>
  flattenFeatures(groups).reduce((acc, feature) => {
    acc[String(feature.feature_id)] = Boolean(feature.has_permission);
    return acc;
  }, {});

const updateFeatureInGroups = (groups, featureId, patch) =>
  Object.entries(groups).reduce((next, [moduleName, features]) => {
    next[moduleName] = features.map((feature) =>
      feature.feature_id === featureId ? { ...feature, ...patch } : feature
    );
    return next;
  }, {});

const updateModuleFeatures = (groups, moduleName, featureIds, patch) => ({
  ...groups,
  [moduleName]: (groups[moduleName] || []).map((feature) =>
    featureIds.includes(feature.feature_id) ? { ...feature, ...patch } : feature
  ),
});

const buildSavePayload = (roleId, groups) => ({
  role_id: Number(roleId),
  permissions: flattenFeatures(groups)
    .filter((feature) => Number.isFinite(Number(feature.feature_id)))
    .map((feature) => ({
      feature_id: Number(feature.feature_id),
      has_permission: Boolean(feature.has_permission),
    })),
});

const SummaryTile = ({ icon, label, value, tone = "primary" }) => {
  const theme = useTheme();
  const color = theme.palette[tone]?.main || theme.palette.primary.main;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderColor: alpha(color, 0.28),
        bgcolor: theme.palette.background.paper,
        boxShadow: "none",
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              color,
              bgcolor: alpha(color, theme.palette.mode === "dark" ? 0.16 : 0.1),
            }}
          >
            {icon}
          </Box>
          <Box minWidth={0}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {label}
            </Typography>
            <Typography variant="h5" fontWeight={700} lineHeight={1.1}>
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const RoleFeaturePermission = () => {
  const theme = useTheme();

  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [groupedPermissions, setGroupedPermissions] = useState({});
  const [initialPermissionMap, setInitialPermissionMap] = useState({});
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedModule, setSelectedModule] = useState("all");
  const [snack, setSnack] = useState({ open: false, message: "", severity: "info" });

  const selectedRoleId = selectedRole?.id;

  const loadRoles = async () => {
    setRolesLoading(true);
    try {
      const res = await fetchRole();
      const rolePayload = Array.isArray(res?.data)
        ? res.data
        : res?.data?.roles || res?.roles || res || [];
      setRoles(Array.isArray(rolePayload) ? rolePayload : []);
    } catch (roleError) {
      console.error("Role load failed:", roleError);
      setRoles([]);
      setSnack({ open: true, message: "Roles could not be loaded.", severity: "error" });
    } finally {
      setRolesLoading(false);
    }
  };

  const loadPermissions = async (roleId, { silent = false } = {}) => {
    if (!roleId) {
      setGroupedPermissions({});
      setInitialPermissionMap({});
      return;
    }

    setError(null);
    if (silent) {
      setRefreshing(true);
    } else {
      setPermissionsLoading(true);
    }

    try {
      const res = await getRoleFeaturePermissions(roleId);
      if (res?.status && res.status !== "success") {
        throw new Error(res.message || "Failed to fetch role permissions");
      }

      const normalized = normalizeGroupedPermissions(getGroupedPayload(res));
      setGroupedPermissions(normalized);
      setInitialPermissionMap(createPermissionMap(normalized));
    } catch (permissionError) {
      console.error("Role permission load failed:", permissionError);
      setGroupedPermissions({});
      setInitialPermissionMap({});
      setError(permissionError.message || "Role permissions could not be loaded.");
    } finally {
      setPermissionsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    setSearch("");
    setSelectedModule("all");
    loadPermissions(selectedRoleId);
  }, [selectedRoleId]);

  const summary = useMemo(() => {
    const features = flattenFeatures(groupedPermissions);
    const allowed = features.filter((feature) => feature.has_permission).length;
    const active = features.filter((feature) => feature.is_active).length;
    const changed = features.filter(
      (feature) =>
        initialPermissionMap[String(feature.feature_id)] !== Boolean(feature.has_permission)
    ).length;

    return {
      modules: Object.keys(groupedPermissions).length,
      total: features.length,
      allowed,
      blocked: features.length - allowed,
      active,
      changed,
    };
  }, [groupedPermissions, initialPermissionMap]);

  const moduleSummaries = useMemo(
    () =>
      Object.entries(groupedPermissions)
        .map(([moduleName, features]) => {
          const meta = getModuleMeta(moduleName);
          const allowed = features.filter((feature) => feature.has_permission).length;
          return {
            moduleName,
            ...meta,
            total: features.length,
            allowed,
          };
        })
        .sort((a, b) => a.label.localeCompare(b.label)),
    [groupedPermissions]
  );

  const moduleGroups = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return Object.entries(groupedPermissions)
      .filter(([moduleName]) => selectedModule === "all" || selectedModule === moduleName)
      .map(([moduleName, features]) => {
        const meta = getModuleMeta(moduleName);
        const moduleMatches = meta.label.toLowerCase().includes(normalizedSearch);
        const filteredFeatures =
          normalizedSearch && !moduleMatches
            ? features.filter((feature) => {
                const featureText = [
                  feature.feature_key,
                  feature.feature_name,
                  feature.details,
                ]
                  .filter(Boolean)
                  .join(" ")
                  .toLowerCase();
                return featureText.includes(normalizedSearch);
              })
            : features;

        const allowed = features.filter((feature) => feature.has_permission).length;
        const active = features.filter((feature) => feature.is_active).length;

        return {
          moduleName,
          ...meta,
          features: filteredFeatures,
          allFeatures: features,
          total: features.length,
          allowed,
          active,
          inactive: features.length - active,
          percent: features.length ? Math.round((allowed / features.length) * 100) : 0,
        };
      })
      .filter((group) => group.features.length > 0)
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [groupedPermissions, search, selectedModule]);

  const handleTogglePermission = (featureId, nextValue) => {
    setGroupedPermissions((current) =>
      updateFeatureInGroups(current, featureId, { has_permission: nextValue })
    );
  };

  const handleBulkModule = (group, shouldAllow) => {
    const featureIds = group.allFeatures
      .filter((feature) => feature.is_active && feature.has_permission !== shouldAllow)
      .map((feature) => feature.feature_id);

    if (!featureIds.length) {
      setSnack({
        open: true,
        message: `All active ${group.label} permissions are already ${
          shouldAllow ? "allowed" : "blocked"
        }.` ,
        severity: "info",
      });
      return;
    }

    setGroupedPermissions((current) =>
      updateModuleFeatures(current, group.moduleName, featureIds, { has_permission: shouldAllow })
    );
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;

    setSaving(true);
    setError(null);
    try {
      const payload = buildSavePayload(selectedRoleId, groupedPermissions);
      if (!payload.permissions.length) {
        setSnack({
          open: true,
          message: "No valid role permissions found to save.",
          severity: "warning",
        });
        return;
      }

      const res = await updateRoleFeaturePermissions(payload);
      if (res?.status && res.status !== "success") {
        throw new Error(res.message || "Role permissions could not be saved.");
      }

      setInitialPermissionMap(createPermissionMap(groupedPermissions));
      setSnack({
        open: true,
        message: "Role permissions saved successfully.",
        severity: "success",
      });
      await loadPermissions(selectedRoleId, { silent: true });
    } catch (saveError) {
      console.error("Role permission save failed:", saveError);
      setError(saveError.message || "Role permissions could not be saved.");
      setSnack({ open: true, message: "Role permissions could not be saved.", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const roleSelector = (
    <Autocomplete
      options={roles}
      value={selectedRole}
      loading={rolesLoading}
      onChange={(_, nextRole) => setSelectedRole(nextRole)}
      getOptionLabel={(option) => getRoleLabel(option)}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      sx={{ minWidth: { xs: "100%", md: 300 } }}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.id}>
          <Box minWidth={0}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {getRoleLabel(option)}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {asBoolean(option.isActive ?? option.is_active) ? "Active role" : "Inactive role"}
            </Typography>
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select role"
          size="small"
          placeholder="Search role"
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
                {rolesLoading ? <CircularProgress color="inherit" size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );

  const renderModuleCard = (group) => {
    const color = theme.palette[group.tone]?.main || theme.palette.primary.main;

    return (
      <Card
        key={group.moduleName}
        variant="outlined"
        sx={{
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          borderColor: alpha(color, 0.28),
          boxShadow: "none",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2.25 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", md: "center" }}
              spacing={2}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 1.75,
                    display: "grid",
                    placeItems: "center",
                    color,
                    bgcolor: alpha(color, theme.palette.mode === "dark" ? 0.16 : 0.1),
                    flexShrink: 0,
                  }}
                >
                  {group.icon}
                </Box>
                <Box minWidth={0}>
                  <Typography variant="h6" fontWeight={700} lineHeight={1.1}>
                    {group.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={0.25}>
                    {group.allowed} allowed of {group.total} permissions
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip size="small" label={`${group.active} active`} color="success" variant="outlined" />
                <Chip size="small" label={`${group.inactive} inactive`} variant="outlined" />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleBulkModule(group, true)}
                  disabled={saving || permissionsLoading || !selectedRoleId}
                  sx={{ borderRadius: 2 }}
                >
                  Allow active
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  onClick={() => handleBulkModule(group, false)}
                  disabled={saving || permissionsLoading || !selectedRoleId}
                  sx={{ borderRadius: 2 }}
                >
                  Block active
                </Button>
              </Stack>
            </Stack>

            <Box
              sx={{
                mt: 2,
                height: 8,
                borderRadius: 999,
                bgcolor: alpha(color, 0.12),
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: `${group.percent}%`,
                  height: "100%",
                  bgcolor: color,
                  transition: "width .2s ease",
                }}
              />
            </Box>
          </Box>

          <Divider />

          <Stack spacing={0}>
            {group.features.map((feature, index) => {
              const featureKey = feature.feature_key || `feature.${feature.feature_id}`;
              const isChanged =
                initialPermissionMap[String(feature.feature_id)] !==
                Boolean(feature.has_permission);

              return (
                <Box
                  key={`${feature.feature_id}-${featureKey}`}
                  sx={{
                    p: 2,
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) auto" },
                    gap: 1.5,
                    alignItems: "center",
                    bgcolor: index % 2 === 0 ? "transparent" : alpha(theme.palette.text.primary, 0.025),
                  }}
                >
                  <Box minWidth={0}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {formatFeatureName(feature.feature_name || featureKey)}
                      </Typography>
                      <Chip
                        size="small"
                        label={featureKey}
                        variant="outlined"
                        sx={{ height: 22, fontFamily: "monospace", fontWeight: 600 }}
                      />
                      <Chip
                        size="small"
                        label={feature.is_active ? "Active" : "Inactive"}
                        color={feature.is_active ? "success" : "default"}
                        variant={feature.is_active ? "filled" : "outlined"}
                        sx={{ height: 22, fontWeight: 600 }}
                      />
                      {isChanged && (
                        <Chip
                          size="small"
                          label="Unsaved"
                          color="warning"
                          variant="outlined"
                          sx={{ height: 22, fontWeight: 600 }}
                        />
                      )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" mt={0.75}>
                      {feature.details || formatLabel(featureKey)}
                    </Typography>
                  </Box>

                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent={{ xs: "space-between", md: "flex-end" }}
                    spacing={1.25}
                    sx={{ minWidth: { md: 230 } }}
                  >
                    <Chip
                      size="small"
                      icon={feature.has_permission ? <CheckCircleRounded /> : <BlockRounded />}
                      label={feature.has_permission ? "Allowed" : "Blocked"}
                      color={feature.has_permission ? "success" : "default"}
                      variant={feature.has_permission ? "filled" : "outlined"}
                      sx={{ fontWeight: 700 }}
                    />
                    <Tooltip
                      title={
                        feature.is_active
                          ? "Change locally, then save"
                          : "Inactive features cannot be changed"
                      }
                    >
                      <span>
                        <Switch
                          checked={feature.has_permission}
                          disabled={!feature.is_active || saving || permissionsLoading || !selectedRoleId}
                          onChange={(event) =>
                            handleTogglePermission(feature.feature_id, event.target.checked)
                          }
                        />
                      </span>
                    </Tooltip>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1500, mx: "auto" }}>
      {(refreshing || saving) && (
        <LinearProgress sx={{ mb: 2, height: 6, borderRadius: 999 }} />
      )}

      <Box
        sx={{
          p: { xs: 2, md: 3 },
          mb: 2.5,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            theme.palette.mode === "dark" ? 0.16 : 0.1
          )}, ${alpha(theme.palette.success.main, theme.palette.mode === "dark" ? 0.1 : 0.06)})`,
        }}
      >
        <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" gap={2}>
          <Box minWidth={0}>
            <Typography variant="h4" fontWeight={700} lineHeight={1.05}>
              Role Permission Management
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              {selectedRole
                ? `Managing feature permissions for ${getRoleLabel(selectedRole)}.`
                : "Select a role to load grouped feature permissions."}
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ xs: "stretch", md: "center" }}>
            {roleSelector}
            <TextField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search feature key or module"
              size="small"
              disabled={!selectedRoleId}
              sx={{ minWidth: { xs: "100%", md: 300 }, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: theme.palette.background.paper } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Button variant="outlined" startIcon={<RefreshRounded />} onClick={() => loadPermissions(selectedRoleId, { silent: true })} disabled={refreshing || permissionsLoading || !selectedRoleId} sx={{ borderRadius: 2 }}>
              Refresh
            </Button>
            <Button variant="contained" startIcon={<SaveRounded />} onClick={handleSave} disabled={saving || permissionsLoading || !selectedRoleId || !summary.total} sx={{ borderRadius: 2, fontWeight: 700 }}>
              Save
            </Button>
          </Stack>
        </Stack>
      </Box>

      {!selectedRoleId && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          Select a role from the dropdown to view and update role-wise feature permissions.
        </Alert>
      )}

      {summary.changed > 0 && selectedRoleId && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          {summary.changed} permission change{summary.changed > 1 ? "s" : ""} waiting to be saved.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(6, 1fr)" }} gap={1.5} mb={2.5}>
        <SummaryTile icon={<AdminPanelSettingsOutlined fontSize="small" />} label="Modules" value={summary.modules} />
        <SummaryTile icon={<GroupsOutlined fontSize="small" />} label="Features" value={summary.total} tone="info" />
        <SummaryTile icon={<CheckCircleRounded fontSize="small" />} label="Allowed" value={summary.allowed} tone="success" />
        <SummaryTile icon={<BlockRounded fontSize="small" />} label="Blocked" value={summary.blocked} tone="warning" />
        <SummaryTile icon={<ToggleOnRounded fontSize="small" />} label="Active" value={summary.active} tone="secondary" />
        <SummaryTile icon={<ToggleOffRounded fontSize="small" />} label="Changed" value={summary.changed} tone="warning" />
      </Box>

      <Card
        variant="outlined"
        sx={{ borderRadius: 2, bgcolor: theme.palette.background.paper, borderColor: theme.palette.divider, boxShadow: "none", mb: 2.5 }}
      >
        <CardContent sx={{ p: 1.5 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              variant={selectedModule === "all" ? "contained" : "outlined"}
              size="small"
              onClick={() => setSelectedModule("all")}
              disabled={!selectedRoleId}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              All modules
              <Chip size="small" label={summary.modules} sx={{ ml: 1, height: 20, fontSize: 11 }} />
            </Button>
            {moduleSummaries.map((group) => (
              <Button
                key={group.moduleName}
                variant={selectedModule === group.moduleName ? "contained" : "outlined"}
                size="small"
                onClick={() => setSelectedModule(group.moduleName)}
                disabled={!selectedRoleId}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                {group.label}
                <Chip
                  size="small"
                  label={`${group.allowed}/${group.total}`}
                  sx={{ ml: 1, height: 20, fontSize: 11 }}
                />
              </Button>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {permissionsLoading ? (
        <Stack spacing={2}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={180} />
          ))}
        </Stack>
      ) : moduleGroups.length ? (
        <Stack spacing={2}>{moduleGroups.map(renderModuleCard)}</Stack>
      ) : (
        <Card
          variant="outlined"
          sx={{ borderRadius: 2, borderStyle: "dashed", bgcolor: theme.palette.background.paper, boxShadow: "none" }}
        >
          <CardContent sx={{ py: 5, textAlign: "center" }}>
            <SearchRounded sx={{ fontSize: 36, color: "text.secondary", mb: 1 }} />
            <Typography variant="h6" fontWeight={700}>
              {selectedRoleId ? "No matching permissions" : "No role selected"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedRoleId
                ? "Try a different module or search term."
                : "Select a role from the dropdown to load grouped permissions."}
            </Typography>
          </CardContent>
        </Card>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={2600}
        onClose={() => setSnack((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={() => setSnack((current) => ({ ...current, open: false }))}
            >
              <CloseRounded fontSize="small" />
            </IconButton>
          }
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RoleFeaturePermission;
