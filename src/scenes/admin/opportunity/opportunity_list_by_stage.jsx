import React, { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import {
  Box,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  Button,
  useTheme,
  TextField,
  Chip,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getOpportunityByStage } from "../../../api/controller/admin_controller/opportunity_controller";
import { getProspectAllStatus } from "../../../api/controller/admin_controller/prospect_controller";
import { tokens } from "../../../theme";

const FieldChip = ({ label, value, color, variant = "outlined" }) => (
  <Chip
    size="small"
    label={
      <Box component="span" sx={{ display: "inline-flex", gap: 0.5 }}>
        <Box component="span" sx={{ fontWeight: 600 }}>{label}:</Box>
        <Box component="span">{value ?? "N/A"}</Box>
      </Box>
    }
    sx={{ mr: 1, mb: 1, color }}
    variant={variant}
  />
);

const OpportunityByStage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [opportunities, setOpportunities] = useState({}); // grouped by stage_name
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [oppRes, statusRes] = await Promise.all([
        getOpportunityByStage(),
        getProspectAllStatus(),
      ]);
      setOpportunities(oppRes?.data || {});
      setStatuses(statusRes?.data || []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to load opportunities/statuses", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredByStage = (stageName) => {
    const list = opportunities?.[stageName] || [];
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((o) => {
      const name = o?.prospect?.prospect_name || "";
      const details = o?.details || "";
      const note = o?.note || "";
      return [name, details, note].some((t) => String(t).toLowerCase().includes(q));
    });
  };

  const stageCounts = useMemo(() => {
    const map = {};
    statuses.forEach((s) => {
      map[s.stage_name] = (opportunities?.[s.stage_name] || []).length;
    });
    return map;
  }, [statuses, opportunities]);

  return (
    <Box sx={{ width: "100%", overflowX: "auto", p: 2, bgcolor: theme.palette.background.default }}>
      {/* Toolbar */}
      <Box display="flex" alignItems="center" flexWrap="wrap" gap={2} mb={4}>
        <Typography variant="h5" fontWeight={700} sx={{ color: colors.gray[100] }}>
          🎯 Opportunities
        </Typography>

        <TextField
          size="small"
          variant="outlined"
          placeholder="🔍 Search opportunities"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            width: 280,
            "& .MuiOutlinedInput-root": {
              backgroundColor: theme.palette.background.paper,
              color: colors.gray[100],
            },
            "& .MuiInputLabel-root": { color: colors.gray[400] },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: colors.gray[700] },
          }}
        />

        <Button
          variant="outlined"
          onClick={fetchData}
          sx={{
            ml: "auto",
            color: colors.blueAccent[500],
            borderColor: colors.blueAccent[500],
            "&:hover": { bgcolor: colors.blueAccent[700], color: colors.primary[900] },
          }}
        >
          🔄 Refresh
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <Box sx={{ display: "flex", gap: 2, minWidth: "max-content", pb: 2 }}>
            {statuses.map((status) => {
              const stageName = status.stage_name;
              const list = filteredByStage(stageName);
              return (
                <Box key={status.id} sx={{ minWidth: 320, flexShrink: 0 }}>
                  {/* Stage header */}
                  <Box sx={{
                    backgroundColor: status.color_code || colors.primary[600],
                    borderRadius: 2,
                    p: 2,
                    mb: 2,
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: colors.gray[500] }}>
                      {stageName} ({stageCounts[stageName] || 0})
                    </Typography>
                  </Box>

                  {/* Cards */}
                  <Box sx={{
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 2,
                    p: 2,
                    boxShadow: theme.shadows[2],
                  }}>
                    {list.map((o) => (
                      <Card
                        key={o.id}
                        sx={{
                          width: 300,
                          mb: 3,
                          px: 2.5,
                          py: 2,
                          borderRadius: 3,
                          border: `1px solid ${theme.palette.divider}`,
                          boxShadow: theme.shadows[2],
                          backgroundColor: colors.gray[900],
                          transition: "transform 0.2s, box-shadow 0.2s",
                          "&:hover": { boxShadow: theme.shadows[5], transform: "scale(1.015)" },
                        }}
                      >
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="h6" fontWeight={800} sx={{ color: colors.gray[100] }}>
                              #{o.id}: {o?.prospect?.prospect_name || "Unnamed"}
                            </Typography>
                            {o?.prospect_id && (
                              <Link
                                onClick={() => navigate(`/prospect-detail/${o.prospect_id}`)}
                                underline="hover"
                                sx={{ cursor: "pointer", color: colors.blueAccent[300], fontSize: 12 }}
                              >
                                view lead
                              </Link>
                            )}
                          </Box>

                          {o?.details && (
                            <Typography variant="body1" sx={{ color: colors.gray[300], mb: 1.5 }}>
                              {o.details}
                            </Typography>
                          )}

                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                            <FieldChip label="Closing" value={dayjs(o.closing_date).isValid() ? dayjs(o.closing_date).format("MMM D, YYYY") : "N/A"} color={colors.gray[200]} />
                            <FieldChip label="Amount" value={o.expected_amount} color={colors.gray[200]} />
                            <FieldChip label="Priority" value={o.priority_id} color={colors.gray[200]} />
                            <FieldChip label="Status" value={o.status} color={colors.gray[200]} />
                          </Box>

                          {o?.note && (
                            <Typography variant="body2" sx={{ color: colors.gray[400], mt: 1 }}>
                              <strong>Note:</strong> {o.note}
                            </Typography>
                          )}
                        </CardContent>

                        <Box px={2} pb={2}>
                          <Button
                            variant="contained"
                            fullWidth
                            size="small"
                            onClick={() => navigate(`/opportunity-tabs/${o.id}`)}
                            sx={{ bgcolor: colors.greenAccent[500], color: colors.gray[500], "&:hover": { bgcolor: colors.greenAccent[700] } }}
                          >
                            View Details
                          </Button>
                        </Box>
                      </Card>
                    ))}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default OpportunityByStage;
