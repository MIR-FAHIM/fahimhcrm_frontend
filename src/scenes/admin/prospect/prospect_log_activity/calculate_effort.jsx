import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  getEffortCalculation,
} from "../../../../api/controller/admin_controller/prospect_controller";
import { useNavigate } from "react-router-dom";


export default function EffortOverview() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  const handleViewProspectDetails = (id) => {
    navigate(`/prospect-detail/${id}`);
  };
  useEffect(() => {
    (async () => {
      try {
        const response = await getEffortCalculation();
        if (response?.status === "success") {
          const sortedProspects = response.prospect_efforts.sort(
            (a, b) => b.effort - a.effort
          );

          setData({
            total_effort: response.total_effort,
            prospect_efforts: sortedProspects,
            activity_type_overview: response.activity_type_overview,
          });
        }
      } catch (err) {
        console.error("Fetch error", err);
      }
    })();
  }, []);

  if (!data) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      {/* Total Overview */}
      <Card sx={{ mb: 4 }}>
  <CardContent>
    <Grid container spacing={2} justifyContent="space-between">
      <Grid item xs={12} md={8}>
        <Typography variant="h5" gutterBottom>
          🚀 Total Effort Overview
        </Typography>
        <Typography variant="h6">Total Effort: {data.total_effort}</Typography>
        <Grid container spacing={2} mt={2}>
          {Object.entries(data.activity_type_overview).map(([type, stats]) => (
            <Grid item xs={12} sm={6} md={4} key={type}>
              <Card sx={{ backgroundColor: "#f9f9f9" }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {type.toUpperCase()}
                  </Typography>
                  <Typography>Count: {stats.count}</Typography>
                  <Typography>Effort: {stats.effort}</Typography>
                  <Chip
                    label={`${stats.percentage.toFixed(2)}%`}
                    color="primary"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* Effort Points Table */}
      <Grid item xs={12} md={4}>
  <Box
    sx={{
      backgroundColor: "#f3f6f9",
      borderRadius: 2,
      p: 2,
      boxShadow: 1,
      height: "100%",
    }}
  >
    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
      🎯 Effort Points
    </Typography>
    {[
      { type: "general", point: 1, color: "#e3f2fd", icon: "📌" },
      { type: "task", point: 1, color: "#e8f5e9", icon: "✅" },
      { type: "call", point: 1, color: "#fff3e0", icon: "📞" },
      { type: "email", point: 1, color: "#ede7f6", icon: "✉️" },
      { type: "whatsapp", point: 1, color: "#e0f7fa", icon: "🟢" },
      { type: "message", point: 1, color: "#fce4ec", icon: "💬" },
      { type: "meeting", point: 3, color: "#f3e5f5", icon: "🧑‍💼" },
      { type: "visit", point: 6, color: "#fffde7", icon: "🚗" },
    ].map(({ type, point, color, icon }) => (
      <Box
        key={type}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: color,
          borderRadius: 1,
          px: 1.5,
          py: 0.75,
          mb: 0.75,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography>{icon}</Typography>
          <Typography variant="body2" fontWeight="medium">
            {type.toUpperCase()}
          </Typography>
        </Box>
        <Typography variant="body2" fontWeight="bold">
          {point}
        </Typography>
      </Box>
    ))}
  </Box>
</Grid>

    </Grid>
  </CardContent>
</Card>


      {/* Prospect-wise Table */}
      <Typography variant="h6" gutterBottom>
        📋 Prospect-wise Effort Table
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
            <TableRow>
              <TableCell><strong>Prospect Name</strong></TableCell>
              <TableCell><strong>Stage</strong></TableCell>
              <TableCell><strong>Total Effort</strong></TableCell>
              <TableCell><strong>Contribution (%)</strong></TableCell>
              <TableCell><strong>Activities</strong></TableCell>
              <TableCell><strong>Activities</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.prospect_efforts.map((prospect) => (
              <TableRow key={prospect.prospect_id}>
                <TableCell>{prospect.prospect_name}</TableCell>
                <TableCell>{prospect.stage.stage_name}</TableCell>
                <TableCell>{prospect.effort}</TableCell>
                <TableCell>{prospect.percentage.toFixed(2)}%</TableCell>
                <TableCell>
                  {Object.entries(prospect.activities).map(
                    ([type, count], idx) => (
                      <Chip
                        key={idx}
                        label={`${type.toUpperCase()}: ${count}`}
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    )
                  )}
                </TableCell>
                <TableCell>
                <Button
          variant="contained"
          color="primary"
          sx={{ borderRadius: "20px", textTransform: "none", fontSize: "14px", fontWeight: "bold" }}
          onClick={() => handleViewProspectDetails(prospect.prospect_id)}
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
