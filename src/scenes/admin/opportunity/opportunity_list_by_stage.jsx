import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  Box,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  Button,
  useTheme,
  TextField
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getOpportunityByStage } from "../../../api/controller/admin_controller/opportunity_controller";
import { getProspectAllStatus } from "../../../api/controller/admin_controller/prospect_controller";

const OpportunityByStage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [opportunities, setOpportunities] = useState({});
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchOpportunities();
    fetchStatuses();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const response = await getOpportunityByStage();
      setOpportunities(response.data);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await getProspectAllStatus();
      setStatuses(response.data);
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  const filteredOpportunities = (stageName) => {
    return opportunities[stageName]?.filter(opportunity =>
      opportunity.details.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  };

  return (
    <Box sx={{ width: "100%", overflowX: "auto", padding: 2 }}>
      <Box
        display="flex"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
        mb={4}
      >
        <Typography variant="h5" fontWeight={700}>
          🧭 Opportunities
        </Typography>

        <TextField
          size="small"
          variant="outlined"
          placeholder="🔍 Search opportunities"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 250 }}
        />

       

        <Button variant="outlined" color="secondary" onClick={() => window.location.reload()}>
          🔄 Refresh
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <Box sx={{ display: "flex", gap: 2, minWidth: "max-content", pb: 2 }}>
            {statuses.map((status) => (
              <Box key={status.id} sx={{ minWidth: 300, flexShrink: 0 }}>
                <Box
                  sx={{
                    backgroundColor: status.color_code,
                    borderRadius: 2,
                    padding: 2,
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {status.stage_name} {filteredOpportunities(status.stage_name).length}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "#ffffff",
                    borderRadius: 2,
                    padding: 2,
                    boxShadow: theme.shadows[2],
                  }}
                >
                  {filteredOpportunities(status.stage_name).map((opportunity) => (
                    <Card
                      key={opportunity.id}
                      sx={{
                        width: 280,
                        mb: 3,
                        px: 3,
                        py: 2.5,
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.divider}`,
                        boxShadow: theme.shadows[2],
                        backgroundColor: "#ffffff",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          boxShadow: theme.shadows[5],
                          transform: "scale(1.015)",
                        },
                      }}
                    >
                      <CardContent>
                        <Typography variant="body1" fontWeight={500} color="text.secondary" mt={1}>
                          📍 Lead ID: {opportunity.prospect_id}
                        </Typography>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="h6" fontWeight="bold" color="primary">
                            #{opportunity.id}: {opportunity.prospect?.prospect_name}
                          </Typography>
                        </Box>

                        
                        <Typography variant="body1" fontWeight={500} color="text.secondary" mt={1}>
                         {opportunity.details}
                        </Typography>

                        <Box mt={2}>
                          <Typography variant="body2">
                            <strong>Closing Date:</strong> {dayjs(opportunity.closing_date).format("MMM D, YYYY")}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Expected Amount:</strong> {opportunity.expected_amount}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Priority:</strong> {opportunity.priority_id}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Status:</strong> {opportunity.status}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Note:</strong> {opportunity.note}
                          </Typography>
                        </Box>
                      </CardContent>

                      <Box px={2} pb={2}>
                        <Button
                          variant="contained"
                          fullWidth
                          size="small"
                          onClick={() => navigate(`/opportunity-tabs/${opportunity.id}`)}
                        >
                          View Details
                        </Button>
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default OpportunityByStage;
