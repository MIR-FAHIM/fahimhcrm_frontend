import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Alert, Autocomplete, Avatar, Box, Button, Checkbox, Chip, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle, Divider, Drawer, IconButton,
  InputAdornment, LinearProgress, Link, Snackbar, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow, TextField, ToggleButton,
  ToggleButtonGroup, Tooltip, Typography, useTheme,
} from "@mui/material";
import { AddRounded, ClearRounded, CloseRounded, DeleteOutlineRounded, GroupsOutlined, RefreshRounded, SearchRounded } from "@mui/icons-material";
import { useProfile } from "../../provider/profile_context";
import { resolveProfilePhoto } from "../profile/profile_edit_utils";
import {
  addAdminProspectTeamMembers, bulkAddAdminProspectTeams, getAdminProspectTeams,
  getProspectTeamEmployees, getProspectTeamStages, removeAdminProspectTeamMember,
} from "../../../api/controller/admin_controller/prospect_team_controller";
import {
  canManageProspectTeams, getAddableTeamEmployees, isTeamActive, numericTeamId,
  prospectTeamError, teamMemberEmployeeId, toggleProspectPageSelection,
} from "./prospect_team_utils";

const initialQuery = { search: "", employee_id: "", stage_id: "", team_status: "all", page: 1, per_page: 20 };
const employeeLabel = (employee) => employee ? `${employee.name || "Employee #" + employee.id}${employee.email ? " - " + employee.email : ""}` : "";
const employeeEqual = (option, value) => Number(option.id) === Number(value.id);
const membersOf = (prospect) => Array.isArray(prospect?.team_members) ? prospect.team_members : [];
const activeCount = (prospect) => prospect.active_team_members_count ?? membersOf(prospect).filter((member) => isTeamActive(member.is_active)).length;

const TeamMember = ({ member, onRemove, disabled, compact = false }) => {
  const theme = useTheme();
  const employee = member.employee;
  const employeeId = teamMemberEmployeeId(member);
  const name = employee?.name || `Employee #${employeeId ?? member.employee_id ?? "unknown"}`;
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ py: compact ? 0.5 : 1, minWidth: 0 }}>
      <Avatar src={resolveProfilePhoto(employee?.photo)} sx={{ width: 28, height: 28, fontSize: 12 }}>{name[0]}</Avatar>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>{name}</Typography>
        {!compact && employee?.email && <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>{employee.email}</Typography>}
        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="caption" color={isTeamActive(member.is_active) ? (theme.palette.mode === "dark" ? "success.light" : "success.dark") : "text.secondary"}>
            {isTeamActive(member.is_active) ? "Assignment active" : "Assignment inactive"}
          </Typography>
          {!employee ? <Chip size="small" variant="outlined" label="Employee unavailable" />
            : !isTeamActive(employee.isActive) && <Chip size="small" color="warning" variant="outlined" label="Account inactive" />}
        </Stack>
      </Box>
      {onRemove && <Tooltip title={`Remove ${name} from team`}>
        <span><IconButton aria-label={`Remove ${name} from team`} size="small" color="error"
          disabled={disabled || !employeeId} onClick={() => onRemove(member)}><DeleteOutlineRounded fontSize="small" /></IconButton></span>
      </Tooltip>}
    </Stack>
  );
};

const ProspectTeams = () => {
  const theme = useTheme();
  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;
  const primaryButtonSx = {
    bgcolor: brand,
    color: theme.palette.blueAccent?.contrastText ?? theme.palette.primary.contrastText,
    "&:hover": { bgcolor: theme.palette.blueAccent?.dark ?? theme.palette.primary.dark },
  };
  const { userProfileData, profileLoading, setUserProfileData } = useProfile();
  const navigate = useNavigate();
  const allowed = canManageProspectTeams(userProfileData);
  const [accessDenied, setAccessDenied] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [employees, setEmployees] = useState([]);
  const [stages, setStages] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");
  const [optionsReload, setOptionsReload] = useState(0);
  const [reload, setReload] = useState(0);
  const [selected, setSelected] = useState(new Set());
  const [bulkEmployee, setBulkEmployee] = useState(null);
  const [bulkConfirmation, setBulkConfirmation] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkError, setBulkError] = useState("");
  const [managed, setManaged] = useState(null);
  const [addEmployees, setAddEmployees] = useState([]);
  const [memberError, setMemberError] = useState("");
  const [removeConfirmation, setRemoveConfirmation] = useState(null);
  const [busy, setBusy] = useState("");
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const listRequest = useRef(0);
  const mutationLock = useRef(false);
  const searchPending = search.trim() !== query.search;
  const showSnack = useCallback((message, severity = "success") => setSnack({ open: true, message, severity }), []);
  const handleError = useCallback((error) => {
    const message = prospectTeamError(error);
    if (error?.response?.status === 450) {
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("user");
      setUserProfileData(null);
      navigate("/login", { replace: true });
    } else if (error?.response?.status === 403) {
      setAccessDenied(true);
    }
    return message;
  }, [navigate, setUserProfileData]);

  useEffect(() => {
    const timer = setTimeout(() => setQuery((current) => current.search === search.trim() ? current
      : { ...current, search: search.trim(), page: 1 }), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!allowed || accessDenied || searchPending) return;
    const controller = new AbortController();
    const requestId = ++listRequest.current;
    setLoading(true);
    setListError("");
    const params = { page: query.page, per_page: query.per_page, team_status: query.team_status };
    if (query.search) params.search = query.search;
    if (query.employee_id) params.employee_id = Number(query.employee_id);
    if (query.stage_id) params.stage_id = Number(query.stage_id);
    getAdminProspectTeams(params, controller.signal).then((response) => {
      if (requestId !== listRequest.current || controller.signal.aborted) return;
      if (!Array.isArray(response.data)) throw new Error("The prospect team list could not be loaded.");
      const total = Math.max(0, Number(response.pagination?.total) || 0);
      const lastPage = Math.max(1, Number(response.pagination?.last_page) || Math.ceil(total / query.per_page));
      if (query.page > lastPage) {
        setQuery((current) => ({ ...current, page: lastPage }));
        return;
      }
      setRows(response.data);
      setPagination({ ...response.pagination, total, last_page: lastPage });
      setManaged((current) => current ? response.data.find((row) => Number(row.id) === Number(current.id)) ?? current : null);
    }).catch((error) => {
      if (controller.signal.aborted || requestId !== listRequest.current) return;
      setListError(handleError(error));
    }).finally(() => {
      if (requestId === listRequest.current && !controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [allowed, accessDenied, query, reload, searchPending, handleError]);

  useEffect(() => {
    if (!allowed || accessDenied) return;
    const controller = new AbortController();
    setOptionsLoading(true);
    setOptionsError("");
    Promise.allSettled([
      getProspectTeamEmployees(controller.signal), getProspectTeamStages(controller.signal),
    ]).then((results) => {
      if (controller.signal.aborted) return;
      const errors = [];
      results.forEach((result, index) => {
        if (result.status === "fulfilled" && Array.isArray(result.value.data)) {
          if (index === 0) setEmployees(result.value.data);
          else setStages(result.value.data);
        } else errors.push(handleError(result.reason ?? new Error("Dropdown options could not be loaded.")));
      });
      setOptionsError(errors.join(" "));
      setOptionsLoading(false);
    });
    return () => controller.abort();
  }, [allowed, accessDenied, optionsReload, handleError]);

  const changeFilter = (field, value) => {
    ++listRequest.current;
    setSelected(new Set());
    setBulkResult(null);
    setBulkError("");
    setQuery((current) => ({ ...current, [field]: value, page: 1 }));
  };
  const changeSearch = (value) => {
    if (value.trim() !== search.trim()) {
      ++listRequest.current;
      setSelected(new Set());
      setBulkResult(null);
      setBulkError("");
      setQuery((current) => ({ ...current, page: 1 }));
    }
    setSearch(value);
  };
  const refresh = () => { ++listRequest.current; setReload((value) => value + 1); };
  const toggleSelection = (ids, checked) => {
    const next = toggleProspectPageSelection(selected, ids, checked);
    if (!next) { showSnack("Select no more than 500 prospects.", "warning"); return; }
    setSelected(next);
    setBulkError("");
  };
  const activeEmployees = useMemo(() => employees.filter((employee) => isTeamActive(employee.isActive) && numericTeamId(employee.id)), [employees]);
  const addableEmployees = useMemo(() => getAddableTeamEmployees(employees, membersOf(managed)), [employees, managed]);
  const visibleIds = rows.map((row) => numericTeamId(row.id)).filter(Boolean);
  const visibleSelected = visibleIds.filter((id) => selected.has(id)).length;
  const waiting = loading || searchPending;

  const openManage = (row) => { setManaged(row); setAddEmployees([]); setMemberError(""); setRemoveConfirmation(null); };
  const beginMutation = (type) => {
    if (!allowed || accessDenied || mutationLock.current) return false;
    mutationLock.current = true;
    setBusy(type);
    return true;
  };
  const endMutation = () => { mutationLock.current = false; setBusy(""); };
  const addMembers = async () => {
    const prospectId = numericTeamId(managed?.id);
    const employeeIds = [...new Set(addEmployees.map((employee) => numericTeamId(employee.id)))];
    if (!prospectId || !employeeIds.length || employeeIds.length > 100 || employeeIds.includes(null)) {
      setMemberError("Select between 1 and 100 active employees.");
      return;
    }
    if (!beginMutation("add")) return;
    setMemberError("");
    try {
      const response = await addAdminProspectTeamMembers({
        prospect_id: prospectId, employees: employeeIds.map((employee_id) => ({ employee_id, is_active: true })),
      });
      // Keep the drawer accurate even if the changed team leaves the current filter.
      setManaged((current) => {
        if (!current || Number(current.id) !== prospectId) return current;
        const members = [...membersOf(current)];
        for (const employee of addEmployees) {
          const index = members.findIndex((member) => teamMemberEmployeeId(member) === Number(employee.id));
          const member = { ...(index >= 0 ? members[index] : {}), employee_id: Number(employee.id), employee, is_active: true };
          if (index >= 0) members[index] = member; else members.push(member);
        }
        return { ...current, team_members: members, active_team_members_count: members.filter((member) => isTeamActive(member.is_active)).length };
      });
      setAddEmployees([]);
      showSnack(response.message || "Team members added.");
      refresh();
    } catch (error) { setMemberError(handleError(error)); }
    finally { endMutation(); }
  };
  const removeMember = async () => {
    const prospectId = numericTeamId(managed?.id);
    const employeeId = teamMemberEmployeeId(removeConfirmation);
    if (!prospectId || !employeeId || !beginMutation("remove")) return;
    setMemberError("");
    try {
      const response = await removeAdminProspectTeamMember({ prospect_id: prospectId, employee_id: employeeId });
      setManaged((current) => {
        if (!current || Number(current.id) !== prospectId) return current;
        const members = membersOf(current).filter((member) => teamMemberEmployeeId(member) !== employeeId);
        return { ...current, team_members: members, active_team_members_count: members.filter((member) => isTeamActive(member.is_active)).length };
      });
      setRemoveConfirmation(null);
      showSnack(response.message || "Team member removed.");
      refresh();
    } catch (error) {
      setMemberError(handleError(error));
      if (error?.response?.status === 404) refresh();
    } finally { endMutation(); }
  };
  const confirmBulk = () => {
    const employeeId = numericTeamId(bulkEmployee?.id);
    if (!employeeId || !isTeamActive(bulkEmployee?.isActive) || !selected.size || selected.size > 500) {
      setBulkError("Select one active employee and between 1 and 500 prospects.");
      return;
    }
    setBulkError("");
    setBulkConfirmation({ employee: bulkEmployee, ids: [...selected] });
  };
  const assignBulk = async () => {
    if (!bulkConfirmation || !beginMutation("bulk")) return;
    setBulkError("");
    try {
      const response = await bulkAddAdminProspectTeams({
        employee_id: Number(bulkConfirmation.employee.id), prospect_ids: bulkConfirmation.ids,
      });
      setBulkResult(response.data);
      setSelected(new Set());
      setBulkConfirmation(null);
      showSnack(response.message || "Prospect teams assigned.");
      refresh();
    } catch (error) { setBulkError(handleError(error)); }
    finally { endMutation(); }
  };

  if (profileLoading && !userProfileData) return <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress aria-label="Loading admin profile" /></Box>;
  if (!allowed || accessDenied) return <Box sx={{ p: 3 }}><Alert severity="error">{accessDenied ? (listError || optionsError || "You do not have access to prospect teams.") : "Only active Admin and Super Admin accounts can manage prospect teams."}</Alert></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, minWidth: 0, maxWidth: "100%", color: "text.primary" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} mb={2}>
        <Box><Typography variant="h4" fontWeight={700}>Prospect Teams</Typography><Typography variant="body2" color="text.secondary">{pagination.total} prospects</Typography></Box>
        <Tooltip title="Refresh prospects"><span><IconButton aria-label="Refresh prospects" onClick={refresh} disabled={Boolean(busy) || waiting}><RefreshRounded /></IconButton></span></Tooltip>
      </Stack>
      <Stack direction={{ xs: "column", lg: "row" }} spacing={1.5} mb={2}>
        <TextField size="small" label="Search prospects" value={search} onChange={(event) => changeSearch(event.target.value)} disabled={Boolean(busy)}
          sx={{ flex: 1, minWidth: 180 }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small" /></InputAdornment> }} />
        <Autocomplete size="small" options={employees} value={employees.find((employee) => Number(employee.id) === Number(query.employee_id)) ?? null}
          getOptionLabel={employeeLabel} isOptionEqualToValue={employeeEqual} loading={optionsLoading} disabled={Boolean(busy)}
          onChange={(_, value) => changeFilter("employee_id", value?.id ?? "")} sx={{ flex: 1, minWidth: 210 }}
          renderInput={(params) => <TextField {...params} label="Employee filter" />} />
        <Autocomplete size="small" options={stages} value={stages.find((stage) => Number(stage.id) === Number(query.stage_id)) ?? null}
          getOptionLabel={(stage) => stage.stage_name || `Stage #${stage.id}`} isOptionEqualToValue={employeeEqual} loading={optionsLoading} disabled={Boolean(busy)}
          onChange={(_, value) => changeFilter("stage_id", value?.id ?? "")} sx={{ flex: 1, minWidth: 180 }}
          renderInput={(params) => <TextField {...params} label="Stage filter" />} />
        <ToggleButtonGroup exclusive size="small" value={query.team_status} disabled={Boolean(busy)}
          aria-label="Team status filter" onChange={(_, value) => value && changeFilter("team_status", value)}>
          <ToggleButton value="all">All</ToggleButton><ToggleButton value="assigned">Assigned</ToggleButton><ToggleButton value="unassigned">Unassigned</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      {optionsError && <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" onClick={() => setOptionsReload((value) => value + 1)} disabled={optionsLoading}>Retry</Button>}>{optionsError}</Alert>}
      {bulkResult && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setBulkResult(null)}>
        Bulk assignment complete: {bulkResult.added ?? 0} added, {bulkResult.reactivated ?? 0} reactivated, {bulkResult.skipped ?? 0} skipped (total {bulkResult.total ?? 0}).
      </Alert>}
      {selected.size > 0 && <Stack direction={{ xs: "column", md: "row" }} alignItems={{ md: "center" }} spacing={1.5}
        sx={{ p: 1.5, mb: 2, bgcolor: "action.selected", border: 1, borderColor: "divider", borderRadius: 1 }}>
        <Typography variant="body2" fontWeight={700}>{selected.size} selected</Typography>
        <Tooltip title="Clear selection"><span><IconButton aria-label="Clear selection" disabled={Boolean(busy)} onClick={() => setSelected(new Set())}><ClearRounded fontSize="small" /></IconButton></span></Tooltip>
        <Autocomplete size="small" options={activeEmployees} value={bulkEmployee} loading={optionsLoading} disabled={Boolean(busy) || optionsLoading}
          getOptionLabel={employeeLabel} isOptionEqualToValue={employeeEqual} onChange={(_, value) => setBulkEmployee(value)} sx={{ flex: 1, minWidth: 220 }}
          renderInput={(params) => <TextField {...params} label="Bulk target employee" />} />
        <Button variant="contained" sx={primaryButtonSx} startIcon={<GroupsOutlined />} onClick={confirmBulk} disabled={Boolean(busy) || !bulkEmployee}>Assign</Button>
      </Stack>}
      {bulkError && !bulkConfirmation && <Alert severity="error" sx={{ mb: 2 }}>{bulkError}</Alert>}
      {listError && <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" onClick={refresh}>Retry</Button>}>{listError}</Alert>}
      <Box sx={{ bgcolor: "background.paper", border: 1, borderColor: "divider", borderRadius: 1, overflow: "hidden", maxWidth: "100%" }}>
        <Box sx={{ height: 3 }}>{waiting && <LinearProgress />}</Box>
        <TableContainer>
          <Table size="small" sx={{ minWidth: 880 }} aria-label="Prospect teams">
            <TableHead><TableRow>
              <TableCell padding="checkbox"><Tooltip title="Select this page only"><Checkbox
                inputProps={{ "aria-label": "Select visible prospects" }} disabled={waiting || Boolean(busy) || Boolean(listError) || !visibleIds.length}
                checked={visibleIds.length > 0 && visibleSelected === visibleIds.length} indeterminate={visibleSelected > 0 && visibleSelected < visibleIds.length}
                onChange={(event) => toggleSelection(visibleIds, event.target.checked)} /></Tooltip></TableCell>
              {["Prospect", "Stage", "Address", "Assigned employees", "Active members", "Actions"].map((label) => <TableCell key={label} sx={{ fontWeight: 700 }}>{label}</TableCell>)}
            </TableRow></TableHead>
            <TableBody>
              {!listError && rows.map((row) => <TableRow key={row.id} hover selected={selected.has(Number(row.id))}>
                <TableCell padding="checkbox"><Checkbox inputProps={{ "aria-label": `Select ${row.prospect_name || row.id}` }}
                  checked={selected.has(Number(row.id))} disabled={waiting || Boolean(busy) || !numericTeamId(row.id)}
                  onChange={(event) => toggleSelection([Number(row.id)], event.target.checked)} /></TableCell>
                <TableCell sx={{ minWidth: 160, maxWidth: 230 }}><Link component={RouterLink} to={`/prospect-detail/${row.id}`} sx={{ fontWeight: 600, overflowWrap: "anywhere", color: brand }}>{row.prospect_name || `Prospect #${row.id}`}</Link></TableCell>
                <TableCell>{row.stage?.stage_name || "Not set"}</TableCell>
                <TableCell sx={{ maxWidth: 200, overflowWrap: "anywhere" }}>{row.address || "-"}</TableCell>
                <TableCell sx={{ minWidth: 220, maxWidth: 300 }}><Box sx={{ maxHeight: 150, overflowY: "auto" }}>
                  {membersOf(row).length ? membersOf(row).map((member, index) => <TeamMember key={teamMemberEmployeeId(member) ?? index} member={member} compact />)
                    : <Typography variant="body2" color="text.secondary">No members</Typography>}
                </Box></TableCell>
                <TableCell><Chip size="small" label={activeCount(row)} color={Number(activeCount(row)) > 0 ? "success" : "default"} /></TableCell>
                <TableCell><Button size="small" sx={{ color: brand }} startIcon={<GroupsOutlined />} onClick={() => openManage(row)} disabled={waiting || Boolean(busy)}>Manage Members</Button></TableCell>
              </TableRow>)}
              {!waiting && !rows.length && !listError && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}>No prospects found.</TableCell></TableRow>}
              {waiting && !rows.length && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}><CircularProgress size={24} aria-label="Loading prospects" /></TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={pagination.total} page={query.page - 1} rowsPerPage={query.per_page}
          rowsPerPageOptions={[20, 50, 100]} onPageChange={(_, page) => setQuery((current) => ({ ...current, page: page + 1 }))}
          onRowsPerPageChange={(event) => setQuery((current) => ({ ...current, per_page: Math.min(100, Number(event.target.value)), page: 1 }))}
          SelectProps={{ disabled: waiting || Boolean(busy) }} backIconButtonProps={{ disabled: waiting || Boolean(busy) || query.page <= 1 }}
          nextIconButtonProps={{ disabled: waiting || Boolean(busy) || query.page >= pagination.last_page }}
          sx={{ ".MuiTablePagination-toolbar": { flexWrap: "wrap", px: { xs: 1, sm: 2 } }, ".MuiTablePagination-spacer": { display: { xs: "none", sm: "block" } } }} />
      </Box>
      <Drawer anchor="right" open={Boolean(managed)} onClose={() => !busy && setManaged(null)}
        PaperProps={{ sx: { width: { xs: "100%", sm: 520 }, maxWidth: "100%" } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5 }}>
          <Box sx={{ minWidth: 0 }}><Typography variant="h6">Manage Members</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>{managed?.prospect_name}</Typography></Box>
          <Tooltip title="Close team"><span><IconButton aria-label="Close team" disabled={Boolean(busy)} onClick={() => setManaged(null)}><CloseRounded /></IconButton></span></Tooltip>
        </Stack><Divider />
        <Box sx={{ p: 2.5, overflowY: "auto" }}>
          {memberError && !removeConfirmation && <Alert severity="error" sx={{ mb: 2 }}>{memberError}</Alert>}
          <Typography variant="subtitle2" mb={1}>Current members ({membersOf(managed).length})</Typography>
          {membersOf(managed).map((member, index) => <TeamMember key={teamMemberEmployeeId(member) ?? index} member={member}
            disabled={Boolean(busy)} onRemove={(value) => { setMemberError(""); setRemoveConfirmation(value); }} />)}
          {!membersOf(managed).length && <Typography variant="body2" color="text.secondary" py={2}>No employees assigned.</Typography>}
          <Divider sx={{ my: 2 }} />
          <Autocomplete multiple size="small" options={addableEmployees} value={addEmployees} loading={optionsLoading} disabled={Boolean(busy) || optionsLoading}
            filterSelectedOptions getOptionLabel={employeeLabel} isOptionEqualToValue={employeeEqual}
            onChange={(_, value) => {
              if (value.length > 100) { showSnack("Add no more than 100 employees at once.", "warning"); return; }
              setAddEmployees(value);
            }} renderInput={(params) => <TextField {...params} label="Add or reactivate employees" />}
            noOptionsText="No active employees available to add" />
          <Button variant="contained" sx={{ ...primaryButtonSx, mt: 2 }} startIcon={busy === "add" ? <CircularProgress size={16} color="inherit" /> : <AddRounded />}
            onClick={addMembers} disabled={Boolean(busy) || optionsLoading || !addEmployees.length}>Add Members</Button>
        </Box>
      </Drawer>
      <Dialog open={Boolean(removeConfirmation)} onClose={() => !busy && setRemoveConfirmation(null)} fullWidth maxWidth="xs">
        <DialogTitle>Remove team member?</DialogTitle>
        <DialogContent>
          {memberError && <Alert severity="error" sx={{ mb: 2 }}>{memberError}</Alert>}
          <Typography>Remove {removeConfirmation?.employee?.name || `employee #${teamMemberEmployeeId(removeConfirmation)}`} from {managed?.prospect_name}?</Typography>
        </DialogContent>
        <DialogActions><Button disabled={Boolean(busy)} onClick={() => setRemoveConfirmation(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={removeMember} disabled={Boolean(busy)}
            startIcon={busy === "remove" ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlineRounded />}>Remove</Button></DialogActions>
      </Dialog>
      <Dialog open={Boolean(bulkConfirmation)} onClose={() => !busy && setBulkConfirmation(null)} fullWidth maxWidth="xs">
        <DialogTitle>Assign prospect teams?</DialogTitle>
        <DialogContent>
          {bulkError && <Alert severity="error" sx={{ mb: 2 }}>{bulkError}</Alert>}
          <Typography>Assign {bulkConfirmation?.employee?.name} to {bulkConfirmation?.ids.length ?? 0} selected prospects?</Typography>
        </DialogContent>
        <DialogActions><Button disabled={Boolean(busy)} onClick={() => setBulkConfirmation(null)}>Cancel</Button>
          <Button variant="contained" sx={primaryButtonSx} disabled={Boolean(busy)} onClick={assignBulk}
            startIcon={busy === "bulk" ? <CircularProgress size={16} color="inherit" /> : <GroupsOutlined />}>Confirm Assignment</Button></DialogActions>
      </Dialog>
      <Snackbar open={snack.open} autoHideDuration={5000} onClose={() => setSnack((current) => ({ ...current, open: false }))}>
        <Alert severity={snack.severity} onClose={() => setSnack((current) => ({ ...current, open: false }))}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ProspectTeams;