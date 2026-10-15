import { image_file_url } from "../../../api/config";

export const PERSONAL_FIELDS = ["name", "email", "phone", "address", "birthdate", "bio"];
export const PREFERENCE_FIELDS = ["is_dark_mode", "is_prospect_table_view"];
export const EMPLOYMENT_FIELDS = ["role_id", "department_id", "designation_id"];
export const ATTENDANCE_FIELDS = ["attendance_method_id", "start_hour", "start_min", "end_hour", "end_min"];
export const asBoolean = (value) => value === true || value === 1 || value === "1";

export const resolveProfilePhoto = (photo) => {
  if (!photo || photo === "undefined") return undefined;
  if (/^https?:\/\//i.test(photo)) return photo;
  const path = String(photo).replace(/^\/+/, "").replace(/^(?:storage\/app\/public\/|storage\/)/, "");
  return `${image_file_url.replace(/\/+$/, "")}/${path}`;
};

const timeValue = (hour, minute) => {
  if (hour == null && minute == null) return "";
  return `${String(hour ?? 0).padStart(2, "0")}:${String(minute ?? 0).padStart(2, "0")}`;
};

export const buildProfileForm = (profile) => ({
  name: profile.name ?? "",
  email: profile.email ?? "",
  phone: String(profile.phone ?? ""),
  address: profile.address ?? "",
  birthdate: profile.birthdate ? String(profile.birthdate).split("T")[0] : "",
  bio: profile.bio ?? "",
  role_id: String(profile.role_id ?? profile.role?.id ?? ""),
  department_id: String(profile.department_id ?? profile.department?.id ?? ""),
  designation_id: String(profile.designation_id ?? profile.designation?.id ?? ""),
  attendance_method_id: String(profile.attendance_method_id ?? profile.attendance_method?.id ?? ""),
  office_start_time: timeValue(profile.start_hour, profile.start_min),
  office_end_time: timeValue(profile.end_hour, profile.end_min),
  is_dark_mode: asBoolean(profile.is_dark_mode),
  is_prospect_table_view: asBoolean(profile.is_prospect_table_view),
});

const validDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export const buildProfileChanges = (profile, values, allowedFields) => {
  const initial = buildProfileForm(profile);
  const payload = { user_id: Number(profile.id) };
  const errors = {};
  for (const field of [...PERSONAL_FIELDS, ...PREFERENCE_FIELDS, ...EMPLOYMENT_FIELDS, "attendance_method_id"]) {
    if (!allowedFields.includes(field) || values[field] === initial[field]) continue;
    const value = values[field];
    if (value === undefined || value === "undefined") {
      errors[field] = "Enter a valid value.";
      continue;
    }
    if (field === "name" && !String(value).trim()) errors[field] = "Name is required.";
    if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) errors[field] = "Enter a valid email address.";
    if (field === "birthdate" && value && !validDate(value)) errors[field] = "Enter a valid date.";
    if (EMPLOYMENT_FIELDS.includes(field) || field === "attendance_method_id") {
      if (value === "" && field === "attendance_method_id") payload[field] = null;
      else if (!Number.isInteger(Number(value)) || Number(value) <= 0) errors[field] = "Select a valid option.";
      else payload[field] = Number(value);
    } else if (PREFERENCE_FIELDS.includes(field)) {
      if (typeof value !== "boolean") errors[field] = "Select a valid preference.";
      else payload[field] = value;
    } else {
      payload[field] = value === "" && ["birthdate", "bio", "address"].includes(field) ? null : String(value);
    }
  }
  for (const [input, hourField, minuteField] of [
    ["office_start_time", "start_hour", "start_min"],
    ["office_end_time", "end_hour", "end_min"],
  ]) {
    if (!allowedFields.includes(hourField) || values[input] === initial[input]) continue;
    const value = values[input];
    if (value === "") {
      if (profile[hourField] != null) payload[hourField] = null;
      if (profile[minuteField] != null) payload[minuteField] = null;
    } else if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(value))) {
      errors[input] = "Use a valid time between 00:00 and 23:59.";
    } else {
      const [hour, minute] = value.split(":").map(Number);
      if (profile[hourField] == null || Number(profile[hourField]) !== hour) payload[hourField] = hour;
      if (profile[minuteField] == null || Number(profile[minuteField]) !== minute) payload[minuteField] = minute;
    }
  }
  return { payload, errors };
};

export const profileErrorMessage = (error, fallback) => {
  const body = error?.response?.data ?? error;
  const errors = Object.values(body?.errors ?? {}).flat().filter(Boolean);
  return [body?.message, ...errors].filter(Boolean).join(" ") || fallback;
};

export const assertProfileSuccess = (response, fallback) => {
  if (response?.status !== "success") throw new Error(profileErrorMessage(response, fallback));
};
