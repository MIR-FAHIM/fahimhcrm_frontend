// src/scenes/analytics/EffortOverview.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  Button,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  useTheme,
  Skeleton,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { getEffortCalculation } from "../../../../api/controller/admin_controller/prospect_controller";
import { useNavigate } from "react-router-dom";

export default function EffortOverview() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

  // Brand accents (from your theme)
  const brand = theme.palette.blueAccent?.main ?? theme.palette.info.main;
  const brandHover = theme.palette.blueAccent?.dark ?? brand;
  const brandContrast =
    theme.palette.blueAccent?.contrastText ??
    theme.palette.getContrastText(brand);

  const paper = theme.palette.background.paper;
  const bg = theme.palette.background.default;
  const divider = theme.palette.divider;
  const textPri = theme.palette.text.primary;
  const textSec = theme.palette.text.secondary;

  const handleViewProspectDetails = (id) => {
    navigate(`/prospect-detail/${id}`);
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await getEffortCalculation();
        if (response?.status === "success") {
          const sortedProspects = (response.prospect_efforts || []).sort(
            (a, b) => b.effort - a.effort
          );

          setData({
            total_effort: response.total_effort,
            prospect_efforts: sortedProspects,
            activity_type_overview: response.activity_type_overview || {},
          });
        }
      } catch (err) {
        console.error("Fetch error", err);
      }
    })();
  }, []);

  // Smart color mapping for activity types -> semantic palette keys
  const getTypeColor = (type) => {
    const map = {
      general: theme.palette.primary.main,
      task: theme.palette.success.main,
      call: theme.palette.error.main,
      email: theme.palette.warning.main,
      whatsapp: theme.palette.info.main,
      message: theme.palette.info.main,
      meeting: theme.palette.primary.main,
      visit: theme.palette.primary.main,
    };
    return map[type] || theme.palette.primary.main;
  };

  const activityCards = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.activity_type_overview);
  }, [data]);

  if (!data) {
    // pleasant, theme-aware skeletons
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width={240} height={36} />
        <Skeleton variant="rounded" height={160} sx={{ mt: 2, borderRadius: 2 }} />
        <Skeleton variant="text" width={220} height={28} sx={{ mt: 3 }} />
        <Skeleton variant="rounded" height={320} sx={{ mt: 1.5, borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: bg }}>
      {/* Total Overview */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 2,
          bgcolor: paper,
          border: `1px solid ${divider}`,
        }}
      >
        <CardContent>
          <Grid container spacing={3} alignItems="stretch">
            {/* Left: KPIs + activity breakdown */}
            <Grid item xs={12} md={8}>
              <Typography variant="h5" fontWeight={800} color={textPri} gutterBottom>
                Effort Overview
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Chip
                  label={`Total Effort: ${data.total_effort}`}
                  sx={{
                    bgcolor: alpha(brand, 0.12),
                    color: brand,
                    fontWeight: 700,
                  }}
                />
              </Box>

              <Grid container spacing={2} mt={0.5}>
                {activityCards.map(([type, stats]) => {
                  const c = getTypeColor(type);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={type}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: paper,
                          border: `1px solid ${divider}`,
                          height: "100%",
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight={800} color={textPri}>
                          {type.toUpperCase()}
                        </Typography>
                        <Typography variant="body2" color={textSec}>
                          Count: <strong>{stats.count}</strong>
                        </Typography>
                        <Typography variant="body2" color={textSec}>
                          Effort: <strong>{stats.effort}</strong>
                        </Typography>

                        {/* Percentage chip + micro progress */}
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            label={`${Number(stats.percentage).toFixed(2)}%`}
                            size="small"
                            sx={{
                              bgcolor: alpha(c, 0.16),
                              color: c,
                              fontWeight: 700,
                            }}
                          />
                          <LinearProgress
                            variant="determinate"
                            value={Number(stats.percentage)}
                            sx={{
                              mt: 1,
                              height: 6,
                              borderRadius: 999,
                              backgroundColor: alpha(c, 0.12),
                              "& .MuiLinearProgress-bar": {
                                backgroundColor: c,
                              },
                            }}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>

            {/* Right: Effort Points legend */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  bgcolor: paper,
                  borderRadius: 2,
                  p: 2,
                  height: "100%",
                  border: `1px solid ${divider}`,
                }}
              >
                <Typography variant="subtitle1" fontWeight={800} color={textPri} gutterBottom>
                  Effort Points
                </Typography>
                {[
                  { type: "general", point: 1, icon: "📌" },
                  { type: "task", point: 1, icon: "✅" },
                  { type: "call", point: 1, icon: "📞" },
                  { type: "email", point: 1, icon: "✉️" },
                  { type: "whatsapp", point: 1, icon: "🟢" },
                  { type: "message", point: 1, icon: "💬" },
                  { type: "meeting", point: 3, icon: "🧑‍💼" },
                  { type: "visit", point: 6, icon: "🚗" },
                ].map(({ type, point, icon }) => {
                  const c = getTypeColor(type);
                  return (
                    <Box
                      key={type}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        bgcolor: alpha(c, 0.06),
                        borderRadius: 1.5,
                        px: 1.25,
                        py: 0.75,
                        mb: 0.75,
                        border: `1px solid ${alpha(c, 0.22)}`,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography component="span" aria-hidden>
                          {icon}
                        </Typography>
                        <Typography variant="body2" fontWeight={700} color={textPri}>
                          {type.toUpperCase()}
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={800} color={c}>
                        {point}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Prospect-wise Table */}
      <Typography variant="h6" fontWeight={800} color={textPri} gutterBottom>
        Prospect-wise Effort
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          border: `1px solid ${divider}`,
          bgcolor: paper,
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead
            sx={{
              backgroundColor: alpha(brand, 0.12),
              "& th": {
                color: textPri,
                fontWeight: 800,
                borderBottom: `1px solid ${divider}`,
              },
            }}
          >
            <TableRow>
              <TableCell>Prospect Name</TableCell>
              <TableCell>Stage</TableCell>
              <TableCell align="right">Total Effort</TableCell>
              <TableCell align="right">Contribution (%)</TableCell>
              <TableCell>Activities</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.prospect_efforts.map((prospect) => (
              <TableRow
                key={prospect.prospect_id}
                hover
                sx={{
                  "& td": { borderBottom: `1px solid ${divider}` },
                }}
              >
                <TableCell sx={{ maxWidth: 260 }}>
                  <Typography variant="body2" fontWeight={800} color={textPri} noWrap>
                    {prospect.prospect_name}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    label={prospect.stage?.stage_name || "N/A"}
                    size="small"
                    sx={{
                      bgcolor: alpha(brand, 0.14),
                      color: brand,
                      fontWeight: 700,
                    }}
                  />
                </TableCell>

                <TableCell align="right">
                  <Typography variant="body2" fontWeight={700}>
                    {prospect.effort}
                  </Typography>
                </TableCell>

                <TableCell align="right" sx={{ minWidth: 140 }}>
                  <Box>
                    <Typography variant="body2" fontWeight={700}>
                      {Number(prospect.percentage).toFixed(2)}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Number(prospect.percentage)}
                      sx={{
                        mt: 0.5,
                        height: 8,
                        borderRadius: 999,
                        backgroundColor: alpha(brand, 0.12),
                        "& .MuiLinearProgress-bar": { backgroundColor: brand },
                      }}
                    />
                  </Box>
                </TableCell>

                <TableCell sx={{ minWidth: 260 }}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    {Object.entries(prospect.activities).map(([type, count], idx) => {
                      const c = getTypeColor(type);
                      return (
                        <Chip
                          key={`${type}-${idx}`}
                          label={`${type.toUpperCase()}: ${count}`}
                          size="small"
                          sx={{
                            bgcolor: alpha(c, 0.12),
                            color: c,
                            fontWeight: 700,
                          }}
                        />
                      );
                    })}
                  </Box>
                </TableCell>

                <TableCell align="center">
                  <Button
                    variant="contained"
                    onClick={() => handleViewProspectDetails(prospect.prospect_id)}
                    sx={{
                      px: 2.25,
                      borderRadius: 2,
                      bgcolor: brand,
                      color: brandContrast,
                      textTransform: "none",
                      fontWeight: 800,
                      "&:hover": { bgcolor: brandHover },
                    }}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
