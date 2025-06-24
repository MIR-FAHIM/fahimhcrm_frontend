import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, CircularProgress,Divider } from "@mui/material";
import SourceWiseProspectPie from "./source_wise_prospect_report";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  fetchMonthlyProspectController,
  fetchWeeklyProspectController,
} from "../../../api/controller/admin_controller/prospect_controller";

const ProspectReportMonthWise = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaryText, setSummaryText] = useState("");

  const formatMonth = (ym) => {
    const [year, month] = ym.split("-");
    const date = new Date(year, month - 1);
    return date.toLocaleString("default", { month: "short", year: "numeric" });
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const monthlyRes = await fetchMonthlyProspectController();
      const formattedMonthly = monthlyRes.data.map((item) => ({
        month: formatMonth(item.month),
        count: item.count,
      }));

      const weeklyRes = await fetchWeeklyProspectController();
      const formattedWeekly = weeklyRes.data.map((item) => ({
        week: item.month_label + ' Week ' + item.week ,
        count: item.count,
      }));

      setMonthlyData(formattedMonthly);
      setWeeklyData(formattedWeekly);
      generateSummary(formattedMonthly, formattedWeekly);
    } catch (error) {
      console.error("Failed to fetch reports", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = (months, weeks) => {
    if (!months.length || !weeks.length) return;

    const lastMonth = months[months.length - 1];
    const currentMonth = months[months.length - 2];
    const monthChange = currentMonth
      ? currentMonth.count - lastMonth.count
      : 0;

    const lastWeek = weeks[weeks.length - 1];
    const currentWeek = weeks[weeks.length - 2];
    const weekChange = currentWeek
      ? currentWeek.count - lastWeek.count
      : 0;

    const summary = `
      In ${currentMonth?.month || "N/A"}, ${currentMonth?.count || 0} prospects were onboarded.
      Compared to ${lastMonth?.month || "previous month"}, the change is ${monthChange >= 0 ? "+" : ""}${monthChange}.

      Last week (${currentWeek?.week || "N/A"}): ${currentWeek?.count || 0} onboardings.
      Previous week (${lastWeek?.week || "N/A"}): ${lastWeek?.count || 0} — a ${weekChange >= 0 ? "rise" : "drop"} of ${Math.abs(weekChange)}.
    `;
    setSummaryText(summary.trim());
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  return (
    <Box p={3}>
        <SourceWiseProspectPie/>
        <Divider sx={{ my: 2 }} /> {/* Adds vertical space between boxes */}
      <Typography variant="h5" gutterBottom>
        Leads Onboarding Summary
      </Typography>
      <Paper sx={{ p: 2, mb: 4 }}>
        {loading ? (
          <CircularProgress />
        ) : (
          <Typography variant="body1" whiteSpace="pre-line">
            {summaryText}
          </Typography>
        )}
      </Paper>

      <Typography variant="h6">Monthly Onboarded Leads</Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        {loading ? (
          <CircularProgress />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#1976d2" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Paper>

      <Typography variant="h6" sx={{ mt: 5 }}>
        Weekly Onboarded Leads
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        {loading ? (
          <CircularProgress />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#43a047" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Paper>
    </Box>
  );
};

export default ProspectReportMonthWise;
