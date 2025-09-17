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

/** Activity colors: prefer built-in palette; fall back to accent slots if you later expose them */
const useActivityColors = () => {
  const theme = useTheme();

  const pick = (primaryKey, accentKey) => {
    const main =
      theme.palette[accentKey]?.main ??
      theme.palette[primaryKey]?.main ??
      theme.palette.primary.main;

    return {
      bg: alpha(main, 0.16),
      fg: main,
    };
  };

  return {
    call: pick("error", "redAccent"),
    whatsapp: pick("info", "blueAccent"),
    visit: pick("primary", "purpleAccent"), // purpleAccent not exposed; primary is safe fallback
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
        "& .MuiChip-icon": { color: palette.fg },
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

  // Brand token(s) from theme
  const brand = theme.palette.blueAccent?.main ?? theme.palette.info.main;
  const brandHover =
    theme.palette.blueAccent?.dark ??
    alpha(brand, 0.9);
  const brandContrast =
    theme.palette.blueAccent?.contrastText ??
    theme.palette.getContrastText(brand);

  const bg = theme.palette.background.default;
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

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return prospects;
    const next = {};
    Object.keys(prospects || {}).forEach((stage) => {
      next[stage] = (prospects[stage] || []).filter((p) =>
        (p.prospect_name || "").toLowerCase().includes(q)
      );
    });
    return next;
  }, [prospects, searchQuery]);

  return (
    <Box sx={{ width: "100%", px: 2, py: 2, bgcolor: bg }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} flexWrap="wrap" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={800} color={textPri} lineHeight={1.1}>
            Leads
          </Typography>
          <Typography variant="body2" color={textSec}>
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
            width: 260,
            "& .MuiOutlinedInput-root": {
              bgcolor: paper,
            },
          }}
        />

        <Box sx={{ ml: "auto", display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            onClick={() => navigate("/add-prospect")}
            sx={{
              bgcolor: brand,
              color: brandContrast,
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
          <Box sx={{ display: "flex", gap: 2, minWidth: "max-content", pb: 2 }}>
            {statuses.map((status) => {
              const list = filtered[status.stage_name] || [];
              const stageBg = status.color_code || brand; // API HEX or brand
              const stageFg = theme.palette.getContrastText(stageBg);

              return (
                <Box key={status.id} sx={{ minWidth: 320, flexShrink: 0 }}>
                  {/* Stage header */}
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: 2,
                      p: 1.5,
                      mb: 1.5,
                      bgcolor: stageBg,
                      color: stageFg,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={800}>
                      {status.stage_name} ({list.length})
                    </Typography>
                  </Paper>

                  {/* Column */}
                  <Paper
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      p: 1.5,
                      bgcolor: paper,
                      border: `1px solid ${divider}`,
                    }}
                  >
                    {list.length === 0 ? (
                      <Card
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          p: 2,
                          textAlign: "center",
                          borderStyle: "dashed",
                          color: textSec,
                          bgcolor: "transparent",
                        }}
                      >
                        <Typography variant="body2">No leads in this stage</Typography>
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
                              mb: 2,
                              borderRadius: 3,
                              border: `1px solid ${divider}`,
                              bgcolor: paper,
                              transition: "transform .18s ease, box-shadow .18s ease",
                              "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
                            }}
                          >
                            <CardContent sx={{ pb: 1.5 }}>
                              {/* Title row */}
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="subtitle1" fontWeight={800} color={textPri} noWrap>
                                  #{p.id}: {p.prospect_name}
                                </Typography>
                                {p.is_opportunity === 1 && (
                                  <Tooltip title="Qualified opportunity">
                                    <Box component="img" src={opportunity} alt="Opportunity" sx={{ height: 22 }} />
                                  </Tooltip>
                                )}
                              </Box>

                              {/* address */}
                              {p.address && (
                                <Typography variant="body2" color={textSec} sx={{ mb: 1 }}>
                                  📍 {p.address}
                                </Typography>
                              )}

                              {/* links */}
                              <Box display="flex" flexDirection="column" gap={0.5} mb={1}>
                                {p.website_link && (
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <Language fontSize="small" sx={{ color: brand }} />
                                    <Link
                                      href={
                                        p.website_link.startsWith("http")
                                          ? p.website_link
                                          : `https://${p.website_link}`
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      underline="hover"
                                      variant="body2"
                                      sx={{ color: brand, wordBreak: "break-all" }}
                                    >
                                      {p.website_link}
                                    </Link>
                                  </Box>
                                )}
                                {p.linkedin_link && (
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <LinkedIn fontSize="small" sx={{ color: brand }} />
                                    <Link
                                      href={
                                        p.linkedin_link.startsWith("http")
                                          ? p.linkedin_link
                                          : `https://${p.linkedin_link}`
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      underline="hover"
                                      variant="body2"
                                      sx={{ color: brand, wordBreak: "break-all" }}
                                    >
                                      {p.linkedin_link}
                                    </Link>
                                  </Box>
                                )}
                              </Box>

                              {/* meta */}
                              <Box>
                                <Typography variant="body2" color={textSec}>
                                  <strong>Industry:</strong>{" "}
                                  {p.industry_type?.industry_type_name || "N/A"}
                                </Typography>
                                <Typography variant="body2" color={textSec}>
                                  <strong>Interested On:</strong>{" "}
                                  {p.interested_for?.product_name || "N/A"}
                                </Typography>
                                <Typography variant="body2" color={textSec}>
                                  <strong>Source:</strong>{" "}
                                  {p.information_source?.information_source_name || "N/A"}
                                </Typography>
                                <Typography variant="body2" color={textSec}>
                                  <strong>Zone:</strong> {p.zone?.zone_name || "N/A"}
                                </Typography>
                                <Typography variant="body2" color={textSec}>
                                  <strong>Last Activity:</strong>{" "}
                                  {p.last_activity
                                    ? dayjs(p.last_activity).format("MMM D, YYYY")
                                    : "N/A"}
                                </Typography>
                                <Typography variant="body2" color={textSec}>
                                  <strong>Next Activity:</strong>{" "}
                                  {p.next_activity
                                    ? dayjs(p.next_activity).format("MMM D, YYYY")
                                    : "N/A"}
                                </Typography>
                              </Box>

                              {/* contact */}
                              <Paper
                                variant="outlined"
                                sx={{
                                  mt: 1.5,
                                  p: 1,
                                  borderRadius: 2,
                                  bgcolor: alpha(brand, 0.04),
                                  border: `1px solid ${alpha(brand, 0.2)}`,
                                }}
                              >
                                <Typography variant="caption" fontWeight={800} color={textSec}>
                                  Initial Contact
                                </Typography>
                                <Box display="flex" alignItems="center" mt={1}>
                                  {firstPerson ? (
                                    <>
                                      <Avatar
                                        src={
                                          firstPerson.photo
                                            ? `${base_url}/storage/${firstPerson.photo}`
                                            : undefined
                                        }
                                        sx={{ width: 30, height: 30, mr: 1 }}
                                      />
                                      <Typography variant="body2" color={textPri}>
                                        {firstPerson.person_name}
                                      </Typography>
                                    </>
                                  ) : (
                                    <Typography variant="body2" color={textSec}>
                                      No contact person
                                    </Typography>
                                  )}
                                </Box>
                              </Paper>

                              {/* activity */}
                              <Box display="flex" flexWrap="wrap" gap={1} mt={1.5}>
                                <ActivityChip type="call" icon={<Call fontSize="small" />} label="Calls" count={activity.call} />
                                <ActivityChip type="whatsapp" icon={<Message fontSize="small" />} label="Messages" count={activity.whatsapp} />
                                <ActivityChip type="visit" icon={<LocationOn fontSize="small" />} label="Visits" count={activity.visit} />
                                <ActivityChip type="email" icon={<Email fontSize="small" />} label="Emails" count={activity.email} />
                                <ActivityChip type="task" icon={<AssignmentTurnedIn fontSize="small" />} label="Tasks" count={activity.task} />
                              </Box>
                            </CardContent>

                            <Box px={2} pb={2}>
                              <Button
                                variant="contained"
                                fullWidth
                                size="small"
                                onClick={() => navigate(`/prospect-detail/${p.id}`)}
                                sx={{
                                  bgcolor: brand,
                                  color: brandContrast,
                                  borderRadius: 2,
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
