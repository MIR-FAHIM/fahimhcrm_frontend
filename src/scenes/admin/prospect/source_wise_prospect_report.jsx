import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress } from "@mui/material";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  sourceWiseProspectController,
} from "../../../api/controller/admin_controller/prospect_controller";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#845EC2'];

const SourceWiseProspectPie = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await sourceWiseProspectController();
      const apiData = response?.data || {};

      // Transforming data from { Facebook: {count: 6}, ... } to [{ name: "Facebook", value: 6 }, ...]
      const formattedData = Object.entries(apiData).map(([source, info]) => ({
        name: source,
        value: info.count,
      }));

      setChartData(formattedData);
    } catch (error) {
      console.error("Failed to fetch reports", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  if (loading) {
    return <div>Loading chart...</div>;
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
             <Typography variant="h5" gutterBottom>
        SourceWise Leads Generation
      </Typography>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SourceWiseProspectPie;
