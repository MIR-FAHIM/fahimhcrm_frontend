import DnsRoundedIcon from "@mui/icons-material/DnsRounded";
import GpsFixedRoundedIcon from "@mui/icons-material/GpsFixedRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";

export const METHOD_LABELS = {
  ip_address: "IP Address",
  location_based: "Location Based",
  geo_fenced: "Geo Fenced",
};

export const METHOD_DESCRIPTIONS = {
  ip_address: "Employees can check in from allowed office IP addresses.",
  location_based: "Employees can check in using device location capture.",
  geo_fenced: "Employees can check in only inside the configured radius.",
};

export const METHOD_OPTIONS = [
  { value: "ip_address", label: METHOD_LABELS.ip_address },
  { value: "location_based", label: METHOD_LABELS.location_based },
  { value: "geo_fenced", label: METHOD_LABELS.geo_fenced },
];

export const METHOD_ICONS = {
  ip_address: DnsRoundedIcon,
  location_based: LocationOnRoundedIcon,
  geo_fenced: GpsFixedRoundedIcon,
};

export const isActiveValue = (value) => value === true || value === 1 || value === "1";

export const resolveAttendanceMethodList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
};

export const getAttendanceMethodLabel = (method) => METHOD_LABELS[method] || method || "Not selected";

export const getSafeApiMessage = (error, fallback = "Something went wrong. Please try again.") => {
  const data = error?.response?.data;
  if (data?.errors && typeof data.errors === "object") {
    const first = Object.values(data.errors).flat().filter(Boolean)[0];
    if (first) return String(first);
  }
  return data?.message || fallback;
};

export const isValidIpAddress = (value) => {
  const text = String(value || "").trim();
  const ipv4 =
    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
  const ipv6 =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::1|::|([0-9a-fA-F]{1,4}:){1,7}:|:([0-9a-fA-F]{1,4}:){1,7}|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})$/;
  return ipv4.test(text) || ipv6.test(text);
};

export const validateAttendanceMethodForm = (values) => {
  if (!values.method) return "Attendance method is required.";

  if (values.method === "ip_address") {
    const ips = (values.ip_addresses || []).map((item) => String(item || "").trim()).filter(Boolean);
    if (!ips.length) return "Add at least one IP address.";
    if (ips.some((ip) => !isValidIpAddress(ip))) return "Please enter valid IPv4 or IPv6 addresses.";
  }

  if (values.method === "geo_fenced") {
    const latitude = Number(values.latitude);
    const longitude = Number(values.longitude);
    const radius = Number(values.radius_meters);

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      return "Latitude must be between -90 and 90.";
    }
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      return "Longitude must be between -180 and 180.";
    }
    if (!Number.isFinite(radius) || radius <= 0) {
      return "Radius must be a positive number.";
    }
  }

  return "";
};

export const buildAttendanceMethodPayload = (values) => {
  const payload = {
    method: values.method,
    is_active: Boolean(values.is_active),
  };

  if (values.method === "ip_address") {
    payload.ip_addresses = (values.ip_addresses || []).map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (values.method === "geo_fenced") {
    payload.latitude = Number(values.latitude);
    payload.longitude = Number(values.longitude);
    payload.radius_meters = Number(values.radius_meters);
  }

  return payload;
};

export const summarizeAttendanceMethod = (method) => {
  if (!method) return "No attendance method assigned.";
  if (method.method === "ip_address") {
    const ips = Array.isArray(method.ip_addresses) ? method.ip_addresses : [];
    return ips.length ? `${ips.length} allowed IP${ips.length > 1 ? "s" : ""}: ${ips.slice(0, 2).join(", ")}${ips.length > 2 ? "..." : ""}` : "No IP addresses configured.";
  }
  if (method.method === "geo_fenced") {
    const lat = method.latitude ?? "-";
    const lng = method.longitude ?? "-";
    const radius = method.radius_meters ?? "-";
    return `Lat ${lat}, Lon ${lng}, Radius ${radius}m`;
  }
  if (method.method === "location_based") return "Uses employee device location during attendance.";
  return "Method configuration unavailable.";
};
