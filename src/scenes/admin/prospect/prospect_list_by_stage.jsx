// src/scenes/prospect/ProspectListByStage.jsx
import React, { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

import {
  Box,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  Link,
  Avatar,
  Button,
  useTheme,
  Tooltip,
  TextField,
  Chip,
  Paper,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
} from "@mui/material";
import {
  Language,
  LinkedIn,
  Call,
  Message,
  LocationOn,
  Email,
  AssignmentTurnedIn,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";

import {
  fetchAllProspectByStage,
  getProspectAllStatus,
} from "../../../api/controller/admin_controller/prospect_controller";
import { base_url } from "../../../api/config";
import opportunity from "../../../assets/images/opportunity.png";

/** Activity colors */
const useActivityColors = () => {
  const theme = useTheme();
  const pick = (primaryKey, accentKey) => {
    const main =
      theme.palette[accentKey]?.main ??
      theme.palette[primaryKey]?.main ??
      theme.palette.primary.main;
    return { bg: alpha(main, 0.16), fg: main };
  };
  return {
    call: pick("error", "redAccent"),
    whatsapp: pick("info", "blueAccent"),
    visit: pick("primary", "purpleAccent"),
    email: pick("warning", "orangeAccent"),
    task: pick("success", "greenAccent"),
  };
};

const ActivityChip = ({ icon, label, count, type }) => {
  const palette = useActivityColors()[type] || {};
  return (
    <Chip
      icon={icon}
      label={`${count || 0} ${label}`}
      size="small"
      sx={{
        bgcolor: palette.bg,
        color: palette.fg,
        fontWeight: 700,
        height: 24,
        "& .MuiChip-icon": { color: palette.fg },
        "& .MuiChip-label": { px: 0.75 },
      }}
    />
  );
};

const ProspectListByStage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [prospects, setProspects] = useState({});
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [infoSourceFilter, setInfoSourceFilter] = useState("all");

  // Brand tokens
  const brand = theme.palette.blueAccent?.main ?? theme.palette.info.main;
  const brandHover = theme.palette.blueAccent?.dark ?? alpha(brand, 0.9);
  const brandContrast =
    theme.palette.blueAccent?.contrastText ??
    theme.palette.getContrastText(brand);

  const paper = theme.palette.background.paper;
  const divider = theme.palette.divider;
  const textPri = theme.palette.text.primary;
  const textSec = theme.palette.text.secondary;

  useEffect(() => {
    (async () => {
      try {
        const [pRes, sRes] = await Promise.all([
          fetchAllProspectByStage(),
          getProspectAllStatus(),
        ]);
        setProspects(pRes?.data || {});
        setStatuses(sRes?.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Build Information Source options from returned prospects
  const infoSources = useMemo(() => {
    const map = new Map(); // id -> name
    Object.values(prospects || {}).forEach((arr) => {
      (arr || []).forEach((p) => {
        const id = p?.information_source_id ?? p?.information_source?.id;
        const name =
          p?.information_source?.information_source_name ??
          p?.information_source_name ??
          (id != null ? `Source ${id}` : null);
        if (id != null && name) map.set(String(id), name);
      });
    });
    return [{ id: "all", name: "All sources" }, ...Array.from(map, ([id, name]) => ({ id, name }))];
  }, [prospects]);

  // Filter by search + information_source_id
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const sourceId = String(infoSourceFilter);
    const next = {};
    Object.keys(prospects || {}).forEach((stage) => {
      next[stage] = (prospects[stage] || []).filter((p) => {
        // info source filter
        const pSourceId = String(
          p?.information_source_id ?? p?.information_source?.id ?? ""
        );
        if (sourceId !== "all" && pSourceId !== sourceId) return false;

        // search filter
        if (!q) return true;
        const hay = [
          p?.prospect_name,
          p?.address,
          p?.industry_type?.industry_type_name,
          p?.interested_for?.product_name,
          p?.information_source?.information_source_name,
          p?.zone?.zone_name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    });
    return next;
  }, [prospects, searchQuery, infoSourceFilter]);

  return (
    <Box
      sx={{
        width: { xs: "100%", lg: "100%" },   // ✅ page width 80% on large screens
        mx: "auto",
        px: { xs: 1.5, md: 2 },
        py: 2,
      }}
    >
      {/* Header / Controls */}
      <Box
        display="flex"
        alignItems="center"
        gap={1.25}
        flexWrap="wrap"
        mb={2}
      >
        <Box mr={2} mb={0.5}>
          <Typography variant="h5" fontWeight={800} color={textPri} lineHeight={1.15}>
            Leads
          </Typography>
          <Typography variant="caption" color={textSec}>
            Pipeline grouped by stage
          </Typography>
        </Box>

        <TextField
          size="small"
          variant="outlined"
          placeholder="Search leads"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            width: { xs: "100%", sm: 240 },
            "& .MuiOutlinedInput-root": { bgcolor: paper, height: 36 },
          }}
        />

        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="info-source-label">Information Source</InputLabel>
          <Select
            labelId="info-source-label"
            label="Information Source"
            value={infoSourceFilter}
            onChange={(e) => setInfoSourceFilter(e.target.value)}
            MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
          >
            {infoSources.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ ml: "auto", display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            onClick={() => navigate("/add-prospect")}
            sx={{
              bgcolor: brand,
              color: brandContrast,
              height: 36,
              px: 2,
              "&:hover": { bgcolor: brandHover },
            }}
          >
            Add Prospect
          </Button>
          <Button
            variant="outlined"
            onClick={() => window.location.reload()}
            sx={{
              borderColor: brand,
              color: brand,
              height: 36,
              px: 2,
              "&:hover": { bgcolor: alpha(brand, 0.12), borderColor: brand },
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/prospect-list")}
            sx={{
              bgcolor: brand,
              color: brandContrast,
              height: 36,
              px: 2,
              "&:hover": { bgcolor: brandHover },
            }}
          >
            Table View
          </Button>
        </Box>
      </Box>

      {/* Content */}
      {loading ? (
        <Box height="60vh" display="grid" placeItems="center">
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <Box sx={{ display: "flex", gap: 1.5, minWidth: "max-content", pb: 1.5 }}>
            {statuses.map((status) => {
              const list = filtered[status.stage_name] || [];
              const stageBg = status.color_code || brand;
              const stageFg = theme.palette.getContrastText(stageBg);

              return (
                <Box key={status.id} sx={{ minWidth: 280, flexShrink: 0 }}>
                  {/* Stage header */}
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: 1.5,
                      p: 1,
                      mb: 1,
                      bgcolor: stageBg,
                      color: stageFg,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={800} noWrap>
                      {status.stage_name} ({list.length})
                    </Typography>
                  </Paper>

                  {/* Column */}
                  <Paper
                    variant="outlined"
                    sx={{
                      borderRadius: 1.5,
                      p: 1,
                      bgcolor: paper,
                      border: `1px solid ${divider}`,
                    }}
                  >
                    {list.length === 0 ? (
                      <Card
                        variant="outlined"
                        sx={{
                          borderRadius: 1.5,
                          p: 1.25,
                          textAlign: "center",
                          borderStyle: "dashed",
                          color: textSec,
                          bgcolor: "transparent",
                        }}
                      >
                        <Typography variant="caption">No leads in this stage</Typography>
                      </Card>
                    ) : (
                      list.map((p) => {
                        const firstPerson = p?.concern_persons?.[0];
                        const activity = p?.activity_summary || {};
                        return (
                          <Card
                            key={p.id}
                            variant="outlined"
                            sx={{
                              mb: 1.25,
                              borderRadius: 2,
                              border: `1px solid ${divider}`,
                              bgcolor: paper,
                              transition: "transform .16s ease, box-shadow .16s ease",
                              "&:hover": { transform: "translateY(-1px)", boxShadow: 2 },
                            }}
                          >
                            <CardContent sx={{ p: 1.25, pb: 1 }}>
                              {/* Title row */}
                              <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={0.5}
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight={800}
                                  color={textPri}
                                  noWrap
                                  title={p.prospect_name}
                                >
                                  #{p.id}: {p.prospect_name}
                                </Typography>
                                {p.is_opportunity === 1 && (
                                  <Tooltip title="Qualified opportunity">
                                    <Box
                                      component="img"
                                      src={opportunity}
                                      alt="Opportunity"
                                      sx={{ height: 18 }}
                                    />
                                  </Tooltip>
                                )}
                              </Box>

                              {/* address */}
                              {p.address && (
                                <Typography
                                  variant="caption"
                                  color={textSec}
                                  sx={{ display: "block", mb: 0.5 }}
                                >
                                  📍 {p.address}
                                </Typography>
                              )}

                              {/* links (compact) */}
                              <Box display="flex" flexDirection="column" gap={0.25} mb={0.75}>
                                {p.website_link && (
                                  <Box display="flex" alignItems="center" gap={0.75}>
                                    <Language fontSize="inherit" sx={{ color: brand }} />
                                    <Link
                                      href={
                                        p.website_link.startsWith("http")
                                          ? p.website_link
                                          : `https://${p.website_link}`
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      underline="hover"
                                      variant="caption"
                                      sx={{ color: brand, wordBreak: "break-all" }}
                                    >
                                      {p.website_link}
                                    </Link>
                                  </Box>
                                )}
                                {p.linkedin_link && (
                                  <Box display="flex" alignItems="center" gap={0.75}>
                                    <LinkedIn fontSize="inherit" sx={{ color: brand }} />
                                    <Link
                                      href={
                                        p.linkedin_link.startsWith("http")
                                          ? p.linkedin_link
                                          : `https://${p.linkedin_link}`
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      underline="hover"
                                      variant="caption"
                                      sx={{ color: brand, wordBreak: "break-all" }}
                                    >
                                      {p.linkedin_link}
                                    </Link>
                                  </Box>
                                )}
                              </Box>

                              {/* meta (compact rows) */}
                              <Box sx={{ display: "grid", gridTemplateColumns: "1fr", rowGap: 0.25 }}>
                                <Typography variant="caption" color={textSec}>
                                  <strong>Industry:</strong>{" "}
                                  {p.industry_type?.industry_type_name || "N/A"}
                                </Typography>
                                <Typography variant="caption" color={textSec}>
                                  <strong>Interested On:</strong>{" "}
                                  {p.interested_for?.product_name || "N/A"}
                                </Typography>
                                <Typography variant="caption" color={textSec}>
                                  <strong>Source:</strong>{" "}
                                  {p.information_source?.information_source_name || "N/A"}
                                </Typography>
                                <Typography variant="caption" color={textSec}>
                                  <strong>Zone:</strong> {p.zone?.zone_name || "N/A"}
                                </Typography>
                                <Typography variant="caption" color={textSec}>
                                  <strong>Last Activity:</strong>{" "}
                                  {p.last_activity
                                    ? dayjs(p.last_activity).format("MMM D, YYYY")
                                    : "N/A"}
                                </Typography>
                              </Box>

                              {/* contact (tight) */}
                              <Paper
                                variant="outlined"
                                sx={{
                                  mt: 1,
                                  p: 0.75,
                                  borderRadius: 1.5,
                                  bgcolor: alpha(brand, 0.04),
                                  border: `1px solid ${alpha(brand, 0.2)}`,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  fontWeight={800}
                                  color={textSec}
                                  sx={{ display: "block" }}
                                >
                                  Initial Contact
                                </Typography>
                                <Box display="flex" alignItems="center" mt={0.5}>
                                  {firstPerson ? (
                                    <>
                                      <Avatar
                                        src={
                                          firstPerson.photo
                                            ? `${base_url}/storage/${firstPerson.photo}`
                                            : undefined
                                        }
                                        sx={{ width: 26, height: 26, mr: 0.75 }}
                                      />
                                      <Typography variant="caption" color={textPri}>
                                        {firstPerson.person_name}
                                      </Typography>
                                    </>
                                  ) : (
                                    <Typography variant="caption" color={textSec}>
                                      No contact person
                                    </Typography>
                                  )}
                                </Box>
                              </Paper>

                              {/* activity (small chips) */}
                              <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
                                <ActivityChip type="call" icon={<Call fontSize="inherit" />} label="Calls" count={activity.call} />
                                <ActivityChip type="whatsapp" icon={<Message fontSize="inherit" />} label="Messages" count={activity.whatsapp} />
                                <ActivityChip type="visit" icon={<LocationOn fontSize="inherit" />} label="Visits" count={activity.visit} />
                                <ActivityChip type="email" icon={<Email fontSize="inherit" />} label="Emails" count={activity.email} />
                                <ActivityChip type="task" icon={<AssignmentTurnedIn fontSize="inherit" />} label="Tasks" count={activity.task} />
                              </Box>
                            </CardContent>

                            <Box px={1.25} pb={1.25}>
                              <Button
                                variant="contained"
                                fullWidth
                                size="small"
                                onClick={() => navigate(`/prospect-detail/${p.id}`)}
                                sx={{
                                  bgcolor: brand,
                                  color: brandContrast,
                                  borderRadius: 1.25,
                                  height: 30,
                                  minHeight: 30,
                                  fontSize: 12,
                                  "&:hover": { bgcolor: brandHover },
                                }}
                              >
                                View Details
                              </Button>
                            </Box>
                          </Card>
                        );
                      })
                    )}
                  </Paper>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ProspectListByStage;
