import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
  SearchRounded,
  TaskAltOutlined,
  ToggleOffRounded,
  ToggleOnRounded,
  TrendingUpOutlined,
} from "@mui/icons-material";
import {
  getFeaturePermissionByUser,
  updateFeaturePermission,
} from "../../../api/controller/admin_controller/feature_permission_controller";

const formatLabel = (value = "") =>
  String(value)
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatFeatureName = (value = "") =>
  formatLabel(String(value).replace(/^(can|show|user)\s*/i, ""));

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
    tone: "primary",
  },
  lead: {
    label: "Lead",
    icon: <TrendingUpOutlined fontSize="small" />,
    tone: "success",
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

const asBoolean = (value) => value === true || value === 1 || value === "1";

const normalizeFeature = (feature, moduleName) => ({
  id: feature.feature_id,
  module: feature.module || moduleName,
  feature_id: feature.feature_id,
  feature_name: feature.feature_name || "",
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
            <Typography variant="caption" color="text.secondary" fontWeight={800}>
              {label}
            </Typography>
            <Typography variant="h5" fontWeight={900} lineHeight={1.1}>
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const FeaturePermissionBoard = ({
  userId,
  title = "Feature Permissions",
  subtitle = "Manage grouped module access.",
  toolbar = null,
  emptySelectionMessage = "Select a user to view permissions.",
}) => {
  const theme = useTheme();

  const [groupedPermissions, setGroupedPermissions] = useState({});
  const [loading, setLoading] = useState(Boolean(userId));
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedModule, setSelectedModule] = useState("all");
  const [savingFeatureId, setSavingFeatureId] = useState(null);
  const [savingModule, setSavingModule] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "info" });

  const loadPermissions = async ({ silent = false } = {}) => {
    if (!userId) {
      setGroupedPermissions({});
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (!silent) setLoading(true);
    setRefreshing(true);
    setError(null);

    try {
      const res = await getFeaturePermissionByUser(userId);
      if (res.status === "success") {
        setGroupedPermissions(normalizeGroupedPermissions(res.data || {}));
      } else {
        setError("Failed to fetch feature permissions");
      }
    } catch (loadError) {
      console.error("Permission load failed:", loadError);
      setError("Something went wrong while loading permissions");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setSelectedModule("all");
    setSearch("");
    loadPermissions();
  }, [userId]);

  const moduleGroups = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return Object.entries(groupedPermissions)
      .map(([moduleName, features]) => {
        const meta = getModuleMeta(moduleName);
        const moduleMatches = meta.label.toLowerCase().includes(normalizedSearch);
        const filteredFeatures =
          normalizedSearch && !moduleMatches
            ? features.filter((feature) => {
                const text = [
                  feature.feature_name,
                  formatFeatureName(feature.feature_name),
                  feature.details,
                  feature.module,
                ]
                  .join(" ")
                  .toLowerCase();
                return text.includes(normalizedSearch);
              })
            : features;

        const allowed = features.filter((feature) => feature.has_permission).length;
        const active = features.filter((feature) => feature.is_active).length;

        return {
          moduleName,
          ...meta,
          features,
          filteredFeatures,
          total: features.length,
          active,
          allowed,
          blocked: features.length - allowed,
          percent: features.length ? Math.round((allowed / features.length) * 100) : 0,
        };
      })
      .filter((group) => {
        const moduleMatches = selectedModule === "all" || group.moduleName === selectedModule;
        return moduleMatches && group.filteredFeatures.length > 0;
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [groupedPermissions, search, selectedModule]);

  const allGroups = useMemo(
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

  const summary = useMemo(() => {
    const features = Object.values(groupedPermissions).flat();
    const allowed = features.filter((feature) => feature.has_permission).length;
    const active = features.filter((feature) => feature.is_active).length;

    return {
      modules: Object.keys(groupedPermissions).length,
      total: features.length,
      allowed,
      blocked: features.length - allowed,
      active,
    };
  }, [groupedPermissions]);

  const handleTogglePermission = async (feature, nextValue) => {
    const targetValue = Boolean(nextValue);
    const previous = groupedPermissions;
    setSavingFeatureId(feature.feature_id);
    setGroupedPermissions((current) =>
      updateFeatureInGroups(current, feature.feature_id, {
        has_permission: targetValue,
      })
    );

    try {
      const payload = {
        user_id: parseInt(userId, 10),
        feature_id: feature.feature_id,
        has_permission: targetValue,
      };
      const res = await updateFeaturePermission(payload);
      if (res.status !== "success") {
        throw new Error(res.message || "Permission update failed");
      }
      setSnack({
        open: true,
        message: `${formatFeatureName(feature.feature_name)} ${
          targetValue ? "allowed" : "blocked"
        }.`,
        severity: "success",
      });
    } catch (updateError) {
      console.error("Permission update failed:", updateError);
      setGroupedPermissions(previous);
      setSnack({
        open: true,
        message: "Permission could not be updated.",
        severity: "error",
      });
    } finally {
      setSavingFeatureId(null);
    }
  };

  const handleBulkPermission = async (group, shouldAllow) => {
    const activeTargets = group.features.filter(
      (feature) => feature.is_active && feature.has_permission !== shouldAllow
    );

    if (!activeTargets.length) {
      setSnack({
        open: true,
        message: `All active ${group.label} permissions are already ${
          shouldAllow ? "allowed" : "blocked"
        }.`,
        severity: "info",
      });
      return;
    }

    const previous = groupedPermissions;
    const featureIds = activeTargets.map((feature) => feature.feature_id);
    setSavingModule(group.moduleName);
    setGroupedPermissions((current) =>
      updateModuleFeatures(current, group.moduleName, featureIds, {
        has_permission: shouldAllow,
      })
    );

    try {
      await Promise.all(
        activeTargets.map((feature) =>
          updateFeaturePermission({
            user_id: parseInt(userId, 10),
            feature_id: feature.feature_id,
            has_permission: shouldAllow,
          })
        )
      );

      setSnack({
        open: true,
        message: `${group.label} permissions updated.`,
        severity: "success",
      });
    } catch (bulkError) {
      console.error("Bulk permission update failed:", bulkError);
      setGroupedPermissions(previous);
      setSnack({
        open: true,
        message: "Bulk permission update failed.",
        severity: "error",
      });
    } finally {
      setSavingModule(null);
    }
  };

  const renderModuleCard = (group) => {
    const color = theme.palette[group.tone]?.main || theme.palette.primary.main;
    const isSavingModule = savingModule === group.moduleName;

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
        {isSavingModule && <LinearProgress />}
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2.25 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="space-between"
              gap={1.5}
            >
              <Stack direction="row" spacing={1.4} alignItems="center" minWidth={0}>
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
                  <Typography variant="h6" fontWeight={950} lineHeight={1.1}>
                    {group.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {group.allowed} allowed of {group.total} permissions
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ToggleOnRounded />}
                  onClick={() => handleBulkPermission(group, true)}
                  disabled={isSavingModule || !userId}
                  sx={{ borderRadius: 2 }}
                >
                  Allow all
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  startIcon={<ToggleOffRounded />}
                  onClick={() => handleBulkPermission(group, false)}
                  disabled={isSavingModule || !userId}
                  sx={{ borderRadius: 2 }}
                >
                  Block all
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
                  borderRadius: 999,
                }}
              />
            </Box>
          </Box>

          <Divider />

          <Stack divider={<Divider flexItem />} sx={{ px: 1 }}>
            {group.filteredFeatures.map((feature) => {
              const isSaving = savingFeatureId === feature.feature_id;

              return (
                <Box
                  key={feature.feature_id}
                  sx={{
                    px: { xs: 1, sm: 1.25 },
                    py: 1.25,
                  }}
                >
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    alignItems={{ xs: "stretch", md: "center" }}
                    justifyContent="space-between"
                    gap={1.5}
                  >
                    <Box minWidth={0} flex={1}>
                      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                        <Typography variant="subtitle2" fontWeight={900}>
                          {formatFeatureName(feature.feature_name)}
                        </Typography>
                        <Chip
                          size="small"
                          label={feature.is_active ? "Active" : "Inactive"}
                          color={feature.is_active ? "success" : "default"}
                          variant={feature.is_active ? "filled" : "outlined"}
                          sx={{ height: 22, fontWeight: 800 }}
                        />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" mt={0.5}>
                        {feature.details || formatLabel(feature.feature_name)}
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
                        sx={{ fontWeight: 900 }}
                      />
                      <Tooltip
                        title={
                          feature.is_active
                            ? "Toggle permission"
                            : "Inactive features cannot be changed"
                        }
                      >
                        <span>
                          <Switch
                            checked={feature.has_permission}
                            disabled={!feature.is_active || isSaving || isSavingModule || !userId}
                            onChange={(event) =>
                              handleTogglePermission(feature, event.target.checked)
                            }
                          />
                        </span>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Skeleton variant="rounded" height={156} sx={{ borderRadius: 2, mb: 2 }} />
        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", md: "repeat(4, 1fr)" }}
          gap={2}
        >
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} variant="rounded" height={104} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
        <Skeleton variant="rounded" height={340} sx={{ borderRadius: 2, mt: 2 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1500, mx: "auto" }}>
      {refreshing && (
        <LinearProgress
          sx={{
            mb: 2,
            height: 6,
            borderRadius: 999,
            bgcolor: alpha(theme.palette.primary.main, 0.12),
          }}
        />
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
        <Stack
          direction={{ xs: "column", lg: "row" }}
          alignItems={{ xs: "stretch", lg: "center" }}
          justifyContent="space-between"
          gap={2}
        >
          <Box>
            <Typography variant="h4" fontWeight={950} lineHeight={1}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              {subtitle}
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            {toolbar}
            <TextField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search feature or module"
              size="small"
              disabled={!userId}
              sx={{
                minWidth: { xs: "100%", md: 300 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: theme.palette.background.paper,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              startIcon={<RefreshRounded />}
              onClick={() => loadPermissions({ silent: true })}
              disabled={refreshing || !userId}
              sx={{ borderRadius: 2 }}
            >
              Refresh
            </Button>
          </Stack>
        </Stack>
      </Box>

      {!userId && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          {emptySelectionMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(5, 1fr)" }}
        gap={1.5}
        mb={2.5}
      >
        <SummaryTile
          icon={<AdminPanelSettingsOutlined fontSize="small" />}
          label="Modules"
          value={summary.modules}
        />
        <SummaryTile
          icon={<GroupsOutlined fontSize="small" />}
          label="Features"
          value={summary.total}
          tone="info"
        />
        <SummaryTile
          icon={<CheckCircleRounded fontSize="small" />}
          label="Allowed"
          value={summary.allowed}
          tone="success"
        />
        <SummaryTile
          icon={<BlockRounded fontSize="small" />}
          label="Blocked"
          value={summary.blocked}
          tone="warning"
        />
        <SummaryTile
          icon={<ToggleOnRounded fontSize="small" />}
          label="Active"
          value={summary.active}
          tone="secondary"
        />
      </Box>

      <Card
        variant="outlined"
        sx={{
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          borderColor: theme.palette.divider,
          boxShadow: "none",
          mb: 2.5,
        }}
      >
        <CardContent sx={{ p: 1.5 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              size="small"
              variant={selectedModule === "all" ? "contained" : "outlined"}
              onClick={() => setSelectedModule("all")}
              disabled={!userId}
              sx={{ borderRadius: 999 }}
            >
              All modules
            </Button>
            {allGroups.map((group) => (
              <Button
                key={group.moduleName}
                size="small"
                variant={selectedModule === group.moduleName ? "contained" : "outlined"}
                onClick={() => setSelectedModule(group.moduleName)}
                startIcon={group.icon}
                sx={{ borderRadius: 999 }}
              >
                {group.label}
                <Chip
                  size="small"
                  label={`${group.allowed}/${group.total}`}
                  sx={{
                    ml: 1,
                    height: 20,
                    fontSize: 11,
                    bgcolor:
                      selectedModule === group.moduleName
                        ? alpha("#fff", 0.24)
                        : alpha(theme.palette.text.primary, 0.08),
                  }}
                />
              </Button>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {moduleGroups.length ? (
        <Stack spacing={2}>{moduleGroups.map(renderModuleCard)}</Stack>
      ) : (
        <Card
          variant="outlined"
          sx={{
            borderRadius: 2,
            borderStyle: "dashed",
            bgcolor: theme.palette.background.paper,
            boxShadow: "none",
          }}
        >
          <CardContent sx={{ py: 5, textAlign: "center" }}>
            <SearchRounded sx={{ fontSize: 36, color: "text.secondary", mb: 1 }} />
            <Typography variant="subtitle1" fontWeight={900}>
              {userId ? "No matching permissions" : "No user selected"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userId ? "Try a different module or search term." : emptySelectionMessage}
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

export default FeaturePermissionBoard;
