export const isTeamActive = (value) => value === true || value === 1 || value === "1";

export const getStoredProspectTeamUser = () => {
  try {
    const stored = localStorage.getItem("loggedInUser") || localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const isUserActive = (user) => {
  if (!user) return false;
  // If explicitly marked inactive
  if (user.isActive === false || user.isActive === 0 || user.isActive === "0") return false;
  if (user.is_active === false || user.is_active === 0 || user.is_active === "0") return false;
  if (user.status === "inactive" || user.status === 0 || user.status === "0" || user.status === false) return false;

  // If explicitly marked active on user
  if (isTeamActive(user.isActive) || isTeamActive(user.is_active) || user.status === "active") return true;

  // Check role active status
  if (isTeamActive(user.role?.isActive) || isTeamActive(user.role?.is_active)) return true;

  // Default to active for authenticated user records unless explicitly deactivated
  return true;
};

export const hasAdminRole = (user) => {
  if (!user) return false;
  const roleId = Number(user.role_id ?? user.role?.id);
  if (roleId === 1 || roleId === 2) return true;

  const roleName = String(user.role?.role_name ?? user.role_name ?? user.role ?? "").trim().toLowerCase();
  return ["admin", "super admin", "superadmin"].includes(roleName);
};

export const canManageProspectTeams = (user) => {
  const targetUser = user || getStoredProspectTeamUser();
  if (!targetUser) return false;
  return isUserActive(targetUser) && hasAdminRole(targetUser);
};

export const numericTeamId = (value) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};
export const teamMemberEmployeeId = (member) => numericTeamId(member?.employee_id ?? member?.employee?.id);
export const getAddableTeamEmployees = (employees, members = []) => {
  const assigned = new Set(members.filter((member) => isTeamActive(member.is_active)).map(teamMemberEmployeeId));
  return employees.filter((employee) => (isTeamActive(employee.isActive) || isTeamActive(employee.is_active) || employee.isActive == null)
    && numericTeamId(employee.id) && !assigned.has(Number(employee.id)));
};
export const prospectTeamError = (error) => {
  const data = error?.response?.data;
  const messages = Object.values(data?.errors ?? {}).flat().filter(Boolean);
  const status = error?.response?.status;
  if (status === 450) return "Your session has expired. Please sign in again.";
  return [...new Set([data?.message, ...messages].filter(Boolean))].join(" ")
    || (status === 403 ? "You do not have access to prospect teams."
      : status === 404 ? "This assignment no longer exists. Refresh the team and try again."
        : error?.message || "The request failed. Please try again.");
};
export const toggleProspectPageSelection = (selected, ids, checked) => {
  const next = new Set(selected);
  for (const id of ids) {
    if (checked) next.add(id);
    else next.delete(id);
  }
  return next.size <= 500 ? next : null;
};